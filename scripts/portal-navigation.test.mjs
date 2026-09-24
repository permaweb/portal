import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

function compile(source) {
	return ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			jsx: ts.JsxEmit.React,
			esModuleInterop: true,
		},
	}).outputText;
}

const providerSource = compile(
	await readFile(new URL('../src/apps/editor/providers/PortalProvider.tsx', import.meta.url), 'utf8')
);
const typesSource = compile(await readFile(new URL('../src/helpers/types.ts', import.meta.url), 'utf8'));
const A = 'a'.repeat(43);
const B = 'b'.repeat(43);
const OWNER = 'w'.repeat(43);

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((done, fail) => {
		resolve = done;
		reject = fail;
	});
	return { promise, resolve, reject };
}

function portalState(id, name = id === A ? 'Portal A' : 'Portal B') {
	return {
		overview: { name, owner: OWNER, version: '1', mode: 'base' },
		users: {
			roles: { [OWNER]: { roles: ['Admin'] } },
			permissions: { 'Zone-Update': { roles: ['Admin'] } },
		},
		posts: { index: [{ id: `${id}-post` }], featuredPosts: [] },
		media: { uploads: [{ tx: 'i'.repeat(43), type: 'image' }] },
		navigation: { categories: [{ id: 'category' }], topics: [], links: [] },
		presentation: { layout: 'blog', pages: { home: {} }, themes: [] },
	};
}

function runtime({
	path = '/',
	ready = true,
	readState = ({ processId }) => portalState(processId),
	cached,
	cachedPermissions,
} = {}) {
	const hooks = [];
	const timers = new Map();
	const cache = new Map(cached ? [[cached.id, cached]] : []);
	const permissionCache = new Map(cached && cachedPermissions ? [[`${cached.id}:${OWNER}`, cachedPermissions]] : []);
	const reads = [];
	const notices = [];
	let cursor = 0;
	let timerId = 0;
	let dirty = true;
	let effects = [];
	let value;
	let location = { pathname: path };
	const arProvider = { wallet: {}, walletAddress: OWNER };
	const profile = { id: OWNER, portals: [{ id: A }, { id: B }], invites: [] };
	const sameDependencies = (before, after) =>
		before && after && before.length === after.length && before.every((item, index) => Object.is(item, after[index]));
	const React = {
		createContext: (initial) => ({ Provider: { isProvider: true }, initial }),
		createElement: (type, props) => {
			if (type?.isProvider) value = props.value;
			return null;
		},
		useState: (initial) => {
			const index = cursor++;
			if (!hooks[index]) {
				const slot = { value: typeof initial === 'function' ? initial() : initial };
				slot.set = (next) => {
					const updated = typeof next === 'function' ? next(slot.value) : next;
					if (!Object.is(updated, slot.value)) {
						slot.value = updated;
						dirty = true;
					}
				};
				hooks[index] = slot;
			}
			return [hooks[index].value, hooks[index].set];
		},
		useRef: (initial) => {
			const index = cursor++;
			if (!hooks[index]) hooks[index] = { current: initial };
			return hooks[index];
		},
		useEffect: (callback, dependencies) => {
			const index = cursor++;
			const previous = hooks[index];
			if (!previous || !sameDependencies(previous.dependencies, dependencies)) {
				hooks[index] = { dependencies, cleanup: previous?.cleanup };
				effects.push(() => {
					hooks[index].cleanup?.();
					hooks[index].cleanup = callback();
				});
			}
		},
		useMemo: (factory, dependencies) => {
			const index = cursor++;
			if (!hooks[index] || !sameDependencies(hooks[index].dependencies, dependencies)) {
				hooks[index] = { dependencies, value: factory() };
			}
			return hooks[index].value;
		},
		useCallback: (callback, dependencies) => React.useMemo(() => callback, dependencies),
	};
	React.useLayoutEffect = React.useEffect;
	function makeLibs(reader = readState) {
		return {
			readState: (request) => {
				reads.push(request);
				return Promise.resolve().then(() => reader(request, reads.length));
			},
			mapFromProcessCase: (data) => data,
			mapToProcessCase: (data) => data,
		};
	}
	const permawebProvider = { profile: ready ? profile : null, libs: ready ? makeLibs() : null, deps: {} };
	const fakeSetTimeout = (callback, delay) => {
		const id = ++timerId;
		timers.set(id, { callback, delay });
		return id;
	};
	const fakeClearTimeout = (id) => timers.delete(id);
	const context = vm.createContext({
		console: { error() {}, warn() {}, log() {} },
		setTimeout: fakeSetTimeout,
		clearTimeout: fakeClearTimeout,
		window: { setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimeout },
		AbortController,
	});
	const types = {};
	vm.runInContext(`(function(exports) { ${typesSource}\n})`, context)(types);
	const utils = {
		cachePortal: (id, state) => cache.set(id, state),
		getCachedPortal: (id) => cache.get(id) || null,
		cachePermissions: (id, address, permissions) => permissionCache.set(`${id}:${address}`, permissions),
		getCachedPermissions: (id, address) => permissionCache.get(`${id}:${address}`) || null,
		checkValidAddress: (id) => /^[a-zA-Z0-9_-]{43}$/.test(id),
		fixBooleanStrings: (data) => data,
		filterRemoved: (data) => data,
		getPortalAssets: (data) => data,
		getPortalUsers: (roles = {}) => Object.entries(roles).map(([address, details]) => ({ address, ...details })),
		isEqual: (left, right) => JSON.stringify(left) === JSON.stringify(right),
		isVersionGreater: () => false,
		debugLog() {},
	};
	const modules = {
		react: React,
		'react-router-dom': { useLocation: () => location, useNavigate: () => () => {} },
		'@permaweb/libs': { CurrentZoneVersion: '1' },
		'helpers/config': { AO_NODE: {}, PORTAL_PATCH_MAP: {}, URLS: { base: '/' } },
		'helpers/features': { IS_BASE_MODE: true, PORTAL_CAPABILITIES: { CROSS_POSTING: false } },
		'helpers/types': types,
		'helpers/utils': utils,
		'providers/ArweaveProvider': { useArweaveProvider: () => arProvider },
		'providers/PermawebProvider': { usePermawebProvider: () => permawebProvider },
		'providers/LanguageProvider': { useLanguageProvider: () => ({ current: 'en', object: { en: {} } }) },
		'providers/NotificationProvider': {
			useNotifications: () => ({ addNotification: (...notice) => notices.push(notice) }),
		},
	};
	const exports = {};
	vm.runInContext(`(function(require, exports) { ${providerSource}\n})`, context)(
		(name) => modules[name] || {},
		exports
	);
	async function flush() {
		let idle = 0;
		for (let iteration = 0; iteration < 300; iteration++) {
			if (dirty) {
				dirty = false;
				cursor = 0;
				effects = [];
				exports.PortalProvider({ children: null });
				for (const effect of effects) effect();
				idle = 0;
			}
			await Promise.resolve();
			if (!dirty && ++idle >= 25) return;
		}
		throw new Error('PortalProvider did not settle');
	}
	async function runTimers() {
		await flush();
		for (let iteration = 0; timers.size && iteration < 10; iteration++) {
			const [id, timer] = timers.entries().next().value;
			timers.delete(id);
			timer.callback();
			await flush();
		}
		assert.equal(timers.size, 0, 'Portal loading retries must be bounded');
	}
	return {
		get state() {
			return value;
		},
		reads,
		cache,
		notices,
		timers,
		flush,
		runTimers,
		async navigate(pathname) {
			location = { pathname };
			dirty = true;
			await flush();
		},
		async setProfile() {
			permawebProvider.profile = profile;
			dirty = true;
			await flush();
		},
		async setLibs(reader = readState) {
			permawebProvider.libs = makeLibs(reader);
			dirty = true;
			await flush();
		},
	};
}

