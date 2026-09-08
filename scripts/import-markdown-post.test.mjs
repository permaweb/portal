import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import ts from 'typescript';

function moduleUrl(source) {
	const compiled = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
	}).outputText;
	return `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
}

const typesUrl = moduleUrl(await readFile(new URL('../src/helpers/types.ts', import.meta.url), 'utf8'));
const markdownSource = await readFile(new URL('../src/helpers/markdown.ts', import.meta.url), 'utf8');
const { extractMarkdownDocument, parseMarkdownToBlocks } = await import(
	moduleUrl(markdownSource.replace("'./types'", JSON.stringify(typesUrl)))
);
const { AlignmentEnum, ArticleBlockEnum } = await import(typesUrl);

const firstImage = 'https://arweave.net/qw53YolzHuDwEk3DMJkw5HSpT7bwEj0OQKgF6SSiEX0';
const secondImage = 'https://arweave.net/_BQM5yeeYvGGRgcbyYy912cSuP1O3_NCPrFTpiBEDmc';

function importBlocks(markdown) {
	return parseMarkdownToBlocks(extractMarkdownDocument(markdown).body);
}

test('imports both empty-alt Arweave images from a document with CRLF and frontmatter', () => {
	const markdown = [
		'---',
		'title: "Self-sovereign GraphQL in every browser"',
		'banner: "ww5oMK0s9J_pWJG8kWjUsNTrJsDAYNc9hlc7RUgDq10"',
		'---',
		'',
		'Introduction.',
		'',
		`![](${firstImage})`,
		'([_txid_](https://viewblock.io/arweave/tx/oWRzBr3KHhULAL-s5ULeXac1mb_WQOX5uFBRea16iRI))',
		'',
		'## AO compute; Arweave the shared hard drive',
		'',
		`![](${secondImage})`,
		'[**Try decentralized GraphQL from your browser**](https://391300172mb.arweave.net/)',
	].join('\r\n');
	const document = extractMarkdownDocument(markdown);
	const blocks = parseMarkdownToBlocks(document.body);

	assert.equal(document.frontmatter.title, 'Self-sovereign GraphQL in every browser');
	assert.deepEqual(
		blocks.map((block) => block.type),
		[
			ArticleBlockEnum.Paragraph,
			ArticleBlockEnum.Image,
			ArticleBlockEnum.Paragraph,
			ArticleBlockEnum.Header2,
			ArticleBlockEnum.Image,
			ArticleBlockEnum.Paragraph,
		]
	);
	const images = blocks.filter((block) => block.type === ArticleBlockEnum.Image);
	assert.deepEqual(
		images.map((block) => block.data.url),
		[firstImage, secondImage]
	);
	for (const image of images) {
		assert.equal(image.data.caption, '');
		assert.equal(image.data.alt, '');
		assert.equal(image.data.alignment, AlignmentEnum.Column);
		assert.equal(image.data.mediaAlign, 'center');
		assert.match(image.content, /class="portal-media-wrapper portal-media-column"/);
		assert.ok(image.content.includes(`<img src="${image.data.url}"`));
	}
	assert.equal(
		blocks[2].content,
		'(<a href="https://viewblock.io/arweave/tx/oWRzBr3KHhULAL-s5ULeXac1mb_WQOX5uFBRea16iRI"><em>txid</em></a>)'
	);
	assert.equal(
		blocks[5].content,
		'<a href="https://391300172mb.arweave.net/"><strong>Try decentralized GraphQL from your browser</strong></a>'
	);
	assert.equal(new Set(blocks.map((block) => block.id)).size, blocks.length);
});

test('imports nonempty alt text and separates optional image titles from the URL', () => {
	for (const suffix of ['', ' "Image title"', " 'Image title'", ' (Image title)']) {
		const [block] = importBlocks(`![GraphQL architecture](${firstImage}${suffix})`);
		assert.equal(block.type, ArticleBlockEnum.Image);
		assert.equal(block.data.url, firstImage);
		assert.equal(block.data.alt, 'GraphQL architecture');
		assert.match(block.content, /alt="GraphQL architecture"/);
	}
});

test('keeps URL parentheses and unwraps angle-bracket destinations', () => {
	const url = 'https://example.com/architecture_(browser).png';
	for (const destination of [url, `<${url}>`, `<${url}> "Browser diagram"`]) {
		const [block] = importBlocks(`![](${destination})`);
		assert.equal(block.type, ArticleBlockEnum.Image);
		assert.equal(block.data.url, url);
		assert.ok(block.content.includes(`src="${url}"`));
	}
});

test('escapes imported image HTML attributes while retaining original image data', () => {
	const alt = 'A "quote" & <tag>';
	const url = 'https://example.com/diagram.png?width=640&height=480';
	const [block] = importBlocks(`![${alt}](${url})`);
	assert.equal(block.type, ArticleBlockEnum.Image);
	assert.equal(block.data.alt, alt);
	assert.equal(block.data.url, url);
	assert.match(block.content, /alt="A &quot;quote&quot; &amp; &lt;tag&gt;"/);
	assert.match(block.content, /src="https:\/\/example\.com\/diagram\.png\?width=640&amp;height=480"/);
});

test('preserves image syntax inside fenced and inline code', () => {
	const image = `![](${firstImage})`;
	const blocks = importBlocks(['```markdown', image, '```', '', `Use \`${image}\` to embed an image.`].join('\n'));
	assert.deepEqual(
		blocks.map((block) => ({ type: block.type, content: block.content })),
		[
			{ type: ArticleBlockEnum.Code, content: image },
			{ type: ArticleBlockEnum.Paragraph, content: `Use <code>${image}</code> to embed an image.` },
		]
	);
});

test('leaves malformed and escaped image syntax as paragraphs', () => {
	const lines = [`![](${firstImage}`, `\\![](${firstImage})`, `![]\\(${firstImage})`, '![]( )'];
	const blocks = importBlocks(lines.join('\n'));
	assert.deepEqual(
		blocks.map((block) => ({ type: block.type, content: block.content })),
		lines.map((content) => ({ type: ArticleBlockEnum.Paragraph, content }))
	);
});

test('retains existing headings, lists, quotes, and inline formatting during import', () => {
	const blocks = importBlocks(
		[
			'# A **heading**',
			'',
			'- First *item*',
			'- Second item',
			'',
			'1. Ordered item',
			'2. Another item',
			'',
			'> A quote',
			'> with a [link](https://example.com)',
			'',
			'A `code` span and ~~old text~~.',
		].join('\n')
	);
	assert.deepEqual(
		blocks.map((block) => ({ type: block.type, content: block.content })),
		[
			{ type: ArticleBlockEnum.Header1, content: 'A <strong>heading</strong>' },
			{ type: ArticleBlockEnum.UnorderedList, content: '<li>First <em>item</em></li><li>Second item</li>' },
			{ type: ArticleBlockEnum.OrderedList, content: '<li>Ordered item</li><li>Another item</li>' },
			{ type: ArticleBlockEnum.Quote, content: 'A quote\nwith a <a href="https://example.com">link</a>' },
			{ type: ArticleBlockEnum.Paragraph, content: 'A <code>code</code> span and <del>old text</del>.' },
		]
	);
});
