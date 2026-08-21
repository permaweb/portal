import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { strFromU8, unzipSync } from 'fflate';

import { buildPortalPost, loadWallet, resolvePostCategories, uploadDataItem } from './import-arweave-posts.mjs';
import { resolvePortalState } from './resolve-base-portal.mjs';

const ADDRESS = /^[A-Za-z0-9_-]{43}$/;
const PORTAL_SCHEMA_VERSION = '2.1.0';
const DEFAULT_GATEWAY = 'https://arweave.net';
const DEFAULT_UPLOAD_NODE = 'https://up.arweave.net';
const DEFAULT_TAG = 'AO';

function usage() {
	return `Usage:
  npm run import-docx-post -- \\
    --docx <file.docx> \\
    --portal <base-portal-id> \\
    --wallet <jwk-file> [--tag AO] [--yes]

The DOCX must begin with title, date, desc, and category metadata.
The post is always created as a draft. Without --yes, this command is a dry run.`;
}

export function parseArgs(argv) {
	const options = {
		docxPath: '',
		portalId: '',
		walletPath: '',
		tags: [],
		gateway: DEFAULT_GATEWAY,
		uploadNode: DEFAULT_UPLOAD_NODE,
		receiptPath: '',
		publish: false,
		help: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		const nextValue = () => {
			const value = argv[index + 1];
			if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
			index += 1;
			return value;
		};
		switch (argument) {
			case '--docx':
				options.docxPath = nextValue();
				break;
			case '--portal':
				options.portalId = nextValue();
				break;
			case '--wallet':
				options.walletPath = nextValue();
				break;
			case '--tag':
				options.tags.push(nextValue());
				break;
			case '--gateway':
				options.gateway = nextValue();
				break;
			case '--upload-node':
				options.uploadNode = nextValue();
				break;
			case '--receipt':
				options.receiptPath = nextValue();
				break;
			case '--yes':
				options.publish = true;
				break;
			case '--help':
			case '-h':
				options.help = true;
				break;
			default:
				throw new Error(`Unknown argument: ${argument}`);
		}
	}

	options.tags = [...new Set((options.tags.length ? options.tags : [DEFAULT_TAG]).map((tag) => tag.trim()))].filter(
		Boolean
	);
	options.gateway = options.gateway.replace(/\/+$/, '');
	options.uploadNode = options.uploadNode.replace(/\/+$/, '');
	return options;
}

function decodeXml(value) {
	return value
		.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
		.replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, '&');
}

export function extractDocxParagraphs(bytes) {
	const archive = unzipSync(new Uint8Array(bytes));
	const documentBytes = archive['word/document.xml'];
	if (!documentBytes) throw new Error('The DOCX does not contain word/document.xml');
	const xml = strFromU8(documentBytes);
	const paragraphs = [];
	for (const paragraphMatch of xml.matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)) {
		const paragraphXml = paragraphMatch[1].replace(/<w:del\b[\s\S]*?<\/w:del>/g, '');
		let text = '';
		for (const token of paragraphXml.matchAll(
			/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab(?:\s[^>]*)?\/>|<w:br(?:\s[^>]*)?\/>/g
		)) {
			if (token[1] !== undefined) text += decodeXml(token[1]);
			else if (token[0].startsWith('<w:tab')) text += '\t';
			else text += '\n';
		}
		paragraphs.push(text);
	}
	return paragraphs;
}

function unquote(value) {
	const trimmed = value.trim();
	if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
		try {
			return JSON.parse(trimmed);
		} catch {}
	}
	if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1);
	return trimmed;
}

