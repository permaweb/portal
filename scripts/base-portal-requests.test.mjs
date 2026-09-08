import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const compiled = new Map(
	['basePortal', 'basePortalRequests'].map((name) => [
		name,
		ts.transpileModule(readFileSync(new URL(`../src/helpers/${name}.ts`, import.meta.url), 'utf8'), {
			compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
		}).outputText,
	])
);
const id = (letter) => letter.repeat(43);
const OWNER = id('o');
const MEMBER = id('m');
const PORTAL = id('p');
const ROOT = id('r');
const RELEASE = id('s');
const POST = id('t');

function transaction(txId, type, body, tags = {}, owner = OWNER, height = 1) {
	return {
		body,
		node: {
			id: txId,
			owner: { address: owner },
			block: { height, timestamp: height },
			tags: Object.entries({ 'Portal-Mode': 'base', 'Portal-Id': PORTAL, Type: type, ...tags }).map(
				([name, value]) => ({ name, value })
			),
		},
	};
}

function fixture({ unavailablePost = false, revoked = false } = {}) {
	const root = {
		type: 'portal-manifest',
		mode: 'base',
		portalId: PORTAL,
		owner: OWNER,
		name: 'Original',
		users: [
			{ address: OWNER, roles: ['Admin'] },
			{ address: MEMBER, roles: ['Contributor'] },
		],
		posts: [],
		bannerTxId: id('b'),
		iconTxId: id('i'),
	};
	const release = {
		type: 'portal-release',
		mode: 'base',
		portalId: PORTAL,
		rootTxId: ROOT,
		previousTxId: ROOT,
		authorAddress: OWNER,
		generatedAt: '2026-09-07T00:00:00.000Z',
		changes: { name: 'Updated', posts: { upsert: { [POST]: POST } }, ...(revoked ? { users: [] } : {}) },
	};
	return [
		transaction(ROOT, 'portal-manifest', root, { 'Portal-User': MEMBER }),
		transaction(RELEASE, 'portal-release', release, { 'Previous-Tx': ROOT, 'Portal-User': MEMBER }, OWNER, 2),
		transaction(
			POST,
			'portal-post',
			unavailablePost
				? null
				: {
						type: 'portal-post',
						mode: 'base',
						portalId: PORTAL,
						post: { title: 'Full post', content: [{ content: 'Body' }] },
				  },
			{},
			OWNER,
			3
		),
		transaction(
			id('a'),
			'portal-membership',
			{},
			{ 'Portal-User': MEMBER, 'Membership-Status': 'accepted' },
			MEMBER,
			4
		),
	];
}

