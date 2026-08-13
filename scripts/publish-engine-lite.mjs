#!/usr/bin/env node

import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { ArweaveSigner, createData } from '@dha-team/arbundles';
import { ReferenceClient, fromJwk } from '@permaweb/references';
import Arweave from 'arweave';

const BUNDLE_PATH = path.resolve('dist/engine-lite/bundle.js');
const DEPLOYMENT_PATH = path.resolve('deployments/engine-lite.json');
const UPLOAD_URL = 'https://up.arweave.net/tx/arweave';
const FREE_UPLOAD_LIMIT = 100 * 1000;
const ARWEAVE_ID = /^[A-Za-z0-9_-]{43}$/;

function argument(name) {
	const index = process.argv.indexOf(`--${name}`);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

function anchor() {
	return randomBytes(32).toString('base64url').slice(0, 32);
}

async function uploadDataItem(jwk, data, tags) {
	const signer = new ArweaveSigner(jwk);
	const dataItem = createData(data, signer, { tags, anchor: anchor() });
	await dataItem.sign(signer);

	const response = await fetch(UPLOAD_URL, {
		method: 'POST',
		headers: { accept: 'application/json', 'content-type': 'application/octet-stream' },
		body: dataItem.getRaw(),
	});
	const responseText = await response.text();
	if (!response.ok) {
		throw new Error(`Arweave upload failed: ${response.status}${responseText ? ` ${responseText}` : ''}`);
	}

	let responseId;
	try {
		const payload = JSON.parse(responseText);
		responseId = typeof payload === 'string' ? payload : payload?.id;
	} catch {
		responseId = responseText.trim();
	}
	const transactionId = responseId || dataItem.id;
	if (!ARWEAVE_ID.test(transactionId || '')) throw new Error('Arweave upload returned an invalid transaction ID');
	return transactionId;
}

async function uploadL1Transaction(jwk, data, tags) {
	const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });
	const transaction = await arweave.createTransaction({ data }, jwk);
	for (const tag of tags) transaction.addTag(tag.name, tag.value);
	await arweave.transactions.sign(transaction, jwk);
	const response = await arweave.transactions.post(transaction);
	if (response.status !== 200 && response.status !== 202) {
		throw new Error(`Arweave L1 upload failed: ${response.status} ${response.statusText || ''}`.trim());
	}
	if (!ARWEAVE_ID.test(transaction.id || '')) throw new Error('Arweave L1 upload returned an invalid transaction ID');
	return transaction.id;
}

async function uploadPayload(jwk, data, tags) {
	const bytes = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
	return bytes.byteLength <= FREE_UPLOAD_LIMIT
		? uploadDataItem(jwk, bytes, tags)
		: uploadL1Transaction(jwk, bytes, tags);
}

async function uploadBundle(jwk) {
	return uploadPayload(jwk, await fs.readFile(BUNDLE_PATH), [
		{ name: 'Content-Type', value: 'application/javascript' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: '1.0.0' },
		{ name: 'Type', value: 'portal-engine' },
		{ name: 'Engine', value: 'lite' },
	]);
}

async function readDeployment() {
	try {
		return JSON.parse(await fs.readFile(DEPLOYMENT_PATH, 'utf8'));
	} catch {
		return null;
	}
}

async function main() {
	const walletPath = argument('wallet') || process.env.ENGINE_LITE_WALLET || process.env.PATH_TO_WALLET;
	if (!walletPath) throw new Error('Pass --wallet <jwk-path> or set ENGINE_LITE_WALLET.');

	const jwk = JSON.parse(await fs.readFile(path.resolve(walletPath), 'utf8'));
	const jwkSigner = fromJwk(jwk);
	const client = new ReferenceClient({
		signer: {
			address: () => jwkSigner.address(),
			send: ({ tags, data }) => uploadPayload(jwk, data || ' ', tags).then((id) => ({ id })),
		},
	});
	const deployment = await readDeployment();
	const createNewReference = process.argv.includes('--new-reference');
	const existingReference = createNewReference
		? undefined
		: argument('reference') || process.env.ENGINE_LITE_REFERENCE_ID || deployment?.referenceId;

	if (existingReference) {
		const current = await client.getReference(existingReference);
		if (!current) throw new Error(`Engine reference is not indexed: ${existingReference}`);
		if (current.authority !== (await jwkSigner.address())) {
			throw new Error(`Publishing wallet is not the engine reference authority: ${existingReference}`);
		}
	}

	const transactionId = await uploadBundle(jwk);

	let referenceId = existingReference;
	if (existingReference) {
		await client.updateReference(existingReference, { value: transactionId });
	} else {
		({ referenceId } = await client.createReference({ value: transactionId }));
	}

	const publishedAt = new Date().toISOString();
	await fs.mkdir(path.dirname(DEPLOYMENT_PATH), { recursive: true });
	await fs.writeFile(
		DEPLOYMENT_PATH,
		`${JSON.stringify(
			{
				device: 'reference@1.0',
				referenceId,
				value: transactionId,
				publishedAt,
			},
			null,
			'\t'
		)}\n`
	);

	process.stdout.write(
		`${JSON.stringify(
			{
				referenceId,
				transactionId,
				publishedAt,
				updated: Boolean(existingReference),
			},
			null,
			2
		)}\n`
	);
}

main().catch((error) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
