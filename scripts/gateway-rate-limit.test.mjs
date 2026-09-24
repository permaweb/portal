import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const source = ts.transpileModule(
	readFileSync(new URL('../src/helpers/gatewayRateLimit.ts', import.meta.url), 'utf8').replaceAll(
		'import.meta.env',
		'gatewayTestEnv'
	),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
).outputText;
const DEFAULTS = {
	'rate-limit-period': 240,
	'rate-limit-requests': 360,
	'rate-limit-max': 1200,
	'rate-limit-min': -120,
};
const START = Date.UTC(2026, 8, 8, 12);
const plain = (value) => JSON.parse(JSON.stringify(value));
const retryOnly = (fetchOverride, storage, locks) => runtime(fetchOverride, storage, locks, {});
const flush = async () => {
	for (let i = 0; i < 20; i++) await Promise.resolve();
	await new Promise(setImmediate);
	for (let i = 0; i < 20; i++) await Promise.resolve();
};

// The existing pacing-policy tests explicitly opt in; retryOnly() below exercises
// the shipped default with no environment override.
function runtime(
	fetchOverride = () => new Response('ok'),
	storage = new Map(),
	locks,
	env = { VITE_ENABLE_GATEWAY_PACING: 'true' }
) {
	let now = START;
	let timerId = 0;
	const timers = new Map();
	const calls = [];
	const events = new Map();
	const localStorage = {
		getItem: (key) => storage.get(key) ?? null,
		setItem: (key, value) => storage.set(key, String(value)),
		removeItem: (key) => storage.delete(key),
	};
	const nativeFetch = async (input, init) => {
		calls.push({ input, init, at: now });
		return fetchOverride(input, init, calls.length);
	};
	const context = vm.createContext({
		gatewayTestEnv: env,
		AbortController,
		AbortSignal,
		DOMException,
		Headers,
		Request,
		Response,
		URL,
		TextEncoder,
		TextDecoder,
		console,
		queueMicrotask,
		structuredClone,
		localStorage,
		navigator: locks ? { locks } : {},
		location: { href: 'https://portal.arweave.net/' },
		Date: class extends Date {
			constructor(...args) {
				super(...(args.length ? args : [now]));
			}
			static now() {
				return now;
			}
		},
		Math: Object.assign(Object.create(Math), { random: () => 0 }),
		setTimeout: (callback, delay = 0, ...args) => {
			const id = ++timerId;
			timers.set(id, { at: now + Math.max(0, Number(delay)), callback: () => callback(...args) });
			return id;
		},
		clearTimeout: (id) => timers.delete(id),
		fetch: nativeFetch,
		addEventListener: (name, callback) => {
			if (!events.has(name)) events.set(name, new Set());
			events.get(name).add(callback);
		},
		removeEventListener: (name, callback) => events.get(name)?.delete(callback),
	});
	context.window = context;
	const exports = {};
	vm.runInContext(`(function(require, exports) { ${source}\n})`, context)((specifier) => {
		throw new Error(`Unexpected import: ${specifier}`);
	}, exports);
	async function advance(ms) {
		const target = now + ms;
		await flush();
		let executions = 0;
		while (true) {
			const next = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
			if (!next) break;
			assert.ok(++executions < 10000, 'fake clock encountered an unbounded timer loop');
			now = next[1].at;
			timers.delete(next[0]);
			next[1].callback();
			await flush();
		}
		now = target;
		await flush();
	}
	return {
		api: exports,
		calls,
		storage,
		context,
		advance,
		now: () => now,
		dispatchStorage: (key, newValue) => {
			for (const listener of events.get('storage') || []) listener({ key, newValue, storageArea: localStorage });
		},
	};
}

