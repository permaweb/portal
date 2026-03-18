import { connect, createSigner } from '@permaweb/aoconnect';
import Permaweb from '@permaweb/libs';
import Arweave from 'arweave';
import fs from 'fs';
import { Agent, setGlobalDispatcher } from 'undici';

import { ASSET_UPLOAD, PORTAL_DATA, PORTAL_PATCH_MAP, PORTAL_POST_DATA } from './config.mjs';
import { checkValidAddress, debugLog, fetchZoneData, getBootTag, getPatchMapTag } from './utils.mjs';

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

const SCHEDULER_ADDRESS = config.schedulerAddress;
const PORTAL_SOURCE_NODE = config.portalSourceNode;
const TARGET_NODES = config.targetNodes;
const TARGET_NODE = TARGET_NODES[0];
const PORTAL_IDS = config.portalCloneIds;

const WRITE_TO_FILES = config.writeToFiles;

const DATA_DIR = config.dataDir;
const OUTPUT_FILE = `${DATA_DIR}/clone-successes.json`;
const ERROR_FILE = `${DATA_DIR}/clone-errors.json`;
const INTERNAL_ZONE_CACHE_FILE = `${DATA_DIR}/internal-zone-cache.json`;

let walletPath;
if (config.walletPath) {
	if (config.walletPath.startsWith('process.env.')) {
		const envVar = config.walletPath.replace('process.env.', '');
		walletPath = process.env[envVar];
		if (!walletPath) {
			console.error(`Environment variable ${envVar} is not set`);
			process.exit(1);
		}
	} else {
		walletPath = config.walletPath;
	}
} else {
	walletPath = process.env.PATH_TO_WALLET;
}

if (!walletPath) {
	console.error('No wallet path configured. Set walletPath in config or PATH_TO_WALLET env var');
	process.exit(1);
}

const WALLET = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
const SIGNER = createSigner(WALLET);

const arweave = Arweave.init({});

const aoSource = connect({
	MODE: 'mainnet',
	URL: PORTAL_SOURCE_NODE,
	SCHEDULER: SCHEDULER_ADDRESS,
	signer: SIGNER,
});

const aoTarget = connect({
	MODE: 'mainnet',
	URL: TARGET_NODE,
	SCHEDULER: SCHEDULER_ADDRESS,
	signer: SIGNER,
});

const permawebSource = Permaweb.init({ arweave, ao: aoSource });
const permawebTarget = Permaweb.init({ arweave, ao: aoTarget });

async function fetchInternalZoneProcess(zoneId) {
	try {
		const message = await aoSource.message({
			process: zoneId,
			tags: [{ name: 'Action', value: 'Info' }],
		});

		const result = await aoSource.result({
			process: zoneId,
			message: message,
		});

		return JSON.parse(result?.Messages?.[0]?.Data ?? {});
	} catch (error) {
		throw new Error(error);
	}
}

async function getZone(zoneId) {
	// Load cached internal zone data if it exists
	let internalZoneCache = {};
	if (fs.existsSync(INTERNAL_ZONE_CACHE_FILE)) {
		try {
			internalZoneCache = JSON.parse(fs.readFileSync(INTERNAL_ZONE_CACHE_FILE, 'utf-8'));
			debugLog('info', 'getZone', `Loaded ${Object.keys(internalZoneCache).length} cached internal zone processes`);
		} catch (error) {
			debugLog('warning', 'getZone', 'Failed to read cache file, will fetch fresh data');
		}
	}

	// Check if we have cached data for this zone
	let internalZoneProcess;
	if (internalZoneCache[zoneId]) {
		debugLog('info', 'getZone', `Using cached data for zone ${zoneId}`);
		internalZoneProcess = internalZoneCache[zoneId];
	} else {
		debugLog('info', 'getZone', `Fetching fresh data for zone ${zoneId}`);
		internalZoneProcess = await fetchInternalZoneProcess(zoneId);
		// Cache the fetched data
		internalZoneCache[zoneId] = internalZoneProcess;
		// Save to file immediately
		if (!fs.existsSync(DATA_DIR)) {
			fs.mkdirSync(DATA_DIR, { recursive: true });
		}
		fs.writeFileSync(INTERNAL_ZONE_CACHE_FILE, JSON.stringify(internalZoneCache, null, 2));
	}

	return internalZoneProcess;
}

