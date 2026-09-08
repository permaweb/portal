import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const EDITOR_CACHE = 'portal-bundle-cache-v1';
const MUTABLE_CACHE = 'portal-bundle-cache-mutable-v2';
const ENGINE_CACHE = 'portal-engine-lite-v1';
const ORIGIN = 'https://portal.arweave.net';
const ENGINE_URL = `${ORIGIN}/${'a'.repeat(43)}`;
const ASSET_URL = `${ORIGIN}/assets/index-aBcd_123.js`;
const START = Date.UTC(2026, 8, 8, 12);

function serviceWorker(path, network = () => new Response('download'), stores = new Map()) {
	let now = START;
	const handlers = new Map();
	const calls = [];
	const messages = [];
	const lifecycle = [];
	const caches = {
		keys: async () => [...stores.keys()],
		delete: async (name) => stores.delete(name),
		open: async (name) => {
			if (!stores.has(name)) stores.set(name, new Map());
			const entries = stores.get(name);
			return {
				match: async (request) => entries.get(request.url || request)?.clone(),
				put: async (request, response) => entries.set(request.url || request, response.clone()),
				delete: async (request) => entries.delete(request.url || request),
			};
		},
	};
	const context = vm.createContext({
		URL,
		Request,
		Response,
		Headers,
		console,
		caches,
		Date: class extends Date {
			static now() {
				return now;
			}
		},
		fetch: async (request) => {
			calls.push(request);
			const response = await network(request, calls.length);
			if (response.type === 'default') Object.defineProperty(response, 'type', { value: 'basic', configurable: true });
			return response;
		},
		self: {
			location: { origin: ORIGIN },
			addEventListener: (name, handler) => handlers.set(name, handler),
			skipWaiting: async () => lifecycle.push('skipWaiting'),
			clients: { claim: async () => lifecycle.push('claim') },
		},
	});
	vm.runInContext(readFileSync(new URL(path, import.meta.url), 'utf8'), context);
	function dispatch(name, data = {}) {
		let response;
		const waits = [];
		handlers.get(name)?.({
			...data,
			source: { postMessage: (message) => messages.push(message) },
			respondWith: (promise) => (response = promise),
			waitUntil: (promise) => waits.push(promise),
		});
		return { response, done: () => Promise.all(waits) };
	}
	function fetchResource(url, options = {}) {
		const request = new Request(url, options);
		if (options.destination) Object.defineProperty(request, 'destination', { value: options.destination });
		return dispatch('fetch', { request });
	}
	return { calls, messages, lifecycle, caches, stores, dispatch, fetchResource, advance: (ms) => (now += ms) };
}

const editor = (...args) => serviceWorker('../public/service-worker.js', ...args);
const engine = (...args) => serviceWorker('../src/apps/engine-lite/engine-lite-service-worker.js', ...args);

test('install makes no duplicate document downloads and activation preserves other applications caches', async () => {
	const stores = new Map([
		['portal-bundle-cache-obsolete', new Map()],
		[EDITOR_CACHE, new Map()],
		[ENGINE_CACHE, new Map()],
		['another-app-cache', new Map()],
	]);
	const worker = editor(undefined, stores);
	await worker.dispatch('install').done();
	await worker.dispatch('activate').done();
	assert.equal(worker.calls.length, 0);
	assert.deepEqual(worker.lifecycle, ['skipWaiting', 'claim']);
	assert.deepEqual([...stores.keys()], [EDITOR_CACHE, ENGINE_CACHE, 'another-app-cache']);
});

const refreshCases = [
	['hashed bundles', editor, ASSET_URL, {}, EDITOR_CACHE],
	['mutable bundles', editor, `${ORIGIN}/bundle.js`, {}, MUTABLE_CACHE],
	['hashed manifests', editor, `${ORIGIN}/assets/manifest-aBcd_123.json`, {}, EDITOR_CACHE],
	['engine scripts', engine, ENGINE_URL, { destination: 'script' }, ENGINE_CACHE],
];

for (const [label, factory, url, options, cacheName] of refreshCases) {
	test(`${label} serve cached bytes promptly and share a background revalidation on every use`, async () => {
		let release;
		const network = new Promise((resolve) => (release = resolve));
		const worker = factory((_request, call) => (call === 1 ? new Response('original') : network));
		assert.equal(await (await worker.fetchResource(url, options).response).text(), 'original');
		const first = worker.fetchResource(url, options);
		const second = worker.fetchResource(url, options);
		// These must resolve while the refresh is still blocked, even immediately
		// after the first download (no TTL or hash-shaped filename exemption).
		assert.equal(await (await first.response).text(), 'original');
		assert.equal(await (await second.response).text(), 'original');
		await new Promise(setImmediate);
		assert.equal(worker.calls.length, 2);
		assert.equal(worker.calls[1].cache, 'no-cache');
		release(new Response('updated'));
		await Promise.all([first.done(), second.done()]);
		assert.equal(await worker.stores.get(cacheName).get(url).clone().text(), 'updated');
	});
}

