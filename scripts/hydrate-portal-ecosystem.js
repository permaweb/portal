/**
 * Portal Ecosystem Hydration Script
 *
 * This script hydrates the complete Portal ecosystem on Hyperbeam nodes by:
 * 1. Finding all portal processes via GraphQL (using Zone-Type: Portal tag)
 * 2. Fetching each portal's full state from the source node (hb.portalinto.com)
 * 3. Extracting all referenced process IDs (posts, users, comments, moderation)
 * 4. Hydrating all discovered processes on target nodes
 *
 * This ensures complete portal functionality when switching between Hyperbeam nodes.
 *
 * Usage:
 *   node scripts/hydrate-portal-ecosystem.js
 *
 * Configuration:
 *   - Source node: PORTAL_SOURCE_NODE (where to fetch portal data)
 *   - Target nodes: TARGET_NODES (where to hydrate processes)
 *   - Min block: Only processes after this block
 *
 * Data Structure (based on PORTAL_PATCH_MAP):
 *   Portal.Store.Index → Post IDs (keys)
 *   Portal.Roles → User profile IDs (keys)
 *   Portal.Store.Index[postId].Comments → Comment process IDs
 *   Portal.Store.Moderation → Moderation process ID
 */

import fs from 'fs';
import { Agent, setGlobalDispatcher } from 'undici';

import Arweave from 'arweave';
import Permaweb from '@permaweb/libs';
import { connect } from '@permaweb/aoconnect';

// Configure fetch agent for better performance
setGlobalDispatcher(
	new Agent({
		maxHeaderSize: 256 * 1024,
		headersTimeout: 0,
		bodyTimeout: 0,
		keepAliveTimeout: 10 * 60_000,
		keepAliveMaxTimeout: 60 * 60_000,
		connect: { timeout: 0 },
	})
);

// ============================================================================
// Configuration
// ============================================================================

const PORTAL_SOURCE_NODE = 'https://hb.portalinto.com';
const TARGET_NODES = ['http://localhost:8734'];
const MIN_BLOCK = 1818200;

const OUTPUT_FILE = 'portal-ecosystem-hydrated.json';
const ECOSYSTEM_DATA_FILE = 'portal-ecosystem-data.json';
const ERROR_FILE = 'portal-ecosystem-errors.json';

// ============================================================================
// Arweave/AO Initialization
// ============================================================================

const arweave = Arweave.init({});
const ao = connect({ MODE: 'legacy' });
const permaweb = Permaweb.init({ arweave, ao });

// ============================================================================
// Helper Functions - File Operations
// ============================================================================

/**
 * Loads hydrated process IDs from file
 */
function loadHydratedIds() {
	if (fs.existsSync(OUTPUT_FILE)) {
		return new Set(JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')));
	}
	return new Set();
}

/**
 * Saves hydrated process IDs to file
 */
function saveHydratedIds(ids) {
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(Array.from(ids), null, 2));
}

/**
 * Saves ecosystem data for reference
 */
function saveEcosystemData(data) {
	fs.writeFileSync(ECOSYSTEM_DATA_FILE, JSON.stringify(data, null, 2));
	console.log(`Saved ecosystem data to ${ECOSYSTEM_DATA_FILE}`);
}

/**
 * Logs an error to the error file
 */
function saveError(pid, error, type = 'unknown') {
	let errors = [];
	if (fs.existsSync(ERROR_FILE)) {
		errors = JSON.parse(fs.readFileSync(ERROR_FILE, 'utf8'));
	}

	errors.push({
		pid,
		type,
		timestamp: new Date().toISOString(),
		error: error?.code || error?.message || String(error),
	});

	fs.writeFileSync(ERROR_FILE, JSON.stringify(errors, null, 2));
}

/**
 * Gets tag value from tag list
 */
function getTagValue(list, name) {
	for (let i = 0; i < list.length; i++) {
		if (list[i] && list[i].name === name) {
			return list[i].value;
		}
	}
	return null;
}

// ============================================================================
// Helper Functions - GraphQL
// ============================================================================

/**
 * Fetches all pages of GQL data
 */
