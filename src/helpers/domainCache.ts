// Lightweight localStorage-based cache for domain lists
// Not intended to be a permanent solution – just enough to speed up initial renders.

export type NetworkLabel = 'mainnet' | 'testnet';

export interface CachedUserDomain {
	name: string;
	antId: string;
	target?: string;
	isRedirectedToPortal: boolean;
	startTimestamp?: number;
	recordType?: 'lease' | 'permabuy' | string;
	endTimestamp?: number;
	requiresAntUpdate?: boolean;
}

interface DomainCacheEnvelope {
	v: number;
	ts: number; // epoch ms
	domains: CachedUserDomain[];
}

const VERSION = 1;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function keyFor(walletAddress: string, network: NetworkLabel): string {
	return `portal:domainCache:v${VERSION}:${network}:${walletAddress}`;
}

export function loadCachedDomains(
	walletAddress: string,
	network: NetworkLabel,
	_maxAgeMs: number = DEFAULT_TTL_MS
): CachedUserDomain[] | null {
	try {
		const raw = localStorage.getItem(keyFor(walletAddress, network));
		if (!raw) return null;
		const env: DomainCacheEnvelope = JSON.parse(raw);
		if (!env || typeof env.ts !== 'number' || !Array.isArray(env.domains)) return null;
		return env.domains;
	} catch {
		return null;
	}
}

export function saveCachedDomains(walletAddress: string, network: NetworkLabel, domains: CachedUserDomain[]): void {
	try {
		const env: DomainCacheEnvelope = { v: VERSION, ts: Date.now(), domains };
		localStorage.setItem(keyFor(walletAddress, network), JSON.stringify(env));
	} catch {}
}
