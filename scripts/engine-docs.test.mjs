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

function runtime({ mobile = false, reducedMotion = false } = {}) {
	const dom = new JSDOM('<!doctype html><div id="portal"></div>', {
		url: 'https://example.com',
		pretendToBeVisual: true,
	});
	const { window } = dom;
	const { document } = window;
	Object.defineProperty(window.HTMLElement.prototype, 'inert', {
		get() {
			return this.hasAttribute('inert');
		},
		set(value) {
			this.toggleAttribute('inert', value);
		},
	});
	const media = new window.EventTarget();
	media.matches = mobile;
	window.matchMedia = (query) =>
		query.includes('800px') ? media : { matches: query.includes('reduced-motion') && reducedMotion };
	const frames = [];
	let frameId = 0;
	window.requestAnimationFrame = (callback) => {
		callback.frameId = ++frameId;
		frames.push(callback);
		return frameId;
	};
	window.cancelAnimationFrame = (id) => {
		const index = frames.findIndex((callback) => callback.frameId === id);
		if (index >= 0) frames.splice(index, 1);
	};
	const resizeObservers = [];
	class ResizeObserver {
		observed = [];
		disconnected = false;
		constructor(callback) {
			this.callback = callback;
			resizeObservers.push(this);
		}
		observe(element) {
			this.observed.push(element);
		}
		disconnect() {
			this.disconnected = true;
		}
		resize() {
			if (!this.disconnected) this.callback();
		}
	}
	const scrolls = [];
	window.scrollTo = (options) => scrolls.push(options);
	const globals = {
		window,
		document,
		navigator: window.navigator,
		AbortController: window.AbortController,
		Element: window.Element,
		HTMLElement: window.HTMLElement,
		ResizeObserver,
	};
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
	return {
		...docs,
		...render,
		window,
		document,
		root,
		state,
		posts,
		portal,
		mount,
		media,
		scrolls,
		frames,
		resizeObservers,
	};
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

test('overlay searches every category without changing the sidebar navigation', () => {
	const { attachDocsSidebar, root, state, window, document } = runtime();
	const cleanup = attachDocsSidebar(root, state);
	const category = root.querySelector('[data-docs-category-toggle]');
	category.click();
	assert.equal(category.getAttribute('aria-expanded'), 'false');
	const trigger = root.querySelector('[data-docs-search-open]');
	assert.equal(trigger.querySelector('kbd').textContent, '/');
	trigger.focus();
	trigger.click();
	const dialog = root.querySelector('[data-docs-search-dialog]');
	const input = root.querySelector('[data-docs-search]');
	assert.equal(dialog.hidden, false);
	assert.equal(document.activeElement, input);
	assert.equal(root.querySelector('[data-docs-main]').inert, true);
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
	assert.equal(document.body.style.overflow, 'hidden');
	const search = (value) => {
		input.value = value;
		input.dispatchEvent(new window.Event('input'));
	};
	const matches = () => dialog.querySelectorAll('li:not([hidden]) a');
	search('  ARWEAVE overview ');
	assert.equal(category.getAttribute('aria-expanded'), 'false');
	assert.equal(root.querySelectorAll('[data-docs-group] li:not([hidden])').length, 3);
	assert.equal(matches().length, 1);
	assert.equal(matches()[0].getAttribute('href'), '#/post/Arweave');
	assert.equal(root.querySelector('[data-docs-search-status]').textContent, '1 page found');
	search('tools');
	assert.equal(matches()[0].getAttribute('href'), '#/post/GraphQL');
	search('about');
	assert.equal(matches().length, 3, 'summaries are searchable across all pages');
	search('missing document');
	assert.equal(root.querySelector('[data-docs-search-status]').textContent, 'No pages found.');
	assert.equal(matches().length, 0);
	search('');
	assert.equal(category.getAttribute('aria-expanded'), 'false');
	assert.equal(root.querySelector('[data-docs-search-status]').textContent, 'Search all documentation pages.');
	root.querySelector('[data-docs-search-close]').click();
	assert.equal(dialog.hidden, true);
	assert.equal(document.activeElement, trigger);
	assert.equal(document.body.style.overflow, '');
	assert.equal(root.querySelector('[data-docs-main]').inert, false);
	cleanup();
});

test('slash opens search after navigation with the sidebar collapsed and cleans up its listeners', () => {
	const { attachDocsSidebar, root, state, window, document, mount, posts } = runtime();
	let cleanup = attachDocsSidebar(root, state);
	root.querySelector('[data-docs-sidebar-toggle]').click();
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
	cleanup();
	mount(posts[2]);
	cleanup = attachDocsSidebar(root, state);
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '/', cancelable: true }));
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
	assert.equal(state.collapsed, true, 'global search does not expand the sidebar');
	assert.equal(document.activeElement, root.querySelector('[data-docs-search]'));
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
	assert.equal(root.querySelector('[data-docs-search-dialog]').hidden, true);
	assert.equal(document.activeElement, root.querySelector('[data-docs-search-mobile]'));
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }));
	assert.equal(root.querySelector('[data-docs-search-dialog]').hidden, false, 'existing Ctrl K shortcut still works');
	cleanup();
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '/' }));
	assert.equal(root.querySelector('[data-docs-search-dialog]').hidden, true, 'cleanup removes document listeners');
	assert.equal(document.body.style.overflow, '');
});