test('code can update the current configuration without persisting browser preferences', () => {
	const { api, storage } = runtime();
	assert.deepEqual(plain(api.DEFAULT_GATEWAY_RATE_LIMIT), DEFAULTS);
	assert.deepEqual(plain(api.getGatewayRateLimitConfig()), DEFAULTS);
	const config = { ...DEFAULTS, 'rate-limit-period': 120, 'rate-limit-requests': 180 };
	api.setGatewayRateLimitConfig(config);
	assert.deepEqual(plain(api.getGatewayRateLimitConfig()), config);
	assert.equal(storage.size, 0);
	assert.deepEqual(plain(runtime(undefined, storage).api.getGatewayRateLimitConfig()), DEFAULTS);
	for (const invalid of [
		{ ...config, 'rate-limit-period': 0 },
		{ ...config, 'rate-limit-requests': -1 },
		{ ...config, 'rate-limit-max': 0 },
		{ ...config, 'rate-limit-min': 1 },
		{ ...config, 'rate-limit-requests': Number.NaN },
	]) {
		assert.throws(() => api.setGatewayRateLimitConfig(invalid));
		assert.deepEqual(plain(api.getGatewayRateLimitConfig()), config);
	}
});

test('default traffic starts concurrently without pacing, a four-request cap, budget writes, or Web Locks', async () => {
	const releases = [];
	const { api, calls, context, storage } = retryOnly(
		() => new Promise((resolve) => releases.push(resolve)),
		undefined,
		{
			request() {
				throw new Error('Successful traffic must not acquire Web Locks');
			},
		}
	);
	api.installGatewayFetch();
	const requests = Array.from({ length: 32 }, (_, i) => context.fetch(`https://arweave.net/${i}`));
	await flush();
	assert.equal(api.GATEWAY_PACING_ENABLED, false);
	assert.equal(calls.length, 32);
	assert.ok(calls.every(({ at }) => at === START));
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 32);
	assert.equal(api.getGatewayRequestSnapshot().queuedRequests, 0);
	assert.equal(api.getGatewayRequestSnapshot().pacingEnabled, false);
	assert.equal(api.getGatewayRequestSnapshot().requestsPerSecond, null);
	assert.equal(storage.size, 0);
	for (const release of releases) release(new Response('ok'));
	await Promise.all(requests);
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 0);
	assert.equal(api.getGatewayRequestSnapshot().totalRequests, 32);
});

test('only the explicit true feature flag enables proactive pacing', async () => {
	for (const flag of ['false', '', '1']) {
		const { api, calls } = runtime(undefined, undefined, undefined, { VITE_ENABLE_GATEWAY_PACING: flag });
		await Promise.all([api.gatewayFetch('https://arweave.net/one'), api.gatewayFetch('https://arweave.net/two')]);
		assert.equal(api.getGatewayRequestSnapshot().pacingEnabled, false);
		assert.ok(calls.every(({ at }) => at === START));
	}
	assert.equal(runtime().api.getGatewayRequestSnapshot().pacingEnabled, true);
});

test('default mode ignores old persisted pacing debt and configuration cannot reintroduce request delays', async () => {
	const key = 'portal:gateway-request-budget:v1';
	const saved = JSON.stringify({
		lastRequestAt: START,
		cooldownUntil: START + 300000,
		balance: -120,
		updatedAt: START,
		requests: [START],
		totalRequests: 999,
		rateLimitResponses: 1,
	});
	const storage = new Map([[key, saved]]);
	const { api, calls } = retryOnly(undefined, storage);
	api.setGatewayRateLimitConfig({ ...DEFAULTS, 'rate-limit-requests': 1, 'rate-limit-min': -1000000 });
	await Promise.all(Array.from({ length: 8 }, (_, i) => api.gatewayFetch(`https://arweave.net/${i}`)));
	assert.equal(calls.length, 8);
	assert.ok(calls.every(({ at }) => at === START));
	assert.equal(api.getGatewayRequestSnapshot().cooldownUntil, 0);
	assert.equal(storage.size, 1);
	assert.equal(storage.get(key), saved);
});

