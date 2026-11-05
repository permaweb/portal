import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { DataItem } from '@dha-team/arbundles';
import Arweave from 'arweave';

import {
	buildPortalPost,
	canAdministerPortal,
	extractMarkdownBody,
	manifestTransactionId,
	markdownToPortalBlocks,
	parseArgs,
	postPayload,
	resolvePostCategories,
	run,
	sourcePostStatus,
	uploadDataItem,
} from './import-arweave-posts.mjs';

test('uses the native ANS-104 route by default and retains the legacy route for custom upload nodes', async (t) => {
	const wallet = generateKeyPairSync('rsa', { modulusLength: 4096 }).privateKey.export({ format: 'jwk' });
	const calls = [];
	t.mock.method(globalThis, 'fetch', async (url, request) => {
		const item = new DataItem(Buffer.from(request.body));
		assert(await item.isValid());
		assert.equal(item.rawData.toString(), 'post');
		calls.push({ url, headers: request.headers, id: item.id });
		return calls.length === 1 ? new Response('{}', { headers: { id: item.id } }) : Response.json({ id: item.id });
	});
	const upload = (uploadNode) => uploadDataItem({ wallet, data: 'post', tags: [], uploadNode });
	assert.equal(await upload('https://up.arweave.net'), calls[0].id);
	assert.equal(await upload('https://legacy.example'), calls[1].id);
	assert.equal(calls[0].url, 'https://up.arweave.net/~bundler@1.0/tx');
	assert.equal(calls[0].headers['Content-Type'], 'application/ans104');
	assert.equal(calls[0].headers['bundler-subject'], 'body');
	assert.equal(calls[1].url, 'https://legacy.example/tx/arweave');
	assert.equal(calls[1].headers['Content-Type'], 'application/octet-stream');
});

test('allows Portal owners and admins to run an import', () => {
	const owner = 'o'.repeat(43);
	const admin = 'a'.repeat(43);
	const contributor = 'c'.repeat(43);
	const portal = {
		owner,
		users: [
			{ address: admin, roles: ['Admin'] },
			{ address: contributor, roles: ['Contributor'] },
		],
	};

	assert.equal(canAdministerPortal(portal, owner), true);
	assert.equal(canAdministerPortal(portal, admin), true);
	assert.equal(canAdministerPortal(portal, contributor), false);
});

test('parses the importer arguments and defaults every post to the AO tag', () => {
	const options = parseArgs([
		'--manifest',
		'YjaS3Q-5kJTNeygkXsy0d4Xnxkwk2bFcTQRNUJXJpRo',
		'--portal',
		'xq688x6oyBtrZTDCUPIlU9U2U-4j8u5pWpCfbAK4hrs',
		'--wallet',
		'/tmp/wallet.json',
	]);
	assert.deepEqual(options.tags, ['AO']);
	assert.equal(options.publish, false);
});

test('explicit published slugs override incorrect manifest draft flags', () => {
	const publishedSlugs = ['bazar-is-live-on-mainnet-1-0'];
	assert.equal(sourcePostStatus({ slug: 'bazar-is-live-on-mainnet-1-0', draft: false }, publishedSlugs), 'published');
	assert.equal(sourcePostStatus({ slug: 'bundlers', draft: false }, publishedSlugs), 'draft');
});

test('parses a featured slug independently from publication status', () => {
	const options = parseArgs([
		'--manifest',
		'YjaS3Q-5kJTNeygkXsy0d4Xnxkwk2bFcTQRNUJXJpRo',
		'--portal',
		'xq688x6oyBtrZTDCUPIlU9U2U-4j8u5pWpCfbAK4hrs',
		'--wallet',
		'/tmp/wallet.json',
		'--featured-slug',
		'Bazar-is-live-on-Mainnet-1-0',
	]);
	assert.equal(options.featuredSlug, 'bazar-is-live-on-mainnet-1-0');
	assert.deepEqual(options.publishedSlugs, []);
});

test('parses an existing post replacement target', () => {
	const options = parseArgs([
		'--manifest',
		'YjaS3Q-5kJTNeygkXsy0d4Xnxkwk2bFcTQRNUJXJpRo',
		'--portal',
		'xq688x6oyBtrZTDCUPIlU9U2U-4j8u5pWpCfbAK4hrs',
		'--wallet',
		'/tmp/wallet.json',
		'--replace-post',
		'old-post',
	]);
	assert.equal(options.replacePost, 'old-post');
});

test('builds a post revision payload when replacing an existing post', () => {
	const payload = postPayload('p'.repeat(43), { title: 'Canonical' }, '2026-08-24T00:00:00.000Z', {
		id: 'i'.repeat(43),
		postTxId: 't'.repeat(43),
	});
	assert.equal(payload.postId, 'i'.repeat(43));
	assert.equal(payload.previousTxId, 't'.repeat(43));
	assert.equal(payload.createdAt, undefined);
	assert.equal(payload.post.title, 'Canonical');
});

test('extracts transaction IDs from raw gateway URLs', () => {
	assert.equal(
		manifestTransactionId('https://arweave.net/raw/YjaS3Q-5kJTNeygkXsy0d4Xnxkwk2bFcTQRNUJXJpRo'),
		'YjaS3Q-5kJTNeygkXsy0d4Xnxkwk2bFcTQRNUJXJpRo'
	);
});

