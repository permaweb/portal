/**
 * Portable base-portal state resolver.
 *
 * Browser:
 *   import { resolvePortalState } from './resolve-base-portal.mjs';
 *   const portal = await resolvePortalState(PORTAL_ID);
 *   // Optional: pass { transactionCache: new Map(), concurrency: 8 } to share
 *   // immutable transaction bodies across resolver instances.
 *
 * Node 18+:
 *   node scripts/resolve-base-portal.mjs PORTAL_ID
 *
 * This file has no package or Node-only dependencies and can be copied into
 * another browser application such as ao-site. It starts from the newest valid
 * root-owner checkpoint and applies only the release tail after that checkpoint.
 */

const DEFAULT_GATEWAY = 'https://arweave.net';
const ADDRESS = /^[A-Za-z0-9_-]{43}$/;
const DEFAULT_CONCURRENCY = 8;
const MAX_PREDECESSOR_LOOKUPS = 100;
const TRANSACTION_CACHE_NAME = 'portal-immutable-transactions-v1';
const PATCHABLE_FIELDS = new Set([
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
const RELEASE_CHANGE_KEYS = new Set([...PATCHABLE_FIELDS, 'patches', 'posts']);
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const ARRAY_IDENTITY_KEYS = new Set(['address', 'id', 'tx', 'txId', 'key', 'name', 'url', 'uri', 'slug', 'value']);

const clone = (value) =>
	typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const defaultTransactionCache = new Map();
const transactionRequests = new Map();

async function readBrowserTransactionCache(key) {
	if (typeof globalThis.caches?.open !== 'function') return undefined;
	try {
		const cache = await globalThis.caches.open(TRANSACTION_CACHE_NAME);
		const response = await cache.match(key);
		return response?.ok ? await response.json() : undefined;
	} catch {
		return undefined;
	}
}

async function writeBrowserTransactionCache(key, value) {
	if (typeof globalThis.caches?.open !== 'function') return;
	try {
		const cache = await globalThis.caches.open(TRANSACTION_CACHE_NAME);
		await cache.put(
			key,
			new Response(JSON.stringify(value), {
				headers: { 'content-type': 'application/json' },
			})
		);
	} catch {
		// Cache Storage is an optimization; resolution must still work without it.
	}
}

function tag(node, name) {
	return node.tags?.find((candidate) => candidate.name === name)?.value;
}

async function json(response, label) {
	if (!response.ok) throw new Error(`${label}: ${response.status} ${response.statusText}`.trim());
	return response.json();
}

async function fetchTransactionJson(id, options) {
	try {
		return await json(
			await options.fetch(`${options.gateway}/${id}`, { cache: 'reload', signal: options.signal }),
			`Transaction ${id}`
		);
	} catch (error) {
		if (options.signal?.aborted) throw error;
		// The content route may return an empty 200 while L1 transaction bytes
		// remain available through the base64url transaction-data endpoint.
		const response = await options.fetch(`${options.gateway}/tx/${id}/data`, {
			cache: 'reload',
			signal: options.signal,
		});
		if (!response.ok) throw new Error(`Transaction data ${id}: ${response.status}`);
		const encoded = (await response.text()).trim();
		if (!/^[A-Za-z0-9_-]+={0,2}$/.test(encoded)) throw new Error(`Invalid transaction data: ${id}`);
		const bytes = Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));
		return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
	}
}

async function fetchTransaction(id, options) {
	if (!ADDRESS.test(id)) return undefined;
	const key = `${options.gateway}/${id}`;
	if (options.transactionCache.has(key)) return clone(options.transactionCache.get(key));
	let request = transactionRequests.get(key);
	if (!request) {
		request = (async () => {
			try {
				const browserCached = await readBrowserTransactionCache(key);
				if (browserCached !== undefined) {
					options.transactionCache.set(key, browserCached);
					return browserCached;
				}
				const value = await fetchTransactionJson(id, options);
				options.transactionCache.set(key, value);
				await writeBrowserTransactionCache(key, value);
				return value;
			} catch {
				return undefined;
			}
		})();
		transactionRequests.set(key, request);
		void request.finally(() => transactionRequests.delete(key));
	}
	const value = await request;
	return value === undefined ? undefined : clone(value);
}

