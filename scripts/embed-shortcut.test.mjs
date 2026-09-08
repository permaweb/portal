import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const source = ts.transpileModule(
	await readFile(
		new URL('../src/apps/editor/components/molecules/ArticleBlocks/useArticleBlockShortcuts.ts', import.meta.url),
		'utf8'
	),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }
).outputText;

function eventTarget() {
	const listeners = [];
	return {
		listeners,
		addEventListener(type, callback, capture = false) {
			listeners.push({ type, callback, capture });
		},
		removeEventListener(type, callback, capture = false) {
			const index = listeners.findIndex(
				(listener) => listener.type === type && listener.callback === callback && listener.capture === capture
			);
			if (index >= 0) listeners.splice(index, 1);
		},
		emit(type, event, capture = false) {
			for (const listener of [...listeners]) {
				if (listener.type === type && listener.capture === capture) listener.callback(event);
			}
		},
	};
}

function runtime() {
	let now = 1000;
	let dialogOpen = false;
	const document = eventTarget();
	document.querySelector = () => (dialogOpen ? {} : null);
	const window = eventTarget();
	const sameDependencies = (before, after) =>
		before && before.length === after.length && before.every((value, index) => Object.is(value, after[index]));

	function mount(initialOptions = {}) {
		const hooks = [];
		const added = [];
		let options = { addBlock: (type) => added.push(type), ...initialOptions };
		let cursor = 0;
		let effects = [];
		const React = {
			useRef(initial) {
				const index = cursor++;
				if (!hooks[index]) hooks[index] = { current: initial };
				return hooks[index];
			},
			useEffect(callback, dependencies) {
				const index = cursor++;
				const previous = hooks[index];
				if (!previous || !sameDependencies(previous.dependencies, dependencies)) {
					hooks[index] = { dependencies, cleanup: previous?.cleanup };
					effects.push(() => {
						hooks[index].cleanup?.();
						hooks[index].cleanup = callback();
					});
				}
			},
		};
		const exports = {};
		vm.runInNewContext(source, {
			exports,
			document,
			window,
			Date: { now: () => now },
			require(name) {
				if (name === 'react') return React;
				if (name === 'helpers/types') return { ArticleBlockEnum: new Proxy({}, { get: (_target, key) => key }) };
				throw new Error(`Unexpected module: ${name}`);
			},
		});
		function render(patch = {}) {
			options = { ...options, ...patch };
			cursor = 0;
			effects = [];
			exports.useArticleBlockShortcuts(options);
			for (const effect of effects) effect();
		}
		render();
		return {
			added,
			render,
			unmount() {
				for (const hook of hooks) hook.cleanup?.();
			},
		};
	}
	function press(input) {
		const event = {
			key: 'e',
			ctrlKey: false,
			altKey: false,
			metaKey: false,
			repeat: false,
			isComposing: false,
			defaultPrevented: false,
			preventDefault() {
				this.defaultPrevented = true;
			},
			...input,
		};
		window.emit('keydown', event, true);
		document.emit('keydown', event, true);
		document.emit('keydown', event);
		window.emit('keydown', event);
		return event;
	}
	return {
		mount,
		press,
		document,
		window,
		prefix: () => press({ key: '/', ctrlKey: true }),
		advance: (milliseconds) => (now += milliseconds),
		setDialogOpen: (open) => (dialogOpen = open),
	};
}

test('Ctrl+/ then E inserts an embed with Control held or released and accepts uppercase E', () => {
	for (const input of [{ key: 'e' }, { key: 'e', ctrlKey: true }, { key: 'E', ctrlKey: true, shiftKey: true }]) {
		const app = runtime();
		const editor = app.mount();
		assert.equal(app.prefix().defaultPrevented, true);
		assert.equal(app.press(input).defaultPrevented, true);
		assert.deepEqual(editor.added, ['Embed']);
		app.press(input);
		assert.deepEqual(editor.added, ['Embed']);
	}
});

test('ordinary E typing and standalone Ctrl+E do not insert an embed', () => {
	const app = runtime();
	const editor = app.mount();
	assert.equal(app.press({ key: 'e' }).defaultPrevented, false);
	assert.equal(app.press({ key: 'e', ctrlKey: true }).defaultPrevented, false);
	assert.deepEqual(editor.added, []);
});

