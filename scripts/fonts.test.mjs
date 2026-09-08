import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const compiled = ts.transpileModule(readFileSync(new URL('../src/helpers/fonts.ts', import.meta.url), 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture(eagerFonts = '') {
	const exports = {};
	const links = [];
	const document = {
		querySelectorAll: () => (eagerFonts ? [{ dataset: { portalFonts: eagerFonts } }] : []),
		createElement: () => ({
			listeners: {},
			addEventListener(type, callback) {
				this.listeners[type] = callback;
			},
			remove() {
				links.splice(links.indexOf(this), 1);
			},
		}),
		head: { appendChild: (link) => links.push(link) },
	};
	vm.runInNewContext(compiled, { exports, document });
	return { ...exports, links };
}

function families(link) {
	return new URL(link.href).searchParams.get('family').split('|');
}

test('only the selected families are requested, once across previews and repeated provider loads', () => {
	const { loadPortalFonts, links } = fixture();
	loadPortalFonts(['Lora:400,700', 'Lora:400,700', 'Open Sans:400,600']);
	loadPortalFonts(['Open Sans:400,600', ' Lora:400,700 ']);
	assert.equal(links.length, 1);
	assert.equal(links[0].rel, 'stylesheet');
	assert.deepEqual(families(links[0]), ['Lora:400,700', 'Open Sans:400,600']);
	assert.equal(new URL(links[0].href).searchParams.get('display'), 'swap');
	loadPortalFonts(['Lora:400,700', 'Inter:400,600']);
	assert.equal(links.length, 2);
	assert.deepEqual(families(links[1]), ['Inter:400,600']);
});

test('default variable fonts already supplied by the HTML do not cause another stylesheet request', () => {
	const { loadPortalFonts, links } = fixture('Crimson Pro|Open Sans');
	loadPortalFonts(['Crimson Pro:400,600,700', 'Open Sans:400,600,700']);
	assert.equal(links.length, 0);
	loadPortalFonts(['Open Sans:400,600,700', 'Montserrat:400,700']);
	assert.equal(links.length, 1);
	assert.deepEqual(families(links[0]), ['Montserrat:400,700']);
});

test('a failed stylesheet can be requested again instead of poisoning the session cache', () => {
	const { loadPortalFonts, links } = fixture();
	loadPortalFonts(['Lora:400,700', 'Inter:400,600']);
	const failed = links[0];
	failed.listeners.error();
	assert.equal(links.length, 0);
	loadPortalFonts(['Inter:400,600']);
	assert.equal(links.length, 1);
	assert.notEqual(links[0], failed);
	assert.deepEqual(families(links[0]), ['Inter:400,600']);
});

test('missing fonts do not fetch a stylesheet, while a newly requested weight is retained', () => {
	const { loadPortalFonts, links } = fixture();
	loadPortalFonts([null, undefined, '', '   ']);
	assert.equal(links.length, 0);
	loadPortalFonts(['Lora:400']);
	loadPortalFonts(['Lora:400,700']);
	assert.equal(links.length, 2);
	assert.deepEqual(families(links[1]), ['Lora:400,700']);
});
