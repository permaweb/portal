import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, test } from 'node:test';

import ts from 'typescript';

function stripTypeScriptTypes(source) {
	return ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
	}).outputText;
}

const requestsSource = stripTypeScriptTypes(
	await readFile(new URL('../src/helpers/basePortalRequests.ts', import.meta.url), 'utf8')
);
const requestsModuleUrl = `data:text/javascript;base64,${Buffer.from(requestsSource).toString('base64')}`;
const { withBaseReadLimit } = await import(requestsModuleUrl);

// Isolate browser storage configuration while exercising the actual request and retry code.
const source = await readFile(new URL('../src/helpers/pendingTransactions.ts', import.meta.url), 'utf8');
const moduleSource = stripTypeScriptTypes(
	source
		.replace("'./basePortalRequests'", JSON.stringify(requestsModuleUrl))
		.replace(
			"import { STORAGE } from './config';",
			'const STORAGE = { basePendingTransactions: (address) => `base-pending-transactions-${address}` };'
		)
);
const { getPendingTransactions, refreshPendingTransactions, trackPendingTransaction, trackObservedPendingTransaction } =
	await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);

const address = 'w'.repeat(43);
const portalId = 'p'.repeat(43);
const originalWindow = globalThis.window;
const originalStorage = globalThis.localStorage;

beforeEach(() => {
	const values = new Map();
	globalThis.localStorage = {
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value),
	};
	globalThis.window = Object.assign(new EventTarget(), { localStorage: globalThis.localStorage });
});

afterEach(() => {
	if (originalWindow === undefined) delete globalThis.window;
	else globalThis.window = originalWindow;
	if (originalStorage === undefined) delete globalThis.localStorage;
	else globalThis.localStorage = originalStorage;
});

function track(id) {
	trackPendingTransaction({ id, address, portalId, type: 'portal-media', createdAt: Date.now() });
}

function indexedResponse(ids) {
	return { ok: true, json: async () => ({ data: { transactions: { edges: ids.map((id) => ({ node: { id } })) } } }) };
}

test('an idle wallet makes no gateway requests', async (t) => {
	const fetch = t.mock.method(globalThis, 'fetch', () => assert.fail('Unexpected gateway request'));
	assert.deepEqual(await refreshPendingTransactions(address, portalId), []);
	assert.equal(fetch.mock.callCount(), 0);
});

test('concurrent refreshes share one index query and one availability check', async (t) => {
	const id = 'a'.repeat(43);
	track(id);
	let resolveIndex;
	const indexResponse = new Promise((resolve) => (resolveIndex = resolve));
	const fetch = t.mock.method(globalThis, 'fetch', async (url) =>
		url.endsWith('/graphql') ? indexResponse : { ok: true }
	);
	const requests = [
		refreshPendingTransactions(address, portalId),
		refreshPendingTransactions(address, portalId),
		refreshPendingTransactions(address, portalId),
	];
	assert.equal(fetch.mock.callCount(), 1);
	resolveIndex(indexedResponse([id]));
	assert.deepEqual(await Promise.all(requests), [[], [], []]);
	assert.equal(fetch.mock.callCount(), 2);
	assert.deepEqual(getPendingTransactions(address, portalId), []);
});

test('gateway failures back off without losing pending transactions and recover when due', async (t) => {
	let now = 1_000_000;
	t.mock.method(Date, 'now', () => now);
	const id = 'b'.repeat(43);
	track(id);
	let failing = true;
	const fetch = t.mock.method(globalThis, 'fetch', async (url) => {
		if (failing) return { ok: false, status: 429 };
		return url.endsWith('/graphql') ? indexedResponse([id]) : { ok: true };
	});
	let pending = await refreshPendingTransactions(address, portalId);
	assert.equal(pending[0].attempts, 1);
	assert.equal(pending[0].nextCheckAt, now + 10_000);
	await refreshPendingTransactions(address, portalId);
	assert.equal(fetch.mock.callCount(), 1);

	now += 10_000;
	pending = await refreshPendingTransactions(address, portalId);
	assert.equal(pending[0].attempts, 2);
	assert.equal(pending[0].nextCheckAt, now + 20_000);
	now += 10_000;
	await refreshPendingTransactions(address, portalId);
	assert.equal(fetch.mock.callCount(), 2);

	failing = false;
	now += 10_000;
	assert.deepEqual(await refreshPendingTransactions(address, portalId), []);
	assert.equal(fetch.mock.callCount(), 4);
});

