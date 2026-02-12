import { connect } from '@permaweb/aoconnect';
import Permaweb from '@permaweb/libs';
import Arweave from 'arweave';
import fs from 'fs';
import { Agent, setGlobalDispatcher } from 'undici';

import { debugLog } from './utils.mjs';

const config = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

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

const SCHEDULER = config.scheduler;
const PORTAL_SOURCE_NODE = config.portalSourceNode;
const TARGET_NODES = config.targetNodes;
const MIN_BLOCK = config.minBlock;
const PORTAL_IDS = config.portalIds;

const WRITE_TO_FILES = config.writeToFiles;

// Concurrency Configuration
const CONCURRENCY = {
	FETCH_PORTALS: config.concurrency.fetchPortals,
	HYDRATE_PROCESSES: config.concurrency.hydrateProcesses,
};

const DATA_DIR = config.dataDir;
const OUTPUT_FILE = `${DATA_DIR}/hydration-successes.json`;
const ECOSYSTEM_DATA_FILE = `${DATA_DIR}/hydration-data.json`;
const ERROR_FILE = `${DATA_DIR}/hydration-errors.json`;

const arweave = Arweave.init({});
const ao = connect({ MODE: 'legacy' });
const permaweb = Permaweb.init({ arweave, ao });

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

function loadHydratedProcesses() {
	return [];
}

function saveHydratedProcesses(processes) {
	if (!WRITE_TO_FILES) return;
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processes, null, 2));
}

function saveEcosystemData(data) {
	if (!WRITE_TO_FILES) {
		debugLog('info', 'saveEcosystemData', 'File writing disabled - ecosystem data not saved');
		return;
	}
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
	fs.writeFileSync(ECOSYSTEM_DATA_FILE, JSON.stringify(data, null, 2));
	debugLog('success', 'saveEcosystemData', `Saved ecosystem data to ${ECOSYSTEM_DATA_FILE}`);
}

function saveError(id, type, nodes, error) {
	if (!WRITE_TO_FILES) return;

	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}

	let errors = [];
	if (fs.existsSync(ERROR_FILE)) {
		try {
			errors = JSON.parse(fs.readFileSync(ERROR_FILE, 'utf8'));
		} catch (e) {
			// If file is corrupted, start fresh
			errors = [];
		}
	}

	errors.push({
		id,
		type,
		nodes,
		timestamp: new Date().toISOString(),
		error: error?.code || error?.message || String(error),
	});

	fs.writeFileSync(ERROR_FILE, JSON.stringify(errors, null, 2));
}

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