test('slash respects editable controls, modifiers, composition and other dialogs', () => {
	const { attachDocsSidebar, root, state, window, document } = runtime();
	const cleanup = attachDocsSidebar(root, state);
	const dialog = root.querySelector('[data-docs-search-dialog]');
	for (const markup of [
		'<input>',
		'<textarea></textarea>',
		'<select></select>',
		'<div contenteditable="true"><span></span></div>',
		'<div role="textbox"></div>',
	]) {
		const container = document.createElement('div');
		container.innerHTML = markup;
		root.querySelector('[data-docs-main]').append(container);
		const target = container.querySelector('span') || container.firstElementChild;
		const event = new window.KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
		target.dispatchEvent(event);
		assert.equal(dialog.hidden, true, markup);
		assert.equal(event.defaultPrevented, false, 'typing a slash is preserved');
		container.remove();
	}
	for (const options of [
		{ ctrlKey: true },
		{ metaKey: true },
		{ altKey: true },
		{ repeat: true },
		{ isComposing: true },
	]) {
		document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '/', ...options }));
		assert.equal(dialog.hidden, true);
	}
	const prevented = new window.KeyboardEvent('keydown', { key: '/', cancelable: true });
	prevented.preventDefault();
	document.dispatchEvent(prevented);
	assert.equal(dialog.hidden, true);
	const otherDialog = document.createElement('div');
	otherDialog.setAttribute('role', 'dialog');
	otherDialog.setAttribute('aria-modal', 'true');
	document.body.append(otherDialog);
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '/' }));
	assert.equal(dialog.hidden, true);
	otherDialog.remove();
	cleanup();
});

test('search traps focus, supports arrow keys and Enter, and closes on backdrop or Escape', () => {
	const { attachDocsSidebar, root, state, window, document } = runtime();
	document.body.style.overflow = 'clip';
	const cleanup = attachDocsSidebar(root, state);
	const trigger = root.querySelector('[data-docs-search-open]');
	trigger.focus();
	trigger.click();
	const dialog = root.querySelector('[data-docs-search-dialog]');
	const input = root.querySelector('[data-docs-search]');
	const close = root.querySelector('[data-docs-search-close]');
	const key = (value, options = {}) =>
		document.activeElement.dispatchEvent(
			new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options })
		);
	key('Tab', { shiftKey: true });
	assert.equal(document.activeElement, close);
	key('Tab');
	assert.equal(document.activeElement, input);
	input.value = 'overview';
	input.dispatchEvent(new window.Event('input'));
	const links = Array.from(dialog.querySelectorAll('li:not([hidden]) a'));
	key('ArrowDown');
	assert.equal(document.activeElement, links[0]);
	key('ArrowDown');
	assert.equal(document.activeElement, links[1]);
	key('Tab');
	assert.equal(document.activeElement, input);
	key('ArrowUp');
	assert.equal(document.activeElement, links[1]);
	key('Escape');
	assert.equal(dialog.hidden, true);
	assert.equal(document.activeElement, trigger);
	assert.equal(document.body.style.overflow, 'clip');
	trigger.click();
	let destination;
	links[0].addEventListener('click', (event) => {
		event.preventDefault();
		destination = event.currentTarget.getAttribute('href');
	});
	key('Enter');
	assert.equal(destination, '#/post/Introduction');
	assert.equal(dialog.hidden, true);
	trigger.click();
	root.querySelector('.lite-docs-search-panel').click();
	assert.equal(dialog.hidden, false, 'clicking the panel keeps search open');
	dialog.click();
	assert.equal(dialog.hidden, true);
	trigger.click();
	cleanup();
	assert.equal(document.body.style.overflow, 'clip');
	assert.equal(root.querySelector('[data-docs-main]').inert, false);
});

