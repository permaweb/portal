import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const compiled = ts.transpileModule(readFileSync(new URL('../src/helpers/gatewayAssets.ts', import.meta.url), 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture(fetch) {
	const exports = {};
	vm.runInNewContext(compiled, {
		exports,
		fetch,
		AbortController,
		URL,
		window: { location: { href: 'https://portal.arweave.net/' } },
	});
	return exports;
}

test('only gateway HTTP assets are managed, including relative paths on Portal', () => {
	const { isGatewayAsset } = fixture();
	assert.equal(isGatewayAsset('https://arweave.net/icon'), true);
	assert.equal(isGatewayAsset('https://sub.arweave.net/icon'), true);
	assert.equal(isGatewayAsset('/icon'), true);
	assert.equal(isGatewayAsset('https://arweave.net.attacker.test/icon'), false);
	assert.equal(isGatewayAsset('blob:https://arweave.net/icon'), false);
	assert.equal(isGatewayAsset('data:image/svg+xml,test'), false);
});

test('mounted icons share one fetch, and later mounts reuse cached bytes', async () => {
	let calls = 0;
	const { acquireGatewayAsset } = fixture(async () => {
		calls += 1;
		return new Response('<svg/>', { headers: { 'Content-Type': 'image/svg+xml' } });
	});
	const first = acquireGatewayAsset('https://arweave.net/icon');
	const second = acquireGatewayAsset('https://arweave.net/icon');
	assert.equal(first.promise, second.promise);
	assert.equal(await (await first.promise).text(), '<svg/>');
	first.release();
	second.release();
	const cached = acquireGatewayAsset('https://arweave.net/icon');
	assert.equal(await (await cached.promise).text(), '<svg/>');
	assert.equal(calls, 1);
	cached.release();
});

test('a pending icon fetch is cancelled only when its last consumer unmounts', async () => {
	let signal;
	const { acquireGatewayAsset } = fixture((_source, options) => {
		signal = options.signal;
		return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
	});
	const first = acquireGatewayAsset('https://arweave.net/pending');
	const second = acquireGatewayAsset('https://arweave.net/pending');
	await Promise.resolve();
	first.release();
	assert.equal(signal.aborted, false);
	second.release();
	assert.equal(signal.aborted, true);
	await assert.rejects(first.promise, { name: 'AbortError' });
});

test('failed and cancelled requests do not poison the shared cache', async () => {
	let calls = 0;
	const { acquireGatewayAsset } = fixture(async () => {
		calls += 1;
		return calls === 1 ? new Response('missing', { status: 404 }) : new Response('<svg/>');
	});
	const failed = acquireGatewayAsset('https://arweave.net/missing');
	await assert.rejects(failed.promise, /404/);
	failed.release();
	const next = acquireGatewayAsset('https://arweave.net/missing');
	assert.equal(await (await next.promise).text(), '<svg/>');
	assert.equal(calls, 2);
	next.release();
});

test('credentialed assets have a separate cache and old unused entries are evicted', async () => {
	const calls = [];
	const { acquireGatewayAsset } = fixture(async (source, options) => {
		calls.push([source, options.credentials]);
		return new Response('<svg/>');
	});
	for (let i = 0; i < 129; i += 1) {
		const asset = acquireGatewayAsset(`https://arweave.net/${i}`);
		await asset.promise;
		asset.release();
	}
	const evicted = acquireGatewayAsset('https://arweave.net/0');
	await evicted.promise;
	evicted.release();
	const credentialed = acquireGatewayAsset('https://arweave.net/0', true);
	await credentialed.promise;
	credentialed.release();
	assert.equal(calls.length, 131);
	assert.deepEqual(calls.at(-1), ['https://arweave.net/0', 'include']);
});