async function findPortalProcesses() {
	return []; // TODO

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

function isValidArweaveAddress(address) {
	return typeof address === 'string' && /^[a-zA-Z0-9_-]{43}$/.test(address);
}

function extractPostIds(portalData) {
	const postIds = [];

	try {
		const index = portalData?.posts?.Index;
		for (const post of index) {
			if (isValidArweaveAddress(post.Id)) {
				postIds.push(post.Id);
			} else {
				debugLog('warn', 'extractPostIds', `Skipping invalid post ID: ${post.Id}`);
			}
		}
	} catch (error) {
		debugLog('error', 'extractPostIds', 'Error extracting post IDs:', error.message);
	}

	return postIds;
}

function extractUserIds(portalData) {
	const userIds = [];

	try {
		const roles = portalData?.users?.Roles;
		if (roles && typeof roles === 'object') {
			Object.entries(roles).forEach(([key, value]) => {
				// Only include addresses with Type: 'process'
				if (isValidArweaveAddress(key) && value?.Type === 'process') {
					userIds.push(key);
				} else if (key && !isValidArweaveAddress(key) && value?.Type === 'process') {
					debugLog('warn', 'extractUserIds', `Skipping invalid user ID: ${key}`);
				}
			});
		}
	} catch (error) {
		debugLog('error', 'extractUserIds', 'Error extracting user IDs:', error.message);
	}

	return userIds;
}

function extractCommentIds(portalData) {
	const commentIds = [];

	try {
		const index = {}; // TODO
		if (index && typeof index === 'object') {
			Object.values(index).forEach((post) => {
				const commentsId = post?.Comments;
				if (isValidArweaveAddress(commentsId)) {
					commentIds.push(commentsId);
				} else if (commentsId) {
					debugLog('warn', 'extractCommentIds', `Skipping invalid comment ID: ${commentsId}`);
				}
			});
		}
	} catch (error) {
		debugLog('error', 'extractCommentIds', 'Error extracting comment IDs:', error.message);
	}

	return commentIds;
}

function extractModerationId(portalData) {
	try {
		const moderationId = portalData?.['bootloader-moderation'];
		if (isValidArweaveAddress(moderationId)) {
			return moderationId;
		} else if (moderationId) {
			debugLog('warn', 'extractModerationId', `Skipping invalid moderation ID: ${moderationId}`);
		}
	} catch (error) {
		debugLog('error', 'extractModerationId', 'Error extracting moderation ID:', error.message);
	}

	return null;
}

function extractAllIdsFromPortal(portalData, portalId) {
	return {
		portalId: portalId,
		postIds: extractPostIds(portalData),
		userIds: extractUserIds(portalData),
		commentIds: extractCommentIds(portalData),
		moderationId: extractModerationId(portalData),
	};
}

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

		if (isValidArweaveAddress(result.portalId)) {
			allPortalIds.push(result.portalId);
		} else {
			debugLog('warn', 'aggregatePortalEcosystemIds', `Skipping invalid portal ID: ${result.portalId}`);
		}
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

async function hydrateProcess(pid, type, targetNodes) {
	const typeLabel = `[${type}]`;

	try {
		debugLog('info', 'hydrateProcess', `Starting hydration for ${pid} ${typeLabel}`);

		const targetSlotRes = await fetch(`${SCHEDULER}/${pid}~process@1.0/slot/current`);
		const targetSlot = await targetSlotRes.text();

		debugLog('info', 'hydrateProcess', `Target slot: ${targetSlot}`);

		const nodeResults = [];

		for (const node of targetNodes) {
			let currentSlot = 0;
			let nodeSuccess = false;

			try {
				debugLog('info', 'hydrateProcess', `Checking ${node}`);

				// First check if already hydrated
				try {
					const currentSlotRes = await fetch(`${node}/${pid}~process@1.0/compute/at-slot`, {
						method: 'GET',
					});

					if (currentSlotRes.ok) {
						currentSlot = Number(await currentSlotRes.text());
						debugLog('info', 'hydrateProcess', `Current slot on ${node}: ${currentSlot}, Target slot: ${targetSlot}`);

						if (currentSlot >= targetSlot) {
							debugLog(
								'success',
								'hydrateProcess',
								`Already hydrated ${pid} ${typeLabel} on ${node} (${currentSlot}/${targetSlot})`
							);
							nodeResults.push({ node, success: true });
							continue;
						}
					}
				} catch (checkErr) {
					debugLog('warn', 'hydrateProcess', `Could not check current slot on ${node}: ${checkErr.message}`);
				}

				debugLog('info', 'hydrateProcess', `Hydrating on ${node}`);

				// Trigger hydration via cron
				const cronOnceUrl = `${node}/~cron@1.0/once?cron-path=${pid}~process@1.0/now`;
				const cronOnceRes = await fetch(cronOnceUrl, { method: 'GET' });

				debugLog('info', 'hydrateProcess', `Initial cron status on ${node}: ${cronOnceRes.status}`);
				const cronId = await cronOnceRes.text();
				debugLog('info', 'hydrateProcess', `Cron ID on ${node}: ${cronId}`);

				if (cronOnceRes.ok) {
					debugLog('success', 'hydrateProcess', `Hydration triggered on ${node}`);

					// Add a small delay to let the schedule download
					await new Promise((resolve) => setTimeout(resolve, 2000));

					if (targetSlot) {
						debugLog('info', 'hydrateProcess', `Waiting for slot progress on ${node}: ${currentSlot} -> ${targetSlot}`);

						let lastSlot = currentSlot;

						while (currentSlot < targetSlot) {
							let retriesFailed = false;
							const previousSlot = currentSlot;

							currentSlot = await withRetries(
								async () => {
									const slotRes = await fetch(`${node}/${pid}~process@1.0/compute/at-slot`, {
										method: 'GET',
									});

									if (!slotRes.ok) {
										throw new Error(`HTTP ${slotRes.status}`);
									}

									const slot = Number(await slotRes.text());
									debugLog('info', 'hydrateProcess', `Process ${pid} on ${node} at slot ${slot} / ${targetSlot}`);
									return slot;
								},
								{
									maxRetries: 3,
									delayMs: 3000,
									backoff: true,
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
								retriesFailed = true;
								return currentSlot; // Return current slot if failed
							});

							// Check if slot progressed
							if (currentSlot === previousSlot) {
								debugLog('error', 'hydrateProcess', `Slot did not progress for ${pid} on ${node}`);
								break;
							}

							// Update last slot
							lastSlot = currentSlot;

							if (currentSlot >= targetSlot) {
								break;
							}

							// Exit if retries exhausted
							if (retriesFailed) {
								debugLog('error', 'hydrateProcess', `Max retries exhausted for ${pid} on ${node}`);
								break;
							}
						}

						if (currentSlot >= targetSlot) {
							nodeSuccess = true;
							debugLog(
								'success',
								'hydrateProcess',
								`Hydrated ${pid} ${typeLabel} on ${node} (${currentSlot}/${targetSlot})`
							);
						} else {
							debugLog('error', 'hydrateProcess', `Process ${pid} failed on ${node}`);
						}
					}
				} else {
					debugLog('error', 'hydrateProcess', `Failed to trigger cron on ${node}: HTTP ${cronOnceRes.status}`);
				}
			} catch (nodeErr) {
				debugLog('error', 'hydrateProcess', `Error on ${node}:`, nodeErr.message);
			}

			nodeResults.push({ node, success: nodeSuccess });
		}

		const successfulNodes = nodeResults.filter((r) => r.success);
		const failedNodes = nodeResults.filter((r) => !r.success);
		const anySuccess = successfulNodes.length > 0;

		if (anySuccess) {
			debugLog(
				'success',
				'hydrateProcess',
				`Hydrated ${pid} ${typeLabel} on ${successfulNodes.length}/${targetNodes.length} nodes`
			);
			return {
				success: true,
				successfulNodes: successfulNodes.map((r) => r.node),
				failedNodes: failedNodes.map((r) => r.node),
			};
		} else {
			debugLog('error', 'hydrateProcess', `Failed on all nodes: ${pid} ${typeLabel}`);
			return {
				success: false,
				successfulNodes: [],
				failedNodes: failedNodes.map((r) => r.node),
			};
		}
	} catch (err) {
		debugLog('error', 'hydrateProcess', `Exception hydrating ${pid} ${typeLabel}:`, err.message);
		return {
			success: false,
			successfulNodes: [],
			failedNodes: targetNodes,
		};
	}
}

async function hydrateAllProcesses(hydrationList, targetNodes) {
	debugLog(
		'info',
		'hydrateAllProcesses',
		`Starting hydration of ${hydrationList.length} processes (concurrency: ${CONCURRENCY.HYDRATE_PROCESSES})`
	);

	const hydratedProcesses = loadHydratedProcesses();
	const hydratedIdSet = new Set(hydratedProcesses.map((p) => p.id));
	const total = hydrationList.length;
	let successCount = 0;
	let errorCount = 0;
	let skippedCount = 0;

	const toHydrate = hydrationList.filter((item) => {
		if (hydratedIdSet.has(item.id)) {
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

	const results = await parallelLimit(
		toHydrate,
		async (item) => {
			const { id, type } = item;
			const hydrationResult = await hydrateProcess(id, type, targetNodes);
			return { id, type, ...hydrationResult };
		},
		CONCURRENCY.HYDRATE_PROCESSES
	);

	for (const result of results) {
		if (result.success) {
			hydratedProcesses.push({
				id: result.id,
				type: result.type,
				nodes: result.successfulNodes,
			});
			successCount++;
			saveHydratedProcesses(hydratedProcesses);

			// Also log partial failures to error file
			if (result.failedNodes.length > 0) {
				saveError(
					result.id,
					result.type,
					result.failedNodes,
					`Partial failure - succeeded on ${result.successfulNodes.length}/${targetNodes.length} nodes`
				);
			}
		} else {
			errorCount++;
			saveError(result.id, result.type, result.failedNodes, 'Failed to hydrate on all nodes');
		}
	}

	debugLog('info', 'hydrateAllProcesses', 'Hydration Complete');
	debugLog('info', 'hydrateAllProcesses', `Total: ${total}`);
	debugLog('info', 'hydrateAllProcesses', `Skipped: ${skippedCount} (already hydrated)`);
	debugLog('info', 'hydrateAllProcesses', `Success: ${successCount}/${total - skippedCount}`);
	debugLog('info', 'hydrateAllProcesses', `Errors: ${errorCount}/${total - skippedCount}`);
}

async function main() {
	debugLog('info', 'main', 'Portal Ecosystem Hydration');
	debugLog('info', 'main', `Source Node: ${PORTAL_SOURCE_NODE}`);
	debugLog('info', 'main', `Target Nodes: ${TARGET_NODES.join(', ')}`);
	debugLog('info', 'main', `Min Block: ${MIN_BLOCK}`);

	// Clear existing data files at start of run
	if (WRITE_TO_FILES && fs.existsSync(DATA_DIR)) {
		if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);
		if (fs.existsSync(ERROR_FILE)) fs.unlinkSync(ERROR_FILE);
		debugLog('info', 'main', 'Cleared existing data files');
	}

	try {
		// Verify target nodes are running
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

		// Find all portal processes via GraphQL
		const portalProcesses = await findPortalProcesses();
		debugLog('success', 'main', `Found ${portalProcesses.length} portal processes via GraphQL`);

		// Add any hardcoded portal IDs if not already present
		if (PORTAL_IDS.length > 0) {
			const existingIds = new Set(portalProcesses.map((p) => p.node?.id));
			const newHardcodedIds = PORTAL_IDS.filter((id) => !existingIds.has(id));

			if (newHardcodedIds.length > 0) {
				debugLog('info', 'main', `Adding ${newHardcodedIds.length} hardcoded portal IDs not already present`);
				const hardcodedProcesses = newHardcodedIds.map((id) => ({ node: { id } }));
				portalProcesses.push(...hardcodedProcesses);
			} else {
				debugLog('info', 'main', 'All hardcoded portal IDs already present in fetched results');
			}

			debugLog('info', 'main', `Total portals to process: ${portalProcesses.length}`);
		}

		if (portalProcesses.length === 0) {
			debugLog('warn', 'main', 'No portals found. Exiting.');
			return;
		}

		// Fetch portal data and aggregate all process IDs
		const aggregatedIds = await aggregatePortalEcosystemIds(portalProcesses, PORTAL_SOURCE_NODE);
		saveEcosystemData(aggregatedIds);

		// Step 3: Create hydration list
		debugLog('info', 'main', 'Creating hydration list...');
		const hydrationList = createHydrationList(aggregatedIds);
		debugLog('info', 'main', `Total processes to hydrate: ${hydrationList.length}`);

		// Hydrate all processes
		await hydrateAllProcesses(hydrationList, TARGET_NODES);

		debugLog('success', 'main', 'Portal ecosystem hydration complete!');
		if (WRITE_TO_FILES) {
			debugLog('info', 'main', 'Output files:');
			debugLog('info', 'main', `${OUTPUT_FILE} (hydrated process IDs)`);
			debugLog('info', 'main', `${ECOSYSTEM_DATA_FILE} (ecosystem data)`);
			if (fs.existsSync(ERROR_FILE)) {
				debugLog('info', 'main', `${ERROR_FILE} (errors)`);
			}
		}
	} catch (error) {
		debugLog('error', 'main', 'Fatal error:', error);
		saveError('main', 'fatal', TARGET_NODES, error);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		debugLog('error', 'main', 'Unhandled error:', error);
		process.exit(1);
	});