test('existing block shortcuts remain available and claim Ctrl+P before preview bubble listeners', () => {
	const app = runtime();
	const editor = app.mount();
	let previews = 0;
	app.document.addEventListener('keydown', (event) => {
		if (!event.defaultPrevented && event.ctrlKey && event.key === 'p') previews++;
	});
	const shortcuts = {
		1: 'Header1',
		2: 'Header2',
		3: 'Header3',
		4: 'Header4',
		5: 'Header5',
		6: 'Header6',
		p: 'Paragraph',
		q: 'Quote',
		c: 'Code',
		n: 'OrderedList',
		b: 'UnorderedList',
		i: 'Image',
		v: 'Video',
	};
	for (const key of Object.keys(shortcuts)) {
		app.prefix();
		app.press({ key, ctrlKey: true });
	}
	assert.deepEqual(editor.added, Object.values(shortcuts));
	assert.equal(previews, 0);
	app.press({ key: 'p', ctrlKey: true });
	assert.equal(previews, 1);
});

test('inline block replacement takes priority over global insertion regardless of mount order', () => {
	for (const inlineFirst of [false, true]) {
		const app = runtime();
		const first = app.mount({ inline: inlineFirst });
		const second = app.mount({ inline: !inlineFirst });
		app.prefix();
		app.press({ key: 'e' });
		assert.deepEqual((inlineFirst ? first : second).added, ['Embed']);
		assert.deepEqual((inlineFirst ? second : first).added, []);
	}
});

test('duplicate picker listeners consume the chord only once', () => {
	const app = runtime();
	const first = app.mount();
	const second = app.mount();
	app.prefix();
	app.press({ key: 'e' });
	assert.deepEqual(first.added, ['Embed']);
	assert.deepEqual(second.added, []);
});

test('a rerender preserves a pending chord and calls the latest insertion handler', () => {
	const app = runtime();
	const editor = app.mount();
	const updated = [];
	app.prefix();
	editor.render({ addBlock: (type) => updated.push(type) });
	app.press({ key: 'e' });
	assert.deepEqual(updated, ['Embed']);
	assert.deepEqual(editor.added, []);
	assert.equal(app.document.listeners.length, 1);
});

test('expired, interrupted, and window-blurred chords do not consume later typing', () => {
	for (const interrupt of [
		(app) => app.advance(2001),
		(app) => app.press({ key: 'Escape' }),
		(app) => app.press({ key: 'x' }),
		(app) => app.window.emit('blur', {}),
	]) {
		const app = runtime();
		const editor = app.mount();
		app.prefix();
		interrupt(app);
		assert.equal(app.press({ key: 'e' }).defaultPrevented, false);
		assert.deepEqual(editor.added, []);
	}
});

test('loading, modal dialogs, composing, handled, or unrelated modified keys prevent insertion', () => {
	for (const input of [
		{ isComposing: true },
		{ defaultPrevented: true },
		{ altKey: true },
		{ metaKey: true },
		{ repeat: true },
	]) {
		const app = runtime();
		const editor = app.mount();
		app.prefix();
		app.press({ key: 'e', ...input });
		assert.deepEqual(editor.added, []);
	}
	const app = runtime();
	const editor = app.mount();
	app.prefix();
	editor.render({ disabled: true });
	app.press({ key: 'e' });
	editor.render({ disabled: false });
	app.prefix();
	app.setDialogOpen(true);
	app.press({ key: 'e' });
	app.setDialogOpen(false);
	app.press({ key: 'e' });
	assert.deepEqual(editor.added, []);
});

test('disabled picker mounting and unmount cleanup leave no shortcut listeners behind', () => {
	const app = runtime();
	const editor = app.mount({ enabled: false });
	assert.equal(app.document.listeners.length, 0);
	editor.render({ enabled: true });
	assert.equal(app.document.listeners.length, 1);
	app.prefix();
	editor.unmount();
	assert.equal(app.document.listeners.length, 0);
	assert.equal(app.window.listeners.length, 0);
	app.press({ key: 'e' });
	assert.deepEqual(editor.added, []);
});
