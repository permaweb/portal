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

const SCHEDULER = 'https://schedule.forward.computer';
const PORTAL_SOURCE_NODE = 'https://hb.portalinto.com';
const TARGET_NODES = ['http://localhost:8734'];
const MIN_BLOCK = 1836780;

const PORTAL_IDS = [
	'Uko7_w8kUt91gpXpXpXtbjfHgOn_KPC5APoqN8lFvT8', // Permaweb Journal
];

const WRITE_TO_FILES = false; // Toggle to control file writing

// Concurrency Configuration
const CONCURRENCY = {
	FETCH_PORTALS: 1, // Number of portals to fetch data from simultaneously
	HYDRATE_PROCESSES: 2, // Number of processes to hydrate simultaneously
};

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
// Helper Functions - Logging
// ============================================================================

const COLORS = {
	info: '\x1b[90m', // Gray
	warn: '\x1b[33m', // Yellow
	error: '\x1b[31m', // Red
	success: '\x1b[32m', // Green
	reset: '\x1b[0m', // Reset
};

const METHOD = {
	info: console.log,
	warn: console.log,
	error: console.log,
	success: console.log,
};

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function debugLog(level, context, ...args) {
	const color = COLORS[level] || COLORS.info;
	const method = METHOD[level] || console.log;

	const formattedArgs = args.map((arg) =>
		typeof arg === 'object' && arg !== null ? JSON.stringify(arg, null, 2) : arg
	);

	method(`${color}[${capitalize(level)}]${COLORS.reset} -`, ...formattedArgs);
}

// ============================================================================
// Helper Functions - Retry Logic
// ============================================================================

/**
 * Executes a function with retries and validation
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.delayMs - Initial delay between retries in ms (default: 1000)
 * @param {boolean} options.backoff - Whether to use exponential backoff (default: true)
 * @param {Function} options.validate - Optional validation function for the result
 * @returns {Promise<*>} The result of the function
 */
