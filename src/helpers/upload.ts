import { ArconnectSigner, createData } from '@dha-team/arbundles';

import Arweave from 'arweave';

import { FALLBACK_GATEWAY, UPLOAD } from './config';

type ArweaveTag = { name: string; value: string };

const ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;
const HTTP_URL = /^https?:\/\//;

function toUint8Array(value: string | ArrayBuffer | Uint8Array): Uint8Array {
	if (typeof value === 'string') return new TextEncoder().encode(value);
	if (value instanceof Uint8Array) return value;
	return new Uint8Array(value);
}

function normalizeSignedDataItem(value: any): Uint8Array {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	if (Array.isArray(value)) return new Uint8Array(value);
	if (value && typeof value === 'object') return new Uint8Array(Object.values(value).map(Number));
	throw new Error('The wallet returned an invalid signed data item');
}

function createAnchor() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	let binary = '';
	bytes.forEach((byte) => {
		binary += String.fromCharCode(byte);
	});
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 32);
}

function toRequestBody(value: Uint8Array): ArrayBuffer {
	const body = new Uint8Array(value.byteLength);
	body.set(value);
	return body.buffer;
}

async function signDataItem(wallet: any, data: Uint8Array, tags: ArweaveTag[]) {
	const anchor = createAnchor();
	if (typeof wallet.signDataItem === 'function') {
		return { raw: normalizeSignedDataItem(await wallet.signDataItem({ data, tags, anchor })), id: null };
	}

	if (typeof wallet.signature !== 'function' || typeof wallet.getActivePublicKey !== 'function') {
		throw new Error('The connected wallet cannot sign Arweave data items');
	}

	const signer = new ArconnectSigner(wallet);
	await signer.setPublicKey();
	const dataItem = createData(data, signer, { tags, anchor });
	await dataItem.sign(signer);
	return { raw: new Uint8Array(dataItem.getRaw()), id: dataItem.id };
}

export async function uploadDataItem(
	wallet: any,
	data: string | ArrayBuffer | Uint8Array,
	tags: ArweaveTag[]
): Promise<string> {
	if (!wallet) throw new Error('Connect a wallet to save to Arweave');

	const signed = await signDataItem(wallet, toUint8Array(data), tags);
	const response = await fetch(`${UPLOAD.node1}/tx/arweave`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/octet-stream',
		},
		body: toRequestBody(signed.raw),
	});
	const responseText = await response.text();
	if (!response.ok)
		throw new Error(`Arweave upload failed: ${response.status}${responseText ? ` ${responseText}` : ''}`);

	let responseId: string | null = null;
	try {
		const payload = JSON.parse(responseText);
		responseId = typeof payload === 'string' ? payload : payload?.id || null;
	} catch {
		responseId = responseText;
	}

	const transactionId = responseId || signed.id;
	if (!transactionId || !ARWEAVE_ID.test(transactionId)) {
		throw new Error('Arweave upload did not return a valid transaction ID');
	}
	return transactionId;
}

async function uploadL1Transaction(
	wallet: any,
	data: string | ArrayBuffer | Uint8Array,
	tags: ArweaveTag[]
): Promise<string> {
	const arweave = Arweave.init({ host: FALLBACK_GATEWAY, port: 443, protocol: 'https' });
	const transaction = await arweave.createTransaction({ data: toUint8Array(data) });
	tags.forEach((tag) => transaction.addTag(tag.name, tag.value));

	let signedTransaction = transaction;
	if (typeof wallet.sign === 'function') {
		signedTransaction = (await wallet.sign(transaction)) || transaction;
	} else {
		await arweave.transactions.sign(transaction);
	}

	const response = await arweave.transactions.post(signedTransaction);
	if (response.status !== 200 && response.status !== 202) {
		throw new Error(`Arweave L1 upload failed: ${response.status} ${response.statusText || ''}`.trim());
	}

	const transactionId = signedTransaction.id || transaction.id;
	if (!transactionId || !ARWEAVE_ID.test(transactionId)) {
		throw new Error('Arweave L1 upload did not return a valid transaction ID');
	}
	if (typeof window !== 'undefined') window.dispatchEvent(new Event('arweaveBalanceChanged'));
	return transactionId;
}

export async function uploadTransaction(
	wallet: any,
	data: string | ArrayBuffer | Uint8Array,
	tags: ArweaveTag[]
): Promise<string> {
	if (!wallet) throw new Error('Connect a wallet to save to Arweave');
	const bytes = toUint8Array(data);
	return bytes.byteLength <= UPLOAD.freeUploadLimit
		? uploadDataItem(wallet, bytes, tags)
		: uploadL1Transaction(wallet, bytes, tags);
}

async function resolveUploadData(value: any): Promise<{
	data: ArrayBuffer | Uint8Array;
	contentType: string;
}> {
	if (value instanceof File || value instanceof Blob) {
		return { data: await value.arrayBuffer(), contentType: value.type || 'application/octet-stream' };
	}
	if (typeof value === 'string' && value.startsWith('data:')) {
		const response = await fetch(value);
		const blob = await response.blob();
		return { data: await blob.arrayBuffer(), contentType: blob.type || 'application/octet-stream' };
	}
	if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
		return { data: value, contentType: 'application/octet-stream' };
	}
	throw new Error('Unsupported upload data');
}

export async function resolveUploadTransaction(
	wallet: any,
	value: any,
	args?: { tags?: ArweaveTag[] }
): Promise<string> {
	if (typeof value === 'string' && (ARWEAVE_ID.test(value) || HTTP_URL.test(value))) return value;
	const upload = await resolveUploadData(value);
	const tags = [...(args?.tags || [])];
	if (!tags.some((tag) => tag.name.toLowerCase() === 'content-type')) {
		tags.unshift({ name: 'Content-Type', value: upload.contentType });
	}
	return uploadTransaction(wallet, upload.data, tags);
}