async function mapWithConcurrency(values, limit, mapper) {
	const results = new Array(values.length);
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

async function queryPortalTransactions(portalId, options) {
	const nodes = [];
	let after = null;
	for (let page = 0; page < options.maxPages; page += 1) {
		const payload = await json(
			await options.fetch(options.graphql, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				signal: options.signal,
				body: JSON.stringify({
					query: `
						query PortalHistory($tags: [TagFilter!], $after: String) {
							transactions(tags: $tags, first: 100, after: $after, sort: HEIGHT_ASC) {
								pageInfo { hasNextPage }
								edges {
									cursor
									node { id owner { address } tags { name value } block { height timestamp } }
								}
							}
						}
					`,
					variables: {
						tags: [
							{ name: 'Portal-Mode', values: ['base'] },
							{ name: 'Portal-Id', values: [portalId] },
							{ name: 'Type', values: ['portal-manifest', 'portal-release', 'portal-checkpoint'] },
						],
						after,
					},
				}),
			}),
			'Portal history query'
		);
		if (payload.errors?.length) throw new Error(payload.errors[0]?.message || 'Portal history query failed');
		const connection = payload.data?.transactions;
		const edges = Array.isArray(connection?.edges) ? connection.edges : [];
		nodes.push(...edges.map((edge) => edge.node));
		if (!connection?.pageInfo?.hasNextPage || !edges.length) break;
		after = edges.at(-1).cursor;
	}
	return nodes;
}

function orderPortalTransactions(nodes) {
	const byId = new Map(nodes.map((node) => [node.id, node]));
	const ordered = [];
	const visited = new Set();
	const visiting = new Set();
	// Height alone cannot order transactions bundled into the same block.
	// Traverse predecessors first without recursion, including checkpoint chains.
	for (const node of [...byId.values()].sort((a, b) => (a.block?.height ?? Infinity) - (b.block?.height ?? Infinity))) {
		const stack = [{ node, ready: false }];
		while (stack.length) {
			const entry = stack.pop();
			if (visited.has(entry.node.id)) continue;
			if (entry.ready) {
				visiting.delete(entry.node.id);
				visited.add(entry.node.id);
				ordered.push(entry.node);
			} else if (!visiting.has(entry.node.id)) {
				visiting.add(entry.node.id);
				stack.push({ node: entry.node, ready: true });
				const previous = byId.get(tag(entry.node, 'Previous-Tx') || '');
				if (previous) stack.push({ node: previous, ready: false });
			}
		}
	}
	return ordered;
}

async function recoverPortalHistory(portalId, nodes, knownTxIds, options) {
	const recovered = new Map(nodes.map((node) => [node.id, node]));
	const requested = new Set();
	while (requested.size < MAX_PREDECESSOR_LOOKUPS) {
		const missing = [...new Set([...knownTxIds, ...[...recovered.values()].map((node) => tag(node, 'Previous-Tx'))])]
			.filter((id) => ADDRESS.test(id || '') && !recovered.has(id) && !requested.has(id))
			.slice(0, MAX_PREDECESSOR_LOOKUPS - requested.size);
		if (!missing.length) break;
		missing.forEach((id) => requested.add(id));
		try {
			const payload = await json(
				await options.fetch(options.graphql, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					signal: options.signal,
					body: JSON.stringify({
						query: `query PortalPredecessors($ids: [ID!]) {
						transactions(ids: $ids, first: 100, sort: HEIGHT_ASC) {
							edges { node { id owner { address } tags { name value } block { height timestamp } } }
						}
					}`,
						variables: { ids: missing },
					}),
				}),
				'Portal predecessor query'
			);
			if (payload.errors?.length) break;
			for (const { node } of payload.data?.transactions?.edges || []) {
				if (
					missing.includes(node.id) &&
					node.owner?.address &&
					tag(node, 'Portal-Mode') === 'base' &&
					tag(node, 'Portal-Id') === portalId &&
					['portal-manifest', 'portal-release', 'portal-checkpoint'].includes(tag(node, 'Type'))
				) {
					recovered.set(node.id, node);
				}
			}
		} catch {
			// Leave unresolved dependencies unapplied when the gateway is unavailable.
			break;
		}
	}
	return orderPortalTransactions([...recovered.values()]);
}

