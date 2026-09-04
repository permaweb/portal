import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ArweaveSigner, createData } from '@dha-team/arbundles';
import Arweave from 'arweave';

import { resolvePortalState } from './resolve-base-portal.mjs';

const ADDRESS = /^[A-Za-z0-9_-]{43}$/;
const DEFAULT_GATEWAY = 'https://arweave.net';
const DEFAULT_UPLOAD_NODE = 'https://up.arweave.net';
const DEFAULT_TAG = 'AO';
const FREE_UPLOAD_LIMIT = 100 * 1000;
const PORTAL_SCHEMA_VERSION = '2.1.0';
const RECEIPT_SCHEMA_VERSION = '1.0.0';

const ARTICLE_BLOCK = Object.freeze({
	Paragraph: 'paragraph',
	Quote: 'quote',
	OrderedList: 'ordered-list',
	UnorderedList: 'unordered-list',
	Code: 'code',
	Header1: 'header-1',
	Header2: 'header-2',
	Header3: 'header-3',
	Header4: 'header-4',
	Header5: 'header-5',
	Header6: 'header-6',
	Image: 'image',
	DividerSolid: 'divider-solid',
	HTML: 'html',
});

function usage() {
	return `Usage:
  npm run import-arweave-posts -- \\
    --manifest <arweave-manifest-id-or-url> \\
    --portal <base-portal-id> \\
    --wallet <jwk-file> [--tag AO] [--yes]

Options:
  --manifest <value>       Arweave transaction ID or gateway URL for the source manifest
  --portal <id>            Existing base-mode Portal ID
  --wallet <path>          Arweave JWK file used to publish the import
  --tag <value>            Topic/tag assigned to every post (repeatable, defaults to AO)
  --published-slug <slug>  Publish only these slugs and import all others as drafts (repeatable)
  --featured-slug <slug>   Set the imported post with this slug as the sole featured post
  --replace-post <value>   Replace one existing Portal post by ID or slug with the sole new manifest post
  --gateway <url>          Read gateway (defaults to ${DEFAULT_GATEWAY})
  --upload-node <url>      Data-item upload node (defaults to ${DEFAULT_UPLOAD_NODE})
  --concurrency <count>    Concurrent downloads/uploads (defaults to 4)
  --receipt <path>         Resume receipt path (defaults inside .portal-imports)
  --yes                    Publish permanently; without this flag the script is a dry run
  --help                   Show this help`;
}

export function parseArgs(argv) {
	const options = {
		manifest: '',
		portalId: '',
		walletPath: '',
		tags: [],
		publishedSlugs: [],
		featuredSlug: '',
		replacePost: '',
		gateway: DEFAULT_GATEWAY,
		uploadNode: DEFAULT_UPLOAD_NODE,
		concurrency: 4,
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
			case '--manifest':
				options.manifest = nextValue();
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
			case '--published-slug':
				options.publishedSlugs.push(nextValue());
				break;
			case '--featured-slug':
				if (options.featuredSlug) throw new Error('--featured-slug may only be specified once');
				options.featuredSlug = nextValue();
				break;
			case '--replace-post':
				if (options.replacePost) throw new Error('--replace-post may only be specified once');
				options.replacePost = nextValue();
				break;
			case '--gateway':
				options.gateway = nextValue();
				break;
			case '--upload-node':
				options.uploadNode = nextValue();
				break;
			case '--concurrency':
				options.concurrency = Number(nextValue());
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
	options.publishedSlugs = [
		...new Set(options.publishedSlugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean)),
	];
	options.featuredSlug = options.featuredSlug.trim().toLowerCase();
	options.replacePost = options.replacePost.trim();
	options.gateway = options.gateway.replace(/\/+$/, '');
	options.uploadNode = options.uploadNode.replace(/\/+$/, '');
	if (!Number.isInteger(options.concurrency) || options.concurrency < 1 || options.concurrency > 16) {
		throw new Error('--concurrency must be an integer between 1 and 16');
	}
	return options;
}