async function getAggregatedGQLData(args, callback) {
	let index = 1;
	let fetchResult = await permaweb.getGQLData(args);

	if (fetchResult && fetchResult.data.length) {
		let aggregatedData = fetchResult.data;
		callback && callback(`Count: ${fetchResult.count}`);
		callback && callback(`Pages to fetch: ${Math.ceil(fetchResult.count / (args.paginator ?? 100))}`);
		callback && callback(`Page ${index} fetched`);

		while (fetchResult.nextCursor && fetchResult.nextCursor !== 'END') {
			index += 1;
			callback && callback(`Fetching page ${index}...`);

			fetchResult = await permaweb.getGQLData({
				...args,
				cursor: fetchResult.nextCursor,
			});

			if (fetchResult && fetchResult.data.length) {
				aggregatedData = aggregatedData.concat(fetchResult.data);
			}
		}

		callback && callback(`All pages fetched!`);
		return aggregatedData;
	} else {
		callback && callback('No data found');
	}

	return null;
}

/**
 * Finds all portal processes via GraphQL
 */
async function findPortalProcesses() {
	console.log('Finding portal processes via GraphQL...\n');

	const tags = [
		{ name: 'Data-Protocol', values: ['ao'] },
		{ name: 'Variant', values: ['ao.N.1'] },
		{ name: 'Type', values: ['Process'] },
		{ name: 'Zone-Type', values: ['Portal'] },
	];

	const gqlArgs = { tags, minBlock: MIN_BLOCK };

	const portals = await getAggregatedGQLData(gqlArgs, (message) => console.log(message));

	return portals || [];
}

// ============================================================================
// Helper Functions - Portal Data Extraction
// ============================================================================

/**
 * Fetches portal data from source node
 */
