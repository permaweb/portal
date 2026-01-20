/**
 * WordPress Import Service
 *
 * This module provides functionality to extract data from WordPress sites
 * and convert it to Portal-compatible formats.
 */

import { ArticleBlockEnum, ArticleBlockType, PortalCategoryType, PortalTopicType } from './types';

// WordPress API Types
export type WordPressPost = {
	id: number;
	date: string;
	date_gmt: string;
	modified: string;
	modified_gmt: string;
	slug: string;
	status: 'publish' | 'draft' | 'pending' | 'private' | 'future';
	type: string;
	link: string;
	title: { rendered: string };
	content: { rendered: string; protected: boolean };
	excerpt: { rendered: string; protected: boolean };
	author: number;
	featured_media: number;
	categories: number[];
	tags: number[];
};

export type WordPressPage = WordPressPost & {
	parent: number;
	menu_order: number;
};

export type WordPressCategory = {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
	taxonomy: string;
	parent: number;
};

export type WordPressTag = {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
	taxonomy: string;
};

export type WordPressMedia = {
	id: number;
	date: string;
	slug: string;
	type: string;
	link: string;
	title: { rendered: string };
	alt_text: string;
	media_type: 'image' | 'file';
	mime_type: string;
	source_url: string;
	media_details?: {
		width: number;
		height: number;
		sizes?: {
			[key: string]: {
				source_url: string;
				width: number;
				height: number;
			};
		};
	};
};

export type WordPressSiteInfo = {
	name: string;
	description: string;
	url: string;
	home: string;
	gmt_offset: number;
	timezone_string: string;
	namespaces: string[];
	site_logo?: number;
	site_icon?: number;
};

// WordPress Theme/Color types
export type WordPressColorPalette = {
	name: string;
	slug: string;
	color: string;
};

export type WordPressThemeSettings = {
	color?: {
		palette?: {
			theme?: WordPressColorPalette[];
			custom?: WordPressColorPalette[];
		};
		background?: boolean;
		text?: boolean;
	};
	typography?: {
		fontFamilies?: {
			theme?: Array<{
				name: string;
				slug: string;
				fontFamily: string;
			}>;
		};
	};
};

export type ExtractedThemeColors = {
	primary: string | null;
	secondary: string | null;
	background: string | null;
	text: string | null;
	accent: string | null;
	border: string | null;
	link: string | null;
};

export type ExtractedTheme = {
	colors: ExtractedThemeColors;
	fonts: {
		heading: string | null;
		body: string | null;
	};
	borderRadius: number | null;
	colorPalette: WordPressColorPalette[];
};

export type WordPressExtractionResult = {
	siteInfo: WordPressSiteInfo | null;
	posts: WordPressPost[];
	pages: WordPressPage[];
	categories: WordPressCategory[];
	tags: WordPressTag[];
	media: WordPressMedia[];
	theme: ExtractedTheme | null;
	errors: string[];
};

export type WordPressExtractionProgress = {
	stage:
		| 'connecting'
		| 'siteInfo'
		| 'posts'
		| 'pages'
		| 'categories'
		| 'tags'
		| 'media'
		| 'theme'
		| 'complete'
		| 'error';
	current: number;
	total: number;
	message: string;
};

// Normalize URL helper
function normalizeUrl(url: string): string {
	let normalized = url.trim();
	if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
		normalized = 'https://' + normalized;
	}
	return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

// WordPress API client
export class WordPressClient {
	private baseUrl: string;
	private apiBase: string;
	private corsProxy: string | null;

	constructor(siteUrl: string, corsProxy: string | null = null) {
		this.baseUrl = normalizeUrl(siteUrl);
		this.apiBase = `${this.baseUrl}/wp-json/wp/v2`;
		this.corsProxy = corsProxy;
	}

	private async fetchWithProxy(url: string): Promise<Response> {
		const targetUrl = this.corsProxy ? `${this.corsProxy}${encodeURIComponent(url)}` : url;
		const response = await fetch(targetUrl, {
			headers: {
				Accept: 'application/json',
				'User-Agent': 'Mozilla/5.0 (compatible; PortalImporter/1.0)',
			},
		});
		return response;
	}

	async checkApiAvailability(): Promise<boolean> {
		try {
			const response = await this.fetchWithProxy(`${this.baseUrl}/wp-json/`);
			if (response.ok) {
				const data = await response.json();
				return Array.isArray(data.namespaces) && data.namespaces.some((ns: string) => ns.startsWith('wp/v'));
			}
			return false;
		} catch {
			return false;
		}
	}