export function manifestTransactionId(value) {
	if (ADDRESS.test(value)) return value;
	try {
		const parts = new URL(value).pathname.split('/').filter(Boolean);
		const txId = parts.find((part) => ADDRESS.test(part));
		if (txId) return txId;
	} catch {}
	throw new Error('The manifest must be an Arweave transaction ID or URL containing one');
}

function assertAddress(value, label) {
	if (!ADDRESS.test(value || '')) throw new Error(`${label} is not a valid Arweave ID`);
}

function normalizeDate(value, fallback) {
	const timestamp = Date.parse(value || fallback || '');
	if (!Number.isFinite(timestamp)) throw new Error(`Invalid post date: ${value || fallback || '(empty)'}`);
	return { timestamp, iso: new Date(timestamp).toISOString() };
}

function escapeAttribute(value) {
	return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(value) {
	return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseInlineMarkup(value) {
	let result = value;
	result = result.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'].*?["'])?\)/g, '<img src="$2" alt="$1">');
	result = result.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'].*?["'])?\)/g, '<a href="$2">$1</a>');
	result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
	result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
	result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
	result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
	result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
	return result;
}

function mediaBlockHtml(url, caption, alt) {
	const style = 'display: flex; flex-direction: column; justify-content: center; max-width: 100%;';
	const captionHtml = caption ? `<p>${escapeHtml(caption)}</p>` : '';
	return `<div class="portal-media-wrapper portal-media-column" style="${style}">\n  <img src="${escapeAttribute(
		url
	)}" alt="${escapeAttribute(alt)}">\n  ${captionHtml}\n</div>`;
}

function blockId(prefix, index) {
	return `import-${String(prefix)
		.replace(/[^A-Za-z0-9_-]/g, '')
		.slice(0, 20)}-${index}`;
}

