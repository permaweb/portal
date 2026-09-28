// Code-only tuning for cold loads. All portal/profile/transaction workers share
// the request ceiling, so additional workers cannot multiply network concurrency.
export const BASE_READ_LIMITS = {
	requests: 16,
	portals: 8,
	transactions: 16,
} as const;
const QUERY_TTL_MS = 10_000;
const TRANSACTION_TIMEOUT_MS = 15_000;
let activeReads = 0;
let queryGeneration = 0;
const waitingReads: Array<() => void> = [];
const queryCache = new Map<string, { value: any; expiresAt: number }>();
const queryRequests = new Map<string, Promise<any>>();

export async function withBaseReadLimit<T>(read: () => Promise<T>): Promise<T> {
	if (activeReads >= BASE_READ_LIMITS.requests) await new Promise<void>((resolve) => waitingReads.push(resolve));
	else activeReads += 1;
	try {
		return await read();
	} finally {
		const next = waitingReads.shift();
		if (next) next();
		else activeReads -= 1;
	}
}

// JSON error envelopes (including null) are not immutable portal data. Keep
// these out of persistent caches; callers still validate schemas and authority.
export function isBaseTransactionJson(value: any): boolean {
	return (
		value?.mode === 'base' &&
		typeof value.portalId === 'string' &&
		['portal-manifest', 'portal-release', 'portal-checkpoint', 'portal-post'].includes(value.type)
	);
}

export async function fetchBaseTransactionJson(txId: string): Promise<any> {
	return withBaseReadLimit(async () => {
		const failures: string[] = [];
		const endpoints = [
			`https://arweave.net/${txId}`,
			`https://arweave.net/tx/${txId}/data`,
			// Bundled data items have no L1 transaction-data endpoint. Recover
			// them through an independent gateway when the primary route fails.
			`https://turbo-gateway.com/${txId}`,
		];
		for (const url of endpoints) {
			const controller = new AbortController();
			// Covers body reads and the global fetch wrapper's 429 cooldown too,
			// so repeated primary failures cannot prevent independent fallback.
			const timer = setTimeout(() => controller.abort(), TRANSACTION_TIMEOUT_MS);
			try {
				const response = await fetch(url, { cache: 'reload', signal: controller.signal });
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				let value: any;
				if (url.endsWith('/data')) {
					const encoded = (await response.text()).trim();
					if (!/^[A-Za-z0-9_-]+={0,2}$/.test(encoded)) throw new Error('Invalid transaction data');
					const bytes = Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), (char) =>
						char.charCodeAt(0)
					);
					value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
				} else value = await response.json();
				if (!isBaseTransactionJson(value)) throw new Error('Invalid portal transaction JSON');
				return value;
			} catch (error) {
				failures.push(`${url}: ${controller.signal.aborted ? 'Timed out' : error.message}`);
			} finally {
				clearTimeout(timer);
			}
		}
		throw new Error(`Unable to read transaction ${txId}: ${failures.join('; ')}`);
	});
}

export function invalidateBaseQueries() {
	queryGeneration += 1;
	queryCache.clear();
}

export async function queryBaseGateway(url: string, query: string, variables: Record<string, any>) {
	const body = JSON.stringify({ query, variables });
	const generation = queryGeneration;
	const key = `${generation}:${url}:${body}`;
	const cached = queryCache.get(key);
	if (cached && cached.expiresAt > Date.now()) return cached.value;
	const active = queryRequests.get(key);
	if (active) return active;

	const request = withBaseReadLimit(async () => {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body,
		});
		if (!response.ok) throw new Error(`Base portal discovery failed: ${response.status}`);
		const payload = await response.json();
		if (payload.errors?.length) throw new Error(payload.errors[0]?.message || 'Base portal discovery failed');
		// Bound session memory, and never retain failures or pre-write responses.
		for (const [cacheKey, entry] of queryCache) {
			if (entry.expiresAt <= Date.now()) queryCache.delete(cacheKey);
		}
		if (queryCache.size >= 100) queryCache.delete(queryCache.keys().next().value);
		if (generation === queryGeneration) queryCache.set(key, { value: payload, expiresAt: Date.now() + QUERY_TTL_MS });
		return payload;
	});
	queryRequests.set(key, request);
	try {
		return await request;
	} finally {
		queryRequests.delete(key);
	}
}
