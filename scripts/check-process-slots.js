import fs from 'fs';

import { debugLog } from './utils.js';

const config = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

const MAX_RETRIES = config.checkProcessSlots.maxRetries;
const LATENCY_THRESHOLD = config.checkProcessSlots.latencyThreshold;
const SCHEDULER = config.scheduler;
const DATA_DIR = config.dataDir;
const READ_FILE = `${DATA_DIR}/hydration-successes.json`;

async function main() {
	debugLog('info', 'main', 'Starting process slots check...');
	const { alerts } = await scanProcesses();

	if (alerts.length > 0) {
		debugLog('error', 'main', `Found ${alerts.length} alert(s):`);
		for (const alert of alerts) {
			debugLog('error', 'main', alert);
		}
	} else {
		debugLog('success', 'main', 'All processes within threshold');
	}
}

async function getSchedulerSlot(processId) {
	const targetSlotRes = await fetch(`${SCHEDULER}/${processId}~process@1.0/slot/current`);
	const targetSlot = Number(await targetSlotRes.text());
	return targetSlot;
}

async function getNodeSlot(processId, node) {
	const slotRes = await fetch(`${node}/${processId}~process@1.0/compute/at-slot`, {
		method: 'GET',
	});

	if (!slotRes.ok) {
		throw new Error(`HTTP ${slotRes.status}`);
	}

	const currentSlot = Number(await slotRes.text());
	return currentSlot;
}

async function scanProcesses() {
	if (!fs.existsSync(READ_FILE)) {
		throw new Error(`File not found: ${READ_FILE}`);
	}
	const processes = JSON.parse(fs.readFileSync(READ_FILE, 'utf-8'));
	const alerts = [];

	debugLog('info', 'scanProcesses', `Checking ${processes.length} processes...`);

	try {
		for (const process of processes) {
			const { id, type, nodes } = process;

			for (const node of nodes) {
				debugLog('info', 'scanProcesses', `Checking ${id} [${type}] on ${node}`);
				let consecutiveFailures = 0;

				for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
					try {
						const schedulerSlot = await getSchedulerSlot(id);
						const nodeSlot = await getNodeSlot(id, node);
						const slotDiff = schedulerSlot - nodeSlot;

						if (slotDiff > LATENCY_THRESHOLD) {
							consecutiveFailures++;
							debugLog(
								'warn',
								'scanProcesses',
								`${id} [${type}] behind by ${slotDiff} slots (${consecutiveFailures}/${MAX_RETRIES})`
							);

							if (consecutiveFailures >= MAX_RETRIES) {
								const alertMsg = `${id} [${type}] on ${node}: ${slotDiff} slots behind (node: ${nodeSlot}, scheduler: ${schedulerSlot})`;
								alerts.push(alertMsg);
								debugLog('error', 'scanProcesses', alertMsg);
								break;
							}

							await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
						} else {
							debugLog('success', 'scanProcesses', `${id} [${type}] within threshold (diff: ${slotDiff})`);
							break;
						}
					} catch (e) {
						debugLog('warn', 'scanProcesses', `${id} [${type}] error on attempt ${attempt}: ${e.message}`);
						if (attempt === MAX_RETRIES) {
							const alertMsg = `${id} [${type}] on ${node}: failed after ${MAX_RETRIES} attempts - ${e.message}`;
							alerts.push(alertMsg);
							debugLog('error', 'scanProcesses', alertMsg);
						}
						await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
					}
				}
			}
		}

		return { alerts };
	} catch (e) {
		debugLog('error', 'scanProcesses', `Error: ${e.message}`);
		return { alerts: [] };
	}
}

main()
	.then(() => process.exit(0))
	.catch((e) => {
		debugLog('error', 'main', `Unhandled error: ${e.message}`);
		process.exit(1);
	});