test('clicking a portal from home loads its full data and permissions without refreshing the page', async () => {
	const app = runtime();
	await app.flush();
	assert.equal(app.reads.length, 0);
	await app.navigate(`/${A}`);
	assert.equal(app.reads.length, 1);
	assert.equal(app.state.current?.id, A);
	assert.equal(app.state.current?.assets.length, 1);
	assert.equal(app.state.current?.uploads.length, 1);
	assert.equal(app.state.permissions?.base, true);
});

test('an initial transient failure retries and recovers without a page reload', async () => {
	let attempts = 0;
	const app = runtime({
		path: `/${A}`,
		readState: () => {
			if (++attempts === 1) throw new Error('Temporary gateway failure');
			return portalState(A);
		},
	});
	await app.runTimers();
	assert.equal(attempts, 2);
	assert.equal(app.state.current?.id, A);
	assert.equal(app.state.loadError, null);
});

for (const base of [false, true]) {
	test(`base portal entry revalidates cached ${
		base ? 'allowed' : 'denied'
	} permissions before displaying access`, async () => {
		const pending = deferred();
		const app = runtime({
			path: `/${A}`,
			cached: { id: A, name: 'Cached portal', assets: [], uploads: [] },
			cachedPermissions: { base },
			readState: () => pending.promise,
		});
		await app.flush();
		assert.equal(app.state.permissions, null);
		pending.reject(new Error('Some portal data is still loading from Arweave. Please try again.'));
		await app.runTimers();
		assert.equal(app.state.permissions, null);
		assert.match(app.state.loadError, /still loading from Arweave/);
		await app.setLibs(() => portalState(A));
		assert.equal(app.state.permissions?.base, true);
		assert.equal(app.state.loadError, null);
	});
}

test('a full refresh retries a failed initial load even when current portal data is missing', async () => {
	let failing = true;
	const app = runtime({
		path: `/${A}`,
		readState: () => {
			if (failing) throw new Error('Gateway unavailable');
			return portalState(A);
		},
	});
	await app.runTimers();
	assert.equal(app.state.current, null);
	failing = false;
	app.state.refreshCurrentPortal();
	await app.runTimers();
	assert.equal(app.state.current?.id, A);
	assert.equal(app.state.loadError, null);
});