test('upgraded workers retain cached downloads but revalidate them on use', async () => {
	for (const [, factory, url, options] of refreshCases) {
		const previous = factory();
		await previous.fetchResource(url, options).response;
		const next = factory(() => {
			throw new Error('offline');
		}, previous.stores);
		await next.dispatch('activate').done();
		next.advance(30 * 24 * 60 * 60 * 1000);
		const hit = next.fetchResource(url, options);
		assert.equal(await (await hit.response).text(), 'download');
		await hit.done();
		assert.equal(next.calls.length, 1);
	}
});

test('refresh cooldown honors Retry-After seconds and dates across worker restarts', async () => {
	for (const [, factory, url, options, cacheName] of refreshCases) {
		for (const retryAfter of ['180', new Date(START + 180 * 1000).toUTCString()]) {
			const worker = factory((_request, call) =>
				call === 1
					? new Response('good')
					: new Response('limited', {
							status: 429,
							headers: { 'Retry-After': retryAfter },
					  })
			);
			await worker.fetchResource(url, options).response;
			const limited = worker.fetchResource(url, options);
			assert.equal(await (await limited.response).text(), 'good');
			await limited.done();
			assert.equal(worker.calls.length, 2);
			const restarted = factory(() => new Response('recovered'), worker.stores);
			restarted.advance(179 * 1000);
			const paused = restarted.fetchResource(url, options);
			assert.equal(await (await paused.response).text(), 'good');
			await paused.done();
			assert.equal(restarted.calls.length, 0);
			restarted.advance(1000);
			const recovered = restarted.fetchResource(url, options);
			assert.equal(await (await recovered.response).text(), 'good');
			await recovered.done();
			assert.equal(restarted.calls.length, 1);
			assert.equal(await worker.stores.get(cacheName).get(url).clone().text(), 'recovered');
		}
	}
});

test('simultaneous cold bundle requests share one network download and independent readable responses', async () => {
	let release;
	const network = new Promise((resolve) => (release = resolve));
	const worker = editor(() => network);
	const first = worker.fetchResource(ASSET_URL).response;
	const second = worker.fetchResource(ASSET_URL).response;
	release(new Response('shared bytes'));
	const responses = await Promise.all([first, second]);
	assert.deepEqual(await Promise.all(responses.map((response) => response.text())), ['shared bytes', 'shared bytes']);
	assert.equal(worker.calls.length, 1);
});

test('failed refreshes retain a good mutable cache entry and failed cold responses are never stored', async () => {
	const worker = editor((_request, call) => {
		if (call === 3) throw new Error('offline');
		return call === 1 ? new Response('good') : new Response('limited', { status: 429 });
	});
	const url = `${ORIGIN}/favicon.svg`;
	await worker.fetchResource(url).response;
	for (let i = 0; i < 2; i++) {
		const hit = worker.fetchResource(url);
		assert.equal(await (await hit.response).text(), 'good');
		await hit.done();
	}
	assert.equal(worker.calls.length, 2);
	worker.advance(60 * 1000);
	const offline = worker.fetchResource(url);
	assert.equal(await (await offline.response).text(), 'good');
	await offline.done();
	assert.equal(worker.calls.length, 3);
	assert.equal(await worker.stores.get(MUTABLE_CACHE).get(url).clone().text(), 'good');
	assert.equal((await worker.fetchResource(ASSET_URL).response).status, 429);
	assert.equal(worker.stores.get(EDITOR_CACHE).size, 0);
});

test('documents, gateway API calls, foreign resources and no-store downloads stay browser managed', () => {
	const worker = editor();
	for (const [url, options] of [
		[`${ORIGIN}/`, {}],
		[`${ORIGIN}/index.html`, {}],
		[`${ORIGIN}/graphql`, {}],
		[`${ORIGIN}/state.json`, {}],
		[`${ORIGIN}/assets/manifest.json`, {}],
		['https://other.example/assets/index-aBcd_123.js', {}],
		[ASSET_URL, { method: 'HEAD' }],
		[ASSET_URL, { cache: 'no-store' }],
		[ASSET_URL, { cache: 'reload' }],
		[ASSET_URL, { cache: 'no-cache' }],
		[ASSET_URL, { headers: { Range: 'bytes=0-100' } }],
		[`${ORIGIN}/service-worker.js`, {}],
	]) {
		assert.equal(worker.fetchResource(url, options).response, undefined, url);
	}
	assert.equal(worker.calls.length, 0);
});