function isFence(line) {
	return /^```/.test(line.trim());
}

function isHeading(line) {
	return /^#{1,6}\s+/.test(line.trim());
}

function isImage(line) {
	return /^!\[[^\]]*\]\([^)]+\)\s*$/.test(line.trim());
}

function isUnorderedList(line) {
	return /^\s*[-*+]\s+/.test(line);
}

function isOrderedList(line) {
	return /^\s*\d+\.\s+/.test(line);
}

function isQuote(line) {
	return /^\s*>/.test(line);
}

function isDivider(line) {
	return /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);
}

function isHtmlBlock(line) {
	return /^\s*<[A-Za-z][^>]*>/.test(line);
}

function startsBlock(line) {
	return (
		!line.trim() ||
		isFence(line) ||
		isHeading(line) ||
		isImage(line) ||
		isUnorderedList(line) ||
		isOrderedList(line) ||
		isQuote(line) ||
		isDivider(line) ||
		isHtmlBlock(line)
	);
}

export function extractMarkdownBody(markdown) {
	const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
	if (!normalized.startsWith('---\n')) return normalized;
	const end = normalized.indexOf('\n---\n', 4);
	return end < 0 ? normalized : normalized.slice(end + 5);
}

export function markdownToPortalBlocks(markdown, prefix = 'post') {
	const body = extractMarkdownBody(markdown);
	const lines = body.split('\n');
	const blocks = [];
	let cursor = 0;

	const add = (type, content, data) => {
		const block = { id: blockId(prefix, blocks.length), type, content };
		if (data) block.data = data;
		blocks.push(block);
	};

	while (cursor < lines.length) {
		const rawLine = lines[cursor];
		const line = rawLine.trim();
		if (!line || line.startsWith('import ')) {
			cursor += 1;
			continue;
		}

		if (isFence(rawLine)) {
			const language = line.slice(3).trim();
			const code = [];
			cursor += 1;
			while (cursor < lines.length && !isFence(lines[cursor])) code.push(lines[cursor++]);
			if (cursor < lines.length) cursor += 1;
			add(ARTICLE_BLOCK.Code, code.join('\n'), language ? { language } : undefined);
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			add(`header-${heading[1].length}`, parseInlineMarkup(heading[2]));
			cursor += 1;
			continue;
		}

		const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'].*?["'])?\)\s*$/);
		if (image) {
			let caption = '';
			const next = lines[cursor + 1]?.trim() || '';
			const captionMatch = next.match(/^(?:_([^_]+)_|\*([^*]+)\*)$/);
			if (captionMatch) {
				caption = captionMatch[1] || captionMatch[2] || '';
				cursor += 1;
			}
			const url = image[2];
			const alt = image[1];
			add(ARTICLE_BLOCK.Image, mediaBlockHtml(url, caption, alt), {
				url,
				caption,
				alt,
				alignment: 'portal-media-column',
				mediaAlign: 'center',
			});
			cursor += 1;
			continue;
		}

		if (isQuote(rawLine)) {
			const quoted = [];
			while (cursor < lines.length && isQuote(lines[cursor])) {
				quoted.push(lines[cursor].replace(/^\s*>\s?/, '').trim());
				cursor += 1;
			}
			add(ARTICLE_BLOCK.Quote, parseInlineMarkup(quoted.join('<br>')));
			continue;
		}

		if (isUnorderedList(rawLine)) {
			const items = [];
			while (cursor < lines.length) {
				if (isUnorderedList(lines[cursor])) {
					items.push(`<li>${parseInlineMarkup(lines[cursor].replace(/^\s*[-*+]\s+/, '').trim())}</li>`);
					cursor += 1;
				} else if (!lines[cursor].trim() && isUnorderedList(lines[cursor + 1] || '')) cursor += 1;
				else break;
			}
			add(ARTICLE_BLOCK.UnorderedList, items.join(''));
			continue;
		}

		if (isOrderedList(rawLine)) {
			const items = [];
			while (cursor < lines.length) {
				if (isOrderedList(lines[cursor])) {
					items.push(`<li>${parseInlineMarkup(lines[cursor].replace(/^\s*\d+\.\s+/, '').trim())}</li>`);
					cursor += 1;
				} else if (!lines[cursor].trim() && isOrderedList(lines[cursor + 1] || '')) cursor += 1;
				else break;
			}
			add(ARTICLE_BLOCK.OrderedList, items.join(''));
			continue;
		}

		if (isDivider(rawLine)) {
			add(ARTICLE_BLOCK.DividerSolid, '');
			cursor += 1;
			continue;
		}

		if (isHtmlBlock(rawLine)) {
			const html = [rawLine];
			const tag = line.match(/^<([A-Za-z][A-Za-z0-9-]*)\b/)?.[1];
			cursor += 1;
			if (tag && !line.includes(`</${tag}>`) && !line.endsWith('/>')) {
				while (cursor < lines.length) {
					html.push(lines[cursor]);
					const closed = lines[cursor].includes(`</${tag}>`);
					cursor += 1;
					if (closed) break;
				}
			}
			add(ARTICLE_BLOCK.HTML, html.join('\n'));
			continue;
		}

		const paragraph = [line];
		cursor += 1;
		while (cursor < lines.length && !startsBlock(lines[cursor])) {
			paragraph.push(lines[cursor].trim());
			cursor += 1;
		}
		add(ARTICLE_BLOCK.Paragraph, parseInlineMarkup(paragraph.join(' ')));
	}

	return blocks;
}

function flattenCategories(categories, output = []) {
	for (const category of categories || []) {
		if (!category || typeof category !== 'object') continue;
		output.push(category);
		flattenCategories(category.children, output);
	}
	return output;
}

function portalTopicValues(topics) {
	return (topics || [])
		.map((topic) => (typeof topic === 'string' ? topic : topic?.value))
		.filter((topic) => typeof topic === 'string');
}

export function canAdministerPortal(portal, walletAddress) {
	if (portal.owner === walletAddress) return true;
	const roles = portal.users?.find((user) => user?.address === walletAddress)?.roles;
	return Array.isArray(roles) && roles.includes('Admin');
}

export function resolvePostCategories(sourceCategories, portalCategories) {
	const flattened = flattenCategories(portalCategories);
	return (sourceCategories || []).map((sourceCategory) => {
		const requested = typeof sourceCategory === 'string' ? sourceCategory : sourceCategory?.name || sourceCategory?.id;
		const category = flattened.find(
			(candidate) =>
				candidate.id === requested ||
				(typeof requested === 'string' && candidate.name?.toLowerCase() === requested.toLowerCase())
		);
		if (!category) throw new Error(`Portal category not found: ${requested || '(empty)'}`);
		return category;
	});
}

function plainTextFromBlocks(blocks) {
	return blocks
		.map((block) => String(block.content || '').replace(/<[^>]+>/g, ' '))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function sourcePostStatus(sourcePost, publishedSlugs = []) {
	if (publishedSlugs.length > 0) {
		return publishedSlugs.includes(sourcePost.slug.toLowerCase()) ? 'published' : 'draft';
	}
	return sourcePost.draft ? 'draft' : 'published';
}

export function buildPortalPost({
	sourcePost,
	markdown,
	categories,
	sharedTags,
	walletAddress,
	manifestTxId,
	publishedSlugs = [],
}) {
	const published = normalizeDate(sourcePost.publishedAt || sourcePost.date, sourcePost.date);
	const updated = normalizeDate(sourcePost.updated || sourcePost.date || sourcePost.publishedAt, published.iso);
	const content = markdownToPortalBlocks(markdown, sourcePost.id || sourcePost.slug);
	if (!content.length) throw new Error(`Post has no importable content: ${sourcePost.title}`);
	const text = plainTextFromBlocks(content);
	const wordCount = Number.isFinite(sourcePost.wordCount)
		? sourcePost.wordCount
		: text.split(/\s+/).filter(Boolean).length;
	const authorAddress = ADDRESS.test(sourcePost.authorAddress || '') ? sourcePost.authorAddress : walletAddress;
	const thumbnail = ADDRESS.test(sourcePost.bannerTxId || '') ? sourcePost.bannerTxId : null;
	const description = sourcePost.description || sourcePost.excerpt || '';
	const status = sourcePostStatus(sourcePost, publishedSlugs);
	const categoryLabels = categories.map((category) => category.name || category.id).filter(Boolean);

	return {
		title: sourcePost.title,
		description,
		slug: sourcePost.slug,
		url: sourcePost.slug,
		status,
		content,
		creator: authorAddress,
		categories,
		topics: sharedTags,
		tags: sharedTags,
		thumbnail,
		bannerTxId: thumbnail,
		dateCreated: published.timestamp,
		lastUpdate: updated.timestamp,
		releaseDate: published.timestamp,
		date: published.iso,
		updated: updated.iso,
		draft: status !== 'published',
		authorAddress,
		wordCount,
		readingTime: Number.isFinite(sourcePost.readingTime)
			? sourcePost.readingTime
			: Math.max(1, Math.ceil(wordCount / 200)),
		excerpt: sourcePost.excerpt || description || text.slice(0, 220),
		publishedAt: published.iso,
		frontmatter: {
			title: sourcePost.title,
			date: published.iso,
			desc: description,
			description,
			category: categoryLabels[0] || '',
			categories: categoryLabels,
			tags: sharedTags,
			banner: thumbnail,
			author: authorAddress,
			excerpt: sourcePost.excerpt || description || text.slice(0, 220),
		},
		source: {
			manifestTxId,
			postId: sourcePost.id,
			postTxId: sourcePost.postTxId,
			contentHash: sourcePost.contentHash || null,
			sourcePath: sourcePost.sourcePath || null,
		},
	};
}

export function postPayload(portalId, post, createdAt, replacement = null) {
	if (replacement) {
		return {
			schemaVersion: PORTAL_SCHEMA_VERSION,
			type: 'portal-post',
			mode: 'base',
			portalId,
			postId: replacement.id,
			previousTxId: replacement.postTxId || replacement.id,
			updatedAt: new Date().toISOString(),
			post,
		};
	}
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

function postTags(portalId, walletAddress, manifestTxId, sourcePost, replacement = null) {
	return [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: PORTAL_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-post' },
		{ name: 'Portal-Id', value: portalId },
		{ name: 'Author', value: walletAddress },
		{ name: 'Import-Manifest', value: manifestTxId },
		{ name: 'Source-Post-Id', value: sourcePost.id },
		{ name: 'Source-Post-Tx', value: sourcePost.postTxId },
		...(replacement ? [{ name: 'Post-Id', value: replacement.id }] : []),
	];
}

function releasePayload({ portal, walletAddress, upsert, order, featuredPosts }) {
	const changes = { posts: { upsert, order } };
	if (featuredPosts !== null) changes.featuredPosts = featuredPosts;
	return {
		schemaVersion: PORTAL_SCHEMA_VERSION,
		type: 'portal-release',
		mode: 'base',
		portalId: portal.portalId,
		rootTxId: portal.rootTxId,
		previousTxId: portal.headTxId,
		generatedAt: new Date().toISOString(),
		authorAddress: walletAddress,
		changes,
	};
}

function releaseTags(portal, walletAddress, manifestTxId, postCount) {
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
		{ name: 'Import-Manifest', value: manifestTxId },
		{ name: 'Import-Post-Count', value: String(postCount) },
	];
}

function duplicatePost(existingPosts, sourcePost, manifestTxId) {
	return (existingPosts || []).find(
		(post) =>
			(post.source?.manifestTxId === manifestTxId && post.source?.postId === sourcePost.id) ||
			post.slug?.toLowerCase() === sourcePost.slug.toLowerCase() ||
			post.url?.toLowerCase() === sourcePost.slug.toLowerCase()
	);
}

async function fetchJson(url, label) {
	const response = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`${label} failed: ${response.status} ${response.statusText}`.trim());
	return response.json();
}

async function fetchText(url, label) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${label} failed: ${response.status} ${response.statusText}`.trim());
	return response.text();
}

