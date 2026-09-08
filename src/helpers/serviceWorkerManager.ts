import { debugLog } from './utils';

const ARNS_ID_KEY = 'portal-arns-id';
const ARNS_CHECK_KEY = 'portal-arns-last-check';
const ARNS_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export class ServiceWorkerManager {
	private static instance: ServiceWorkerManager;
	private registration: ServiceWorkerRegistration | null = null;
	private registering: Promise<void> | null = null;
	private checkingUpdate: Promise<void> | null = null;
	private lastUpdateCheck = 0;
	private readonly handleMessage = (event: MessageEvent) => {
		if (event.data?.type === 'CACHE_CLEARED') {
			debugLog('info', 'ServiceWorkerManager', 'Cache cleared, reloading page...');
			window.location.reload();
		}
	};

	private constructor() {}

	static getInstance(): ServiceWorkerManager {
		if (!ServiceWorkerManager.instance) {
			ServiceWorkerManager.instance = new ServiceWorkerManager();
		}
		return ServiceWorkerManager.instance;
	}

	private isLocalhost(): boolean {
		return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
	}

	async register(): Promise<void> {
		if (!('serviceWorker' in navigator) || this.isLocalhost() || this.registration) return;
		if (this.registering) return this.registering;

		this.registering = (async () => {
			try {
				// Match Vite's relative base, including deployments beneath a manifest ID.
				const base = new URL('./', document.baseURI);
				this.registration = await navigator.serviceWorker.register(new URL('service-worker.js', base).href, {
					scope: base.href,
				});
				navigator.serviceWorker.addEventListener('message', this.handleMessage);
				debugLog('info', 'ServiceWorkerManager', 'Registered successfully');
			} catch (error) {
				debugLog('error', 'ServiceWorkerManager', 'Registration failed:', error);
			}
		})();
		try {
			await this.registering;
		} finally {
			this.registering = null;
		}
	}

	async checkArNSUpdate(): Promise<void> {
		if (this.isLocalhost()) return;
		if (this.checkingUpdate) return this.checkingUpdate;

		// A reload/remount should not create another HEAD request in the same tab.
		let lastCheck = this.lastUpdateCheck;
		try {
			lastCheck = Math.max(lastCheck, Number(sessionStorage.getItem(ARNS_CHECK_KEY)) || 0);
		} catch {
			// Private browsing can disable storage; the in-memory guard still works.
		}
		const now = Date.now();
		if (lastCheck && now >= lastCheck && now - lastCheck < ARNS_CHECK_INTERVAL_MS) return;
		this.lastUpdateCheck = now;
		try {
			sessionStorage.setItem(ARNS_CHECK_KEY, String(now));
		} catch {
			// Storage is optional.
		}

		this.checkingUpdate = this.fetchArNSUpdate();
		try {
			await this.checkingUpdate;
		} finally {
			this.checkingUpdate = null;
		}
	}

	private async fetchArNSUpdate(): Promise<void> {
		try {
			const response = await fetch(new URL('./', document.baseURI).href, {
				method: 'HEAD',
				cache: 'no-store',
			});
			if (!response.ok) return;
			const currentArnsId = response.headers.get('X-Arns-Resolved-Id');
			if (!currentArnsId) return;

			const storedArnsId = localStorage.getItem(ARNS_ID_KEY);
			localStorage.setItem(ARNS_ID_KEY, currentArnsId);
			if (storedArnsId && storedArnsId !== currentArnsId) {
				// Content-hashed files are still valid after a deployment. Preserve them
				// and all app data, including the shared gateway request budget.
				debugLog('info', 'ServiceWorkerManager', 'ArNS ID changed; refreshing mutable files');
				if (this.registration?.active) {
					this.registration.active.postMessage({ type: 'CLEAR_MUTABLE_CACHE' });
				} else {
					window.location.reload();
				}
			}
		} catch (error) {
			debugLog('error', 'ServiceWorkerManager', 'Error checking for updates:', error);
		}
	}

	async clearCache(): Promise<void> {
		this.registration?.active?.postMessage({ type: 'CLEAR_CACHE' });
	}

	async unregister(): Promise<void> {
		if (!this.registration) return;
		try {
			await this.registration.unregister();
			navigator.serviceWorker.removeEventListener('message', this.handleMessage);
			this.registration = null;
			debugLog('info', 'ServiceWorkerManager', 'Unregistered successfully');
		} catch (error) {
			debugLog('error', 'ServiceWorkerManager', 'Unregistration failed:', error);
		}
	}
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
