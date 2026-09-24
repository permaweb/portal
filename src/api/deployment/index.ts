import { APP_DEPLOYMENT } from 'helpers/config';
import { checkValidAddress } from 'helpers/utils';

export type DeploymentRecord = { transactionId: string };

let deploymentRequest: Promise<DeploymentRecord> | null = null;
let resolvedDeployment: DeploymentRecord | null = null;

function toTargetTransaction(value: unknown): string {
	if (typeof value === 'string') return value.trim();
	if (!value || typeof value !== 'object') return '';

	const carried = (value as Record<string, unknown>).target ?? (value as Record<string, unknown>)['reference-value'];
	return typeof carried === 'string' ? carried.trim() : '';
}

async function readDeployment(): Promise<DeploymentRecord> {
	if (!checkValidAddress(APP_DEPLOYMENT.process)) throw new Error('Invalid deployment process');

	const url = new URL(`${APP_DEPLOYMENT.process}~process@1.0/now`, `${APP_DEPLOYMENT.gateway}/`);
	url.searchParams.set('require-codec', 'application/json');
	url.searchParams.set('accept-bundle', 'true');
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), APP_DEPLOYMENT.readTimeoutMs);

	try {
		const response = await fetch(url.toString(), {
			headers: { accept: 'application/json' },
			signal: controller.signal,
		});
		if (!response.ok) throw new Error(`Deployment lookup failed: HTTP ${response.status}`);

		const state: unknown = await response.json();
		if (!state || typeof state !== 'object') throw new Error('Invalid deployment state');
		const record = state as Record<string, unknown>;
		const device = record['execution-device'] ?? record.device;
		if (device !== 'carrier@1.0' && device !== 'name-token@1.0') {
			throw new Error('Deployment process is not a name token');
		}
		if (record.name !== APP_DEPLOYMENT.name) throw new Error('Deployment name does not match');

		const transactionId = toTargetTransaction(record.value);
		if (!checkValidAddress(transactionId)) throw new Error('Deployment target is not a transaction ID');

		resolvedDeployment = { transactionId };
		return resolvedDeployment;
	} finally {
		clearTimeout(timeout);
	}
}

// Route changes share one lookup; failed reads can be retried on the next mount.
export function getDeployedTransaction(options: { signal?: AbortSignal } = {}): Promise<DeploymentRecord> {
	const { signal } = options;
	if (signal?.aborted) return Promise.reject(new DOMException('Deployment lookup cancelled', 'AbortError'));

	if (!deploymentRequest) {
		deploymentRequest = readDeployment().catch((error) => {
			deploymentRequest = null;
			throw error;
		});
	}
	if (!signal) return deploymentRequest;

	return new Promise((resolve, reject) => {
		const handleAbort = () => reject(new DOMException('Deployment lookup cancelled', 'AbortError'));
		signal.addEventListener('abort', handleAbort, { once: true });
		deploymentRequest.then(resolve, reject).finally(() => signal.removeEventListener('abort', handleAbort));
	});
}

export function peekDeployedTransaction(): DeploymentRecord | null {
	return resolvedDeployment;
}