	async getSiteInfo(): Promise<WordPressSiteInfo | null> {
		try {
			const response = await this.fetchWithProxy(`${this.baseUrl}/wp-json/`);
			if (response.ok) {
				return await response.json();
			}
			return null;
		} catch {
			return null;
		}
	}

	async getPosts(
		perPage: number = 100,
		page: number = 1
	): Promise<{ posts: WordPressPost[]; total: number; totalPages: number }> {
		try {
			const response = await this.fetchWithProxy(`${this.apiBase}/posts?per_page=${perPage}&page=${page}&_embed`);
			if (response.ok) {
				const posts = await response.json();
				return {
					posts,
					total: parseInt(response.headers.get('X-WP-Total') || '0'),
					totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '1'),
				};
			}
			return { posts: [], total: 0, totalPages: 0 };
		} catch {
			return { posts: [], total: 0, totalPages: 0 };
		}
	}

	async getAllPosts(onProgress?: (current: number, total: number) => void): Promise<WordPressPost[]> {
		const allPosts: WordPressPost[] = [];
		const perPage = 100;
		let page = 1;

		const firstPage = await this.getPosts(perPage, page);
		allPosts.push(...firstPage.posts);
		onProgress?.(allPosts.length, firstPage.total);

		while (page < firstPage.totalPages) {
			page++;
			const nextPage = await this.getPosts(perPage, page);
			allPosts.push(...nextPage.posts);
			onProgress?.(allPosts.length, firstPage.total);
		}

		return allPosts;
	}

	async getPages(
		perPage: number = 100,
		page: number = 1
	): Promise<{ pages: WordPressPage[]; total: number; totalPages: number }> {
		try {
			const response = await this.fetchWithProxy(`${this.apiBase}/pages?per_page=${perPage}&page=${page}&_embed`);
			if (response.ok) {
				const pages = await response.json();
				return {
					pages,
					total: parseInt(response.headers.get('X-WP-Total') || '0'),
					totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '1'),
				};
			}
			return { pages: [], total: 0, totalPages: 0 };
		} catch {
			return { pages: [], total: 0, totalPages: 0 };
		}
	}

	async getAllPages(onProgress?: (current: number, total: number) => void): Promise<WordPressPage[]> {
		const allPages: WordPressPage[] = [];
		const perPage = 100;
		let page = 1;

		const firstPage = await this.getPages(perPage, page);
		allPages.push(...firstPage.pages);
		onProgress?.(allPages.length, firstPage.total);

		while (page < firstPage.totalPages) {
			page++;
			const nextPage = await this.getPages(perPage, page);
			allPages.push(...nextPage.pages);
			onProgress?.(allPages.length, firstPage.total);
		}

		return allPages;
	}

	async getCategories(): Promise<WordPressCategory[]> {
		try {
			const response = await this.fetchWithProxy(`${this.apiBase}/categories?per_page=100`);
			if (response.ok) {
				return await response.json();
			}
			return [];
		} catch {
			return [];
		}
	}

	async getTags(): Promise<WordPressTag[]> {
		try {
			const response = await this.fetchWithProxy(`${this.apiBase}/tags?per_page=100`);
			if (response.ok) {
				return await response.json();
			}
			return [];
		} catch {
			return [];
		}
	}

	async getMedia(mediaId: number): Promise<WordPressMedia | null> {
		try {
			const response = await this.fetchWithProxy(`${this.apiBase}/media/${mediaId}`);
			if (response.ok) {
				return await response.json();
			}
			return null;
		} catch {
			return null;
		}
	}

	async getGlobalStyles(): Promise<WordPressThemeSettings | null> {
		try {
			// Try the global-styles endpoint (WP 5.9+ with block themes)
			const response = await this.fetchWithProxy(`${this.baseUrl}/wp-json/wp/v2/global-styles`);
			if (response.ok) {
				const data = await response.json();
				// Global styles can be an array or object depending on the endpoint
				if (Array.isArray(data) && data.length > 0) {
					return data[0]?.settings || null;
				}
				return data?.settings || null;
			}
			return null;
		} catch {
			return null;
		}
	}

	async extractThemeFromHTML(): Promise<ExtractedTheme | null> {
		try {
			const response = await this.fetchWithProxy(this.baseUrl);
			if (!response.ok) return null;

			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			const extractedTheme: ExtractedTheme = {
				colors: {
					primary: null,
					secondary: null,
					background: null,
					text: null,
					accent: null,
					border: null,
					link: null,
				},
				fonts: {
					heading: null,
					body: null,
				},
				borderRadius: null,
				colorPalette: [],
			};

			// Extract CSS custom properties from inline styles and stylesheets
			const styleElements = doc.querySelectorAll('style');
			let cssText = '';
			styleElements.forEach((style) => {
				cssText += style.textContent || '';
			});

			// Also check for WordPress preset colors in class attributes
			const wpColorVars = [
				{ pattern: /--wp--preset--color--primary[:\s]+([^;}\s]+)/gi, key: 'primary' },
				{ pattern: /--wp--preset--color--secondary[:\s]+([^;}\s]+)/gi, key: 'secondary' },
				{ pattern: /--wp--preset--color--background[:\s]+([^;}\s]+)/gi, key: 'background' },
				{ pattern: /--wp--preset--color--foreground[:\s]+([^;}\s]+)/gi, key: 'text' },
				{ pattern: /--wp--preset--color--accent[:\s]+([^;}\s]+)/gi, key: 'accent' },
				{ pattern: /--wp--preset--color--base[:\s]+([^;}\s]+)/gi, key: 'background' },
				{ pattern: /--wp--preset--color--contrast[:\s]+([^;}\s]+)/gi, key: 'text' },
			];

			wpColorVars.forEach(({ pattern, key }) => {
				const match = pattern.exec(cssText);
				if (match && match[1]) {
					extractedTheme.colors[key as keyof ExtractedThemeColors] = match[1].trim();
				}
			});

			// Extract font families
			const fontPatterns = [
				{ pattern: /--wp--preset--font-family--heading[:\s]+([^;}\s]+)/gi, key: 'heading' },
				{ pattern: /--wp--preset--font-family--body[:\s]+([^;}\s]+)/gi, key: 'body' },
			];

			fontPatterns.forEach(({ pattern, key }) => {
				const match = pattern.exec(cssText);
				if (match && match[1]) {
					extractedTheme.fonts[key as keyof typeof extractedTheme.fonts] = match[1].trim().replace(/['"]/g, '');
				}
			});

			// Extract color palette from WordPress preset classes
			const colorPalettePattern = /--wp--preset--color--([a-z0-9-]+)[:\s]+([^;}\s]+)/gi;
			let colorMatch;
			while ((colorMatch = colorPalettePattern.exec(cssText)) !== null) {
				const slug = colorMatch[1];
				const color = colorMatch[2].trim();
				if (!extractedTheme.colorPalette.find((c) => c.slug === slug)) {
					extractedTheme.colorPalette.push({
						name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
						slug,
						color,
					});
				}
			}

			// Fallback: Extract from computed styles of key elements
			// Try to get background color from body
			const bodyBg = doc.body?.style?.backgroundColor || doc.body?.getAttribute('data-bg');
			if (bodyBg && !extractedTheme.colors.background) {
				extractedTheme.colors.background = bodyBg;
			}

			// Try to get link colors
			const links = doc.querySelectorAll('a');
			if (links.length > 0) {
				const firstLink = links[0] as HTMLElement;
				const linkColor = firstLink.style?.color;
				if (linkColor && !extractedTheme.colors.link) {
					extractedTheme.colors.link = linkColor;
				}
			}

			// Extract colors from meta theme-color
			const themeColorMeta = doc.querySelector('meta[name="theme-color"]');
			if (themeColorMeta) {
				const themeColor = themeColorMeta.getAttribute('content');
				if (themeColor && !extractedTheme.colors.primary) {
					extractedTheme.colors.primary = themeColor;
				}
			}

			return extractedTheme;
		} catch {
			return null;
		}
	}

	async extractTheme(): Promise<ExtractedTheme | null> {
		// First try the Global Styles API (block themes)
		const globalStyles = await this.getGlobalStyles();

		const extractedTheme: ExtractedTheme = {
			colors: {
				primary: null,
				secondary: null,
				background: null,
				text: null,
				accent: null,
				border: null,
				link: null,
			},
			fonts: {
				heading: null,
				body: null,
			},
			borderRadius: null,
			colorPalette: [],
		};

		if (globalStyles?.color?.palette) {
			const palette = [...(globalStyles.color.palette.theme || []), ...(globalStyles.color.palette.custom || [])];
			extractedTheme.colorPalette = palette;

			// Try to identify semantic colors from the palette
			palette.forEach((color) => {
				const slugLower = color.slug.toLowerCase();
				const nameLower = color.name.toLowerCase();

				if ((slugLower.includes('primary') || nameLower.includes('primary')) && !extractedTheme.colors.primary) {
					extractedTheme.colors.primary = color.color;
				}
				if ((slugLower.includes('secondary') || nameLower.includes('secondary')) && !extractedTheme.colors.secondary) {
					extractedTheme.colors.secondary = color.color;
				}
				if (
					(slugLower.includes('background') || slugLower.includes('base') || nameLower.includes('background')) &&
					!extractedTheme.colors.background
				) {
					extractedTheme.colors.background = color.color;
				}
				if (
					(slugLower.includes('foreground') ||
						slugLower.includes('text') ||
						slugLower.includes('contrast') ||
						nameLower.includes('text')) &&
					!extractedTheme.colors.text
				) {
					extractedTheme.colors.text = color.color;
				}
				if ((slugLower.includes('accent') || nameLower.includes('accent')) && !extractedTheme.colors.accent) {
					extractedTheme.colors.accent = color.color;
				}
			});
		}

		if (globalStyles?.typography?.fontFamilies?.theme) {
			globalStyles.typography.fontFamilies.theme.forEach((font) => {
				const slugLower = font.slug.toLowerCase();
				if (slugLower.includes('heading') && !extractedTheme.fonts.heading) {
					extractedTheme.fonts.heading = font.fontFamily;
				}
				if ((slugLower.includes('body') || slugLower.includes('text')) && !extractedTheme.fonts.body) {
					extractedTheme.fonts.body = font.fontFamily;
				}
			});
		}

		// If we didn't get enough from the API, try HTML extraction
		const htmlTheme = await this.extractThemeFromHTML();
		if (htmlTheme) {
			// Merge HTML extracted theme with API theme (API takes precedence)
			Object.keys(extractedTheme.colors).forEach((key) => {
				const colorKey = key as keyof ExtractedThemeColors;
				if (!extractedTheme.colors[colorKey] && htmlTheme.colors[colorKey]) {
					extractedTheme.colors[colorKey] = htmlTheme.colors[colorKey];
				}
			});

			if (!extractedTheme.fonts.heading && htmlTheme.fonts.heading) {
				extractedTheme.fonts.heading = htmlTheme.fonts.heading;
			}
			if (!extractedTheme.fonts.body && htmlTheme.fonts.body) {
				extractedTheme.fonts.body = htmlTheme.fonts.body;
			}

			// Merge color palettes
			htmlTheme.colorPalette.forEach((color) => {
				if (!extractedTheme.colorPalette.find((c) => c.slug === color.slug)) {
					extractedTheme.colorPalette.push(color);
				}
			});
		}

		// Check if we found any meaningful colors
		const hasColors = Object.values(extractedTheme.colors).some((c) => c !== null);
		const hasFonts = extractedTheme.fonts.heading || extractedTheme.fonts.body;
		const hasPalette = extractedTheme.colorPalette.length > 0;

		if (!hasColors && !hasFonts && !hasPalette) {
			return null;
		}

		return extractedTheme;
	}

	async extractAll(onProgress?: (progress: WordPressExtractionProgress) => void): Promise<WordPressExtractionResult> {
		const result: WordPressExtractionResult = {
			siteInfo: null,
			posts: [],
			pages: [],
			categories: [],
			tags: [],
			media: [],
			theme: null,
			errors: [],
		};

		try {
			// Check API availability
			onProgress?.({ stage: 'connecting', current: 0, total: 1, message: 'Connecting to WordPress site...' });
			const isAvailable = await this.checkApiAvailability();
			if (!isAvailable) {
				result.errors.push('WordPress REST API is not available on this site');
				onProgress?.({ stage: 'error', current: 0, total: 0, message: 'API not available' });
				return result;
			}

			// Get site info
			onProgress?.({ stage: 'siteInfo', current: 0, total: 1, message: 'Fetching site information...' });
			result.siteInfo = await this.getSiteInfo();

			// Get categories
			onProgress?.({ stage: 'categories', current: 0, total: 1, message: 'Fetching categories...' });
			result.categories = await this.getCategories();

			// Get tags
			onProgress?.({ stage: 'tags', current: 0, total: 1, message: 'Fetching tags...' });
			result.tags = await this.getTags();

			// Get posts
			onProgress?.({ stage: 'posts', current: 0, total: 0, message: 'Fetching posts...' });
			result.posts = await this.getAllPosts((current, total) => {
				onProgress?.({ stage: 'posts', current, total, message: `Fetching posts (${current}/${total})...` });
			});

			// Get pages
			onProgress?.({ stage: 'pages', current: 0, total: 0, message: 'Fetching pages...' });
			result.pages = await this.getAllPages((current, total) => {
				onProgress?.({ stage: 'pages', current, total, message: `Fetching pages (${current}/${total})...` });
			});

			// Collect featured media IDs
			const mediaIds = new Set<number>();
			result.posts.forEach((post) => {
				if (post.featured_media) mediaIds.add(post.featured_media);
			});
			result.pages.forEach((page) => {
				if (page.featured_media) mediaIds.add(page.featured_media);
			});

			// Fetch media
			const mediaArray = Array.from(mediaIds);
			for (let i = 0; i < mediaArray.length; i++) {
				onProgress?.({
					stage: 'media',
					current: i + 1,
					total: mediaArray.length,
					message: `Fetching media (${i + 1}/${mediaArray.length})...`,
				});
				const media = await this.getMedia(mediaArray[i]);
				if (media) result.media.push(media);
			}

			// Extract theme/colors
			onProgress?.({ stage: 'theme', current: 0, total: 1, message: 'Extracting theme colors...' });
			result.theme = await this.extractTheme();
			if (result.theme) {
				onProgress?.({ stage: 'theme', current: 1, total: 1, message: 'Theme colors extracted!' });
			}

			onProgress?.({ stage: 'complete', current: 1, total: 1, message: 'Extraction complete!' });
		} catch (error: any) {
			result.errors.push(error.message || 'Unknown error during extraction');
			onProgress?.({ stage: 'error', current: 0, total: 0, message: error.message || 'Error' });
		}

		return result;
	}
}

