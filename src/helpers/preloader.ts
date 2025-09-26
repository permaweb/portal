import { ASSETS, ICONS_SOCIAL, ICONS_UI } from './config';

export class AssetPreloader {
	private preloadedAssets = new Set<string>();
	private loadingPromises = new Map<string, Promise<void>>();

	private preloadImage(url: string): Promise<void> {
		if (this.preloadedAssets.has(url)) {
			return Promise.resolve();
		}

		if (this.loadingPromises.has(url)) {
			return this.loadingPromises.get(url)!;
		}

		const promise = new Promise<void>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.preloadedAssets.add(url);
				this.loadingPromises.delete(url);
				resolve();
			};
			img.onerror = () => {
				this.loadingPromises.delete(url);
				reject(new Error(`Failed to preload image: ${url}`));
			};
			img.src = url;
		});

		this.loadingPromises.set(url, promise);
		return promise;
	}

	private async preloadSVG(url: string): Promise<void> {
		if (this.preloadedAssets.has(url)) {
			return Promise.resolve();
		}

		if (this.loadingPromises.has(url)) {
			return this.loadingPromises.get(url)!;
		}

		const promise = new Promise<void>((resolve, reject) => {
			fetch(url)
				.then((response) => {
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.text();
				})
				.then(() => {
					this.preloadedAssets.add(url);
					this.loadingPromises.delete(url);
					resolve();
				})
				.catch((error) => {
					this.loadingPromises.delete(url);
					reject(new Error(`Failed to preload SVG: ${url} - ${error.message}`));
				});
		});

		this.loadingPromises.set(url, promise);
		return promise;
	}

	private async preloadAsset(url: string): Promise<void> {
		try {
			// Determine if asset is likely an SVG based on URL patterns or content type
			// Most assets in the config appear to be SVGs based on usage with ReactSVG
			await this.preloadSVG(url);
		} catch (error) {
			// Fallback to image preloading if SVG fails
			try {
				await this.preloadImage(url);
			} catch (imgError) {
				console.warn(`Failed to preload asset: ${url}`, imgError);
			}
		}
	}

	async preloadAllAssets(): Promise<void> {
		const allAssets = [...Object.values(ASSETS), ...Object.values(ICONS_SOCIAL), ...Object.values(ICONS_UI)];

		const preloadPromises = allAssets.map((url) => this.preloadAsset(url));

		try {
			await Promise.allSettled(preloadPromises);
		} catch (error) {
			console.warn('Some assets failed to preload:', error);
		}
	}

	async preloadSpecificAssets(assetKeys: string[]): Promise<void> {
		const urlsToPreload = assetKeys
			.map((key) => (ASSETS as any)[key] || (ICONS_SOCIAL as any)[key] || (ICONS_UI as any)[key])
			.filter(Boolean);

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
