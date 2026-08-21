import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadWallet, sourcePostStatus, uploadDataItem } from './import-arweave-posts.mjs';
import { resolvePortalState } from './resolve-base-portal.mjs';

const ADDRESS = /^[A-Za-z0-9_-]{43}$/;
const PORTAL_SCHEMA_VERSION = '2.1.0';
const DEFAULT_GATEWAY = 'https://arweave.net';
const DEFAULT_UPLOAD_NODE = 'https://up.arweave.net';

function usage() {
	return `Usage:
  npm run set-arweave-post-statuses -- \\
    --portal <base-portal-id> \\
    --source-manifest <manifest-id> \\
    --wallet <jwk-file> \\
    [--publish-all | --published-slug <slug>] \\
    [--featured-slug <slug>] [--yes]

The command only changes posts imported from the selected source manifest.
It defaults to a dry run and requires --yes for permanent uploads.`;
}

export function parseStatusArgs(argv) {
	const options = {
		portalId: '',
		sourceManifestTxId: '',
		walletPath: '',
		publishedSlugs: [],
		publishAll: false,
		featuredSlug: '',
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
			case '--portal':
				options.portalId = nextValue();
				break;
			case '--source-manifest':
				options.sourceManifestTxId = nextValue();
				break;
			case '--wallet':
				options.walletPath = nextValue();
				break;
			case '--published-slug':
				options.publishedSlugs.push(nextValue());
				break;
			case '--publish-all':
				options.publishAll = true;
				break;
			case '--featured-slug':
				if (options.featuredSlug) throw new Error('--featured-slug may only be specified once');
				options.featuredSlug = nextValue();
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

	options.publishedSlugs = [
		...new Set(options.publishedSlugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean)),
	];
	options.featuredSlug = options.featuredSlug.trim().toLowerCase();
	if (options.publishAll && options.publishedSlugs.length) {
		throw new Error('--publish-all cannot be combined with --published-slug');
	}
	options.gateway = options.gateway.replace(/\/+$/, '');
	options.uploadNode = options.uploadNode.replace(/\/+$/, '');
	if (!Number.isInteger(options.concurrency) || options.concurrency < 1 || options.concurrency > 16) {
		throw new Error('--concurrency must be an integer between 1 and 16');
	}
	return options;
}