async function mapWithConcurrency(values, concurrency, mapper) {
	const output = new Array(values.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(concurrency, Math.max(1, values.length)) }, async () => {
		while (cursor < values.length) {
			const index = cursor++;
			output[index] = await mapper(values[index], index);
		}
	});
	await Promise.all(workers);
	return output;
}

export async function loadWallet(walletPath) {
	let wallet;
	try {
		wallet = JSON.parse(await fs.readFile(walletPath, 'utf8'));
	} catch (error) {
		throw new Error(`Unable to read the wallet file: ${error.message}`);
	}
	const address = await Arweave.init({}).wallets.jwkToAddress(wallet);
	assertAddress(address, 'Wallet address');
	return { wallet, address };
}

function defaultReceiptPath(portalId, manifestTxId) {
	return path.join(process.cwd(), '.portal-imports', `${portalId}-${manifestTxId}.json`);
}

async function loadReceipt(receiptPath, expected) {
	try {
		const receipt = JSON.parse(await fs.readFile(receiptPath, 'utf8'));
		if (
			receipt.portalId !== expected.portalId ||
			receipt.manifestTxId !== expected.manifestTxId ||
			receipt.walletAddress !== expected.walletAddress
		) {
			throw new Error('Receipt metadata does not match this import');
		}
		return { ...receipt, posts: receipt.posts || {} };
	} catch (error) {
		if (error.code === 'ENOENT') {
			return {
				schemaVersion: RECEIPT_SCHEMA_VERSION,
				...expected,
				createdAt: new Date().toISOString(),
				posts: {},
				release: null,
			};
		}
		throw error;
	}
}

