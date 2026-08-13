import { STORAGE } from './config';

const ARWEAVE_GRAPHQL = 'https://arweave.net/graphql';
const ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;
const GRAPHQL_IDS_LIMIT = 9;
const PENDING_EVENT = 'portal-pending-transactions-changed';
const OBSERVED_PENDING_KEY = '__observed__';
const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PENDING_MAX_ENTRIES = 100;
const PENDING_RETRY_BASE_MS = 10_000;
const PENDING_RETRY_MAX_MS = 10 * 60 * 1000;
const PENDING_FETCH_CONCURRENCY = 8;

export type PendingTransaction = {
	id: string;
	address: string;
	portalId?: string;
	type: string;
	createdAt: number;
	attempts?: number;
	nextCheckAt?: number;
};

function available() {
	return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function emit(address: string) {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent(PENDING_EVENT, { detail: { address } }));
	}
}

function getStoredTransactions(key: string, expectedAddress?: string): PendingTransaction[] {
	if (!key || !available()) return [];
	try {
		const value = JSON.parse(localStorage.getItem(STORAGE.basePendingTransactions(key)) || '[]');
		if (!Array.isArray(value)) return [];
		return value
			.filter(
				(entry) =>
					entry &&
					ARWEAVE_ID.test(entry.id) &&
					(!expectedAddress || entry.address === expectedAddress) &&
					typeof entry.type === 'string' &&
					Number.isFinite(entry.createdAt)
			)
			.map((entry) => ({
				...entry,
				attempts: Number.isFinite(entry.attempts) ? Math.max(0, entry.attempts) : 0,
				nextCheckAt: Number.isFinite(entry.nextCheckAt) ? entry.nextCheckAt : entry.createdAt,
			}));
	} catch {
		return [];
	}
}

export function getPendingTransactions(address: string, portalId?: string): PendingTransaction[] {
	if (!address || !available()) return [];
	const cutoff = Date.now() - PENDING_MAX_AGE_MS;
	const own = getStoredTransactions(address, address).filter((entry) => entry.createdAt >= cutoff);
	const observed = portalId
		? getStoredTransactions(OBSERVED_PENDING_KEY).filter(
				(entry) => entry.portalId === portalId && entry.createdAt >= cutoff
		  )
		: [];
	return Array.from(new Map([...observed, ...own].map((entry) => [entry.id, entry])).values()).sort(
		(left, right) => right.createdAt - left.createdAt
	);
}

function savePendingTransactions(address: string, entries: PendingTransaction[]) {
	if (!address || !available()) return;
	const key = STORAGE.basePendingTransactions(address);
	const serialized = JSON.stringify(entries);
	if (localStorage.getItem(key) === serialized) return;
	localStorage.setItem(key, serialized);
	emit(address);
}

export function trackPendingTransaction(entry: PendingTransaction) {
	if (!entry.address || !ARWEAVE_ID.test(entry.id)) return;
	const entries = getPendingTransactions(entry.address);
	const existing = entries.find((candidate) => candidate.id === entry.id);
	const nextEntry = { ...entry, attempts: existing?.attempts || 0, nextCheckAt: existing?.nextCheckAt || Date.now() };
	const next = existing
		? entries.map((candidate) => (candidate.id === entry.id ? { ...candidate, ...nextEntry } : candidate))
		: [nextEntry, ...entries];
	savePendingTransactions(entry.address, next.slice(0, PENDING_MAX_ENTRIES));
}

export function trackObservedPendingTransaction(entry: Omit<PendingTransaction, 'address'>) {
	if (
		!entry.portalId ||
		!ARWEAVE_ID.test(entry.id) ||
		!available() ||
		entry.createdAt < Date.now() - PENDING_MAX_AGE_MS
	) {
		return;
	}
	const entries = getStoredTransactions(OBSERVED_PENDING_KEY);
	if (entries.some((candidate) => candidate.id === entry.id)) return;
	const next = [{ ...entry, address: OBSERVED_PENDING_KEY, attempts: 0, nextCheckAt: Date.now() }, ...entries].slice(
		0,
		PENDING_MAX_ENTRIES
	);
	localStorage.setItem(STORAGE.basePendingTransactions(OBSERVED_PENDING_KEY), JSON.stringify(next));
	emit(OBSERVED_PENDING_KEY);
}