async function processRoles(currentRoles, currentOwner) {
	let portalOwnerProfile = null;

	for (const role in currentRoles) {
		if (currentRoles[role].Type === 'process') {
			debugLog('info', 'processRoles', `Looking up ${role}...`);

			const profileLookup = await permawebSource.getGQLData({
				ids: [role],
			});

			const owner = profileLookup.data?.[0]?.node?.owner?.address;
			if (owner === currentOwner) {
				portalOwnerProfile = role;
			}

			if (portalOwnerProfile) {
				break;
			}
		}
	}

	if (!portalOwnerProfile) return currentRoles;

	debugLog('info', 'processRoles', `Profile to replace: ${portalOwnerProfile}`);
	debugLog('info', 'processRoles', `Wallet: ${currentOwner}`);

	const internalZoneProcess = await getZone(portalOwnerProfile);

	debugLog('info', 'processRoles', 'Creating New Owner Profile...');
	const newProfileId = await permawebTarget.createProfile(
		{
			username: internalZoneProcess.Store?.Username || 'None',
			displayName: internalZoneProcess.Store?.DisplayName || internalZoneProcess.Store?.Displayname || 'None',
			description: internalZoneProcess.Store?.Description || 'None',
			thumbnail: internalZoneProcess.Store?.Thumbnail || 'None',
			banner: internalZoneProcess.Store?.Banner || 'None',
		},
		(status) => debugLog('info', 'processRoles', status)
	);

	debugLog('info', 'processRoles', `Profile ID: ${newProfileId}`);

	return {
		[internalZoneProcess.Owner]: { Roles: 'Admin', Type: 'wallet' },
		[newProfileId]: { Roles: 'Admin', Type: 'process' },
	};
}

// TODO: Replace Id, Creator, OriginPortal, Comments
// TODO: Replace Asset auth users with new portal id
// TODO: Replace old portal assets in profile
async function processIndex(currentIndex, args) {
	if (!currentIndex.length) return currentIndex;

	const updatedIndex = [];

	console.log(args);

	for (const element of currentIndex) {
		/* Ensure full post is present by checking metadata */
		if (element.Metadata) {
			try {
				let updatedElement = { ...element };

				debugLog('info', 'processIndex', `Fetching Post ${element.Id}...`);
				const currentAsset = await permawebSource.getAtomicAsset(element.Id);

				console.log(currentAsset);

				const spawnArgs = {
					name: element.Name,
					description: element.Metadata.Description || '',
					topics: element.Metadata.Topics,
					creator: args.newProfileId,
					data: PORTAL_POST_DATA(),
					contentType: ASSET_UPLOAD.contentType,
					assetType: ASSET_UPLOAD.ansType,
					users: [args.newPortalId],
					spawnComments: true,
				};

				// console.log(spawnArgs)
			} catch (error) {
				debugLog('error', 'processIndex', `Error Fetching Post: ${error.message ?? '-'}`);
			}
		}
	}

	return updatedIndex;
}

async function createPortal(data, owner) {
	try {
		const tags = [
			getBootTag('Name', data.Name),
			{ name: 'Content-Type', value: 'text/html' },
			{ name: 'Zone-Type', value: 'Test-Portal' },
		];

		for (const key of Object.keys(PORTAL_PATCH_MAP)) {
			tags.push(getPatchMapTag(key, PORTAL_PATCH_MAP[key]));
		}

		if (data.Banner) tags.push(getBootTag('Banner', data.Banner));
		if (data.Thumbnail) tags.push(getBootTag('Thumbnail', data.Thumbnail));

		const portalId = await permawebTarget.createZone(
			{
				tags: tags,
				data: PORTAL_DATA(),
				spawnModeration: false,
				authUsers: [owner],
			},
			(status) => debugLog('info', 'PortalManager', status)
		);

		debugLog('info', 'createPortal', `Portal ID: ${portalId}`);

		return portalId;
	} catch (error) {
		throw new Error(error);
	}
}

// 1. Create new zone with basic metadata from current
// 2. Create new profile for owner
// 3. Replace roles table in zone data, drop other users, add new profile
// 4. Eval zone data
// 5. Create posts, replace origin portal and creator with new ids
// 6: Replace old portal in profile

