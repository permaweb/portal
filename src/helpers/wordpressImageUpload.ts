/**
 * WordPress Image Upload Utilities
 *
 * Handles fetching images from WordPress, compressing, and uploading to Arweave
 */

import { compressImageToSize } from './utils';
import { ArticleBlockType } from './types';
import { ExtractedImage } from './wordpress';

// CORS proxies to try (in order of preference)
const CORS_PROXIES = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?'];

// Free upload threshold (100KB)
const FREE_UPLOAD_THRESHOLD = 100 * 1024;

export type ImageUploadState = {
	status: 'pending' | 'fetching' | 'compressing' | 'uploading' | 'complete' | 'error';
	progress?: number;
	txId?: string;
	arweaveUrl?: string;
	error?: string;
	originalSize?: number;
	finalSize?: number;
};

export type ImageUploadResult = {
	originalUrl: string;
	txId?: string;
	arweaveUrl?: string;
	error?: string;
	success: boolean;
};

/**
 * Fetch an image from a URL
 * Tries direct fetch first, then falls back to CORS proxies
 * Returns a Blob of the image data
 */
export async function fetchImageAsBlob(url: string): Promise<Blob> {
	// Skip CORS proxy for Arweave URLs - fetch directly
	if (url.includes('arweave.net')) {
		const response = await fetch(url, {
			headers: { Accept: 'image/*' },
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
		}
		return await response.blob();
	}

	// Try direct fetch first (works for some CDNs with permissive CORS)
	try {
		const directResponse = await fetch(url, {
			headers: { Accept: 'image/*' },
			mode: 'cors',
		});
		if (directResponse.ok) {
			return await directResponse.blob();
		}
	} catch {
		// Direct fetch failed (likely CORS), try proxies
	}

	// Try each CORS proxy until one works
	const errors: string[] = [];
	for (const proxy of CORS_PROXIES) {
		try {
			const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
			const response = await fetch(proxyUrl, {
				headers: { Accept: 'image/*' },
			});
			if (response.ok) {
				return await response.blob();
			}
			errors.push(`${proxy}: ${response.status} ${response.statusText}`);
		} catch (e: any) {
			errors.push(`${proxy}: ${e.message || 'Network error'}`);
		}
	}

	throw new Error(`Failed to fetch image after trying all proxies: ${errors.join('; ')}`);
}

/**
 * Convert blob to File object for processing
 */
function blobToFile(blob: Blob, filename: string): File {
	// Try to determine the extension from the blob type
	const mimeToExt: Record<string, string> = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/gif': '.gif',
		'image/webp': '.webp',
	};
	const ext = mimeToExt[blob.type] || '.jpg';
	const name = filename.includes('.') ? filename : `${filename}${ext}`;

	return new File([blob], name, { type: blob.type || 'image/jpeg' });
}

/**
 * Get filename from URL
 */
function getFilenameFromUrl(url: string): string {
	try {
		const pathname = new URL(url).pathname;
		const filename = pathname.split('/').pop() || 'image';
		return decodeURIComponent(filename);
	} catch {
		return 'image';
	}
}

/**
 * Upload a single image to Arweave
 * Handles compression if needed
 * Note: wallet parameter is kept for API compatibility but is not used
 * as resolveTransaction handles authentication internally
 */
