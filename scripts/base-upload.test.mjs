import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const source = readFileSync(new URL('../src/helpers/upload.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const require = createRequire(import.meta.url);
const node = 'https://up.arweave.net';
const id = 'a'.repeat(43);
const signedBytes = [1, 0, 7, 255];
const wallet = { signDataItem: async () => signedBytes };

function loadUploader(fetch) {
	const exports = {};
	vm.runInNewContext(compiled, {
		exports,
		require: (name) => (name === './config' ? { UPLOAD: { node1: node } } : require(name)),
		crypto: webcrypto,
		btoa,
		TextEncoder,
		fetch,
	});
	return exports.uploadDataItem;
}

test('sends the wallet-signed bytes as the HyperBEAM bundler subject and reads its receipt header', async (t) => {
	const fetch = t.mock.fn(async (url, request) => {
		assert.equal(url, `${node}/~bundler@1.0/tx`);
		assert.equal(request.method, 'POST');
		assert.equal(request.headers['Content-Type'], 'application/ans104');
		assert.equal(request.headers['bundler-subject'], 'body');
		assert.deepEqual(Array.from(new Uint8Array(request.body)), signedBytes);
		return new Response('{}', { headers: { id } });
	});
	assert.equal(await loadUploader(fetch)(wallet, 'post', []), id);
	assert.equal(fetch.mock.callCount(), 1);
});

test('accepts the bundler JSON receipt when no receipt header is present', async () => {
	const upload = loadUploader(async () => new Response(JSON.stringify({ body: { id } })));
	assert.equal(await upload(wallet, 'post', []), id);
});

test('surfaces the bundler rejection without attempting a second upload', async (t) => {
	const fetch = t.mock.fn(async () => new Response('unsigned-item', { status: 400 }));
	await assert.rejects(loadUploader(fetch)(wallet, 'post', []), /Arweave upload failed: 400 unsigned-item/);
	assert.equal(fetch.mock.callCount(), 1);
});