async function saveReceipt(receiptPath, receipt) {
	await fs.mkdir(path.dirname(receiptPath), { recursive: true });
	const temporaryPath = `${receiptPath}.tmp`;
	await fs.writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
	await fs.rename(temporaryPath, receiptPath);
}

export async function uploadDataItem({ wallet, data, tags, uploadNode }) {
	const bytes = Buffer.from(data);
	if (bytes.byteLength > FREE_UPLOAD_LIMIT) {
		throw new Error(
			`Payload is ${bytes.byteLength} bytes; this importer only uses free uploads up to ${FREE_UPLOAD_LIMIT}`
		);
	}
	const signer = new ArweaveSigner(wallet);
	const dataItem = createData(bytes, signer, { tags });
	await dataItem.sign(signer);
	const expectedId = dataItem.id;
	const raw = dataItem.getRaw();

	let lastError;
	for (let attempt = 1; attempt <= 3; attempt += 1) {
		try {
			const response = await fetch(`${uploadNode}/tx/arweave`, {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/octet-stream' },
				body: raw,
			});
			const responseText = await response.text();
			if (!response.ok && response.status !== 409) {
				throw new Error(`${response.status}${responseText ? ` ${responseText}` : ''}`);
			}
			let returnedId = '';
			try {
				const parsed = JSON.parse(responseText);
				returnedId = typeof parsed === 'string' ? parsed : parsed?.id || '';
			} catch {
				returnedId = responseText.trim();
			}
			if (returnedId && ADDRESS.test(returnedId) && returnedId !== expectedId) {
				throw new Error(`Upload node returned an unexpected transaction ID: ${returnedId}`);
			}
			return expectedId;
		} catch (error) {
			lastError = error;
			if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
		}
	}
	throw new Error(`Arweave upload failed after 3 attempts: ${lastError?.message || 'unknown error'}`);
}

