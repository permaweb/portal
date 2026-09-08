const CACHE_PREFIX = 'portal-bundle-cache-';
// Keep existing downloads usable when this worker is upgraded.
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const MUTABLE_CACHE_NAME = `${CACHE_PREFIX}mutable-v2`;
const RETRY_AT_HEADER = 'X-Portal-Retry-At';
const REFRESH_RETRY_MS = 60 * 1000;
const HASHED_ASSET = /\/assets\/[^/]+-[a-zA-Z0-9_-]{8,}\.[^/]+$/;
const BUNDLE_FILE = /\.(?:js|css|woff2?|ttf|otf|svg|png|jpe?g|webp|avif|ico)$/i;
const pending = new Map();

self.addEventListener('install', (event) => {
	// The browser already fetched the document. Pre-caching it downloads it twice
	// and risks keeping an old deployment's HTML around.
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => name.startsWith(CACHE_PREFIX) && ![CACHE_NAME, MUTABLE_CACHE_NAME].includes(name))
						.map((name) => caches.delete(name))
				)
			)
			.then(() => self.clients.claim())
	);
});

async function retainCached(cache, request, cached, response) {
	const now = Date.now();
	let retryAt = now + REFRESH_RETRY_MS;
	const retryAfter = response?.headers.get('Retry-After');
	if (retryAfter) {
		const seconds = Number(retryAfter);
		const requestedAt = Number.isFinite(seconds) ? now + Math.max(0, seconds) * 1000 : Date.parse(retryAfter);
		if (Number.isFinite(requestedAt)) retryAt = Math.max(retryAt, requestedAt);
	}
	// Persist the cooldown with the existing bytes so worker restarts and other
	// tabs cannot turn repeated stale cache hits into a gateway retry burst.
	const stored = cached.clone();
	const headers = new Headers(stored.headers);
	headers.set(RETRY_AT_HEADER, String(retryAt));
	await cache
		?.put(request, new Response(stored.body, { status: stored.status, statusText: stored.statusText, headers }))
		.catch(() => undefined);
	return cached;
}

async function readBundle(request, hashed) {
	const cache = await caches.open(hashed ? CACHE_NAME : MUTABLE_CACHE_NAME).catch(() => null);
	const cached = await cache?.match(request).catch(() => undefined);
	if (cached && Number(cached.headers.get(RETRY_AT_HEADER)) > Date.now()) return cached;

	try {
		// Revalidate against the gateway even if the browser's HTTP cache is fresh.
		const response = await fetch(new Request(request, { cache: 'no-cache' }));
		if (response.status === 200 && response.type === 'basic') {
			// Cache quota/private-mode failures should never fail a valid download.
			await cache?.put(request, response.clone()).catch(() => undefined);
		} else if (cached) {
			// A rate limit or gateway outage must not evict a usable local asset.
			return retainCached(cache, request, cached, response);
		}
		return response;
	} catch (error) {
		if (cached) return retainCached(cache, request, cached);
		throw error;
	}
}

function refreshBundle(request, hashed) {
	// Concurrent consumers share both cold downloads and background refreshes.
	const key = `${request.credentials}:${request.url}`;
	if (!pending.has(key)) {
		const task = readBundle(request, hashed).finally(() => pending.delete(key));
		pending.set(key, task);
	}
	return pending.get(key).then((response) => response.clone());
}

async function serveBundle(request, hashed) {
	const cache = await caches.open(hashed ? CACHE_NAME : MUTABLE_CACHE_NAME).catch(() => null);
	const cached = await cache?.match(request).catch(() => undefined);
	const refresh = refreshBundle(request, hashed);
	// A hash-shaped filename alone is not an integrity or freshness check.
	// Serve cached bytes promptly, but refresh every bundle in the background.
	return cached ? { response: cached, refresh } : { response: await refresh };
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (
		request.method !== 'GET' ||
		request.mode === 'navigate' ||
		['no-store', 'reload', 'no-cache'].includes(request.cache)
	)
		return;
	const url = new URL(request.url);
	const hashed = HASHED_ASSET.test(url.pathname);
	if (
		url.origin !== self.location.origin ||
		!(BUNDLE_FILE.test(url.pathname) || (hashed && url.pathname.endsWith('.json')))
	)
		return;
	// Service worker updates and explicitly bypassed/ranged requests belong to the browser.
	if (url.pathname.endsWith('/service-worker.js') || request.headers.has('range')) return;
	const task = serveBundle(request, hashed);
	event.respondWith(task.then(({ response }) => response));
	event.waitUntil(task.then(({ refresh }) => refresh).catch(() => undefined));
});

self.addEventListener('message', (event) => {
	if (!['CLEAR_CACHE', 'CLEAR_MUTABLE_CACHE'].includes(event.data?.type)) return;
	const mutableOnly = event.data.type === 'CLEAR_MUTABLE_CACHE';
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => (mutableOnly ? name === MUTABLE_CACHE_NAME : name.startsWith(CACHE_PREFIX)))
						.map((name) => caches.delete(name))
				)
			)
			.then(() => {
				// Reload only the requesting page; other tabs may have unsaved work.
				event.source?.postMessage({ type: 'CACHE_CLEARED' });
			})
	);
});