function normalizeManifest(value, transactionId) {
	if (value?.type !== 'portal-manifest' || value?.mode !== 'base' || typeof value.portalId !== 'string')
		return undefined;
	return {
		...value,
		manifestTxId: transactionId,
		rootTxId: value.rootTxId || (!value.previousTxId ? transactionId : null),
		previousTxId: value.previousTxId || null,
		users: Array.isArray(value.users) ? value.users : [],
		categories: Array.isArray(value.categories) ? value.categories : [],
		topics: Array.isArray(value.topics) ? value.topics : [],
		links: Array.isArray(value.links) ? value.links : [],
		domains: Array.isArray(value.domains) ? value.domains : [],
		themes: Array.isArray(value.themes) ? value.themes : [],
		uploads: Array.isArray(value.uploads) ? value.uploads : [],
		posts: Array.isArray(value.posts) ? value.posts : [],
		featuredPosts: Array.isArray(value.featuredPosts)
			? value.featuredPosts.filter((postId) => typeof postId === 'string')
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
			? value.includedTxIdsSinceCheckpoint.filter((id) => typeof id === 'string' && ADDRESS.test(id))
			: [],
	};
}

function normalizeCheckpoint(value, transactionId) {
	if (
		value?.type !== 'portal-checkpoint' ||
		value?.mode !== 'base' ||
		typeof value.portalId !== 'string' ||
		!ADDRESS.test(value.rootTxId) ||
		!ADDRESS.test(value.previousTxId) ||
		!ADDRESS.test(value.baseCheckpointTxId) ||
		!Array.isArray(value.includedTxIds) ||
		value.includedTxIds.some((id) => typeof id !== 'string' || !ADDRESS.test(id)) ||
		!value.state ||
		typeof value.state !== 'object'
	) {
		return undefined;
	}
	const state = normalizeManifest(
		{
			...value.state,
			type: 'portal-manifest',
			mode: 'base',
			portalId: value.portalId,
			rootTxId: value.rootTxId,
			previousTxId: value.previousTxId,
			checkpointTxId: transactionId,
			releasesSinceCheckpoint: 0,
			releaseBytesSinceCheckpoint: 0,
			includedTxIdsSinceCheckpoint: [],
		},
		transactionId
	);
	return state ? { checkpoint: value, state } : undefined;
}

function normalizeRelease(value) {
	const posts = value?.changes?.posts;
	if (
		value?.type !== 'portal-release' ||
		value?.mode !== 'base' ||
		typeof value.portalId !== 'string' ||
		!ADDRESS.test(value.rootTxId) ||
		!ADDRESS.test(value.previousTxId) ||
		!value.changes ||
		typeof value.changes !== 'object' ||
		Array.isArray(value.changes) ||
		Object.keys(value.changes).some((key) => !RELEASE_CHANGE_KEYS.has(key)) ||
		(value.changes.patches !== undefined &&
			(!Array.isArray(value.changes.patches) || !value.changes.patches.every(isPortalPatch))) ||
		(posts !== undefined &&
			(!posts ||
				typeof posts !== 'object' ||
				Array.isArray(posts) ||
				Object.keys(posts).some((key) => key !== 'upsert' && key !== 'remove' && key !== 'order') ||
				(posts.upsert !== undefined &&
					(!posts.upsert ||
						typeof posts.upsert !== 'object' ||
						Array.isArray(posts.upsert) ||
						Object.values(posts.upsert).some((id) => typeof id !== 'string' || !ADDRESS.test(id)))) ||
				(posts.remove !== undefined && !Array.isArray(posts.remove)) ||
				(posts.order !== undefined &&
					(!Array.isArray(posts.order) || posts.order.some((postId) => typeof postId !== 'string')))))
	) {
		return undefined;
	}
	return value;
}

