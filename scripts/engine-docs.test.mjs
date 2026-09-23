import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

import { JSDOM } from 'jsdom';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = (name) =>
	ts.transpileModule(readFileSync(new URL(`../src/apps/engine-lite/${name}`, import.meta.url), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
	}).outputText;
const docsSource = source('docs.ts');
const renderSource = source('render.ts');

function runtime({ mobile = false } = {}) {
	const dom = new JSDOM('<!doctype html><div id="portal"></div>', {
		url: 'https://example.com',
		pretendToBeVisual: true,
	});
	const { window } = dom;
	const { document } = window;
	const media = new window.EventTarget();
	media.matches = mobile;
	window.matchMedia = (query) => (query.includes('800px') ? media : { matches: false });
	const frames = [];
	window.requestAnimationFrame = (callback) => frames.push(callback);
	window.cancelAnimationFrame = () => {};
	const scrolls = [];
	window.scrollTo = (options) => scrolls.push(options);
	const globals = { window, document, navigator: window.navigator, AbortController: window.AbortController };
	const docs = {};
	const render = {};
	vm.runInNewContext(docsSource, { ...globals, exports: docs });
	vm.runInNewContext(renderSource, {
		...globals,
		exports: render,
		require(name) {
			if (name === './constants') return { ENGINE_LITE_FALLBACK_LOGO: '<svg></svg>' };
			if (name.endsWith('?raw'))
				return readFileSync(new URL(`../src/apps/engine-lite/${name.replace('?raw', '')}`, import.meta.url), 'utf8');
			return require(name);
		},
	});
	const post = (id, category, content) => ({ id, slug: id, title: id, category, excerpt: `About ${id}`, content });
	const posts = [
		post(
			'Introduction',
			'Overview',
			'# Introduction\n\nWelcome.\n\n## Getting started\n\n### Install\n\n#### Configure\n\n## Getting started'
		),
		post('Arweave', 'Overview', [
			{ type: 'header-1', content: 'Arweave' },
			{ type: 'paragraph', content: 'Permanent storage' },
		]),
		post('GraphQL', 'Tools', '## Queries\n\nAPI examples'),
	];
	const portal = { name: 'Lunar Documentation', layout: 'docs', logo: null, posts };
	const root = document.querySelector('#portal');
	const state = { collapsed: false, mobileOpen: false, query: '', collapsedCategories: new Set() };
	const href = (post) => `#/post/${post.slug}`;
	const mount = (active = posts[0]) => {
		root.innerHTML = render.renderShell(
			render.renderDocs(portal, active, href),
			portal,
			'#/',
			null,
			'system',
			active,
			href
		);
	};
	mount();
	return { ...docs, ...render, window, document, root, state, posts, portal, mount, media, scrolls, frames };
}

test('docs shell contains branding, search, sidebar themes, category header and one authored title', () => {
	const { root, posts, mount, renderShell, portal } = runtime();
	assert.equal(root.querySelector('.lite-docs-brand a').textContent.trim(), 'Lunar Documentation');
	assert.equal(root.querySelectorAll('.lite-docs-sidebar-footer [data-theme-mode]').length, 3);
	assert.equal(root.querySelector('.lite-docs-category').textContent, 'Overview');
	assert.equal(root.querySelectorAll('.lite-docs-copy h1').length, 1);
	assert.equal(root.querySelector('[aria-current="page"]').textContent, 'Introduction');
	assert.ok(root.querySelector('.lite-docs-toc h2 svg'));
	mount(posts[1]);
	assert.equal(root.querySelectorAll('.lite-docs-copy h1').length, 1);
	mount(posts[2]);
	assert.equal(root.querySelector('.lite-docs-copy h1').textContent, 'GraphQL');
	assert.equal(root.querySelector('.lite-docs-category').textContent, 'Tools');
	assert.match(renderShell('', { ...portal, layout: 'blog' }, '#/', null, 'system'), /data-wallet-connect/);
});

