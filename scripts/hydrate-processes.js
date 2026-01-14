import fs from 'fs';
import { Agent, setGlobalDispatcher } from 'undici';

import Arweave from 'arweave';
import Permaweb from '@permaweb/libs';
import { connect } from '@permaweb/aoconnect';

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

const SU_URL = 'https://su-router.ao-testnet.xyz';
const DEFAULT_NODES = ['https://app-1.forward.computer', 'https://app-2.forward.computer'];

const file = 'processes.json';
const arweave = Arweave.init({});
const ao = connect({ MODE: 'legacy' });
const permaweb = Permaweb.init({ arweave, ao });

const map = {
	profiles: {
		nodes: DEFAULT_NODES,
		tags: [
			{ name: 'Type', values: ['Process'] },
			{ name: 'Variant', values: ['ao.TN.1'] },
			{ name: 'Zone-Type', values: ['User'] },
		],
	},
	collections: {
		nodes: DEFAULT_NODES,
		tags: [
			{ name: 'Type', values: ['Process'] },
			{ name: 'Variant', values: ['ao.TN.1'] },
			{ name: 'Action', values: ['Add-Collection'] },
		],
	},
	orderbooks: {
		nodes: DEFAULT_NODES,
		tags: [
			{ name: 'Type', values: ['Process'] },
			{ name: 'Variant', values: ['ao.TN.1'] },
			{ name: 'UCM-Process', values: ['Orderbook'] },
		],
		minBlock: 1784259,
	},
	assetActivity: {
		nodes: DEFAULT_NODES,
		tags: [
			{ name: 'Type', values: ['Process'] },
			{ name: 'Variant', values: ['ao.TN.1'] },
			{ name: 'UCM-Process', values: ['Asset-Activity'] },
		],
	},
	assetsModule1: {
		nodes: DEFAULT_NODES,
		tags: [
			{ name: 'Data-Protocol', values: ['ao'] },
			{ name: 'Variant', values: ['ao.TN.1'] },
			{ name: 'Type', values: ['Process'] },
			{ name: 'Implements', values: ['ANS-110'] },
			{
				name: 'Module',
				values: ['URgYpPQzvxxfYQtjrIQ116bl3YBfcImo3JEnNo8Hlrk'],
			},
		],
		filterData: true,
	},
	assetsModule2: {
		nodes: DEFAULT_NODES,
		tags: [
			{ name: 'Data-Protocol', values: ['ao'] },
			{ name: 'Variant', values: ['ao.TN.1'] },
			{ name: 'Type', values: ['Process'] },
			{ name: 'Implements', values: ['ANS-110'] },
			{
				name: 'Module',
				values: ['Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350'],
			},
		],
		filterData: true,
	},
	portals: {
		nodes: DEFAULT_NODES,
		tags: [
			{ name: 'Data-Protocol', values: ['ao'] },
			{ name: 'Variant', values: ['ao.N.1'] },
			{ name: 'Type', values: ['Process'] },
			{ name: 'Zone-Type', values: ['User'] },
		],
		minBlock: 1808011,
	},
};

function loadFile() {
	if (fs.existsSync(file)) {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	}
	return { profiles: [], collections: [] };
}

