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
	private isWordPressCom: boolean;
	private wpComSiteSlug: string | null;

	constructor(siteUrl: string, corsProxy: string | null = null) {
		this.baseUrl = normalizeUrl(siteUrl);

		// Detect WordPress.com sites
		this.isWordPressCom = this.baseUrl.includes('.wordpress.com');
		if (this.isWordPressCom) {
			// Extract site slug from URL (e.g., "terrytao" from "terrytao.wordpress.com")
			const match = this.baseUrl.match(/https?:\/\/([^.]+)\.wordpress\.com/);
			this.wpComSiteSlug = match ? match[1] : null;
			this.apiBase = this.wpComSiteSlug
				? `https://public-api.wordpress.com/rest/v1.1/sites/${this.wpComSiteSlug}.wordpress.com`
				: `${this.baseUrl}/wp-json/wp/v2`;
		} else {
			this.apiBase = `${this.baseUrl}/wp-json/wp/v2`;
			this.wpComSiteSlug = null;
		}

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
			if (this.isWordPressCom && this.wpComSiteSlug) {
				// For WordPress.com, test the public API
				const response = await this.fetchWithProxy(`${this.apiBase}/posts?number=1`);
				return response.ok;
			}

			const response = await this.fetchWithProxy(`${this.baseUrl}/wp-json/`);
			if (response.ok) {
				const data = await response.json();
				return Array.isArray(data.namespaces) && data.namespaces.some((ns: string) => ns.startsWith('wp/v'));
			}

			// Check for WordPress.com Link header even on 404
			const linkHeader = response.headers.get('link');
			if (linkHeader?.includes('public-api.wordpress.com')) {
				// It's a WordPress.com site, update our detection
				this.isWordPressCom = true;
				const match = this.baseUrl.match(/https?:\/\/([^.]+)\.wordpress\.com/);
				if (match) {
					this.wpComSiteSlug = match[1];
					this.apiBase = `https://public-api.wordpress.com/rest/v1.1/sites/${this.wpComSiteSlug}.wordpress.com`;
					// Test the WordPress.com API
					const wpComResponse = await this.fetchWithProxy(`${this.apiBase}/posts?number=1`);
					return wpComResponse.ok;
				}
			}

			return false;
		} catch {
			return false;
		}
	}

	async getSiteInfo(): Promise<WordPressSiteInfo | null> {
		try {
			if (this.isWordPressCom && this.wpComSiteSlug) {
				// WordPress.com doesn't have a site info endpoint, construct from posts response
				const response = await this.fetchWithProxy(`${this.apiBase}/posts?number=1`);
				if (response.ok) {
					const data = await response.json();
					// WordPress.com API returns site info in the response
					return {
						name: data.site?.name || this.wpComSiteSlug,
						description: data.site?.description || '',
						url: this.baseUrl,
						home: this.baseUrl,
						gmt_offset: 0,
						timezone_string: '',
						namespaces: ['wp.com/v1.1'],
					};
				}
				return null;
			}

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
			if (this.isWordPressCom && this.wpComSiteSlug) {
				// WordPress.com API uses different parameters
				const response = await this.fetchWithProxy(`${this.apiBase}/posts?number=${perPage}&page=${page}`);
				if (response.ok) {
					const data = await response.json();
					// WordPress.com returns {found: X, posts: [...]}
					const wpComPosts = data.posts || [];
					// Convert WordPress.com post format to standard format
					const posts: WordPressPost[] = wpComPosts.map((wp: any) => {
						// WordPress.com returns category/tag objects, not just IDs
						const categoryIds = Array.isArray(wp.categories)
							? wp.categories.map((cat: any) => (typeof cat === 'object' ? cat.ID : cat))
							: [];
						const tagIds = Array.isArray(wp.tags)
							? wp.tags.map((tag: any) => (typeof tag === 'object' ? tag.ID : tag))
							: [];

						return {
							id: wp.ID,
							date: wp.date,
							date_gmt: wp.date_gmt || wp.date,
							modified: wp.modified,
							modified_gmt: wp.modified_gmt || wp.modified,
							slug: wp.slug,
							status: wp.status === 'publish' ? 'publish' : wp.status || 'draft',
							type: 'post',
							link: wp.URL,
							title: { rendered: typeof wp.title === 'string' ? wp.title : wp.title || '' },
							content: { rendered: typeof wp.content === 'string' ? wp.content : wp.content || '', protected: false },
							excerpt: { rendered: typeof wp.excerpt === 'string' ? wp.excerpt : wp.excerpt || '', protected: false },
							author: typeof wp.author === 'object' ? wp.author?.ID || 0 : wp.author || 0,
							featured_media: wp.featured_image ? 1 : 0, // WordPress.com doesn't return media ID directly
							categories: categoryIds,
							tags: tagIds,
						};
					});

					const total = data.found || 0;
					const totalPages = Math.ceil(total / perPage);
					return { posts, total, totalPages };
				}
				return { posts: [], total: 0, totalPages: 0 };
			}

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

		// Continue fetching if there are more pages
		while (page < firstPage.totalPages && firstPage.totalPages > 1) {
			page++;
			const nextPage = await this.getPosts(perPage, page);
			allPosts.push(...nextPage.posts);
			onProgress?.(allPosts.length, firstPage.total);

			// Safety check: if we got no posts, we've reached the end
			if (nextPage.posts.length === 0) break;
		}

		return allPosts;
	}

	async getPages(
		perPage: number = 100,
		page: number = 1
	): Promise<{ pages: WordPressPage[]; total: number; totalPages: number }> {
		try {
			if (this.isWordPressCom && this.wpComSiteSlug) {
				// WordPress.com API for pages
				const response = await this.fetchWithProxy(`${this.apiBase}/pages?number=${perPage}&page=${page}`);
				if (response.ok) {
					const data = await response.json();
					const wpComPages = data.pages || [];
					// Convert WordPress.com page format to standard format
					const pages: WordPressPage[] = wpComPages.map((wp: any) => ({
						id: wp.ID,
						date: wp.date,
						date_gmt: wp.date_gmt || wp.date,
						modified: wp.modified,
						modified_gmt: wp.modified_gmt || wp.modified,
						slug: wp.slug,
						status: wp.status === 'publish' ? 'publish' : wp.status || 'draft',
						type: 'page',
						link: wp.URL,
						title: { rendered: typeof wp.title === 'string' ? wp.title : wp.title || '' },
						content: { rendered: typeof wp.content === 'string' ? wp.content : wp.content || '', protected: false },
						excerpt: { rendered: typeof wp.excerpt === 'string' ? wp.excerpt : wp.excerpt || '', protected: false },
						author: typeof wp.author === 'object' ? wp.author?.ID || 0 : wp.author || 0,
						featured_media: wp.featured_image ? 1 : 0,
						categories: [],
						tags: [],
						parent: wp.parent || 0,
						menu_order: wp.menu_order || 0,
					}));

					const total = data.found || 0;
					const totalPages = Math.ceil(total / perPage);
					return { pages, total, totalPages };
				}
				return { pages: [], total: 0, totalPages: 0 };
			}

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

		// Continue fetching if there are more pages
		while (page < firstPage.totalPages && firstPage.totalPages > 1) {
			page++;
			const nextPage = await this.getPages(perPage, page);
			allPages.push(...nextPage.pages);
			onProgress?.(allPages.length, firstPage.total);

			// Safety check: if we got no pages, we've reached the end
			if (nextPage.pages.length === 0) break;
		}

		return allPages;
	}

	async getCategories(): Promise<WordPressCategory[]> {
		try {
			if (this.isWordPressCom && this.wpComSiteSlug) {
				// WordPress.com API for categories
				const response = await this.fetchWithProxy(`${this.apiBase}/categories?number=100`);
				if (response.ok) {
					const data = await response.json();
					const wpComCategories = data.categories || [];
					// Convert WordPress.com category format to standard format
					return wpComCategories.map((cat: any) => ({
						id: cat.ID,
						count: cat.post_count || 0,
						description: cat.description || '',
						link: cat.URL || '',
						name: cat.name,
						slug: cat.slug,
						taxonomy: 'category',
						parent: cat.parent || 0,
					}));
				}
				return [];
			}

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
			if (this.isWordPressCom && this.wpComSiteSlug) {
				// WordPress.com API for tags
				const response = await this.fetchWithProxy(`${this.apiBase}/tags?number=100`);
				if (response.ok) {
					const data = await response.json();
					const wpComTags = data.tags || [];
					// Convert WordPress.com tag format to standard format
					return wpComTags.map((tag: any) => ({
						id: tag.ID,
						count: tag.post_count || 0,
						description: tag.description || '',
						link: tag.URL || '',
						name: tag.name,
						slug: tag.slug,
						taxonomy: 'post_tag',
					}));
				}
				return [];
			}

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

			// Extract common CSS color patterns from inline styles and style tags
			const colorPatterns = [
				{
					pattern: /(?:--|color|background|bg)[-:]?\s*(?:primary|brand|main)[-:]?\s*:\s*([#\w()\s,]+);/gi,
					key: 'primary',
				},
				{
					pattern: /(?:--|color|background|bg)[-:]?\s*(?:secondary|accent)[-:]?\s*:\s*([#\w()\s,]+);/gi,
					key: 'secondary',
				},
				{
					pattern: /(?:--|background|bg)[-:]?\s*(?:body|page|site|base)[-:]?\s*:\s*([#\w()\s,]+);/gi,
					key: 'background',
				},
				{
					pattern: /(?:--|color|text|foreground)[-:]?\s*(?:text|body|content|base)[-:]?\s*:\s*([#\w()\s,]+);/gi,
					key: 'text',
				},
				{
					pattern: /(?:--|color|border)[-:]?\s*(?:border|divider|separator)[-:]?\s*:\s*([#\w()\s,]+);/gi,
					key: 'border',
				},
				{ pattern: /(?:--|color)[-:]?\s*(?:link|anchor|a)[-:]?\s*:\s*([#\w()\s,]+);/gi, key: 'link' },
			];

			colorPatterns.forEach(({ pattern, key }) => {
				const matches = cssText.matchAll(pattern);
				for (const match of matches) {
					if (match[1] && !extractedTheme.colors[key as keyof ExtractedThemeColors]) {
						const color = match[1].trim();
						// Basic validation: should look like a color
						if (/^#[\da-f]{3,6}$/i.test(color) || /^rgba?\(/i.test(color) || /^hsla?\(/i.test(color)) {
							extractedTheme.colors[key as keyof ExtractedThemeColors] = color;
							break;
						}
					}
				}
			});

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

			// Extract from common WordPress theme classes
			const wpThemeClasses = [
				{ selector: '.wp-block-site-title a, .site-title a', key: 'primary' },
				{ selector: 'a, .wp-block-post-title a', key: 'link' },
				{ selector: 'body, .site', key: 'background' },
			];

			// Note: We can't get computed styles from DOMParser, but we can check inline styles
			wpThemeClasses.forEach(({ selector, key }) => {
				const elements = doc.querySelectorAll(selector);
				for (const el of Array.from(elements)) {
					const htmlEl = el as HTMLElement;
					const color = htmlEl.style?.color || htmlEl.style?.backgroundColor;
					if (color && !extractedTheme.colors[key as keyof ExtractedThemeColors]) {
						extractedTheme.colors[key as keyof ExtractedThemeColors] = color;
						break;
					}
				}
			});

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

	async extractAll(
		onProgress?: (progress: WordPressExtractionProgress) => void,
		options?: {
			fetchPosts?: boolean;
			fetchPages?: boolean;
			fetchCategories?: boolean;
			fetchTags?: boolean;
			fetchTheme?: boolean;
			postsLimit?: number;
		}
	): Promise<WordPressExtractionResult> {
		const opts = {
			fetchPosts: true,
			fetchPages: true,
			fetchCategories: true,
			fetchTags: true,
			fetchTheme: true,
			...options,
		};
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
				if (this.isWordPressCom) {
					result.errors.push(
						'WordPress.com public API is not available for this site. The site may be private or restricted.'
					);
				} else {
					result.errors.push(
						'WordPress REST API is not available on this site. The site may not be WordPress or the API may be disabled.'
					);
				}
				onProgress?.({ stage: 'error', current: 0, total: 0, message: 'API not available' });
				return result;
			}

			// Get site info
			onProgress?.({ stage: 'siteInfo', current: 0, total: 1, message: 'Fetching site information...' });
			result.siteInfo = await this.getSiteInfo();

			// Get categories
			if (opts.fetchCategories) {
				onProgress?.({ stage: 'categories', current: 0, total: 1, message: 'Fetching categories...' });
				result.categories = await this.getCategories();
			}

			// Get tags
			if (opts.fetchTags) {
				onProgress?.({ stage: 'tags', current: 0, total: 1, message: 'Fetching tags...' });
				result.tags = await this.getTags();
			}

			// Get posts
			if (opts.fetchPosts) {
				onProgress?.({ stage: 'posts', current: 0, total: 0, message: 'Fetching posts...' });
				if (opts.postsLimit) {
					// Fetch limited number of posts
					const limitedPosts = await this.getPosts(opts.postsLimit, 1);
					result.posts = limitedPosts.posts;
					onProgress?.({
						stage: 'posts',
						current: limitedPosts.posts.length,
						total: limitedPosts.total,
						message: `Fetched ${limitedPosts.posts.length} posts...`,
					});
				} else {
					result.posts = await this.getAllPosts((current, total) => {
						onProgress?.({ stage: 'posts', current, total, message: `Fetching posts (${current}/${total})...` });
					});
				}
			}

			// Get pages
			if (opts.fetchPages) {
				onProgress?.({ stage: 'pages', current: 0, total: 0, message: 'Fetching pages...' });
				result.pages = await this.getAllPages((current, total) => {
					onProgress?.({ stage: 'pages', current, total, message: `Fetching pages (${current}/${total})...` });
				});
			}

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
			if (opts.fetchTheme) {
				onProgress?.({ stage: 'theme', current: 0, total: 1, message: 'Extracting theme colors...' });
				result.theme = await this.extractTheme();
				if (result.theme) {
					onProgress?.({ stage: 'theme', current: 1, total: 1, message: 'Theme colors extracted!' });
				}
			}

			onProgress?.({ stage: 'complete', current: 1, total: 1, message: 'Extraction complete!' });
		} catch (error: any) {
			result.errors.push(error.message || 'Unknown error during extraction');
			onProgress?.({ stage: 'error', current: 0, total: 0, message: error.message || 'Error' });
		}

		return result;
	}
}

/** Resolve potentially relative image/video URL against base (e.g. WordPress site URL). */
function resolveMediaUrl(href: string, baseUrl?: string): string {
	if (!href || !baseUrl) return href;
	href = href.trim();
	if (/^https?:\/\//i.test(href) || href.startsWith('data:')) return href;
	try {
		return new URL(href, baseUrl.endsWith('/') ? baseUrl : baseUrl + '/').href;
	} catch {
		return href;
	}
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Build portal-media-wrapper HTML matching MediaBlock output (column, center). Used for image/video blocks. */
function buildMediaBlockHtml(type: 'image' | 'video', url: string, caption: string): string {
	const style = 'display: flex; flex-direction: column; justify-content: center; max-width: 100%;';
	const safeUrl = url.replace(/"/g, '&quot;');
	const tag = type === 'video' ? `<video controls src="${safeUrl}"></video>` : `<img src="${safeUrl}" alt="">`;
	const cap = caption ? `<p>${escapeHtml(caption)}</p>` : '';
	return `<div class="portal-media-wrapper portal-media-column" style="${style}">\n  ${tag}\n  ${cap}\n</div>`;
}

// HTML to ArticleBlocks converter
export function htmlToArticleBlocks(html: string, baseUrl?: string): ArticleBlockType[] {
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
					const rawSrc = img.getAttribute('src') || img.src || '';
					const url = resolveMediaUrl(rawSrc, baseUrl);
					const caption = '';
					return {
						id,
						type: ArticleBlockEnum.Image,
						content: buildMediaBlockHtml('image', url, caption),
						data: { url, caption, alt: img.alt || '', alignment: 'portal-media-column', mediaAlign: 'center' },
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
			case 'img': {
				const imgElement = element as HTMLImageElement;
				const rawSrc = imgElement.getAttribute('src') || imgElement.src || '';
				const url = resolveMediaUrl(rawSrc, baseUrl);
				const caption = '';
				return {
					id,
					type: ArticleBlockEnum.Image,
					content: buildMediaBlockHtml('image', url, caption),
					data: { url, caption, alt: imgElement.alt || '', alignment: 'portal-media-column', mediaAlign: 'center' },
				};
			}
			case 'figure': {
				// WordPress often wraps images in figure elements
				const figImg = element.querySelector('img');
				const figCaption = element.querySelector('figcaption');
				if (figImg) {
					const imgEl = figImg as HTMLImageElement;
					const rawSrc = imgEl.getAttribute('src') || imgEl.src || '';
					const url = resolveMediaUrl(rawSrc, baseUrl);
					const caption = figCaption?.textContent?.trim() || '';
					return {
						id,
						type: ArticleBlockEnum.Image,
						content: buildMediaBlockHtml('image', url, caption),
						data: {
							url,
							caption,
							alt: imgEl.alt || '',
							alignment: 'portal-media-column',
							mediaAlign: 'center',
						},
					};
				}
				// Check for video in figure
				const figVideo = element.querySelector('video');
				if (figVideo) {
					const source = figVideo.querySelector('source');
					const rawSrc = (source?.getAttribute('src') || (figVideo as HTMLVideoElement).src || '').trim();
					const url = resolveMediaUrl(rawSrc, baseUrl);
					const caption = element.querySelector('figcaption')?.textContent?.trim() || '';
					return {
						id,
						type: ArticleBlockEnum.Video,
						content: buildMediaBlockHtml('video', url, caption),
						data: { url, caption, alignment: 'portal-media-column', mediaAlign: 'center' },
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
			}
			case 'video': {
				const videoElement = element as HTMLVideoElement;
				const videoSource = videoElement.querySelector('source');
				const rawSrc = (videoSource?.getAttribute('src') || videoElement.src || '').trim();
				const url = resolveMediaUrl(rawSrc, baseUrl);
				const caption = '';
				return {
					id,
					type: ArticleBlockEnum.Video,
					content: buildMediaBlockHtml('video', url, caption),
					data: { url, caption, alignment: 'portal-media-column', mediaAlign: 'center' },
				};
			}
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
						const imgEl = divImg as HTMLImageElement;
						const divCaption = element.querySelector('figcaption');
						const rawSrc = imgEl.getAttribute('src') || imgEl.src || '';
						const url = resolveMediaUrl(rawSrc, baseUrl);
						const caption = divCaption?.textContent?.trim() || '';
						return {
							id,
							type: ArticleBlockEnum.Image,
							content: buildMediaBlockHtml('image', url, caption),
							data: {
								url,
								caption,
								alt: imgEl.alt || '',
								alignment: 'portal-media-column',
								mediaAlign: 'center',
							},
						};
					}
				}
				if (wpBlockClass.includes('wp-block-video')) {
					const divVideo = element.querySelector('video');
					if (divVideo) {
						const source = divVideo.querySelector('source');
						const rawSrc = (source?.getAttribute('src') || (divVideo as HTMLVideoElement).src || '').trim();
						const url = resolveMediaUrl(rawSrc, baseUrl);
						const vCap = element.querySelector('figcaption')?.textContent?.trim() || '';
						return {
							id,
							type: ArticleBlockEnum.Video,
							content: buildMediaBlockHtml('video', url, vCap),
							data: { url, caption: vCap, alignment: 'portal-media-column', mediaAlign: 'center' },
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
	wpMedia: WordPressMedia[],
	baseUrl?: string
): ConvertedPost {
	// Convert HTML content to article blocks (baseUrl resolves relative image/video URLs)
	const content = htmlToArticleBlocks(wpPost.content.rendered, baseUrl);

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

	const baseUrl = extraction.siteInfo?.home || extraction.siteInfo?.url;

	const posts = extraction.posts.map((post) =>
		convertPost(post, extraction.categories, extraction.tags, extraction.media, baseUrl)
	);

	const pages = extraction.pages.map((page) =>
		convertPost(page, extraction.categories, extraction.tags, extraction.media, baseUrl)
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

// Parse WordPress WXR (WordPress eXtended RSS) export file
export async function parseWXRFile(file: File): Promise<WordPressExtractionResult> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const xmlText = e.target?.result as string;
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

				// Check for parsing errors
				const parseError = xmlDoc.querySelector('parsererror');
				if (parseError) {
					reject(new Error('Invalid XML file'));
					return;
				}

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

				// Extract site info from <channel>
				const channel = xmlDoc.querySelector('channel');
				if (channel) {
					const title = channel.querySelector('title')?.textContent || '';
					const description = channel.querySelector('description')?.textContent || '';
					const link = channel.querySelector('link')?.textContent || '';

					result.siteInfo = {
						name: title,
						description: description,
						url: link,
						home: link,
						gmt_offset: 0,
						timezone_string: '',
						namespaces: ['wp/v2'],
					};
				}

				// Extract categories and tags - WXR can have them in <wp:category> or <category> elements
				const categoryMap = new Map<string, WordPressCategory>();
				const tagMap = new Map<string, WordPressTag>();

				// Try wp:category elements first (more common in WXR)
				const wpCategories = xmlDoc.querySelectorAll('wp\\:category, category[domain="category"]');
				wpCategories.forEach((catEl, index) => {
					const termId =
						catEl.getAttribute('term_id') || catEl.querySelector('wp\\:term_id')?.textContent || `${index}`;
					const nicename =
						catEl.getAttribute('nicename') || catEl.querySelector('wp\\:category_nicename')?.textContent || '';
					const parent = catEl.getAttribute('parent') || catEl.querySelector('wp\\:category_parent')?.textContent || '';
					const name = catEl.querySelector('wp\\:cat_name')?.textContent || catEl.textContent || '';
					const description = catEl.querySelector('wp\\:category_description')?.textContent || '';

					if (termId && name) {
						categoryMap.set(termId, {
							id: parseInt(termId) || index,
							count: 0,
							description: description,
							link: '',
							name: name,
							slug: nicename || name.toLowerCase().replace(/\s+/g, '-'),
							taxonomy: 'category',
							parent: parent ? parseInt(parent) : 0,
						});
					}
				});

				// Extract tags - wp:tag or category[domain="post_tag"]
				const wpTags = xmlDoc.querySelectorAll('wp\\:tag, category[domain="post_tag"]');
				wpTags.forEach((tagEl, index) => {
					const termId =
						tagEl.getAttribute('term_id') || tagEl.querySelector('wp\\:term_id')?.textContent || `${index}`;
					const nicename = tagEl.getAttribute('nicename') || tagEl.querySelector('wp\\:tag_slug')?.textContent || '';
					const name = tagEl.querySelector('wp\\:tag_name')?.textContent || tagEl.textContent || '';

					if (termId && name) {
						tagMap.set(termId, {
							id: parseInt(termId) || index,
							count: 0,
							description: '',
							link: '',
							name: name,
							slug: nicename || name.toLowerCase().replace(/\s+/g, '-'),
							taxonomy: 'post_tag',
						});
					}
				});

				result.categories = Array.from(categoryMap.values());
				result.tags = Array.from(tagMap.values());

				// Extract items (posts/pages)
				const items = xmlDoc.querySelectorAll('item');
				let postIndex = 0;
				items.forEach((item) => {
					const title = item.querySelector('title')?.textContent || '';
					const link = item.querySelector('link')?.textContent || '';
					const pubDate = item.querySelector('pubDate')?.textContent || '';
					const guid = item.querySelector('guid')?.textContent || '';
					const description = item.querySelector('description')?.textContent || '';
					const content = item.querySelector('content\\:encoded')?.textContent || description;
					const excerpt = item.querySelector('excerpt\\:encoded')?.textContent || '';
					const postType = item.querySelector('wp\\:post_type')?.textContent || 'post';
					const status = (item.querySelector('wp\\:status')?.textContent || 'publish') as WordPressPost['status'];
					const postId = parseInt(item.querySelector('wp\\:post_id')?.textContent || `${postIndex}`) || postIndex;
					const postDate = item.querySelector('wp\\:post_date')?.textContent || pubDate;
					const postDateGmt = item.querySelector('wp\\:post_date_gmt')?.textContent || postDate;
					const modified = item.querySelector('wp\\:post_date')?.textContent || postDate;
					const modifiedGmt = item.querySelector('wp\\:post_modified_gmt')?.textContent || modified;

					// Extract categories and tags for this post
					const postCategories: number[] = [];
					const postTags: number[] = [];
					const categoryRefs = item.querySelectorAll('category');
					categoryRefs.forEach((catRef) => {
						const domain = catRef.getAttribute('domain');
						const termId = catRef.getAttribute('term_id');
						if (termId) {
							const id = parseInt(termId);
							if (!isNaN(id)) {
								if (domain === 'category') {
									postCategories.push(id);
								} else if (domain === 'post_tag') {
									postTags.push(id);
								}
							}
						} else {
							// Fallback: try to match by name/slug
							const name = catRef.textContent || '';
							const slug = catRef.getAttribute('nicename') || '';
							if (domain === 'category') {
								const found = Array.from(categoryMap.values()).find((c) => c.name === name || c.slug === slug);
								if (found) postCategories.push(found.id);
							} else if (domain === 'post_tag') {
								const found = Array.from(tagMap.values()).find((t) => t.name === name || t.slug === slug);
								if (found) postTags.push(found.id);
							}
						}
					});

					// Extract featured image
					const metaFeaturedImage = Array.from(item.querySelectorAll('wp\\:postmeta')).find(
						(meta) => meta.querySelector('wp\\:meta_key')?.textContent === '_thumbnail_id'
					);
					const featuredMedia = metaFeaturedImage
						? parseInt(metaFeaturedImage.querySelector('wp\\:meta_value')?.textContent || '0')
						: 0;

					const postData: WordPressPost = {
						id: postId,
						date: postDate,
						date_gmt: postDateGmt,
						modified: modified,
						modified_gmt: modifiedGmt,
						slug: item.querySelector('wp\\:post_name')?.textContent || guid.split('/').pop() || '',
						status,
						type: postType,
						link,
						title: { rendered: title },
						content: { rendered: content, protected: false },
						excerpt: { rendered: excerpt, protected: false },
						author: 0, // WXR doesn't always include author IDs
						featured_media: featuredMedia,
						categories: postCategories,
						tags: postTags,
					};

					if (postType === 'page') {
						const parent = parseInt(item.querySelector('wp\\:post_parent')?.textContent || '0') || 0;
						const menuOrder = parseInt(item.querySelector('wp\\:menu_order')?.textContent || '0') || 0;
						result.pages.push({
							...postData,
							parent,
							menu_order: menuOrder,
						});
					} else {
						result.posts.push(postData);
					}

					postIndex++;
				});

				// Extract attachments/media (wp:attachment_url in postmeta)
				const attachments = xmlDoc.querySelectorAll('item');
				attachments.forEach((item) => {
					const postType = item.querySelector('wp\\:post_type')?.textContent || '';
					if (postType === 'attachment') {
						const attachmentUrl = item.querySelector('wp\\:attachment_url')?.textContent || '';
						const postId = parseInt(item.querySelector('wp\\:post_id')?.textContent || '0') || 0;
						if (attachmentUrl) {
							result.media.push({
								id: postId,
								date: item.querySelector('wp\\:post_date')?.textContent || '',
								slug: item.querySelector('wp\\:post_name')?.textContent || '',
								type: 'attachment',
								link: item.querySelector('link')?.textContent || '',
								title: { rendered: item.querySelector('title')?.textContent || '' },
								alt_text: '',
								media_type: attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'file',
								mime_type: '',
								source_url: attachmentUrl,
							});
						}
					}
				});

				resolve(result);
			} catch (error: any) {
				reject(new Error(`Failed to parse WXR file: ${error.message || 'Unknown error'}`));
			}
		};

		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};

		reader.readAsText(file);
	});
}