test('default 429 fallback starts at two seconds and backs off to thirty seconds without inferred debt delays', async () => {
	const { api, calls, advance } = retryOnly((_, __, attempt) => new Response('', { status: attempt < 8 ? 429 : 200 }));
	const request = api.gatewayFetch('https://arweave.net/data');
	await flush();
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 1);
	await advance(1999);
	assert.equal(calls.length, 1);
	await advance(118001);
	assert.equal((await request).status, 200);
	assert.deepEqual(
		calls.map(({ at }) => at - START),
		[0, 2000, 6000, 14000, 30000, 60000, 90000, 120000]
	);
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 0);
	assert.equal(api.getGatewayRequestSnapshot().rateLimitResponses, 7);
});

for (const method of ['GET', 'HEAD']) {
	test(`${method} retries escape a cached 429 without disabling caching for successful reads`, async (t) => {
		let cachedStatus = 429;
		let networkReads = 0;
		const { api, calls, advance } = retryOnly((input) => {
			if (input.cache === 'reload') {
				networkReads++;
				cachedStatus = 200;
			}
			return new Response(null, { status: cachedStatus });
		});
		const controller = new AbortController();
		const original = new Request('https://example.arweave.net/transaction', {
			method,
			cache: 'force-cache',
			credentials: 'omit',
			headers: { Accept: 'application/json' },
			signal: controller.signal,
		});
		const request = api.gatewayFetch(original);
		t.after(async () => {
			controller.abort();
			await request.catch(() => undefined);
		});
		await advance(1999);
		assert.equal(networkReads, 0, 'cache recovery must respect the gateway cooldown');
		await advance(1);
		assert.equal(networkReads, 1, 'the retry must fetch fresh bytes instead of reusing the cached error');
		assert.equal((await request).status, 200);
		assert.equal(original.cache, 'force-cache', 'retry policy must not mutate the caller request');
		assert.equal(calls[1].input.url, original.url);
		assert.equal(calls[1].input.method, method);
		assert.equal(calls[1].input.credentials, 'omit');
		assert.equal(calls[1].input.headers.get('Accept'), 'application/json');
		assert.equal((await api.gatewayFetch(original)).status, 200);
		assert.equal(calls[2].input.cache, 'force-cache');
		assert.equal(networkReads, 1, 'the recovered response remains reusable on later reads');
	});
}

test('429 retries preserve an explicit no-store request and continue bypassing cache on repeated errors', async () => {
	for (const cache of ['no-store', 'default']) {
		const { api, calls, advance } = retryOnly(
			(_, __, attempt) => new Response(null, { status: attempt < 3 ? 429 : 200 })
		);
		const request = api.gatewayFetch('https://arweave.net/transaction', { cache });
		await advance(6000);
		assert.equal((await request).status, 200);
		assert.deepEqual(
			calls.map(({ input }) => input.cache),
			[cache, cache === 'no-store' ? 'no-store' : 'reload', cache === 'no-store' ? 'no-store' : 'reload']
		);
	}
});

test('default retries honor long Retry-After seconds and dates, then release ordinary traffic without spacing', async () => {
	for (const retryAfter of ['600', new Date(START + 600000).toUTCString()]) {
		const { api, calls, advance } = retryOnly(
			(_, __, attempt) =>
				new Response('', { status: attempt === 1 ? 429 : 200, headers: { 'Retry-After': retryAfter } })
		);
		const request = api.gatewayFetch('https://arweave.net/limited');
		await flush();
		const queued = api.gatewayFetch('https://arweave.net/queued');
		await advance(600000);
		assert.equal(calls.length, 1);
		await advance(1000);
		assert.ok((await Promise.all([request, queued])).every(({ status }) => status === 200));
		assert.equal(calls.length, 3);
		assert.equal(calls[1].at, calls[2].at);
		assert.ok(calls[1].at > START + 600000);
	}
});