function identity(value, key) {
	return key === '' ? value : value?.[key];
}

function selectorIndex(values, selector) {
	return values.findIndex((value) => JSON.stringify(identity(value, selector[1])) === JSON.stringify(selector[2]));
}

function isSelector(value) {
	return (
		Array.isArray(value) &&
		value.length === 3 &&
		value[0] === '=' &&
		typeof value[1] === 'string' &&
		(value[1] === '' || ARRAY_IDENTITY_KEYS.has(value[1])) &&
		!UNSAFE_KEYS.has(value[1]) &&
		(value[2] === null || ['string', 'number', 'boolean'].includes(typeof value[2]))
	);
}

function resolvePath(root, path) {
	let value = root;
	for (const part of path) {
		if (typeof part === 'string') {
			if (!value || typeof value !== 'object' || UNSAFE_KEYS.has(part) || !(part in value)) return undefined;
			value = value[part];
		} else if (typeof part === 'number') {
			if (!Array.isArray(value) || part < 0 || part >= value.length) return undefined;
			value = value[part];
		} else if (isSelector(part)) {
			if (!Array.isArray(value)) return undefined;
			value = value[selectorIndex(value, part)];
		} else return undefined;
	}
	return value;
}

function validPatchPath(path) {
	return (
		Array.isArray(path) &&
		path.length > 0 &&
		typeof path[0] === 'string' &&
		PATCHABLE_FIELDS.has(path[0]) &&
		path.every(
			(part) =>
				(typeof part === 'string' && !UNSAFE_KEYS.has(part)) ||
				(typeof part === 'number' && Number.isSafeInteger(part) && part >= 0) ||
				isSelector(part)
		)
	);
}

function isPortalPatch(value) {
	if (!Array.isArray(value) || !validPatchPath(value[1])) return false;
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
			return value.length === 3 && isSelector(value[1].at(-1)) && Number.isSafeInteger(value[2]) && value[2] >= 0;
		default:
			return false;
	}
}

function normalizeUsers(value, owner) {
	const users = new Map();
	if (Array.isArray(value)) {
		for (const candidate of value) {
			if (!candidate || typeof candidate.address !== 'string' || !Array.isArray(candidate.roles)) continue;
			users.set(candidate.address, {
				address: candidate.address,
				type: 'wallet',
				roles: candidate.roles.filter((role) => typeof role === 'string'),
			});
		}
	}
	users.set(owner, { address: owner, type: 'wallet', roles: ['Admin'] });
	return [...users.values()];
}

function applyPatch(state, patch) {
	if (!Array.isArray(patch) || !validPatchPath(patch[1])) return;
	const path = patch[1];
	if (patch[0] === 'p') {
		const target = resolvePath(state, path);
		if (Array.isArray(target) && Number.isSafeInteger(patch[2]) && Number.isSafeInteger(patch[3])) {
			target.splice(patch[2], patch[3], ...(Array.isArray(patch[4]) ? clone(patch[4]) : []));
		}
		return;
	}
	if (patch[0] === 'm') {
		const selector = path.at(-1);
		const target = resolvePath(state, path.slice(0, -1));
		if (!isSelector(selector) || !Array.isArray(target) || !Number.isSafeInteger(patch[2])) return;
		const index = selectorIndex(target, selector);
		if (index < 0) return;
		const [held] = target.splice(index, 1);
		target.splice(Math.min(Math.max(0, patch[2]), target.length), 0, held);
		return;
	}
	const parent = resolvePath(state, path.slice(0, -1));
	const key = path.at(-1);
	if (!parent || key === undefined) return;
	if (patch[0] === 's') {
		const value = clone(patch[2]);
		if (typeof key === 'string' && !Array.isArray(parent)) parent[key] = value;
		else if (typeof key === 'number' && Array.isArray(parent) && key < parent.length) parent[key] = value;
		else if (isSelector(key) && Array.isArray(parent)) {
			const index = selectorIndex(parent, key);
			if (index < 0) parent.push(value);
			else parent[index] = value;
		}
	} else if (patch[0] === 'd') {
		if (typeof key === 'string' && !Array.isArray(parent)) delete parent[key];
		else if (typeof key === 'number' && Array.isArray(parent)) parent.splice(key, 1);
		else if (isSelector(key) && Array.isArray(parent)) {
			const index = selectorIndex(parent, key);
			if (index >= 0) parent.splice(index, 1);
		}
	}
}

