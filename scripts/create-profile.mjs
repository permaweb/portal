import { connect, createSigner } from '@permaweb/aoconnect';
import Permaweb from '@permaweb/libs';
import Arweave from 'arweave';
import fs from 'fs';
import { Agent, setGlobalDispatcher } from 'undici';

import { checkValidAddress, debugLog } from './utils.mjs';

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
const PROFILE_IDS = config.profileCloneIds || [];

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

const AO_NODE = {
	url: 'https://hb.portalinto.com',
	authority: 'a5ZMUKbGClAsKzB4SHDYrwkOZZHIIfpbaxrmKwUHCe8',
	scheduler: 'n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo',
};

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

const permawebSource = Permaweb.init({ arweave, ao: aoSource, node: { ...AO_NODE } });
const permawebTarget = Permaweb.init({ arweave, ao: aoTarget, node: { ...AO_NODE } });

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

		console.log(result);

		return JSON.parse(result?.Messages?.[0]?.Data ?? {});
	} catch (error) {
		throw new Error(error);
	}
}

// async function createProfile(profileId) {
// 	if (!checkValidAddress(profileId)) {
// 		debugLog('error', 'createProfile', 'Invalid Address, Skipping...');
// 		return;
// 	}

// 	try {
// 		debugLog('info', 'createProfile', `Fetching profile data for ${profileId}...`);
// 		const internalZoneProcess = await fetchInternalZoneProcess(profileId);

// 		debugLog('info', 'createProfile', 'Creating New Profile...');
// 		const newProfileId = await permawebTarget.createProfile({
// 			username: internalZoneProcess.Store?.Username || 'None',
// 			displayName: internalZoneProcess.Store?.DisplayName || internalZoneProcess.Store?.Displayname || 'None',
// 			description: internalZoneProcess.Store?.Description || 'None',
// 			thumbnail: internalZoneProcess.Store?.Thumbnail || 'None',
// 			banner: internalZoneProcess.Store?.Banner || 'None',
// 		}, (status) => debugLog('info', 'createProfile', status));

// 		debugLog('success', 'createProfile', `New Profile ID: ${newProfileId}`);
// 		return newProfileId;
// 	} catch (error) {
// 		debugLog('error', 'createProfile', `Error cloning profile: ${error.message ?? '-'}`);
// 	}
// }

async function createProfile() {
	try {
		debugLog('info', 'createProfile', 'Creating New Profile...');
		const newProfileId = await permawebTarget.createProfile(
			{
				username: 'NickJ202-Mainnet',
				displayName: 'Nick',
				description: 'None',
				thumbnail: 'None',
				banner: 'None',
			},
			(status) => debugLog('info', 'createProfile', status)
		);

		debugLog('success', 'createProfile', `New Profile ID: ${newProfileId}`);
		return newProfileId;
	} catch (error) {
		debugLog('error', 'createProfile', `Error creating profile: ${error.message ?? '-'}`);
	}
}

async function main() {
	debugLog('info', 'main', 'Profile Cloning Process');
	debugLog('info', 'main', `Source Node: ${PORTAL_SOURCE_NODE}`);
	debugLog('info', 'main', `Target Node: ${TARGET_NODE}`);

	try {
		// Verify target node is running
		debugLog('info', 'main', 'Verifying target node is running...');

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

		// if (PROFILE_IDS.length <= 0) {
		// 	debugLog('error', 'main', 'No Profile IDs Provided');
		// 	process.exit(1);
		// }

		// // Clone all profiles
		// for (const profileId of PROFILE_IDS) {
		// 	await createProfile(profileId);
		// }

		await createProfile();

		debugLog('success', 'main', 'Profile cloning complete!');
	} catch (error) {
		debugLog('error', 'main', 'Fatal error:', error);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		debugLog('error', 'main', 'Unhandled error:', error);
		process.exit(1);
	});
