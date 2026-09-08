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

async function compileComponent(path, name, exposed) {
	const source = await readFile(new URL(path, import.meta.url), 'utf8');
	const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const component = file.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
	const output = component.body.statements.findLast((node) => ts.isReturnStatement(node));
	// Preserve the actual component hooks, event handlers, and modal JSX.
	return compile(`${source.slice(0, output.getStart(file))}return { ${exposed} };\n}`);
}

const [blockSource, editorSource, postText, utilsText, typesText] = await Promise.all([
	compileComponent(
		'../src/apps/editor/components/molecules/ArticleBlock/ArticleBlock.tsx',
		'ArticleBlock',
		'getElement, editableRef, selectedText, setSelectedText, showLinkModal, handleLinkModalOpen'
	),
	compileComponent(
		'../src/apps/editor/components/organisms/PostEditor/ArticleEditor/ArticleEditor.tsx',
		'ArticleEditor',
		'handleBlockChange'
	),
	readFile(new URL('../src/apps/editor/store/post.ts', import.meta.url), 'utf8'),
	readFile(new URL('../src/helpers/utils.ts', import.meta.url), 'utf8'),
	readFile(new URL('../src/helpers/types.ts', import.meta.url), 'utf8'),
]);
const utilsFile = ts.createSourceFile('utils.ts', utilsText, ts.ScriptTarget.Latest, true);
const validateUrl = utilsFile.statements.find(
	(node) => ts.isFunctionDeclaration(node) && node.name?.text === 'validateUrl'
);
const validateUrlSource = compile(validateUrl.getText(utilsFile));

function eventTarget() {
	const listeners = new Map();
	return {
		listeners,
		addEventListener(type, handler) {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type).add(handler);
		},
		removeEventListener(type, handler) {
			listeners.get(type)?.delete(handler);
		},
	};
}

function elements(tree, type) {
	if (!tree || typeof tree !== 'object') return [];
	if (Array.isArray(tree)) return tree.flatMap((child) => elements(child, type));
	return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}

function keyboardEvent(input = {}) {
	return {
		key: 'Enter',
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
		isComposing: false,
		nativeEvent: { isComposing: false },
		repeat: false,
		defaultPrevented: false,
		propagationStopped: false,
		preventDefault() {
			this.defaultPrevented = true;
		},
		stopPropagation() {
			this.propagationStopped = true;
		},
		...input,
	};
}

