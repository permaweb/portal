#!/usr/bin/env node
/*
 Sort keys inside src/helpers/language/*.ts for each locale file.
 - Stable preserves values intact
 - Maintains original indentation and spacing
 - --check exits with code 1 if changes would be made
*/
const fs = require('fs');
const path = require('path');

const LANG_DIR = path.join(__dirname, '..', 'src', 'helpers', 'language');
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

function findExportBlock(src) {
	const decl = src.match(/export\s+const\s+\w+\s*=\s*\{/);
	if (!decl) return null;
	const braceIdx = src.indexOf('{', decl.index);
	const bal = findBalancedBlock(src, braceIdx);
	if (!bal) return null;
	return { start: decl.index, end: bal.end };
}

function extractKeyValues(content) {
	const braceStart = content.indexOf('{');
	if (braceStart < 0) return {};
	const bal = findBalancedBlock(content, braceStart);
	if (!bal) return {};
	const inside = content.slice(bal.start + 1, bal.end);

	const indentMatch = inside.match(/\n([ \t]+)[a-zA-Z0-9_]+:/);
	const indent = indentMatch ? indentMatch[1] : '\t';
	const indentEsc = indent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const entryRe = new RegExp(
		`\\n${indentEsc}([a-zA-Z0-9_]+):([\\s\\S]*?)(?=\\n${indentEsc}[a-zA-Z0-9_]+:|\\n[\\ \\t]*\\}|$)`,
		'g'
	);

	const keyValues = {};
	let m;
	while ((m = entryRe.exec(inside)) !== null) {
		const key = m[1];
		const val = m[2].trim().replace(/,+$/, '');
		keyValues[key] = val;
	}
	return keyValues;
}

function sortExportObject(content, isEnglish, enKeyValues) {
	const braceStart = content.indexOf('{');
	if (braceStart < 0) return content;
	const bal = findBalancedBlock(content, braceStart);
	if (!bal) return content;
	const before = content.slice(0, bal.start + 1);
	let inside = content.slice(bal.start + 1, bal.end);
	const after = content.slice(bal.end);

	const indentMatch = inside.match(/\n([ \t]+)[a-zA-Z0-9_]+:/);
	const indent = indentMatch ? indentMatch[1] : '\t';
	const indentEsc = indent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const entryRe = new RegExp(
		`(\\n${indentEsc}[a-zA-Z0-9_]+:[\\s\\S]*?)(?=\\n${indentEsc}[a-zA-Z0-9_]+:|\\n[\\ \\t]*\\}|$)`,
		'g'
	);
	const keyRe = new RegExp(`\\n${indentEsc}([a-zA-Z0-9_]+):`);

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
	if (entries.length === 0) return content;

	const existingKeys = new Set(entries.map((e) => e.key));

	let headerBlock = '';
	if (!isEnglish && enKeyValues) {
		const enKeys = Object.keys(enKeyValues);
		const missing = enKeys.filter((k) => !existingKeys.has(k));
		if (missing.length > 0) {
			missing.sort((a, b) => a.localeCompare(b));
			const missingEntries = missing
				.map((k) => {
					const val = enKeyValues[k];
					return `\n${indent}${k}: ${val}${val.endsWith(',') ? '' : ','}`;
				})
				.join('');
			headerBlock = `\n${indent}// === UNTRANSLATED START ===\n${indent}// TODO: translate${missingEntries}\n${indent}// === UNTRANSLATED END ===`;
		}
	}

	entries.sort((a, b) => a.key.localeCompare(b.key));
	const sortedInside = entries.map((e) => e.chunk).join('');
	return before + headerBlock + sortedInside + after;
}

function run() {
	if (!fs.existsSync(LANG_DIR)) {
		console.error(`Language directory not found: ${LANG_DIR}`);
		process.exit(1);
	}

	const files = fs.readdirSync(LANG_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
	if (files.length === 0) {
		console.log('No language files found');
		return;
	}

	const enFile = 'en.ts';
	const otherFiles = files.filter((f) => f !== enFile).sort();
	const orderedFiles = files.includes(enFile) ? [enFile, ...otherFiles] : files;

	let enKeyValues = null;
	if (files.includes(enFile)) {
		const enPath = path.join(LANG_DIR, enFile);
		const enContent = readFileSafe(enPath);
		enKeyValues = extractKeyValues(enContent);
	}

	let needsSorting = false;
	const results = [];

	for (const file of orderedFiles) {
		const filePath = path.join(LANG_DIR, file);
		const original = readFileSafe(filePath);
		const exportBlock = findExportBlock(original);

		if (!exportBlock) {
			console.warn(`No export statement found in ${file}`);
			continue;
		}

		const isEnglish = file === enFile;
		const sorted = sortExportObject(original, isEnglish, enKeyValues);

		if (sorted !== original) {
			needsSorting = true;
			if (!CHECK_ONLY) {
				fs.writeFileSync(filePath, sorted);
				results.push(`${file} sorted`);
			} else {
				results.push(`${file} needs sorting`);
			}
		} else {
			results.push(`${file} already sorted`);
		}
	}

	results.forEach((r) => console.log(r));

	if (needsSorting && CHECK_ONLY) {
		console.error('\nLanguage files need sorting');
		process.exit(1);
	}
}

run();
