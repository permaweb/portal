import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

function compile(path) {
	return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
	}).outputText;
}

const assetsSource = compile('../src/helpers/gatewayAssets.ts');
const logoSource = compile('../src/apps/engine-lite/logo.ts');
// Existing upload for portal UG3Gy7tUF9sTzsxGtF3t6C9w0OpSCmcKtawpYuqLxrU:
// https://arweave.net/HnnJNYuccc7XKZPxyIDjYmO_WjAKw6mXFS4QIwnNsYY
const lunarLogo = readFileSync(new URL('./fixtures/lunar-logo.svg', import.meta.url), 'utf8');
const svg = (body, attributes = '') => `<svg xmlns="http://www.w3.org/2000/svg" ${attributes}>${body}</svg>`;

function runtime(fetch) {
	const dom = new JSDOM('<!doctype html><a class="lite-site-logo" aria-label="Portal home"></a>', {
		url: 'https://portal.arweave.net',
	});
	const assets = {};
	const exports = {};
	const globals = { window: dom.window, URL, AbortController, fetch };
	vm.runInNewContext(assetsSource, { ...globals, exports: assets });
	vm.runInNewContext(logoSource, {
		...globals,
		exports,
		DOMParser: dom.window.DOMParser,
		require: (name) => (name === 'dompurify' ? createDOMPurify(dom.window) : assets),
	});
	function image(source = 'https://arweave.net/upload-without-extension') {
		const element = dom.window.document.createElement('img');
		element.src = source;
		dom.window.document.querySelector('a').replaceChildren(element);
		return element;
	}
	return { ...exports, image, document: dom.window.document, window: dom.window };
}

test('the existing Lunar logo becomes visible inline artwork that inherits the theme color', async () => {
	const { inlineSvgLogo, image, document, window } = runtime(
		async () => new Response(lunarLogo, { headers: { 'Content-Type': 'image/svg+xml' } })
	);
	await inlineSvgLogo(image());
	assert.equal(document.querySelector('img'), null);
	const logo = document.querySelector('svg');
	assert.equal(logo.getAttribute('viewBox'), '0 0 73 77');
	assert.equal(logo.getAttribute('aria-hidden'), 'true');
	assert.equal(logo.querySelectorAll('path').length, 4);
	for (const path of logo.querySelectorAll('path')) {
		assert.equal(path.style.fill, 'currentColor');
		assert.equal(path.style.stroke, 'none');
	}
	for (const color of ['rgb(20, 20, 20)', 'rgb(240, 240, 240)']) {
		document.querySelector('a').style.color = color;
		assert.equal(window.getComputedStyle(logo.querySelector('path')).color, color);
	}
});

test('preserves outline geometry and transparent areas while adapting fills and strokes', () => {
	const { prepareSvgLogo } = runtime();
	const logo = prepareSvgLogo(
		svg(
			`
		<g stroke="#000" stroke-width="2"><path d="M0 0L10 10"/><circle r="4" style="stroke: #123; fill: none"/></g>
		<rect width="10" height="10" fill="#222"/>
		<path fill="none" d="M0 0L10 0"/>
		<path fill="transparent" d="M0 0L10 0"/>
	`,
			'fill="none"'
		)
	);
	assert.equal(logo.querySelector('g path').style.fill, 'none');
	assert.equal(logo.querySelector('g path').style.stroke, 'currentColor');
	assert.equal(logo.querySelector('circle').style.fill, 'none');
	assert.equal(logo.querySelector('circle').style.stroke, 'currentColor');
	assert.equal(logo.querySelector('rect').style.fill, 'currentColor');
	assert.equal(logo.querySelector('path[fill="none"]').style.fill, 'none');
	assert.equal(logo.querySelector('path[fill="transparent"]').style.fill, 'transparent');
	assert.equal(logo.querySelector('g').getAttribute('stroke-width'), '2');
});