test('mobile search restores focus after closing the drawer or resizing to desktop', () => {
	const { attachDocsSidebar, root, state, window, document, media } = runtime({ mobile: true });
	const cleanup = attachDocsSidebar(root, state);
	root.querySelector('[data-docs-sidebar-open]').click();
	const trigger = root.querySelector('.lite-docs-sidebar [data-docs-search-open]');
	trigger.focus();
	trigger.click();
	assert.equal(state.mobileOpen, false);
	assert.equal(document.body.style.overflow, 'hidden');
	assert.equal(root.querySelector('.lite-docs-mobile-bar').inert, true);
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
	const mobileTrigger = root.querySelector('[data-docs-search-mobile]');
	assert.equal(document.activeElement, mobileTrigger);
	assert.equal(document.body.style.overflow, '');
	assert.equal(root.querySelector('.lite-docs-mobile-bar').inert, false);
	mobileTrigger.click();
	assert.equal(root.querySelector('[data-docs-search-dialog]').hidden, false);
	media.matches = false;
	media.dispatchEvent(new window.Event('change'));
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
	assert.equal(document.activeElement, trigger, 'resizing does not restore focus to a hidden toolbar');
	cleanup();
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
	const positions = [300, 600, 900, 1200];
	let measurements = 0;
	headings.forEach((heading, index) => {
		heading.getBoundingClientRect = () => {
			measurements += 1;
			return { top: positions[index] - window.scrollY };
		};
	});
	const cleanup = attachDocsTableOfContents(root);
	const links = Array.from(root.querySelectorAll('[data-docs-toc] a'));
	assert.equal(links.length, 4);
	assert.equal(headings[3].id, 'getting-started-2');
	assert.equal(links[1].style.getPropertyValue('--toc-depth'), '1');
	assert.equal(links[0].getAttribute('aria-current'), 'location');
	window.scrollY = 800;
	window.dispatchEvent(new window.Event('scroll'));
	window.dispatchEvent(new window.Event('scroll'));
	assert.equal(frames.length, 1, 'scroll events are coalesced into one frame');
	frames.shift()();
	assert.equal(links[2].getAttribute('aria-current'), 'location');
	assert.equal(links[0].hasAttribute('aria-current'), false);
	assert.equal(measurements, headings.length, 'scrolling does not remeasure the document');
	assert.equal(scrolls.length, 0, 'active-section tracking never moves the page');
	window.scrollY = 400;
	window.dispatchEvent(new window.Event('scroll'));
	frames.shift()();
	assert.equal(links[0].getAttribute('aria-current'), 'location', 'scrolling back selects the previous section');
	links[3].click();
	assert.equal(scrolls[0].top, 1104);
	assert.equal(scrolls[0].behavior, 'smooth');
	assert.equal(window.location.hash, '', 'TOC navigation does not trigger a route change');
	cleanup();
});

