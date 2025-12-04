const ARNS_ID_KEY = 'portal-arns-id';

export class ServiceWorkerManager {
	private static instance: ServiceWorkerManager;
	private registration: ServiceWorkerRegistration | null = null;

	private constructor() {}

	static getInstance(): ServiceWorkerManager {
		if (!ServiceWorkerManager.instance) {
			ServiceWorkerManager.instance = new ServiceWorkerManager();
		}
		return ServiceWorkerManager.instance;
	}

	async register(): Promise<void> {
		if (!('serviceWorker' in navigator)) {
			console.warn('[Service Worker] Not supported in this browser');
			return;
		}

		try {
			this.registration = await navigator.serviceWorker.register('/service-worker.js', {
				scope: '/',
			});

			console.log('[Service Worker] Registered successfully');

			// Listen for messages from the service worker
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data && event.data.type === 'CACHE_CLEARED') {
					console.log('[Service Worker] Cache cleared, reloading page...');
					window.location.reload();
				}
			});

			// Check for updates
			this.registration.addEventListener('updatefound', () => {
				console.log('[Service Worker] Update found');
			});
		} catch (error) {
			console.error('[Service Worker] Registration failed:', error);
		}
	}

	async checkArNSUpdate(): Promise<void> {
		try {
			// Fetch the current ArNS ID from the response headers
			const response = await fetch(`https://${window.location.host}`, {
				method: 'HEAD',
				cache: 'no-store',
			});

			const currentArnsId = response.headers.get('X-Arns-Resolved-Id');

			if (!currentArnsId) {
				console.warn('[ArNS] No X-Arns-Resolved-Id header found');
				return;
			}

			// Get the stored ArNS ID
			const storedArnsId = localStorage.getItem(ARNS_ID_KEY);

			if (!storedArnsId) {
				// First time - store the ID
				localStorage.setItem(ARNS_ID_KEY, currentArnsId);
				console.log('[ArNS] Stored initial ID:', currentArnsId);
				return;
			}

			if (storedArnsId !== currentArnsId) {
				console.log('[ArNS] ID changed from', storedArnsId, 'to', currentArnsId);
				console.log('[ArNS] Clearing cache and reloading...');

				// Update the stored ID
				localStorage.setItem(ARNS_ID_KEY, currentArnsId);

				// Clear the service worker cache
				await this.clearCache();
			} else {
				console.log('[ArNS] ID unchanged:', currentArnsId);
			}
		} catch (error) {
			console.error('[ArNS] Error checking for updates:', error);
		}
	}

	async clearCache(): Promise<void> {
		if (!this.registration) {
			console.warn('[Service Worker] Not registered, cannot clear cache');
			return;
		}

		// Send message to service worker to clear cache
		if (this.registration.active) {
			this.registration.active.postMessage({
				type: 'CLEAR_CACHE',
			});
			console.log('[Service Worker] Sent clear cache message');
		}
	}

	async unregister(): Promise<void> {
		if (!this.registration) {
			return;
		}

		try {
			await this.registration.unregister();
			console.log('[Service Worker] Unregistered successfully');
			this.registration = null;
		} catch (error) {
			console.error('[Service Worker] Unregistration failed:', error);
		}
	}
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
