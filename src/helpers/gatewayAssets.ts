// SVG injection normally uses XMLHttpRequest, which bypasses the gateway fetch
// scheduler. Share the scheduled fetch across mounted icons and keep a bounded
// cache of bytes; each component owns and revokes its own object URL.
const MAX_CACHED_ASSETS = 128;
const MAX_CACHED_BYTES = 8 * 1024 * 1024;

type AssetEntry = {
	promise: Promise<Blob>;
	controller: AbortController;
	users: number;
	blob?: Blob;
};

const assets = new Map<string, AssetEntry>();

export function isGatewayAsset(source: string): boolean {
	if (typeof source !== 'string' || !source.trim()) return false;
	try {
		const url = new URL(source, typeof window === 'undefined' ? 'https://portal.invalid' : window.location.href);
		return (
			(url.protocol === 'https:' || url.protocol === 'http:') &&
			(url.hostname === 'arweave.net' || url.hostname.endsWith('.arweave.net'))
		);
	} catch {
		return false;
	}
}

function trimCache() {
	let bytes = 0;
	let count = 0;
	assets.forEach((entry) => {
		if (entry.blob) {
			bytes += entry.blob.size;
			count += 1;
		}
	});
	for (const [key, entry] of assets) {
		if (count <= MAX_CACHED_ASSETS && bytes <= MAX_CACHED_BYTES) break;
		if (!entry.users && entry.blob) {
			assets.delete(key);
			bytes -= entry.blob.size;
			count -= 1;
		}
	}
}

export function acquireGatewayAsset(source: string, withCredentials = false) {
	const key = `${withCredentials ? 'include' : 'same-origin'}:${source}`;
	let entry = assets.get(key);
	if (!entry) {
		const controller = new AbortController();
		entry = {
			controller,
			users: 0,
			promise: Promise.resolve().then(async () => {
				const response = await fetch(source, {
					signal: controller.signal,
					credentials: withCredentials ? 'include' : 'same-origin',
					cache: 'force-cache',
				});
				if (!response.ok) throw new Error(`Unable to load SVG: ${response.status} ${source}`);
				const blob = await response.blob();
				entry.blob = blob;
				trimCache();
				return blob;
			}),
		};
		assets.set(key, entry);
		entry.promise.catch(() => {
			if (assets.get(key) === entry) assets.delete(key);
		});
	} else {
		// Move recently used entries to the end of the eviction order.
		assets.delete(key);
		assets.set(key, entry);
	}
	entry.users += 1;
	let released = false;
	return {
		promise: entry.promise,
		release() {
			if (released) return;
			released = true;
			entry.users -= 1;
			if (!entry.users && !entry.blob) {
				if (assets.get(key) === entry) assets.delete(key);
				entry.controller.abort();
			}
			trimCache();
		},
	};
}