function assertAddress(value, label) {
	if (!ADDRESS.test(value || '')) throw new Error(`${label} is not a valid Arweave ID`);
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

export function desiredPostStatus(post, publishedSlugs, publishAll = false) {
	if (publishAll) return 'published';
	return sourcePostStatus({ slug: post.slug || post.url || '', draft: post.draft }, publishedSlugs);
}

export function desiredFeaturedPostIds(importedPosts, featuredSlug) {
	if (!featuredSlug) return null;
	const featuredPost = importedPosts.find((post) => (post.slug || post.url || '').toLowerCase() === featuredSlug);
	if (!featuredPost) throw new Error(`Featured slug not found among imported posts: ${featuredSlug}`);
	return [featuredPost.id];
}

function revisionPayload(portalId, post, status, updatedAt) {
	const { postTxId: _postTxId, ...storedPost } = post;
	return {
		schemaVersion: PORTAL_SCHEMA_VERSION,
		type: 'portal-post',
		mode: 'base',
		portalId,
		postId: post.id,
		previousTxId: post.postTxId || post.id,
		updatedAt,
		post: {
			...storedPost,
			status,
			draft: status !== 'published',
			lastUpdate: Date.parse(updatedAt),
			updated: updatedAt,
		},
	};
}

function revisionTags(portalId, walletAddress, sourceManifestTxId, post) {
	return [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: PORTAL_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-post' },
		{ name: 'Portal-Id', value: portalId },
		{ name: 'Post-Id', value: post.id },
		{ name: 'Author', value: walletAddress },
		{ name: 'Import-Manifest', value: sourceManifestTxId },
		{ name: 'Import-Operation', value: 'status-sync' },
	];
}

function releasePayload(portal, walletAddress, upsert, featuredPosts) {
	const changes = { posts: { upsert } };
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

function releaseTags(portal, walletAddress, sourceManifestTxId, postCount) {
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
		{ name: 'Import-Manifest', value: sourceManifestTxId },
		{ name: 'Import-Operation', value: 'status-sync' },
		{ name: 'Import-Post-Count', value: String(postCount) },
	];
}

function defaultReceiptPath(options) {
	const statusKey = createHash('sha256')
		.update(
			JSON.stringify({
				publishAll: options.publishAll,
				publishedSlugs: options.publishedSlugs,
				featuredSlug: options.featuredSlug,
			})
		)
		.digest('hex')
		.slice(0, 12);
	return path.join(
		process.cwd(),
		'.portal-imports',
		`${options.portalId}-${options.sourceManifestTxId}-statuses-${statusKey}.json`
	);
}

async function loadReceipt(receiptPath, expected) {
	try {
		const receipt = JSON.parse(await fs.readFile(receiptPath, 'utf8'));
		if (
			receipt.portalId !== expected.portalId ||
			receipt.sourceManifestTxId !== expected.sourceManifestTxId ||
			receipt.walletAddress !== expected.walletAddress ||
			JSON.stringify(receipt.publishedSlugs) !== JSON.stringify(expected.publishedSlugs) ||
			receipt.publishAll !== expected.publishAll ||
			receipt.featuredSlug !== expected.featuredSlug
		) {
			throw new Error('Receipt metadata does not match this status update');
		}
		return { ...receipt, revisions: receipt.revisions || {} };
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		return { ...expected, createdAt: new Date().toISOString(), revisions: {}, release: null };
	}
}

async function saveReceipt(receiptPath, receipt) {
	await fs.mkdir(path.dirname(receiptPath), { recursive: true });
	const temporaryPath = `${receiptPath}.tmp`;
	await fs.writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
	await fs.rename(temporaryPath, receiptPath);
}

async function prepareStatusUpdate(options) {
	assertAddress(options.portalId, 'Portal ID');
	assertAddress(options.sourceManifestTxId, 'Source manifest ID');
	const [{ wallet, address: walletAddress }, portal] = await Promise.all([
		loadWallet(options.walletPath),
		resolvePortalState(options.portalId, { gateway: options.gateway }),
	]);
	if (portal.owner !== walletAddress) throw new Error('The supplied wallet does not own the target Portal');
	assertAddress(portal.rootTxId, 'Portal root');
	assertAddress(portal.headTxId, 'Portal head');

	const importedPosts = portal.posts.filter((post) => post.source?.manifestTxId === options.sourceManifestTxId);
	if (!importedPosts.length) throw new Error('No posts from this source manifest were found in the Portal');
	for (const slug of options.publishedSlugs) {
		if (!importedPosts.some((post) => (post.slug || post.url || '').toLowerCase() === slug)) {
			throw new Error(`Published slug not found among imported posts: ${slug}`);
		}
	}
	const desiredFeaturedPosts = desiredFeaturedPostIds(importedPosts, options.featuredSlug);
	const needsFeaturedUpdate =
		desiredFeaturedPosts !== null &&
		JSON.stringify(portal.featuredPosts || []) !== JSON.stringify(desiredFeaturedPosts);
	const changedPosts = importedPosts.filter((post) => {
		const status = desiredPostStatus(post, options.publishedSlugs, options.publishAll);
		return post.status !== status || post.draft !== (status !== 'published');
	});
	return {
		wallet,
		walletAddress,
		portal,
		importedPosts,
		changedPosts,
		desiredFeaturedPosts,
		needsFeaturedUpdate,
	};
}

async function publishStatusUpdate(plan, options, receiptPath) {
	const receipt = await loadReceipt(receiptPath, {
		portalId: options.portalId,
		sourceManifestTxId: options.sourceManifestTxId,
		walletAddress: plan.walletAddress,
		publishedSlugs: options.publishedSlugs,
		publishAll: options.publishAll,
		featuredSlug: options.featuredSlug,
	});
	if (receipt.release?.txId) {
		console.log(`Status release already published: ${receipt.release.txId}`);
		return receipt.release.txId;
	}

	let receiptWrites = Promise.resolve();
	const persistReceipt = () => {
		receiptWrites = receiptWrites.then(() => saveReceipt(receiptPath, receipt));
		return receiptWrites;
	};
	const results = await mapWithConcurrency(plan.changedPosts, options.concurrency, async (post, index) => {
		const desiredStatus = desiredPostStatus(post, options.publishedSlugs, options.publishAll);
		const saved = receipt.revisions[post.id];
		if (saved?.revisionTxId && ADDRESS.test(saved.revisionTxId)) {
			console.log(`[${index + 1}/${plan.changedPosts.length}] Reusing ${post.title}: ${saved.revisionTxId}`);
			return { post, revisionTxId: saved.revisionTxId };
		}
		console.log(`[${index + 1}/${plan.changedPosts.length}] Setting ${post.title} to ${desiredStatus}`);
		const updatedAt = new Date().toISOString();
		const revisionTxId = await uploadDataItem({
			wallet: plan.wallet,
			data: JSON.stringify(revisionPayload(options.portalId, post, desiredStatus, updatedAt)),
			tags: revisionTags(options.portalId, plan.walletAddress, options.sourceManifestTxId, post),
			uploadNode: options.uploadNode,
		});
		receipt.revisions[post.id] = { revisionTxId, status: desiredStatus, uploadedAt: updatedAt };
		await persistReceipt();
		console.log(`[${index + 1}/${plan.changedPosts.length}] Uploaded ${revisionTxId}`);
		return { post, revisionTxId };
	});
	await receiptWrites;

	const upsert = Object.fromEntries(results.map(({ post, revisionTxId }) => [post.id, revisionTxId]));
	const release = releasePayload(plan.portal, plan.walletAddress, upsert, plan.desiredFeaturedPosts);
	console.log(`Publishing one Portal release with ${results.length} post revisions`);
	const releaseTxId = await uploadDataItem({
		wallet: plan.wallet,
		data: JSON.stringify(release),
		tags: releaseTags(plan.portal, plan.walletAddress, options.sourceManifestTxId, results.length),
		uploadNode: options.uploadNode,
	});
	receipt.release = {
		txId: releaseTxId,
		previousTxId: plan.portal.headTxId,
		postCount: results.length,
		featuredPosts: plan.desiredFeaturedPosts,
		publishedAt: new Date().toISOString(),
	};
	await saveReceipt(receiptPath, receipt);
	console.log(`Status release uploaded: ${releaseTxId}`);
	return releaseTxId;
}

export async function runStatusUpdate(argv = process.argv.slice(2)) {
	const options = parseStatusArgs(argv);
	if (options.help) {
		console.log(usage());
		return null;
	}
	if (!options.portalId || !options.sourceManifestTxId || !options.walletPath) {
		throw new Error(`--portal, --source-manifest, and --wallet are required\n\n${usage()}`);
	}
	const receiptPath = path.resolve(options.receiptPath || defaultReceiptPath(options));
	const plan = await prepareStatusUpdate(options);
	console.log(`Imported posts: ${plan.importedPosts.length}`);
	console.log(`Posts requiring a status revision: ${plan.changedPosts.length}`);
	console.log(
		`Published selection: ${
			options.publishAll ? '(all imported posts)' : options.publishedSlugs.join(', ') || '(preserve current statuses)'
		}`
	);
	console.log(`Featured slug: ${options.featuredSlug || '(unchanged)'}`);
	console.log(`Featured selection requires an update: ${plan.needsFeaturedUpdate ? 'yes' : 'no'}`);
	console.log(`Receipt: ${receiptPath}`);
	console.log(`Mode: ${options.publish ? 'LIVE PERMANENT UPLOAD' : 'DRY RUN'}`);
	for (const post of plan.changedPosts) {
		console.log(`  - ${desiredPostStatus(post, options.publishedSlugs, options.publishAll)}: ${post.title}`);
	}
	if (!options.publish || (plan.changedPosts.length === 0 && !plan.needsFeaturedUpdate)) {
		if (!options.publish) console.log('Dry run complete. Add --yes to publish permanently.');
		else console.log('All imported post statuses and the featured selection already match.');
		return null;
	}
	const releaseTxId = await publishStatusUpdate(plan, options, receiptPath);
	console.log(`View the release: ${options.gateway}/${releaseTxId}`);
	return releaseTxId;
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (executedPath && fileURLToPath(import.meta.url) === executedPath) {
	void runStatusUpdate().catch((error) => {
		console.error(`Status update failed: ${error.message}`);
		process.exitCode = 1;
	});
}