function validateSourceManifest(manifest, manifestTxId) {
	if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.posts)) {
		throw new Error('The source manifest must contain a posts array');
	}
	if (manifest.postCount !== undefined && manifest.postCount !== manifest.posts.length) {
		throw new Error(`Manifest postCount is ${manifest.postCount}, but posts contains ${manifest.posts.length} entries`);
	}
	const sourceIds = new Set();
	const slugs = new Set();
	for (const [index, post] of manifest.posts.entries()) {
		if (!post || typeof post !== 'object') throw new Error(`Manifest post ${index + 1} is invalid`);
		if (!post.id || !post.title || !post.slug)
			throw new Error(`Manifest post ${index + 1} is missing id, title, or slug`);
		assertAddress(post.postTxId, `Post transaction for ${post.title}`);
		if (sourceIds.has(post.id)) throw new Error(`Duplicate source post ID: ${post.id}`);
		if (slugs.has(post.slug.toLowerCase())) throw new Error(`Duplicate source post slug: ${post.slug}`);
		sourceIds.add(post.id);
		slugs.add(post.slug.toLowerCase());
	}
	return { ...manifest, manifestTxId };
}

async function prepareImport(options) {
	assertAddress(options.portalId, 'Portal ID');
	if (!options.walletPath) throw new Error('--wallet is required');
	const manifestTxId = manifestTransactionId(options.manifest);
	const [{ wallet, address: walletAddress }, sourceManifest, portal] = await Promise.all([
		loadWallet(options.walletPath),
		fetchJson(`${options.gateway}/raw/${manifestTxId}`, 'Manifest download'),
		resolvePortalState(options.portalId, { gateway: options.gateway }),
	]);
	validateSourceManifest(sourceManifest, manifestTxId);
	for (const slug of options.publishedSlugs) {
		if (!sourceManifest.posts.some((post) => post.slug.toLowerCase() === slug)) {
			throw new Error(`Published slug not found in source manifest: ${slug}`);
		}
	}
	if (options.featuredSlug && !sourceManifest.posts.some((post) => post.slug.toLowerCase() === options.featuredSlug)) {
		throw new Error(`Featured slug not found in source manifest: ${options.featuredSlug}`);
	}
	if (portal.portalId !== options.portalId || portal.mode !== 'base')
		throw new Error('The target is not a base-mode Portal');
	if (!canAdministerPortal(portal, walletAddress)) {
		throw new Error('The supplied wallet is not an owner or admin of the target Portal');
	}
	assertAddress(portal.rootTxId, 'Portal root');
	assertAddress(portal.headTxId, 'Portal head');

	const availableTopics = portalTopicValues(portal.topics).map((topic) => topic.toLowerCase());
	for (const tag of options.tags) {
		if (!availableTopics.includes(tag.toLowerCase())) throw new Error(`Portal topic/tag not found: ${tag}`);
	}

	const candidates = sourceManifest.posts.filter(
		(sourcePost) => !duplicatePost(portal.posts, sourcePost, manifestTxId)
	);
	const skipped = sourceManifest.posts.filter((sourcePost) => duplicatePost(portal.posts, sourcePost, manifestTxId));
	let replacement = null;
	if (options.replacePost) {
		const identifier = options.replacePost.toLowerCase();
		replacement = portal.posts.find(
			(post) =>
				post.id === options.replacePost ||
				post.postTxId === options.replacePost ||
				post.slug?.toLowerCase() === identifier ||
				post.url?.toLowerCase() === identifier
		);
		if (!replacement) throw new Error(`Replacement Portal post not found: ${options.replacePost}`);
		if (candidates.length !== 1) {
			throw new Error(`--replace-post requires exactly one new manifest post; found ${candidates.length}`);
		}
	}
	const prepared = await mapWithConcurrency(candidates, options.concurrency, async (sourcePost) => {
		const markdown = await fetchText(
			`${options.gateway}/raw/${sourcePost.postTxId}`,
			`Post download: ${sourcePost.title}`
		);
		if (sourcePost.contentHash) {
			const hash = createHash('sha256').update(markdown).digest('hex');
			if (hash !== sourcePost.contentHash) throw new Error(`Content hash mismatch: ${sourcePost.title}`);
		}
		const categories = resolvePostCategories(sourcePost.categories, portal.categories);
		const post = buildPortalPost({
			sourcePost,
			markdown,
			categories,
			sharedTags: options.tags,
			walletAddress,
			manifestTxId,
			publishedSlugs: options.publishedSlugs,
		});
		const payload = postPayload(options.portalId, post, post.publishedAt, replacement);
		const serialized = JSON.stringify(payload);
		if (Buffer.byteLength(serialized) > FREE_UPLOAD_LIMIT) {
			throw new Error(`Converted post exceeds the free upload limit: ${sourcePost.title}`);
		}
		return { sourcePost, post, payload, serialized, blockCount: post.content.length, replacement };
	});

	return {
		wallet,
		walletAddress,
		manifestTxId,
		sourceManifest,
		portal,
		prepared,
		skipped,
		featuredSlug: options.featuredSlug,
	};
}