export function slugify(value) {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function normalizeDraftPlaceholders(value) {
	return value.replace(/\]\(<([^>]+)>\)/g, ']($1)').replace(/<([^<>\n]+)>/g, (_, label) => {
		const readableLabel = label.replace(/[“”"]/g, '').replace(/_+/g, ' ').trim();
		return `[Placeholder: ${readableLabel}]`;
	});
}

export function parsePostDocument(paragraphs) {
	const start = paragraphs.findIndex((paragraph) => paragraph.trim() === '---');
	if (start < 0) throw new Error('The DOCX is missing its opening metadata marker');
	const metadata = {};
	let bodyStart = -1;
	for (let index = start + 1; index < paragraphs.length; index += 1) {
		const line = paragraphs[index].trim();
		if (line === '---' || line === '—') {
			bodyStart = index + 1;
			break;
		}
		if (!line) continue;
		const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
		if (!match) throw new Error(`Invalid DOCX metadata line: ${line}`);
		metadata[match[1].toLowerCase()] = unquote(match[2]);
	}
	if (bodyStart < 0) throw new Error('The DOCX is missing its closing metadata marker');
	for (const key of ['title', 'date', 'desc', 'category']) {
		if (!metadata[key]) throw new Error(`The DOCX metadata is missing ${key}`);
	}
	const markdown = paragraphs
		.slice(bodyStart)
		.map((paragraph) => normalizeDraftPlaceholders(paragraph.trim()))
		.filter(Boolean)
		.join('\n\n');
	if (!markdown) throw new Error('The DOCX does not contain an article body');
	return {
		metadata,
		markdown,
		slug: slugify(metadata.title),
	};
}

function portalTopicValues(topics) {
	return (topics || [])
		.map((topic) => (typeof topic === 'string' ? topic : topic?.value))
		.filter((topic) => typeof topic === 'string');
}

function assertAddress(value, label) {
	if (!ADDRESS.test(value || '')) throw new Error(`${label} is not a valid Arweave ID`);
}

function postPayload(portalId, post, createdAt) {
	return {
		schemaVersion: PORTAL_SCHEMA_VERSION,
		type: 'portal-post',
		mode: 'base',
		portalId,
		previousTxId: null,
		createdAt,
		post,
	};
}

function postTags(portalId, walletAddress, documentHash, documentName) {
	return [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: PORTAL_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-post' },
		{ name: 'Portal-Id', value: portalId },
		{ name: 'Author', value: walletAddress },
		{ name: 'Import-Operation', value: 'docx-draft' },
		{ name: 'Source-Document-Hash', value: documentHash },
		{ name: 'Source-Document-Name', value: documentName },
	];
}

function releasePayload(portal, walletAddress, postTxId) {
	return {
		schemaVersion: PORTAL_SCHEMA_VERSION,
		type: 'portal-release',
		mode: 'base',
		portalId: portal.portalId,
		rootTxId: portal.rootTxId,
		previousTxId: portal.headTxId,
		generatedAt: new Date().toISOString(),
		authorAddress: walletAddress,
		changes: {
			posts: {
				upsert: { [postTxId]: postTxId },
				order: [...portal.posts.map((post) => post.id), postTxId],
			},
		},
	};
}

function releaseTags(portal, walletAddress, documentHash) {
	return [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: PORTAL_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-release' },
		{ name: 'Portal-Id', value: portal.portalId },
		{ name: 'Portal-Root', value: portal.rootTxId },
		{ name: 'Previous-Tx', value: portal.headTxId },
		{ name: 'Author', value: walletAddress },
		{ name: 'Import-Operation', value: 'docx-draft' },
		{ name: 'Source-Document-Hash', value: documentHash },
	];
}

async function loadReceipt(receiptPath, expected) {
	try {
		const receipt = JSON.parse(await fs.readFile(receiptPath, 'utf8'));
		if (
			receipt.portalId !== expected.portalId ||
			receipt.documentHash !== expected.documentHash ||
			receipt.walletAddress !== expected.walletAddress
		) {
			throw new Error('Receipt metadata does not match this DOCX import');
		}
		return receipt;
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		return { ...expected, createdAt: new Date().toISOString(), postTxId: null, releaseTxId: null };
	}
}

async function saveReceipt(receiptPath, receipt) {
	await fs.mkdir(path.dirname(receiptPath), { recursive: true });
	const temporaryPath = `${receiptPath}.tmp`;
	await fs.writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
	await fs.rename(temporaryPath, receiptPath);
}

async function prepare(options) {
	assertAddress(options.portalId, 'Portal ID');
	const docxPath = path.resolve(options.docxPath);
	const documentBytes = await fs.readFile(docxPath);
	const documentHash = createHash('sha256').update(documentBytes).digest('hex');
	const parsed = parsePostDocument(extractDocxParagraphs(documentBytes));
	const [{ wallet, address: walletAddress }, portal] = await Promise.all([
		loadWallet(options.walletPath),
		resolvePortalState(options.portalId, { gateway: options.gateway }),
	]);
	if (portal.owner !== walletAddress) throw new Error('The supplied wallet does not own the target Portal');
	assertAddress(portal.rootTxId, 'Portal root');
	assertAddress(portal.headTxId, 'Portal head');
	if (portal.posts.some((post) => post.slug?.toLowerCase() === parsed.slug)) {
		throw new Error(`A post with this slug already exists: ${parsed.slug}`);
	}
	const availableTopics = portalTopicValues(portal.topics).map((topic) => topic.toLowerCase());
	for (const tag of options.tags) {
		if (!availableTopics.includes(tag.toLowerCase())) throw new Error(`Portal topic/tag not found: ${tag}`);
	}
	const categories = resolvePostCategories([parsed.metadata.category], portal.categories);
	const sourcePost = {
		id: documentHash,
		postTxId: null,
		title: parsed.metadata.title,
		description: parsed.metadata.desc,
		slug: parsed.slug,
		date: parsed.metadata.date,
		draft: true,
		bannerTxId: ADDRESS.test(parsed.metadata.banner || '') ? parsed.metadata.banner : null,
		authorAddress: walletAddress,
		contentHash: documentHash,
		sourcePath: path.basename(docxPath),
	};
	const post = buildPortalPost({
		sourcePost,
		markdown: parsed.markdown,
		categories,
		sharedTags: options.tags,
		walletAddress,
		manifestTxId: null,
	});
	post.source = {
		type: 'docx',
		documentName: path.basename(docxPath),
		documentHash,
	};
	const payload = postPayload(options.portalId, post, post.date);
	return {
		wallet,
		walletAddress,
		portal,
		docxPath,
		documentHash,
		post,
		payload,
		serializedPost: JSON.stringify(payload),
	};
}

async function publish(plan, options, receiptPath) {
	const receipt = await loadReceipt(receiptPath, {
		portalId: options.portalId,
		documentHash: plan.documentHash,
		walletAddress: plan.walletAddress,
	});
	if (receipt.releaseTxId && ADDRESS.test(receipt.releaseTxId)) return receipt.releaseTxId;
	let postTxId = receipt.postTxId;
	if (!ADDRESS.test(postTxId || '')) {
		console.log('Uploading draft post payload');
		postTxId = await uploadDataItem({
			wallet: plan.wallet,
			data: plan.serializedPost,
			tags: postTags(options.portalId, plan.walletAddress, plan.documentHash, path.basename(plan.docxPath)),
			uploadNode: options.uploadNode,
		});
		receipt.postTxId = postTxId;
		receipt.postUploadedAt = new Date().toISOString();
		await saveReceipt(receiptPath, receipt);
	} else {
		console.log(`Reusing uploaded draft post payload: ${postTxId}`);
	}

	console.log('Publishing one Portal release');
	const releaseTxId = await uploadDataItem({
		wallet: plan.wallet,
		data: JSON.stringify(releasePayload(plan.portal, plan.walletAddress, postTxId)),
		tags: releaseTags(plan.portal, plan.walletAddress, plan.documentHash),
		uploadNode: options.uploadNode,
	});
	receipt.releaseTxId = releaseTxId;
	receipt.releaseUploadedAt = new Date().toISOString();
	await saveReceipt(receiptPath, receipt);
	return releaseTxId;
}

export async function run(argv = process.argv.slice(2)) {
	const options = parseArgs(argv);
	if (options.help) {
		console.log(usage());
		return null;
	}
	if (!options.docxPath || !options.portalId || !options.walletPath) {
		throw new Error(`--docx, --portal, and --wallet are required\n\n${usage()}`);
	}
	const plan = await prepare(options);
	const receiptPath = path.resolve(
		options.receiptPath ||
			path.join('.portal-imports', `${options.portalId}-docx-${plan.documentHash.slice(0, 16)}.json`)
	);
	console.log(`Title: ${plan.post.title}`);
	console.log(`Slug: ${plan.post.slug}`);
	console.log(`Status: ${plan.post.status}`);
	console.log(`Category: ${plan.post.categories.map((category) => category.name).join(', ')}`);
	console.log(`Topics/tags: ${plan.post.topics.join(', ')}`);
	console.log(`Release date: ${plan.post.date}`);
	console.log(`Banner: ${plan.post.bannerTxId || '(none; source contains a BANNER_TX_ID placeholder)'}`);
	console.log(`Content blocks: ${plan.post.content.length}`);
	console.log(`Post payload bytes: ${Buffer.byteLength(plan.serializedPost)}`);
	console.log(`Receipt: ${receiptPath}`);
	console.log(`Mode: ${options.publish ? 'LIVE PERMANENT UPLOAD' : 'DRY RUN'}`);
	if (!options.publish) {
		console.log('Dry run complete. Add --yes to publish permanently.');
		return null;
	}
	const releaseTxId = await publish(plan, options, receiptPath);
	console.log(`Release uploaded: ${releaseTxId}`);
	console.log(`View the release: ${options.gateway}/${releaseTxId}`);
	return releaseTxId;
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && fileURLToPath(import.meta.url) === executedPath) {
	void run().catch((error) => {
		console.error(`DOCX import failed: ${error.message}`);
		process.exitCode = 1;
	});
}