test('failed loading exposes an error after bounded retries, including when cached portal data exists', async () => {
	const cached = { id: A, name: 'Cached portal', assets: [], uploads: [] };
	let failing = true;
	const app = runtime({
		path: `/${A}`,
		cached,
		readState: () => {
			if (failing) throw new Error('Gateway unavailable');
			return portalState(A, 'Fresh portal');
		},
	});
	await app.runTimers();
	assert.equal(app.reads.length, 3);
	assert.equal(app.state.current?.name, 'Cached portal');
	assert.match(app.state.loadError, /Gateway unavailable/);
	assert.equal(app.state.updating, false);
	failing = false;
	app.state.refreshCurrentPortal();
	await app.runTimers();
	assert.equal(app.state.current?.name, 'Fresh portal');
	assert.equal(app.state.loadError, null);
});

test('leaving a failed portal cancels its scheduled initial-load retry', async () => {
	const app = runtime({
		path: `/${A}`,
		readState: () => {
			throw new Error('Gateway unavailable');
		},
	});
	await app.flush();
	assert.equal(app.reads.length, 1);
	assert.equal(app.timers.size, 1);
	await app.navigate('/');
	await app.runTimers();
	assert.equal(app.reads.length, 1);
	assert.equal(app.state.current, null);
});

test('an incomplete initial response retries rather than caching an empty portal', async () => {
	let attempts = 0;
	const incomplete = [{}, { overview: { name: 'Partial portal' }, users: {} }];
	const app = runtime({
		path: `/${A}`,
		readState: () => incomplete[attempts++] || portalState(A),
	});
	await app.flush();
	assert.equal(app.state.current, null);
	assert.equal(app.cache.has(A), false);
	await app.runTimers();
	assert.equal(attempts, 3);
	assert.equal(app.state.current?.id, A);
	assert.equal(app.state.current?.assets.length, 1);
});

test('an empty roles map finishes loading with denied permissions rather than retrying', async () => {
	const response = portalState(A);
	response.users.roles = {};
	const app = runtime({ path: `/${A}`, readState: () => response });
	await app.runTimers();
	assert.equal(app.reads.length, 1);
	assert.equal(app.state.current?.id, A);
	assert.equal(app.state.permissions?.base, false);
	assert.equal(app.state.loadError, null);
	assert.equal(app.timers.size, 0);
});

test('leaving and reopening the same portal prevents an older visit from overwriting newer data', async () => {
	const oldVisit = deferred();
	const newVisit = deferred();
	let request = 0;
	const app = runtime({ readState: () => (++request === 1 ? oldVisit.promise : newVisit.promise) });
	await app.flush();
	await app.navigate(`/${A}`);
	await app.navigate('/');
	await app.navigate(`/${A}`);
	assert.equal(app.reads.length, 2);
	newVisit.resolve(portalState(A, 'Newest visit'));
	await app.flush();
	assert.equal(app.state.current?.name, 'Newest visit');
	oldVisit.resolve(portalState(A, 'Stale first visit'));
	await app.flush();
	assert.equal(app.state.current?.name, 'Newest visit');
	assert.equal(app.cache.get(A)?.name, 'Newest visit');
});

test('a late response from another portal cannot replace the active portal', async () => {
	const oldPortal = deferred();
	const app = runtime({ readState: ({ processId }) => (processId === A ? oldPortal.promise : portalState(B)) });
	await app.flush();
	await app.navigate(`/${A}`);
	await app.navigate(`/${B}`);
	assert.equal(app.state.current?.id, B);
	oldPortal.resolve(portalState(A));
	await app.flush();
	assert.equal(app.state.current?.id, B);
});

test('changing subroutes within a portal keeps its pending initial request', async () => {
	const pending = deferred();
	const app = runtime({ readState: () => pending.promise });
	await app.flush();
	await app.navigate(`/${A}`);
	await app.navigate(`/${A}/posts`);
	assert.equal(app.reads.length, 1);
	pending.resolve(portalState(A));
	await app.flush();
	assert.equal(app.state.current?.id, A);
	assert.equal(app.state.permissions?.base, true);
});

test('a portal route begins loading once delayed profile and library initialization finish', async () => {
	const app = runtime({ path: `/${A}`, ready: false });
	await app.flush();
	assert.equal(app.reads.length, 0);
	await app.setProfile();
	assert.equal(app.reads.length, 0);
	await app.setLibs();
	assert.equal(app.reads.length, 1);
	assert.equal(app.state.current?.id, A);
});

test('replacing the library invalidates the previous adapter response', async () => {
	const oldAdapter = deferred();
	const app = runtime({ path: `/${A}`, readState: () => oldAdapter.promise });
	await app.flush();
	await app.setLibs(() => portalState(A, 'Current adapter'));
	assert.equal(app.state.current?.name, 'Current adapter');
	oldAdapter.resolve(portalState(A, 'Previous adapter'));
	await app.flush();
	assert.equal(app.state.current?.name, 'Current adapter');
});