function printPlan(plan, receiptPath, publish) {
	const totalBytes = plan.prepared.reduce((sum, entry) => sum + Buffer.byteLength(entry.serialized), 0);
	console.log(`Portal: ${plan.portal.name || plan.portal.portalId}`);
	console.log(`Portal ID: ${plan.portal.portalId}`);
	console.log(`Portal owner: ${plan.walletAddress}`);
	console.log(`Manifest: ${plan.manifestTxId}`);
	console.log(`Posts in manifest: ${plan.sourceManifest.posts.length}`);
	console.log(`Posts ready: ${plan.prepared.length}`);
	console.log(`Posts skipped as existing: ${plan.skipped.length}`);
	console.log(`Shared topics/tags: ${plan.prepared.length ? plan.prepared[0].post.topics.join(', ') : '(none)'}`);
	console.log(`Featured slug: ${plan.featuredSlug || '(unchanged)'}`);
	console.log(
		`Replacement: ${
			plan.prepared[0]?.replacement
				? `${plan.prepared[0].replacement.title} (${plan.prepared[0].replacement.id})`
				: '(none)'
		}`
	);
	console.log(`Converted payload bytes: ${totalBytes}`);
	console.log(`Receipt: ${receiptPath}`);
	console.log(`Mode: ${publish ? 'LIVE PERMANENT UPLOAD' : 'DRY RUN'}`);
	for (const entry of plan.prepared) {
		console.log(
			`  - ${entry.sourcePost.title} (${entry.blockCount} blocks, ${Buffer.byteLength(entry.serialized)} bytes)`
		);
	}
}