test('actual default-mode cooldowns survive reloads without restoring old pacing budgets', async () => {
	const storage = new Map();
	const original = retryOnly(() => new Response('', { status: 429 }), storage);
	const controller = new AbortController();
	const rejected = assert.rejects(
		original.api.gatewayFetch('https://arweave.net/data', { signal: controller.signal }),
		{
			name: 'AbortError',
		}
	);
	await flush();
	controller.abort();
	await rejected;
	assert.equal(original.api.getGatewayRequestSnapshot().retryingRequests, 0);
	assert.equal(storage.has('portal:gateway-request-budget:v1'), false);
	assert.ok(storage.has('portal:gateway-retry-cooldown:v1'));
	const reloaded = retryOnly(undefined, storage);
	const request = reloaded.api.gatewayFetch('https://arweave.net/data');
	await reloaded.advance(1999);
	assert.equal(reloaded.calls.length, 0);
	await reloaded.advance(1);
	assert.equal((await request).status, 200);
	assert.equal(reloaded.calls.length, 1);
});

test('default retries replay POST bodies and do not consume the network-attempt timeout while waiting', async () => {
	const bodies = [];
	const { api, advance } = retryOnly(async (input, _init, attempt) => {
		bodies.push(await input.text());
		return new Response('ok', { status: attempt === 1 ? 429 : 200 });
	});
	const request = api.fetchGatewayWithTimeout(
		'https://arweave.net/graphql',
		{ method: 'POST', body: '{"query":"x"}' },
		50
	);
	await advance(2000);
	assert.equal((await request).status, 200);
	assert.deepEqual(bodies, ['{"query":"x"}', '{"query":"x"}']);
});

test('default-mode cancellation while waiting does not send a request or leave retry state active', async () => {
	const { api, calls, advance } = retryOnly(() => new Response('', { status: 429 }));
	const controller = new AbortController();
	const request = api.gatewayFetch('https://arweave.net/data', { signal: controller.signal });
	const rejected = assert.rejects(request, { name: 'AbortError' });
	await flush();
	controller.abort();
	await rejected;
	await advance(60000);
	assert.equal(calls.length, 1);
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 0);
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 0);
	assert.equal(api.getGatewayRequestSnapshot().queuedRequests, 0);
});

test('arweave.net and its subdomains share pacing while other destinations bypass the queue', async () => {
	const { api, calls, advance, context } = runtime();
	api.installGatewayFetch();
	api.installGatewayFetch();
	const pending = [
		context.fetch('https://arweave.net/one'),
		api.gatewayFetch('https://data.arweave.net/two'),
		api.gatewayFetch('http://arweave.net/three'),
	];
	await flush();
	assert.equal(calls.length, 1);
	assert.equal(api.getGatewayRequestSnapshot().queuedRequests, 2);
	await api.gatewayFetch('https://arweave.net.example.com/unrelated');
	assert.equal(calls.length, 2);
	await advance(833);
	assert.equal(calls.length, 2);
	await advance(1);
	assert.equal(calls.length, 3);
	await advance(834);
	await Promise.all(pending);
	assert.equal(calls.length, 4);
	assert.equal(api.getGatewayRequestSnapshot().totalRequests, 3);
	assert.equal(api.getGatewayRequestSnapshot().requestsInPeriod, 3);
	await advance(240000);
	assert.equal(api.getGatewayRequestSnapshot().requestsInPeriod, 0);
});

test('live configuration changes adjust the pacing of requests already in the queue', async () => {
	const { api, calls, advance } = runtime();
	await api.gatewayFetch('https://arweave.net/one');
	const queued = api.gatewayFetch('https://arweave.net/two');
	await advance(100);
	api.setGatewayRateLimitConfig({ ...DEFAULTS, 'rate-limit-requests': 720 });
	await advance(316);
	assert.equal(calls.length, 1);
	await advance(1);
	assert.equal((await queued).status, 200);
	assert.equal(calls[1].at, START + 417);
});

