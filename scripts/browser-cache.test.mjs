import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const source = readFileSync(new URL('../src/helpers/utils.ts', import.meta.url), 'utf8');
const ast = ts.createSourceFile('utils.ts', source, ts.ScriptTarget.Latest, true);
const names = [
	'readCachedJson',
	'cacheJson',
	'getCachedPortal',
	'cachePortal',
	'getCachedPermissions',
	'cachePermissions',
	'getCachedProfile',
	'cacheProfile',
	'getCachedModeration',
	'cacheModeration',
];
const selected = ast.statements.filter((statement) => {
	const name = ts.isFunctionDeclaration(statement)
		? statement.name?.text
		: ts.isVariableStatement(statement)
		? statement.declarationList.declarations[0].name.getText(ast)
		: '';
	return names.includes(name);
});
assert.equal(selected.length, names.length);
const compiled = ts.transpileModule(selected.map((statement) => statement.getText(ast)).join('\n'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function runtime() {
	const values = new Map();
	const context = vm.createContext({
		exports: {},
		STORAGE: Object.fromEntries(
			['portal', 'permissions', 'profile', 'moderation'].map((name) => [name, (...ids) => `${name}:${ids.join(':')}`])
		),
		localStorage: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) },
	});
	vm.runInContext(compiled, context);
	return context;
}

for (const [kind, ids] of [
	['Portal', ['portal']],
	['Permissions', ['portal', 'user']],
	['Profile', ['user']],
	['Moderation', ['portal']],
]) {
	test(`${kind} cache failures do not interrupt loading`, () => {
		const context = runtime();
		const read = () => context.exports[`getCached${kind}`](...ids);
		const write = () => context.exports[`cache${kind}`](...ids, { loaded: true });
		write();
		assert.equal(read().loaded, true);
		context.localStorage.getItem = () => '{invalid';
		assert.equal(read(), null);
		context.localStorage.getItem = () => {
			throw new Error('SecurityError');
		};
		assert.equal(read(), null);
		context.localStorage.setItem = () => {
			throw new Error('QuotaExceededError');
		};
		assert.doesNotThrow(write);
	});
}