test('converts Markdown into Portal article blocks', () => {
	const markdown = `---
title: Example
---

## Heading

Paragraph with **bold**, [a link](https://example.com), and \`code\`.

![Diagram](https://arweave.net/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)
_Architecture diagram_

> Quoted text

- One
- Two

1. First
2. Second

\`\`\`js
const answer = 42;
\`\`\`

---
`;
	assert.match(extractMarkdownBody(markdown), /^\n## Heading/);
	const blocks = markdownToPortalBlocks(markdown, 'example');
	assert.deepEqual(
		blocks.map((block) => block.type),
		['header-2', 'paragraph', 'image', 'quote', 'unordered-list', 'ordered-list', 'code', 'divider-solid']
	);
	assert.equal(blocks[2].data.caption, 'Architecture diagram');
	assert.match(blocks[1].content, /<strong>bold<\/strong>/);
});

test('preserves literal formatting and escapes HTML inside inline code', () => {
	const [block] = markdownToPortalBlocks('Use `ACCESS_PUBLIC_KEY`, `**literal**`, `<address>`, and `[text](/path)`.');
	assert.equal(
		block.content,
		'Use <code>ACCESS_PUBLIC_KEY</code>, <code>**literal**</code>, <code>&lt;address&gt;</code>, and <code>[text](/path)</code>.'
	);
});

test('maps manifest category labels to the existing Portal category objects', () => {
	const portalCategories = [
		{ id: '1', name: 'Dev', metadata: {} },
		{ id: '2', name: 'Announcements', metadata: {} },
	];
	assert.deepEqual(resolvePostCategories(['dev'], portalCategories), [portalCategories[0]]);
	assert.throws(() => resolvePostCategories(['Missing'], portalCategories), /Portal category not found/);
});

test('builds published Portal metadata with the shared tag and source identity', () => {
	const sourcePost = {
		id: 'source-id',
		postTxId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
		title: 'Example',
		description: 'Description',
		slug: 'example',
		date: '2026-08-13T00:00:00.000Z',
		draft: false,
		bannerTxId: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
		authorAddress: 'ccccccccccccccccccccccccccccccccccccccccccc',
		contentHash: 'hash',
	};
	const category = { id: '1', name: 'Dev', metadata: {} };
	const post = buildPortalPost({
		sourcePost,
		markdown: 'A post body.',
		categories: [category],
		sharedTags: ['AO'],
		walletAddress: 'ddddddddddddddddddddddddddddddddddddddddddd',
		manifestTxId: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
	});
	assert.equal(post.status, 'published');
	assert.deepEqual(post.categories, [category]);
	assert.deepEqual(post.topics, ['AO']);
	assert.deepEqual(post.tags, ['AO']);
	assert.equal(post.source.postId, 'source-id');
});

test('replaces and features a manifest post that keeps its existing slug', async (t) => {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'portal-manifest-test-'));
	t.after(() => fs.rm(dir, { force: true, recursive: true }));
	const wallet = generateKeyPairSync('rsa', { modulusLength: 4096 }).privateKey.export({ format: 'jwk' });
	const owner = await Arweave.init({}).wallets.jwkToAddress(wallet);
	const walletPath = path.join(dir, 'wallet.json');
	await fs.writeFile(walletPath, JSON.stringify(wallet), { mode: 0o600 });

	const portalId = 'P'.repeat(43);
	const rootId = 'R'.repeat(43);
	const postId = 'S'.repeat(43);
	const manifestId = 'M'.repeat(43);
	const markdownId = 'W'.repeat(43);
	const manifest = {
		posts: [{ id: 'source-post', postTxId: markdownId, title: 'New title', slug: 'keep-slug', date: '2026-11-05' }],
	};
	const root = {
		type: 'portal-manifest',
		mode: 'base',
		portalId,
		owner,
		topics: ['AO'],
		posts: [{ id: postId, postTxId: postId, title: 'Old title', slug: 'keep-slug' }],
	};
	const writes = [];
	t.mock.method(console, 'log', () => {});
	t.mock.method(globalThis, 'fetch', async (url, request) => {
		const route = new URL(url).pathname;
		if (route === '/graphql') {
			return Response.json({
				data: {
					transactions: {
						edges: [
							{ node: { id: rootId, owner: { address: owner }, tags: [{ name: 'Type', value: 'portal-manifest' }] } },
						],
					},
				},
			});
		}
		if (route === `/${rootId}`) return Response.json(root);
		if (route === `/raw/${manifestId}`) return Response.json(manifest);
		if (route === `/raw/${markdownId}`) return new Response('## Revised post');
		if (route === '/~bundler@1.0/tx') {
			const item = new DataItem(Buffer.from(request.body));
			writes.push({ id: item.id, payload: JSON.parse(item.rawData.toString()) });
			return Response.json({ body: { id: item.id } });
		}
		return new Response(null, { status: 404 });
	});
	await run([
		'--manifest',
		manifestId,
		'--portal',
		portalId,
		'--wallet',
		walletPath,
		'--gateway',
		'https://manifest-test.invalid',
		'--receipt',
		path.join(dir, 'receipt.json'),
		'--replace-post',
		'keep-slug',
		'--featured-slug',
		'keep-slug',
		'--yes',
	]);
	assert.equal(writes.length, 2);
	const [revision, release] = writes;
	assert.equal(revision.payload.postId, postId);
	assert.equal(revision.payload.post.slug, 'keep-slug');
	assert.deepEqual(release.payload.changes.posts, { upsert: { [postId]: revision.id }, order: [postId] });
	assert.deepEqual(release.payload.changes.featuredPosts, [postId]);
});