// HTML to ArticleBlocks converter
export function htmlToArticleBlocks(html: string): ArticleBlockType[] {
	const blocks: ArticleBlockType[] = [];

	// Create a temporary DOM element to parse HTML
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const body = doc.body;

	const processNode = (node: Node, index: number): ArticleBlockType | null => {
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent?.trim();
			if (text) {
				return {
					id: `wp-${Date.now()}-${index}`,
					type: ArticleBlockEnum.Paragraph,
					content: text,
				};
			}
			return null;
		}

		if (node.nodeType !== Node.ELEMENT_NODE) return null;

		const element = node as HTMLElement;
		const tagName = element.tagName.toLowerCase();
		const id = `wp-${Date.now()}-${index}`;

		switch (tagName) {
			case 'h1':
				return { id, type: ArticleBlockEnum.Header1, content: element.innerHTML };
			case 'h2':
				return { id, type: ArticleBlockEnum.Header2, content: element.innerHTML };
			case 'h3':
				return { id, type: ArticleBlockEnum.Header3, content: element.innerHTML };
			case 'h4':
				return { id, type: ArticleBlockEnum.Header4, content: element.innerHTML };
			case 'h5':
				return { id, type: ArticleBlockEnum.Header5, content: element.innerHTML };
			case 'h6':
				return { id, type: ArticleBlockEnum.Header6, content: element.innerHTML };
			case 'p':
				const pContent = element.innerHTML.trim();
				if (!pContent) return null;
				// Check if paragraph contains only an image
				if (element.children.length === 1 && element.children[0].tagName.toLowerCase() === 'img') {
					const img = element.children[0] as HTMLImageElement;
					return {
						id,
						type: ArticleBlockEnum.Image,
						content: img.src,
						data: { alt: img.alt || '', caption: '' },
					};
				}
				return { id, type: ArticleBlockEnum.Paragraph, content: pContent };
			case 'blockquote':
				return { id, type: ArticleBlockEnum.Quote, content: element.innerHTML };
			case 'pre':
				const code = element.querySelector('code');
				return {
					id,
					type: ArticleBlockEnum.Code,
					content: code?.textContent || element.textContent || '',
				};
			case 'code':
				// Standalone code blocks (not inside pre)
				if (element.parentElement?.tagName.toLowerCase() !== 'pre') {
					return { id, type: ArticleBlockEnum.Code, content: element.textContent || '' };
				}
				return null;
			case 'ul':
				const ulItems: string[] = [];
				element.querySelectorAll('li').forEach((li) => {
					ulItems.push(`<li>${li.innerHTML}</li>`);
				});
				return { id, type: ArticleBlockEnum.UnorderedList, content: ulItems.join('') };
			case 'ol':
				const olItems: string[] = [];
				element.querySelectorAll('li').forEach((li) => {
					olItems.push(`<li>${li.innerHTML}</li>`);
				});
				return { id, type: ArticleBlockEnum.OrderedList, content: olItems.join('') };
			case 'img':
				const imgElement = element as HTMLImageElement;
				return {
					id,
					type: ArticleBlockEnum.Image,
					content: imgElement.src,
					data: { alt: imgElement.alt || '', caption: '' },
				};
			case 'figure':
				// WordPress often wraps images in figure elements
				const figImg = element.querySelector('img');
				const figCaption = element.querySelector('figcaption');
				if (figImg) {
					return {
						id,
						type: ArticleBlockEnum.Image,
						content: (figImg as HTMLImageElement).src,
						data: {
							alt: (figImg as HTMLImageElement).alt || '',
							caption: figCaption?.textContent || '',
						},
					};
				}
				// Check for video in figure
				const figVideo = element.querySelector('video');
				if (figVideo) {
					const source = figVideo.querySelector('source');
					return {
						id,
						type: ArticleBlockEnum.Video,
						content: source?.src || (figVideo as HTMLVideoElement).src || '',
					};
				}
				// Check for iframe (embedded content)
				const figIframe = element.querySelector('iframe');
				if (figIframe) {
					return {
						id,
						type: ArticleBlockEnum.Embed,
						content: figIframe.outerHTML,
					};
				}
				return null;
			case 'video':
				const videoElement = element as HTMLVideoElement;
				const videoSource = videoElement.querySelector('source');
				return {
					id,
					type: ArticleBlockEnum.Video,
					content: videoSource?.src || videoElement.src || '',
				};
			case 'iframe':
				return { id, type: ArticleBlockEnum.Embed, content: element.outerHTML };
			case 'hr':
				return { id, type: ArticleBlockEnum.DividerSolid, content: '' };
			case 'table':
				return { id, type: ArticleBlockEnum.Table, content: element.outerHTML };
			case 'div':
				// WordPress Gutenberg blocks often use divs
				const wpBlockClass = element.className;
				// Check for specific WordPress block types
				if (wpBlockClass.includes('wp-block-image')) {
					const divImg = element.querySelector('img');
					if (divImg) {
						const divCaption = element.querySelector('figcaption');
						return {
							id,
							type: ArticleBlockEnum.Image,
							content: (divImg as HTMLImageElement).src,
							data: {
								alt: (divImg as HTMLImageElement).alt || '',
								caption: divCaption?.textContent || '',
							},
						};
					}
				}
				if (wpBlockClass.includes('wp-block-video')) {
					const divVideo = element.querySelector('video');
					if (divVideo) {
						const source = divVideo.querySelector('source');
						return {
							id,
							type: ArticleBlockEnum.Video,
							content: source?.src || (divVideo as HTMLVideoElement).src || '',
						};
					}
				}
				if (wpBlockClass.includes('wp-block-embed')) {
					const embedIframe = element.querySelector('iframe');
					if (embedIframe) {
						return { id, type: ArticleBlockEnum.Embed, content: embedIframe.outerHTML };
					}
				}
				if (wpBlockClass.includes('wp-block-code')) {
					const codeEl = element.querySelector('code');
					return {
						id,
						type: ArticleBlockEnum.Code,
						content: codeEl?.textContent || element.textContent || '',
					};
				}
				if (wpBlockClass.includes('wp-block-quote')) {
					return { id, type: ArticleBlockEnum.Quote, content: element.innerHTML };
				}
				if (wpBlockClass.includes('wp-block-separator')) {
					return { id, type: ArticleBlockEnum.DividerSolid, content: '' };
				}
				if (wpBlockClass.includes('wp-block-spacer')) {
					return { id, type: ArticleBlockEnum.SpacerVertical, content: '' };
				}
				// For other divs, recursively process children
				return null;
			default:
				// For unknown elements, try to preserve as HTML
				if (element.innerHTML.trim()) {
					return { id, type: ArticleBlockEnum.HTML, content: element.outerHTML };
				}
				return null;
		}
	};

	let blockIndex = 0;

	const processChildren = (parent: Element) => {
		for (const child of Array.from(parent.childNodes)) {
			if (child.nodeType === Node.ELEMENT_NODE) {
				const element = child as HTMLElement;
				const tagName = element.tagName.toLowerCase();

				// For divs that are WordPress block wrappers, process children
				if (tagName === 'div' && !element.className.includes('wp-block-')) {
					processChildren(element);
					continue;
				}
			}

			const block = processNode(child, blockIndex++);
			if (block) {
				blocks.push(block);
			}
		}
	};

	processChildren(body);

	return blocks;
}