function changedFields(changes) {
	const fields = new Set(Object.keys(changes || {}).filter((key) => key !== 'patches'));
	for (const patch of changes?.patches || []) {
		if (typeof patch?.[1]?.[0] === 'string') fields.add(patch[1][0]);
	}
	return fields;
}

function canPublish(state, release, publisher) {
	if (!publisher || (release.authorAddress && release.authorAddress !== publisher)) return false;
	if (state.owner === publisher) return true;
	const roles = state.users.find((user) => user.address === publisher)?.roles || [];
	if (roles.includes('Admin')) return true;
	const fields = changedFields(release.changes);
	return (
		roles.includes('Contributor') &&
		fields.size > 0 &&
		[...fields].every((field) => ['posts', 'uploads'].includes(field))
	);
}

async function loadPost(postId, transactionId, portalId, previous, options) {
	const value = await fetchTransaction(transactionId, options);
	if (
		value?.type !== 'portal-post' ||
		value?.mode !== 'base' ||
		value.portalId !== portalId ||
		(value.postId !== postId && !(value.postId == null && value.previousTxId == null && transactionId === postId)) ||
		!value.post ||
		typeof value.post !== 'object'
	) {
		return undefined;
	}
	return { ...previous, ...value.post, id: postId, postTxId: transactionId };
}

function applyRelease(state, release, transactionId, publisher) {
	if (!canPublish(state, release, publisher)) return undefined;
	const next = clone(state);
	for (const [key, value] of Object.entries(release.changes || {})) {
		if (key !== 'patches' && key !== 'posts' && PATCHABLE_FIELDS.has(key)) next[key] = clone(value);
	}
	for (const patch of release.changes?.patches || []) applyPatch(next, patch);

	const posts = new Map(next.posts.map((post) => [post.id, post]));
	for (const postId of release.changes?.posts?.remove || []) posts.delete(postId);
	for (const [postId, postTxId] of Object.entries(release.changes?.posts?.upsert || {})) {
		if (!ADDRESS.test(postTxId)) return undefined;
		posts.set(postId, { id: postId, postTxId });
	}
	if (release.changes?.posts?.order) {
		const orderedIds = [...new Set(release.changes.posts.order)];
		const currentIds = [...posts.keys()];
		if (orderedIds.length !== currentIds.length || currentIds.some((postId) => !orderedIds.includes(postId))) {
			return undefined;
		}
		const reordered = new Map();
		for (const postId of orderedIds) reordered.set(postId, posts.get(postId));
		posts.clear();
		for (const [postId, post] of reordered) posts.set(postId, post);
	}
	next.posts = [...posts.values()];
	next.featuredPosts = (next.featuredPosts || []).filter((postId) => posts.has(postId));
	next.postCount = next.posts.length;
	next.manifestTxId = transactionId;
	next.rootTxId = release.rootTxId;
	next.previousTxId = release.previousTxId;
	next.generatedAt = release.generatedAt;
	next.updated = release.generatedAt;
	next.authorAddress = publisher;
	next.users = normalizeUsers(next.users, state.owner);
	next.releasesSinceCheckpoint = (state.releasesSinceCheckpoint || 0) + 1;
	next.releaseBytesSinceCheckpoint =
		(state.releaseBytesSinceCheckpoint || 0) + new TextEncoder().encode(JSON.stringify(release)).byteLength;
	next.includedTxIdsSinceCheckpoint = [...(state.includedTxIdsSinceCheckpoint || []), transactionId];
	return next;
}

