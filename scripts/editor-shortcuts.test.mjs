import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

function compile(source) {
	return ts.transpileModule(source, {
		fileName: 'component.tsx',
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			jsx: ts.JsxEmit.React,
			esModuleInterop: true,
		},
	}).outputText;
}

const toolbarText = await readFile(
	new URL(
		'../src/apps/editor/components/organisms/PostEditor/ArticleEditor/ArticleToolbar/ArticleToolbar.tsx',
		import.meta.url
	),
	'utf8'
);
const toolbarFile = ts.createSourceFile(
	'ArticleToolbar.tsx',
	toolbarText,
	ts.ScriptTarget.Latest,
	true,
	ts.ScriptKind.TSX
);
const toolbarComponent = toolbarFile.statements.find(
	(node) => ts.isFunctionDeclaration(node) && node.name?.text === 'ArticleToolbar'
);
const toolbarReturn = toolbarComponent.body.statements.findLast((node) => ts.isReturnStatement(node));
// Run the actual hooks and handlers, exposing state in place of the final child UI.
const toolbarSource = compile(
	`${toolbarText.slice(0, toolbarReturn.getStart(toolbarFile))}
	return { previewOpen, previewModal, showDropdown, setShowDropdown, titleRef, getOptionsDropdown };
}`
);
const postSource = compile(await readFile(new URL('../src/apps/editor/store/post.ts', import.meta.url), 'utf8'));
const blockShortcutsSource = compile(
	await readFile(
		new URL('../src/apps/editor/components/molecules/ArticleBlocks/useArticleBlockShortcuts.ts', import.meta.url),
		'utf8'
	)
);
const typesSource = compile(await readFile(new URL('../src/helpers/types.ts', import.meta.url), 'utf8'));

function eventTarget() {
	const listeners = new Map();
	return {
		listeners,
		activeElement: {},
		querySelector: () => null,
		addEventListener(type, handler, options) {
			if (!listeners.has(type)) listeners.set(type, new Map());
			listeners.get(type).set(handler, options === true || options?.capture === true);
		},
		removeEventListener(type, handler) {
			listeners.get(type)?.delete(handler);
		},
	};
}