test('search reveals matches in collapsed categories and restores category state when cleared', () => {
	const { attachDocsSidebar, root, state, window } = runtime();
	const cleanup = attachDocsSidebar(root, state);
	const category = root.querySelector('[data-docs-category-toggle]');
	category.click();
	assert.equal(category.getAttribute('aria-expanded'), 'false');
	const input = root.querySelector('[data-docs-search]');
	const search = (value) => {
		input.value = value;
		input.dispatchEvent(new window.Event('input'));
	};
	search('arweave');
	assert.equal(category.getAttribute('aria-expanded'), 'true');
	assert.equal(root.querySelectorAll('[data-docs-group]:not([hidden]) li:not([hidden])').length, 1);
	assert.equal(root.querySelector('[data-docs-search-status]').textContent, '1 page found');
	search('missing document');
	assert.equal(root.querySelector('[data-docs-search-status]').textContent, 'No pages found.');
	search('');
	assert.equal(category.getAttribute('aria-expanded'), 'false');
	assert.equal(root.querySelectorAll('[data-docs-group]:not([hidden])').length, 2);
	cleanup();
});

test('collapsed sidebar and search survive navigation; keyboard shortcut restores accessible search', () => {
	const { attachDocsSidebar, root, state, window, document, mount, posts } = runtime();
	let cleanup = attachDocsSidebar(root, state);
	root.querySelector('[data-docs-sidebar-toggle]').click();
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
	cleanup();
	mount(posts[2]);
	cleanup = attachDocsSidebar(root, state);
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }));
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, false);
	assert.equal(document.activeElement, root.querySelector('[data-docs-search]'));
	cleanup();
	state.collapsed = true;
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
	assert.equal(state.collapsed, true, 'cleanup removes document listeners');
});

test('mobile drawer traps focus, closes with Escape, and restores scrolling when cleaned up', () => {
	const { attachDocsSidebar, root, state, window, document } = runtime({ mobile: true });
	const cleanup = attachDocsSidebar(root, state);
	const opener = root.querySelector('[data-docs-sidebar-open]');
	opener.click();
	assert.equal(state.mobileOpen, true);
	assert.equal(root.querySelector('[data-docs-main]').inert, true);
	assert.equal(document.body.style.overflow, 'hidden');
	root.querySelector('[data-theme-mode="system"]').focus();
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', cancelable: true }));
	assert.equal(document.activeElement, root.querySelector('.lite-docs-brand a'));
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
	assert.equal(state.mobileOpen, false);
	assert.equal(document.activeElement, opener);
	assert.equal(document.body.style.overflow, '');
	opener.click();
	cleanup();
	assert.equal(document.body.style.overflow, '');
});

test('table of contents handles mixed heading levels, duplicate titles, scroll state and anchor clicks', () => {
	const { attachDocsTableOfContents, root, window, frames, scrolls } = runtime();
	const headings = Array.from(root.querySelectorAll('.lite-docs-copy :is(h2,h3,h4)'));
	let positions = [300, 600, 900, 1200];
	headings.forEach((heading, index) => {
		heading.getBoundingClientRect = () => ({ top: positions[index] });
	});
	const cleanup = attachDocsTableOfContents(root);
	const links = Array.from(root.querySelectorAll('[data-docs-toc] a'));
	assert.equal(links.length, 4);
	assert.equal(headings[3].id, 'getting-started-2');
	assert.equal(links[1].style.getPropertyValue('--toc-depth'), '1');
	assert.equal(links[0].getAttribute('aria-current'), 'location');
	positions = [-600, -300, 100, 400];
	window.dispatchEvent(new window.Event('scroll'));
	frames.shift()();
	assert.equal(links[2].getAttribute('aria-current'), 'location');
	assert.equal(links[0].hasAttribute('aria-current'), false);
	links[3].click();
	assert.equal(scrolls[0].top, 304);
	cleanup();
});

test('shared initializers can run in the isolated editor preview without module dependencies', () => {
	const { attachDocsSidebar, attachDocsTableOfContents, root, window, document } = runtime();
	vm.runInNewContext(
		`
		(${attachDocsSidebar.toString()})(document, { collapsed: false, mobileOpen: false, query: '', collapsedCategories: new Set() });
		(${attachDocsTableOfContents.toString()})(document);
	`,
		{ document, window, navigator: window.navigator, AbortController: window.AbortController }
	);
	assert.equal(root.querySelector('[data-docs-toc]').hidden, false);
	root.querySelector('[data-docs-sidebar-toggle]').click();
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
});
