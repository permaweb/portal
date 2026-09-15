import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const source = ts.transpileModule(
	readFileSync(new URL('../src/apps/editor/components/organisms/UserManager/UserManager.tsx', import.meta.url), 'utf8'),
	{
		fileName: 'UserManager.tsx',
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			jsx: ts.JsxEmit.React,
			esModuleInterop: true,
		},
	}
).outputText;
const OWNER = 'o'.repeat(43);
const ACTOR = 'a'.repeat(43);
const PROFILE = 'p'.repeat(43);
const TARGET = 't'.repeat(43);
const TARGET_PROFILE = 'u'.repeat(43);
const PORTAL = 'z'.repeat(43);

function elements(tree, type) {
	if (!tree || typeof tree !== 'object') return [];
	if (Array.isArray(tree)) return tree.flatMap((child) => elements(child, type));
	return [...(tree.type === type ? [tree.props] : []), ...elements(tree.props?.children, type)];
}

function runtime({ base = false, owner = false, roles = ['Admin'], targetRoles } = {}) {
	const hooks = [];
	const grants = [];
	const notices = [];
	const wallet = {};
	let cursor = 0;
	let effects = [];
	let dirty = true;
	let tree;
	let closed = false;
	const portal = {
		current: {
			id: PORTAL,
			owner: OWNER,
			users: [{ address: base ? ACTOR : PROFILE, roles }],
			roleOptions: Object.fromEntries(['Admin', 'Moderator', 'Contributor', 'ExternalContributor'].map((r) => [r, r])),
		},
		refreshCurrentPortal() {},
	};
	const sameDependencies = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
	const React = {
		createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
		useState(initial) {
			const index = cursor++;
			if (!hooks[index]) hooks[index] = { value: initial };
			return [
				hooks[index].value,
				(value) => {
					if (!Object.is(value, hooks[index].value)) {
						hooks[index].value = value;
						dirty = true;
					}
				},
			];
		},
		useMemo(factory, deps) {
			const index = cursor++;
			if (!sameDependencies(hooks[index]?.deps, deps)) hooks[index] = { deps, value: factory() };
			return hooks[index].value;
		},
		useEffect(effect, deps) {
			const index = cursor++;
			if (!sameDependencies(hooks[index]?.deps, deps)) {
				hooks[index] = { deps };
				effects.push(effect);
			}
		},
	};
	const language = { add: 'Add', save: 'Save', role: 'Role', walletAddress: 'Wallet', removeUser: 'Remove User' };
	const modules = {
		react: React,
		'editor/providers/PortalProvider': { usePortalProvider: () => portal },
		'providers/ArweaveProvider': { useArweaveProvider: () => ({ wallet, walletAddress: owner ? OWNER : ACTOR }) },
		'providers/PermawebProvider': {
			usePermawebProvider: () => ({
				profile: { id: base ? ACTOR : PROFILE },
				libs: {
					getProfileByWalletAddress: async () => ({ id: base ? TARGET : TARGET_PROFILE }),
					setZoneRoles: async (...args) => grants.push(args),
				},
			}),
		},
		'providers/LanguageProvider': { useLanguageProvider: () => ({ current: 'en', object: { en: language } }) },
		'providers/NotificationProvider': {
			useNotifications: () => ({ addNotification: (...args) => notices.push(args) }),
		},
		'helpers/config': { ICONS: {} },
		'helpers/features': { IS_BASE_MODE: base },
		'helpers/types': { PortalPatchMapEnum: { Users: 'users' } },
		'helpers/utils': {
			checkValidAddress: (value) => /^[a-zA-Z0-9_-]{43}$/.test(value),
			debugLog() {},
			formatRoleLabel: (r) => r,
		},
		'./styles': {},
	};
	for (const name of ['Button', 'FormField', 'Modal', 'Select']) modules[`components/atoms/${name}`] = { [name]: name };
	const exports = {};
	vm.runInNewContext(`(function(require, exports) { ${source}\n})`)((name) => {
		assert.ok(name in modules, `Unexpected import: ${name}`);
		return modules[name];
	}, exports);
	const props = {
		user: targetRoles ? { address: base ? TARGET : TARGET_PROFILE, owner: TARGET, roles: targetRoles } : undefined,
		handleClose: () => {
			closed = true;
		},
	};
	function render() {
		for (let i = 0; dirty && i < 20; i++) {
			dirty = false;
			cursor = 0;
			effects = [];
			tree = exports.default(props);
			for (const effect of effects) effect();
		}
		assert.equal(dirty, false, 'User manager must settle');
	}
	render();
	return {
		grants,
		notices,
		get closed() {
			return closed;
		},
		select: () => elements(tree, 'Select')[0],
		button: (label) => elements(tree, 'Button').find((button) => button.label === label),
		setActorRoles(roles) {
			portal.current.users = [{ ...portal.current.users[0], roles }];
			dirty = true;
			render();
		},
		async submitAdmin() {
			const select = elements(tree, 'Select')[0];
			const admin = select.options.find((option) => option.id === 'Admin');
			assert.ok(admin, 'Admin must be an available role');
			assert.equal(select.disabled, false);
			select.setActiveOption(admin);
			elements(tree, 'FormField')[0].onChange({ target: { value: TARGET } });
			render();
			const submit = elements(tree, 'Button').find((button) => button.label === (targetRoles ? 'Save' : 'Add'));
			assert.ok(!submit.disabled, 'The selected Admin role must be submittable');
			await submit.handlePress();
			render();
		},
	};
}

