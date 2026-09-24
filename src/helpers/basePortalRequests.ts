// Code-only tuning for cold loads. All portal/profile/transaction workers share
// the request ceiling, so additional workers cannot multiply network concurrency.
export const BASE_READ_LIMITS = {
	requests: 16,
	portals: 8,
	transactions: 16,
} as const;
const QUERY_TTL_MS = 10_000;
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

export async function fetchBaseTransactionJson(txId: string): Promise<any> {
	return withBaseReadLimit(async () => {
		try {
			const response = await fetch(`https://arweave.net/${txId}`, { cache: 'reload' });
			if (!response.ok) throw new Error(`Transaction ${txId}: ${response.status}`);
			return await response.json();
		} catch {
			// The content route can return an empty 200 even when an L1 upload is
			// available. The transaction API serves its original base64url bytes.
			const response = await fetch(`https://arweave.net/tx/${txId}/data`, { cache: 'reload' });
			if (!response.ok) throw new Error(`Transaction data ${txId}: ${response.status}`);
			const encoded = (await response.text()).trim();
			if (!/^[A-Za-z0-9_-]+={0,2}$/.test(encoded)) throw new Error(`Invalid transaction data: ${txId}`);
			const bytes = Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));
			return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
		}
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
