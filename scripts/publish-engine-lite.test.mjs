import assert from 'node:assert/strict';
import { generateKeyPair } from 'node:crypto';
import { before, describe, it } from 'node:test';
import { promisify } from 'node:util';

import { DataItem } from '@dha-team/arbundles';
import { buildInit, buildSet } from '@permaweb/references';

import { uploadDataItem } from './publish-engine-lite.mjs';

const REFERENCE_ID = 'r'.repeat(43);
const VALUE_ID = 'v'.repeat(43);
const TIMESTAMP = 1791547200000;
let jwk;

before(async () => {
	const { privateKey } = await promisify(generateKeyPair)('rsa', { modulusLength: 4096 });
	jwk = privateKey.export({ format: 'jwk' });
});

describe('engine-lite data-item uploads', () => {
	for (const [operation, tags] of [
		['create', buildInit({ authority: 'a'.repeat(43), value: VALUE_ID, timestamp: TIMESTAMP }).tags],
		['update', buildSet({ referenceId: REFERENCE_ID, value: VALUE_ID, timestamp: TIMESTAMP }).tags],
	]) {
		it(`signs reference ${operation} uploads with an anchor tag while preserving their payload`, async (t) => {
			const originalTags = tags.map((tag) => ({ ...tag }));
			Object.freeze(tags);
			let uploadedItem;
			const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
				assert.equal(url, 'https://up.arweave.net/tx/arweave');
				assert.equal(options.method, 'POST');
				assert.equal(options.headers['content-type'], 'application/octet-stream');
				uploadedItem = new DataItem(Buffer.from(options.body));
				assert.equal(await uploadedItem.isValid(), true);
				assert.equal(uploadedItem.rawData.toString(), ' ');
				assert.equal(uploadedItem.rawAnchor.length, 32);
				assert.deepEqual(uploadedItem.tags.slice(0, originalTags.length), originalTags);
				const anchorTags = uploadedItem.tags.filter((tag) => tag.name === 'anchor');
				assert.equal(anchorTags.length, 1);
				assert.equal(new Date(anchorTags[0].value).toISOString(), anchorTags[0].value);
				return new Response(JSON.stringify({ id: uploadedItem.id }));
			});

			const id = await uploadDataItem(jwk, Buffer.from(' '), tags);
			assert.equal(id, uploadedItem.id);
			assert.equal(fetchMock.mock.callCount(), 1);
			assert.deepEqual(tags, originalTags);
		});
	}

	it('preserves an existing anchor tag without duplicating it', async (t) => {
		const tags = [
			...buildSet({ referenceId: REFERENCE_ID, value: VALUE_ID, timestamp: TIMESTAMP }).tags,
			{ name: 'anchor', value: 'caller-provided-anchor' },
		];
		t.mock.method(globalThis, 'fetch', async (_url, options) => {
			const item = new DataItem(Buffer.from(options.body));
			assert.equal(await item.isValid(), true);
			assert.deepEqual(item.tags, tags);
			return new Response(JSON.stringify({ id: item.id }));
		});

		await uploadDataItem(jwk, Buffer.from(' '), tags);
	});

	it('reports bundler rejection details without retrying a signed upload', async (t) => {
		const detail = '{"details":"signature-verification-failed","error":"invalid-item","status":400}';
		const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(detail, { status: 400 }));

		await assert.rejects(
			uploadDataItem(
				jwk,
				Buffer.from(' '),
				buildSet({ referenceId: REFERENCE_ID, value: VALUE_ID, timestamp: TIMESTAMP }).tags
			),
			{ message: `Arweave upload failed: 400 ${detail}` }
		);
		assert.equal(fetchMock.mock.callCount(), 1);
	});
});