async function cloneAllProcesses(portalIds) {
	for (const existingPortalId of portalIds) {
		if (checkValidAddress(existingPortalId)) {
			try {
				const walletAddress = await arweave.wallets.jwkToAddress(WALLET);
				const internalZoneProcess = await getZone(existingPortalId);

				debugLog('info', 'cloneAllProcesses', `Wallet Address: ${walletAddress}`);
				debugLog('info', 'cloneAllProcesses', `Portal Owner: ${internalZoneProcess.Owner}`);

				if (walletAddress !== internalZoneProcess.Owner) {
					throw new Error('Wallet addresses do not match, skipping...');
				}

				debugLog('info', 'PortalManager', 'Creating New Portal...');
				const newPortalId = await createPortal(
					{
						Name: internalZoneProcess.Store?.Name ?? 'None',
						Logo: internalZoneProcess.Store?.Logo ?? 'None',
						Banner: internalZoneProcess.Store?.Banner ?? 'None',
					},
					internalZoneProcess.Owner
				);

				const updatedRoles = await processRoles(internalZoneProcess.Roles ?? {}, internalZoneProcess.Owner);
				console.log(updatedRoles);

				const newProfileId = Object.keys(updatedRoles).find((role) => updatedRoles[role].Type === 'process');

				// // TODO: Replace origin portal in index once created
				const updatedIndex = await processIndex(internalZoneProcess.Store?.Index ?? [], {
					newPortalId: newPortalId,
					newProfileId: newProfileId,
				});

				const updatedZoneData = {
					...internalZoneProcess,
					Roles: updatedRoles,
					Store: {
						...internalZoneProcess.Store,
						Index: updatedIndex,
					},
				};

				console.log(updatedZoneData);
			} catch (error) {
				// TODO: Write to error file
				debugLog('error', 'cloneAllProcesses', 'Error cloning process:', error.message ?? '-');
			}
		} else {
			debugLog('error', 'cloneAllProcesses', 'Invalid Address, Skipping...');
		}
	}
}

async function main() {
	debugLog('info', 'main', 'Portal Cloning Process');
	debugLog('info', 'main', `Source Node: ${PORTAL_SOURCE_NODE}`);
	debugLog('info', 'main', `Target Node: ${TARGET_NODE}`);

	// Clear existing data files at start of run
	if (WRITE_TO_FILES && fs.existsSync(DATA_DIR)) {
		if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);
		if (fs.existsSync(ERROR_FILE)) fs.unlinkSync(ERROR_FILE);
		debugLog('info', 'main', 'Cleared existing data files');
	}

	try {
		// Verify target nodes are running
		debugLog('info', 'main', 'Verifying target nodes are running...');

		try {
			const pingUrl = `${TARGET_NODE}/~meta@1.0/info/address`;
			const pingRes = await fetch(pingUrl, {
				method: 'GET',
			});

			if (!pingRes.ok) {
				debugLog('error', 'main', `Target node ${TARGET_NODE} returned HTTP ${pingRes.status}`);
				debugLog('error', 'main', 'Aborting: Target node is not responding correctly');
				process.exit(1);
			}

			debugLog('success', 'main', `Target node ${TARGET_NODE} is running`);
		} catch (error) {
			debugLog('error', 'main', `Cannot reach target node ${TARGET_NODE}:`, error.message);
			debugLog('error', 'main', 'Aborting: Target node is not accessible');
			process.exit(1);
		}

		debugLog('success', 'main', 'Target node verified');

		if (PORTAL_IDS.length <= 0) {
			debugLog('error', 'main', 'No Portal IDs Provided');
			process.exit(1);
		}

		// Clone all processes
		await cloneAllProcesses(PORTAL_IDS);

		debugLog('success', 'main', 'Portal cloning complete!');
		if (WRITE_TO_FILES) {
			debugLog('info', 'main', 'Output files:');
			debugLog('info', 'main', `${OUTPUT_FILE} (cloned process IDs)`);
			if (fs.existsSync(ERROR_FILE)) {
				debugLog('info', 'main', `${ERROR_FILE} (errors)`);
			}
		}
	} catch (error) {
		debugLog('error', 'main', 'Fatal error:', error);
		saveError('main', 'fatal', node, error);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		debugLog('error', 'main', 'Unhandled error:', error);
		process.exit(1);
	});