// Convert WordPress categories to Portal categories
export function convertCategories(wpCategories: WordPressCategory[]): PortalCategoryType[] {
	const categoryMap = new Map<number, PortalCategoryType>();

	// First pass: create all categories
	wpCategories.forEach((wpCat) => {
		categoryMap.set(wpCat.id, {
			id: `wp-cat-${wpCat.id}`,
			name: wpCat.name,
			parent: wpCat.parent ? `wp-cat-${wpCat.parent}` : undefined,
			children: [],
			metadata: {
				description: wpCat.description || undefined,
			},
		});
	});

	// Second pass: build hierarchy
	const rootCategories: PortalCategoryType[] = [];
	categoryMap.forEach((cat) => {
		if (cat.parent) {
			const parentCat = Array.from(categoryMap.values()).find((c) => c.id === cat.parent);
			if (parentCat) {
				if (!parentCat.children) parentCat.children = [];
				parentCat.children.push(cat);
			} else {
				rootCategories.push(cat);
			}
		} else {
			rootCategories.push(cat);
		}
	});

	return rootCategories;
}

// Convert WordPress tags to Portal topics
export function convertTags(wpTags: WordPressTag[]): PortalTopicType[] {
	return wpTags.map((tag) => ({
		value: tag.name,
	}));
}