test('transactions submitted during a pending check remain tracked and immediately eligible', async (t) => {
	const firstId = 'c'.repeat(43);
	const secondId = 'd'.repeat(43);
	track(firstId);
	let resolveIndex;
	const indexResponse = new Promise((resolve) => (resolveIndex = resolve));
	t.mock.method(globalThis, 'fetch', async () => indexResponse);
	const request = refreshPendingTransactions(address, portalId);
	track(secondId);
	resolveIndex(indexedResponse([]));
	const pending = await request;
	assert.equal(pending.length, 2);
	assert.equal(pending.find((entry) => entry.id === firstId).attempts, 1);
	assert.equal(pending.find((entry) => entry.id === secondId).attempts, 0);
	assert.ok(pending.find((entry) => entry.id === secondId).nextCheckAt <= Date.now());
});

test('an indexed portal payload stays pending until its type and portal match', async (t) => {
	let now = 2_000_000;
	t.mock.method(Date, 'now', () => now);
	const id = 'e'.repeat(43);
	trackPendingTransaction({ id, address, portalId, type: 'portal-release', createdAt: now });
	let payloadPortalId = 'x'.repeat(43);
	t.mock.method(globalThis, 'fetch', async (url) =>
		url.endsWith('/graphql')
			? indexedResponse([id])
			: { ok: true, json: async () => ({ mode: 'base', type: 'portal-release', portalId: payloadPortalId }) }
	);
	assert.equal((await refreshPendingTransactions(address, portalId)).length, 1);
	payloadPortalId = portalId;
	now += 10_000;
	assert.deepEqual(await refreshPendingTransactions(address, portalId), []);
});

test('pending transaction checks share the foreground gateway concurrency budget', async (t) => {
	const ids = Array.from({ length: 12 }, (_, index) => String.fromCharCode(65 + index).repeat(43));
	ids.forEach(track);
	let active = 0;
	let maximum = 0;
	t.mock.method(globalThis, 'fetch', async (url, options) => {
		active += 1;
		maximum = Math.max(maximum, active);
		await new Promise((resolve) => setTimeout(resolve, 1));
		active -= 1;
		return url.endsWith('/graphql') ? indexedResponse(JSON.parse(options.body).variables.ids) : { ok: true };
	});
	const pending = refreshPendingTransactions(address, portalId);
	const foreground = Array.from({ length: 24 }, (_, index) =>
		withBaseReadLimit(() => fetch(`https://arweave.net/foreground-${index}`))
	);
	await Promise.all([pending, ...foreground]);
	assert.equal(maximum, 16);
	assert.deepEqual(await pending, []);
});

test('shared refresh callers recover consistently when browser storage becomes unwritable', async (t) => {
	track('f'.repeat(43));
	let resolveIndex;
	const indexResponse = new Promise((resolve) => (resolveIndex = resolve));
	t.mock.method(globalThis, 'fetch', async () => indexResponse);
	const requests = [refreshPendingTransactions(address, portalId), refreshPendingTransactions(address, portalId)];
	t.mock.method(globalThis.localStorage, 'setItem', () => {
		throw new Error('Storage unavailable');
	});
	resolveIndex(indexedResponse([]));
	const results = await Promise.all(requests);
	assert.equal(results[0].length, 1);
	assert.deepEqual(results[0], results[1]);
});

for (const failure of ['access', 'write']) {
	test(`pending transaction tracking tolerates browser storage ${failure} failure`, (t) => {
		if (failure === 'access')
			Object.defineProperty(window, 'localStorage', {
				get() {
					throw new Error('SecurityError');
				},
			});
		else
			t.mock.method(localStorage, 'setItem', () => {
				throw new Error('QuotaExceededError');
			});
		assert.doesNotThrow(() => track('g'.repeat(43)));
		assert.doesNotThrow(() =>
			trackObservedPendingTransaction({
				id: 'h'.repeat(43),
				portalId,
				type: 'portal-release',
				createdAt: Date.now(),
			})
		);
	});
}