test('shortening the period releases queued work even after the previous start leaves the request history', async () => {
	const { api, calls, advance } = runtime();
	api.setGatewayRateLimitConfig({ ...DEFAULTS, 'rate-limit-requests': 1 });
	await api.gatewayFetch('https://arweave.net/one');
	const queued = api.gatewayFetch('https://arweave.net/two');
	await advance(240001);
	assert.equal(api.getGatewayRequestSnapshot().requestsInPeriod, 0);
	assert.equal(calls.length, 1);
	api.setGatewayRateLimitConfig({ ...DEFAULTS, 'rate-limit-period': 1, 'rate-limit-requests': 1 });
	await flush();
	assert.equal(calls.length, 2, 'the old five-minute start deadline must be recalculated from the last request');
	assert.equal((await queued).status, 200);
	assert.equal(calls[1].at, START + 240001);
});

test('request pacing and cooldown survive page reloads', async () => {
	const storage = new Map();
	const original = runtime(() => new Response('', { status: 429, headers: { 'Retry-After': '2' } }), storage);
	const controller = new AbortController();
	const cancelled = assert.rejects(
		original.api.gatewayFetch('https://arweave.net/data', { signal: controller.signal }),
		{
			name: 'AbortError',
		}
	);
	await flush();
	controller.abort();
	await cancelled;
	const reloaded = runtime(undefined, storage);
	const request = reloaded.api.gatewayFetch('https://arweave.net/data');
	await reloaded.advance(2000);
	assert.equal(reloaded.calls.length, 0, 'reloading must not erase the IP cooldown');
	await reloaded.advance(2000);
	assert.equal((await request).status, 200);
	assert.equal(reloaded.api.getGatewayRequestSnapshot().totalRequests, 2);
	assert.equal(reloaded.api.getGatewayRequestSnapshot().rateLimitResponses, 1);
});

test('same-origin tabs serialize their budget reservations with Web Locks', async () => {
	const storage = new Map();
	const lockCalls = [];
	let previous = Promise.resolve();
	const locks = {
		request(name, options, action) {
			lockCalls.push(name);
			const result = previous.then(() => {
				if (options.signal?.aborted) throw options.signal.reason;
				return action();
			});
			previous = result.catch(() => undefined);
			return result;
		},
	};
	const first = runtime(undefined, storage, locks);
	const second = runtime(undefined, storage, locks);
	const requests = [
		first.api.gatewayFetch('https://arweave.net/first-tab'),
		second.api.gatewayFetch('https://arweave.net/second-tab'),
	];
	await flush();
	assert.equal(first.calls.length + second.calls.length, 1);
	await second.advance(833);
	assert.equal(second.calls.length, 0);
	await second.advance(1);
	await Promise.all(requests);
	assert.equal(first.calls[0].at, START);
	assert.equal(second.calls[0].at, START + 834);
	assert.equal(second.api.getGatewayRequestSnapshot().totalRequests, 2);
	assert.ok(lockCalls.length >= 3);
	assert.equal(new Set(lockCalls).size, 1, 'all reservations must use the same lock');
});

test('unavailable Web Locks fall back to working local request pacing', async () => {
	for (const name of ['SecurityError', 'NotSupportedError']) {
		const { api, context, calls, advance } = runtime();
		context.navigator = {
			locks: {
				async request() {
					throw new DOMException('Web Locks unavailable', name);
				},
			},
		};
		const requests = [api.gatewayFetch('https://arweave.net/one'), api.gatewayFetch('https://arweave.net/two')];
		await advance(833);
		assert.equal(calls.length, 1);
		await advance(1);
		assert.ok((await Promise.all(requests)).every((response) => response.status === 200));
		assert.equal(calls[1].at - calls[0].at, 834);
	}
});

