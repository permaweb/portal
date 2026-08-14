import { resolvePortalState } from '../../../scripts/resolve-base-portal.mjs';

const ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;
const ARWEAVE_GATEWAY = 'https://arweave.net';

export type LitePost = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	author: string;
	date: number;
	dateLabel: string;
	image: string | null;
	content: unknown;
	contentTx: string | null;
	readTime: string;
	raw: any;
};

export type LitePortal = {
	id: string;
	name: string;
	description: string;
	logo: string | null;
	icon: string | null;
	fonts: { headers?: string; body?: string } | null;
	themes: any[];
	featuredPosts: string[];
	posts: LitePost[];
};

function parseJSON(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
	try {
		return JSON.parse(trimmed);
	} catch {
		return value;
	}
}

function isIdentityKey(key: string) {
	return ARWEAVE_ID.test(key) || key.includes('-');
}

export function normalizeProcessValue(value: unknown): any {
	const parsed = parseJSON(value);
	if (Array.isArray(parsed)) return parsed.map(normalizeProcessValue);
	if (!parsed || typeof parsed !== 'object') return parsed;
	return Object.entries(parsed).reduce((result, [key, child]) => {
		if (key.toLowerCase() === 'commitments') return result;
		const normalizedKey = isIdentityKey(key) ? key : key.charAt(0).toLowerCase() + key.slice(1);
		result[normalizedKey] = normalizeProcessValue(child);
		return result;
	}, {} as Record<string, unknown>);
}

