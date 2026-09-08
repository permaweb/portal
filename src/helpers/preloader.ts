import { getBundledIcon } from './config/iconAssets';
import { ICONS, ICONS_SOCIAL } from './config';
import { acquireGatewayAsset, isGatewayAsset } from './gatewayAssets';

export class AssetPreloader {
	private preloadedAssets = new Set<string>();
	private loadingPromises = new Map<string, Promise<void>>();

	private async preloadSVG(url: string): Promise<void> {
		if (getBundledIcon(url) || url.startsWith('data:')) {
			this.preloadedAssets.add(url);
			return;
		}

		if (this.preloadedAssets.has(url)) {
			return Promise.resolve();
		}

		if (this.loadingPromises.has(url)) {
			return this.loadingPromises.get(url)!;
		}

		const request = acquireGatewayAsset(url);
		const promise = request.promise
			.then(() => {
				this.preloadedAssets.add(url);
			})
			.finally(() => {
				request.release();
				this.loadingPromises.delete(url);
			});

		this.loadingPromises.set(url, promise);
		return promise;
	}

	private async preloadAsset(url: string): Promise<void> {
		try {
			await this.preloadSVG(url);
		} catch (error) {
			console.warn(`Failed to preload asset: ${url}`, error);
		}
	}

	async preloadAllAssets(): Promise<void> {
		// Bundled icons are already available. Custom gateway assets remain lazy
		// so preloading cannot spend the user's shared IP request budget.
		const allAssets = [...Object.values(ICONS_SOCIAL), ...Object.values(ICONS)].filter(
			(url): url is string => typeof url === 'string' && !isGatewayAsset(url)
		);

		const preloadPromises = allAssets.map((url: any) => this.preloadAsset(url));

		try {
			await Promise.allSettled(preloadPromises);
		} catch (error) {
			console.warn('Some assets failed to preload:', error);
		}
	}

	async preloadSpecificAssets(assetKeys: string[]): Promise<void> {
		const urlsToPreload = assetKeys
			.map((key) => (ICONS_SOCIAL as any)[key] || (ICONS as any)[key])
			.filter((url): url is string => typeof url === 'string');

		const preloadPromises = urlsToPreload.map((url) => this.preloadAsset(url));

		try {
			await Promise.allSettled(preloadPromises);
		} catch (error) {
			console.warn('Some specific assets failed to preload:', error);
		}
	}

	isPreloaded(url: string): boolean {
		return this.preloadedAssets.has(url);
	}

	getPreloadedCount(): number {
		return this.preloadedAssets.size;
	}
}

// Create a singleton instance
export const assetPreloader = new AssetPreloader();

// Helper function to preload all assets
export const preloadAllAssets = () => assetPreloader.preloadAllAssets();

// Helper function to preload specific assets
export const preloadAssets = (assetKeys: string[]) => assetPreloader.preloadSpecificAssets(assetKeys);