// Convert a WordPress post to a Portal asset-compatible structure
export type ConvertedPost = {
	title: string;
	description: string;
	content: ArticleBlockType[];
	categories: PortalCategoryType[];
	topics: string[];
	thumbnail: string | null;
	dateCreated: number;
	status: 'draft' | 'published';
	slug: string;
	wpId: number;
};

export function convertPost(
	wpPost: WordPressPost,
	wpCategories: WordPressCategory[],
	wpTags: WordPressTag[],
	wpMedia: WordPressMedia[]
): ConvertedPost {
	// Convert HTML content to article blocks
	const content = htmlToArticleBlocks(wpPost.content.rendered);

	// Strip HTML from excerpt for description
	const tempDiv = document.createElement('div');
	tempDiv.innerHTML = wpPost.excerpt.rendered;
	const description = tempDiv.textContent?.trim() || '';

	// Map category IDs to names
	const categories = wpPost.categories
		.map((catId) => {
			const wpCat = wpCategories.find((c) => c.id === catId);
			if (wpCat) {
				return {
					id: `wp-cat-${wpCat.id}`,
					name: wpCat.name,
					metadata: {},
				};
			}
			return null;
		})
		.filter((c): c is PortalCategoryType => c !== null);

	// Map tag IDs to names
	const topics = wpPost.tags
		.map((tagId) => {
			const wpTag = wpTags.find((t) => t.id === tagId);
			return wpTag?.name || null;
		})
		.filter((t): t is string => t !== null);

	// Get thumbnail URL from featured media
	let thumbnail: string | null = null;
	if (wpPost.featured_media) {
		const media = wpMedia.find((m) => m.id === wpPost.featured_media);
		if (media) {
			thumbnail = media.source_url;
		}
	}

	// Parse date
	const dateCreated = new Date(wpPost.date_gmt + 'Z').getTime();

	// Map status
	const status = wpPost.status === 'publish' ? 'published' : 'draft';

	// Strip HTML from title
	tempDiv.innerHTML = wpPost.title.rendered;
	const title = tempDiv.textContent?.trim() || '';

	return {
		title,
		description,
		content,
		categories,
		topics,
		thumbnail,
		dateCreated,
		status,
		slug: wpPost.slug,
		wpId: wpPost.id,
	};
}