test('cache failures do not turn a successful download into an application error', async () => {
	const worker = editor();
	worker.caches.open = async () => {
		throw new Error('storage disabled');
	};
	assert.equal(await (await worker.fetchResource(ASSET_URL).response).text(), 'download');
});

test('deployment cache refresh preserves hashed bundles and engine cache; full clear is still Portal scoped', async () => {
	const stores = new Map([
		[EDITOR_CACHE, new Map()],
		[MUTABLE_CACHE, new Map()],
		[ENGINE_CACHE, new Map()],
		['unrelated', new Map()],
	]);
	const worker = editor(undefined, stores);
	await worker.dispatch('message', { data: { type: 'CLEAR_MUTABLE_CACHE' } }).done();
	assert.deepEqual([...stores.keys()], [EDITOR_CACHE, ENGINE_CACHE, 'unrelated']);
	assert.equal(worker.messages.length, 1);
	assert.equal(worker.messages[0].type, 'CACHE_CLEARED');
	await worker.dispatch('message', { data: { type: 'CLEAR_CACHE' } }).done();
	assert.deepEqual([...stores.keys()], [ENGINE_CACHE, 'unrelated']);
});

test('engine warming messages reuse downloads while script loads revalidate in the background', async () => {
	const worker = engine();
	const first = worker.dispatch('message', { data: { type: 'CACHE_ENGINE', url: ENGINE_URL } });
	const second = worker.fetchResource(ENGINE_URL, { destination: 'script' });
	await first.done();
	assert.equal(await (await second.response).text(), 'download');
	await worker.dispatch('message', { data: { type: 'CACHE_ENGINE', url: ENGINE_URL } }).done();
	assert.equal(worker.calls.length, 1);
	const hit = worker.fetchResource(ENGINE_URL, { destination: 'script' });
	assert.equal(await (await hit.response).text(), 'download');
	await hit.done();
	assert.equal(worker.calls.length, 2);
});

test('cross-origin engine scripts use one CORS request and cache only a verified successful response', async () => {
	const url = `https://arweave.net/${'a'.repeat(43)}`;
	const worker = engine((request) => {
		assert.equal(request.mode, 'cors');
		assert.equal(request.credentials, 'omit');
		const response = new Response('verified engine');
		Object.defineProperty(response, 'type', { value: 'cors' });
		return response;
	});
	const options = { destination: 'script', mode: 'no-cors' };
	assert.equal(await (await worker.fetchResource(url, options).response).text(), 'verified engine');
	assert.equal(worker.calls.length, 1);
	const hit = worker.fetchResource(url, options);
	assert.equal(await (await hit.response).text(), 'verified engine');
	await hit.done();
	assert.equal(worker.calls.length, 2);
});

test('legacy opaque engine entries are replaced, and CORS failures leave opaque script fallbacks uncached', async () => {
	const url = `https://arweave.net/${'a'.repeat(43)}`;
	const opaque = () => ({ status: 0, type: 'opaque', clone: opaque });
	const stores = new Map([[ENGINE_CACHE, new Map([[url, opaque()]])]]);
	const worker = engine((request) => {
		if (request.mode === 'cors') throw new TypeError('CORS unavailable');
		return opaque();
	}, stores);
	assert.equal((await worker.fetchResource(url, { destination: 'script', mode: 'no-cors' }).response).type, 'opaque');
	assert.equal(worker.calls.length, 2);
	assert.equal(stores.get(ENGINE_CACHE).size, 0);
	const recovered = engine(() => new Response('verified replacement'), stores);
	assert.equal(
		await (await recovered.fetchResource(url, { destination: 'script', mode: 'no-cors' }).response).text(),
		'verified replacement'
	);
	assert.equal(stores.get(ENGINE_CACHE).size, 1);
});

test('verified cross-origin 429 responses do not trigger an opaque fallback or poison engine cache', async () => {
	const url = `https://arweave.net/${'a'.repeat(43)}`;
	const worker = engine(() => new Response('limited', { status: 429 }));
	assert.equal((await worker.fetchResource(url, { destination: 'script', mode: 'no-cors' }).response).status, 429);
	assert.equal(worker.calls.length, 1);
	assert.equal(worker.stores.get(ENGINE_CACHE).size, 0);
});

test('engine mutable bundle URLs and non-script transactions are not cached', async () => {
	const worker = engine();
	assert.equal(worker.fetchResource(`${ORIGIN}/bundle.js`, { destination: 'script' }).response, undefined);
	assert.equal(worker.fetchResource(ENGINE_URL).response, undefined);
	for (const cache of ['no-store', 'reload', 'no-cache']) {
		assert.equal(worker.fetchResource(ENGINE_URL, { destination: 'script', cache }).response, undefined);
	}
	for (const url of [`${ORIGIN}/bundle.js`, `${ORIGIN}/graphql`, 'file:///invalid', 'invalid']) {
		await worker.dispatch('message', { data: { type: 'CACHE_ENGINE', url } }).done();
	}
	assert.equal(worker.calls.length, 0);
});