function runtime(transactions = fixture(), fetchOverride) {
	const calls = [];
	const uploads = [];
	let clock = Date.now();
	let offline = false;
	const storage = new Map();
	const modules = new Map();
	const localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
	const context = vm.createContext({
		TextEncoder,
		TextDecoder,
		URL,
		Response,
		setTimeout,
		clearTimeout,
		console,
		structuredClone,
		Date: class extends Date {
			static now() {
				return clock;
			}
		},
		window: { localStorage },
		localStorage,
		fetch: async (url, init) => {
			calls.push({ url, init });
			if (offline) return new Response('', { status: 429 });
			if (fetchOverride) return fetchOverride(url, init);
			if (url.endsWith('/graphql')) {
				const { query, variables } = JSON.parse(init.body);
				let nodes = transactions
					.map((tx) => tx.node)
					.filter(
						(node) =>
							(!variables.ids || variables.ids.includes(node.id)) &&
							(variables.tags || []).every((filter) =>
								node.tags.some((tag) => tag.name === filter.name && filter.values.includes(tag.value))
							)
					);
				if (query.includes('HEIGHT_DESC')) nodes = nodes.reverse();
				const start = variables.after ? Number(variables.after) : 0;
				const limit = variables.first || 100;
				return Response.json({
					data: {
						transactions: {
							pageInfo: { hasNextPage: nodes.length > start + limit },
							edges: nodes
								.slice(start, start + limit)
								.map((node, index) => ({ node, cursor: String(start + index + 1) })),
						},
					},
				});
			}
			const txId = url.split('/').at(-1);
			const tx = transactions.find((entry) => entry.node.id === txId);
			return tx?.body ? Response.json(tx.body) : new Response('', { status: 404 });
		},
	});
	function load(name) {
		if (modules.has(name)) return modules.get(name);
		const exports = {};
		modules.set(name, exports);
		const require = (specifier) => {
			if (specifier === './basePortalRequests') return load('basePortalRequests');
			if (specifier === './config')
				return {
					DEFAULT_FONTS: {},
					THEME: { DEFAULT: {} },
					ENGINE_LITE_REFERENCE_ID: id('e'),
					STORAGE: new Proxy({}, { get: (_, key) => (value) => `${key}:${value}` }),
				};
			if (specifier === './pendingTransactions')
				return { trackObservedPendingTransaction() {}, trackPendingTransaction() {} };
			if (specifier === './upload')
				return {
					uploadTransaction: (...args) => {
						uploads.push(args);
						throw new Error('Unexpected upload');
					},
				};
			throw new Error(`Unexpected import: ${specifier}`);
		};
		vm.runInContext(`(function(require, exports) { ${compiled.get(name)}\n})`, context)(require, exports);
		return exports;
	}
	return {
		api: load('basePortal'),
		requests: load('basePortalRequests'),
		calls,
		storage,
		uploads,
		advanceClock: (ms) => {
			clock += ms;
		},
		setOffline: () => {
			offline = true;
		},
	};
}
const plain = (value) => JSON.parse(JSON.stringify(value));

test('home discovery gets current cards and membership without fetching post bodies or probing site IDs', async () => {
	const { api, calls, storage } = runtime();
	const result = await api.discoverBasePortals(MEMBER);
	assert.equal(result.portals.length, 1);
	assert.equal(result.portals[0].name, 'Updated');
	assert.equal(result.portals[0].icon, id('i'));
	assert.equal(result.invites.length, 0);
	assert.equal(calls.length, 4); // Discovery, portal history, root, release.
	assert.equal(
		calls.some(({ url }) => url.endsWith(POST) || url.endsWith(PORTAL)),
		false
	);
	assert.equal(storage.has(`basePortal:${PORTAL}`), false, 'card must not become a full manifest');
});

test('concurrent and repeated discovery share requests, and opening hydrates the full portal', async () => {
	const { api, calls } = runtime();
	const [first, second] = await Promise.all([api.discoverBasePortals(MEMBER), api.discoverBasePortals(MEMBER)]);
	assert.deepEqual(plain(first), plain(second));
	assert.equal(calls.length, 4);
	await api.discoverBasePortals(MEMBER);
	assert.equal(calls.length, 4);
	const full = await api.fetchBasePortal(PORTAL);
	assert.equal(full.posts.length, 1);
	assert.equal(full.posts[0].title, 'Full post');
	assert.equal(calls.length, 5, 'opening only downloads the deferred post');
	await api.fetchBasePortal(PORTAL);
	assert.equal(calls.length, 5);
});

test('lightweight cards cannot bypass full post validation or populate write state', async () => {
	const { api, storage } = runtime(fixture({ unavailablePost: true }));
	assert.equal((await api.discoverBasePortals(MEMBER)).portals[0].name, 'Updated');
	const full = await api.fetchBasePortal(PORTAL);
	assert.equal(full.name, 'Original');
	assert.equal(full.posts.length, 0);
	assert.equal(JSON.parse(storage.get(`basePortal:${PORTAL}`)).name, 'Original');
});

test('current role removals win over historical discovery tags', async () => {
	const { api, calls } = runtime(fixture({ revoked: true }));
	assert.deepEqual(plain(await api.discoverBasePortals(MEMBER)), { portals: [], invites: [] });
	assert.equal(calls.length, 4, 'duplicate candidate tags must not re-resolve a revoked portal');
});

test('membership receipts must be signed by the member', async () => {
	const transactions = fixture();
	transactions.at(-1).node.owner.address = OWNER;
	const { api } = runtime(transactions);
	const result = await api.discoverBasePortals(MEMBER);
	assert.equal(result.portals.length, 0);
	assert.equal(result.invites.length, 1);
});

