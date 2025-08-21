#!/usr/bin/env node
/*
 Sort keys inside src/helpers/language.ts for each locale object (en and all others).
 - Stable preserves values intact
 - Maintains original indentation and spacing
 - Injects missing keys from 'en' as an UNTRANSLATED block for any non-en locale
 - --check exits with code 1 if changes would be made
*/
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'helpers', 'language.ts');
const CHECK_ONLY = process.argv.includes('--check');

function readFileSafe(p) {
	return fs.readFileSync(p, 'utf8');
}

function findBalancedBlock(src, startIndex) {
	// Finds the balanced { ... } block starting at startIndex (which should point to '{')
	let i = startIndex;
	let depth = 0;
	let inSingle = false,
		inDouble = false,
		inBacktick = false,
		escaped = false;
	for (; i < src.length; i++) {
		const ch = src[i];
		const prevEscaped = escaped;
		escaped = ch === '\\' && !prevEscaped;
		if (inSingle) {
			if (ch === "'" && !prevEscaped) inSingle = false;
			continue;
		}
		if (inDouble) {
			if (ch === '"' && !prevEscaped) inDouble = false;
			continue;
		}
		if (inBacktick) {
			if (ch === '`' && !prevEscaped) inBacktick = false;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			continue;
		}
		if (ch === '"') {
			inDouble = true;
			continue;
		}
		if (ch === '`') {
			inBacktick = true;
			continue;
		}

		if (ch === '{') {
			depth++;
			if (depth === 1 && i !== startIndex) {
				// nested but fine
			}
		} else if (ch === '}') {
			depth--;
			if (depth === 0) {
				return { start: startIndex, end: i };
			}
		}
	}
	return null;
}