test('a failed engine download is retried on the next request without poisoning the cache', async () => {
	const worker = engine(
		(_request, call) => new Response(call === 1 ? 'limited' : 'good', { status: call === 1 ? 429 : 200 })
	);
	assert.equal((await worker.fetchResource(ENGINE_URL, { destination: 'script' }).response).status, 429);
	assert.equal(await (await worker.fetchResource(ENGINE_URL, { destination: 'script' }).response).text(), 'good');
	assert.equal(worker.calls.length, 2);
});

const managerSource = ts.transpileModule(
	readFileSync(new URL('../src/helpers/serviceWorkerManager.ts', import.meta.url), 'utf8'),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
).outputText;

function managerFixture(storage = new Map(), session = new Map()) {
	const calls = [];
	const registrations = [];
	const listeners = new Set();
	const messages = [];
	let reloads = 0;
	const registration = {
		active: { postMessage: (message) => messages.push(message) },
		unregister: async () => true,
	};
	const store = (map) => ({ getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) });
	const context = {
		exports: {},
		require: () => ({ debugLog: () => {} }),
		URL,
		document: { baseURI: `${ORIGIN}/manifest/index.html#/posts` },
		window: { location: { hostname: 'portal.arweave.net', reload: () => reloads++ } },
		navigator: {
			serviceWorker: {
				register: async (...args) => {
					registrations.push(args);
					return registration;
				},
				addEventListener: (_type, listener) => listeners.add(listener),
				removeEventListener: (_type, listener) => listeners.delete(listener),
			},
		},
		localStorage: store(storage),
		sessionStorage: store(session),
		fetch: async (...args) => {
			calls.push(args);
			return new Response('', { headers: { 'X-Arns-Resolved-Id': 'new-version' } });
		},
	};
	vm.runInNewContext(managerSource, context);
	return {
		api: context.exports.serviceWorkerManager,
		context,
		registrations,
		calls,
		storage,
		session,
		messages,
		listeners,
		reloads: () => reloads,
	};
}

test('manager registers once for the deployed path and retains one message listener', async () => {
	const manager = managerFixture();
	await Promise.all([manager.api.register(), manager.api.register()]);
	await manager.api.register();
	assert.equal(manager.registrations.length, 1);
	assert.equal(manager.registrations[0][0], `${ORIGIN}/manifest/service-worker.js`);
	assert.equal(manager.registrations[0][1].scope, `${ORIGIN}/manifest/`);
	assert.equal(manager.listeners.size, 1);
	await manager.api.unregister();
	assert.equal(manager.listeners.size, 0);
});

test('ArNS root and nested manifest deployments register and check the document base', async () => {
	for (const [baseURI, expected] of [
		[`${ORIGIN}/#/posts`, `${ORIGIN}/`],
		[`${ORIGIN}/index.html#/posts`, `${ORIGIN}/`],
		[`${ORIGIN}/manifest/#/posts`, `${ORIGIN}/manifest/`],
	]) {
		const manager = managerFixture();
		manager.context.document.baseURI = baseURI;
		await manager.api.register();
		await manager.api.checkArNSUpdate();
		assert.equal(manager.registrations[0][0], `${expected}service-worker.js`);
		assert.equal(manager.registrations[0][1].scope, expected);
		assert.equal(manager.calls[0][0], expected);
	}
});

test('ArNS checks are coalesced/throttled across reloads and version changes preserve app state and request budget', async () => {
	const storage = new Map([
		['portal-arns-id', 'old-version'],
		['portal:gateway-request-budget:v1', 'saved-budget'],
		['persist:root', 'saved-app-state'],
	]);
	const manager = managerFixture(storage);
	await manager.api.register();
	await Promise.all([manager.api.checkArNSUpdate(), manager.api.checkArNSUpdate()]);
	await manager.api.checkArNSUpdate();
	assert.equal(manager.calls.length, 1);
	assert.equal(manager.calls[0][0], `${ORIGIN}/manifest/`);
	assert.equal(storage.get('portal-arns-id'), 'new-version');
	assert.equal(storage.get('portal:gateway-request-budget:v1'), 'saved-budget');
	assert.equal(storage.get('persist:root'), 'saved-app-state');
	assert.equal(manager.messages.length, 1);
	assert.equal(manager.messages[0].type, 'CLEAR_MUTABLE_CACHE');
	const reloaded = managerFixture(storage, manager.session);
	await reloaded.api.checkArNSUpdate();
	assert.equal(reloaded.calls.length, 0);
});
