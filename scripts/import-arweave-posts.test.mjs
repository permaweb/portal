import assert from 'node:assert/strict';
import test from 'node:test';

import {
	buildPortalPost,
	extractMarkdownBody,
	manifestTransactionId,
	markdownToPortalBlocks,
	parseArgs,
	resolvePostCategories,
	sourcePostStatus,
} from './import-arweave-posts.mjs';

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