test('legacy browser settings and storage events cannot override code configuration', () => {
	const key = 'portal:gateway-rate-limit:v1';
	const storage = new Map([[key, JSON.stringify({ ...DEFAULTS, 'rate-limit-requests': 90 })]]);
	const { api, dispatchStorage } = runtime(undefined, storage);
	assert.deepEqual(plain(api.getGatewayRateLimitConfig()), DEFAULTS);
	const config = { ...DEFAULTS, 'rate-limit-requests': 180 };
	api.setGatewayRateLimitConfig(config);
	dispatchStorage(key, storage.get(key));
	dispatchStorage(null, null);
	assert.deepEqual(plain(api.getGatewayRateLimitConfig()), config);
});

test('blocked browser storage still permits configuration changes and in-memory pacing', async () => {
	const { api, context, calls, advance } = runtime();
	context.localStorage = {
		getItem() {
			throw new DOMException('Storage denied', 'SecurityError');
		},
		setItem() {
			throw new DOMException('Storage denied', 'SecurityError');
		},
	};
	api.setGatewayRateLimitConfig(DEFAULTS);
	const requests = [api.gatewayFetch('https://arweave.net/one'), api.gatewayFetch('https://arweave.net/two')];
	await advance(833);
	assert.equal(calls.length, 1);
	await advance(1);
	await Promise.all(requests);
	assert.equal(api.getGatewayRequestSnapshot().totalRequests, 2);
});

test('a storage write failure cannot restore stale reservations or erase a new cooldown', async () => {
	const { api, context, calls, advance, storage } = runtime(
		(_, __, attempt) => new Response('', { status: attempt === 2 ? 429 : 200, headers: { 'Retry-After': '2' } })
	);
	await api.gatewayFetch('https://arweave.net/one');
	const persistedBeforeFailure = [...storage.entries()];
	context.localStorage.setItem = () => {
		throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
	};
	const retrying = api.gatewayFetch('https://arweave.net/two');
	await advance(834);
	assert.equal(api.getGatewayRequestSnapshot().totalRequests, 2);
	assert.equal(api.getGatewayRequestSnapshot().rateLimitResponses, 1);
	assert.ok(api.getGatewayRequestSnapshot().cooldownUntil >= START + 2834);
	const queued = api.gatewayFetch('https://arweave.net/three');
	await advance(2000);
	assert.equal(calls.length, 2, 'readable stale storage must not remove the failed-to-persist cooldown');
	await advance(3000);
	await Promise.all([retrying, queued]);
	assert.equal(calls.length, 4);
	assert.equal(api.getGatewayRequestSnapshot().totalRequests, 4);
	assert.equal(api.getGatewayRequestSnapshot().rateLimitResponses, 1);
	assert.deepEqual(
		[...storage.entries()],
		persistedBeforeFailure,
		'the assertion must exercise genuinely stale storage'
	);
});

test('active requests never exceed four and aborting a queued request does not send it', async () => {
	const releases = [];
	const { api, calls, advance } = runtime(() => new Promise((resolve) => releases.push(resolve)));
	const controller = new AbortController();
	const pending = Array.from({ length: 5 }, (_, i) => api.gatewayFetch(`https://arweave.net/${i}`));
	const cancelled = api.gatewayFetch('https://arweave.net/cancelled', { signal: controller.signal });
	const rejected = assert.rejects(cancelled, { name: 'AbortError' });
	await advance(10000);
	assert.equal(calls.length, 4);
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 4);
	controller.abort();
	await rejected;
	assert.equal(api.getGatewayRequestSnapshot().queuedRequests, 1);
	for (const release of releases.splice(0)) release(new Response('ok'));
	await flush();
	await advance(1000);
	assert.equal(calls.length, 5);
	for (const release of releases.splice(0)) release(new Response('ok'));
	await Promise.all(pending);
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 0);
	assert.equal(api.getGatewayRequestSnapshot().queuedRequests, 0);
});