for (const base of [false, true]) {
	const mode = base ? 'base' : 'process';
	test(`${mode}: an admin can invite another admin and promote a contributor`, async () => {
		for (const targetRoles of [undefined, ['Contributor']]) {
			const app = runtime({ base, targetRoles });
			await app.submitAdmin();
			assert.equal(app.grants.length, 1);
			const [grants, portalId] = app.grants[0];
			assert.equal(portalId, PORTAL);
			assert.deepEqual(JSON.parse(JSON.stringify(grants)), [
				{ granteeId: TARGET, roles: ['Admin'], type: 'wallet', sendInvite: false, remoteZonePath: 'Portals' },
				{
					granteeId: base ? TARGET : TARGET_PROFILE,
					roles: ['Admin'],
					type: 'process',
					sendInvite: !targetRoles,
					remoteZonePath: 'Portals',
				},
			]);
			assert.equal(app.closed, true);
			assert.equal(app.notices[0][1], 'success');
		}
	});

	test(`${mode}: owners retain Admin grants and lower roles cannot select Admin`, () => {
		assert.ok(
			runtime({ base, owner: true, roles: [] })
				.select()
				.options.some((role) => role.id === 'Admin')
		);
		for (const roles of [[], ['Contributor'], ['Moderator'], ['ExternalContributor']]) {
			assert.equal(
				runtime({ base, roles })
					.select()
					.options.some((role) => role.id === 'Admin'),
				false
			);
		}
	});

	test(`${mode}: role options update when the actor gains or loses Admin`, () => {
		const app = runtime({ base, roles: ['Contributor'] });
		app.setActorRoles(['Admin']);
		assert.ok(app.select().options.some((role) => role.id === 'Admin'));
		app.setActorRoles(['Contributor']);
		assert.equal(
			app.select().options.some((role) => role.id === 'Admin'),
			false
		);
	});

	test(`${mode}: admins cannot edit or remove existing admins`, () => {
		const app = runtime({ base, targetRoles: ['Admin'] });
		assert.equal(app.select().disabled, true);
		assert.equal(app.button('Save').disabled, true);
		assert.equal(app.button('Remove User'), undefined);
		const owner = runtime({ base, owner: true, targetRoles: ['Admin'] });
		assert.equal(owner.select().disabled, false);
		assert.ok(owner.button('Remove User'));
	});
}
