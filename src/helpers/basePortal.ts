import { ENGINE_LITE_REFERENCE_ID, FONT_OPTIONS, LAYOUT, PAGES, PORTAL_DATA, STORAGE, THEME } from './config';
import { trackObservedPendingTransaction, trackPendingTransaction } from './pendingTransactions';
import { PortalHeaderType, PortalUserRoleType, PortalUserType } from './types';
import { uploadTransaction } from './upload';

const ARWEAVE_GRAPHQL = 'https://arweave.net/graphql';
const ARWEAVE_GATEWAY = 'https://arweave.net';
const BASE_SCHEMA_VERSION = '2.1.0';
const ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;
const BASE_RESOLVE_TTL_MS = 10_000;
const TRANSACTION_FETCH_CONCURRENCY = 8;
const CHECKPOINT_RELEASE_INTERVAL = 50;
const CHECKPOINT_TAIL_BYTES = 250_000;
const TRANSACTION_CACHE_NAME = 'portal-base-transactions-v1';
const portalSiteCache = new Map<string, string>();

export type BasePortalPost = {
	id: string;
	postTxId: string;
	title: string;
	description: string;
	slug: string;
	url: string;
	status: string;
	content: any;
	creator: string;
	categories: any[];
	topics: string[];
	tags: string[];
	thumbnail: string | null;
	bannerTxId: string | null;
	dateCreated: number;
	lastUpdate: number;
	releaseDate: number;
	date: string;
	updated: string;
	draft: boolean;
	authorAddress: string;
	wordCount: number;
	readingTime: number;
	excerpt: string;
	publishedAt: string;
	frontmatter: {
		title: string;
		date: string;
		desc: string;
		description: string;
		category: string;
		categories: any[];
		tags: string[];
		banner: string | null;
		author: string;
		excerpt: string;
	};
};

export type BasePortalManifest = {
	schemaVersion: string;
	type: 'portal-manifest';
	mode: 'base';
	portalId: string;
	manifestTxId?: string | null;
	rootTxId: string | null;
	previousTxId: string | null;
	siteTxId: string | null;
	engineReferenceId: string;
	generatedAt: string;
	date: string;
	updated: string;
	authorAddress: string;
	owner: string;
	name: string;
	description: string;
	bannerTxId: string | null;
	iconTxId: string | null;
	wallpaperTxId: string | null;
	users: PortalUserType[];
	categories: any[];
	topics: any[];
	links: any[];
	domains: any[];
	pages: any;
	fonts: any;
	themes: any[];
	layout: any;
	postPreviews: Record<string, any>;
	uploads: any[];
	posts: BasePortalPost[];
	featuredPosts: string[];
	postCount: number;
	checkpointTxId?: string | null;
	releasesSinceCheckpoint?: number;
	releaseBytesSinceCheckpoint?: number;
	includedTxIdsSinceCheckpoint?: string[];
};

export type BasePortalPostChanges = {
	upsert?: Record<string, string>;
	remove?: string[];
};

type BasePortalPatchSelector = ['=', string, string | number | boolean | null];
type BasePortalPatchPath = Array<string | number | BasePortalPatchSelector>;

export type BasePortalPatch =
	| ['s', BasePortalPatchPath, unknown]
	| ['d', BasePortalPatchPath]
	| ['p', BasePortalPatchPath, number, number, unknown[]]
	| ['m', BasePortalPatchPath, number];

export type BasePortalReleaseChanges = Partial<
	Pick<
		BasePortalManifest,
		| 'name'
		| 'description'
		| 'bannerTxId'
		| 'iconTxId'
		| 'wallpaperTxId'
		| 'users'
		| 'categories'
		| 'topics'
		| 'links'
		| 'domains'
		| 'pages'
		| 'fonts'
		| 'themes'
		| 'layout'
		| 'postPreviews'
		| 'uploads'
		| 'featuredPosts'
	>
> & {
	patches?: BasePortalPatch[];
	posts?: BasePortalPostChanges;
};

export type BasePortalRelease = {
	schemaVersion: string;
	type: 'portal-release';
	mode: 'base';
	portalId: string;
	rootTxId: string;
	previousTxId: string;
	generatedAt: string;
	authorAddress: string;
	changes: BasePortalReleaseChanges;
};

export type BasePortalCheckpoint = {
	schemaVersion: string;
	type: 'portal-checkpoint';
	mode: 'base';
	portalId: string;
	rootTxId: string;
	previousTxId: string;
	baseCheckpointTxId: string;
	includedTxIds: string[];
	generatedAt: string;
	authorAddress: string;
	state: BasePortalManifest;
};

type BasePortalTransaction =
	| { kind: 'manifest'; manifest: BasePortalManifest }
	| { kind: 'release'; release: BasePortalRelease }
	| { kind: 'checkpoint'; checkpoint: BasePortalCheckpoint; manifest: BasePortalManifest };

const RELEASE_CHANGE_KEYS = new Set([
	'name',
	'description',
	'bannerTxId',
	'iconTxId',
	'wallpaperTxId',
	'users',
	'categories',
	'topics',
	'links',
	'domains',
	'pages',
	'fonts',
	'themes',
	'layout',
	'postPreviews',
	'uploads',
	'featuredPosts',
	'patches',
	'posts',
]);

const PATCHABLE_PORTAL_KEYS = new Set([
	'name',
	'description',
	'bannerTxId',
	'iconTxId',
	'wallpaperTxId',
	'users',
	'categories',
	'topics',
	'links',
	'domains',
	'pages',
	'fonts',
	'themes',
	'layout',
	'postPreviews',
	'uploads',
	'featuredPosts',
]);

const UNSAFE_PATCH_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const ARRAY_IDENTITY_KEYS = ['address', 'id', 'tx', 'txId', 'key', 'name', 'url', 'uri', 'slug', 'value'];

type ArweaveTag = { name: string; value: string };
type ArweaveQueryTag = { name: string; value: string | string[] };

type GraphQLNode = {
	id: string;
	owner?: { address?: string };
	tags?: ArweaveTag[];
	block?: { height?: number; timestamp?: number } | null;
};

const ROLE_OPTIONS = {
	Admin: 'Admin',
	Contributor: 'Contributor',
	Moderator: 'Moderator',
	ExternalContributor: 'ExternalContributor',
};

const PERMISSIONS = {
	'Zone-Update': { roles: ['Admin'] },
	'Role-Set': { roles: ['Admin'] },
	'Add-Index-Id': { roles: ['Admin', 'Contributor'] },
	'Add-Index-Request': { roles: [] },
	'Update-Index-Request': { roles: [] },
	'Update-Status-Index-Request': { roles: [] },
};

const writeQueues = new Map<string, Promise<any>>();
const membershipWriteQueues = new Map<string, Promise<string>>();
const transactionBodyCache = new Map<string, any>();
const transactionBodyRequests = new Map<string, Promise<any | null>>();
const portalResolveCache = new Map<string, { manifest: BasePortalManifest; resolvedAt: number }>();
const portalResolveRequests = new Map<string, Promise<BasePortalManifest | null>>();

