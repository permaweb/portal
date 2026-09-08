import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

const sources = new Map();
for (const [name, path] of [
	['types', '../src/helpers/types.ts'],
	['editable', '../src/components/atoms/ContentEditable/ContentEditable.tsx'],
	['media', '../src/apps/editor/components/molecules/ArticleBlock/CustomBlocks/MediaBlock/MediaBlock.tsx'],
]) {
	sources.set(
		name,
		ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
				jsx: ts.JsxEmit.React,
				esModuleInterop: true,
			},
		}).outputText
	);
}

// Mount the actual media and caption components with deterministic hooks and a
// minimal editable DOM element, recording focus rather than requiring a browser.
function runtime(caption) {
	const focused = [];
	let active;
	const fiber = () => ({ hooks: [], cursor: 0, effects: [], dirty: true });
	const parent = fiber();
	let child = null;
	let tree;
	const sameDeps = (a, b) => a && b && a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
	const React = {
		forwardRef: (component) => component,
		useImperativeHandle() {},
		createElement: (type, props, ...children) => {
			if (typeof type === 'string' && props?.ref && !props.ref.current) {
				props.ref.current = { innerHTML: '', focus: () => focused.push(type) };
			}
			return { type, props: { ...props, children } };
		},
		useRef: (initial) => {
			const index = active.cursor++;
			if (!active.hooks[index]) active.hooks[index] = { current: initial };
			return active.hooks[index];
		},
		useState: (initial) => {
			const owner = active;
			const index = owner.cursor++;
			if (!owner.hooks[index]) {
				const slot = { value: initial };
				slot.set = (next) => {
					const value = typeof next === 'function' ? next(slot.value) : next;
					if (!Object.is(value, slot.value)) {
						slot.value = value;
						owner.dirty = true;
					}
				};
				owner.hooks[index] = slot;
			}
			return [owner.hooks[index].value, owner.hooks[index].set];
		},
		useEffect: (callback, deps) => {
			const index = active.cursor++;
			const previous = active.hooks[index];
			if (!previous || !sameDeps(previous.deps, deps)) {
				active.hooks[index] = { deps };
				active.effects.push(callback);
			}
		},
	};
	const context = vm.createContext({
		URL,
		document: { createRange: () => ({ selectNodeContents() {}, collapse() {} }) },
		window: { getSelection: () => ({ removeAllRanges() {}, addRange() {} }) },
	});
	const modules = new Map();
	function load(name) {
		if (modules.has(name)) return modules.get(name);
		const exports = {};
		modules.set(name, exports);
		const require = (specifier) => {
			if (specifier === 'react') return React;
			if (specifier === 'helpers/types') return load('types');
			if (specifier === 'components/atoms/ContentEditable') return { ContentEditable: load('editable').default };
			if (specifier === 'helpers/config') return { ICONS: {}, UPLOAD: {} };
			if (specifier === 'helpers/utils') return { checkValidAddress: (value) => /^[\w-]{43}$/.test(value) };
			if (specifier === 'hooks/useUploadCost') return { useUploadCost: () => ({ calculateUploadCost() {} }) };
			if (specifier === 'providers/ArweaveProvider') return { useArweaveProvider: () => ({}) };
			if (specifier === 'providers/PermawebProvider') return { usePermawebProvider: () => ({}) };
			if (specifier === 'editor/providers/PortalProvider') return { usePortalProvider: () => ({}) };
			if (specifier === 'providers/NotificationProvider') return { useNotifications: () => ({ addNotification() {} }) };
			if (specifier === 'providers/LanguageProvider') {
				return { useLanguageProvider: () => ({ current: 'en', object: { en: { addCaption: 'Add caption' } } }) };
			}
			if (specifier === './styles') return new Proxy({}, { get: (_, key) => String(key) });
			return {};
		};
		vm.runInContext(`(function(require, exports) { ${sources.get(name)}\n})`, context)(require, exports);
		return exports;
	}
	const MediaBlock = load('media').default;
	const ContentEditable = load('editable').default;
	const props = {
		type: 'image',
		content: '<img src="https://arweave.net/image">',
		data: {
			url: 'https://arweave.net/qw53YolzHuDwEk3DMJkw5HSpT7bwEj0OQKgF6SSiEX0',
			caption,
			alignment: 'portal-media-column',
			mediaAlign: 'center',
		},
		onChange() {},
	};
	function find(node, predicate) {
		if (Array.isArray(node)) return node.map((entry) => find(entry, predicate)).find(Boolean);
		if (!node || typeof node !== 'object') return null;
		if (predicate(node)) return node;
		return find(node.props?.children, predicate);
	}
	function render(owner, component, props) {
		active = owner;
		owner.cursor = 0;
		owner.effects = [];
		owner.dirty = false;
		const result = component(props);
		for (const effect of owner.effects) effect();
		return result;
	}
	function flush() {
		for (let iteration = 0; iteration < 10; iteration++) {
			if (parent.dirty) tree = render(parent, MediaBlock, props);
			const editable = find(tree, (node) => node.type === ContentEditable);
			if (editable) {
				if (!child) child = fiber();
				render(child, ContentEditable, editable.props);
			} else child = null;
			if (!parent.dirty) return;
		}
		throw new Error('MediaBlock did not settle');
	}
	flush();
	return {
		focused,
		addCaption() {
			const button = find(tree, (node) => node.type === 'p' && node.props.children.includes('Add caption'));
			assert.ok(button, 'Add caption control must be available');
			button.props.onClick();
			flush();
		},
	};
}

test('loading an imported image with an empty caption never steals focus', () => {
	assert.deepEqual(runtime('').focused, []);
});

test('loading an image with an existing caption never steals focus', () => {
	assert.deepEqual(runtime('Diagram of the browser query architecture').focused, []);
});

test('explicitly adding a caption still focuses its editable text', () => {
	const media = runtime(null);
	assert.deepEqual(media.focused, []);
	media.addCaption();
	assert.deepEqual(media.focused, ['p']);
});