test('TOC follows layout changes from resizing and loaded media, then releases observers and queued work', () => {
	const { attachDocsTableOfContents, root, window, frames, resizeObservers } = runtime();
	const headings = Array.from(root.querySelectorAll('.lite-docs-copy :is(h2,h3,h4)'));
	const positions = [300, 600, 900, 1200];
	headings.forEach((heading, index) => {
		heading.getBoundingClientRect = () => ({ top: positions[index] - window.scrollY });
	});
	window.scrollY = 800;
	const cleanup = attachDocsTableOfContents(root);
	const links = Array.from(root.querySelectorAll('[data-docs-toc] a'));
	const list = root.querySelector('[data-docs-toc] ul');
	list.getBoundingClientRect = () => ({ top: 80 });
	links.forEach((link, index) => {
		link.firstElementChild.getBoundingClientRect = () => ({
			top: 80 + index * 40 + 9,
			height: index === 1 ? 38 : 16,
		});
	});
	assert.equal(links[2].getAttribute('aria-current'), 'location');
	positions[1] = 1000;
	positions[2] = 1300;
	positions[3] = 1600;
	resizeObservers[0].resize();
	window.dispatchEvent(new window.Event('resize'));
	assert.equal(frames.length, 1);
	frames.shift()();
	assert.equal(links[0].getAttribute('aria-current'), 'location');
	assert.equal(
		list.style.getPropertyValue('--toc-indicator-top'),
		'9px',
		'marker starts at the text, below link padding'
	);
	assert.equal(list.style.getPropertyValue('--toc-indicator-height'), '16px', 'marker only covers the text height');
	const image = window.document.createElement('img');
	root.querySelector('.lite-docs-copy').append(image);
	positions[1] = 700;
	image.dispatchEvent(new window.Event('load'));
	frames.shift()();
	assert.equal(links[1].getAttribute('aria-current'), 'location');
	assert.equal(list.style.getPropertyValue('--toc-indicator-top'), '49px');
	assert.equal(
		list.style.getPropertyValue('--toc-indicator-height'),
		'38px',
		'wrapped labels keep their full text height'
	);
	assert.ok(resizeObservers[0].observed.includes(root.querySelector('.lite-docs-article-column')));
	assert.ok(resizeObservers[0].observed.includes(list));
	window.dispatchEvent(new window.Event('scroll'));
	cleanup();
	assert.equal(resizeObservers[0].disconnected, true);
	assert.equal(frames.length, 0, 'cleanup cancels the pending frame');
	window.dispatchEvent(new window.Event('resize'));
	window.dispatchEvent(new window.Event('scroll'));
	image.dispatchEvent(new window.Event('load'));
	assert.equal(frames.length, 0);
});

test('TOC selects the final section at the bottom, including a short final section', () => {
	const { attachDocsTableOfContents, root, window, frames, scrolls } = runtime();
	Object.defineProperty(window.document.documentElement, 'scrollHeight', { value: 2000 });
	Object.defineProperty(window, 'innerHeight', { value: 800 });
	root.querySelectorAll('.lite-docs-copy :is(h2,h3,h4)').forEach((heading, index) => {
		heading.getBoundingClientRect = () => ({ top: 300 + index * 500 - window.scrollY });
	});
	const cleanup = attachDocsTableOfContents(root);
	window.scrollY = 1200;
	window.dispatchEvent(new window.Event('scroll'));
	frames.shift()();
	const links = root.querySelectorAll('[data-docs-toc] a');
	assert.equal(links[3].getAttribute('aria-current'), 'location');
	assert.equal(root.querySelectorAll('[data-docs-toc] [aria-current]').length, 1);
	assert.equal(scrolls.length, 0);
	cleanup();
});

test('TOC respects reduced motion and ignores late font readiness after cleanup', async () => {
	const { attachDocsTableOfContents, root, document, window, frames, scrolls } = runtime({ reducedMotion: true });
	const fonts = new window.EventTarget();
	let finishFonts;
	fonts.ready = new Promise((resolve) => {
		finishFonts = resolve;
	});
	Object.defineProperty(document, 'fonts', { value: fonts });
	const cleanup = attachDocsTableOfContents(root);
	root.querySelector('[data-docs-toc] a').click();
	assert.equal(scrolls[0].behavior, 'auto');
	fonts.dispatchEvent(new window.Event('loadingdone'));
	assert.equal(frames.length, 1);
	cleanup();
	finishFonts();
	await Promise.resolve();
	assert.equal(frames.length, 0);
});

test('shared initializers can run in the isolated editor preview without module dependencies', () => {
	const { attachDocsSidebar, attachDocsTableOfContents, root, window, document } = runtime();
	vm.runInNewContext(
		`
		(${attachDocsSidebar.toString()})(document, { collapsed: false, mobileOpen: false, query: '', collapsedCategories: new Set() });
		(${attachDocsTableOfContents.toString()})(document);
	`,
		{
			document,
			window,
			navigator: window.navigator,
			AbortController: window.AbortController,
			Element: window.Element,
			HTMLElement: window.HTMLElement,
		}
	);
	assert.equal(root.querySelector('[data-docs-toc]').hidden, false);
	root.querySelector('[data-docs-sidebar-toggle]').click();
	assert.equal(root.querySelector('.lite-docs-sidebar').inert, true);
	document.dispatchEvent(new window.KeyboardEvent('keydown', { key: '/' }));
	assert.equal(root.querySelector('[data-docs-search-dialog]').hidden, false);
	assert.equal(document.activeElement, root.querySelector('[data-docs-search]'));
});
