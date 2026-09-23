import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

function compile(path) {
	return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	}).outputText;
}

const portalTheme = {};
vm.runInNewContext(compile('../src/helpers/portalTheme.ts'), { exports: portalTheme });
const engineTheme = {};
vm.runInNewContext(compile('../src/apps/engine-lite/theme.ts'), {
	exports: engineTheme,
	require: () => portalTheme,
});
const { getLiteThemeVars } = engineTheme;
const palette = {
	background: '240,230,210',
	surface: '250,240,220',
	text: '30,40,60',
	accent: '150,80,40',
	link: '60,90,140',
	border: '100,110,120',
};
const alternatePalette = {
	background: '20,30,50',
	surface: '40,50,70',
	text: '210,220,240',
	accent: '80,170,210',
	link: '210,140,170',
	border: '170,180,190',
};

test('all generated engine colors follow the selected portal palette in both schemes', () => {
	for (const scheme of ['light', 'dark']) {
		const themes = [
			{ colors: { light: alternatePalette, dark: alternatePalette } },
			{ active: true, colors: { light: palette, dark: palette } },
		];
		const before = getLiteThemeVars({ themes, fonts: null }, scheme);
		assert.equal(before['--lite-background'], `rgb(${palette.background})`);
		assert.equal(before['--lite-surface'], `rgb(${palette.surface})`);
		assert.equal(before['--lite-text'], `rgb(${palette.text})`);
		assert.equal(before['--lite-primary'], `rgb(${palette.accent})`);
		assert.equal(before['--lite-link'], `rgb(${palette.link})`);
		themes[1].colors[scheme] = alternatePalette;
		const after = getLiteThemeVars({ themes, fonts: null }, scheme);
		for (const [key, value] of Object.entries(before)) {
			if (/^rgba?\(/.test(value)) assert.notEqual(after[key], value, `${key} must respond to the configured palette`);
		}
	}
});

test('missing theme settings use the shared portal defaults', () => {
	for (const scheme of ['light', 'dark']) {
		const result = getLiteThemeVars({ themes: [], fonts: null }, scheme);
		const defaults = portalTheme.DEFAULT_PORTAL_THEME.colors[scheme];
		assert.equal(result['--lite-background'], `rgb(${defaults.background})`);
		assert.equal(result['--lite-surface'], `rgb(${defaults.surface})`);
		assert.equal(result['--lite-text'], `rgb(${defaults.text})`);
		assert.equal(result['--lite-code-primary'], `rgb(${defaults.link})`);
	}
});
