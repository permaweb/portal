import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const DEPLOYMENT = {
	name: 'portal',
	process: 'g57GjqisIQd82weoLTJxi26_eD7p1iq8WfNkLmwKhfM',
	gateway: 'https://arweave.net',
	readTimeoutMs: 15_000,
};
const TRANSACTION = 'xpc-X3-xI9mZOmKsx-YCB-Eyy6sxe2PsqgnV-4vPNzE';
const compiled = ts.transpileModule(readFileSync(new URL('../src/api/deployment/index.ts', import.meta.url), 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function state(overrides = {}) {
	return { device: 'process@1.0', 'execution-device': 'carrier@1.0', name: 'portal', value: TRANSACTION, ...overrides };
}

function fixture(fetch, options = {}) {
	const exports = {};
	vm.runInNewContext(compiled, {
		exports,
		fetch,
		AbortController,
		DOMException,
		URL,
		setTimeout,
		clearTimeout,
		require(name) {
			if (name === 'helpers/config') return { APP_DEPLOYMENT: { ...DEPLOYMENT, ...options } };
			if (name === 'helpers/utils') return { checkValidAddress: (value) => /^[a-z0-9_-]{43}$/i.test(value ?? '') };
			throw new Error(`Unexpected import: ${name}`);
		},
	});
	return exports;
}

test('reads the current Portal carrier target and shares the result across footer mounts', async () => {
	const calls = [];
	const api = fixture(async (url, options) => {
		calls.push({ url, options });
		return Response.json(state());
	});
	assert.equal(api.peekDeployedTransaction(), null);
	const [first, second] = await Promise.all([api.getDeployedTransaction(), api.getDeployedTransaction()]);
	assert.equal(first.transactionId, TRANSACTION);
	assert.equal(second, first);
	assert.equal(await api.getDeployedTransaction(), first);
	assert.equal(api.peekDeployedTransaction(), first);
	assert.equal(calls.length, 1);
	const url = new URL(calls[0].url);
	assert.equal(url.origin, DEPLOYMENT.gateway);
	assert.equal(url.pathname, `/${DEPLOYMENT.process}~process@1.0/now`);
	assert.equal(url.searchParams.get('require-codec'), 'application/json');
	assert.equal(url.searchParams.get('accept-bundle'), 'true');
});

test('accepts carried targets and reference-value payloads without displaying the reference ID', async () => {
	for (const value of [
		{ target: TRANSACTION, 'reference-value': DEPLOYMENT.process },
		{ 'reference-value': TRANSACTION },
		` ${TRANSACTION} `,
	]) {
		const api = fixture(async () => Response.json(state({ value })));
		assert.equal((await api.getDeployedTransaction()).transactionId, TRANSACTION);
	}
});

test('rejects malformed targets, wrong names, and unrelated processes', async () => {
	for (const body of [
		null,
		[],
		state({ name: 'lunar' }),
		state({ 'execution-device': 'lua@5.3a' }),
		...[null, {}, 42, 'not-an-id', 'x'.repeat(42), '!'.repeat(43)].map((value) => state({ value })),
	]) {
		const api = fixture(async () => Response.json(body));
		await assert.rejects(api.getDeployedTransaction());
		assert.equal(api.peekDeployedTransaction(), null);
	}
});

test('failed HTTP, network, and JSON reads can be retried on the next mount', async () => {
	for (const fail of [
		() => new Response('Unavailable', { status: 503 }),
		() => new Response('<html>not JSON</html>'),
		() => {
			throw new TypeError('Network unavailable');
		},
	]) {
		let calls = 0;
		const api = fixture(async () => (++calls === 1 ? fail() : Response.json(state())));
		await assert.rejects(api.getDeployedTransaction());
		assert.equal(api.peekDeployedTransaction(), null);
		assert.equal((await api.getDeployedTransaction()).transactionId, TRANSACTION);
		assert.equal(calls, 2);
	}
});

test('unmount cancellation does not interrupt the shared request for the next footer', async () => {
	let finish;
	const api = fixture(() => new Promise((resolve) => (finish = resolve)));
	const controller = new AbortController();
	const cancelled = api.getDeployedTransaction({ signal: controller.signal });
	const active = api.getDeployedTransaction();
	controller.abort();
	await assert.rejects(cancelled, { name: 'AbortError' });
	finish(Response.json(state()));
	assert.equal((await active).transactionId, TRANSACTION);
});

test('a lookup that has already been cancelled never starts a request', async () => {
	let calls = 0;
	const api = fixture(async () => {
		calls++;
		return Response.json(state());
	});
	const controller = new AbortController();
	controller.abort();
	await assert.rejects(api.getDeployedTransaction({ signal: controller.signal }), { name: 'AbortError' });
	assert.equal(calls, 0);
});

test('slow deployment lookups have a bounded timeout', async () => {
	const api = fixture(
		(_url, { signal }) =>
			new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason))),
		{ readTimeoutMs: 5 }
	);
	await assert.rejects(api.getDeployedTransaction(), { name: 'AbortError' });
});