test('keeps gradients, clipping, masks, and local references intact', () => {
	const { prepareSvgLogo } = runtime();
	const logo = prepareSvgLogo(
		svg(`
		<defs><linearGradient id="gradient"><stop stop-color="red"/></linearGradient>
		<mask id="mask"><rect width="10" height="10" fill="white"/></mask>
		<clipPath id="clip"><circle r="5"/></clipPath><path id="shape" d="M0 0L10 10"/></defs>
		<path fill="url(#gradient)" mask="url(#mask)" clip-path="url(#clip)" d="M0 0L10 10"/>
		<use href="#shape"/>
	`)
	);
	assert.equal(logo.querySelector('path[mask]').style.fill, 'url(#gradient)');
	assert.equal(logo.querySelector('mask rect').getAttribute('fill'), 'white');
	assert.equal(logo.querySelector('mask rect').style.fill, '');
	assert.equal(logo.querySelector('stop').getAttribute('stop-color'), 'red');
	assert.equal(logo.querySelector('use').getAttribute('href'), '#shape');
});

test('does not turn intentionally transparent logos into visible shapes', () => {
	const { prepareSvgLogo } = runtime();
	const logo = prepareSvgLogo(svg('<path d="M0 0L10 10"/>', 'fill="transparent"'));
	assert.equal(logo.querySelector('path').style.fill, 'transparent');
});

test('removes active content, page CSS, and external references before inlining uploads', () => {
	const { prepareSvgLogo } = runtime();
	const logo = prepareSvgLogo(
		svg(
			`
		<script>alert(1)</script><style>body { display: none }</style>
		<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">HTML</div></foreignObject>
		<image href="https://other.test/image.png"/>
		<use href="https://other.test/logo.svg#path"/>
		<path onload="alert(1)" style="position:fixed; background:url(https://other.test/x); fill:#000" filter="url(https://other.test/filter)" d="M0 0L10 10"/>
	`,
			'onload="alert(1)"'
		)
	);
	assert.equal(logo.querySelector('script, style, foreignObject, image'), null);
	assert.equal(logo.querySelector('[onload]'), null);
	assert.equal(logo.hasAttribute('onload'), false);
	assert.equal(logo.querySelector('use').hasAttribute('href'), false);
	assert.equal(logo.querySelector('path').hasAttribute('filter'), false);
	assert.equal(logo.querySelector('path').style.position, '');
	assert.equal(logo.querySelector('path').style.background, '');
});

test('detects SVG content with a generic MIME type and reuses the fetched bytes on remount', async () => {
	let requests = 0;
	const { inlineSvgLogo, image, document } = runtime(async () => {
		requests += 1;
		return new Response(lunarLogo, { headers: { 'Content-Type': 'application/octet-stream' } });
	});
	const first = image();
	await Promise.all([inlineSvgLogo(first), inlineSvgLogo(first)]);
	assert.ok(document.querySelector('svg'));
	await inlineSvgLogo(image());
	assert.ok(document.querySelector('svg'));
	assert.equal(requests, 1);
});

test('keeps raster, malformed, and unavailable logos as images', async () => {
	for (const response of [
		new Response('png bytes', { headers: { 'Content-Type': 'image/png' } }),
		new Response('<svg>malformed', { headers: { 'Content-Type': 'image/svg+xml' } }),
		new Response('<html>not svg</html>', { headers: { 'Content-Type': 'text/html' } }),
		new Response('missing', { status: 404 }),
	]) {
		const { inlineSvgLogo, image } = runtime(async () => response);
		const original = image();
		await inlineSvgLogo(original);
		assert.equal(original.isConnected, true);
	}
});

test('ignores an obsolete image when a route or source changes during the request', async () => {
	let resolve;
	const pending = new Promise((complete) => (resolve = complete));
	const { inlineSvgLogo, image, document } = runtime(() => pending);
	const original = image();
	const loading = inlineSvgLogo(original);
	const current = image('https://arweave.net/new-logo');
	resolve(new Response(lunarLogo, { headers: { 'Content-Type': 'image/svg+xml' } }));
	await loading;
	assert.equal(document.querySelector('img'), current);
	assert.equal(document.querySelector('svg'), null);
});