function runtime() {
	const document = eventTarget();
	const instances = [];
	const updates = [];
	const changedBlocks = [];
	const timers = new Map();
	const selectionHistory = [];
	let nextTimer = 0;
	let rendering;
	let dirty = true;
	let state;
	let blockInstance;
	const selectedNode = {};
	const editable = {
		...eventTarget(),
		innerHTML: 'before <strong>selected text</strong> after',
		contains: (node) => node === selectedNode || node === editable,
	};
	const savedRange = {
		collapsed: false,
		commonAncestorContainer: selectedNode,
		extractContents: () => ({ textContent: 'selected text', html: '<strong>selected text</strong>' }),
		insertNode(anchor) {
			editable.innerHTML = `before <a href="${anchor.href}" target="${anchor.target}" rel="${anchor.rel}">${anchor.html}</a> after`;
		},
		setStartAfter() {},
		collapse() {
			this.collapsed = true;
		},
	};
	const selection = {
		range: { cloneRange: () => savedRange },
		get rangeCount() {
			return this.range ? 1 : 0;
		},
		getRangeAt() {
			return this.range;
		},
		removeAllRanges() {
			this.range = null;
		},
		addRange(range) {
			selectionHistory.push(range);
			this.range = range;
		},
	};
	document.querySelector = () => (blockInstance?.output.showLinkModal ? {} : null);
	document.createElement = (tag) => {
		assert.equal(tag, 'a');
		return {
			html: '',
			setAttribute() {},
			set textContent(text) {
				this.html = text;
			},
			appendChild(fragment) {
				this.html = fragment.html;
			},
		};
	};
	const sameDependencies = (before, after) =>
		before && after && before.length === after.length && before.every((value, index) => Object.is(value, after[index]));
	const React = {
		Fragment: 'fragment',
		createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
		useRef(initial) {
			const index = rendering.cursor++;
			if (!rendering.hooks[index]) rendering.hooks[index] = { current: initial };
			return rendering.hooks[index];
		},
		useState(initial) {
			const index = rendering.cursor++;
			if (!rendering.hooks[index]) {
				const slot = { value: typeof initial === 'function' ? initial() : initial };
				slot.set = (next) => {
					const value = typeof next === 'function' ? next(slot.value) : next;
					if (!Object.is(value, slot.value)) {
						slot.value = value;
						dirty = true;
					}
				};
				rendering.hooks[index] = slot;
			}
			return [rendering.hooks[index].value, rendering.hooks[index].set];
		},
		useMemo(factory, dependencies) {
			const index = rendering.cursor++;
			if (!rendering.hooks[index] || !sameDependencies(rendering.hooks[index].dependencies, dependencies)) {
				rendering.hooks[index] = { dependencies, value: factory() };
			}
			return rendering.hooks[index].value;
		},
		useEffect(callback, dependencies) {
			const instance = rendering;
			const index = instance.cursor++;
			const previous = instance.hooks[index];
			if (!previous || !sameDependencies(previous.dependencies, dependencies)) {
				instance.hooks[index] = { dependencies, cleanup: previous?.cleanup };
				instance.effects.push(() => {
					instance.hooks[index].cleanup?.();
					instance.hooks[index].cleanup = callback();
				});
			}
		},
	};
	React.useCallback = (callback, dependencies) => React.useMemo(() => callback, dependencies);
	const context = vm.createContext({
		document,
		window: { getSelection: () => selection },
		setTimeout(callback) {
			timers.set(++nextTimer, callback);
			return nextTimer;
		},
		clearTimeout: (id) => timers.delete(id),
		console,
	});
	const modules = {
		react: React,
		'react-redux': { useDispatch: () => dispatch, useSelector: (selector) => selector({ currentPost: state }) },
		'react-router-dom': { useParams: () => ({}), useNavigate: () => () => {} },
		'react-svg': { ReactSVG: 'svg' },
		'@hello-pangea/dnd': {},
		'components/atoms/Button': { Button: 'button' },
		'components/atoms/ContentEditable': { ContentEditable: 'editable' },
		'components/atoms/FormField': { FormField: 'field' },
		'components/atoms/IconButton': { IconButton: 'icon-button' },
		'components/atoms/Modal': { Modal: 'modal' },
		'helpers/config': { ARTICLE_BLOCKS: {}, ICONS: {}, URLS: {} },
		'helpers/features': { IS_BASE_MODE: true },
		'helpers/utils': { debugLog() {}, checkValidAddress: () => true },
		'hooks/useScrollToTop': { useScrollToTop() {} },
		'providers/LanguageProvider': {
			useLanguageProvider: () => ({
				current: 'en',
				object: { en: { text: 'Text', url: 'URL', save: 'Save', cancel: 'Cancel' } },
			}),
		},
		'providers/PermawebProvider': { usePermawebProvider: () => ({}) },
		'editor/providers/PortalProvider': { usePortalProvider: () => ({ current: { id: 'portal' } }) },
		'wrappers/CloseHandler': { CloseHandler: 'close-handler' },
		'../ArticleBlocks': {},
		'../PageSection/TipsBlock': {},
		'./CustomBlocks/DividerBlock': {},
		'./CustomBlocks/EmbedBlock': { isSupportedEmbedUrl: () => false },
		'./CustomBlocks/HTMLBlock': {},
		'./CustomBlocks/MediaBlock': {},
		'./CustomBlocks/SpacerBlock': {},
		'./CustomBlocks/TableBlock': {},
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
	modules['helpers/types'] = load(compile(typesText));
	modules['helpers/utils'].validateUrl = load(validateUrlSource).validateUrl;
	const post = load(compile(postText));
	modules['editor/store/post'] = post;
	modules['editor/store/page'] = { currentPageUpdate: post.currentPostUpdate };
	const block = { id: 'block', type: 'paragraph', content: editable.innerHTML };
	state = {
		...post.initStateCurrentPost,
		data: { ...post.initStateCurrentPost.data, content: [block] },
		editor: { ...post.initStateCurrentPost.editor, focusedBlock: block, blockEditMode: false },
	};
	function dispatch(action) {
		if (typeof action === 'function') return action(dispatch);
		updates.push(action);
		state = post.currentPost(state, action);
		dirty = true;
	}
	const editor = load(editorSource).default;
	const editorInstance = { component: editor, props: {}, hooks: [], effects: [], cursor: 0 };
	blockInstance = {
		component: load(blockSource).default,
		props: {
			type: 'post',
			block,
			onChangeBlock(update) {
				changedBlocks.push(update);
				editorInstance.output.handleBlockChange(update);
			},
		},
		hooks: [],
		effects: [],
		cursor: 0,
	};
	instances.push(editorInstance, blockInstance);
	function render() {
		for (let iteration = 0; dirty && iteration < 30; iteration++) {
			dirty = false;
			for (const instance of instances) {
				rendering = instance;
				instance.cursor = 0;
				instance.effects = [];
				instance.output = instance.component(instance.props);
			}
			blockInstance.output.editableRef.current = editable;
			for (const instance of instances) for (const effect of instance.effects) effect();
		}
		assert.equal(dirty, false, 'Editor must settle');
	}
	function fields() {
		return elements(blockInstance.output.getElement(), 'field');
	}
	function buttons() {
		return elements(blockInstance.output.getElement(), 'button');
	}
	function backgroundPress(input) {
		const event = keyboardEvent(input);
		for (const handler of document.listeners.get('keydown') || []) handler(event);
		render();
		return event;
	}
	render();
	// Loading a new editor clears focus; emulate the user selecting this paragraph afterward.
	dispatch(post.currentPostUpdate({ field: 'focusedBlock', value: block }));
	render();
	return {
		changedBlocks,
		updates,
		selectionHistory,
		savedRange,
		backgroundPress,
		fields,
		buttons,
		get state() {
			return state;
		},
		get open() {
			return blockInstance.output.showLinkModal;
		},
		openLink() {
			blockInstance.output.setSelectedText('selected text');
			render();
			blockInstance.output.handleLinkModalOpen();
			render();
			// Focusing an input loses the document selection; saving must restore the cloned range.
			selection.range = null;
		},
		change(label, value) {
			fields()
				.find((field) => field.props.label === label)
				.props.onChange({ target: { value } });
			render();
		},
		press(label, input) {
			const event = keyboardEvent(input);
			fields()
				.find((field) => field.props.label === label)
				.props.onKeyDown(event);
			if (!event.propagationStopped) {
				for (const handler of document.listeners.get('keydown') || []) handler(event);
			}
			render();
			return event;
		},
		clickSave() {
			buttons()
				.find((button) => button.props.label === 'Save')
				.props.handlePress();
			render();
		},
	};
}

test('Enter in either link field saves once using the selection captured before input focus', () => {
	for (const label of ['URL', 'Text']) {
		const app = runtime();
		app.openLink();
		app.change('URL', 'https://example.com/article');
		if (label === 'Text') app.change('Text', 'Read the article');
		const event = app.press(label);
		assert.equal(event.defaultPrevented, true);
		assert.equal(event.propagationStopped, true);
		assert.equal(app.changedBlocks.length, 1);
		assert.equal(app.open, false);
		assert.equal(app.state.data.content.length, 1, 'Submitting a link must not add a paragraph');
		assert.equal(app.selectionHistory[0], app.savedRange);
		assert.match(app.changedBlocks[0].content, /<a href="https:\/\/example.com\/article"/);
		assert.ok(
			app.changedBlocks[0].content.includes(label === 'Text' ? 'Read the article' : '<strong>selected text</strong>')
		);
	}
});

test('empty and invalid URLs keep the dialog open without changing the post', () => {
	for (const url of ['', 'not a url', 'javascript:alert(1)']) {
		for (const label of ['URL', 'Text']) {
			const app = runtime();
			app.openLink();
			app.change('URL', url);
			assert.equal(app.buttons().find((button) => button.props.label === 'Save').props.disabled, true);
			app.press(label);
			assert.equal(app.open, true);
			assert.equal(app.changedBlocks.length, 0);
			assert.equal(app.state.data.content.length, 1);
			assert.equal(app.selectionHistory.length, 0);
			app.clickSave();
			assert.equal(app.open, true, 'The save handler must also reject invalid URLs');
		}
	}
});

test('the URL field receives focus and a valid URL enables Save', () => {
	const app = runtime();
	app.openLink();
	assert.equal(app.fields().find((field) => field.props.label === 'URL').props.autoFocus, true);
	app.change('URL', 'https://example.com');
	assert.equal(app.buttons().find((button) => button.props.label === 'Save').props.disabled, false);
});

test('repeated Enter and IME composition do not submit the link', () => {
	for (const input of [{ repeat: true }, { nativeEvent: { isComposing: true } }]) {
		const app = runtime();
		app.openLink();
		app.change('URL', 'https://example.com');
		const event = app.press('URL', input);
		assert.equal(app.open, true);
		assert.equal(app.changedBlocks.length, 0);
		assert.equal(app.state.data.content.length, 1);
		assert.equal(event.propagationStopped, true);
		assert.equal(event.defaultPrevented, !input.nativeEvent?.isComposing);
	}
});

test('dialog keyboard events never add background paragraphs or change block formatting', () => {
	const app = runtime();
	app.openLink();
	const content = app.state.data.content;
	const markup = app.state.editor.markup;
	app.backgroundPress({ key: 'Enter' });
	app.backgroundPress({ key: 'b', ctrlKey: true });
	app.backgroundPress({ key: 'Backspace' });
	assert.equal(app.state.data.content, content);
	assert.equal(app.state.editor.markup, markup);
	assert.equal(app.open, true);
});

test('handled and composing editor keys are ignored while ordinary editor Enter still adds a paragraph', () => {
	const app = runtime();
	app.backgroundPress({ defaultPrevented: true });
	app.backgroundPress({ isComposing: true });
	assert.equal(app.state.data.content.length, 1);
	const event = app.backgroundPress({ key: 'Enter' });
	assert.equal(event.defaultPrevented, true);
	assert.equal(app.state.data.content.length, 2);
	assert.equal(app.state.data.content[1].type, 'paragraph');
});