async function fetchPortalData(portalId, sourceNode) {
	try {
		const url = `https://${sourceNode}/${portalId}~process@1.0/compute?require-codec=application/json&accept-bundle=true`;
		console.log(`  Fetching data for ${portalId}...`);

		const response = await fetch(url);

		if (!response.ok) {
			console.warn(`  Failed to fetch portal ${portalId}: HTTP ${response.status}`);
			return null;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(`  Error fetching portal ${portalId}:`, error.message);
		return null;
	}
}

/**
 * Extracts post IDs from Store.Index (based on PORTAL_PATCH_MAP.Posts)
 */
function extractPostIds(portalData) {
	const postIds = [];

	try {
		const index = portalData?.Store?.Index;
		if (index && typeof index === 'object') {
			Object.keys(index).forEach((key) => {
				if (key && /^[a-zA-Z0-9_-]{43}$/.test(key)) {
					postIds.push(key);
				}
			});
		}
	} catch (error) {
		console.error('Error extracting post IDs:', error.message);
	}

	return postIds;
}

/**
 * Extracts user IDs from Roles (based on PORTAL_PATCH_MAP.Users)
 */
function extractUserIds(portalData) {
	const userIds = [];

	try {
		const roles = portalData?.Roles;
		if (roles && typeof roles === 'object') {
			Object.keys(roles).forEach((key) => {
				if (key && /^[a-zA-Z0-9_-]{43}$/.test(key)) {
					userIds.push(key);
				}
			});
		}
	} catch (error) {
		console.error('Error extracting user IDs:', error.message);
	}

	return userIds;
}

/**
 * Extracts comment process IDs from post metadata
 */
function extractCommentIds(portalData) {
	const commentIds = [];

	try {
		const index = portalData?.Store?.Index;
		if (index && typeof index === 'object') {
			Object.values(index).forEach((post) => {
				const commentsId = post?.Comments;
				if (commentsId && /^[a-zA-Z0-9_-]{43}$/.test(commentsId)) {
					commentIds.push(commentsId);
				}
			});
		}
	} catch (error) {
		console.error('Error extracting comment IDs:', error.message);
	}

	return commentIds;
}

/**
 * Extracts moderation process ID from Store.Moderation (based on PORTAL_PATCH_MAP.Overview)
 */
function extractModerationId(portalData) {
	try {
		const moderationId = portalData?.Store?.Moderation;
		if (moderationId && /^[a-zA-Z0-9_-]{43}$/.test(moderationId)) {
			return moderationId;
		}
	} catch (error) {
		console.error('Error extracting moderation ID:', error.message);
	}

	return null;
}

/**
 * Extracts all process IDs from a single portal
 */
function extractAllIdsFromPortal(portalData, portalId) {
	return {
		portalId: portalId,
		postIds: extractPostIds(portalData),
		userIds: extractUserIds(portalData),
		commentIds: extractCommentIds(portalData),
		moderationId: extractModerationId(portalData),
	};
}

/**
 * Aggregates all process IDs from multiple portals
 */
async function aggregatePortalEcosystemIds(portalProcesses, sourceNode) {
	console.log(`\nAggregating IDs from ${portalProcesses.length} portals...\n`);

	const allPortalIds = [];
	const allPostIds = new Set();
	const allUserIds = new Set();
	const allCommentIds = new Set();
	const allModerationIds = new Set();

	let successCount = 0;
	let errorCount = 0;

	for (const process of portalProcesses) {
		const portalId = process?.node?.id;
		if (!portalId) {
			console.warn('Skipping process with no ID');
			errorCount++;
			continue;
		}

		allPortalIds.push(portalId);

		const portalData = await fetchPortalData(portalId, sourceNode);

		if (!portalData) {
			console.warn(`Failed to fetch data for portal ${portalId}`);
			errorCount++;
			continue;
		}

		const extracted = extractAllIdsFromPortal(portalData, portalId);

		extracted.postIds.forEach((id) => allPostIds.add(id));
		extracted.userIds.forEach((id) => allUserIds.add(id));
		extracted.commentIds.forEach((id) => allCommentIds.add(id));
		if (extracted.moderationId) allModerationIds.add(extracted.moderationId);

		console.log(
			`  ✓ Portal ${portalId.substring(0, 8)}...: ${extracted.postIds.length} posts, ${
				extracted.userIds.length
			} users, ${extracted.commentIds.length} comments`
		);
		successCount++;

		// Small delay to avoid overwhelming the server
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	const result = {
		portalIds: allPortalIds,
		postIds: Array.from(allPostIds),
		userIds: Array.from(allUserIds),
		commentIds: Array.from(allCommentIds),
		moderationIds: Array.from(allModerationIds),
	};

	console.log('\n' + '='.repeat(50));
	console.log('Aggregation Summary');
	console.log('='.repeat(50));
	console.log(`Portals processed: ${successCount}/${portalProcesses.length}`);
	console.log(`Total unique posts: ${result.postIds.length}`);
	console.log(`Total unique users: ${result.userIds.length}`);
	console.log(`Total unique comment processes: ${result.commentIds.length}`);
	console.log(`Total unique moderation processes: ${result.moderationIds.length}`);
	console.log(`Errors: ${errorCount}`);
	console.log('='.repeat(50) + '\n');

	return result;
}

/**
 * Creates a combined list of all process IDs to hydrate
 */
function createHydrationList(aggregatedIds) {
	const hydrationList = [];

	aggregatedIds.portalIds.forEach((id) => {
		hydrationList.push({ id, type: 'portal' });
	});

	aggregatedIds.postIds.forEach((id) => {
		hydrationList.push({ id, type: 'post' });
	});

	aggregatedIds.userIds.forEach((id) => {
		hydrationList.push({ id, type: 'user' });
	});

	aggregatedIds.commentIds.forEach((id) => {
		hydrationList.push({ id, type: 'comment' });
	});

	aggregatedIds.moderationIds.forEach((id) => {
		hydrationList.push({ id, type: 'moderation' });
	});

	return hydrationList;
}

// ============================================================================
// Helper Functions - Hydration
// ============================================================================

/**
 * Hydrates a single process on target nodes
 */
async function hydrateProcess(pid, type, targetNodes) {
	const typeLabel = `[${type}]`;

	try {
		console.log(`  Hydrating ${pid}... ${typeLabel}`);

		let nodeSuccess = false;

		for (const node of targetNodes) {
			try {
				console.log(`    → ${node}`);

				// Trigger hydration via cron
				const cronOnceUrl = `${node}/~cron@1.0/once?cron-path=${pid}~process@1.0/now`;
				const cronOnceRes = await fetch(cronOnceUrl, { method: 'GET' });

				console.log(`    Status: ${cronOnceRes.status}`);

				if (cronOnceRes.ok) {
					console.log(`    Hydration triggered successfully on ${node}`);
					nodeSuccess = true;

					// Add a small delay to let the process start
					await new Promise((resolve) => setTimeout(resolve, 2000));
				} else {
					console.error(`    Failed: HTTP ${cronOnceRes.status}`);
				}
			} catch (nodeErr) {
				console.error(`    Error on ${node}:`, nodeErr.message);
			}
		}

		if (nodeSuccess) {
			console.log(`  Success: ${pid.substring(0, 8)}... ${typeLabel}`);
			return true;
		} else {
			console.error(`  Failed on all nodes: ${pid.substring(0, 8)}... ${typeLabel}`);
			return false;
		}
	} catch (err) {
		console.error(`  Error hydrating ${pid.substring(0, 8)}... ${typeLabel}:`, err.message);
		return false;
	}
}

/**
 * Hydrates all processes in the list
 */
async function hydrateAllProcesses(hydrationList, targetNodes) {
	console.log(`\nStarting hydration of ${hydrationList.length} processes...\n`);

	const hydratedIds = loadHydratedIds();
	const total = hydrationList.length;
	let successCount = 0;
	let errorCount = 0;
	let skippedCount = 0;

	for (const item of hydrationList) {
		const { id, type } = item;

		if (hydratedIds.has(id)) {
			console.log(`  Skipping ${id.substring(0, 8)}... [${type}] (already hydrated)`);
			skippedCount++;
			continue;
		}

		const success = await hydrateProcess(id, type, targetNodes);

		if (success) {
			hydratedIds.add(id);
			successCount++;
			saveHydratedIds(hydratedIds); // Save after each success
		} else {
			errorCount++;
			saveError(id, 'Failed to hydrate', type);
		}

		console.log('-'.repeat(50));
	}

	console.log('\n' + '='.repeat(50));
	console.log('Hydration Complete');
	console.log('='.repeat(50));
	console.log(`Total: ${total}`);
	console.log(`Skipped: ${skippedCount} (already hydrated)`);
	console.log(`Success: ${successCount}/${total - skippedCount}`);
	console.log(`Errors: ${errorCount}/${total - skippedCount}`);
	console.log('='.repeat(50) + '\n');
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
	console.log('\n' + '='.repeat(50));
	console.log('Portal Ecosystem Hydration');
	console.log('='.repeat(50));
	console.log(`Source Node: ${PORTAL_SOURCE_NODE}`);
	console.log(`Target Nodes: ${TARGET_NODES.join(', ')}`);
	console.log(`Min Block: ${MIN_BLOCK}`);
	console.log('='.repeat(50) + '\n');

	try {
		// Step 1: Find all portal processes
		const portalProcesses = await findPortalProcesses();
		console.log(`\nFound ${portalProcesses.length} portal processes\n`);

		if (portalProcesses.length === 0) {
			console.log('No portals found. Exiting.');
			return;
		}

		// Step 2: Fetch portal data and aggregate all process IDs
		const aggregatedIds = await aggregatePortalEcosystemIds(portalProcesses, PORTAL_SOURCE_NODE);
		saveEcosystemData(aggregatedIds);

		// Step 3: Create hydration list
		console.log('Creating hydration list...\n');
		const hydrationList = createHydrationList(aggregatedIds);
		console.log(`Total processes to hydrate: ${hydrationList.length}\n`);

		// Step 4: Hydrate all processes
		await hydrateAllProcesses(hydrationList, TARGET_NODES);

		console.log('\nPortal ecosystem hydration complete!\n');
		console.log(`Output files:`);
		console.log(`  - ${OUTPUT_FILE} (hydrated process IDs)`);
		console.log(`  - ${ECOSYSTEM_DATA_FILE} (ecosystem data)`);
		if (fs.existsSync(ERROR_FILE)) {
			console.log(`  - ${ERROR_FILE} (errors)`);
		}
		console.log('');
	} catch (error) {
		console.error('\nFatal error:', error);
		saveError('main', error, 'fatal');
		process.exit(1);
	}
}

// Run the script
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Unhandled error:', error);
		process.exit(1);
	});
