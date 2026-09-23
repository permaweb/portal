import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const source = await readFile(new URL('../src/providers/PermawebProvider.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('PermawebProvider.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = new Map();
let resolver;
let pendingEffect;
function visit(node) {
	if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'resolveProfile') {
		resolver = node.initializer.getText(ast);
	}
	if (
		ts.isCallExpression(node) &&
		node.expression.getText(ast) === 'React.useEffect' &&
		node.arguments[0]?.getText(ast).includes('if (profilePending && libs?.getProfileById)')
	) {
		pendingEffect = node.arguments[0].getText(ast);
	}
	if (ts.isFunctionDeclaration(node) && node.name) functions.set(node.name.text, node.getText(ast));
	ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(resolver && pendingEffect, 'Load the actual profile resolver and pending-profile effect');
const runtimeSource = ts.transpileModule(
	[
		...['normalizeProfile', 'getCachedProfile', 'cacheProfile', 'handleInitialProfileCache'].map((name) => {
			assert.ok(functions.has(name), `Missing provider helper ${name}`);
			return functions.get(name);
		}),
		`const resolveProfile = ${resolver};`,
		`globalThis.api = { resolveProfile, handleInitialProfileCache, runPendingEffect: ${pendingEffect} };`,
	].join('\n'),
	{ compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }
).outputText;

const address = 'w'.repeat(43);
const profileId = 'p'.repeat(43);
const settle = () => new Promise((resolve) => setImmediate(resolve));

// Execute the provider's actual resolver, creation-cache handler, and effect
// against controlled requests so pre-creation reads can finish out of order.
function runtime() {
	const values = new Map();
	const calls = [];
	const profiles = [];
	const libs = Object.fromEntries(
		['getProfileByWalletAddress', 'getProfileById'].map((method) => [
			method,
			(value) =>
				new Promise((resolve, reject) => {
					calls.push({ method, value, resolve, reject });
				}),
		])
	);
	const context = vm.createContext({
		React: { useCallback: (callback) => callback },
		libs,
		profileRequestsRef: { current: new Map() },
		walletAddressRef: { current: address },
		arProvider: { walletAddress: address },
		profilePending: false,
		setProfile: (profile) => profiles.push(profile),
		setProfilePending: (pending) => {
			context.profilePending = pending;
		},
		IS_BASE_MODE: false,
		PORTAL_MODE: 'process',
		STORAGE: { profileByWallet: (wallet) => `profile:${wallet}` },
		localStorage: {
			getItem: (key) => values.get(key) ?? null,
			setItem: (key, value) => values.set(key, value),
		},
		cacheProfileById() {},
		addNotification() {},
		language: {},
		console: { error() {} },
	});
	vm.runInContext(runtimeSource, context);
	return { api: context.api, context, calls, profiles };
}

test('profile creation waits for a pre-create wallet lookup, then reads the newly cached ID', async () => {
	const { api, calls, context, profiles } = runtime();
	const initial = api.resolveProfile(address);
	assert.equal(calls[0].method, 'getProfileByWalletAddress');
	api.handleInitialProfileCache(address, profileId);
	api.runPendingEffect();
	assert.equal(calls.length, 1, 'wait for the old lookup before starting the post-create read');
	calls[0].resolve({ id: null });
	await initial;
	await settle();
	assert.equal(calls.length, 2);
	assert.equal(calls[1].method, 'getProfileById');
	assert.equal(calls[1].value, profileId);
	assert.equal(context.profilePending, true);
	calls[1].resolve({ id: profileId, displayname: 'New profile' });
	await settle();
	assert.equal(profiles[0].id, profileId);
	assert.equal(profiles[0].displayName, 'New profile');
	assert.equal(context.profilePending, false);
});

test('a pending profile reads its cached ID immediately when no earlier request is active', async () => {
	const { api, calls, context, profiles } = runtime();
	api.handleInitialProfileCache(address, profileId);
	api.runPendingEffect();
	assert.equal(calls.length, 1);
	assert.equal(calls[0].method, 'getProfileById');
	assert.equal(calls[0].value, profileId);
	calls[0].resolve({ id: profileId });
	await settle();
	assert.equal(profiles.length, 1);
	assert.equal(context.profilePending, false);
});

test('a failed pre-create lookup does not prevent the fresh profile lookup', async () => {
	const { api, calls, context, profiles } = runtime();
	const initial = api.resolveProfile(address);
	api.handleInitialProfileCache(address, profileId);
	api.runPendingEffect();
	calls[0].reject(new Error('Gateway unavailable'));
	await initial;
	await settle();
	assert.equal(calls.length, 2);
	assert.equal(calls[1].value, profileId);
	calls[1].resolve({ id: profileId });
	await settle();
	assert.equal(profiles.length, 1);
	assert.equal(context.profilePending, false);
});

test('effect cleanup cancels the follow-up read while the older lookup is still pending', async () => {
	const { api, calls, context, profiles } = runtime();
	const initial = api.resolveProfile(address);
	api.handleInitialProfileCache(address, profileId);
	const cleanup = api.runPendingEffect();
	cleanup();
	calls[0].resolve({ id: null });
	await initial;
	await settle();
	assert.equal(calls.length, 1);
	assert.equal(profiles.length, 0);
	assert.equal(context.profilePending, true);
});

test('effect cleanup also prevents a completed fresh read from changing active profile state', async () => {
	const { api, calls, context, profiles } = runtime();
	api.handleInitialProfileCache(address, profileId);
	const cleanup = api.runPendingEffect();
	cleanup();
	calls[0].resolve({ id: profileId });
	await settle();
	assert.equal(profiles.length, 0);
	assert.equal(context.profilePending, true);
});

for (const failure of ['read', 'write', 'corrupt']) {
	test(`profile loading succeeds after a browser cache ${failure} failure`, async () => {
		const { api, calls, context } = runtime();
		if (failure === 'corrupt') context.localStorage.getItem = () => '{invalid';
		else
			context.localStorage[failure === 'read' ? 'getItem' : 'setItem'] = () => {
				throw new Error('Storage unavailable');
			};
		const request = api.resolveProfile(address);
		assert.equal(calls[0].method, 'getProfileByWalletAddress');
		calls[0].resolve({ id: profileId, displayname: 'Loaded profile' });
		const profile = await request;
		assert.equal(profile.id, profileId);
		assert.equal(profile.displayName, 'Loaded profile');
	});
}