async function mapWithConcurrency<T>(values: T[], limit: number, mapper: (value: T) => Promise<void>) {
	let cursor = 0;
	const workers = Array.from({ length: Math.min(Math.max(1, limit), values.length) }, async () => {
		while (cursor < values.length) await mapper(values[cursor++]);
	});
	await Promise.all(workers);
}

async function coldLoadableTransactionIds(entries: PendingTransaction[]): Promise<Set<string>> {
	const byId = new Map(entries.map((entry) => [entry.id, entry]));
	const ids = Array.from(byId.keys());
	const indexed = new Set<string>();
	for (let offset = 0; offset < ids.length; offset += GRAPHQL_IDS_LIMIT) {
		const chunk = ids.slice(offset, offset + GRAPHQL_IDS_LIMIT);
		const response = await fetch(ARWEAVE_GRAPHQL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `
					query PendingPortalTransactions($ids: [ID!], $first: Int!) {
						transactions(ids: $ids, first: $first) { edges { node { id } } }
					}
				`,
				variables: { ids: chunk, first: chunk.length },
			}),
		});
		if (!response.ok) throw new Error(`Pending transaction check failed: ${response.status}`);
		const payload = await response.json();
		if (payload.errors?.length) throw new Error(payload.errors[0]?.message || 'Pending transaction check failed');
		for (const edge of payload.data?.transactions?.edges || []) indexed.add(edge.node.id);
	}
	const loadable = new Set<string>();
	await mapWithConcurrency(Array.from(indexed), PENDING_FETCH_CONCURRENCY, async (id) => {
		try {
			const response = await fetch(`https://arweave.net/${id}`, { cache: 'force-cache' });
			if (!response.ok) return;
			const entry = byId.get(id);
			if (
				entry?.type === 'portal-release' ||
				entry?.type === 'portal-manifest' ||
				entry?.type === 'portal-checkpoint' ||
				entry?.type === 'portal-post'
			) {
				const payload = await response.json();
				if (
					payload?.mode !== 'base' ||
					payload?.type !== entry.type ||
					(entry.portalId && payload?.portalId !== entry.portalId)
				) {
					return;
				}
			}
			loadable.add(id);
		} catch {}
	});
	return loadable;
}

export async function refreshPendingTransactions(address: string, portalId?: string): Promise<PendingTransaction[]> {
	const entries = getPendingTransactions(address, portalId);
	if (!entries.length) return entries;
	const now = Date.now();
	const due = entries.filter((entry) => (entry.nextCheckAt || 0) <= now);
	if (!due.length) return entries;
	try {
		const loadable = await coldLoadableTransactionIds(due);
		const dueIds = new Set(due.map((entry) => entry.id));
		const pending = entries
			.filter((entry) => !loadable.has(entry.id))
			.map((entry) => {
				if (!dueIds.has(entry.id)) return entry;
				const attempts = (entry.attempts || 0) + 1;
				return {
					...entry,
					attempts,
					nextCheckAt: now + Math.min(PENDING_RETRY_BASE_MS * 2 ** Math.min(attempts - 1, 10), PENDING_RETRY_MAX_MS),
				};
			});
		const own = pending.filter((entry) => entry.address === address);
		savePendingTransactions(address, own);
		if (portalId) {
			const observed = pending.filter((entry) => entry.address === OBSERVED_PENDING_KEY);
			const storedObserved = getStoredTransactions(OBSERVED_PENDING_KEY);
			const nextObserved = [
				...storedObserved.filter((entry) => entry.portalId !== portalId && entry.createdAt >= now - PENDING_MAX_AGE_MS),
				...observed,
			].slice(0, PENDING_MAX_ENTRIES);
			if (JSON.stringify(nextObserved) !== JSON.stringify(storedObserved)) {
				localStorage.setItem(STORAGE.basePendingTransactions(OBSERVED_PENDING_KEY), JSON.stringify(nextObserved));
				emit(OBSERVED_PENDING_KEY);
			}
		}
		return pending;
	} catch {
		return entries;
	}
}

export function subscribeToPendingTransactions(address: string, callback: () => void) {
	if (typeof window === 'undefined') return () => undefined;
	const listener = (event: Event) => {
		const detail = (event as CustomEvent).detail;
		if (!detail?.address || detail.address === address || detail.address === OBSERVED_PENDING_KEY) callback();
	};
	window.addEventListener(PENDING_EVENT, listener);
	return () => window.removeEventListener(PENDING_EVENT, listener);
}
