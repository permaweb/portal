import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

import { resolvePortalState } from './resolve-base-portal.mjs';

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

function runtime(transactions = fixture(), fetchOverride, uploadOverride) {
	const calls = [];
	const uploads = [];
	let clock = Date.now();
	let offline = false;
	const storage = new Map();
	const modules = new Map();
	const localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
	const context = vm.createContext({
		atob,
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
			const respond = () => {
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
			};
			return fetchOverride ? fetchOverride(url, init, respond) : respond();
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
						if (uploadOverride) return uploadOverride(...args);
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
		context,
		fetch: context.fetch,
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
const flush = () => new Promise(setImmediate);
const numberedId = (prefix, index) => prefix + String(index).padStart(42, '0');

test('an existing base portal admin can grant Admin and the grant survives a fresh read', async () => {
	const transactions = fixture();
	transactions[0].body.users.find((user) => user.address === MEMBER).roles = ['Admin'];
	const newAdmin = id('n');
	const releaseId = id('v');
	const { api, uploads } = runtime(transactions, undefined, () => releaseId);
	const manifest = await api.setBasePortalUsers(PORTAL, [{ granteeId: newAdmin, roles: ['Admin'] }], {}, MEMBER);
	assert.deepEqual(plain(manifest.users.find((user) => user.address === newAdmin).roles), ['Admin']);
	assert.equal(manifest.owner, OWNER);
	assert.equal(uploads.length, 1);
	const [, data, tags] = uploads[0];
	assert.ok(tags.some((tag) => tag.name === 'Portal-User' && tag.value === newAdmin));
	transactions.push(transaction(releaseId, 'portal-release', JSON.parse(data), {}, MEMBER, 5));
	const reloaded = await runtime(transactions).api.fetchBasePortal(PORTAL);
	assert.deepEqual(plain(reloaded.users.find((user) => user.address === newAdmin).roles), ['Admin']);
});

test('base portal users without Admin cannot grant Admin', async () => {
	for (const roles of [[], ['Contributor'], ['Moderator'], ['ExternalContributor']]) {
		const transactions = fixture();
		transactions[0].body.users.find((user) => user.address === MEMBER).roles = roles;
		const { api, uploads } = runtime(transactions);
		await assert.rejects(
			api.setBasePortalUsers(PORTAL, [{ granteeId: id('n'), roles: ['Admin'] }], {}, MEMBER),
			/authorized/i
		);
		assert.equal(uploads.length, 0);
	}
});

// Hold selected cold reads until the test releases them. Finishing a batch in
// reverse order exposes accidental result-order changes caused by parallelism.
function heldReads(matches) {
	const held = new Map();
	let maximum = 0;
	const fetch = (url, init, respond) => {
		if (!matches(url, init)) return respond();
		return new Promise((resolve) => {
			held.set(url + (init?.body || ''), () => resolve(respond()));
			maximum = Math.max(maximum, held.size);
		});
	};
	return {
		fetch,
		get count() {
			return held.size;
		},
		get maximum() {
			return maximum;
		},
		async drain() {
			while (held.size) {
				const batch = [...held.values()].reverse();
				held.clear();
				batch.forEach((release) => release());
				await flush();
			}
		},
	};
}

function multiPostFixture(count = 20) {
	const transactions = fixture().filter(
		(tx) => tx.node.tags.find((tag) => tag.name === 'Type')?.value !== 'portal-post'
	);
	const postIds = Array.from({ length: count }, (_, index) => numberedId('t', index));
	transactions.find((tx) => tx.node.id === RELEASE).body.changes.posts.upsert = Object.fromEntries(
		postIds.map((txId) => [txId, txId])
	);
	postIds.forEach((txId, index) =>
		transactions.push(
			transaction(txId, 'portal-post', {
				type: 'portal-post',
				mode: 'base',
				portalId: PORTAL,
				post: { title: `Post ${index}`, content: [] },
			})
		)
	);
	return { transactions, postIds };
}

test('cold portal discovery starts eight portals together while keeping their results independent', async () => {
	const transactions = [];
	for (let index = 0; index < 10; index++) {
		const portalId = numberedId('p', index);
		transactions.push(
			transaction(
				numberedId('r', index),
				'portal-manifest',
				{
					...fixture()[0].body,
					portalId,
					name: `Portal ${index}`,
				},
				{ 'Portal-Id': portalId, 'Portal-User': MEMBER }
			)
		);
		transactions.push(
			transaction(
				numberedId('a', index),
				'portal-membership',
				{},
				{
					'Portal-Id': portalId,
					'Portal-User': MEMBER,
					'Membership-Status': 'accepted',
				},
				MEMBER
			)
		);
	}
	const reads = heldReads(
		(url, init) =>
			url.endsWith('/graphql') && JSON.parse(init.body).variables.tags?.some((tag) => tag.name === 'Portal-Id')
	);
	const { api } = runtime(transactions, reads.fetch);
	const loading = api.discoverBasePortals(MEMBER);
	await flush();
	assert.equal(reads.count, 8, 'eight histories must start before any finishes');
	await reads.drain();
	const result = await loading;
	assert.equal(result.portals.length, 10);
	assert.equal(new Set(result.portals.map((portal) => portal.name)).size, 10);
	assert.equal(reads.maximum, 8);
});

test('cold transaction replay fills sixteen read slots and still applies releases in dependency order', async () => {
	const transactions = [fixture()[0]];
	const releaseIds = Array.from({ length: 20 }, (_, index) => numberedId('s', index));
	releaseIds.forEach((txId, index) =>
		transactions.push(
			transaction(
				txId,
				'portal-release',
				{
					type: 'portal-release',
					mode: 'base',
					portalId: PORTAL,
					rootTxId: ROOT,
					previousTxId: releaseIds[index - 1] || ROOT,
					authorAddress: OWNER,
					changes: { name: `Release ${index}` },
				},
				{ 'Previous-Tx': releaseIds[index - 1] || ROOT },
				OWNER,
				index + 2
			)
		)
	);
	const reads = heldReads((url) => releaseIds.includes(url.split('/').at(-1)));
	const { api } = runtime(transactions, reads.fetch);
	const loading = api.fetchBasePortal(PORTAL);
	await flush();
	assert.equal(reads.count, 16);
	await reads.drain();
	const result = await loading;
	assert.equal(result.name, 'Release 19');
	assert.equal(result.manifestTxId, releaseIds.at(-1));
	assert.equal(reads.maximum, 16);
});

function rootAfterInviteHistory() {
	const [root, invite] = fixture();
	root.body.users = [{ address: OWNER, roles: ['Admin'] }];
	invite.body.changes = {
		patches: [['s', ['users', ['=', 'address', MEMBER]], { address: MEMBER, roles: ['Admin'] }]],
	};
	invite.node.block = { ...root.node.block };
	const update = transaction(
		id('u'),
		'portal-release',
		{
			...invite.body,
			previousTxId: RELEASE,
			authorAddress: MEMBER,
			changes: { name: 'Updated by invited admin' },
		},
		{ 'Previous-Tx': RELEASE },
		MEMBER,
		2
	);
	return [invite, root, update];
}

test('a same-block invite listed before the root survives fresh discovery and authorizes later updates', async () => {
	const { api } = runtime(rootAfterInviteHistory());
	const result = await api.discoverBasePortals(MEMBER);
	assert.equal(result.invites.length, 1);
	assert.equal(result.invites[0].name, 'Updated by invited admin');
	assert.equal(result.invites[0].manifestTxId, id('u'));
	const full = await api.fetchBasePortal(PORTAL);
	assert.equal(full.name, 'Updated by invited admin');
	assert.deepEqual(plain(full.users.find((user) => user.address === MEMBER).roles), ['Admin']);
});

test('transactions listed before the root are validated rather than trusted as historical predecessors', async () => {
	const [invite, root, update] = rootAfterInviteHistory();
	invite.node.owner.address = id('x');
	invite.body.authorAddress = id('x');
	update.node.owner.address = OWNER;
	update.body.authorAddress = OWNER;
	const { api } = runtime([invite, root, update]);
	const result = await api.fetchBasePortal(PORTAL);
	assert.equal(result.manifestTxId, ROOT);
	assert.equal(result.name, 'Original');
	assert.equal(
		result.users.some((user) => user.address === MEMBER),
		false
	);
});

test('a multi-post release downloads sixteen bodies together and preserves post order despite out-of-order responses', async () => {
	const { transactions, postIds } = multiPostFixture();
	const reads = heldReads((url) => postIds.includes(url.split('/').at(-1)));
	const { api } = runtime(transactions, reads.fetch);
	const loading = api.fetchBasePortal(PORTAL);
	await flush();
	assert.equal(reads.count, 16, 'post hydration must not await each body serially');
	await reads.drain();
	const result = await loading;
	assert.equal(result.name, 'Updated');
	assert.deepEqual(plain(result.posts.map((post) => post.id)), postIds);
	assert.equal(reads.maximum, 16);
});

test('one invalid post still rejects the entire parallel-hydrated release without caching partial state', async () => {
	const { transactions, postIds } = multiPostFixture(8);
	transactions.find((tx) => tx.node.id === postIds.at(-1)).body.portalId = id('x');
	const { api, storage } = runtime(transactions);
	const result = await api.fetchBasePortal(PORTAL);
	assert.equal(result.name, 'Original');
	assert.equal(result.posts.length, 0);
	const saved = JSON.parse(storage.get(`basePortal:${PORTAL}`));
	assert.equal(saved.name, 'Original');
	assert.equal(saved.posts.length, 0);
});

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

function missingInviteHistory() {
	const root = fixture()[0];
	root.body.users = [{ address: OWNER, roles: ['Admin'] }];
	const makeRelease = (txId, previousTxId, changes, height, tags = {}) =>
		transaction(
			txId,
			'portal-release',
			{
				type: 'portal-release',
				mode: 'base',
				portalId: PORTAL,
				rootTxId: ROOT,
				previousTxId,
				authorAddress: OWNER,
				changes,
			},
			{ 'Previous-Tx': previousTxId, ...tags },
			OWNER,
			height
		);
	return [
		root,
		makeRelease(id('h'), ROOT, { name: 'Older name' }, 2),
		makeRelease(id('j'), id('h'), { patches: [['s', ['description'], 'Recovered description']] }, 3),
		makeRelease(id('k'), ROOT, { name: 'Latest name' }, 4),
		makeRelease(
			RELEASE,
			id('j'),
			{ patches: [['s', ['users', ['=', 'address', MEMBER]], { address: MEMBER, roles: ['Admin'] }]] },
			5,
			{ 'Portal-User': MEMBER }
		),
	];
}

function omitHistoryNodes(ids) {
	return async (url, init, respond) => {
		const response = respond();
		if (!url.endsWith('/graphql') || !JSON.parse(init.body).variables.tags) return response;
		const payload = await response.json();
		payload.data.transactions.edges = payload.data.transactions.edges.filter(({ node }) => !ids.includes(node.id));
		return Response.json(payload);
	};
}

test('an invite survives omitted predecessors while preserving the order of independent updates', async () => {
	const { api, calls } = runtime(missingInviteHistory(), omitHistoryNodes([id('h'), id('j')]));
	const result = await api.discoverBasePortals(MEMBER);
	assert.equal(result.invites.length, 1);
	assert.equal(result.invites[0].name, 'Latest name');
	assert.equal(result.invites[0].manifestTxId, RELEASE);
	assert.deepEqual(plain(result.invites[0].users.find((user) => user.address === MEMBER).roles), ['Admin']);
	const full = await api.fetchBasePortal(PORTAL);
	assert.equal(full.description, 'Recovered description');
	assert.equal(full.manifestTxId, RELEASE);
	for (const txId of [id('h'), id('j')]) {
		assert.equal(calls.filter(({ url }) => url.endsWith(txId)).length, 1, 'recovered bodies are cached');
	}
});

test('recovered predecessors still require an authorized signer', async () => {
	const transactions = missingInviteHistory();
	transactions[1].node.owner.address = id('x');
	const { api } = runtime(transactions, omitHistoryNodes([id('h'), id('j')]));
	assert.deepEqual(plain(await api.discoverBasePortals(MEMBER)), { portals: [], invites: [] });
	assert.equal((await api.fetchBasePortal(PORTAL)).name, 'Latest name');
});

test('an unavailable predecessor is requested once and leaves dependent invites unapplied', async () => {
	const transactions = missingInviteHistory().filter((tx) => tx.node.id !== id('h'));
	const { api, calls } = runtime(transactions);
	assert.deepEqual(plain(await api.discoverBasePortals(MEMBER)), { portals: [], invites: [] });
	const lookups = calls.filter(
		({ url, init }) => url.endsWith('/graphql') && JSON.parse(init.body).variables.ids?.includes(id('h'))
	);
	assert.equal(lookups.length, 1);
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

function inviteAfterPost() {
	const transactions = fixture();
	transactions[0].body.users = [{ address: OWNER, roles: ['Admin'] }];
	transactions.push(
		transaction(
			id('v'),
			'portal-release',
			{
				...transactions[1].body,
				previousTxId: RELEASE,
				changes: { users: [...transactions[0].body.users, { address: MEMBER, roles: ['Admin'] }] },
			},
			{ 'Previous-Tx': RELEASE, 'Portal-User': MEMBER },
			OWNER,
			5
		)
	);
	return transactions;
}

test('opening a listed admin portal retries missing historical content instead of returning older permissions', async () => {
	const transactions = inviteAfterPost();
	let unavailable = true;
	const { api, calls } = runtime(transactions, (url, _init, respond) =>
		unavailable && url.endsWith(POST) ? new Response('', { status: 503 }) : respond()
	);
	const adapter = api.createBasePermawebAdapter({}, MEMBER);
	const home = await adapter.getProfileByWalletAddress(MEMBER);
	assert.deepEqual(plain(home.portals[0].users.find((user) => user.address === MEMBER).roles), ['Admin']);
	await assert.rejects(adapter.readState({ processId: PORTAL }), (error) => {
		assert.match(error.message, /still loading from Arweave/);
		assert.ok(error.pendingTransactionIds.includes(POST), 'the diagnostic identifies the unavailable post body');
		return true;
	});
	// A permissive background read must not poison the strict reader's memory cache
	// or replace the up-to-date home card with the older partial state.
	assert.equal(
		(await api.fetchBasePortal(PORTAL)).users.some((user) => user.address === MEMBER),
		false
	);
	assert.equal((await api.discoverBasePortals(MEMBER)).portals.length, 1);
	await assert.rejects(adapter.readState({ processId: PORTAL }), /still loading from Arweave/);
	unavailable = false;
	const state = await adapter.readState({ processId: PORTAL });
	assert.deepEqual(plain(state.users.roles[MEMBER].roles), ['Admin']);
	assert.equal(state.overview.manifestTxId, id('v'));
	const requestCount = calls.length;
	await adapter.readState({ processId: PORTAL });
	assert.equal(calls.length, requestCount, 'complete portal state still uses the short-lived memory cache');
});

test('an unavailable invitation body cannot turn an indexed grant into denied permissions', async () => {
	let unavailable = true;
	const { api } = runtime(inviteAfterPost(), (url, _init, respond) =>
		unavailable && url.endsWith(id('v')) ? new Response('', { status: 404 }) : respond()
	);
	const adapter = api.createBasePermawebAdapter({}, MEMBER);
	await assert.rejects(adapter.readState({ processId: PORTAL }), (error) => {
		assert.match(error.message, /still loading from Arweave/);
		assert.ok(error.pendingTransactionIds.includes(id('v')), 'the diagnostic identifies the unavailable grant');
		return true;
	});
	unavailable = false;
	assert.deepEqual(plain((await adapter.readState({ processId: PORTAL })).users.roles[MEMBER].roles), ['Admin']);
});

test('a saved post remains readable when its release is indexed before the uploaded post body', async () => {
	const transactions = fixture();
	const revisionId = id('u');
	const releaseId = id('v');
	const { api, advanceClock, calls } = runtime(transactions, undefined, (_wallet, data, tags) => {
		const payload = JSON.parse(data);
		if (payload.type === 'portal-post') return revisionId;
		assert.equal(payload.type, 'portal-release');
		transactions.push(
			transaction(
				releaseId,
				payload.type,
				payload,
				Object.fromEntries(tags.map(({ name, value }) => [name, value])),
				OWNER,
				5
			)
		);
		return releaseId;
	});
	await api.saveBasePost(PORTAL, POST, { title: 'Saved title', content: [{ content: 'Saved content' }] }, {}, OWNER);
	advanceClock(11_000);
	const state = await api.createBasePermawebAdapter({}, OWNER).readState({ processId: PORTAL });
	assert.equal(state.overview.manifestTxId, releaseId);
	assert.equal(state.posts.index[0].name, 'Saved title');
	assert.equal(
		calls.some(({ url }) => url.endsWith(revisionId)),
		false,
		'a successful upload already supplied the post bytes'
	);
});

test('local settings releases survive cache expiry and consecutive saves before indexing', async () => {
	const releaseIds = [id('u'), id('v')];
	let uploaded = 0;
	const { api, advanceClock } = runtime(fixture(), undefined, () => releaseIds[uploaded++]);
	const adapter = api.createBasePermawebAdapter({}, OWNER);
	await adapter.updateZone({ name: 'Saved name' }, PORTAL);
	advanceClock(11_000);
	assert.equal((await adapter.readState({ processId: PORTAL })).overview.name, 'Saved name');
	await adapter.updateZone({ description: 'Saved description' }, PORTAL);
	advanceClock(11_000);
	const state = await adapter.readState({ processId: PORTAL });
	assert.equal(state.overview.name, 'Saved name');
	assert.equal(state.overview.description, 'Saved description');
	assert.equal(state.overview.manifestTxId, releaseIds[1]);
});

test('a newly created post remains readable before its body and release are indexed', async () => {
	const postId = id('u');
	const releaseId = id('v');
	const ids = [postId, releaseId];
	const { api, advanceClock } = runtime(fixture(), undefined, () => ids.shift());
	const adapter = api.createBasePermawebAdapter({}, OWNER);
	await adapter.readState({ processId: PORTAL });
	assert.equal(
		await adapter.createAtomicAsset({
			name: 'New post',
			initialPostData: { originPortal: PORTAL, name: 'New post', content: [] },
		}),
		postId
	);
	await adapter.sendMessage({ action: 'Update-Asset', processId: postId, data: { originPortal: PORTAL } });
	advanceClock(11_000);
	const state = await adapter.readState({ processId: PORTAL });
	assert.equal(state.posts.index.find((post) => post.id === postId).name, 'New post');
	assert.equal(state.overview.manifestTxId, releaseId);
});

test('indexed updates and role removals take precedence after a local save', async () => {
	const transactions = fixture();
	const localId = id('u');
	const remoteId = id('v');
	const { api, uploads, advanceClock } = runtime(transactions, undefined, () => localId);
	const adapter = api.createBasePermawebAdapter({}, OWNER);
	await adapter.updateZone({ name: 'Local name' }, PORTAL);
	const localRelease = JSON.parse(uploads[0][1]);
	transactions.push(
		transaction(localId, 'portal-release', localRelease, { 'Previous-Tx': RELEASE }, OWNER, 5),
		transaction(
			remoteId,
			'portal-release',
			{
				...localRelease,
				previousTxId: RELEASE,
				changes: { name: 'Remote name', users: [] },
			},
			{ 'Previous-Tx': RELEASE },
			OWNER,
			6
		)
	);
	advanceClock(11_000);
	const state = await adapter.readState({ processId: PORTAL });
	assert.equal(state.overview.name, 'Remote name');
	assert.equal(state.overview.manifestTxId, remoteId);
	assert.equal(state.users.roles[MEMBER], undefined);
	transactions.splice(
		transactions.findIndex(({ node }) => node.id === localId),
		1
	);
	advanceClock(11_000);
	assert.equal(
		(await adapter.readState({ processId: PORTAL })).overview.name,
		'Remote name',
		'an omitted indexed upload must not be replayed after newer independent changes'
	);
});

test('persisted local state cannot substitute for unindexed transaction metadata in a new session', async () => {
	const transactions = fixture();
	const releaseId = id('u');
	const writer = runtime(transactions, undefined, () => releaseId);
	await writer.api.createBasePermawebAdapter({}, OWNER).updateZone({ name: 'Saved name' }, PORTAL);
	const reader = runtime(transactions);
	for (const [key, value] of writer.storage) reader.storage.set(key, value);
	const adapter = reader.api.createBasePermawebAdapter({}, OWNER);
	await assert.rejects(adapter.readState({ processId: PORTAL }), /still loading from Arweave/);
	transactions.push(
		transaction(releaseId, 'portal-release', JSON.parse(writer.uploads[0][1]), { 'Previous-Tx': RELEASE }, OWNER, 5)
	);
	reader.advanceClock(11_000);
	assert.equal((await adapter.readState({ processId: PORTAL })).overview.name, 'Saved name');
});

test('a locally published checkpoint survives cache expiry before indexing', async () => {
	const releaseId = id('u');
	const checkpointId = id('v');
	const ids = [releaseId, checkpointId];
	const { api, uploads, advanceClock } = runtime(fixture(), undefined, () => ids.shift());
	const adapter = api.createBasePermawebAdapter({}, OWNER);
	const description = 'x'.repeat(250_000);
	await adapter.updateZone({ description }, PORTAL);
	assert.deepEqual(
		uploads.map(([, data]) => JSON.parse(data).type),
		['portal-release', 'portal-checkpoint']
	);
	advanceClock(11_000);
	const state = await adapter.readState({ processId: PORTAL });
	assert.equal(state.overview.description, description);
	assert.equal(state.overview.manifestTxId, checkpointId);
});

test('a failed strict portal read cannot authorize using a persisted or expired fallback', async () => {
	const { api, advanceClock, setOffline } = runtime();
	const adapter = api.createBasePermawebAdapter({}, MEMBER);
	await adapter.readState({ processId: PORTAL });
	advanceClock(60_000);
	setOffline();
	await assert.rejects(adapter.readState({ processId: PORTAL }), /discovery failed/);
	assert.equal((await api.fetchBasePortal(PORTAL)).name, 'Updated', 'permissive readers retain offline fallback');
	await assert.rejects(adapter.readState({ processId: PORTAL }), /discovery failed/);
});

test('complete portal state still excludes a member whose role was removed', async () => {
	const { api } = runtime(fixture({ revoked: true }));
	const adapter = api.createBasePermawebAdapter({}, MEMBER);
	assert.equal((await adapter.readState({ processId: PORTAL })).users.roles[MEMBER], undefined);
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

test('member status lookup distinguishes accepted, declined, and unanswered invitations', async () => {
	const transactions = fixture();
	const declinedMember = id('d');
	transactions.push(
		transaction(
			id('l'),
			'portal-membership',
			{},
			{ 'Portal-User': declinedMember, 'Membership-Status': 'left' },
			declinedMember,
			5
		)
	);
	const { api } = runtime(transactions);
	const statuses = await api.getBasePortalMemberStatuses(PORTAL);
	assert.equal(statuses.get(MEMBER), 'accepted');
	assert.equal(statuses.get(declinedMember), 'left');
	assert.equal(statuses.has(id('n')), false);
});

test('member status lookup uses the latest signed response and ignores forged receipts', async () => {
	const transactions = fixture();
	transactions.push(
		transaction(id('l'), 'portal-membership', {}, { 'Portal-User': MEMBER, 'Membership-Status': 'left' }, MEMBER, 5),
		transaction(id('f'), 'portal-membership', {}, { 'Portal-User': MEMBER, 'Membership-Status': 'accepted' }, OWNER, 6)
	);
	const { api } = runtime(transactions);
	const statuses = await api.getBasePortalMemberStatuses(PORTAL);
	assert.equal(statuses.get(MEMBER), 'left');
	assert.equal(statuses.size, 1);
});

test('failed member status lookup does not report an empty set of responses', async () => {
	const { api, setOffline } = runtime();
	setOffline();
	await assert.rejects(api.getBasePortalMemberStatuses(PORTAL), /429/);
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
	assert.equal(maximum, 16);
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

function checkpointHistory() {
	const root = fixture()[0];
	const release = (txId, previousTxId, name, height) =>
		transaction(
			txId,
			'portal-release',
			{
				type: 'portal-release',
				mode: 'base',
				portalId: PORTAL,
				rootTxId: ROOT,
				previousTxId,
				authorAddress: OWNER,
				changes: { name },
			},
			{ 'Previous-Tx': previousTxId },
			OWNER,
			height
		);
	const checkpoint = (txId, previousTxId, baseCheckpointTxId, includedTxIds, name) =>
		transaction(
			txId,
			'portal-checkpoint',
			{
				type: 'portal-checkpoint',
				mode: 'base',
				portalId: PORTAL,
				rootTxId: ROOT,
				previousTxId,
				baseCheckpointTxId,
				includedTxIds,
				authorAddress: OWNER,
				state: { ...root.body, name },
			},
			{ 'Previous-Tx': previousTxId },
			OWNER,
			3
		);
	const before = release(RELEASE, ROOT, 'Before checkpoint', 2);
	const first = checkpoint(id('c'), RELEASE, ROOT, [RELEASE], 'Before checkpoint');
	const middle = release(id('u'), id('c'), 'After first checkpoint', 3);
	const second = checkpoint(id('d'), id('u'), id('c'), [id('u')], 'After first checkpoint');
	const last = release(id('v'), id('d'), 'After latest checkpoint', 4);
	return [root, before, second, first, middle, last];
}

for (const loader of ['editor', 'viewer']) {
	const resolve = async (transactions, fetchOverride, identifier = PORTAL) => {
		const rt = runtime(transactions, fetchOverride);
		return loader === 'editor'
			? rt.api.fetchBasePortal(identifier)
			: resolvePortalState(identifier, { fetch: rt.fetch, transactionCache: new Map() });
	};
	for (const failure of ['empty response', 'HTML response', 'HTTP 404']) {
		test(`${loader}: an indexed post with ${failure} loads through the transaction data endpoint`, async () => {
			const transactions = fixture();
			const post = transactions.find(({ node }) => node.id === POST).body;
			post.post.title = 'Recovered café 🚀';
			const rt = runtime(transactions, (url, _init, respond) => {
				if (url.endsWith(`/tx/${POST}/data`))
					return new Response(Buffer.from(JSON.stringify(post)).toString('base64url'));
				if (url.endsWith(`/${POST}`))
					return new Response(failure === 'HTML response' ? '<html>Not ready</html>' : '', {
						status: failure === 'HTTP 404' ? 404 : 200,
					});
				return respond();
			});
			const cache = new Map();
			const read = () =>
				loader === 'editor'
					? rt.api.fetchBasePortal(PORTAL, { fresh: true, requireComplete: true })
					: resolvePortalState(PORTAL, { fetch: rt.fetch, transactionCache: cache });
			const state = await read();
			assert.equal(state.manifestTxId, RELEASE);
			assert.equal(state.posts[0].title, post.post.title);
			const requests = rt.calls.filter(({ url }) => url.includes(POST)).length;
			assert.equal(requests, 2);
			await read();
			assert.equal(
				rt.calls.filter(({ url }) => url.includes(POST)).length,
				requests,
				'cache the decoded JSON, not the empty response'
			);
		});
	}
	test(`${loader}: transaction-data fallback still rejects content belonging to another portal`, async () => {
		const transactions = fixture();
		const post = { ...transactions.find(({ node }) => node.id === POST).body, portalId: id('x') };
		let fallbackRequested = false;
		const state = await resolve(transactions, (url, _init, respond) => {
			if (url.endsWith(`/tx/${POST}/data`)) {
				fallbackRequested = true;
				return new Response(Buffer.from(JSON.stringify(post)).toString('base64url'));
			}
			if (url.endsWith(`/${POST}`)) return new Response('');
			return respond();
		});
		assert.equal(state.manifestTxId, ROOT);
		assert.equal(state.posts.length, 0);
		assert.equal(fallbackRequested, true);
	});
	test(`${loader}: malformed transaction data is not cached and a later retry can recover`, async () => {
		const transactions = fixture();
		const post = transactions.find(({ node }) => node.id === POST).body;
		let recovered = false;
		const rt = runtime(transactions, (url, _init, respond) => {
			if (url.endsWith(`/tx/${POST}/data`))
				return new Response(recovered ? Buffer.from(JSON.stringify(post)).toString('base64url') : 'invalid data!');
			if (url.endsWith(`/${POST}`)) return new Response('');
			return respond();
		});
		const cache = new Map();
		const read = () =>
			loader === 'editor'
				? rt.api.fetchBasePortal(PORTAL, { fresh: true, requireComplete: true })
				: resolvePortalState(PORTAL, { fetch: rt.fetch, transactionCache: cache });
		if (loader === 'editor') await assert.rejects(read(), /still loading from Arweave/);
		else assert.equal((await read()).manifestTxId, ROOT);
		recovered = true;
		assert.equal((await read()).manifestTxId, RELEASE);
	});
	for (const failedId of [RELEASE, POST]) {
		test(`${loader}: reopening a portal bypasses a cached early 404 for ${
			failedId === POST ? 'post content' : 'a release'
		}`, async () => {
			let staleHttpCache = true;
			const rt = runtime(fixture(), (url, init, respond) => {
				if (url.endsWith(failedId)) {
					if (['reload', 'no-cache', 'no-store'].includes(init?.cache)) staleHttpCache = false;
					if (staleHttpCache) return new Response('', { status: 404 });
				}
				return respond();
			});
			const state =
				loader === 'editor'
					? await rt.api.fetchBasePortal(PORTAL, { requireComplete: true })
					: await resolvePortalState(PORTAL, { fetch: rt.fetch, transactionCache: new Map() });
			assert.equal(state.manifestTxId, RELEASE);
			assert.equal(state.posts[0].title, 'Full post');
			assert.equal(staleHttpCache, false);
		});
	}
	test(`${loader}: reversed same-block checkpoints still reach the latest update`, async () => {
		const state = await resolve(checkpointHistory());
		assert.equal(state.name, 'After latest checkpoint');
		assert.equal(state.manifestTxId, id('v'));
	});
	test(`${loader}: replay recovers missing ancestors without reverting independent changes`, async () => {
		const state = await resolve(missingInviteHistory(), omitHistoryNodes([id('h'), id('j')]));
		assert.equal(state.name, 'Latest name');
		assert.equal(state.description, 'Recovered description');
		assert.equal(state.manifestTxId, RELEASE);
	});
	test(`${loader}: same-block grants before the root authorize later updates`, async () => {
		const state = await resolve(rootAfterInviteHistory());
		assert.equal(state.name, 'Updated by invited admin');
		assert.equal(state.manifestTxId, id('u'));
	});
	test(`${loader}: recovered ancestors cannot claim another signer's authority`, async () => {
		const transactions = missingInviteHistory();
		transactions[1].node.owner.address = id('x');
		transactions[1].body.authorAddress = id('x');
		const state = await resolve(transactions, omitHistoryNodes([id('h'), id('j')]));
		assert.equal(
			state.users.some((user) => user.address === MEMBER),
			false
		);
	});
	test(`${loader}: a directly supplied release ID survives omission from history search`, async () => {
		const state = await resolve(missingInviteHistory(), omitHistoryNodes([RELEASE]), RELEASE);
		assert.equal(state.manifestTxId, RELEASE);
		assert.equal(
			state.users.some((user) => user.address === MEMBER),
			true
		);
	});
}

function omitPortalHistory(ids) {
	return async (url, init, respond) => {
		if (url.endsWith('/graphql') && JSON.parse(init.body).variables.tags?.some((tag) => tag.name === 'Portal-Id')) {
			const payload = await respond().json();
			payload.data.transactions.edges = payload.data.transactions.edges.filter(({ node }) => !ids.includes(node.id));
			return Response.json(payload);
		}
		return respond();
	};
}

test('wallet discovery supplies an invitation omitted from the portal history query', async () => {
	const { api } = runtime(missingInviteHistory(), omitPortalHistory([RELEASE]));
	const result = await api.discoverBasePortals(MEMBER);
	assert.equal(result.invites[0]?.manifestTxId, RELEASE);
	const opened = await api.fetchBasePortal(PORTAL);
	assert.equal(opened.manifestTxId, RELEASE);
	assert.equal(
		opened.users.some((user) => user.address === MEMBER),
		true
	);
});

test('wallet discovery supplies a creation record omitted from the portal history query', async () => {
	const root = fixture()[0];
	root.node.tags.find((tag) => tag.name === 'Portal-User').value = OWNER;
	const { api } = runtime([root], omitPortalHistory([ROOT]));
	const result = await api.discoverBasePortals(OWNER);
	assert.equal(result.portals[0]?.id, PORTAL);
	assert.equal((await api.fetchBasePortal(PORTAL)).rootTxId, ROOT);
});

test('incomplete wallet search retains known portals but does not preserve revoked access', async () => {
	const transactions = fixture();
	let empty = false;
	const { api, advanceClock } = runtime(transactions, (url, init, respond) => {
		if (
			empty &&
			url.endsWith('/graphql') &&
			JSON.parse(init.body).variables.tags?.some((tag) => tag.name === 'Portal-User')
		) {
			return Response.json({ data: { transactions: { edges: [], pageInfo: { hasNextPage: false } } } });
		}
		return respond();
	});
	assert.equal((await api.discoverBasePortals(MEMBER)).portals.length, 1);
	empty = true;
	advanceClock(60_000);
	assert.equal((await api.discoverBasePortals(MEMBER)).portals.length, 1);
	transactions.push(
		transaction(
			id('z'),
			'portal-release',
			{
				...transactions[1].body,
				previousTxId: RELEASE,
				changes: { users: [] },
			},
			{ 'Previous-Tx': RELEASE },
			OWNER,
			5
		)
	);
	advanceClock(60_000);
	assert.deepEqual(plain(await api.discoverBasePortals(MEMBER)), { portals: [], invites: [] });
});

for (const failure of ['open', 'json']) {
	test(`Cache Storage ${failure} failure falls back to network loading`, async () => {
		const { api, context, calls } = runtime();
		context.caches = {
			open: async () => {
				if (failure === 'open') throw new Error('Cache Storage unavailable');
				return {
					match: async () => ({
						ok: true,
						json: async () => {
							throw new Error('Invalid JSON');
						},
					}),
					put: async () => {},
				};
			},
		};
		const state = await api.fetchBasePortal(PORTAL);
		assert.equal(state.name, 'Updated');
		assert.equal(state.posts.length, 1);
		assert.equal(
			calls.some(({ url }) => url.endsWith(ROOT)),
			true
		);
	});
}

for (const failure of ['open', 'json']) {
	test(`viewer: Cache Storage ${failure} failure falls back to network loading`, async (t) => {
		const originalCaches = globalThis.caches;
		t.after(() => {
			if (originalCaches === undefined) delete globalThis.caches;
			else globalThis.caches = originalCaches;
		});
		globalThis.caches = {
			open: async () => {
				if (failure === 'open') throw new Error('Cache Storage unavailable');
				return {
					match: async () => ({
						ok: true,
						json: async () => {
							throw new Error('Invalid JSON');
						},
					}),
					put: async () => {},
				};
			},
		};
		const rt = runtime();
		const state = await resolvePortalState(PORTAL, { fetch: rt.fetch, transactionCache: new Map() });
		assert.equal(state.name, 'Updated');
		assert.equal(state.posts.length, 1);
	});
}

test('full localStorage cannot fail a successful network load or its memory cache', async () => {
	const { api, context, calls } = runtime();
	context.localStorage.setItem = () => {
		throw new Error('QuotaExceededError');
	};
	const state = await api.fetchBasePortal(PORTAL);
	assert.equal(state.name, 'Updated');
	const requestCount = calls.length;
	assert.equal((await api.fetchBasePortal(PORTAL)).name, 'Updated');
	assert.equal(calls.length, requestCount);
});

test('blocked localStorage access still permits a network load', async () => {
	const { api, context } = runtime();
	Object.defineProperty(context.window, 'localStorage', {
		get() {
			throw new Error('SecurityError');
		},
	});
	assert.equal((await api.fetchBasePortal(PORTAL)).name, 'Updated');
});

test('fresh loads wait out an older in-flight read then query again', async () => {
	const transactions = [fixture()[0]];
	let resume;
	let historyQueries = 0;
	const { api } = runtime(transactions, async (url, init, respond) => {
		if (url.endsWith('/graphql') && JSON.parse(init.body).variables.tags?.some((tag) => tag.name === 'Portal-Id')) {
			historyQueries += 1;
			const response = respond();
			if (historyQueries === 1)
				await new Promise((resolve) => {
					resume = resolve;
				});
			return response;
		}
		return respond();
	});
	const old = api.fetchBasePortal(PORTAL);
	await flush();
	assert.ok(resume);
	transactions.push(fixture()[1], fixture()[2]);
	const fresh = api.fetchBasePortal(PORTAL, { fresh: true });
	await flush();
	resume();
	assert.equal((await old).name, 'Original');
	assert.equal((await fresh).name, 'Updated');
	assert.equal(historyQueries, 2);
});