function localStorageAvailable() {
	return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readStringList(key: string): string[] {
	if (!localStorageAvailable()) return [];
	try {
		const value = JSON.parse(localStorage.getItem(key) || '[]');
		return Array.isArray(value) ? value.filter((entry) => typeof entry === 'string') : [];
	} catch {
		return [];
	}
}

function writeStringList(key: string, values: string[]) {
	if (!localStorageAvailable()) return;
	localStorage.setItem(key, JSON.stringify(Array.from(new Set(values))));
}

function cacheManifest(manifest: BasePortalManifest) {
	if (!localStorageAvailable()) return;
	localStorage.setItem(STORAGE.basePortal(manifest.portalId), JSON.stringify(manifest));
	if (manifest.manifestTxId) {
		localStorage.setItem(STORAGE.basePortalLatest(manifest.portalId), manifest.manifestTxId);
	}
}

function rememberResolvedManifest(manifest: BasePortalManifest) {
	cacheManifest(manifest);
	portalResolveCache.set(manifest.portalId, { manifest, resolvedAt: Date.now() });
}

function getCachedManifest(portalId: string): BasePortalManifest | null {
	if (!localStorageAvailable()) return null;
	try {
		const value = localStorage.getItem(STORAGE.basePortal(portalId));
		return value ? normalizeManifest(JSON.parse(value)) : null;
	} catch {
		return null;
	}
}

function randomId(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	let binary = '';
	bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function normalizeManifest(value: any, txId?: string): BasePortalManifest | null {
	if (!value || value.mode !== 'base' || value.type !== 'portal-manifest' || !value.portalId) return null;
	return {
		...value,
		schemaVersion: value.schemaVersion || BASE_SCHEMA_VERSION,
		manifestTxId: txId || value.manifestTxId || null,
		rootTxId: value.rootTxId || (!value.previousTxId ? txId || value.manifestTxId || null : null),
		previousTxId: value.previousTxId || null,
		siteTxId: ARWEAVE_ID.test(value.siteTxId || '') ? value.siteTxId : null,
		engineReferenceId: ARWEAVE_ID.test(value.engineReferenceId || '')
			? value.engineReferenceId
			: ENGINE_LITE_REFERENCE_ID,
		date: value.date || value.generatedAt || new Date(0).toISOString(),
		updated: value.updated || value.generatedAt || new Date(0).toISOString(),
		authorAddress: value.authorAddress || value.owner,
		users: Array.isArray(value.users) ? value.users : [],
		categories: Array.isArray(value.categories) ? value.categories : [],
		topics: Array.isArray(value.topics) ? value.topics : [],
		links: Array.isArray(value.links) ? value.links : [],
		domains: Array.isArray(value.domains) ? value.domains : [],
		fonts: value.fonts || { headers: FONT_OPTIONS.headers[0], body: FONT_OPTIONS.body[0] },
		themes: Array.isArray(value.themes) && value.themes.length ? value.themes : [THEME.DEFAULT],
		layout: value.layout || LAYOUT.JOURNAL,
		uploads: Array.isArray(value.uploads) ? value.uploads : [],
		posts: Array.isArray(value.posts) ? value.posts : [],
		featuredPosts: Array.isArray(value.featuredPosts)
			? value.featuredPosts.filter((postId: unknown) => typeof postId === 'string')
			: [],
		postCount: Array.isArray(value.posts) ? value.posts.length : 0,
		checkpointTxId: value.checkpointTxId || null,
		releasesSinceCheckpoint: Number.isFinite(value.releasesSinceCheckpoint)
			? Math.max(0, value.releasesSinceCheckpoint)
			: 0,
		releaseBytesSinceCheckpoint: Number.isFinite(value.releaseBytesSinceCheckpoint)
			? Math.max(0, value.releaseBytesSinceCheckpoint)
			: 0,
		includedTxIdsSinceCheckpoint: Array.isArray(value.includedTxIdsSinceCheckpoint)
			? value.includedTxIdsSinceCheckpoint.filter((id: unknown) => typeof id === 'string' && ARWEAVE_ID.test(id))
			: [],
	};
}

function normalizeCheckpoint(
	value: any,
	txId: string
): { checkpoint: BasePortalCheckpoint; manifest: BasePortalManifest } | null {
	if (
		!value ||
		value.mode !== 'base' ||
		value.type !== 'portal-checkpoint' ||
		typeof value.portalId !== 'string' ||
		!ARWEAVE_ID.test(value.rootTxId) ||
		!ARWEAVE_ID.test(value.previousTxId) ||
		!ARWEAVE_ID.test(value.baseCheckpointTxId) ||
		!Array.isArray(value.includedTxIds) ||
		value.includedTxIds.some((id: unknown) => typeof id !== 'string' || !ARWEAVE_ID.test(id)) ||
		!value.state ||
		typeof value.state !== 'object'
	) {
		return null;
	}
	const manifest = normalizeManifest(
		{
			...value.state,
			type: 'portal-manifest',
			mode: 'base',
			portalId: value.portalId,
			rootTxId: value.rootTxId,
			previousTxId: value.previousTxId,
			checkpointTxId: txId,
			releasesSinceCheckpoint: 0,
			releaseBytesSinceCheckpoint: 0,
			includedTxIdsSinceCheckpoint: [],
		},
		txId
	);
	if (!manifest || manifest.portalId !== value.portalId || manifest.rootTxId !== value.rootTxId) return null;
	return {
		checkpoint: {
			schemaVersion: typeof value.schemaVersion === 'string' ? value.schemaVersion : BASE_SCHEMA_VERSION,
			type: 'portal-checkpoint',
			mode: 'base',
			portalId: value.portalId,
			rootTxId: value.rootTxId,
			previousTxId: value.previousTxId,
			baseCheckpointTxId: value.baseCheckpointTxId,
			includedTxIds: Array.from(new Set(value.includedTxIds)),
			generatedAt: typeof value.generatedAt === 'string' ? value.generatedAt : new Date(0).toISOString(),
			authorAddress: typeof value.authorAddress === 'string' ? value.authorAddress : '',
			state: manifest,
		},
		manifest,
	};
}

async function mapWithConcurrency<T, R>(
	values: T[],
	limit: number,
	mapper: (value: T, index: number) => Promise<R>
): Promise<R[]> {
	const results = new Array<R>(values.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(Math.max(1, limit), values.length) }, async () => {
		while (cursor < values.length) {
			const index = cursor++;
			results[index] = await mapper(values[index], index);
		}
	});
	await Promise.all(workers);
	return results;
}

async function fetchImmutableTransactionJson(txId: string): Promise<any | null> {
	if (!ARWEAVE_ID.test(txId)) return null;
	if (transactionBodyCache.has(txId)) return cloneJsonValue(transactionBodyCache.get(txId));
	const active = transactionBodyRequests.get(txId);
	if (active) return cloneJsonValue(await active);

	const request = (async () => {
		const url = `${ARWEAVE_GATEWAY}/${txId}`;
		try {
			if (typeof caches !== 'undefined') {
				const cache = await caches.open(TRANSACTION_CACHE_NAME);
				const cached = await cache.match(url);
				if (cached?.ok) {
					const value = await cached.json();
					transactionBodyCache.set(txId, value);
					return value;
				}
			}

			const response = await fetch(url, { cache: 'force-cache' });
			if (!response.ok) return null;
			if (typeof caches !== 'undefined') {
				void caches
					.open(TRANSACTION_CACHE_NAME)
					.then((cache) => cache.put(url, response.clone()))
					.catch(() => undefined);
			}
			const value = await response.json();
			transactionBodyCache.set(txId, value);
			return value;
		} catch {
			return null;
		}
	})();
	transactionBodyRequests.set(txId, request);
	try {
		return cloneJsonValue(await request);
	} finally {
		transactionBodyRequests.delete(txId);
	}
}

function isPatchSelector(value: unknown): value is BasePortalPatchSelector {
	return (
		Array.isArray(value) &&
		value.length === 3 &&
		value[0] === '=' &&
		typeof value[1] === 'string' &&
		(value[1] === '' || ARRAY_IDENTITY_KEYS.includes(value[1])) &&
		!UNSAFE_PATCH_KEYS.has(value[1]) &&
		(value[2] === null || ['string', 'number', 'boolean'].includes(typeof value[2]))
	);
}

function isPatchPath(value: unknown): value is BasePortalPatchPath {
	return (
		Array.isArray(value) &&
		value.length > 0 &&
		typeof value[0] === 'string' &&
		PATCHABLE_PORTAL_KEYS.has(value[0]) &&
		value.every(
			(part) =>
				(typeof part === 'string' && !UNSAFE_PATCH_KEYS.has(part)) ||
				(typeof part === 'number' && Number.isSafeInteger(part) && part >= 0) ||
				isPatchSelector(part)
		)
	);
}

function isPortalPatch(value: unknown): value is BasePortalPatch {
	if (!Array.isArray(value) || !isPatchPath(value[1])) return false;
	switch (value[0]) {
		case 's':
			return value.length === 3;
		case 'd':
			return value.length === 2;
		case 'p':
			return (
				value.length === 5 &&
				Number.isSafeInteger(value[2]) &&
				value[2] >= 0 &&
				Number.isSafeInteger(value[3]) &&
				value[3] >= 0 &&
				Array.isArray(value[4])
			);
		case 'm':
			return (
				value.length === 3 &&
				isPatchSelector(value[1][value[1].length - 1]) &&
				Number.isSafeInteger(value[2]) &&
				value[2] >= 0
			);
		default:
			return false;
	}
}

function normalizeRelease(value: any): BasePortalRelease | null {
	if (
		!value ||
		value.mode !== 'base' ||
		value.type !== 'portal-release' ||
		typeof value.portalId !== 'string' ||
		!ARWEAVE_ID.test(value.rootTxId) ||
		!ARWEAVE_ID.test(value.previousTxId) ||
		!value.changes ||
		typeof value.changes !== 'object' ||
		Array.isArray(value.changes) ||
		Object.keys(value.changes).some((key) => !RELEASE_CHANGE_KEYS.has(key))
	) {
		return null;
	}

	const posts = value.changes.posts;
	if (value.changes.patches !== undefined) {
		if (!Array.isArray(value.changes.patches) || !value.changes.patches.every(isPortalPatch)) return null;
	}
	if (posts !== undefined) {
		if (!posts || typeof posts !== 'object' || Array.isArray(posts)) return null;
		if (Object.keys(posts).some((key) => key !== 'upsert' && key !== 'remove')) return null;
		if (
			posts.upsert !== undefined &&
			(!posts.upsert ||
				typeof posts.upsert !== 'object' ||
				Array.isArray(posts.upsert) ||
				Object.values(posts.upsert).some((txId) => typeof txId !== 'string' || !ARWEAVE_ID.test(txId)))
		) {
			return null;
		}
		if (posts.remove !== undefined && !Array.isArray(posts.remove)) return null;
	}

	return {
		schemaVersion: typeof value.schemaVersion === 'string' ? value.schemaVersion : BASE_SCHEMA_VERSION,
		type: 'portal-release',
		mode: 'base',
		portalId: value.portalId,
		rootTxId: value.rootTxId,
		previousTxId: value.previousTxId,
		generatedAt: typeof value.generatedAt === 'string' ? value.generatedAt : new Date(0).toISOString(),
		authorAddress: typeof value.authorAddress === 'string' ? value.authorAddress : '',
		changes: value.changes,
	};
}

function jsonEqual(left: unknown, right: unknown) {
	return left === right || JSON.stringify(left) === JSON.stringify(right);
}

function isPlainObject(value: unknown): value is Record<string, any> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function identityValue(item: any, key: string) {
	return key === '' ? item : item?.[key];
}

function identityMapKey(value: unknown) {
	return JSON.stringify([typeof value, value]);
}

function usableIdentityKey(before: unknown[], after: unknown[]): string | null {
	const values = [...before, ...after];
	if (values.length === 0) return null;
	const primitive = values.every(
		(value) => value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
	);
	if (primitive) {
		const uniqueBefore = new Set(before.map(identityMapKey)).size === before.length;
		const uniqueAfter = new Set(after.map(identityMapKey)).size === after.length;
		return uniqueBefore && uniqueAfter ? '' : null;
	}

	for (const key of ARRAY_IDENTITY_KEYS) {
		const valid = values.every((value) => {
			const identity = isPlainObject(value) ? value[key] : undefined;
			return typeof identity === 'string' || typeof identity === 'number' || typeof identity === 'boolean';
		});
		if (!valid) continue;
		const uniqueBefore =
			new Set(before.map((value) => identityMapKey(identityValue(value, key)))).size === before.length;
		const uniqueAfter = new Set(after.map((value) => identityMapKey(identityValue(value, key)))).size === after.length;
		if (uniqueBefore && uniqueAfter) return key;
	}
	return null;
}

function diffJson(before: any, after: any, path: BasePortalPatchPath, patches: BasePortalPatch[]) {
	if (jsonEqual(before, after)) return;

	if (isPlainObject(before) && isPlainObject(after)) {
		const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort();
		if (keys.some((key) => UNSAFE_PATCH_KEYS.has(key))) {
			patches.push(['s', path, after]);
			return;
		}
		for (const key of keys) {
			if (!(key in after)) patches.push(['d', [...path, key]]);
			else if (!(key in before)) patches.push(['s', [...path, key], after[key]]);
			else diffJson(before[key], after[key], [...path, key], patches);
		}
		return;
	}

	if (Array.isArray(before) && Array.isArray(after)) {
		const identityKey = usableIdentityKey(before, after);
		if (identityKey !== null) {
			const beforeById = new Map(before.map((value) => [identityMapKey(identityValue(value, identityKey)), value]));
			const afterById = new Map(after.map((value) => [identityMapKey(identityValue(value, identityKey)), value]));
			const selector = (value: any): BasePortalPatchSelector => ['=', identityKey, identityValue(value, identityKey)];

			for (const value of before) {
				if (!afterById.has(identityMapKey(identityValue(value, identityKey)))) {
					patches.push(['d', [...path, selector(value)]]);
				}
			}
			for (const value of after) {
				const key = identityMapKey(identityValue(value, identityKey));
				if (!beforeById.has(key)) patches.push(['s', [...path, selector(value)], value]);
				else diffJson(beforeById.get(key), value, [...path, selector(value)], patches);
			}

			const desired = after.map((value) => identityMapKey(identityValue(value, identityKey)));
			const working = before
				.map((value) => identityMapKey(identityValue(value, identityKey)))
				.filter((key) => afterById.has(key));
			for (const value of after) {
				const key = identityMapKey(identityValue(value, identityKey));
				if (!working.includes(key)) working.push(key);
			}
			for (let index = 0; index < desired.length; index += 1) {
				if (working[index] === desired[index]) continue;
				const from = working.indexOf(desired[index]);
				if (from < 0) continue;
				patches.push(['m', [...path, selector(after[index])], index]);
				const [moved] = working.splice(from, 1);
				working.splice(index, 0, moved);
			}
			return;
		}

		if (before.length === after.length) {
			for (let index = 0; index < after.length; index += 1) {
				diffJson(before[index], after[index], [...path, index], patches);
			}
			return;
		}

		let prefix = 0;
		while (prefix < before.length && prefix < after.length && jsonEqual(before[prefix], after[prefix])) prefix += 1;
		let suffix = 0;
		while (
			suffix < before.length - prefix &&
			suffix < after.length - prefix &&
			jsonEqual(before[before.length - 1 - suffix], after[after.length - 1 - suffix])
		) {
			suffix += 1;
		}
		patches.push(['p', path, prefix, before.length - prefix - suffix, after.slice(prefix, after.length - suffix)]);
		return;
	}

	patches.push(['s', path, after]);
}

function selectorIndex(values: any[], selector: BasePortalPatchSelector) {
	const [, key, expected] = selector;
	return values.findIndex((value) => jsonEqual(identityValue(value, key), expected));
}

function resolvePatchPath(root: any, path: BasePortalPatchPath): any {
	let current = root;
	for (const part of path) {
		if (typeof part === 'string') {
			if (
				!current ||
				typeof current !== 'object' ||
				Array.isArray(current) ||
				!Object.prototype.hasOwnProperty.call(current, part)
			) {
				return undefined;
			}
			current = current[part];
		} else if (typeof part === 'number') {
			if (!Array.isArray(current) || part >= current.length) return undefined;
			current = current[part];
		} else {
			if (!Array.isArray(current)) return undefined;
			const index = selectorIndex(current, part);
			if (index < 0) return undefined;
			current = current[index];
		}
	}
	return current;
}

function cloneJsonValue<T>(value: T): T {
	if (typeof structuredClone === 'function') return structuredClone(value);
	return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

function applyPortalPatch(root: Record<string, any>, patch: BasePortalPatch) {
	if (patch[0] === 'p') {
		const target = resolvePatchPath(root, patch[1]);
		if (Array.isArray(target)) target.splice(patch[2], patch[3], ...cloneJsonValue(patch[4]));
		return;
	}
	if (patch[0] === 'm') {
		const path = patch[1];
		const selector = path[path.length - 1];
		if (!isPatchSelector(selector)) return;
		const target = resolvePatchPath(root, path.slice(0, -1));
		if (!Array.isArray(target)) return;
		const from = selectorIndex(target, selector);
		if (from < 0) return;
		const [value] = target.splice(from, 1);
		target.splice(Math.min(patch[2], target.length), 0, value);
		return;
	}

	const path = patch[1];
	const parent = resolvePatchPath(root, path.slice(0, -1));
	const final = path[path.length - 1];
	if (!parent || final === undefined) return;
	if (patch[0] === 's') {
		const value = cloneJsonValue(patch[2]);
		if (typeof final === 'string' && !Array.isArray(parent)) parent[final] = value;
		else if (typeof final === 'number' && Array.isArray(parent) && final < parent.length) parent[final] = value;
		else if (isPatchSelector(final) && Array.isArray(parent)) {
			const index = selectorIndex(parent, final);
			if (index < 0) parent.push(value);
			else parent[index] = value;
		}
		return;
	}
	if (typeof final === 'string' && !Array.isArray(parent)) delete parent[final];
	else if (typeof final === 'number' && Array.isArray(parent)) parent.splice(final, 1);
	else if (isPatchSelector(final) && Array.isArray(parent)) {
		const index = selectorIndex(parent, final);
		if (index >= 0) parent.splice(index, 1);
	}
}

function applyPortalPatches(base: BasePortalManifest, patches: BasePortalPatch[] = []) {
	const next: Record<string, any> = { ...base };
	const cloned = new Set<string>();
	for (const patch of patches) {
		const topLevel = patch[1][0];
		if (typeof topLevel !== 'string' || !PATCHABLE_PORTAL_KEYS.has(topLevel)) continue;
		if (!cloned.has(topLevel)) {
			next[topLevel] = cloneJsonValue(next[topLevel]);
			cloned.add(topLevel);
		}
		applyPortalPatch(next, patch);
	}
	return next;
}

function releaseChangeFields(changes: BasePortalReleaseChanges) {
	const fields = new Set(Object.keys(changes).filter((key) => key !== 'patches'));
	for (const patch of changes.patches || []) {
		const field = patch[1][0];
		if (typeof field === 'string') fields.add(field);
	}
	return fields;
}

function userCanWrite(manifest: BasePortalManifest, address: string, roles: PortalUserRoleType[]) {
	if (manifest.owner === address) return true;
	const user = manifest.users.find((entry) => entry.address === address);
	return Boolean(user?.roles?.some((role) => roles.includes(role)));
}

function assertCanWrite(manifest: BasePortalManifest, address: string, roles: PortalUserRoleType[]) {
	if (!userCanWrite(manifest, address, roles)) {
		throw new Error('This wallet is not authorized to update the base portal');
	}
}

function tagValue(node: GraphQLNode, name: string) {
	return node.tags?.find((tag) => tag.name === name)?.value || null;
}

async function queryTransactions(
	tags: ArweaveTag[],
	first = 100,
	sort: 'HEIGHT_ASC' | 'HEIGHT_DESC' = 'HEIGHT_DESC'
): Promise<GraphQLNode[]> {
	const response = await fetch(ARWEAVE_GRAPHQL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
				query BasePortalTransactions($tags: [TagFilter!], $first: Int!) {
					transactions(tags: $tags, first: $first, sort: ${sort}) {
						edges {
							node { id owner { address } tags { name value } block { height timestamp } }
						}
					}
				}
			`,
			variables: { tags: tags.map((tag) => ({ name: tag.name, values: [tag.value] })), first },
		}),
	});
	if (!response.ok) throw new Error(`Base portal discovery failed: ${response.status}`);
	const payload = await response.json();
	if (payload.errors?.length) throw new Error(payload.errors[0]?.message || 'Base portal discovery failed');
	return payload.data?.transactions?.edges?.map((edge: any) => edge.node) || [];
}

async function queryAllTransactions(
	tags: ArweaveQueryTag[],
	sort: 'HEIGHT_ASC' | 'HEIGHT_DESC' = 'HEIGHT_ASC'
): Promise<GraphQLNode[]> {
	const nodes: GraphQLNode[] = [];
	let cursor: string | null = null;

	for (let page = 0; page < 100; page += 1) {
		const response = await fetch(ARWEAVE_GRAPHQL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `
					query AllBasePortalTransactions($tags: [TagFilter!], $after: String) {
						transactions(tags: $tags, first: 100, after: $after, sort: ${sort}) {
							pageInfo { hasNextPage }
							edges {
								cursor
								node { id owner { address } tags { name value } block { height timestamp } }
							}
						}
					}
				`,
				variables: {
					tags: tags.map((tag) => ({
						name: tag.name,
						values: Array.isArray(tag.value) ? tag.value : [tag.value],
					})),
					after: cursor,
				},
			}),
		});
		if (!response.ok) throw new Error(`Base portal discovery failed: ${response.status}`);
		const payload = await response.json();
		if (payload.errors?.length) throw new Error(payload.errors[0]?.message || 'Base portal discovery failed');
		const connection = payload.data?.transactions;
		const edges = Array.isArray(connection?.edges) ? connection.edges : [];
		nodes.push(...edges.map((edge: any) => edge.node));
		if (!connection?.pageInfo?.hasNextPage || edges.length === 0) break;
		cursor = edges[edges.length - 1].cursor;
	}

	return nodes;
}

async function fetchManifestTransaction(txId: string): Promise<BasePortalManifest | null> {
	if (!ARWEAVE_ID.test(txId)) return null;
	return normalizeManifest(await fetchImmutableTransactionJson(txId), txId);
}

async function fetchPortalTransaction(txId: string): Promise<BasePortalTransaction | null> {
	if (!ARWEAVE_ID.test(txId)) return null;
	const value = await fetchImmutableTransactionJson(txId);
	const manifest = normalizeManifest(value, txId);
	if (manifest) return { kind: 'manifest', manifest };
	const release = normalizeRelease(value);
	if (release) return { kind: 'release', release };
	const checkpoint = normalizeCheckpoint(value, txId);
	return checkpoint ? { kind: 'checkpoint', ...checkpoint } : null;
}

async function fetchTransactionOwner(txId: string): Promise<string | null> {
	if (!ARWEAVE_ID.test(txId)) return null;
	try {
		const response = await fetch(ARWEAVE_GRAPHQL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `
					query BasePortalTransactionOwner($ids: [ID!]) {
						transactions(ids: $ids, first: 1) {
							edges { node { owner { address } } }
						}
					}
				`,
				variables: { ids: [txId] },
			}),
		});
		if (!response.ok) return null;
		const payload = await response.json();
		return payload.data?.transactions?.edges?.[0]?.node?.owner?.address || null;
	} catch {
		return null;
	}
}

function contributorOnlyChangedContent(parent: BasePortalManifest, child: BasePortalManifest) {
	const omitRevisionFields = (manifest: BasePortalManifest) => {
		const {
			posts: _posts,
			postCount: _postCount,
			uploads: _uploads,
			manifestTxId: _manifestTxId,
			previousTxId: _previousTxId,
			generatedAt: _generatedAt,
			updated: _updated,
			...portalFields
		} = manifest;
		return portalFields;
	};
	return JSON.stringify(omitRevisionFields(parent)) === JSON.stringify(omitRevisionFields(child));
}

function publisherCanCreateRevision(parent: BasePortalManifest, child: BasePortalManifest, publisher: string) {
	if (parent.owner === publisher) return true;
	const user = parent.users.find((entry) => entry.address === publisher);
	if (user?.roles?.includes('Admin')) return true;
	return Boolean(user?.roles?.includes('Contributor') && contributorOnlyChangedContent(parent, child));
}

function publisherCanApplyRelease(parent: BasePortalManifest, release: BasePortalRelease, publisher: string) {
	if (release.authorAddress && release.authorAddress !== publisher) return false;
	if (parent.owner === publisher) return true;
	const roles = parent.users.find((entry) => entry.address === publisher)?.roles || [];
	if (roles.includes('Admin')) return true;
	const fields = releaseChangeFields(release.changes);
	return (
		roles.includes('Contributor') &&
		fields.size > 0 &&
		Array.from(fields).every((field) => field === 'posts' || field === 'uploads')
	);
}

function trackReleaseReferences(release: BasePortalRelease) {
	const references = new Map<string, string>();
	for (const txId of Object.values(release.changes.posts?.upsert || {})) references.set(txId, 'portal-post');
	for (const txId of [release.changes.bannerTxId, release.changes.iconTxId, release.changes.wallpaperTxId]) {
		if (typeof txId === 'string' && ARWEAVE_ID.test(txId)) references.set(txId, 'portal-media');
	}
	if (Array.isArray(release.changes.uploads)) {
		for (const upload of release.changes.uploads) {
			for (const txId of [upload?.tx, upload?.thumbnail]) {
				if (typeof txId === 'string' && ARWEAVE_ID.test(txId)) references.set(txId, 'portal-media');
			}
		}
	}
	const createdAt = Date.parse(release.generatedAt) || Date.now();
	for (const [id, type] of references) {
		trackObservedPendingTransaction({ id, portalId: release.portalId, type, createdAt });
	}
}

function normalizeReleaseUsers(value: unknown, owner: string): PortalUserType[] {
	const users = new Map<string, PortalUserType>();
	if (Array.isArray(value)) {
		for (const candidate of value) {
			if (!candidate || typeof candidate.address !== 'string' || !Array.isArray(candidate.roles)) continue;
			users.set(candidate.address, {
				address: candidate.address,
				type: 'wallet',
				roles: candidate.roles.filter((role: unknown) => typeof role === 'string') as PortalUserRoleType[],
			});
		}
	}
	users.set(owner, { address: owner, type: 'wallet', roles: ['Admin'] });
	return Array.from(users.values());
}

async function fetchPostRevision(
	txId: string,
	portalId: string,
	postId: string,
	existing?: BasePortalPost
): Promise<BasePortalPost | null> {
	if (!ARWEAVE_ID.test(txId)) return null;
	try {
		const payload = await fetchImmutableTransactionJson(txId);
		const isInitialPostTransaction = payload?.postId == null && payload?.previousTxId == null && txId === postId;
		if (
			payload?.mode !== 'base' ||
			payload?.type !== 'portal-post' ||
			payload?.portalId !== portalId ||
			(payload?.postId !== postId && !isInitialPostTransaction) ||
			!payload.post ||
			typeof payload.post !== 'object'
		) {
			return null;
		}
		const derived = postFromData(postId, txId, payload.post, existing);
		return typeof payload.post.title === 'string'
			? { ...derived, ...payload.post, id: postId, postTxId: txId }
			: derived;
	} catch {
		return null;
	}
}

async function applyRelease(
	parent: BasePortalManifest,
	release: BasePortalRelease,
	releaseTxId: string,
	publisher: string,
	knownPosts: Record<string, BasePortalPost> = {}
): Promise<BasePortalManifest | null> {
	const { posts: postChanges, patches, ...legacyPortalChanges } = release.changes;
	const posts = new Map(parent.posts.map((post) => [post.id, post]));

	for (const postId of postChanges?.remove || []) {
		if (typeof postId === 'string') posts.delete(postId);
	}
	for (const [postId, postTxId] of Object.entries(postChanges?.upsert || {})) {
		const post = knownPosts[postId] || (await fetchPostRevision(postTxId, parent.portalId, postId, posts.get(postId)));
		if (!post) return null;
		posts.set(postId, { ...post, id: postId, postTxId });
	}

	const generatedAt = release.generatedAt || new Date(0).toISOString();
	const portalChanges = applyPortalPatches({ ...parent, ...legacyPortalChanges } as BasePortalManifest, patches);
	const next = normalizeManifest({
		...portalChanges,
		schemaVersion: release.schemaVersion || BASE_SCHEMA_VERSION,
		type: 'portal-manifest',
		mode: 'base',
		manifestTxId: releaseTxId,
		rootTxId: release.rootTxId,
		previousTxId: release.previousTxId,
		generatedAt,
		updated: generatedAt,
		authorAddress: publisher,
		users: normalizeReleaseUsers(portalChanges.users, parent.owner),
		posts: Array.from(posts.values()),
		featuredPosts: (portalChanges.featuredPosts || []).filter((postId) => posts.has(postId)),
		postCount: posts.size,
		checkpointTxId: parent.checkpointTxId || null,
		releasesSinceCheckpoint: (parent.releasesSinceCheckpoint || 0) + 1,
		releaseBytesSinceCheckpoint:
			(parent.releaseBytesSinceCheckpoint || 0) + new TextEncoder().encode(JSON.stringify(release)).byteLength,
		includedTxIdsSinceCheckpoint: [
			...(parent.includedTxIdsSinceCheckpoint || []),
			...(releaseTxId !== parent.manifestTxId ? [releaseTxId] : []),
		],
	});
	return next;
}

async function validateManifestChain(
	manifest: BasePortalManifest,
	publisher: string,
	rootTxId: string,
	rootOwner: string,
	validated = new Map<string, boolean>(),
	visiting = new Set<string>()
): Promise<boolean> {
	const txId = manifest.manifestTxId;
	if (!txId || manifest.portalId.length === 0 || manifest.owner !== rootOwner) return false;
	if (validated.has(txId)) return validated.get(txId) || false;
	if (visiting.has(txId)) return false;
	visiting.add(txId);

	if (txId === rootTxId) {
		const validRoot = !manifest.previousTxId && publisher === rootOwner;
		validated.set(txId, validRoot);
		visiting.delete(txId);
		return validRoot;
	}

	if (manifest.rootTxId !== rootTxId || !manifest.previousTxId) {
		validated.set(txId, false);
		visiting.delete(txId);
		return false;
	}

	const parent = await fetchManifestTransaction(manifest.previousTxId);
	const parentPublisher = await fetchTransactionOwner(manifest.previousTxId);
	const valid = Boolean(
		parent &&
			parentPublisher &&
			parent.portalId === manifest.portalId &&
			(await validateManifestChain(parent, parentPublisher, rootTxId, rootOwner, validated, visiting)) &&
			publisherCanCreateRevision(parent, manifest, publisher)
	);
	validated.set(txId, valid);
	visiting.delete(txId);
	return valid;
}

async function latestManifestForPortal(
	portalId: string,
	preferredTxId?: string | null
): Promise<BasePortalManifest | null> {
	const nodes = await queryAllTransactions(
		[
			{ name: 'Portal-Mode', value: 'base' },
			{ name: 'Portal-Id', value: portalId },
			{ name: 'Type', value: ['portal-manifest', 'portal-release', 'portal-checkpoint'] },
		],
		'HEIGHT_ASC'
	);
	const portalNodes = nodes.filter((node) =>
		['portal-manifest', 'portal-release', 'portal-checkpoint'].includes(tagValue(node, 'Type') || '')
	);
	const portalNodeIds = new Set(portalNodes.map((node) => node.id));

	let root: BasePortalManifest | null = null;
	let rootOwner = '';
	let rootTxId = '';
	let rootIndex = -1;
	for (let index = 0; index < portalNodes.length; index += 1) {
		const node = portalNodes[index];
		if (tagValue(node, 'Type') !== 'portal-manifest' || tagValue(node, 'Previous-Tx')) continue;
		const transaction = await fetchPortalTransaction(node.id);
		if (transaction?.kind !== 'manifest') continue;
		const candidate = transaction.manifest;
		if (candidate.portalId !== portalId || candidate.previousTxId) continue;
		if (node.owner?.address && node.owner.address === candidate.owner) {
			root = candidate;
			rootOwner = node.owner.address;
			rootTxId = node.id;
			rootIndex = index;
			break;
		}
	}
	if (!root?.manifestTxId || !rootOwner || !rootTxId) return null;

	// Only a checkpoint signed by the immutable root owner can bootstrap a cold
	// load without replaying the releases that established administrator roles.
	let current = { ...root, rootTxId };
	let selectedCheckpoint: BasePortalCheckpoint | null = null;
	let selectedCheckpointIndex = rootIndex;
	for (let index = portalNodes.length - 1; index > rootIndex; index -= 1) {
		const node = portalNodes[index];
		if (tagValue(node, 'Type') !== 'portal-checkpoint' || node.owner?.address !== rootOwner) continue;
		const transaction = await fetchPortalTransaction(node.id);
		if (transaction?.kind !== 'checkpoint') continue;
		const { checkpoint, manifest } = transaction;
		if (
			checkpoint.portalId !== portalId ||
			checkpoint.rootTxId !== rootTxId ||
			checkpoint.authorAddress !== rootOwner ||
			manifest.owner !== rootOwner ||
			!portalNodeIds.has(checkpoint.baseCheckpointTxId) ||
			portalNodes.findIndex((candidate) => candidate.id === checkpoint.baseCheckpointTxId) >= index
		) {
			continue;
		}
		current = manifest;
		selectedCheckpoint = checkpoint;
		selectedCheckpointIndex = index;
		break;
	}

	const baseCheckpointIndex = selectedCheckpoint
		? portalNodes.findIndex((node) => node.id === selectedCheckpoint?.baseCheckpointTxId)
		: rootIndex;
	const includedCheckpointIds = new Set(selectedCheckpoint?.includedTxIds || []);
	const historical = new Set(portalNodes.slice(0, baseCheckpointIndex + 1).map((node) => node.id));
	const accepted = new Set<string>([
		rootTxId,
		...(current.checkpointTxId ? [current.checkpointTxId] : []),
		...includedCheckpointIds,
	]);
	const unresolved = new Set<string>();
	const blocked = new Set<string>();
	const legacyValidated = new Map<string, boolean>([[rootTxId, true]]);
	const tailNodes = portalNodes
		.slice(baseCheckpointIndex + 1)
		.filter(
			(node, index) =>
				baseCheckpointIndex + 1 + index !== selectedCheckpointIndex &&
				tagValue(node, 'Type') !== 'portal-checkpoint' &&
				!includedCheckpointIds.has(node.id)
		);
	const loaded = await mapWithConcurrency(tailNodes, TRANSACTION_FETCH_CONCURRENCY, async (node) => ({
		node,
		transaction: await fetchPortalTransaction(node.id),
	}));
	for (const { node, transaction } of loaded) {
		if (transaction) continue;
		trackObservedPendingTransaction({
			id: node.id,
			portalId,
			type: tagValue(node, 'Type') || 'portal-release',
			createdAt: node.block?.timestamp ? node.block.timestamp * 1000 : Date.now(),
		});
	}
	const predecessorAccepted = (txId: string) => accepted.has(txId) || historical.has(txId);
	// Releases form a merge log rather than a single winning branch. A release
	// may name any accepted predecessor, while its patch is applied to the
	// complete state established by all accepted Arweave transactions. GraphQL
	// can return transactions from the same block out of dependency order, so
	// retry only predecessor-blocked entries until no more progress is possible.
	let pending = loaded;
	while (pending.length > 0) {
		const nextPending: typeof pending = [];
		let progressed = false;

		for (const { node, transaction } of pending) {
			const publisher = node.owner?.address || '';
			if (!transaction || !publisher) continue;
			if (transaction.kind === 'checkpoint') continue;

			if (transaction.kind === 'manifest') {
				const candidate = transaction.manifest;
				if (candidate.previousTxId && !predecessorAccepted(candidate.previousTxId)) {
					nextPending.push({ node, transaction });
					continue;
				}
				if (
					candidate.portalId !== portalId ||
					candidate.owner !== rootOwner ||
					candidate.rootTxId !== rootTxId ||
					!candidate.previousTxId ||
					!predecessorAccepted(candidate.previousTxId) ||
					!(await validateManifestChain(candidate, publisher, rootTxId, rootOwner, legacyValidated))
				) {
					continue;
				}
				current = {
					...candidate,
					users: normalizeReleaseUsers(candidate.users, rootOwner),
					checkpointTxId: current.checkpointTxId || candidate.checkpointTxId || null,
					releasesSinceCheckpoint: (current.releasesSinceCheckpoint || 0) + 1,
					releaseBytesSinceCheckpoint:
						(current.releaseBytesSinceCheckpoint || 0) + new TextEncoder().encode(JSON.stringify(candidate)).byteLength,
					includedTxIdsSinceCheckpoint: [...(current.includedTxIdsSinceCheckpoint || []), node.id],
				};
				accepted.add(node.id);
				progressed = true;
				continue;
			}

			const release = transaction.release;
			if (release.portalId !== portalId || release.rootTxId !== rootTxId) continue;
			if (!predecessorAccepted(release.previousTxId)) {
				nextPending.push({ node, transaction });
				continue;
			}
			if (!publisherCanApplyRelease(current, release, publisher)) continue;
			const next = await applyRelease(current, release, node.id, publisher);
			if (!next) {
				unresolved.add(node.id);
				// A normal reconstruction visits every historical release. Only expose
				// references when they actually prevent this release from being applied.
				trackReleaseReferences(release);
				continue;
			}
			current = next;
			accepted.add(node.id);
			progressed = true;
		}

		if (!progressed) {
			for (const { node, transaction } of nextPending) {
				blocked.add(node.id);
				if (transaction?.kind === 'release') {
					trackObservedPendingTransaction({
						id: transaction.release.previousTxId,
						portalId,
						type: 'portal-release',
						createdAt:
							Date.parse(transaction.release.generatedAt) ||
							(node.block?.timestamp ? node.block.timestamp * 1000 : Date.now()),
					});
				}
			}
			break;
		}
		pending = nextPending;
	}
	if (preferredTxId && !accepted.has(preferredTxId) && !historical.has(preferredTxId)) {
		return null;
	}

	rememberResolvedManifest(current);
	return current;
}

export async function fetchBasePortal(
	identifier: string,
	options: { fresh?: boolean } = {}
): Promise<BasePortalManifest> {
	const cached = getCachedManifest(identifier);
	let direct: BasePortalManifest | null = null;
	let directPortalId: string | null = null;

	if (!cached && ARWEAVE_ID.test(identifier)) {
		const transaction = await fetchPortalTransaction(identifier);
		if (transaction?.kind === 'manifest' || transaction?.kind === 'checkpoint') direct = transaction.manifest;
		directPortalId =
			transaction?.kind === 'manifest'
				? transaction.manifest.portalId
				: transaction?.kind === 'release'
				? transaction.release.portalId
				: transaction?.kind === 'checkpoint'
				? transaction.checkpoint.portalId
				: null;
	}
	const portalId = cached?.portalId || directPortalId || direct?.portalId || identifier;
	const memory = portalResolveCache.get(portalId);
	if (!options.fresh && memory && Date.now() - memory.resolvedAt < BASE_RESOLVE_TTL_MS) return memory.manifest;

	try {
		let request = portalResolveRequests.get(portalId);
		if (!request) {
			request = latestManifestForPortal(portalId, cached?.manifestTxId);
			portalResolveRequests.set(portalId, request);
			void request.finally(() => portalResolveRequests.delete(portalId)).catch(() => undefined);
		}
		const latest = await request;
		if (latest) return latest;
	} catch (error) {
		if (!cached && !direct) throw error;
	}

	const fallback = cached || direct;
	if (!fallback) throw new Error('Base portal manifest not found');
	rememberResolvedManifest(fallback);
	return fallback;
}

async function uploadData(wallet: any, data: string | ArrayBuffer | Uint8Array, tags: ArweaveTag[]): Promise<string> {
	const txId = await uploadTransaction(wallet, data, tags);
	const tag = (name: string) => tags.find((candidate) => candidate.name === name)?.value;
	const address = tag('Author') || tag('Portal-Owner');
	if (address && tag('Portal-Mode') === 'base') {
		trackPendingTransaction({
			id: txId,
			address,
			portalId: tag('Portal-Id'),
			type: tag('Type') || 'base-transaction',
			createdAt: Date.now(),
		});
	}
	return txId;
}

async function publishManifest(manifest: BasePortalManifest, wallet: any): Promise<BasePortalManifest> {
	const generatedAt = new Date().toISOString();
	const payload: BasePortalManifest = {
		...manifest,
		schemaVersion: BASE_SCHEMA_VERSION,
		type: 'portal-manifest',
		mode: 'base',
		manifestTxId: undefined,
		rootTxId: manifest.rootTxId || manifest.manifestTxId || null,
		previousTxId: manifest.manifestTxId || manifest.previousTxId || null,
		generatedAt,
		updated: generatedAt,
		postCount: manifest.posts.length,
	};
	const members = Array.from(new Set([payload.owner, ...payload.users.map((user) => user.address)].filter(Boolean)));
	const txId = await uploadData(wallet, JSON.stringify(payload), [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: BASE_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-manifest' },
		{ name: 'Portal-Id', value: payload.portalId },
		{ name: 'Portal-Owner', value: payload.owner },
		{ name: 'Engine-Reference', value: payload.engineReferenceId },
		...(payload.rootTxId ? [{ name: 'Portal-Root', value: payload.rootTxId }] : []),
		...(payload.previousTxId ? [{ name: 'Previous-Tx', value: payload.previousTxId }] : []),
		...members.map((address) => ({ name: 'Portal-User', value: address })),
	]);
	const published = { ...payload, manifestTxId: txId, rootTxId: payload.rootTxId || txId };
	transactionBodyCache.set(txId, payload);
	rememberResolvedManifest(published);
	return published;
}

async function publishCheckpoint(
	manifest: BasePortalManifest,
	wallet: any,
	address: string
): Promise<BasePortalManifest> {
	if (address !== manifest.owner || !manifest.manifestTxId || !manifest.rootTxId) return manifest;
	const generatedAt = new Date().toISOString();
	const state: BasePortalManifest = {
		...manifest,
		manifestTxId: undefined,
		previousTxId: manifest.manifestTxId,
		generatedAt,
		updated: generatedAt,
		checkpointTxId: null,
		releasesSinceCheckpoint: 0,
		releaseBytesSinceCheckpoint: 0,
		includedTxIdsSinceCheckpoint: [],
	};
	const checkpoint: BasePortalCheckpoint = {
		schemaVersion: BASE_SCHEMA_VERSION,
		type: 'portal-checkpoint',
		mode: 'base',
		portalId: manifest.portalId,
		rootTxId: manifest.rootTxId,
		previousTxId: manifest.manifestTxId,
		baseCheckpointTxId: manifest.checkpointTxId || manifest.rootTxId,
		includedTxIds: Array.from(new Set(manifest.includedTxIdsSinceCheckpoint || [])),
		generatedAt,
		authorAddress: address,
		state,
	};
	const txId = await uploadData(wallet, JSON.stringify(checkpoint), [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: BASE_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-checkpoint' },
		{ name: 'Portal-Id', value: manifest.portalId },
		{ name: 'Portal-Root', value: manifest.rootTxId },
		{ name: 'Previous-Tx', value: manifest.manifestTxId },
		{ name: 'Portal-Owner', value: manifest.owner },
		{ name: 'Author', value: address },
	]);
	transactionBodyCache.set(txId, checkpoint);
	const published = normalizeManifest(
		{
			...state,
			manifestTxId: txId,
			checkpointTxId: txId,
			previousTxId: manifest.manifestTxId,
		},
		txId
	);
	if (!published) throw new Error('Unable to materialize the base portal checkpoint');
	rememberResolvedManifest(published);
	return published;
}

function shouldPublishCheckpoint(manifest: BasePortalManifest) {
	return (
		(manifest.releasesSinceCheckpoint || 0) >= CHECKPOINT_RELEASE_INTERVAL ||
		(manifest.releaseBytesSinceCheckpoint || 0) >= CHECKPOINT_TAIL_BYTES
	);
}

async function publishRelease(
	manifest: BasePortalManifest,
	changes: BasePortalReleaseChanges,
	wallet: any,
	address: string,
	knownPosts: Record<string, BasePortalPost> = {}
): Promise<BasePortalManifest> {
	if (!manifest.manifestTxId || !ARWEAVE_ID.test(manifest.manifestTxId)) {
		throw new Error('The current base portal release is unavailable');
	}
	const rootTxId = manifest.rootTxId || manifest.manifestTxId;
	if (!ARWEAVE_ID.test(rootTxId)) throw new Error('The base portal root is unavailable');
	if (Object.keys(changes).length === 0) return manifest;

	const generatedAt = new Date().toISOString();
	// Only the changed top-level documents or post revision pointers go on the
	// weave. The full manifest returned below is a local materialized view.
	const release: BasePortalRelease = {
		schemaVersion: BASE_SCHEMA_VERSION,
		type: 'portal-release',
		mode: 'base',
		portalId: manifest.portalId,
		rootTxId,
		previousTxId: manifest.manifestTxId,
		generatedAt,
		authorAddress: address,
		changes,
	};
	const preview = await applyRelease(manifest, release, manifest.manifestTxId, address, knownPosts);
	if (!preview) throw new Error('The base portal release references unavailable content');
	const existingUsers = new Set(manifest.users.map((user) => user.address));
	const invitedUsers = releaseChangeFields(changes).has('users')
		? preview.users.filter((user) => !existingUsers.has(user.address))
		: [];
	const txId = await uploadData(wallet, JSON.stringify(release), [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: BASE_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-release' },
		{ name: 'Portal-Id', value: manifest.portalId },
		{ name: 'Portal-Root', value: rootTxId },
		{ name: 'Previous-Tx', value: manifest.manifestTxId },
		{ name: 'Author', value: address },
		...invitedUsers.map((user) => ({ name: 'Portal-User', value: user.address })),
	]);
	const published = {
		...preview,
		manifestTxId: txId,
		includedTxIdsSinceCheckpoint: [...(manifest.includedTxIdsSinceCheckpoint || []), txId],
	};
	transactionBodyCache.set(txId, release);
	rememberResolvedManifest(published);
	if (address === published.owner && shouldPublishCheckpoint(published)) {
		try {
			return await publishCheckpoint(published, wallet, address);
		} catch {
			// The release remains valid and cached; checkpointing can retry on the
			// owner's next write without failing the user's requested update.
		}
	}
	return published;
}

function queuePortalWrite<T>(portalId: string, operation: () => Promise<T>): Promise<T> {
	const previous = writeQueues.get(portalId) || Promise.resolve();
	const next = previous.catch(() => undefined).then(operation);
	writeQueues.set(portalId, next);
	void next
		.finally(() => {
			if (writeQueues.get(portalId) === next) writeQueues.delete(portalId);
		})
		.catch(() => undefined);
	return next;
}

export async function createBasePortal(args: {
	portalId?: string;
	name: string;
	owner: string;
	wallet: any;
	bannerTxId?: string | null;
	iconTxId?: string | null;
	wallpaperTxId?: string | null;
	themes?: any[];
	layout?: any;
	pages?: any;
	fonts?: any;
	siteTxId?: string | null;
}) {
	const portalId = args.portalId || randomId();
	const createdAt = new Date().toISOString();
	const manifest: BasePortalManifest = {
		schemaVersion: BASE_SCHEMA_VERSION,
		type: 'portal-manifest',
		mode: 'base',
		portalId,
		manifestTxId: null,
		rootTxId: null,
		previousTxId: null,
		siteTxId: args.siteTxId || null,
		engineReferenceId: ENGINE_LITE_REFERENCE_ID,
		generatedAt: createdAt,
		date: createdAt,
		updated: createdAt,
		authorAddress: args.owner,
		owner: args.owner,
		name: args.name,
		description: '',
		bannerTxId: args.bannerTxId || null,
		iconTxId: args.iconTxId || null,
		wallpaperTxId: args.wallpaperTxId || null,
		users: [{ address: args.owner, type: 'wallet', roles: ['Admin'] }],
		categories: [],
		topics: [],
		links: [],
		domains: [],
		pages: args.pages ?? PAGES.JOURNAL,
		fonts: args.fonts ?? { headers: FONT_OPTIONS.headers[0], body: FONT_OPTIONS.body[0] },
		themes: args.themes?.length ? args.themes : [THEME.DEFAULT],
		layout: args.layout ?? LAYOUT.JOURNAL,
		postPreviews: {},
		uploads: [],
		posts: [],
		featuredPosts: [],
		postCount: 0,
		checkpointTxId: null,
		releasesSinceCheckpoint: 0,
		releaseBytesSinceCheckpoint: 0,
		includedTxIdsSinceCheckpoint: [],
	};
	const published = await publishManifest(manifest, args.wallet);
	acceptBasePortal(args.owner, portalId);
	return published;
}

function rememberPortalSite(portalId: string, siteTxId: string) {
	portalSiteCache.set(portalId, siteTxId);
	if (!localStorageAvailable()) return;
	try {
		localStorage.setItem(`portal-site:${portalId}`, siteTxId);
	} catch {
		// Site discovery remains available through GraphQL.
	}
}

function cachedPortalSite(portalId: string) {
	const memory = portalSiteCache.get(portalId);
	if (memory) return memory;
	if (!localStorageAvailable()) return null;
	try {
		const value = localStorage.getItem(`portal-site:${portalId}`);
		return value && ARWEAVE_ID.test(value) ? value : null;
	} catch {
		return null;
	}
}

export async function ensureBasePortalSite(portalId: string, wallet: any, address: string) {
	const manifest = await fetchBasePortal(portalId);
	if (manifest.siteTxId && ARWEAVE_ID.test(manifest.siteTxId)) return manifest.siteTxId;

	const cached = cachedPortalSite(portalId);
	if (cached) return cached;

	const admins = new Set([
		manifest.owner,
		...manifest.users.filter((user) => user.roles?.includes('Admin')).map((user) => user.address),
	]);
	const existing = (
		await queryTransactions([
			{ name: 'Portal-Mode', value: 'base' },
			{ name: 'Type', value: 'portal-site' },
			{ name: 'Portal-Id', value: portalId },
		])
	).find((node) => node.owner?.address && admins.has(node.owner.address));
	if (existing?.id) {
		rememberPortalSite(portalId, existing.id);
		return existing.id;
	}

	assertCanWrite(manifest, address, ['Admin']);
	const siteThemes = Array.isArray(manifest.themes) ? manifest.themes : [];
	const activeTheme = siteThemes.find((theme) => theme?.active || theme?.Active) || siteThemes[0];
	const siteTxId = await uploadData(wallet, PORTAL_DATA({ logo: manifest.bannerTxId, theme: activeTheme }), [
		{ name: 'Content-Type', value: 'text/html; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'App-Version', value: BASE_SCHEMA_VERSION },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-site' },
		{ name: 'Portal-Id', value: portalId },
		{ name: 'Portal-Owner', value: manifest.owner },
		{ name: 'Engine-Reference', value: manifest.engineReferenceId },
		{ name: 'Author', value: address },
	]);
	rememberPortalSite(portalId, siteTxId);
	return siteTxId;
}

function normalizeUpdate(data: any) {
	return mapFromProcessCase(data || {});
}

function applyManifestUpdate(manifest: BasePortalManifest, data: any): BasePortalManifest {
	const update = normalizeUpdate(data);
	const next = { ...manifest };
	for (const [key, value] of Object.entries(update)) {
		switch (key.toLowerCase()) {
			case 'name':
				next.name = value as string;
				break;
			case 'description':
				next.description = value as string;
				break;
			case 'banner':
			case 'logo':
				next.bannerTxId = value === 'None' ? null : (value as string);
				break;
			case 'thumbnail':
			case 'icon':
				next.iconTxId = value === 'None' ? null : (value as string);
				break;
			case 'wallpaper':
				next.wallpaperTxId = value === 'None' ? null : (value as string);
				break;
			case 'categories':
				next.categories = (value as any[]) || [];
				break;
			case 'topics':
				next.topics = (value as any[]) || [];
				break;
			case 'links':
				next.links = (value as any[]) || [];
				break;
			case 'domains':
				next.domains = (value as any[]) || [];
				break;
			case 'pages':
				next.pages = value;
				break;
			case 'fonts':
				next.fonts = value;
				break;
			case 'themes':
				next.themes = (value as any[]) || [];
				break;
			case 'layout':
				next.layout = value;
				break;
			case 'postpreviews':
				next.postPreviews = (value as Record<string, any>) || {};
				break;
			case 'featuredposts':
				next.featuredPosts = Array.isArray(value) ? (value as string[]) : [];
				break;
			case 'uploads':
				next.uploads = (value as any[]) || [];
				break;
		}
	}
	return next;
}

function compactReleaseChanges(
	manifest: BasePortalManifest,
	values: Partial<BasePortalManifest>
): BasePortalReleaseChanges {
	let changes: BasePortalReleaseChanges = {};
	for (const [field, after] of Object.entries(values)) {
		if (!PATCHABLE_PORTAL_KEYS.has(field)) continue;
		const serializedAfter = JSON.stringify(after);
		if (serializedAfter === undefined) continue;
		const storedAfter = JSON.parse(serializedAfter);
		const before = (manifest as any)[field];
		if (jsonEqual(before, storedAfter)) continue;

		const fieldPatches: BasePortalPatch[] = [];
		diffJson(before, storedAfter, [field], fieldPatches);
		if (fieldPatches.length === 0) continue;

		const directCandidate = { ...changes, [field]: storedAfter } as BasePortalReleaseChanges;
		const patchCandidate = {
			...changes,
			patches: [...(changes.patches || []), ...fieldPatches],
		} as BasePortalReleaseChanges;

		// A feature action replaces the current selection so two admins cannot
		// merge concurrent single-post selections into a multi-post array. Clearing
		// remains an item-level removal so it cannot erase a newer selection.
		if (field === 'featuredPosts') {
			changes = Array.isArray(storedAfter) && storedAfter.length === 0 ? patchCandidate : directCandidate;
			continue;
		}

		const identityBasedArray =
			Array.isArray(before) && Array.isArray(storedAfter) && usableIdentityKey(before, storedAfter) !== null;
		const mergeableObject = isPlainObject(before) && isPlainObject(storedAfter);

		// Stable collections and object trees retain item/leaf-level merge semantics.
		// For scalar or anonymous wholesale data, use whichever representation is
		// actually smaller on the wire.
		changes =
			identityBasedArray ||
			mergeableObject ||
			JSON.stringify(patchCandidate).length < JSON.stringify(directCandidate).length
				? patchCandidate
				: directCandidate;
	}
	return changes;
}

function releaseChangesFromUpdate(manifest: BasePortalManifest, data: any): BasePortalReleaseChanges {
	const update = normalizeUpdate(data);
	const next = applyManifestUpdate(manifest, update);
	const values: Partial<BasePortalManifest> = {};
	const mappedKeys: Record<string, keyof BasePortalManifest> = {
		name: 'name',
		description: 'description',
		banner: 'bannerTxId',
		logo: 'bannerTxId',
		thumbnail: 'iconTxId',
		icon: 'iconTxId',
		wallpaper: 'wallpaperTxId',
		categories: 'categories',
		topics: 'topics',
		links: 'links',
		domains: 'domains',
		pages: 'pages',
		fonts: 'fonts',
		themes: 'themes',
		layout: 'layout',
		postpreviews: 'postPreviews',
		featuredposts: 'featuredPosts',
		uploads: 'uploads',
	};
	for (const key of Object.keys(update)) {
		const mapped = mappedKeys[key.toLowerCase()];
		if (mapped) (values as any)[mapped] = (next as any)[mapped];
	}
	return compactReleaseChanges(manifest, values);
}

export async function updateBasePortal(portalId: string, data: any, wallet: any, address: string) {
	return queuePortalWrite(portalId, async () => {
		const manifest = await fetchBasePortal(portalId, { fresh: true });
		const update = normalizeUpdate(data);
		const contributorMediaUpdate =
			userCanWrite(manifest, address, ['Contributor']) &&
			Object.keys(update).length > 0 &&
			Object.keys(update).every((key) => key.toLowerCase() === 'uploads');
		if (!userCanWrite(manifest, address, ['Admin']) && !contributorMediaUpdate) {
			throw new Error('This wallet is not authorized to update base portal settings');
		}
		return publishRelease(manifest, releaseChangesFromUpdate(manifest, data), wallet, address);
	});
}

export async function addBasePortalUpload(portalId: string, upload: any, wallet: any, address: string) {
	return queuePortalWrite(portalId, async () => {
		const manifest = await fetchBasePortal(portalId, { fresh: true });
		assertCanWrite(manifest, address, ['Admin', 'Contributor']);
		if (!upload?.tx || manifest.uploads.some((entry) => entry?.tx === upload.tx)) return manifest;
		return publishRelease(
			manifest,
			compactReleaseChanges(manifest, { uploads: [...manifest.uploads, upload] }),
			wallet,
			address
		);
	});
}

export async function setBasePortalUsers(portalId: string, grants: any[], wallet: any, address: string) {
	return queuePortalWrite(portalId, async () => {
		const manifest = await fetchBasePortal(portalId, { fresh: true });
		assertCanWrite(manifest, address, ['Admin']);
		const users = new Map(manifest.users.map((user) => [user.address, user]));
		for (const grant of grants) {
			const granteeId = grant.granteeId;
			if (!granteeId) continue;
			if (!grant.roles?.length) users.delete(granteeId);
			else users.set(granteeId, { address: granteeId, type: 'wallet', roles: grant.roles });
		}
		users.set(manifest.owner, { address: manifest.owner, type: 'wallet', roles: ['Admin'] });
		return publishRelease(
			manifest,
			compactReleaseChanges(manifest, { users: Array.from(users.values()) }),
			wallet,
			address
		);
	});
}

function plainTextFromBlocks(content: any): string {
	if (!Array.isArray(content)) return '';
	return content
		.map((block) => (typeof block?.content === 'string' ? block.content.replace(/<[^>]+>/g, ' ') : ''))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function postFromData(id: string, postTxId: string, data: any, existing?: BasePortalPost): BasePortalPost {
	const normalized = normalizeUpdate(data);
	const now = Date.now();
	const releaseDateInput = normalized.releaseDate || existing?.releaseDate || now;
	const numericReleaseDate = Number(releaseDateInput);
	const parsedReleaseDate = typeof releaseDateInput === 'string' ? Date.parse(releaseDateInput) : Number.NaN;
	const releaseDate = Number.isFinite(numericReleaseDate)
		? numericReleaseDate
		: Number.isFinite(parsedReleaseDate)
		? parsedReleaseDate
		: now;
	const text = plainTextFromBlocks(normalized.content ?? existing?.content);
	const wordCount = text.split(/\s+/).filter(Boolean).length;
	const title = normalized.name || normalized.title || existing?.title || 'Untitled';
	const topics = normalized.topics || existing?.topics || [];
	const categories = normalized.categories || existing?.categories || [];
	const categoryLabels = categories
		.map((category: any) => (typeof category === 'string' ? category : category?.name || category?.id || ''))
		.filter(Boolean);
	const description = normalized.description ?? existing?.description ?? '';
	const thumbnail = normalized.thumbnail ?? existing?.thumbnail ?? null;
	const authorAddress = normalized.creator || existing?.authorAddress || '';
	const date = new Date(releaseDate).toISOString();
	const excerpt = description || text.slice(0, 220);
	return {
		...existing,
		id,
		postTxId,
		title,
		description,
		slug: normalized.url || existing?.slug || title.toLowerCase().trim().replace(/\s+/g, '-'),
		url: normalized.url || existing?.url || title.toLowerCase().trim().replace(/\s+/g, '-'),
		status: normalized.status || existing?.status || 'draft',
		content: normalized.content ?? existing?.content ?? [],
		creator: normalized.creator || existing?.creator || '',
		categories,
		topics,
		tags: topics,
		thumbnail,
		bannerTxId: thumbnail ?? existing?.bannerTxId ?? null,
		dateCreated: existing?.dateCreated || now,
		lastUpdate: now,
		releaseDate,
		date,
		updated: new Date(now).toISOString(),
		draft: (normalized.status || existing?.status) !== 'published',
		authorAddress,
		wordCount,
		readingTime: Math.max(1, Math.ceil(wordCount / 200)),
		excerpt,
		publishedAt: date,
		frontmatter: {
			title,
			date,
			desc: description,
			description,
			category: categoryLabels[0] || topics[0] || '',
			categories: categoryLabels,
			tags: topics,
			banner: thumbnail ?? existing?.bannerTxId ?? null,
			author: authorAddress,
			excerpt,
		},
	};
}

async function publishPostRevision(
	portalId: string,
	postId: string,
	data: any,
	wallet: any,
	address: string,
	existing?: BasePortalPost
) {
	const now = new Date().toISOString();
	const completePost = postFromData(postId, existing?.postTxId || postId, data, existing);
	const { postTxId: _postTxId, ...storedPost } = completePost;
	const postPayload = {
		schemaVersion: BASE_SCHEMA_VERSION,
		type: 'portal-post',
		mode: 'base',
		portalId,
		postId,
		previousTxId: existing?.postTxId || postId,
		updatedAt: now,
		post: storedPost,
	};
	const txId = await uploadData(wallet, JSON.stringify(postPayload), [
		{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
		{ name: 'App-Name', value: 'Portal' },
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-post' },
		{ name: 'Portal-Id', value: portalId },
		{ name: 'Post-Id', value: postId },
		{ name: 'Author', value: address },
	]);
	return { ...completePost, postTxId: txId };
}

export async function saveBasePost(portalId: string, postId: string, data: any, wallet: any, address: string) {
	return queuePortalWrite(portalId, async () => {
		const manifest = await fetchBasePortal(portalId, { fresh: true });
		assertCanWrite(manifest, address, ['Admin', 'Contributor']);
		const existing = manifest.posts.find((post) => post.id === postId);
		const post = await publishPostRevision(portalId, postId, data, wallet, address, existing);
		await publishRelease(manifest, { posts: { upsert: { [postId]: post.postTxId } } }, wallet, address, {
			[postId]: post,
		});
		return post;
	});
}

async function attachInitialBasePost(portalId: string, postId: string, storedPost: any, wallet: any, address: string) {
	return queuePortalWrite(portalId, async () => {
		const manifest = await fetchBasePortal(portalId, { fresh: true });
		assertCanWrite(manifest, address, ['Admin', 'Contributor']);
		const existing = manifest.posts.find((post) => post.id === postId);
		if (existing) return { post: existing, manifest };

		const derived = postFromData(postId, postId, storedPost);
		const post =
			typeof storedPost?.title === 'string' ? { ...derived, ...storedPost, id: postId, postTxId: postId } : derived;
		const published = await publishRelease(manifest, { posts: { upsert: { [postId]: postId } } }, wallet, address, {
			[postId]: post,
		});
		return { post, manifest: published };
	});
}

export async function removeBasePost(portalId: string, postId: string, wallet: any, address: string) {
	return queuePortalWrite(portalId, async () => {
		const manifest = await fetchBasePortal(portalId, { fresh: true });
		assertCanWrite(manifest, address, ['Admin', 'Contributor']);
		return publishRelease(manifest, { posts: { remove: [postId] } }, wallet, address);
	});
}

function toAtomicAsset(post: BasePortalPost) {
	return {
		id: post.id,
		name: post.title,
		ticker: 'POST',
		denomination: '1',
		totalSupply: '1',
		transferable: 'false',
		creator: post.creator,
		balances: {},
		assetType: 'blog-post',
		processType: 'atomic-asset',
		dateCreated: post.dateCreated,
		lastUpdate: post.lastUpdate,
		createdAt: post.dateCreated,
		updatedAt: post.lastUpdate,
		authUsers: [],
		metadata: {
			name: post.title,
			description: post.description,
			content: post.content,
			status: post.status,
			categories: post.categories,
			topics: post.topics,
			creator: post.creator,
			thumbnail: post.thumbnail,
			url: post.url,
			releaseDate: post.releaseDate,
			postTxId: post.postTxId,
			originPortal: null,
		},
	};
}

export async function getBasePost(postId: string, portalId?: string) {
	if (portalId) {
		try {
			const manifest = await fetchBasePortal(portalId);
			const post = manifest.posts.find((entry) => entry.id === postId || entry.postTxId === postId);
			if (post) return toAtomicAsset(post);
		} catch {
			// The direct transaction fallback below remains available while a new
			// release is propagating across gateways and GraphQL indexes.
		}
	}

	// A post transaction cannot tag itself with Post-Id because its ID is only
	// known after signing. Read a newly created, self-addressed post directly so
	// reopening it never depends on GraphQL indexing its release first.
	if (ARWEAVE_ID.test(postId)) {
		try {
			const payload = await fetchImmutableTransactionJson(postId);
			if (payload) {
				if (
					payload?.mode === 'base' &&
					payload?.type === 'portal-post' &&
					typeof payload?.portalId === 'string' &&
					(!portalId || payload.portalId === portalId) &&
					payload?.postId == null &&
					payload?.previousTxId == null &&
					payload?.post &&
					typeof payload.post === 'object'
				) {
					const derived = postFromData(postId, postId, payload.post);
					const post =
						typeof payload.post.title === 'string'
							? { ...derived, ...payload.post, id: postId, postTxId: postId }
							: derived;
					return toAtomicAsset(post);
				}
			}
		} catch {}
	}

	const nodes = await queryTransactions([
		{ name: 'Portal-Mode', value: 'base' },
		{ name: 'Type', value: 'portal-post' },
		{ name: 'Post-Id', value: postId },
	]);
	for (const node of nodes) {
		try {
			const payload = await fetchImmutableTransactionJson(node.id);
			if (!payload) continue;
			if (payload?.postId !== postId || !payload?.portalId) continue;
			const manifest = await fetchBasePortal(payload.portalId);
			const post = manifest.posts.find((entry) => entry.id === postId || entry.postTxId === node.id);
			if (post) return toAtomicAsset(post);
		} catch {}
	}
	throw new Error('Base portal post not found');
}

function rolesRecord(users: PortalUserType[]) {
	return Object.fromEntries(users.map((user) => [user.address, { type: 'wallet', roles: user.roles || [] }]));
}

export function manifestToZoneState(manifest: BasePortalManifest) {
	return {
		overview: {
			owner: manifest.owner,
			version: BASE_SCHEMA_VERSION,
			name: manifest.name,
			description: manifest.description,
			banner: manifest.bannerTxId,
			thumbnail: manifest.iconTxId,
			wallpaper: manifest.wallpaperTxId,
			manifestTxId: manifest.manifestTxId,
			rootTxId: manifest.rootTxId,
			siteTxId: manifest.siteTxId,
			engineReference: manifest.engineReferenceId,
			mode: 'base',
		},
		users: { roles: rolesRecord(manifest.users), roleOptions: ROLE_OPTIONS, permissions: PERMISSIONS },
		navigation: {
			categories: manifest.categories,
			topics: manifest.topics,
			links: manifest.links,
			domains: manifest.domains,
		},
		presentation: {
			layout: manifest.layout,
			pages: manifest.pages,
			themes: manifest.themes,
			fonts: manifest.fonts,
			postPreviews: manifest.postPreviews,
		},
		media: { uploads: manifest.uploads },
		posts: { index: manifest.posts.map(toAtomicAsset), featuredPosts: manifest.featuredPosts },
		requests: { indexRequests: [] },
		monetization: null,
		transfers: { transfers: [] },
	};
}

export function manifestToPortalHeader(manifest: BasePortalManifest): PortalHeaderType {
	return {
		id: manifest.portalId,
		mode: 'base',
		manifestTxId: manifest.manifestTxId,
		rootTxId: manifest.rootTxId,
		siteTxId: manifest.siteTxId,
		engineReferenceId: manifest.engineReferenceId,
		name: manifest.name,
		banner: manifest.bannerTxId,
		thumbnail: manifest.iconTxId,
		logo: manifest.bannerTxId,
		icon: manifest.iconTxId,
		users: manifest.users,
		roles: manifest.users,
	};
}

type BasePortalMembershipStatus = 'accepted' | 'left';

async function getBasePortalMembershipStatuses(address: string) {
	const statuses = new Map<string, BasePortalMembershipStatus>();
	if (!ARWEAVE_ID.test(address)) return statuses;
	const nodes = await queryAllTransactions(
		[
			{ name: 'Portal-Mode', value: 'base' },
			{ name: 'Type', value: 'portal-membership' },
			{ name: 'Portal-User', value: address },
		],
		'HEIGHT_ASC'
	);
	for (const node of nodes) {
		if (node.owner?.address !== address) continue;
		const portalId = tagValue(node, 'Portal-Id');
		const status = tagValue(node, 'Membership-Status');
		if (portalId && (status === 'accepted' || status === 'left')) statuses.set(portalId, status);
	}
	return statuses;
}

export async function getBasePortalMembershipStatus(
	address: string,
	portalId: string
): Promise<BasePortalMembershipStatus | null> {
	try {
		return (await getBasePortalMembershipStatuses(address)).get(portalId) || null;
	} catch {
		return null;
	}
}

export async function getAcceptedBasePortalMembers(portalId: string): Promise<Set<string>> {
	const statuses = new Map<string, BasePortalMembershipStatus>();
	try {
		const nodes = await queryAllTransactions(
			[
				{ name: 'Portal-Mode', value: 'base' },
				{ name: 'Type', value: 'portal-membership' },
				{ name: 'Portal-Id', value: portalId },
			],
			'HEIGHT_ASC'
		);
		for (const node of nodes) {
			const address = node.owner?.address;
			if (!address || tagValue(node, 'Portal-User') !== address) continue;
			const status = tagValue(node, 'Membership-Status');
			if (status === 'accepted' || status === 'left') statuses.set(address, status);
		}
	} catch {}
	return new Set(
		Array.from(statuses.entries())
			.filter(([, status]) => status === 'accepted')
			.map(([address]) => address)
	);
}

function getMembershipReceipts(address: string): Record<string, string> {
	if (!localStorageAvailable()) return {};
	try {
		const value = JSON.parse(localStorage.getItem(STORAGE.basePortalMembershipReceipts(address)) || '{}');
		return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
	} catch {
		return {};
	}
}

function rememberMembershipReceipt(address: string, portalId: string, txId: string) {
	if (!localStorageAvailable()) return;
	localStorage.setItem(
		STORAGE.basePortalMembershipReceipts(address),
		JSON.stringify({ ...getMembershipReceipts(address), [portalId]: txId })
	);
}

async function publishBasePortalMembership(
	portalId: string,
	status: BasePortalMembershipStatus,
	wallet: any,
	address: string
) {
	const queueKey = `${address}:${portalId}:${status}`;
	const active = membershipWriteQueues.get(queueKey);
	if (active) return active;
	const operation = (async () => {
		const generatedAt = new Date().toISOString();
		const txId = await uploadData(
			wallet,
			JSON.stringify({
				schemaVersion: BASE_SCHEMA_VERSION,
				type: 'portal-membership',
				mode: 'base',
				portalId,
				memberAddress: address,
				status,
				generatedAt,
			}),
			[
				{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
				{ name: 'App-Name', value: 'Portal' },
				{ name: 'App-Version', value: BASE_SCHEMA_VERSION },
				{ name: 'Portal-Mode', value: 'base' },
				{ name: 'Type', value: 'portal-membership' },
				{ name: 'Portal-Id', value: portalId },
				{ name: 'Portal-User', value: address },
				{ name: 'Membership-Status', value: status },
				{ name: 'Author', value: address },
			]
		);
		rememberMembershipReceipt(address, portalId, txId);
		return txId;
	})();
	membershipWriteQueues.set(queueKey, operation);
	void operation.finally(() => membershipWriteQueues.delete(queueKey)).catch(() => undefined);
	return operation;
}

async function syncAcceptedBasePortalMemberships(wallet: any, address: string) {
	const acceptedIds = readStringList(STORAGE.basePortalMemberships(address));
	if (!acceptedIds.length) return;
	const statuses = await getBasePortalMembershipStatuses(address).catch(() => new Map());
	const receipts = getMembershipReceipts(address);
	for (const portalId of acceptedIds) {
		if (statuses.get(portalId) === 'accepted' || receipts[portalId]) continue;
		try {
			const manifest = await fetchBasePortal(portalId);
			if (manifest.owner !== address) await publishBasePortalMembership(portalId, 'accepted', wallet, address);
		} catch {}
	}
}

export async function discoverBasePortals(address: string) {
	const manifests = new Map<string, BasePortalManifest>();
	const localIds = readStringList(STORAGE.basePortalMemberships(address));
	const membershipStatuses = await getBasePortalMembershipStatuses(address).catch(() => new Map());
	for (const id of new Set([...localIds, ...membershipStatuses.keys()])) {
		try {
			const manifest = await fetchBasePortal(id);
			if (manifest.owner === address || manifest.users.some((user) => user.address === address)) {
				manifests.set(manifest.portalId, manifest);
			}
		} catch {}
	}

	try {
		const nodes = await queryAllTransactions(
			[
				{ name: 'Portal-Mode', value: 'base' },
				{ name: 'Portal-User', value: address },
			],
			'HEIGHT_DESC'
		);
		for (const node of nodes) {
			const portalId = tagValue(node, 'Portal-Id');
			if (!portalId || manifests.has(portalId)) continue;
			try {
				const manifest = await fetchBasePortal(portalId);
				if (manifest.owner === address || manifest.users.some((user) => user.address === address)) {
					manifests.set(portalId, manifest);
				}
			} catch {}
		}
	} catch {
		// Locally cached portals remain usable while GraphQL indexing is delayed.
	}

	const accepted = new Set([
		...readStringList(STORAGE.basePortalMemberships(address)),
		...Array.from(membershipStatuses.entries())
			.filter(([, status]) => status === 'accepted')
			.map(([portalId]) => portalId),
	]);
	const declined = new Set(readStringList(STORAGE.basePortalDeclined(address)));
	for (const [portalId, status] of membershipStatuses) {
		if (status === 'left') declined.add(portalId);
		else declined.delete(portalId);
	}
	const portals: PortalHeaderType[] = [];
	const invites: PortalHeaderType[] = [];
	for (const manifest of manifests.values()) {
		const header = manifestToPortalHeader(manifest);
		if (manifest.owner === address || accepted.has(manifest.portalId)) portals.push(header);
		else if (!declined.has(manifest.portalId)) invites.push(header);
	}
	return { portals, invites };
}

export function acceptBasePortal(address: string, portalId: string) {
	writeStringList(STORAGE.basePortalMemberships(address), [
		...readStringList(STORAGE.basePortalMemberships(address)),
		portalId,
	]);
	writeStringList(
		STORAGE.basePortalDeclined(address),
		readStringList(STORAGE.basePortalDeclined(address)).filter((id) => id !== portalId)
	);
}

export function declineBasePortal(address: string, portalId: string) {
	writeStringList(
		STORAGE.basePortalMemberships(address),
		readStringList(STORAGE.basePortalMemberships(address)).filter((id) => id !== portalId)
	);
	writeStringList(STORAGE.basePortalDeclined(address), [
		...readStringList(STORAGE.basePortalDeclined(address)),
		portalId,
	]);
}

function isAddressKey(value: string) {
	return ARWEAVE_ID.test(value) || value.includes('-');
}

export function mapFromProcessCase(value: any): any {
	if (Array.isArray(value)) return value.map(mapFromProcessCase);
	if (!value || typeof value !== 'object') return value;
	return Object.entries(value).reduce((acc, [key, child]) => {
		const mappedKey = isAddressKey(key) ? key : key.charAt(0).toLowerCase() + key.slice(1);
		acc[mappedKey] = mapFromProcessCase(child);
		return acc;
	}, {} as any);
}

export function mapToProcessCase(value: any): any {
	if (Array.isArray(value)) return value.map(mapToProcessCase);
	if (!value || typeof value !== 'object') return value;
	return Object.entries(value).reduce((acc, [key, child]) => {
		const mappedKey = isAddressKey(key) ? key : key.charAt(0).toUpperCase() + key.slice(1);
		acc[mappedKey] = mapToProcessCase(child);
		return acc;
	}, {} as any);
}

async function resolveUploadData(value: any): Promise<{ data: ArrayBuffer | Uint8Array; contentType: string }> {
	if (value instanceof File || value instanceof Blob) {
		return { data: await value.arrayBuffer(), contentType: value.type || 'application/octet-stream' };
	}
	if (typeof value === 'string' && value.startsWith('data:')) {
		const response = await fetch(value);
		const blob = await response.blob();
		return { data: await blob.arrayBuffer(), contentType: blob.type || 'application/octet-stream' };
	}
	throw new Error('Unsupported upload data');
}

export function createBasePermawebAdapter(wallet: any, address: string) {
	let activePortalId: string | null = null;
	const initialPosts = new Map<string, { portalId: string; post: any }>();
	return {
		mapFromProcessCase,
		mapToProcessCase,
		resolveTransaction: async (value: any) => {
			if (typeof value === 'string' && ARWEAVE_ID.test(value)) return value;
			if (typeof value === 'string' && /^https?:\/\//.test(value)) return value;
			const upload = await resolveUploadData(value);
			return uploadData(wallet, upload.data, [
				{ name: 'Content-Type', value: upload.contentType },
				{ name: 'App-Name', value: 'Portal' },
				{ name: 'Portal-Mode', value: 'base' },
				{ name: 'Type', value: 'portal-media' },
				{ name: 'Author', value: address },
			]);
		},
		createZone: async (args: any, onStatus?: (status: string) => void) => {
			onStatus?.('Creating base portal site');
			const initialPortalData = normalizeUpdate(args.initialPortalData);
			const bootTags = Object.fromEntries(
				(args.tags || [])
					.filter((tag: ArweaveTag) => tag.name.startsWith('Bootloader-') || tag.name.startsWith('Zone-'))
					.map((tag: ArweaveTag) => [tag.name.replace(/^Bootloader-|^Zone-/, ''), tag.value])
			);
			const initialThemes = Array.isArray(initialPortalData.themes) ? initialPortalData.themes : [];
			const initialTheme = initialThemes.find((theme: any) => theme?.active) || initialThemes[0];
			const siteTxId = await uploadTransaction(
				wallet,
				args.data || PORTAL_DATA({ logo: bootTags.Banner, theme: initialTheme }),
				[
					{ name: 'Content-Type', value: 'text/html; charset=utf-8' },
					{ name: 'App-Name', value: 'Portal' },
					{ name: 'App-Version', value: BASE_SCHEMA_VERSION },
					{ name: 'Portal-Mode', value: 'base' },
					{ name: 'Type', value: 'portal-site' },
					{ name: 'Portal-Owner', value: address },
					{ name: 'Engine-Reference', value: ENGINE_LITE_REFERENCE_ID },
					{ name: 'Author', value: address },
				]
			);
			rememberPortalSite(siteTxId, siteTxId);
			trackPendingTransaction({
				id: siteTxId,
				address,
				portalId: siteTxId,
				type: 'portal-site',
				createdAt: Date.now(),
			});
			onStatus?.('Creating base portal manifest');
			const manifest = await createBasePortal({
				portalId: siteTxId,
				name: bootTags.Name || 'Untitled Portal',
				owner: address,
				wallet,
				bannerTxId: bootTags.Banner,
				iconTxId: bootTags.Thumbnail,
				wallpaperTxId: bootTags.Wallpaper,
				themes: initialPortalData.themes,
				layout: initialPortalData.layout,
				pages: initialPortalData.pages,
				fonts: initialPortalData.fonts,
				siteTxId,
			});
			activePortalId = manifest.portalId;
			onStatus?.('Base portal manifest created');
			return manifest.portalId;
		},
		updateZone: async (data: any, zoneId: string) => {
			try {
				const manifest = await fetchBasePortal(zoneId);
				activePortalId = manifest.portalId;
				return (await updateBasePortal(manifest.portalId, data, wallet, address)).manifestTxId;
			} catch (error) {
				if (zoneId === address) return `base-profile-${Date.now()}`;
				throw error;
			}
		},
		addPortalUpload: async (portalId: string, upload: any) =>
			(await addBasePortalUpload(portalId, upload, wallet, address)).manifestTxId,
		readState: async ({ processId, path }: any) => {
			const manifest = await fetchBasePortal(processId);
			activePortalId = manifest.portalId;
			const state = manifestToZoneState(manifest);
			if (!path) return state;
			return state[String(path).toLowerCase()] ?? null;
		},
		getZone: async (zoneId: string) => {
			const manifest = await fetchBasePortal(zoneId);
			activePortalId = manifest.portalId;
			const state = manifestToZoneState(manifest);
			return {
				owner: manifest.owner,
				roles: state.users.roles,
				roleOptions: ROLE_OPTIONS,
				permissions: PERMISSIONS,
				store: {
					name: manifest.name,
					logo: manifest.bannerTxId,
					icon: manifest.iconTxId,
					pages: manifest.pages,
					index: state.posts.index,
					featuredPosts: manifest.featuredPosts,
					categories: manifest.categories,
					topics: manifest.topics,
					links: manifest.links,
					fonts: manifest.fonts,
					themes: manifest.themes,
					layout: manifest.layout,
				},
			};
		},
		setZoneRoles: async (grants: any[], zoneId: string) =>
			(await setBasePortalUsers(zoneId, grants, wallet, address)).manifestTxId,
		ensurePortalSite: async (portalId: string) => ensureBasePortalSite(portalId, wallet, address),
		createAtomicAsset: async (args: any, onStatus?: (status: string) => void) => {
			onStatus?.('Creating base post transaction');
			const initialData = args.initialPostData ? normalizeUpdate(args.initialPostData) : null;
			const portalId = initialData?.originPortal || args.portalId || activePortalId;
			if (portalId) activePortalId = portalId;
			let storedPost: any = null;
			if (initialData && portalId) {
				const completePost = postFromData('', '', {
					...initialData,
					name: initialData.name || args.name,
					description: initialData.description ?? args.description,
					creator: initialData.creator || args.creator,
				});
				const { id: _id, postTxId: _postTxId, ...post } = completePost;
				storedPost = post;
			}

			const payload = storedPost
				? {
						schemaVersion: BASE_SCHEMA_VERSION,
						type: 'portal-post',
						mode: 'base',
						portalId,
						previousTxId: null,
						createdAt: new Date().toISOString(),
						post: storedPost,
				  }
				: {
						schemaVersion: BASE_SCHEMA_VERSION,
						type: 'portal-post',
						mode: 'base',
						createdAt: new Date().toISOString(),
						post: { name: args.name, description: args.description, creator: args.creator, content: [] },
				  };
			const tags: ArweaveTag[] = [
				{ name: 'Content-Type', value: 'application/json; charset=utf-8' },
				{ name: 'App-Name', value: 'Portal' },
				{ name: 'Portal-Mode', value: 'base' },
				{ name: 'Type', value: 'portal-post' },
				{ name: 'Author', value: address },
			];
			if (portalId) tags.push({ name: 'Portal-Id', value: portalId });
			const txId = await uploadData(wallet, JSON.stringify(payload), tags);
			if (storedPost && portalId) initialPosts.set(txId, { portalId, post: storedPost });
			onStatus?.('Base post transaction created');
			return txId;
		},
		getAtomicAsset: async (postId: string, portalId?: string) =>
			getBasePost(postId, portalId || activePortalId || undefined),
		sendMessage: async (args: any) => {
			const action = args.action;
			const tags = Object.fromEntries((args.tags || []).map((tag: ArweaveTag) => [tag.name, tag.value]));
			if (action === 'Update-Asset') {
				const data = normalizeUpdate(args.data);
				const portalId = data.originPortal || activePortalId;
				if (!portalId) throw new Error('A base portal is required to save this post');
				const initialPost = initialPosts.get(args.processId);
				if (initialPost?.portalId === portalId) {
					const result = await attachInitialBasePost(portalId, args.processId, initialPost.post, wallet, address);
					initialPosts.delete(args.processId);
					return result.manifest.manifestTxId || args.processId;
				}
				await saveBasePost(portalId, args.processId, data, wallet, address);
				return `base-post-${Date.now()}`;
			}
			if (
				action === 'Update-Asset-Through-Zone' ||
				(action === 'Run-Action' && tags['Forward-Action'] === 'Update-Asset')
			) {
				const postId = tags['Forward-To'];
				await saveBasePost(args.processId, postId, args.data?.Input || args.data, wallet, address);
				return { Messages: [{ Data: 'Saved' }] };
			}
			return args.returnResult ? { Messages: [{ Data: 'Base mode no-op' }] } : `base-${Date.now()}`;
		},
		removeFromIndex: async ({ indexId }: any, zoneId: string) =>
			(await removeBasePost(zoneId, indexId, wallet, address)).manifestTxId,
		getProfileByWalletAddress: async (walletAddress: string) => {
			const discovered = await discoverBasePortals(walletAddress);
			if (walletAddress === address) void syncAcceptedBasePortalMemberships(wallet, address);
			return {
				id: walletAddress,
				owner: walletAddress,
				username: walletAddress.slice(0, 8),
				displayName: walletAddress.slice(0, 8),
				version: BASE_SCHEMA_VERSION,
				portals: discovered.portals,
				invites: discovered.invites,
			};
		},
		getProfileById: async (profileId: string) => {
			const discovered = await discoverBasePortals(profileId);
			return {
				id: profileId,
				owner: profileId,
				username: profileId.slice(0, 8),
				displayName: profileId.slice(0, 8),
				version: BASE_SCHEMA_VERSION,
				portals: discovered.portals,
				invites: discovered.invites,
			};
		},
		joinZone: async ({ zoneToJoinId }: any) => {
			const txId = await publishBasePortalMembership(zoneToJoinId, 'accepted', wallet, address);
			acceptBasePortal(address, zoneToJoinId);
			return txId;
		},
		leaveZone: async (zoneId: string) => {
			const txId = await publishBasePortalMembership(zoneId, 'left', wallet, address);
			declineBasePortal(address, zoneId);
			return txId;
		},
		updateZoneAuthorities: async () => `base-disabled`,
		updateZonePatchMap: async () => `base-disabled`,
		updateZoneVersion: async () => `base-disabled`,
		updateProfileVersion: async () => `base-disabled`,
		updateProfile: async () => {
			throw new Error('Profile editing is unavailable in base mode');
		},
		createProfile: async () => {
			throw new Error('Profile creation is unavailable in base mode');
		},
		transferZoneOwnership: async () => {
			throw new Error('Ownership transfer is unavailable in base mode');
		},
	};
}