test('identity-only member/profile reads make no network requests', async () => {
	const { api, calls } = runtime();
	const adapter = api.createBasePermawebAdapter(null, OWNER);
	assert.equal((await adapter.getProfileById(MEMBER, { includePortals: false })).id, MEMBER);
	assert.equal((await adapter.getProfileByWalletAddress(OWNER, { includePortals: false })).owner, OWNER);
	assert.equal(calls.length, 0);
});

test('read budget bounds concurrent gateway traffic across callers and releases slots after errors', async () => {
	const { requests } = runtime();
	let active = 0;
	let maximum = 0;
	const results = await Promise.allSettled(
		Array.from({ length: 20 }, (_, i) =>
			requests.withBaseReadLimit(async () => {
				active += 1;
				maximum = Math.max(maximum, active);
				await new Promise((resolve) => setTimeout(resolve, 2));
				active -= 1;
				if (i === 3) throw new Error('Expected');
				return i;
			})
		)
	);
	assert.equal(maximum, 4);
	assert.equal(results.filter((result) => result.status === 'fulfilled').length, 19);
	assert.equal(await requests.withBaseReadLimit(async () => 'ready'), 'ready');
});

test('failed gateway queries are shared in flight but retried on next attempt', async () => {
	let attempts = 0;
	const { requests } = runtime([], async () => {
		attempts += 1;
		await Promise.resolve();
		return attempts === 1 ? new Response('', { status: 429 }) : Response.json({ data: {} });
	});
	const read = () => requests.queryBaseGateway('https://arweave.net/graphql', 'query', {});
	const failures = await Promise.allSettled([read(), read()]);
	assert.equal(
		failures.every((result) => result.status === 'rejected'),
		true
	);
	assert.equal(attempts, 1);
	await read();
	assert.equal(attempts, 2);
});

test('invalidating queries keeps in-flight pre-write responses out of the new cache', async () => {
	const responses = [];
	const { requests } = runtime([], () => new Promise((resolve) => responses.push(resolve)));
	const read = () => requests.queryBaseGateway('https://arweave.net/graphql', 'query', {});
	const before = read();
	requests.invalidateBaseQueries();
	const after = read();
	responses[1](Response.json({ value: 'after' }));
	await after;
	responses[0](Response.json({ value: 'before' }));
	await before;
	assert.equal((await read()).value, 'after');
});

test('expired discovery refreshes indexed metadata while reusing immutable bodies', async () => {
	const transactions = fixture();
	const { api, calls, advanceClock } = runtime(transactions);
	await api.discoverBasePortals(MEMBER);
	advanceClock(60_000);
	transactions.push(
		transaction(
			id('u'),
			'portal-release',
			{
				type: 'portal-release',
				mode: 'base',
				portalId: PORTAL,
				rootTxId: ROOT,
				previousTxId: RELEASE,
				authorAddress: OWNER,
				changes: { name: 'Latest' },
			},
			{ 'Previous-Tx': RELEASE },
			OWNER,
			5
		)
	);
	assert.equal((await api.discoverBasePortals(MEMBER)).portals[0].name, 'Latest');
	assert.equal(calls.length, 7, 'only discovery/history and the new release are fetched');
});

test('a rate-limited discovery retains known cards and cannot trigger automatic membership writes', async () => {
	const { api, storage, uploads, advanceClock, setOffline } = runtime();
	await api.discoverBasePortals(MEMBER);
	storage.set(`basePortalMemberships:${MEMBER}`, JSON.stringify([PORTAL]));
	advanceClock(60_000);
	setOffline();
	const profile = await api.createBasePermawebAdapter({}, MEMBER).getProfileByWalletAddress(MEMBER);
	assert.equal(profile.portals[0].name, 'Updated');
	await Promise.resolve();
	assert.equal(uploads.length, 0);
});

test('cold discovery errors propagate so the profile provider can retain its persisted profile', async () => {
	const { api, setOffline } = runtime();
	setOffline();
	await assert.rejects(api.discoverBasePortals(MEMBER), /429/);
});