function saveFile(data) {
	fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function saveError(key, pid, error) {
	const errorFile = `${key}-errors.json`;
	let errors = [];

	if (fs.existsSync(errorFile)) {
		errors = JSON.parse(fs.readFileSync(errorFile, 'utf8'));
	}

	errors.push({
		pid,
		timestamp: new Date().toISOString(),
		error: error?.code || error?.message || String(error),
	});

	fs.writeFileSync(errorFile, JSON.stringify(errors, null, 2));
}

function filterData(gqlData) {
	const filtered = gqlData.filter((item) => {
		const tags = item?.node?.tags || [];
		return !tags.some((tag) => {
			const value = tag.value?.toLowerCase() || '';
			return value.includes('test') || value.includes('example') || value.includes('copy');
		});
	});
	console.log(`Filtered nodes: ${filtered.length} (from ${gqlData.length})`);
	return filtered;
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

			console.log(args);

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

const getGQLData = async (key) => {
	const file = `${key}.json`;

	if (fs.existsSync(file)) {
		console.log(`Using cached data for ${key}`);
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	}

	if (!map[key]) {
		throw new Error(`Unknown key: ${key}`);
	}

	try {
		console.log(`Fetching fresh data for ${key}...`);

		const gqlArgs = { tags: map[key].tags };
		if (map[key].minBlock) gqlArgs.minBlock = map[key].minBlock;

		let data = await getAggregatedGQLData(gqlArgs, (message) => console.log(message));

		if (map[key].filterData) data = filterData(data);

		fs.writeFileSync(file, JSON.stringify(data, null, 2));
		console.log(`Saved fresh data to ${file}`);

		return data;
	} catch (e) {
		console.error(`Failed to fetch ${key}`, e);
		return [];
	}
};

export function getTagValue(list, name) {
	for (let i = 0; i < list.length; i++) {
		if (list[i]) {
			if (list[i].name === name) {
				return list[i].value;
			}
		}
	}
	return null;
}

async function hydrateSync(key) {
	console.log(`Hydrating ${key}...`);
	try {
		const data = loadFile();
		if (!Array.isArray(data[key])) data[key] = [];

		const existing = new Set(data[key]);

		const processes = await getGQLData(key);
		const total = processes.length;
		let successCount = 0;
		let errorCount = 0;
		let skippedCount = 0;

		console.log(`Total processes to hydrate: ${total}`);

		for (const process of processes) {
			const pid = process?.node?.id;

			if (!pid) {
				console.warn(`Skipping entry with no pid for key ${key}`);
				skippedCount++;
				continue;
			}

			if (existing.has(pid)) {
				console.log(`Skipping ${pid} (already hydrated)`);
				skippedCount++;
				continue;
			}

			try {
				console.log(`Hydrating ${pid}...`);

				let targetSlot = null;
				const variant = getTagValue(process.node.tags, 'Variant');

				if (variant === 'ao.TN.1') {
					// Get target slot first
					const targetSlotRes = await fetch(`${SU_URL}/${pid}/latest`);
					const targetSlotParsed = await targetSlotRes.json();

					targetSlot = Number(getTagValue(targetSlotParsed.assignment.tags, 'Nonce'));
					console.log(`Target Slot for ${pid}: ${targetSlot}`);
				}

				// Hydrate on all nodes
				let nodeSuccess = false;

				for (const node of map[key].nodes) {
					try {
						console.log(`Hydrating ${pid} on ${node}...`);

						// Kickoff hydration
						const cronOnceUrl = `${node}/~cron@1.0/once?cron-path=${pid}~process@1.0/now`;

						const cronOnceRes = await fetch(cronOnceUrl, {
							method: 'GET',
						});

						console.log(`Initial Cron Status for ${node}: ${cronOnceRes.status}`);

						console.log(`Cron ID: ${await cronOnceRes.text()}`);

						if (targetSlot) {
							// Wait for process to reach target slot
							let currentSlot = 0;

							console.log(`Current Slot: ${currentSlot}, Target Slot: ${targetSlot}`);

							// Wait until schedule is downloaded
							await new Promise((resolve) => setTimeout(resolve, 1000));

							let stallCount = 0;
							let lastSlot = currentSlot;

							while (currentSlot < targetSlot) {
								try {
									// Get current slot from process
									const slotRes = await fetch(`${node}/${pid}~process@1.0/compute/at-slot`, {
										method: 'GET',
									});

									if (slotRes.ok) {
										currentSlot = Number(await slotRes.text());
										console.log(`Process ${pid} at slot ${currentSlot} / ${targetSlot} on ${node}`);

										// Check if slot progressed
										if (currentSlot === lastSlot) {
											stallCount++;
											console.warn(`Slot stalled for ${pid} on ${node}: ${stallCount}/3 attempts`);

											if (stallCount >= 3) {
												console.error(
													`Process ${pid} slot not progressing after 3 attempts on ${node} - skipping node`
												);
												break;
											}
										} else {
											stallCount = 0;
											lastSlot = currentSlot;
										}
									} else {
										console.warn(`Failed to get slot for ${pid} on ${node}: HTTP ${slotRes.status}`);
									}

									if (currentSlot >= targetSlot) {
										break;
									}

									const waitTime = 2000;
									await new Promise((resolve) => setTimeout(resolve, waitTime));
								} catch (error) {
									console.error(`Error checking slot for ${pid} on ${node}: ${error.message}`);
									await new Promise((resolve) => setTimeout(resolve, 5000));
								}
							}

							if (currentSlot >= targetSlot) {
								console.log(`Process ${pid} reached target slot on ${node}`);
								nodeSuccess = true;
							} else {
								console.error(`Process ${pid} failed on ${node}`);
							}
						}
					} catch (nodeErr) {
						console.error(`Error hydrating ${pid} on ${node}: ${nodeErr.message}`);
					}
				}

				console.log(`Process: ${pid} - Hydrated`);

				if (nodeSuccess) {
					data[key].push(pid);
					existing.add(pid);
					successCount++;
					console.log(`Success: ${pid} (${successCount}/${total - skippedCount})`);
				} else {
					errorCount++;
					console.error(`Error: ${pid} failed on all nodes - skipping (${errorCount} errors`);
					saveError(key, pid, `Failed on all nodes`);
				}
			} catch (err) {
				errorCount++;
				console.warn(`Fetch failed for ${pid}; skipping. (${errorCount} errors)`, err?.code ?? err?.message ?? err);
				saveError(key, pid, err);
			}

			console.log('-'.repeat(50));
		}

		console.log(`\nHydration complete for ${key}:`);
		console.log(`  Total: ${total}`);
		console.log(`  Skipped: ${skippedCount} (already hydrated)`);
		console.log(`  Success: ${successCount}/${total - skippedCount}`);
		console.log(`  Errors: ${errorCount}/${total - skippedCount}`);
	} catch (e) {
		console.error(e);
		saveError(key, 'hydration-error', e);
	}
}

function formatRoutes(key) {
	const file = `${key}.json`;
	const data = JSON.parse(fs.readFileSync(file, 'utf8'));
	const routes = {};
	for (const element of data) {
		routes[element.node.id] = 'https://app-1.forward.computer';
	}
	fs.writeFileSync(`${key}-routes.json`, JSON.stringify(routes, null, 2));
}

(async function () {
	const args = process.argv.slice(2);

	const keys =
		args.length > 0
			? args
					.join(',')
					.split(',')
					.map((k) => k.trim())
					.filter(Boolean)
			: [];

	if (!keys || keys.length === 0) {
		console.error('No keys provided. Valid keys are:', Object.keys(map).join(', '));
		process.exit(1);
	}

	for (const key of keys) {
		await hydrateSync(key);
		// formatRoutes(key);
	}

	process.exit(0);
})();