async function portalIdFromIdentifier(identifier, options) {
	const direct = await fetchTransaction(identifier, options);
	if (direct?.mode === 'base' && typeof direct.portalId === 'string') return direct.portalId;
	return identifier;
}

export async function resolvePortalState(identifier, config = {}) {
	if (typeof identifier !== 'string' || !identifier.trim()) throw new TypeError('A portal ID is required');
	const gateway = (config.gateway || DEFAULT_GATEWAY).replace(/\/+$/, '');
	const options = {
		gateway,
		graphql: config.graphql || `${gateway}/graphql`,
		fetch: config.fetch || globalThis.fetch?.bind(globalThis),
		signal: config.signal,
		maxPages: config.maxPages || 100,
		concurrency: Math.max(1, config.concurrency || DEFAULT_CONCURRENCY),
		transactionCache: config.transactionCache || defaultTransactionCache,
	};
	if (!options.fetch) throw new Error('No fetch implementation available');

	const portalId = await portalIdFromIdentifier(identifier.trim(), options);
	const nodes = await recoverPortalHistory(
		portalId,
		await queryPortalTransactions(portalId, options),
		identifier.trim() !== portalId ? [identifier.trim()] : [],
		options
	);
	let rootEntry;
	let rootIndex = -1;
	for (let index = 0; index < nodes.length; index += 1) {
		const node = nodes[index];
		if (tag(node, 'Type') !== 'portal-manifest' || tag(node, 'Previous-Tx')) continue;
		const value = await fetchTransaction(node.id, options);
		const manifest = normalizeManifest(value, node.id);
		if (
			manifest &&
			manifest.portalId === portalId &&
			!manifest.previousTxId &&
			manifest.owner === node.owner?.address
		) {
			rootEntry = { node, value, manifest };
			rootIndex = index;
			break;
		}
	}
	if (!rootEntry) throw new Error(`Portal root is not indexed: ${portalId}`);
	if (rootIndex > 0) {
		const [rootNode] = nodes.splice(rootIndex, 1);
		nodes.unshift(rootNode);
		rootIndex = 0;
	}

	const rootOwner = rootEntry.node.owner?.address;
	let state = rootEntry.manifest;
	let selectedCheckpoint;
	let selectedCheckpointIndex = rootIndex;
	for (let index = nodes.length - 1; index > rootIndex; index -= 1) {
		const node = nodes[index];
		if (tag(node, 'Type') !== 'portal-checkpoint' || node.owner?.address !== rootOwner) continue;
		const value = await fetchTransaction(node.id, options);
		const normalized = normalizeCheckpoint(value, node.id);
		if (
			!normalized ||
			normalized.checkpoint.portalId !== portalId ||
			normalized.checkpoint.rootTxId !== rootEntry.node.id ||
			normalized.checkpoint.authorAddress !== rootOwner ||
			normalized.state.owner !== rootOwner ||
			!nodes.some((candidate) => candidate.id === normalized.checkpoint.baseCheckpointTxId) ||
			nodes.findIndex((candidate) => candidate.id === normalized.checkpoint.baseCheckpointTxId) >= index
		) {
			continue;
		}
		state = normalized.state;
		selectedCheckpoint = normalized.checkpoint;
		selectedCheckpointIndex = index;
		break;
	}

	const baseCheckpointIndex = selectedCheckpoint
		? nodes.findIndex((node) => node.id === selectedCheckpoint.baseCheckpointTxId)
		: rootIndex;
	const includedCheckpointIds = new Set(selectedCheckpoint?.includedTxIds || []);
	const historical = new Set(nodes.slice(0, baseCheckpointIndex + 1).map((node) => node.id));
	const accepted = new Set([
		rootEntry.node.id,
		...(state.checkpointTxId ? [state.checkpointTxId] : []),
		...includedCheckpointIds,
	]);
	const unresolved = [];
	let appliedReleaseCount = 0;
	let hydratedFallback = state;
	let fallbackReleaseCount = 0;
	const deferredPosts = new Map();
	const tailNodes = nodes
		.slice(baseCheckpointIndex + 1)
		.filter(
			(node, index) =>
				baseCheckpointIndex + 1 + index !== selectedCheckpointIndex &&
				tag(node, 'Type') !== 'portal-checkpoint' &&
				!includedCheckpointIds.has(node.id)
		);
	let pending = await mapWithConcurrency(tailNodes, options.concurrency, async (node) => ({
		node,
		value: await fetchTransaction(node.id, options),
	}));
	while (pending.length > 0) {
		const nextPending = [];
		let progressed = false;
		for (const { node, value } of pending) {
			if (!value) {
				unresolved.push({ id: node.id, reason: 'transaction-body-not-loadable' });
				continue;
			}
			const release = normalizeRelease(value);
			if (!release || release.portalId !== portalId || release.rootTxId !== state.rootTxId) continue;
			if (!accepted.has(release.previousTxId) && !historical.has(release.previousTxId)) {
				nextPending.push({ node, value });
				continue;
			}
			const next = applyRelease(state, release, node.id, node.owner?.address);
			if (!next) {
				unresolved.push({ id: node.id, reason: 'invalid-or-content-not-indexed' });
				continue;
			}
			state = next;
			accepted.add(node.id);
			appliedReleaseCount += 1;
			for (const postId of release.changes.posts?.remove || []) deferredPosts.delete(postId);
			for (const [postId, postTxId] of Object.entries(release.changes.posts?.upsert || {})) {
				deferredPosts.set(postId, { postTxId, releaseTxId: node.id });
			}
			if (!deferredPosts.size) {
				hydratedFallback = state;
				fallbackReleaseCount = appliedReleaseCount;
			}
			progressed = true;
		}
		if (!progressed) {
			unresolved.push(
				...nextPending.map(({ node, value }) => ({
					id: node.id,
					reason: 'predecessor-not-indexed',
					previousTxId: value.previousTxId,
				}))
			);
			break;
		}
		pending = nextPending;
	}

	// Resolve only the final pointers. Superseded and removed post bodies are
	// not dependencies of the current state; release authorization still is.
	const posts = await mapWithConcurrency(state.posts, options.concurrency, async (post) => {
		const reference = deferredPosts.get(post.id);
		if (!reference) return post;
		const embedded = hydratedFallback.posts.find((candidate) => candidate.id === post.id);
		const hydrated =
			embedded?.postTxId === reference.postTxId
				? embedded
				: await loadPost(post.id, reference.postTxId, portalId, embedded, options);
		if (!hydrated)
			unresolved.push({ id: reference.releaseTxId, reason: 'current-post-not-loadable', postTxId: reference.postTxId });
		return hydrated;
	});
	if (posts.some((post) => !post)) {
		state = hydratedFallback;
		appliedReleaseCount = fallbackReleaseCount;
	} else state = { ...state, posts };

	return {
		...state,
		portalId,
		rootTxId: rootEntry.node.id,
		headTxId: state.manifestTxId,
		checkpointTxId: state.checkpointTxId || null,
		resolvedReleaseCount: appliedReleaseCount,
		unresolvedTransactions: unresolved,
	};
}

async function runCli() {
	const identifier = process.argv[2];
	if (!identifier) {
		console.error('Usage: node scripts/resolve-base-portal.mjs <portal-id-or-transaction-id>');
		process.exitCode = 1;
		return;
	}
	console.log(JSON.stringify(await resolvePortalState(identifier), null, 2));
}

if (
	typeof process !== 'undefined' &&
	process.argv?.[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
	void runCli().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
