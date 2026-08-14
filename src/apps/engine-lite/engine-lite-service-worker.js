const CACHE_PREFIX = 'portal-engine-lite-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const ARWEAVE_SCRIPT = /\/[a-zA-Z0-9_-]{43}$/;

function isEngineRequest(request) {
	if (request.method !== 'GET' || request.destination !== 'script') return false;
	const url = new URL(request.url);
	return ARWEAVE_SCRIPT.test(url.pathname) || url.pathname.endsWith('/bundle.js');
}

function canCache(response) {
	return response && (response.ok || response.type === 'opaque');
}

async function fetchAndCache(request) {
	const response = await fetch(request);
	if (canCache(response)) {
		const cache = await caches.open(CACHE_NAME);
		await cache.put(request, response.clone());
	}
	return response;
}

self.addEventListener('install', () => {
	self.skipWaiting();
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
	if (!isEngineRequest(event.request)) return;

	event.respondWith(
		caches.open(CACHE_NAME).then(async (cache) => {
			const cached = await cache.match(event.request);
			if (!cached) return fetchAndCache(event.request);

			event.waitUntil(fetchAndCache(event.request).catch(() => undefined));
			return cached;
		})
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type !== 'CACHE_ENGINE' || typeof event.data.url !== 'string') return;

	let request;
	try {
		const url = new URL(event.data.url);
		if (!['http:', 'https:'].includes(url.protocol)) return;
		request = new Request(url.href, { mode: url.origin === self.location.origin ? 'same-origin' : 'no-cors' });
	} catch {
		return;
	}

	event.waitUntil(fetchAndCache(request).catch(() => undefined));
});