test('a 429 pauses all gateway traffic, honors Retry-After, and publishes retry state until success', async () => {
	const { api, calls, advance } = runtime((_, __, attempt) =>
		attempt === 1 ? new Response('', { status: 429, headers: { 'Retry-After': '2' } }) : new Response('ok')
	);
	const snapshots = [];
	const unsubscribe = api.subscribeGatewayRequests(() => snapshots.push(plain(api.getGatewayRequestSnapshot())));
	const first = api.gatewayFetch('https://arweave.net/one');
	await flush();
	const second = api.gatewayFetch('https://arweave.net/two');
	await flush();
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 1);
	assert.equal(api.getGatewayRequestSnapshot().rateLimitResponses, 1);
	await advance(1999);
	assert.equal(calls.length, 1);
	await advance(4000);
	assert.equal((await first).status, 200);
	assert.equal((await second).status, 200);
	assert.ok(calls.slice(1).every(({ at }) => at >= START + 2000));
	assert.ok(snapshots.some(({ retryingRequests }) => retryingRequests === 1));
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 0);
	unsubscribe();
});

test('date Retry-After longer than the backoff cap survives configuration updates', async () => {
	const retryAt = START + 600000;
	const { api, calls, advance } = runtime((_, __, attempt) =>
		attempt === 1
			? new Response('', { status: 429, headers: { 'Retry-After': new Date(retryAt).toUTCString() } })
			: new Response('ok')
	);
	const request = api.gatewayFetch('https://arweave.net/data');
	await flush();
	api.setGatewayRateLimitConfig({ ...DEFAULTS, 'rate-limit-requests': 720 });
	assert.ok(api.getGatewayRequestSnapshot().cooldownUntil >= retryAt);
	await advance(599999);
	assert.equal(calls.length, 1);
	await advance(2000);
	assert.equal((await request).status, 200);
	assert.ok(calls[1].at >= retryAt);
});

test('missing Retry-After allows the full configured debt to recover and repeated 429s eventually succeed', async () => {
	const { api, calls, advance } = runtime((_, __, attempt) => new Response('', { status: attempt <= 8 ? 429 : 200 }));
	const request = api.gatewayFetch('https://arweave.net/data');
	await flush();
	await advance(80666);
	assert.equal(calls.length, 1, 'retry must wait for 121 tokens to refill at 1.5 tokens/second');
	await advance(3000000);
	assert.equal((await request).status, 200);
	assert.equal(calls.length, 9, '429 retries must not stop at an arbitrary attempt limit');
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 0);
	assert.equal(api.getGatewayRequestSnapshot().rateLimitResponses, 8);
});

test('POST requests replay an identical body after a 429', async () => {
	const bodies = [];
	const { api, advance } = runtime(async (input, init, attempt) => {
		bodies.push(await new Request(input, init).text());
		return new Response('', { status: attempt === 1 ? 429 : 200, headers: { 'Retry-After': '1' } });
	});
	const original = new Request('https://arweave.net/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: '{ transactions { edges { node { id } } } }' }),
	});
	const request = api.gatewayFetch(original);
	await advance(3000);
	assert.equal((await request).status, 200);
	assert.equal(bodies.length, 2);
	assert.equal(bodies[0], bodies[1]);
});

test('cancellation during retry rejects promptly and clears the retry notification', async () => {
	const { api, calls, advance } = runtime(() => new Response('', { status: 429 }));
	const controller = new AbortController();
	const request = api.gatewayFetch('https://arweave.net/data', { signal: controller.signal });
	const rejected = assert.rejects(request, { name: 'AbortError' });
	await flush();
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 1);
	controller.abort();
	await rejected;
	assert.equal(api.getGatewayRequestSnapshot().retryingRequests, 0);
	await advance(1000000);
	assert.equal(calls.length, 1);
});

test('cancellation reaches the active network request and releases its concurrency slot', async () => {
	let networkSignal;
	const { api } = runtime((input, init) => {
		networkSignal = init?.signal || input.signal;
		return new Promise((_, reject) =>
			networkSignal.addEventListener('abort', () => reject(networkSignal.reason), { once: true })
		);
	});
	const controller = new AbortController();
	const request = api.gatewayFetch(new Request('https://arweave.net/data', { signal: controller.signal }));
	const rejected = assert.rejects(request, { name: 'AbortError' });
	await flush();
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 1);
	controller.abort();
	await rejected;
	assert.ok(networkSignal.aborted);
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 0);
});

