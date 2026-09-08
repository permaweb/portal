const CACHE_PREFIX = 'portal-engine-lite-';
// Preserve downloads across worker upgrades, revalidating them on use.
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const ARWEAVE_SCRIPT = /\/[a-zA-Z0-9_-]{43}$/;
const RETRY_AT_HEADER = 'X-Portal-Retry-At';
const REFRESH_RETRY_MS = 60 * 1000;
const pending = new Map();

function isEngineTransactionUrl(url) {
	return ['http:', 'https:'].includes(url.protocol) && ARWEAVE_SCRIPT.test(url.pathname);
}

async function retainCached(cache, request, cached, response) {
	const now = Date.now();
	let retryAt = now + REFRESH_RETRY_MS;
	const retryAfter = response?.headers.get('Retry-After');
	if (retryAfter) {
		const seconds = Number(retryAfter);
		const requestedAt = Number.isFinite(seconds) ? now + Math.max(0, seconds) * 1000 : Date.parse(retryAfter);
		if (Number.isFinite(requestedAt)) retryAt = Math.max(retryAt, requestedAt);
	}
	const stored = cached.clone();
	const headers = new Headers(stored.headers);
	headers.set(RETRY_AT_HEADER, String(retryAt));
	await cache
		?.put(request, new Response(stored.body, { status: stored.status, statusText: stored.statusText, headers }))
		.catch(() => undefined);
	return cached;
}

async function readEngine(request) {
	const cache = await caches.open(CACHE_NAME).catch(() => null);
	const cached = await cache?.match(request).catch(() => undefined);
	// Legacy workers stored opaque responses, which can hide a 429/error page.
	// Never serve them as the cached fallback.
	if (cached?.status === 200 && Number(cached.headers.get(RETRY_AT_HEADER)) > Date.now()) return cached;
	if (cached && cached.status !== 200) await cache?.delete(request).catch(() => undefined);

	const verifyCrossOrigin = request.mode === 'no-cors' && new URL(request.url).origin !== self.location.origin;
	let response;
	try {
		response = await fetch(
			new Request(request, {
				cache: 'no-cache',
				...(verifyCrossOrigin ? { mode: 'cors', credentials: 'omit' } : {}),
			})
		);
	} catch (error) {
		if (cached?.status === 200) return retainCached(cache, request, cached);
		if (!verifyCrossOrigin) throw error;
		// Hosts without CORS may still supply a script, but its hidden HTTP status
		// makes it unsuitable for permanent caching. Leave that to the browser.
		return fetch(new Request(request, { cache: 'no-cache' }));
	}
	if (response.status === 200) {
		await cache?.put(request, response.clone()).catch(() => undefined);
	} else if (cached?.status === 200) {
		return retainCached(cache, request, cached, response);
	}
	return response;
}

function getEngine(request) {
	const key = request.url;
	if (!pending.has(key)) {
		const task = readEngine(request).finally(() => pending.delete(key));
		pending.set(key, task);
	}
	return pending.get(key).then((response) => response.clone());
}

async function serveEngine(request, warmOnly = false) {
	const cache = await caches.open(CACHE_NAME).catch(() => null);
	const cached = await cache?.match(request).catch(() => undefined);
	if (warmOnly && cached?.status === 200) return { response: cached };
	const refresh = getEngine(request);
	return cached?.status === 200 ? { response: cached, refresh } : { response: await refresh };
}

self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
						.map((name) => caches.delete(name))
				)
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const request = event.request;
	if (
		request.method !== 'GET' ||
		request.destination !== 'script' ||
		['no-store', 'reload', 'no-cache'].includes(request.cache) ||
		!isEngineTransactionUrl(new URL(request.url))
	)
		return;
	// Revalidate transaction scripts too; unversioned bundle.js remains browser managed.
	const task = serveEngine(request);
	event.respondWith(task.then(({ response }) => response));
	event.waitUntil(task.then(({ refresh }) => refresh).catch(() => undefined));
});

self.addEventListener('message', (event) => {
	if (event.data?.type !== 'CACHE_ENGINE' || typeof event.data.url !== 'string') return;

	let request;
	try {
		const url = new URL(event.data.url);
		if (!isEngineTransactionUrl(url)) return;
		request = new Request(url.href, {
			mode: url.origin === self.location.origin ? 'same-origin' : 'no-cors',
			cache: 'force-cache',
		});
	} catch {
		return;
	}

	// The page may send this more than once while registration becomes ready.
	// Cache hits and in-flight downloads incur no further gateway requests.
	event.waitUntil(serveEngine(request, true).catch(() => undefined));
});
