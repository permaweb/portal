import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { DataItem } from '@dha-team/arbundles';
import Arweave from 'arweave';

import { prepareLocalPost, run } from './import-arweave-posts.mjs';
import { resolvePortalState } from './resolve-base-portal.mjs';

const portalId = 'P'.repeat(43);
const rootId = 'R'.repeat(43);
const postId = 'S'.repeat(43);
const secondPostId = 'T'.repeat(43);
const now = '2026-11-05T12:00:00.000Z';
const video = '<video src="https://media.example/movie.webm" controls autoplay muted loop playsinline></video>';
const prior = {
	id: postId,
	postTxId: postId,
	slug: 'release',
	url: 'release',
	title: 'Release 0.11',
	description: 'Existing summary',
	date: now,
	status: 'published',
	content: [
		{ id: 'body', type: 'paragraph', content: 'Keep the article body.' },
		{ id: 'video', type: 'video', content: 'Previous player' },
	],
	frontmatter: { title: 'Release 0.11', custom: 'keep' },
};

test('plans new Markdown and replaces one existing block without rewriting the article', () => {
	const portal = { portalId, posts: [prior] };
	const initial = prepareLocalPost({
		portal,
		now,
		metadata: { title: 'New post', slug: 'new' },
		markdown: `## Heading\n\n${video}\n\n[Link](https://example.com)`,
	});
	assert.equal(initial.status, 'draft');
	assert.equal(initial.content[1].type, 'html');
	assert.equal(initial.content[1].content, video);
	assert.match(initial.content[2].content, /href="https:\/\/example.com"/);

	const metadata = { title: 'Release v0.11', replaceBlocks: [{ id: 'video', type: 'html', content: video }] };
	const update = prepareLocalPost({ portal, now, metadata, replacement: prior });
	assert.equal(update.slug, 'release');
	assert.equal(update.status, 'published');
	assert.equal(update.description, 'Existing summary');
	assert.deepEqual(update.frontmatter, { title: 'Release v0.11', custom: 'keep' });
	assert.deepEqual(update.content[0], prior.content[0]);
	assert.equal(update.content[1].content, video);
	assert.throws(
		() =>
			prepareLocalPost({
				portal,
				now,
				metadata: { replaceBlocks: [{ id: 'missing', type: 'html', content: video }] },
				replacement: prior,
			}),
		/Block missing or ambiguous/
	);
});

test('reuses the signed revision and release after a partial upload, then returns the accepted release', async (t) => {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'portal-post-test-'));
	t.after(() => fs.rm(dir, { force: true, recursive: true }));
	const wallet = generateKeyPairSync('rsa', { modulusLength: 4096 }).privateKey.export({ format: 'jwk' });
	const owner = await Arweave.init({}).wallets.jwkToAddress(wallet);
	const walletPath = path.join(dir, 'wallet.json');
	const metadataPath = path.join(dir, 'post.json');
	const receiptPath = path.join(dir, 'receipt.json');
	const markdownPath = path.join(dir, 'article.md');
	const newMetadataPath = path.join(dir, 'new-post.json');
	await Promise.all([
		fs.writeFile(walletPath, JSON.stringify(wallet), { mode: 0o600 }),
		fs.writeFile(
			metadataPath,
			JSON.stringify({ title: 'Release v0.11', replaceBlocks: [{ id: 'video', type: 'html', content: video }] })
		),
		fs.writeFile(markdownPath, '## A new article'),
		fs.writeFile(newMetadataPath, JSON.stringify({ title: 'New post', slug: 'new-post' })),
	]);

	const gateway = 'https://portal-post-test.invalid';
	const bodies = new Map([
		[
			rootId,
			{
				type: 'portal-manifest',
				mode: 'base',
				portalId,
				owner,
				posts: [prior, { ...prior, id: secondPostId, postTxId: secondPostId, slug: 'other', url: 'other' }],
				featuredPosts: [secondPostId],
			},
		],
	]);
	const history = [{ id: rootId, owner: { address: owner }, tags: [{ name: 'Type', value: 'portal-manifest' }] }];
	const writes = [];
	let releaseAvailable = false;
	t.mock.method(globalThis, 'fetch', async (url, request) => {
		const route = new URL(url).pathname;
		if (route === '/graphql') {
			return Response.json({ data: { transactions: { edges: history.map((node) => ({ node })) } } });
		}
		if (route === '/~bundler@1.0/tx') {
			assert.equal(request.method, 'POST');
			assert.equal(request.headers['Content-Type'], 'application/ans104');
			assert.equal(request.headers['bundler-subject'], 'body');
			const item = new DataItem(Buffer.from(request.body));
			assert(await item.isValid());
			const payload = JSON.parse(item.rawData.toString());
			writes.push({ id: item.id, payload });
			if (payload.type === 'portal-release' && !releaseAvailable) return new Response(null, { status: 503 });
			bodies.set(item.id, payload);
			if (payload.type === 'portal-release') history.push({ id: item.id, tags: item.tags, owner: { address: owner } });
			return new Response('{}', { headers: { id: item.id } });
		}
		const body = bodies.get(route.slice(1));
		return body ? Response.json(body) : new Response(null, { status: 404 });
	});
	t.mock.method(console, 'log', () => {});
	t.mock.method(console, 'error', () => {});
	const args = [
		'--portal',
		portalId,
		'--replace-post',
		'release',
		'--expect-post-tx',
		postId,
		'--metadata',
		metadataPath,
		'--wallet',
		walletPath,
		'--receipt',
		receiptPath,
		'--gateway',
		gateway,
		'--feature',
	];
	await run(['--portal', portalId, '--gateway', gateway, '--markdown', markdownPath, '--metadata', newMetadataPath]);
	await run(args);
	const [dryRunNew, dryRunUpdate] = console.log.mock.calls.map(({ arguments: [arg] }) => JSON.parse(arg));
	assert.equal(dryRunNew.post.post.status, 'draft');
	assert.equal(dryRunUpdate.post.post.content[1].content, video);
	assert.equal(writes.length, 0);
	const stale = args.map((arg, index) => (index === args.indexOf('--expect-post-tx') + 1 ? rootId : arg));
	await assert.rejects(run(stale), /Post revision changed/);
	await assert.rejects(run([...args, '--yes']), /Arweave upload failed after 3 attempts: 503/);
	assert.equal(history.length, 1);
	releaseAvailable = true;
	await run([...args, '--yes']);
	const [revision, release] = writes;
	assert.deepEqual(
		writes.map(({ id }) => id),
		[revision.id, release.id, release.id, release.id, release.id]
	);
	assert.equal(revision.payload.type, 'portal-post');
	assert.deepEqual(release.payload.changes, {
		posts: { upsert: { [postId]: revision.id } },
		featuredPosts: [postId, secondPostId],
	});
	assert.equal(release.payload.previousTxId, rootId);
	const live = await resolvePortalState(portalId, { gateway });
	assert.equal(live.headTxId, release.id);
	assert.equal(live.posts[0].title, 'Release v0.11');
	assert.deepEqual(live.featuredPosts, [postId, secondPostId]);
	assert.equal(live.posts[0].content[1].content, video);
	await run([...args, '--yes']);
	assert.equal(writes.length, 5);
});