// Portal theme type for import
export type PortalThemeImport = {
	name: string;
	active: boolean;
	basics: {
		colors: {
			text: { light: string; dark: string };
			background: { light: string; dark: string };
			primary: { light: string; dark: string };
			secondary: { light: string; dark: string };
			border: { light: string; dark: string };
		};
		preferences: {
			borderRadius: number;
		};
	};
};

// Helper to convert hex/rgb color to RGB string format (R,G,B)
function colorToRgbString(color: string): string {
	if (!color) return '128,128,128';

	// Handle hex colors
	if (color.startsWith('#')) {
		const hex = color.slice(1);
		const fullHex =
			hex.length === 3
				? hex
						.split('')
						.map((c) => c + c)
						.join('')
				: hex;
		const r = parseInt(fullHex.slice(0, 2), 16);
		const g = parseInt(fullHex.slice(2, 4), 16);
		const b = parseInt(fullHex.slice(4, 6), 16);
		return `${r},${g},${b}`;
	}

	// Handle rgb/rgba colors
	const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (rgbMatch) {
		return `${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]}`;
	}

	// Handle named colors (basic ones)
	const namedColors: Record<string, string> = {
		white: '255,255,255',
		black: '0,0,0',
		red: '255,0,0',
		green: '0,128,0',
		blue: '0,0,255',
		gray: '128,128,128',
		grey: '128,128,128',
	};

	return namedColors[color.toLowerCase()] || '128,128,128';
}