async function publishImport(plan, options, receiptPath) {
	const receipt = await loadReceipt(receiptPath, {
		portalId: plan.portal.portalId,
		manifestTxId: plan.manifestTxId,
		walletAddress: plan.walletAddress,
	});
	if (receipt.release?.txId) {
		console.log(`Import release already published: ${receipt.release.txId}`);
		return receipt.release.txId;
	}

	let receiptWrites = Promise.resolve();
	const persistReceipt = () => {
		receiptWrites = receiptWrites.then(() => saveReceipt(receiptPath, receipt));
		return receiptWrites;
	};

	const results = await mapWithConcurrency(plan.prepared, options.concurrency, async (entry, index) => {
		const saved = receipt.posts[entry.sourcePost.id];
		if (saved?.postTxId && ADDRESS.test(saved.postTxId)) {
			console.log(`[${index + 1}/${plan.prepared.length}] Reusing ${entry.sourcePost.title}: ${saved.postTxId}`);
			return { ...entry, postTxId: saved.postTxId };
		}
		console.log(`[${index + 1}/${plan.prepared.length}] Uploading ${entry.sourcePost.title}`);
		const postTxId = await uploadDataItem({
			wallet: plan.wallet,
			data: entry.serialized,
			tags: postTags(plan.portal.portalId, plan.walletAddress, plan.manifestTxId, entry.sourcePost, entry.replacement),
			uploadNode: options.uploadNode,
		});
		receipt.posts[entry.sourcePost.id] = {
			sourcePostTxId: entry.sourcePost.postTxId,
			postTxId,
			slug: entry.sourcePost.slug,
			title: entry.sourcePost.title,
			uploadedAt: new Date().toISOString(),
		};
		await persistReceipt();
		console.log(`[${index + 1}/${plan.prepared.length}] Uploaded ${postTxId}`);
		return { ...entry, postTxId };
	});
	await receiptWrites;

	const upsert = Object.fromEntries(
		results.map((result) => [result.replacement?.id || result.postTxId, result.postTxId])
	);
	const currentIds = plan.portal.posts.map((post) => post.id);
	const order = [...currentIds, ...results.filter((result) => !result.replacement).map((result) => result.postTxId)];
	const featuredPost = options.featuredSlug
		? results.find((result) => result.sourcePost.slug.toLowerCase() === options.featuredSlug) ||
		  plan.portal.posts.find((post) => (post.slug || post.url || '').toLowerCase() === options.featuredSlug)
		: null;
	if (options.featuredSlug && !featuredPost) {
		throw new Error(`Unable to resolve featured post: ${options.featuredSlug}`);
	}
	const featuredPosts = options.featuredSlug ? [featuredPost.postTxId || featuredPost.id] : null;
	const release = releasePayload({
		portal: plan.portal,
		walletAddress: plan.walletAddress,
		upsert,
		order,
		featuredPosts,
	});
	const serializedRelease = JSON.stringify(release);
	console.log(`Publishing one Portal release for ${results.length} posts`);
	const releaseTxId = await uploadDataItem({
		wallet: plan.wallet,
		data: serializedRelease,
		tags: releaseTags(plan.portal, plan.walletAddress, plan.manifestTxId, results.length),
		uploadNode: options.uploadNode,
	});
	receipt.release = {
		txId: releaseTxId,
		previousTxId: plan.portal.headTxId,
		postCount: results.length,
		publishedAt: new Date().toISOString(),
	};
	await saveReceipt(receiptPath, receipt);
	console.log(`Release uploaded: ${releaseTxId}`);
	return releaseTxId;
}

export async function run(argv = process.argv.slice(2)) {
	const options = parseArgs(argv);
	if (options.help) {
		console.log(usage());
		return null;
	}
	if (!options.manifest || !options.portalId || !options.walletPath) {
		throw new Error(`--manifest, --portal, and --wallet are required\n\n${usage()}`);
	}
	const manifestTxId = manifestTransactionId(options.manifest);
	const receiptPath = path.resolve(options.receiptPath || defaultReceiptPath(options.portalId, manifestTxId));
	const plan = await prepareImport(options);
	printPlan(plan, receiptPath, options.publish);
	if (!options.publish || plan.prepared.length === 0) {
		if (!options.publish) console.log('Dry run complete. Add --yes to publish permanently.');
		else console.log('Nothing to import.');
		return null;
	}
	const releaseTxId = await publishImport(plan, options, receiptPath);
	console.log(`View the release: ${options.gateway}/${releaseTxId}`);
	return releaseTxId;
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && fileURLToPath(import.meta.url) === executedPath) {
	void run().catch((error) => {
		console.error(`Import failed: ${error.message}`);
		process.exitCode = 1;
	});
}