function escapeRegExp(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findlanguageBlock(src) {
	// Locate the main language object: const language = { ... }
	const decl = src.match(/language\s*=\s*\{/);
	if (!decl) return null;
	const braceIdx = src.indexOf('{', decl.index);
	const bal = findBalancedBlock(src, braceIdx);
	if (!bal) return null;
	return { start: braceIdx, end: bal.end };
}

function sortSection(section) {
	// section looks like: "en: {\n  <indent><key>: <value>, ...\n}\n"
	const braceStart = section.indexOf('{');
	if (braceStart < 0) return section;
	const bal = findBalancedBlock(section, braceStart);
	if (!bal) return section;
	const before = section.slice(0, bal.start + 1); // include '{'
	let inside = section.slice(bal.start + 1, bal.end);
	const after = section.slice(bal.end); // includes '}' and trailing

	// Detect indent used by first entry
	const indentMatch = inside.match(/\n([ \t]+)[a-zA-Z0-9_]+:/);
	const indent = indentMatch ? indentMatch[1] : '\t\t';
	const indentEsc = indent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// Build entry regex using detected indent; stop at next key on same indent or at a closing brace line
	const entryRe = new RegExp(
		`(\\n${indentEsc}[a-zA-Z0-9_]+:[\\s\\S]*?)(?=\\n${indentEsc}[a-zA-Z0-9_]+:|\\n[\\ \t]*\\}|$)`,
		'g'
	);
	const keyRe = new RegExp(`\\n${indentEsc}([a-zA-Z0-9_]+):`);

	// Remove prior untranslated markers if present (robust to indentation and CRLF)
	inside = inside.replace(
		/(?:\r?\n)[ \t]*\/\/ === UNTRANSLATED START ===[\s\S]*?(?:\r?\n)[ \t]*\/\/ === UNTRANSLATED END ===/g,
		''
	);

	const entries = [];
	let m;
	while ((m = entryRe.exec(inside)) !== null) {
		const chunk = m[1];
		const k = chunk.match(keyRe);
		if (!k) continue;
		entries.push({ key: k[1], chunk });
	}
	if (entries.length === 0) return section; // nothing to sort

	// Determine locale code (e.g., en:, es:, fr:, pt_BR:, etc.) from section
	const localeMatch = section.match(/\n[ \t]*([a-zA-Z_\-]+):/);
	const localeCode = localeMatch ? localeMatch[1] : null;

	// Build key set for existing entries
	const existingKeys = new Set(entries.map((e) => e.key));

	// If we have en section and a global enKeys, use it; otherwise skip pinning
	let headerBlock = '';
	if (localeCode && global.enKeyValues && localeCode !== 'en') {
		const enKeys = Object.keys(global.enKeyValues);
		const missing = enKeys.filter((k) => !existingKeys.has(k));
		if (missing.length > 0) {
			const missingEntries = missing.map((k) => `\n${indent}${k}: ${global.enKeyValues[k]},`).join('');
			headerBlock = `\n${indent}// === UNTRANSLATED START ===\n${indent}// TODO: translate\n${missingEntries}\n${indent}// === UNTRANSLATED END ===`;
		}
	}

	entries.sort((a, b) => a.key.localeCompare(b.key));
	const sortedInside = entries.map((e) => e.chunk).join('');
	return before + headerBlock + sortedInside + after;
}

function run() {
	const original = readFileSafe(FILE);
	let output = original;

	// Identify language block and locale keys
	const lang = findlanguageBlock(output);
	if (!lang) {
		console.error('Could not locate language object in language.ts');
	} else {
		const langBlock = output.slice(lang.start, lang.end + 1);
		const localeRe = /\n[ \t]*([a-zA-Z_\-]+):\s*\{/g;
		const localesSet = new Set();
		let m;
		while ((m = localeRe.exec(langBlock)) !== null) {
			const key = m[1];
			localesSet.add(key);
		}
		const locales = Array.from(localesSet);
		// Always process 'en' first, then others in alpha order
		const others = locales.filter((l) => l !== 'en').sort((a, b) => a.localeCompare(b));
		const ordered = (locales.includes('en') ? ['en'] : []).concat(others);

		// Build en key-value map for missing key detection
		if (locales.includes('en')) {
			const enRe = new RegExp(`\n[ \t]*en:\\s*\\{`);
			const enMatch = output.match(enRe);
			if (enMatch) {
				const enBrace = output.indexOf('{', enMatch.index);
				const enBal = findBalancedBlock(output, enBrace);
				if (enBal) {
					const enBlock = output.slice(enMatch.index, enBal.end + 1);
					const enInside = enBlock.slice(enBlock.indexOf('{') + 1, enBlock.lastIndexOf('}'));
					const indentMatch = enInside.match(/\n([ \t]+)[a-zA-Z0-9_]+:/);
					const indent = indentMatch ? indentMatch[1] : '\t\t';
					const indentEsc = indent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					const entryRe = new RegExp(
						`\\n${indentEsc}([a-zA-Z0-9_]+):([\\s\\S]*?)(?=\\n${indentEsc}[a-zA-Z0-9_]+:|\\n[\\ \\t]*\\}|$)`,
						'g'
					);
					global.enKeyValues = {};
					let mm;
					while ((mm = entryRe.exec(enInside)) !== null) {
						const key = mm[1];
						const val = mm[2].trim().replace(/,+$/, '');
						global.enKeyValues[key] = val.endsWith(',') ? val : val;
					}
					// Replace en first so subsequent locale scans see stable ordering
					const sortedEn = sortSection(enBlock);
					output = output.slice(0, enMatch.index) + sortedEn + output.slice(enBal.end + 1);
				}
			}
		}

		// Now process all other locales present
		for (const locale of others) {
			// Re-find block fresh in the latest output each iteration
			const langNow = findlanguageBlock(output);
			if (!langNow) break;
			const sectionRe = new RegExp(`\n[ \t]*${escapeRegExp(locale)}:\\s*\\{`);
			const sectionMatch = output.slice(langNow.start, langNow.end + 1).match(sectionRe);
			if (!sectionMatch) continue;
			const absStart = output.indexOf(sectionMatch[0], langNow.start);
			const braceIdx = output.indexOf('{', absStart);
			const secBal = findBalancedBlock(output, braceIdx);
			if (!secBal) continue;
			const section = output.slice(absStart, secBal.end + 1);
			const sorted = sortSection(section);
			output = output.slice(0, absStart) + sorted + output.slice(secBal.end + 1);
		}
	}

	if (output !== original) {
		if (CHECK_ONLY) {
			console.error('language.ts needs sorting');
			process.exit(1);
		}
		fs.writeFileSync(FILE, output);
		console.log('language.ts sorted');
	} else {
		console.log('language.ts already sorted');
	}
}

run();
