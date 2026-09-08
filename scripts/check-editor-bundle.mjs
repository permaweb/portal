// Inspect an existing production output without starting a server or creating a build.
// Usage: node scripts/check-editor-bundle.mjs /path/to/editor/build
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { parseAst } from 'rollup/parseAst';

assert.ok(process.argv[2], 'Pass an existing editor build directory; this check never runs a build.');
const directory = path.resolve(process.argv[2]);
const assets = path.join(directory, 'assets');
const chunks = new Map();

// Function and class bodies do not run merely because their containing module runs.
function walkExecuted(node, visit, parent) {
	if (!node || typeof node !== 'object') return;
	if (/Function|Class/.test(node.type || '')) return;
	visit(node, parent);
	for (const [key, value] of Object.entries(node)) {
		if (key === 'start' || key === 'end') continue;
		if (Array.isArray(value)) value.forEach((child) => walkExecuted(child, visit, node));
		else if (value && typeof value === 'object') walkExecuted(value, visit, node);
	}
}

for (const filename of readdirSync(assets).filter((name) => name.endsWith('.js'))) {
	const source = readFileSync(path.join(assets, filename), 'utf8');
	const ast = parseAst(source);
	const imports = ast.body
		.filter((node) => node.source?.value?.startsWith('./'))
		.map((node) => path.basename(node.source.value));
	const bindings = ast.body.flatMap((node) => (node.type === 'VariableDeclaration' ? node.declarations : []));
	const manager = bindings.find(
		(node) => node.init && source.slice(node.init.start, node.init.end).includes('__portalGatewayRequestManager')
	);
	const installer = bindings.find(
		(node) =>
			node.init?.type === 'ArrowFunctionExpression' &&
			node.init.body?.type === 'CallExpression' &&
			node.init.body.callee.object?.name === manager?.id.name &&
			node.init.body.callee.property?.name === 'install'
	);
	const installs = [];
	const captures = [];
	walkExecuted(ast, (node, parent) => {
		if (installer && node.type === 'CallExpression' && node.callee.name === installer.id.name) {
			installs.push(node.start);
		}
		const globalFetch =
			node.type === 'MemberExpression' &&
			['window', 'globalThis', 'self'].includes(node.object?.name) &&
			node.property?.name === 'fetch';
		const nakedFetch =
			node.type === 'Identifier' &&
			node.name === 'fetch' &&
			!(parent?.type === 'MemberExpression' && parent.property === node) &&
			!(parent?.type === 'Property' && parent.key === node && !parent.shorthand) &&
			!(parent?.type === 'VariableDeclarator' && parent.id === node);
		if ((globalFetch || nakedFetch) && !(parent?.type === 'CallExpression' && parent.callee === node)) {
			captures.push(node.start);
		}
	});
	chunks.set(filename, { source, imports, installs, captures });
}

const html = readFileSync(path.join(directory, 'index.html'), 'utf8');
const entries = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+\.js)["']/g)].map((match) => path.basename(match[1]));
assert.ok(entries.length, 'No JavaScript entry found in index.html.');
const checked = new Set();
const active = new Set();
const evaluationOrder = [];

function visit(filename) {
	assert.ok(!active.has(filename), `Static JavaScript import cycle through ${filename}.`);
	if (checked.has(filename)) return;
	const chunk = chunks.get(filename);
	assert.ok(chunk, `Missing imported JavaScript file: ${filename}`);
	active.add(filename);
	chunk.imports.forEach(visit);
	active.delete(filename);
	checked.add(filename);
	evaluationOrder.push(filename);
}

entries.forEach(visit);
const startup = [...evaluationOrder];
// Check optional chunks for cycles and missing dependencies too.
chunks.forEach((_, filename) => visit(filename));
let installed = false;
const fetchCaptures = [];
const installation = [];
for (const filename of evaluationOrder) {
	const chunk = chunks.get(filename);
	const events = [
		...chunk.installs.map((offset) => ({ offset, type: 'install' })),
		...chunk.captures.map((offset) => ({ offset, type: 'capture' })),
	].sort((a, b) => a.offset - b.offset);
	for (const event of events) {
		if (event.type === 'install') {
			installed = true;
			installation.push({ filename, offset: event.offset });
		} else {
			assert.ok(installed, `${filename}:${event.offset} captures fetch before gateway pacing is installed.`);
			fetchCaptures.push({ filename, offset: event.offset });
		}
	}
}
assert.ok(installed, 'Gateway fetch installation was not found in the compiled module evaluation order.');
assert.ok(
	installation.some(({ filename }) => startup.includes(filename)),
	'Gateway fetch installation is deferred.'
);
assert.ok(fetchCaptures.length, 'No SDK fetch captures found; review the ordering check if the SDK output changed.');
assert.ok(chunks.size <= 6, `Editor has ${chunks.size} JS chunks; the request budget is 6.`);
assert.ok(startup.length <= 3, `Editor startup loads ${startup.length} JS chunks; the request budget is 3.`);
assert.ok(
	!startup.some((name) => /^(?:code-editor|wander)-/.test(name)),
	'Optional editors or wallets load at startup.'
);

const summarize = (filenames) => ({
	requests: filenames.length,
	bytes: filenames.reduce((total, filename) => total + Buffer.byteLength(chunks.get(filename).source), 0),
	gzipBytes: filenames.reduce((total, filename) => total + gzipSync(chunks.get(filename).source).length, 0),
	files: filenames,
});
console.log(
	JSON.stringify(
		{ startup: summarize(startup), total: summarize([...chunks.keys()]), installation, fetchCaptures },
		null,
		2
	)
);
