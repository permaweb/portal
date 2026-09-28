import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import { JSDOM } from 'jsdom';
import ts from 'typescript';

const compile = (name) =>
	ts.transpileModule(readFileSync(new URL(`../src/apps/engine-lite/${name}`, import.meta.url), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
	}).outputText;
const sources = Object.fromEntries(
	['constants.ts', 'loading.ts', 'docs.ts', 'index.ts'].map((name) => [name, compile(name)])
);
const post = (slug) => ({ id: slug, slug, title: slug, excerpt: '', content: slug });
const portal = (layout = 'docs', posts = [post('first'), post('second'), post('third')]) => ({
	id: 'a'.repeat(43),
	name: 'Documentation',
	layout,
	posts,
	themes: [],
	fonts: null,
});
const deferred = () => {
	let resolve, reject;
	const promise = new Promise((done, fail) => {
		resolve = done;
		reject = fail;
	});
	return { promise, resolve, reject };
};
const flush = () => new Promise(setImmediate);

function runtime(options = {}) {
	const dom = new JSDOM(
		`<!doctype html>${
			options.bootstrap
				? '<div id="portal-site-loader"><div id="portal-site-loader-logo"><svg data-brand></svg></div></div>'
				: ''
		}<div id="portal"></div>`,
		{
			url: options.url || `https://example.com/?portal=${'a'.repeat(43)}`,
		}
	);
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
	window.matchMedia = () => Object.assign(new window.EventTarget(), { matches: false });
	window.scrollTo = () => {};
	let next = 0;
	const frames = new Map();
	const timers = new Map();
	window.requestAnimationFrame = (callback) => {
		frames.set(++next, callback);
		return next;
	};
	window.cancelAnimationFrame = (id) => frames.delete(id);
	window.setTimeout = (callback) => {
		timers.set(++next, callback);
		return next;
	};
	window.clearTimeout = (id) => timers.delete(id);
	const runFrames = () => {
		for (let count = 0; frames.size && count < 10; count++) {
			const current = [...frames.values()];
			frames.clear();
			current.forEach((callback) => callback());
		}
	};
	const runTimers = () => {
		const current = [...timers.values()];
		timers.clear();
		current.forEach((callback) => callback());
	};
	const errors = [];
	const globals = {
		window,
		document,
		navigator: window.navigator,
		HTMLScriptElement: window.HTMLScriptElement,
		AbortController: window.AbortController,
		URL,
		URLSearchParams,
		console: { error: (...args) => errors.push(args) },
	};
	const constants = {},
		loading = {},
		docs = {};
	vm.runInNewContext(sources['constants.ts'], { ...globals, exports: constants });
	vm.runInNewContext(sources['loading.ts'], { ...globals, exports: loading, require: () => constants });
	vm.runInNewContext(sources['docs.ts'], { ...globals, exports: docs });
	const modules = {
		'../../helpers/gatewayFetchBootstrap': {},
		'../../helpers/gatewayRetryNotice': { mountGatewayRetryNotice: () => {} },
		'../editor/favicon.svg': 'favicon.svg',
		'./constants': constants,
		'./loading': loading,
		'./docs': docs,
		'./data': {
			fetchPortal: options.fetchPortal || (async () => portal()),
			hydratePost: options.hydratePost || (async (value) => value),
			findPost: (posts, slug) => posts.find((value) => value.slug === slug),
			isArweaveId: (value) => /^[a-zA-Z0-9_-]{43}$/.test(value),
		},
		'./logo': { inlineSvgLogo: async () => {} },
		'./render': {
			escapeHTML: (value) => value,
			renderShell: (content) => `<div class="lite-shell">${content}</div>`,
			renderDocs: (_, value) => `<h1>${value.title}</h1>`,
			renderPost: (value) => `<h1>${value.title}</h1>`,
			renderFeed: () => '<h1>Posts</h1>',
		},
		'./styles.css?inline': '',
		'./theme': { getLiteFontStylesheet: () => null, getLiteThemeVars: () => ({}) },
	};
	const root = document.getElementById('portal');
	return {
		...loading,
		root,
		window,
		document,
		errors,
		runFrames,
		runTimers,
		boot() {
			vm.runInNewContext(sources['index.ts'], {
				...globals,
				exports: {},
				require: (name) => {
					assert.ok(name in modules, name);
					return modules[name];
				},
			});
		},
		navigate(slug) {
			window.history.replaceState(null, '', `#/post/${slug}`);
			window.dispatchEvent(new window.HashChangeEvent('hashchange'));
		},
		get loader() {
			return document.getElementById('portal-site-loader');
		},
	};
}