function asRecord(value: unknown): Record<string, any> {
	const parsed = normalizeProcessValue(value);
	return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function firstRecord(...values: unknown[]): Record<string, any> {
	for (const value of values) {
		const record = asRecord(value);
		if (Object.keys(record).length) return record;
	}
	return {};
}

function firstArray(...values: unknown[]): any[] {
	for (const value of values) {
		const parsed = normalizeProcessValue(value);
		if (Array.isArray(parsed)) return parsed;
		if (parsed && typeof parsed === 'object') return Object.values(parsed);
	}
	return [];
}

function cleanText(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function plainText(value: unknown): string {
	if (!value) return '';
	if (typeof value === 'string') {
		const element = document.createElement('div');
		element.innerHTML = value;
		return (element.textContent || '').replace(/\s+/g, ' ').trim();
	}
	if (Array.isArray(value))
		return value
			.map((entry) => plainText(entry?.content ?? entry))
			.filter(Boolean)
			.join(' ');
	return '';
}

function toSlug(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/^\/+|\/+$/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function toTimestamp(value: unknown): number {
	const numeric = Number(value);
	if (Number.isFinite(numeric) && numeric > 0) return numeric < 10_000_000_000 ? numeric * 1000 : numeric;
	if (typeof value === 'string') {
		const parsed = Date.parse(value);
		return Number.isNaN(parsed) ? 0 : parsed;
	}
	return 0;
}

function formatDate(value: number) {
	if (!value) return '';
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	}).format(new Date(value));
}

function resolveAsset(value: unknown): string | null {
	const source = cleanText(value);
	if (!source || source === 'None') return null;
	if (/^(https?:|data:|blob:)/i.test(source)) return source;
	if (ARWEAVE_ID.test(source)) return `${ARWEAVE_GATEWAY}/${source}`;
	return source;
}

function getCategory(metadata: Record<string, any>, raw: Record<string, any>) {
	const categories = firstArray(metadata.categories, raw.categories, metadata.frontmatter?.categories);
	const first = categories[0];
	if (typeof first === 'string' && first.trim()) return first.trim();
	if (first && typeof first === 'object') return cleanText(first.name || first.title || first.id) || 'Article';
	return (
		cleanText(metadata.frontmatter?.category) ||
		cleanText(metadata.category) ||
		cleanText(firstArray(metadata.topics, raw.topics)[0]) ||
		'Article'
	);
}

function estimateReadTime(content: unknown, fallback: string) {
	const words = plainText(content || fallback)
		.split(/\s+/)
		.filter(Boolean).length;
	return `${Math.max(1, Math.round(words / 200))} min read`;
}

function normalizePost(rawValue: unknown, portalId: string, portalName: string, index: number): LitePost | null {
	const raw = asRecord(rawValue);
	const metadata = firstRecord(raw.metadata, raw.frontmatter);
	if (cleanText(raw.assetType) && cleanText(raw.assetType) !== 'blog-post') return null;
	if (cleanText(metadata.status || raw.status).toLowerCase() === 'draft') return null;

	const date =
		toTimestamp(metadata.releaseDate) ||
		toTimestamp(raw.releaseDate) ||
		toTimestamp(raw.dateCreated) ||
		toTimestamp(metadata.date) ||
		toTimestamp(raw.publishedAt);
	if (date && date > Date.now()) return null;

	const id = cleanText(raw.id || raw.postTxId || metadata.postTxId) || `post-${index}`;
	const title = cleanText(raw.name || raw.title || metadata.name || metadata.title) || 'Untitled';
	const requestedSlug = cleanText(metadata.url || raw.url || raw.slug);
	const slug = toSlug(requestedSlug || title) || id;
	const content = metadata.content ?? raw.content ?? null;
	const excerpt =
		cleanText(metadata.description || raw.description || metadata.excerpt || metadata.frontmatter?.description) ||
		plainText(content).slice(0, 220);
	const creator = cleanText(metadata.author || metadata.frontmatter?.author || raw.author || raw.creator);
	const author = creator && creator !== portalId && creator !== id ? creator : `${portalName} Team`;

	return {
		id,
		slug,
		title,
		excerpt,
		category: getCategory(metadata, raw),
		author,
		date,
		dateLabel: formatDate(date),
		image: resolveAsset(metadata.thumbnail || raw.thumbnail || raw.bannerTxId || metadata.banner),
		content,
		contentTx: cleanText(metadata.contentTx || raw.contentTx || raw.postTxId) || null,
		readTime: estimateReadTime(content, excerpt || title),
		raw,
	};
}

export function createLitePostPreview(rawValue: unknown, portalId: string, portalName: string): LitePost {
	const raw = asRecord(rawValue);
	const metadata = firstRecord(raw.metadata);
	const post = normalizePost(
		{ ...raw, status: 'published', metadata: { ...metadata, status: 'published' } },
		portalId,
		portalName,
		0
	);
	if (!post) throw new Error('Unable to create Engine Lite post preview');
	return post;
}

function unwrapResponse(value: unknown) {
	const normalized = normalizeProcessValue(value);
	if (!normalized || typeof normalized !== 'object') return normalized;
	return normalizeProcessValue((normalized as any).body ?? normalized);
}

function portalFromState(portalId: string, source: unknown): LitePortal {
	const state = asRecord(unwrapResponse(source));
	const zone = firstRecord(state.zone);
	const store = firstRecord(state.store, zone.store);
	const overview = firstRecord(state.overview, zone.overview, store.overview);
	const presentation = firstRecord(state.presentation, zone.presentation, store.presentation);
	const postsState = firstRecord(state.posts, zone.posts, store.posts);

	const name = cleanText(overview.name || store.name || state.name || zone.name) || 'Portal';
	const posts = firstArray(postsState.index, store.index, state.index, state.posts, store.posts)
		.map((post, index) => normalizePost(post, portalId, name, index))
		.filter((post): post is LitePost => Boolean(post))
		.sort((a, b) => b.date - a.date);

	return {
		id: portalId,
		name,
		description: cleanText(overview.description || store.description || state.description),
		logo: resolveAsset(overview.banner || overview.logo || store.banner || store.logo || state.banner || state.logo),
		icon: resolveAsset(overview.thumbnail || overview.icon || store.thumbnail || store.icon || state.icon),
		fonts: firstRecord(presentation.fonts, store.fonts, state.fonts),
		themes: firstArray(presentation.themes, store.themes, state.themes),
		featuredPosts: firstArray(postsState.featuredPosts, store.featuredPosts, state.featuredPosts)
			.map((entry) => cleanText(typeof entry === 'object' ? entry.id || entry.postId : entry))
			.filter(Boolean),
		posts,
	};
}

function portalFromManifest(portalId: string, source: unknown): LitePortal | null {
	const manifest = asRecord(source);
	if (!Array.isArray(manifest.posts)) return null;
	return portalFromState(portalId, {
		overview: {
			name: manifest.name || manifest.title,
			description: manifest.description,
			banner: manifest.bannerTxId,
			thumbnail: manifest.iconTxId,
		},
		presentation: { fonts: manifest.fonts, themes: manifest.themes },
		posts: { index: manifest.posts, featuredPosts: manifest.featuredPosts },
	});
}

async function fetchJSON(url: string, timeout = 25_000) {
	const value = await fetchValue(url, timeout);
	if (typeof value === 'string') throw new Error('Expected a JSON response');
	return value;
}

async function fetchValue(url: string, timeout = 25_000) {
	const controller = new AbortController();
	const timer = window.setTimeout(() => controller.abort(), timeout);
	try {
		const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
		if (!response.ok) throw new Error(`Request failed (${response.status})`);
		const text = await response.text();
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	} finally {
		window.clearTimeout(timer);
	}
}

export async function fetchPortal(portalId: string): Promise<LitePortal> {
	// Engine Lite is the base portal viewer. Its only state source is the
	// manifest/release history reconstructed by the portable resolver.
	const basePortal = await resolvePortalState(portalId)
		.then((value: unknown) => portalFromState(portalId, value))
		.catch(() => null);
	if (basePortal) return basePortal;

	const directValue = await fetchJSON(`${ARWEAVE_GATEWAY}/${portalId}`, 12_000).catch(() => null);
	const directPortal = directValue ? portalFromManifest(portalId, directValue) : null;
	if (directPortal) return directPortal;
	throw new Error('Portal manifest state was not found');
}

export async function hydratePost(post: LitePost): Promise<LitePost> {
	if (post.content) return post;
	if (post.contentTx) {
		try {
			const fetched = await fetchValue(`${ARWEAVE_GATEWAY}/${post.contentTx}`, 15_000);
			const content =
				typeof fetched === 'string'
					? fetched.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, '').trim()
					: fetched;
			return { ...post, content, readTime: estimateReadTime(content, post.excerpt) };
		} catch {
			return post;
		}
	}
	return post;
}

export function findPost(posts: LitePost[], slugOrId: string) {
	const decoded = decodeURIComponent(slugOrId);
	return posts.find((post) => post.slug === decoded || post.id === decoded) ?? null;
}

export function isArweaveId(value: string) {
	return ARWEAVE_ID.test(value);
}