test('non-429 errors and unrelated origins are returned without automatic retry', async () => {
	for (const status of [400, 401, 404, 500, 503]) {
		const { api, calls, advance } = runtime(() => new Response('', { status }));
		assert.equal((await api.gatewayFetch('https://arweave.net/data')).status, status);
		await advance(1000000);
		assert.equal(calls.length, 1);
	}
	const offline = runtime(() => Promise.reject(new TypeError('Network unavailable')));
	await assert.rejects(offline.api.gatewayFetch('https://arweave.net/data'), /Network unavailable/);
	await offline.advance(1000000);
	assert.equal(offline.calls.length, 1);
	const unrelated = runtime(() => new Response('', { status: 429 }));
	assert.equal((await unrelated.api.gatewayFetch('https://example.com/data')).status, 429);
	assert.equal(unrelated.api.getGatewayRequestSnapshot().rateLimitResponses, 0);
});

test('fetch timeouts begin when the network attempt starts and abort the underlying request', async () => {
	const { api, calls, advance } = runtime((input, init, attempt) => {
		if (attempt === 1) return new Response('ok');
		const signal = init?.signal || input.signal;
		return new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
	});
	await api.gatewayFetch('https://arweave.net/one');
	const request = api.fetchGatewayWithTimeout('https://arweave.net/two', {}, 50);
	const rejected = assert.rejects(request);
	await advance(833);
	assert.equal(calls.length, 1, 'the queued request must survive longer than its network timeout');
	await advance(1);
	assert.equal(calls.length, 2);
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 1);
	await advance(50);
	await rejected;
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 0);
});

test('429 backoff does not consume an attempt timeout', async () => {
	const { api, calls, advance } = runtime(
		(_, __, attempt) => new Response('', { status: attempt === 1 ? 429 : 200, headers: { 'Retry-After': '1' } })
	);
	const request = api.fetchGatewayWithTimeout('https://arweave.net/data', {}, 50);
	await advance(3000);
	assert.equal((await request).status, 200);
	assert.equal(calls.length, 2);
	assert.ok(calls[1].at - calls[0].at > 50);
});

test('an attempt deadline aborts a stalled response body even after successful headers arrive', async () => {
	let networkSignal;
	const { api, calls, advance } = runtime((input, init) => {
		networkSignal = init?.signal || input.signal;
		return new Response(
			new ReadableStream({
				start(controller) {
					controller.enqueue(new TextEncoder().encode('{"pending":'));
					networkSignal.addEventListener('abort', () => controller.error(networkSignal.reason), { once: true });
				},
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	});
	const request = api.fetchGatewayWithTimeout('https://arweave.net/data', {}, 50);
	let settled = false;
	request.then(
		() => (settled = true),
		() => (settled = true)
	);
	const rejected = assert.rejects(request, { name: 'TimeoutError' });
	await advance(49);
	assert.equal(calls.length, 1);
	assert.equal(settled, false, 'receiving headers must not end the body deadline');
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 1);
	await advance(1);
	await rejected;
	assert.ok(networkSignal.aborted);
	assert.equal(api.getGatewayRequestSnapshot().activeRequests, 0);

	const original = Response.json({ complete: true }, { status: 201, headers: { 'X-Gateway': 'test' } });
	const successful = runtime(() => original);
	const response = await successful.api.fetchGatewayWithTimeout('https://arweave.net/complete', {}, 50);
	assert.equal(response, original, 'buffering must preserve the original Response and its metadata');
	assert.equal(response.bodyUsed, false);
	assert.equal(response.status, 201);
	assert.equal(response.headers.get('X-Gateway'), 'test');
	assert.deepEqual(await response.json(), { complete: true });
});