async function withRetries(fn, options = {}) {
	const { maxRetries = 3, delayMs = 1000, backoff = true, validate } = options;

	let lastError;
	let lastResult;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const result = await fn();

			if (!validate || validate(result)) {
				if (attempt > 0) {
					debugLog('success', 'withRetries', `Success on attempt ${attempt + 1}`);
				}
				return result;
			}

			lastResult = result;
			if (attempt < maxRetries - 1) {
				const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
				debugLog(
					'warn',
					'withRetries',
					`Validation failed on attempt ${attempt + 1}/${maxRetries}, retrying in ${delay}ms...`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		} catch (error) {
			lastError = error;
			if (attempt < maxRetries - 1) {
				const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
				debugLog(
					'warn',
					'withRetries',
					`Error on attempt ${attempt + 1}/${maxRetries}: ${error.message}, retrying in ${delay}ms...`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	if (lastError) {
		debugLog('error', 'withRetries', `Failed after ${maxRetries} attempts: ${lastError.message}`);
		throw lastError;
	}

	debugLog('warn', 'withRetries', `Validation failed after ${maxRetries} attempts`);
	return lastResult;
}

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
	if (!WRITE_TO_FILES) return;
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(Array.from(ids), null, 2));
}

/**
 * Saves ecosystem data for reference
 */
function saveEcosystemData(data) {
	if (!WRITE_TO_FILES) {
		debugLog('info', 'saveEcosystemData', 'File writing disabled - ecosystem data not saved');
		return;
	}
	fs.writeFileSync(ECOSYSTEM_DATA_FILE, JSON.stringify(data, null, 2));
	debugLog('success', 'saveEcosystemData', `Saved ecosystem data to ${ECOSYSTEM_DATA_FILE}`);
}

/**
 * Logs an error to the error file
 */
function saveError(pid, error, type = 'unknown') {
	if (!WRITE_TO_FILES) return;

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
// Helper Functions - Concurrency
// ============================================================================

/**
 * Executes tasks in parallel with concurrency limit
 * @param {Array} items - Array of items to process
 * @param {Function} fn - Async function to execute for each item
 * @param {number} concurrency - Max number of concurrent executions
 * @returns {Promise<Array>} Array of results
 */
async function parallelLimit(items, fn, concurrency) {
	const results = [];
	const executing = [];

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const promise = Promise.resolve().then(() => fn(item, i));
		results.push(promise);

		if (concurrency <= items.length) {
			const e = promise.then(() => executing.splice(executing.indexOf(e), 1));
			executing.push(e);
			if (executing.length >= concurrency) {
				await Promise.race(executing);
			}
		}
	}

	return Promise.all(results);
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
	debugLog('info', 'findPortalProcesses', 'Finding portal processes via GraphQL...');

	const tags = [
		{ name: 'Data-Protocol', values: ['ao'] },
		{ name: 'Variant', values: ['ao.N.1'] },
		{ name: 'Type', values: ['Process'] },
		{ name: 'Zone-Type', values: ['Portal'] },
	];

	const gqlArgs = { tags, minBlock: MIN_BLOCK };

	const portals = await getAggregatedGQLData(gqlArgs, (message) => debugLog('info', 'findPortalProcesses', message));

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
		const url = `${sourceNode}/${portalId}~process@1.0/compute?require-codec=application/json&accept-bundle=true`;
		debugLog('info', 'fetchPortalData', `Fetching data for ${portalId}...`);

		const response = await fetch(url);

		if (!response.ok) {
			debugLog('warn', 'fetchPortalData', `Failed to fetch portal ${portalId}: HTTP ${response.status}`);
			return null;
		}

		const data = await response.json();
		debugLog('success', 'fetchPortalData', `Successfully fetched ${portalId}`);
		return data;
	} catch (error) {
		debugLog('error', 'fetchPortalData', `Error fetching portal ${portalId}:`, error.message);
		return null;
	}
}

/**
 * Extracts post IDs from Store.Index (based on PORTAL_PATCH_MAP.Posts)
 */
function extractPostIds(portalData) {
	const postIds = [];

	try {
		const index = portalData?.posts?.Index;
		for (const post of index) {
			postIds.push(post.Id);
		}
	} catch (error) {
		debugLog('error', 'extractPostIds', 'Error extracting post IDs:', error.message);
	}

	return postIds;
}

/**
 * Extracts user IDs from Roles (based on PORTAL_PATCH_MAP.Users)
 */
function extractUserIds(portalData) {
	const userIds = [];

	try {
		const roles = portalData?.users?.Roles;
		if (roles && typeof roles === 'object') {
			Object.entries(roles).forEach(([key, value]) => {
				// Only include addresses with Type: 'process'
				if (key && /^[a-zA-Z0-9_-]{43}$/.test(key) && value?.Type === 'process') {
					userIds.push(key);
				}
			});
		}
	} catch (error) {
		debugLog('error', 'extractUserIds', 'Error extracting user IDs:', error.message);
	}

	return userIds;
}

/**
 * Extracts comment process IDs from post metadata
 */
function extractCommentIds(portalData) {
	const commentIds = [];

	try {
		const index = {}; // TODO
		if (index && typeof index === 'object') {
			Object.values(index).forEach((post) => {
				const commentsId = post?.Comments;
				if (commentsId && /^[a-zA-Z0-9_-]{43}$/.test(commentsId)) {
					commentIds.push(commentsId);
				}
			});
		}
	} catch (error) {
		debugLog('error', 'extractCommentIds', 'Error extracting comment IDs:', error.message);
	}

	return commentIds;
}

/**
 * Extracts moderation process ID from Store.Moderation (based on PORTAL_PATCH_MAP.Overview)
 */
function extractModerationId(portalData) {
	try {
		const moderationId = portalData?.['bootloader-moderation'];
		if (moderationId && /^[a-zA-Z0-9_-]{43}$/.test(moderationId)) {
			return moderationId;
		}
	} catch (error) {
		debugLog('error', 'extractModerationId', 'Error extracting moderation ID:', error.message);
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
 * Aggregates all process IDs from multiple portals (with concurrency)
 */
async function aggregatePortalEcosystemIds(portalProcesses, sourceNode) {
	debugLog(
		'info',
		'aggregatePortalEcosystemIds',
		`Aggregating IDs from ${portalProcesses.length} portals (concurrency: ${CONCURRENCY.FETCH_PORTALS})`
	);

	const allPortalIds = [];
	const allPostIds = new Set();
	const allUserIds = new Set();
	const allCommentIds = new Set();
	const allModerationIds = new Set();

	let successCount = 0;
	let errorCount = 0;

	// Process portals in parallel with concurrency limit
	const results = await parallelLimit(
		portalProcesses,
		async (process) => {
			const portalId = process?.node?.id;
			if (!portalId) {
				debugLog('warn', 'aggregatePortalEcosystemIds', 'Skipping process with no ID');
				return { success: false };
			}

			const portalData = await fetchPortalData(portalId, sourceNode);

			if (!portalData) {
				debugLog('warn', 'aggregatePortalEcosystemIds', `Failed to fetch data for portal ${portalId}`);
				return { success: false, portalId };
			}

			const extracted = extractAllIdsFromPortal(portalData, portalId);

			debugLog(
				'success',
				'aggregatePortalEcosystemIds',
				`Portal ${portalId}: ${extracted.postIds.length} posts, ${extracted.userIds.length} users, ${extracted.commentIds.length} comments`
			);

			// Small delay to avoid overwhelming the server
			await new Promise((resolve) => setTimeout(resolve, 100));

			return { success: true, portalId, extracted };
		},
		CONCURRENCY.FETCH_PORTALS
	);

	// Aggregate results
	for (const result of results) {
		if (!result.success) {
			errorCount++;
			continue;
		}

		allPortalIds.push(result.portalId);
		result.extracted.postIds.forEach((id) => allPostIds.add(id));
		result.extracted.userIds.forEach((id) => allUserIds.add(id));
		result.extracted.commentIds.forEach((id) => allCommentIds.add(id));
		if (result.extracted.moderationId) allModerationIds.add(result.extracted.moderationId);
		successCount++;
	}

	const aggregatedResult = {
		portalIds: allPortalIds,
		postIds: Array.from(allPostIds),
		userIds: Array.from(allUserIds),
		commentIds: Array.from(allCommentIds),
		moderationIds: Array.from(allModerationIds),
	};

	debugLog('info', 'aggregatePortalEcosystemIds', '='.repeat(50));
	debugLog('info', 'aggregatePortalEcosystemIds', 'Aggregation Summary');
	debugLog('info', 'aggregatePortalEcosystemIds', '='.repeat(50));
	debugLog('info', 'aggregatePortalEcosystemIds', `Portals processed: ${successCount}/${portalProcesses.length}`);
	debugLog('info', 'aggregatePortalEcosystemIds', `Total unique posts: ${aggregatedResult.postIds.length}`);
	debugLog('info', 'aggregatePortalEcosystemIds', `Total unique users: ${aggregatedResult.userIds.length}`);
	debugLog(
		'info',
		'aggregatePortalEcosystemIds',
		`Total unique comment processes: ${aggregatedResult.commentIds.length}`
	);
	debugLog(
		'info',
		'aggregatePortalEcosystemIds',
		`Total unique moderation processes: ${aggregatedResult.moderationIds.length}`
	);
	debugLog('info', 'aggregatePortalEcosystemIds', `Errors: ${errorCount}`);
	debugLog('info', 'aggregatePortalEcosystemIds', '='.repeat(50));

	return aggregatedResult;
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
		debugLog('info', 'hydrateProcess', `Starting hydration for ${pid} ${typeLabel}`);

		let nodeSuccess = false;

		const targetSlotRes = await fetch(`${SCHEDULER}/${pid}~process@1.0/slot/current`);
		const targetSlot = await targetSlotRes.text();

		debugLog('info', 'hydrateProcess', `Target slot: ${targetSlot}`);

		let currentSlot = 0;

		for (const node of targetNodes) {
			try {
				debugLog('info', 'hydrateProcess', `Checking ${node}`);

				// First check if already hydrated
				try {
					const currentSlotRes = await fetch(`${node}/${pid}~process@1.0/compute/at-slot`, {
						method: 'GET',
					});

					if (currentSlotRes.ok) {
						currentSlot = Number(await currentSlotRes.text());
						debugLog('info', 'hydrateProcess', `Current slot: ${currentSlot}, Target slot: ${targetSlot}`);

						if (currentSlot >= targetSlot) {
							debugLog(
								'success',
								'hydrateProcess',
								`Already hydrated ${pid} ${typeLabel} (${currentSlot}/${targetSlot})`
							);
							return true;
						}
					}
				} catch (checkErr) {
					debugLog('warn', 'hydrateProcess', `Could not check current slot: ${checkErr.message}`);
				}

				debugLog('info', 'hydrateProcess', `Hydrating on ${node}`);

				// Trigger hydration via cron
				const cronOnceUrl = `${node}/~cron@1.0/once?cron-path=${pid}~process@1.0/now`;
				const cronOnceRes = await fetch(cronOnceUrl, { method: 'GET' });

				debugLog('info', 'hydrateProcess', `Initial cron status: ${cronOnceRes.status}`);
				const cronId = await cronOnceRes.text();
				debugLog('info', 'hydrateProcess', `Cron ID: ${cronId}`);

				if (cronOnceRes.ok) {
					debugLog('success', 'hydrateProcess', `Hydration triggered on ${node}`);

					// Add a small delay to let the schedule download
					await new Promise((resolve) => setTimeout(resolve, 2000));

					if (targetSlot) {
						debugLog('info', 'hydrateProcess', `Waiting for slot progress: ${currentSlot} -> ${targetSlot}`);

						let lastSlot = currentSlot;

						while (currentSlot < targetSlot) {
							currentSlot = await withRetries(
								async () => {
									const slotRes = await fetch(`${node}/${pid}~process@1.0/compute/at-slot`, {
										method: 'GET',
									});

									if (!slotRes.ok) {
										throw new Error(`HTTP ${slotRes.status}`);
									}

									const slot = Number(await slotRes.text());
									debugLog('info', 'hydrateProcess', `Process ${pid} at slot ${slot} / ${targetSlot}`);
									return slot;
								},
								{
									maxRetries: 100,
									delayMs: 2000,
									backoff: false,
									validate: (slot) => {
										// Validate that slot is progressing
										if (slot === lastSlot) {
											debugLog('warn', 'hydrateProcess', `Slot stalled for ${pid} on ${node}`);
											return false;
										}
										return true;
									},
								}
							).catch((error) => {
								debugLog('error', 'hydrateProcess', `Failed to get slot for ${pid} on ${node}:`, error.message);
								return currentSlot; // Return current slot if failed
							});

							// Update last slot
							lastSlot = currentSlot;

							if (currentSlot >= targetSlot) {
								break;
							}
						}

						if (currentSlot >= targetSlot) {
							nodeSuccess = true;
						} else {
							debugLog('error', 'hydrateProcess', `Process ${pid} failed on ${node}`);
						}
					}
				} else {
					debugLog('error', 'hydrateProcess', `Failed to trigger cron: HTTP ${cronOnceRes.status}`);
				}
			} catch (nodeErr) {
				debugLog('error', 'hydrateProcess', `Error on ${node}:`, nodeErr.message);
			}
		}

		if (nodeSuccess) {
			debugLog('success', 'hydrateProcess', `Hydrated ${pid} ${typeLabel} (${currentSlot}/${targetSlot})`);
			return true;
		} else {
			debugLog('error', 'hydrateProcess', `Failed on all nodes: ${pid} ${typeLabel}`);
			return false;
		}
	} catch (err) {
		debugLog('error', 'hydrateProcess', `Exception hydrating ${pid} ${typeLabel}:`, err.message);
		return false;
	}
}

/**
 * Hydrates all processes in the list (with concurrency)
 */
async function hydrateAllProcesses(hydrationList, targetNodes) {
	debugLog(
		'info',
		'hydrateAllProcesses',
		`Starting hydration of ${hydrationList.length} processes (concurrency: ${CONCURRENCY.HYDRATE_PROCESSES})`
	);

	const hydratedIds = loadHydratedIds();
	const total = hydrationList.length;
	let successCount = 0;
	let errorCount = 0;
	let skippedCount = 0;

	// Filter out already hydrated processes
	const toHydrate = hydrationList.filter((item) => {
		if (hydratedIds.has(item.id)) {
			debugLog(
				'info',
				'hydrateAllProcesses',
				`Skipping ${item.id.substring(0, 8)}... [${item.type}] (already hydrated)`
			);
			skippedCount++;
			return false;
		}
		return true;
	});

	// Hydrate processes in parallel with concurrency limit
	const results = await parallelLimit(
		toHydrate,
		async (item) => {
			const { id, type } = item;
			const success = await hydrateProcess(id, type, targetNodes);
			return { id, type, success };
		},
		CONCURRENCY.HYDRATE_PROCESSES
	);

	// Process results and save progress
	for (const result of results) {
		if (result.success) {
			hydratedIds.add(result.id);
			successCount++;
			saveHydratedIds(hydratedIds); // Save after each success
		} else {
			errorCount++;
			saveError(result.id, 'Failed to hydrate', result.type);
		}
	}

	debugLog('info', 'hydrateAllProcesses', 'Hydration Complete');
	debugLog('info', 'hydrateAllProcesses', `Total: ${total}`);
	debugLog('info', 'hydrateAllProcesses', `Skipped: ${skippedCount} (already hydrated)`);
	debugLog('info', 'hydrateAllProcesses', `Success: ${successCount}/${total - skippedCount}`);
	debugLog('info', 'hydrateAllProcesses', `Errors: ${errorCount}/${total - skippedCount}`);
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
	debugLog('info', 'main', 'Portal Ecosystem Hydration');
	debugLog('info', 'main', `Source Node: ${PORTAL_SOURCE_NODE}`);
	debugLog('info', 'main', `Target Nodes: ${TARGET_NODES.join(', ')}`);
	debugLog('info', 'main', `Min Block: ${MIN_BLOCK}`);

	try {
		// Step 0: Verify target nodes are running
		debugLog('info', 'main', 'Verifying target nodes are running...');
		for (const node of TARGET_NODES) {
			try {
				const pingUrl = `${node}/~meta@1.0/info/address`;
				const pingRes = await fetch(pingUrl, {
					method: 'GET',
				});

				if (!pingRes.ok) {
					debugLog('error', 'main', `Target node ${node} returned HTTP ${pingRes.status}`);
					debugLog('error', 'main', 'Aborting: Target node is not responding correctly');
					process.exit(1);
				}

				debugLog('success', 'main', `Target node ${node} is running`);
			} catch (error) {
				debugLog('error', 'main', `Cannot reach target node ${node}:`, error.message);
				debugLog('error', 'main', 'Aborting: Target node is not accessible');
				process.exit(1);
			}
		}
		debugLog('success', 'main', 'All target nodes verified');

		// Step 1: Find all portal processes via GraphQL
		const portalProcesses = await findPortalProcesses();
		debugLog('success', 'main', `Found ${portalProcesses.length} portal processes via GraphQL`);

		// Add any hardcoded portal IDs
		if (PORTAL_IDS.length > 0) {
			debugLog('info', 'main', `Adding ${PORTAL_IDS.length} hardcoded portal IDs`);
			const hardcodedProcesses = PORTAL_IDS.map((id) => ({ node: { id } }));
			portalProcesses.push(...hardcodedProcesses);
			debugLog('info', 'main', `Total portals to process: ${portalProcesses.length}`);
		}

		if (portalProcesses.length === 0) {
			debugLog('warn', 'main', 'No portals found. Exiting.');
			return;
		}

		// Step 2: Fetch portal data and aggregate all process IDs
		const aggregatedIds = await aggregatePortalEcosystemIds(portalProcesses, PORTAL_SOURCE_NODE);
		saveEcosystemData(aggregatedIds);

		// Step 3: Create hydration list
		debugLog('info', 'main', 'Creating hydration list...');
		const hydrationList = createHydrationList(aggregatedIds);
		debugLog('info', 'main', `Total processes to hydrate: ${hydrationList.length}`);

		// Step 4: Hydrate all processes
		await hydrateAllProcesses(hydrationList, TARGET_NODES);

		debugLog('success', 'main', 'Portal ecosystem hydration complete!');
		if (WRITE_TO_FILES) {
			debugLog('info', 'main', 'Output files:');
			debugLog('info', 'main', `  - ${OUTPUT_FILE} (hydrated process IDs)`);
			debugLog('info', 'main', `  - ${ECOSYSTEM_DATA_FILE} (ecosystem data)`);
			if (fs.existsSync(ERROR_FILE)) {
				debugLog('info', 'main', `  - ${ERROR_FILE} (errors)`);
			}
		}
	} catch (error) {
		debugLog('error', 'main', 'Fatal error:', error);
		saveError('main', error, 'fatal');
		process.exit(1);
	}
}

// Run the script
main()
	.then(() => process.exit(0))
	.catch((error) => {
		debugLog('error', 'main', 'Unhandled error:', error);
		process.exit(1);
	});