test('loader reuses the bootstrap branding and cancels an old fade when another page starts loading', () => {
	const app = runtime({ bootstrap: true });
	const controller = app.createSiteLoader(app.root);
	app.document.body.style.overflow = 'clip';
	controller.show();
	assert.equal(app.document.querySelectorAll('#portal-site-loader').length, 1);
	assert.ok(app.loader.querySelector('[data-brand]'));
	assert.ok(app.loader.querySelector('.lite-site-loader-spinner'));
	assert.equal(app.root.inert, true);
	controller.hide();
	app.runFrames();
	assert.equal(app.loader.classList.contains('is-hidden'), true);
	controller.show('Loading next page…');
	app.runTimers();
	assert.equal(app.loader.hidden, false);
	assert.equal(app.loader.classList.contains('is-hidden'), false);
	assert.equal(app.loader.getAttribute('aria-label'), 'Loading next page…');
	assert.equal(app.root.getAttribute('aria-busy'), 'true');
	controller.hide();
	app.runFrames();
	app.runTimers();
	assert.equal(app.loader.hidden, true);
	assert.equal(app.root.inert, false);
	assert.equal(app.root.getAttribute('aria-busy'), 'false');
	assert.equal(app.document.body.style.overflow, 'clip');
	assert.equal(app.document.body.classList.contains('lite-site-loading'), false);
});

test('initial load remains covered through portal fetch and first-page hydration without a bootstrap splash', async () => {
	const manifest = deferred(),
		content = deferred();
	const app = runtime({ fetchPortal: () => manifest.promise, hydratePost: () => content.promise });
	app.boot();
	assert.equal(app.loader.hidden, false);
	assert.equal(app.root.inert, true);
	manifest.resolve(portal());
	await flush();
	app.runFrames();
	assert.equal(app.loader.classList.contains('is-hidden'), false);
	assert.match(app.loader.textContent, /Loading page/);
	content.resolve(post('first'));
	await flush();
	assert.match(app.root.textContent, /first/);
	assert.equal(app.root.inert, true, 'keep the page covered until it can paint');
	app.runFrames();
	app.runTimers();
	assert.equal(app.loader.hidden, true);
	assert.equal(app.root.inert, false);
	assert.deepEqual(app.errors, []);
});

for (const layout of ['docs', 'blog']) {
	test(`${layout} navigation shows the loader and ignores an obsolete page completion`, async () => {
		const second = deferred(),
			third = deferred();
		const app = runtime({
			fetchPortal: async () => portal(layout),
			hydratePost: (value) =>
				value.slug === 'second' ? second.promise : value.slug === 'third' ? third.promise : Promise.resolve(value),
		});
		app.boot();
		await flush();
		app.runFrames();
		app.runTimers();
		app.navigate('second');
		assert.equal(app.loader.hidden, false);
		assert.equal(app.root.inert, true);
		app.navigate('third');
		second.resolve(post('second'));
		await flush();
		app.runFrames();
		assert.equal(app.loader.classList.contains('is-hidden'), false, 'old requests cannot hide a newer loader');
		assert.doesNotMatch(app.root.textContent, /second/);
		third.resolve(post('third'));
		await flush();
		app.runFrames();
		app.runTimers();
		assert.match(app.root.textContent, /third/);
		assert.equal(app.loader.hidden, true);
		assert.equal(app.root.inert, false);
		assert.deepEqual(app.errors, []);
	});
}

test('a late response cannot replace the page after the current navigation finishes', async () => {
	const slow = deferred();
	const app = runtime({ hydratePost: (value) => (value.slug === 'second' ? slow.promise : Promise.resolve(value)) });
	app.boot();
	await flush();
	app.navigate('second');
	app.navigate('third');
	await flush();
	app.runFrames();
	app.runTimers();
	slow.resolve(post('second'));
	await flush();
	assert.match(app.root.textContent, /third/);
	assert.equal(app.loader.hidden, true);
});

test('startup and page failures release the loader and expose the error', async () => {
	for (const options of [
		{ url: 'https://example.com/' },
		{
			fetchPortal: async () => {
				throw new Error('Unavailable');
			},
		},
		{
			hydratePost: async () => {
				throw new Error('Unavailable');
			},
		},
	]) {
		const app = runtime(options);
		app.boot();
		await flush();
		app.runFrames();
		app.runTimers();
		assert.ok(app.root.querySelector('.lite-error'));
		assert.equal(app.loader.hidden, true);
		assert.equal(app.root.inert, false);
		assert.equal(app.root.getAttribute('aria-busy'), 'false');
	}
});

test('empty and missing pages also finish loading', async () => {
	const app = runtime({ fetchPortal: async () => portal('docs', []) });
	app.boot();
	await flush();
	app.runFrames();
	app.runTimers();
	assert.ok(app.root.querySelector('.lite-empty'));
	assert.equal(app.loader.hidden, true);
	const missing = runtime();
	missing.boot();
	await flush();
	missing.navigate('unknown');
	missing.runFrames();
	missing.runTimers();
	assert.match(missing.root.textContent, /Page not found/);
	assert.equal(missing.loader.hidden, true);
});
