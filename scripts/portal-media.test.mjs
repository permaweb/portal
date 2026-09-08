import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import ts from 'typescript';

function moduleUrl(source) {
	const compiled = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
	}).outputText;
	return `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
}

const { registerPortalUpload } = await import(
	moduleUrl(await readFile(new URL('../src/helpers/portalMedia.ts', import.meta.url), 'utf8'))
);

// Exercise the provider's actual registration closure with state/cache dependencies,
// without mounting its unrelated routing, wallet, and portal-fetch effects.
const providerText = await readFile(
	new URL('../src/apps/editor/providers/PortalProvider.tsx', import.meta.url),
	'utf8'
);
const providerAst = ts.createSourceFile(
	'PortalProvider.tsx',
	providerText,
	ts.ScriptTarget.Latest,
	true,
	ts.ScriptKind.TSX
);
let registration;
function findRegistration(node) {
	if (ts.isVariableDeclaration(node) && node.name.getText(providerAst) === 'addPortalUpload') {
		registration = node.initializer;
	}
	ts.forEachChild(node, findRegistration);
}
findRegistration(providerAst);
assert.ok(registration, 'PortalProvider must expose its shared media registration function');
const { createProviderRegistration } = await import(
	moduleUrl(`export function createProviderRegistration(deps: any) {
		const { current, currentRef, arProvider, permawebProvider, mediaWritesRef,
			portalSessionRef, registerPortalUpload, cachePortal, setCurrent } = deps;
		return (${registration.getText(providerAst)});
	}`)
);

const portalId = 'p'.repeat(43);
const walletAddress = 'w'.repeat(43);
const wallet = {};
const existing = { tx: 'qw53YolzHuDwEk3DMJkw5HSpT7bwEj0OQKgF6SSiEX0', type: 'image', dateUploaded: '1' };
const featured = { tx: 'ww5oMK0s9J_pWJG8kWjUsNTrJsDAYNc9hlc7RUgDq10', type: 'image', dateUploaded: '2' };

function deferred() {
	let resolve;
	const promise = new Promise((complete) => {
		resolve = complete;
	});
	return { promise, resolve };
}

function args(overrides = {}) {
	return { portalId, wallet, upload: featured, ...overrides };
}

function legacyLibs(updateZone = async () => 'message-id') {
	return {
		updateZone,
		mapToProcessCase: (uploads) =>
			uploads.map(({ tx, type, dateUploaded }) => ({ Tx: tx, Type: type, DateUploaded: dateUploaded })),
	};
}

function providerRuntime({ uploads = [existing], libs, result } = {}) {
	const current = { id: portalId, name: 'Portal', uploads };
	const currentRef = { current };
	const portalSessionRef = { current: { walletAddress } };
	const stateWrites = [];
	const cacheWrites = [];
	const add = createProviderRegistration({
		current,
		currentRef,
		portalSessionRef,
		mediaWritesRef: { current: Promise.resolve() },
		arProvider: { wallet, walletAddress },
		permawebProvider: { libs, deps: { ao: { result } } },
		registerPortalUpload,
		cachePortal: (id, state) => cacheWrites.push({ id, state }),
		setCurrent: (state) => stateWrites.push(state),
	});
	return { add, currentRef, portalSessionRef, stateWrites, cacheWrites };
}

test('registers an image when the current uploads list is missing', async () => {
	const writes = [];
	const uploads = await registerPortalUpload(
		args({ libs: { addPortalUpload: async (...values) => writes.push(values) } })
	);
	assert.deepEqual(uploads, [featured]);
	assert.deepEqual(writes, [[portalId, featured]]);
});

test('deduplicates by transaction ID without writing or waiting again', async () => {
	const uploads = [existing, featured];
	const result = await registerPortalUpload(
		args({
			uploads,
			libs: {
				addPortalUpload: () => assert.fail('Duplicate media must not be appended'),
				updateZone: () => assert.fail('Duplicate media must not be submitted'),
			},
			waitForUpdate: () => assert.fail('Duplicate media must not wait for an update'),
		})
	);
	assert.equal(result, uploads);
});

test('uses the base append API while preserving uploads and skipping AO result waits', async () => {
	const writes = [];
	const result = await registerPortalUpload(
		args({
			uploads: [existing],
			libs: {
				addPortalUpload: async (...values) => writes.push(values),
				updateZone: () => assert.fail('Base registration must use the append API'),
			},
			waitForUpdate: () => assert.fail('Base registration has no AO result'),
		})
	);
	assert.deepEqual(result, [existing, featured]);
	assert.deepEqual(writes, [[portalId, featured]]);
});

test('legacy registration remains pending until the submitted update has a successful result', async () => {
	const waiting = deferred();
	const confirmation = deferred();
	const writes = [];
	let completed = false;
	const promise = registerPortalUpload(
		args({
			uploads: [existing],
			libs: legacyLibs(async (...values) => {
				writes.push(values);
				return 'message-id';
			}),
			waitForUpdate: (id) => {
				assert.equal(id, 'message-id');
				waiting.resolve();
				return confirmation.promise;
			},
		})
	).then((uploads) => {
		completed = true;
		return uploads;
	});
	await waiting.promise;
	assert.equal(completed, false);
	assert.deepEqual(writes, [
		[
			{
				Uploads: [existing, featured].map(({ tx, type, dateUploaded }) => ({
					Tx: tx,
					Type: type,
					DateUploaded: dateUploaded,
				})),
			},
			portalId,
			wallet,
		],
	]);
	confirmation.resolve({ Messages: [] });
	assert.deepEqual(await promise, [existing, featured]);
	assert.equal(completed, true);
});

test('failed submissions and process results reject registration', async () => {
	await assert.rejects(registerPortalUpload(args({ libs: legacyLibs(async () => null) })), /not submitted/);
	await assert.rejects(
		registerPortalUpload(
			args({
				libs: legacyLibs(async () => {
					throw new Error('Submission failed');
				}),
			})
		),
		/Submission failed/
	);
	await assert.rejects(
		registerPortalUpload(args({ libs: legacyLibs(), waitForUpdate: async () => ({ Error: 'Permission denied' }) })),
		/Permission denied/
	);
	await assert.rejects(
		registerPortalUpload(
			args({
				libs: legacyLibs(),
				waitForUpdate: async () => {
					throw new Error('Result unavailable');
				},
			})
		),
		/Result unavailable/
	);
});

test('AO error messages reject registration even when the result has no top-level error', async () => {
	const messages = [
		{ Error: 'Permission denied' },
		{ Tags: [{ name: 'Error', value: 'Permission denied' }], Data: 'Permission denied' },
		{ Tags: [{ name: 'Action', value: 'Zone-Update-Error' }], Data: 'Permission denied' },
		{ Tags: [{ name: 'Status', value: 'Failed' }], Data: 'Permission denied' },
	];
	for (const message of messages) {
		await assert.rejects(
			registerPortalUpload(args({ libs: legacyLibs(), waitForUpdate: async () => ({ Messages: [message] }) })),
			/Permission denied/
		);
	}
	assert.deepEqual(
		await registerPortalUpload(
			args({
				libs: legacyLibs(),
				waitForUpdate: async () => ({ Messages: [{ Tags: [{ name: 'Action', value: 'Zone-Update-Success' }] }] }),
			})
		),
		[featured]
	);
});

test('requires a portal, wallet, and library instead of silently skipping registration', async () => {
	for (const missing of [{ wallet: null }, { portalId: '' }, { libs: null }]) {
		await assert.rejects(
			registerPortalUpload(args({ libs: { addPortalUpload: () => assert.fail('Unexpected write') }, ...missing })),
			/portal and connected wallet are required/
		);
	}
});

test('the provider makes confirmed uploads visible in current state and the portal cache', async () => {
	const waiting = deferred();
	const confirmation = deferred();
	const runtime = providerRuntime({
		libs: legacyLibs(),
		result: ({ process, message }) => {
			assert.equal(process, portalId);
			assert.equal(message, 'message-id');
			waiting.resolve();
			return confirmation.promise;
		},
	});
	const write = runtime.add(featured);
	await waiting.promise;
	assert.equal(runtime.stateWrites.length, 0);
	assert.equal(runtime.cacheWrites.length, 0);
	assert.deepEqual(runtime.currentRef.current.uploads, [existing]);
	confirmation.resolve({ Messages: [] });
	await write;
	assert.deepEqual(runtime.currentRef.current, { id: portalId, name: 'Portal', uploads: [existing, featured] });
	assert.deepEqual(runtime.stateWrites, [runtime.currentRef.current]);
	assert.deepEqual(runtime.cacheWrites, [{ id: portalId, state: runtime.currentRef.current }]);
});

test('the provider retains current media and cache on registration failure', async () => {
	for (const result of [
		{ Error: 'Permission denied' },
		{ Messages: [{ Tags: [{ name: 'Action', value: 'Zone-Update-Error' }], Data: 'Permission denied' }] },
	]) {
		const runtime = providerRuntime({ libs: legacyLibs(), result: async () => result });
		await assert.rejects(runtime.add(featured), /Permission denied/);
		assert.deepEqual(runtime.currentRef.current.uploads, [existing]);
		assert.equal(runtime.stateWrites.length, 0);
		assert.equal(runtime.cacheWrites.length, 0);
	}
});

test('the provider queues registrations so successive uploads preserve each other', async () => {
	const waiting = deferred();
	const confirmation = deferred();
	const submitted = [];
	const another = { tx: 'a'.repeat(43), type: 'image', dateUploaded: '3' };
	const runtime = providerRuntime({
		libs: legacyLibs(async (data) => {
			submitted.push(data);
			return `message-${submitted.length}`;
		}),
		result: ({ message }) => {
			if (message === 'message-1') {
				waiting.resolve();
				return confirmation.promise;
			}
			return Promise.resolve({ Messages: [] });
		},
	});
	const first = runtime.add(featured);
	const second = runtime.add(another);
	await waiting.promise;
	assert.equal(submitted.length, 1);
	confirmation.resolve({ Messages: [] });
	await Promise.all([first, second]);
	assert.deepEqual(runtime.currentRef.current.uploads, [existing, featured, another]);
	assert.deepEqual(
		submitted[1].Uploads.map((upload) => upload.Tx),
		[existing.tx, featured.tx, another.tx]
	);
});

test('a completed upload cannot overwrite another portal selected during registration', async () => {
	const waiting = deferred();
	const confirmation = deferred();
	const runtime = providerRuntime({
		libs: legacyLibs(),
		result: () => {
			waiting.resolve();
			return confirmation.promise;
		},
	});
	const write = runtime.add(featured);
	await waiting.promise;
	const anotherPortal = { id: 'q'.repeat(43), uploads: [] };
	runtime.currentRef.current = anotherPortal;
	confirmation.resolve({ Messages: [] });
	await write;
	assert.equal(runtime.currentRef.current, anotherPortal);
	assert.equal(runtime.stateWrites.length, 0);
	assert.equal(runtime.cacheWrites.length, 0);
});