// Helper to determine if a color is light or dark
function isLightColor(rgbString: string): boolean {
	const [r, g, b] = rgbString.split(',').map(Number);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5;
}

// Convert extracted WordPress theme to Portal theme format
export function convertThemeToPortal(extractedTheme: ExtractedTheme): PortalThemeImport {
	const primaryColor = extractedTheme.colors.primary || extractedTheme.colors.accent || '#5E66DB';
	const secondaryColor = extractedTheme.colors.secondary || extractedTheme.colors.accent || '#38BD80';
	const backgroundColor = extractedTheme.colors.background || '#FAFAFA';
	const textColor = extractedTheme.colors.text || '#000000';
	const borderColor = extractedTheme.colors.border || '#CCCCCC';

	const primaryRgb = colorToRgbString(primaryColor);
	const secondaryRgb = colorToRgbString(secondaryColor);
	const backgroundRgb = colorToRgbString(backgroundColor);
	const textRgb = colorToRgbString(textColor);
	const borderRgb = colorToRgbString(borderColor);

	// Determine light mode colors based on background brightness
	const isLightMode = isLightColor(backgroundRgb);

	// For dark mode, invert if necessary
	const darkBackground = isLightMode ? '27,27,27' : backgroundRgb;
	const darkText = isLightMode ? '255,255,255' : textRgb;
	const lightBackground = isLightMode ? backgroundRgb : '250,250,250';
	const lightText = isLightMode ? textRgb : '0,0,0';

	return {
		name: 'Imported Theme',
		active: true,
		basics: {
			colors: {
				text: {
					light: lightText,
					dark: darkText,
				},
				background: {
					light: lightBackground,
					dark: darkBackground,
				},
				primary: {
					light: primaryRgb,
					dark: primaryRgb,
				},
				secondary: {
					light: secondaryRgb,
					dark: secondaryRgb,
				},
				border: {
					light: borderRgb,
					dark: isLightColor(borderRgb) ? '100,100,100' : borderRgb,
				},
			},
			preferences: {
				borderRadius: extractedTheme.borderRadius || 10,
			},
		},
	};
}