function runtime() {
	const hooks = [];
	const document = eventTarget();
	const browser = eventTarget();
	const addedBlocks = [];
	const updates = [];
	let cursor = 0;
	let effects = [];
	let dirty = true;
	let output;
	let state;
	const portalProvider = { current: { id: 'portal-id', assets: [], users: [], requests: [] }, permissions: {} };
	const sameDependencies = (before, after) =>
		before && after && before.length === after.length && before.every((value, index) => Object.is(value, after[index]));
	const React = {
		Fragment: 'fragment',
		createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
		useState: (initial) => {
			const index = cursor++;
			if (!hooks[index]) {
				const slot = { value: typeof initial === 'function' ? initial() : initial };
				slot.set = (next) => {
					const value = typeof next === 'function' ? next(slot.value) : next;
					if (!Object.is(value, slot.value)) {
						slot.value = value;
						dirty = true;
					}
				};
				hooks[index] = slot;
			}
			return [hooks[index].value, hooks[index].set];
		},
		useRef: (initial) => {
			const index = cursor++;
			if (!hooks[index]) hooks[index] = { current: initial };
			return hooks[index];
		},
		useEffect: (callback, dependencies) => {
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
		useMemo: (factory, dependencies) => {
			const index = cursor++;
			if (!hooks[index] || !sameDependencies(hooks[index].dependencies, dependencies)) {
				hooks[index] = { dependencies, value: factory() };
			}
			return hooks[index].value;
		},
	};
	React.useCallback = (callback, dependencies) => React.useMemo(() => callback, dependencies);
	const props = {
		handleInitAddBlock: (event) => addedBlocks.push(event.key),
		addBlock: (type) => addedBlocks.push(type),
		viewMode: 'new',
	};
	const context = vm.createContext({ document, window: browser, setTimeout, clearTimeout });
	const modules = {
		react: React,
		'react-redux': { useDispatch: () => dispatch, useSelector: (selector) => selector({ currentPost: state }) },
		'react-router-dom': { useParams: () => ({}) },
		'react-svg': { ReactSVG: 'svg' },
		'engine-lite/data': { createLitePostPreview: (asset) => asset },
		'engine-lite/preview': { EngineLitePostPreview: 'post-preview' },
		lodash: { debounce: (callback) => callback },
		'editor/components/molecules/ArticleBlocks': { ArticleBlocks: 'article-blocks' },
		'editor/providers/PortalProvider': { usePortalProvider: () => portalProvider },
		'components/atoms/Button': { Button: 'button' },
		'components/atoms/IconButton': { IconButton: 'icon-button' },
		'components/atoms/Modal': { Modal: 'preview-modal' },
		'components/atoms/Portal': { Portal: 'portal' },
		'components/atoms/Tabs': { Tabs: 'tabs' },
		'helpers/config': { DOM: {}, ICONS: {}, STYLING: { cutoffs: { desktop: '1100' } } },
		'helpers/types': { ArticleStatusEnum: { Draft: 'draft' } },
		'helpers/utils': { debugLog() {}, hasUnsavedPostChanges: () => true, isMac: false },
		'helpers/window': { checkWindowCutoff: () => true, hideDocumentBody() {}, showDocumentBody() {} },
		'providers/LanguageProvider': { useLanguageProvider: () => ({ current: 'en', object: { en: {} } }) },
		'providers/PermawebProvider': { usePermawebProvider: () => ({ profile: { id: 'owner' } }) },
		'../ArticlePost': { ArticlePost: 'article-post' },
		'./styles': {},
	};
	function load(source) {
		const exports = {};
		vm.runInContext(`(function(require, exports) { ${source}\n})`, context)((name) => {
			assert.ok(name in modules, `Unexpected module: ${name}`);
			return modules[name];
		}, exports);
		return exports;
	}
	const post = load(postSource);
	modules['helpers/types'] = load(typesSource);
	modules['editor/components/molecules/ArticleBlocks'].useArticleBlockShortcuts =
		load(blockShortcutsSource).useArticleBlockShortcuts;
	modules['editor/store/post'] = post;
	state = {
		...post.initStateCurrentPost,
		data: {
			...post.initStateCurrentPost.data,
			title: 'Current draft',
			content: [{ id: 'paragraph', content: 'Unsaved text' }],
		},
		editor: {
			...post.initStateCurrentPost.editor,
			markup: { bold: true, italic: false, underline: false, strikethrough: false },
		},
	};
	const toolbar = load(toolbarSource).default;
	function dispatch(action) {
		if (typeof action === 'function') return action(dispatch);
		updates.push(action);
		state = post.currentPost(state, action);
		dirty = true;
	}
	function render() {
		for (let iteration = 0; dirty && iteration < 30; iteration++) {
			dirty = false;
			cursor = 0;
			effects = [];
			output = toolbar(props);
			for (const effect of effects) effect();
		}
		assert.equal(dirty, false, 'Toolbar must settle');
	}
	function press(input) {
		const event = {
			key: 'p',
			ctrlKey: false,
			metaKey: false,
			altKey: false,
			shiftKey: false,
			repeat: false,
			isComposing: false,
			defaultPrevented: false,
			preventDefault() {
				this.defaultPrevented = true;
			},
			...input,
		};
		// Native keyboard events reach capture listeners before the toolbar's bubble handler.
		for (const target of [browser, document]) {
			for (const [listener, capture] of target.listeners.get('keydown') || []) {
				if (capture) listener(event);
			}
		}
		for (const target of [document, browser]) {
			for (const [listener, capture] of target.listeners.get('keydown') || []) {
				if (!capture) listener(event);
			}
		}
		render();
		return event;
	}
	return {
		document,
		browser,
		addedBlocks,
		updates,
		render,
		press,
		get output() {
			return output;
		},
		get state() {
			return state;
		},
		setLoading(active) {
			dispatch(post.currentPostUpdate({ field: 'loading', value: { active, message: null } }));
			render();
		},
		setPortal(current) {
			portalProvider.current = current;
			dirty = true;
			render();
		},
		unmount() {
			for (const hook of hooks) hook.cleanup?.();
		},
	};
}

function findElement(node, type) {
	if (!node || typeof node !== 'object') return null;
	if (node.type === type) return node;
	for (const child of Array.isArray(node) ? node : node.props?.children || []) {
		const found = findElement(child, type);
		if (found) return found;
	}
	return null;
}

test('Ctrl+P opens the current unsaved post in the existing preview modal and suppresses printing', () => {
	const app = runtime();
	app.render();
	app.output.setShowDropdown(true);
	app.render();
	const panelOpen = app.state.editor.panelOpen;
	const event = app.press({ ctrlKey: true });
	assert.equal(event.defaultPrevented, true);
	assert.equal(app.output.previewOpen, true);
	assert.equal(app.output.showDropdown, false);
	assert.equal(app.output.previewModal.type, 'preview-modal');
	const preview = findElement(app.output.previewModal, 'post-preview');
	assert.equal(preview.props.post.name, 'Current draft');
	assert.equal(preview.props.post.metadata.content[0].content, 'Unsaved text');
	assert.equal(app.state.editor.panelOpen, panelOpen);
	assert.equal(app.state.editor.markup.bold, true);
	assert.equal(app.updates.length, 0);
});

test('Ctrl+K toggles the toolkit while Ctrl+L still toggles layout', () => {
	const app = runtime();
	app.render();
	app.press({ key: 'k', ctrlKey: true });
	assert.equal(app.state.editor.panelOpen, false);
	assert.equal(app.output.previewOpen, false);
	app.press({ key: 'k', ctrlKey: true });
	assert.equal(app.state.editor.panelOpen, true);
	app.press({ key: 'l', ctrlKey: true });
	assert.equal(app.state.editor.blockEditMode, false);
	app.press({ key: 'l', ctrlKey: true });
	assert.equal(app.state.editor.blockEditMode, true);
});

test('ordinary typing and unrelated markup shortcuts do not open preview or toggle the toolkit', () => {
	const app = runtime();
	app.render();
	for (const input of [
		{ key: 'p' },
		{ key: 'K', ctrlKey: true, shiftKey: true },
		{ key: 'P', ctrlKey: true, shiftKey: true },
		{ key: 'b', ctrlKey: true },
		{ key: 'i', metaKey: true },
	]) {
		assert.equal(app.press(input).defaultPrevented, false);
	}
	assert.equal(app.output.previewOpen, false);
	assert.equal(app.state.editor.panelOpen, true);
	assert.equal(app.updates.length, 0);
});

test('repeated, composing, handled, Alt-modified, and Meta-modified shortcut events are ignored', () => {
	for (const guard of [
		{ repeat: true },
		{ isComposing: true },
		{ defaultPrevented: true },
		{ altKey: true },
		{ metaKey: true },
	]) {
		const app = runtime();
		app.render();
		app.press({ ctrlKey: true, ...guard });
		assert.equal(app.output.previewOpen, false);
		assert.equal(app.state.editor.panelOpen, true);
		assert.equal(app.updates.length, 0);
	}
});

test('preview waits until loading finishes and a portal is available', () => {
	const app = runtime();
	app.render();
	app.setLoading(true);
	app.press({ ctrlKey: true });
	assert.equal(app.output.previewOpen, false);
	app.setLoading(false);
	app.setPortal(null);
	app.press({ ctrlKey: true });
	assert.equal(app.output.previewOpen, false);
	app.setPortal({ id: 'loaded-portal' });
	app.press({ ctrlKey: true });
	assert.equal(app.output.previewOpen, true);
});

test('Ctrl+P does not open preview over an existing modal', () => {
	const app = runtime();
	app.render();
	app.document.querySelector = () => ({});
	assert.equal(app.press({ ctrlKey: true }).defaultPrevented, true);
	assert.equal(app.output.previewOpen, false);
});

test('Ctrl+/ then P adds a paragraph without opening preview even with Ctrl held', () => {
	const app = runtime();
	app.render();
	assert.equal(app.press({ key: '/', ctrlKey: true }).defaultPrevented, true);
	assert.equal(app.press({ key: 'p', ctrlKey: true }).defaultPrevented, true);
	assert.deepEqual(app.addedBlocks, ['paragraph']);
	assert.equal(app.output.previewOpen, false);
	app.press({ key: 'p', ctrlKey: true });
	assert.equal(app.output.previewOpen, true);
});

test('Ctrl+/ then E adds an embed from the post tab with the toolkit closed', () => {
	const app = runtime();
	app.render();
	app.press({ key: 'k', ctrlKey: true });
	assert.equal(app.state.editor.panelOpen, false);
	app.press({ key: '/', ctrlKey: true });
	assert.equal(app.press({ key: 'e' }).defaultPrevented, true);
	assert.deepEqual(app.addedBlocks, ['embed']);
	assert.equal(app.output.previewOpen, false);
});

test('the preview menu advertises Ctrl+P', () => {
	const app = runtime();
	app.render();
	const menu = JSON.stringify(app.output.getOptionsDropdown());
	assert.ok(menu.includes('Control+p'));
	assert.ok(menu.includes('CTRL + P'));
	assert.ok(menu.includes('Control+k'));
	assert.ok(!menu.includes('Control+Shift+k'));
});

test('Enter, Tab, and ArrowDown still enter the first block from the title', () => {
	const app = runtime();
	app.render();
	app.output.titleRef.current = {};
	app.document.activeElement = app.output.titleRef.current;
	for (const key of ['Enter', 'Tab', 'ArrowDown']) {
		assert.equal(app.press({ key }).defaultPrevented, true);
	}
	assert.deepEqual(app.addedBlocks, ['Enter', 'Tab', 'ArrowDown']);
	assert.equal(app.output.previewOpen, false);
	app.document.activeElement = {};
	assert.equal(app.press({ key: 'Enter' }).defaultPrevented, false);
	assert.equal(app.addedBlocks.length, 3);
});

test('keyboard listener is replaced on updates and removed when the toolbar unmounts', () => {
	const app = runtime();
	app.render();
	assert.equal(app.document.listeners.get('keydown').size, 2);
	app.setLoading(true);
	app.setLoading(false);
	assert.equal(app.document.listeners.get('keydown').size, 2);
	app.unmount();
	assert.equal(app.document.listeners.get('keydown').size, 0);
	assert.equal(app.browser.listeners.get('resize').size, 0);
	app.press({ ctrlKey: true });
	assert.equal(app.output.previewOpen, false);
});