export async function uploadImageToArweave(
	image: ExtractedImage,
	libs: any,
	_wallet: any,
	onProgress?: (state: ImageUploadState) => void
): Promise<ImageUploadResult> {
	const result: ImageUploadResult = {
		originalUrl: image.originalUrl,
		success: false,
	};

	try {
		// Step 1: Fetch image
		onProgress?.({ status: 'fetching', progress: 10 });
		const blob = await fetchImageAsBlob(image.originalUrl);
		const originalSize = blob.size;

		// Step 2: Convert to File and compress if needed
		const filename = getFilenameFromUrl(image.originalUrl);
		let file = blobToFile(blob, filename);

		onProgress?.({ status: 'compressing', progress: 30, originalSize });

		// Compress if larger than threshold
		if (file.size > FREE_UPLOAD_THRESHOLD) {
			try {
				file = await compressImageToSize(file, FREE_UPLOAD_THRESHOLD, 1920);
			} catch {
				// If compression fails, continue with original
				console.warn('Image compression failed, using original');
			}
		}

		const finalSize = file.size;
		onProgress?.({ status: 'uploading', progress: 50, originalSize, finalSize });

		// Step 3: Upload to Arweave using resolveTransaction (same method as Media component)
		const txId = await libs.resolveTransaction(file);

		const arweaveUrl = `https://arweave.net/${txId}`;

		onProgress?.({
			status: 'complete',
			progress: 100,
			txId,
			arweaveUrl,
			originalSize,
			finalSize,
		});

		result.txId = txId;
		result.arweaveUrl = arweaveUrl;
		result.success = true;
	} catch (error: any) {
		const errorMsg = error?.message || 'Unknown error';
		onProgress?.({
			status: 'error',
			error: errorMsg,
		});
		result.error = errorMsg;
	}

	return result;
}

/**
 * Upload multiple images to Arweave in batch
 * Returns a map of original URL to Arweave URL
 * Note: wallet parameter is kept for API compatibility but is not used
 */
export async function uploadImagesToArweave(
	images: ExtractedImage[],
	selectedUrls: Set<string>,
	libs: any,
	_wallet: any,
	onProgress?: (url: string, state: ImageUploadState) => void
): Promise<Map<string, string>> {
	const urlMap = new Map<string, string>();

	// Filter to only selected images
	const toUpload = images.filter((img) => selectedUrls.has(img.originalUrl));

	for (const image of toUpload) {
		const result = await uploadImageToArweave(image, libs, _wallet, (state) => {
			onProgress?.(image.originalUrl, state);
		});

		if (result.success && result.arweaveUrl) {
			urlMap.set(image.originalUrl, result.arweaveUrl);
		}
	}

	return urlMap;
}

/**
 * Replace image URLs in article block content
 */
export function replaceImageUrlsInContent(
	content: ArticleBlockType[],
	urlMap: Map<string, string>
): ArticleBlockType[] {
	return content.map((block) => {
		const newBlock = { ...block };

		// Replace URL in block data
		if (newBlock.data?.url && urlMap.has(newBlock.data.url)) {
			newBlock.data = { ...newBlock.data, url: urlMap.get(newBlock.data.url)! };
		}

		// Replace URLs in HTML content
		if (newBlock.content && typeof newBlock.content === 'string') {
			let newContent = newBlock.content;
			urlMap.forEach((arweaveUrl, originalUrl) => {
				// Replace in src attributes
				newContent = newContent.replace(
					new RegExp(`src=["']${escapeRegExp(originalUrl)}["']`, 'gi'),
					`src="${arweaveUrl}"`
				);
				// Replace in background-image styles
				newContent = newContent.replace(
					new RegExp(`url\\(["']?${escapeRegExp(originalUrl)}["']?\\)`, 'gi'),
					`url("${arweaveUrl}")`
				);
			});
			newBlock.content = newContent;
		}

		return newBlock;
	});
}

/**
 * Replace featured image URL
 */
export function replaceFeaturedImage(thumbnail: string | null, urlMap: Map<string, string>): string | null {
	if (!thumbnail) return null;
	return urlMap.get(thumbnail) || thumbnail;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculate cost estimate for images
 */
export function calculateImageCostEstimate(
	images: ExtractedImage[],
	selectedUrls: Set<string>
): {
	totalImages: number;
	selectedImages: number;
	estimatedFreeCount: number;
	estimatedPaidCount: number;
} {
	const selectedImages = images.filter((img) => selectedUrls.has(img.originalUrl));

	// We can't know actual sizes until we fetch, but we can estimate
	// Assume most images will compress to under 100KB
	const estimatedFreeCount = Math.ceil(selectedImages.length * 0.8);
	const estimatedPaidCount = selectedImages.length - estimatedFreeCount;

	return {
		totalImages: images.length,
		selectedImages: selectedImages.length,
		estimatedFreeCount,
		estimatedPaidCount,
	};
}