// Convert all WordPress data to Portal-compatible structure
export type PortalImportData = {
	name: string;
	description: string;
	logo: string | null;
	icon: string | null;
	categories: PortalCategoryType[];
	topics: PortalTopicType[];
	posts: ConvertedPost[];
	pages: ConvertedPost[];
	theme: PortalThemeImport | null;
	extractedTheme: ExtractedTheme | null;
};

export function convertWordPressToPortal(extraction: WordPressExtractionResult): PortalImportData {
	const categories = convertCategories(extraction.categories);
	const topics = convertTags(extraction.tags);

	const posts = extraction.posts.map((post) =>
		convertPost(post, extraction.categories, extraction.tags, extraction.media)
	);

	const pages = extraction.pages.map((page) =>
		convertPost(page, extraction.categories, extraction.tags, extraction.media)
	);

	// Convert theme if available
	const theme = extraction.theme ? convertThemeToPortal(extraction.theme) : null;

	return {
		name: extraction.siteInfo?.name || 'Imported Portal',
		description: extraction.siteInfo?.description || '',
		logo: null, // Would need to fetch from site_logo media ID
		icon: null, // Would need to fetch from site_icon media ID
		categories,
		topics,
		posts,
		pages,
		theme,
		extractedTheme: extraction.theme,
	};
}
