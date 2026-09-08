import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

function transpile(source) {
	return ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			esModuleInterop: true,
		},
	}).outputText;
}

async function compile(path) {
	return transpile(await readFile(new URL(path, import.meta.url), 'utf8'));
}

async function compileComponent(path, name, exposed) {
	const source = await readFile(new URL(path, import.meta.url), 'utf8');
	const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const component = file.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
	const output = component.body.statements.findLast((node) => ts.isReturnStatement(node));
	// Retain the actual hooks, handlers, and effects; expose handlers instead of rendering child UI.
	return transpile(`${source.slice(0, output.getStart(file))}return { ${exposed} };\n}`);
}

const [scrollSource, routeSource, postSource, editorSource, importSource] = await Promise.all([
	compile('../src/hooks/useScrollToTop.ts'),
	compile('../src/apps/editor/hooks/useRouteScrollReset.ts'),
	compile('../src/apps/editor/store/post.ts'),
	compileComponent(
		'../src/apps/editor/components/organisms/PostEditor/ArticleEditor/ArticleEditor.tsx',
		'ArticleEditor',
		'handleBlockChange'
	),
	compileComponent(
		'../src/apps/editor/components/organisms/PostEditor/ArticleEditor/ArticlePost/ArticlePostImport/ArticlePostImport.tsx',
		'ArticlePostImport',
		'handleFileChange, handleWordPressImport, setAssetId, setWordPressUrl, setShowOptions, loading, showOptions'
	),
]);

const POST_ID = 'p'.repeat(43);
const POST_ID_2 = 'q'.repeat(43);
const importedBlocks = [{ id: 'imported-image', type: 'image', content: '<img />', data: { caption: '' } }];

function runtime({ readAsset, convertWordPress, assetId = POST_ID, draft = false } = {}) {
	const hooks = [];
	const scrolls = [];
	const notices = [];
	let cursor = 0;
	let layoutEffects = [];
	let effects = [];
	let location = { key: 'home', pathname: '/', search: '', hash: '' };
	let params = { assetId };
	let dirty = false;
	let mounted;
	let output;
	let state;
	const sameDependencies = (before, after) =>
		before && after && before.length === after.length && before.every((item, index) => Object.is(item, after[index]));
	function registerEffect(queue, callback, dependencies) {
		const index = cursor++;
		const previous = hooks[index];
		if (!previous || !sameDependencies(previous.dependencies, dependencies)) {
			hooks[index] = { dependencies, cleanup: previous?.cleanup };
			queue.push(() => {
				hooks[index].cleanup?.();
				hooks[index].cleanup = callback();
			});
		}
	}
	const React = {
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
		useEffect: (callback, dependencies) => registerEffect(effects, callback, dependencies),
		useLayoutEffect: (callback, dependencies) => registerEffect(layoutEffects, callback, dependencies),
		useMemo: (factory, dependencies) => {
			const index = cursor++;
			if (!hooks[index] || !sameDependencies(hooks[index].dependencies, dependencies)) {
				hooks[index] = { dependencies, value: factory() };
			}
			return hooks[index].value;
		},
		useRef: (initial) => {
			const index = cursor++;
			if (!hooks[index]) hooks[index] = { current: initial };
			return hooks[index];
		},
	};
	const browser = {
		history: { scrollRestoration: 'auto' },
		scrollX: 0,
		scrollY: 1800,
		scrollTo: (options) => {
			scrolls.push(structuredClone(options));
			browser.scrollX = options.left;
			browser.scrollY = options.top;
		},
	};
	const context = vm.createContext({
		window: browser,
		document: { addEventListener() {}, removeEventListener() {} },
		console: { error() {} },
		URL,
	});
	function dispatch(action) {
		if (typeof action === 'function') return action(dispatch);
		state = post.currentPost(state, action);
		dirty = true;
	}
	const modules = {
		react: React,
		'react-redux': { useDispatch: () => dispatch, useSelector: (selector) => selector({ currentPost: state }) },
		'react-router-dom': { useLocation: () => location, useParams: () => params, useNavigate: () => () => {} },
		'helpers/config': { URLS: { postCreateArticle: () => '/portal/post/create/article/' } },
		'helpers/features': { IS_BASE_MODE: true },
		'helpers/types': { ArticleStatusEnum: { Draft: 'draft' }, ArticleBlockEnum: { Paragraph: 'paragraph' } },
		'helpers/utils': { debugLog() {}, checkValidAddress: (value) => /^[a-zA-Z0-9_-]{43}$/.test(value) },
		'helpers/markdown': {
			extractMarkdownDocument: () => ({ body: '![](image)', frontmatter: {} }),
			parseMarkdownToBlocks: () => importedBlocks,
			getMarkdownTitle: () => 'Imported post',
			getMarkdownDescription: () => null,
			getMarkdownFeaturedImage: () => null,
		},
		'helpers/wordpress': {
			extractWordPressArticle:
				convertWordPress || (() => Promise.resolve({ title: 'WordPress post', content: importedBlocks })),
		},
		'editor/providers/PortalProvider': {
			usePortalProvider: () => ({ current: { id: 'portal' }, addPortalUpload: () => Promise.resolve() }),
		},
		'providers/ArweaveProvider': { useArweaveProvider: () => ({ wallet: {} }) },
		'providers/PermawebProvider': {
			usePermawebProvider: () => ({
				libs: {
					getAtomicAsset:
						readAsset || (() => Promise.resolve({ name: 'Imported post', metadata: { content: importedBlocks } })),
				},
			}),
		},
		'providers/LanguageProvider': { useLanguageProvider: () => ({ current: 'en', object: { en: {} } }) },
		'providers/NotificationProvider': {
			useNotifications: () => ({ addNotification: (...notice) => notices.push(notice) }),
		},
	};
	function load(source) {
		const exports = {};
		vm.runInContext(`(function(require, exports) { ${source}\n})`, context)((name) => {
			assert.ok(name in modules, `Unexpected module: ${name}`);
			return modules[name];
		}, exports);
		return exports;
	}
	const scroll = load(scrollSource);
	modules['hooks/useScrollToTop'] = scroll;
	const route = load(routeSource);
	const post = load(postSource);
	modules['editor/store/post'] = post;
	const editor = load(editorSource).default;
	const importer = load(importSource).default;
	state = focusedPost(post);
	if (draft) state.data.id = null;
	function render(callback) {
		cursor = 0;
		layoutEffects = [];
		effects = [];
		callback();
		for (const effect of layoutEffects) effect();
		for (const effect of effects) effect();
	}
	async function flush() {
		let idle = 0;
		for (let iteration = 0; iteration < 200; iteration++) {
			if (dirty && mounted) {
				dirty = false;
				render(() => {
					output = mounted({});
				});
				idle = 0;
			}
			await Promise.resolve();
			if (++idle >= 15) return;
		}
		throw new Error('Editor component did not settle');
	}
	return {
		browser,
		scrolls,
		post,
		notices,
		flush,
		get output() {
			return output;
		},
		get state() {
			return state;
		},
		async mount(component) {
			mounted = component === 'editor' ? editor : importer;
			dirty = true;
			await flush();
		},
		async navigateComponent(assetId) {
			params = { assetId };
			location = { ...location, key: `post-${assetId}` };
			dirty = true;
			await flush();
		},
		renderRoute(next = {}) {
			location = { ...location, ...next };
			render(() => route.useRouteScrollReset());
		},
		renderContent(resetKey, enabled) {
			render(() => scroll.useScrollToTop(resetKey, enabled));
		},
		unmount() {
			for (const hook of hooks) hook.cleanup?.();
			mounted = null;
		},
	};
}

test('opening a post and returning Home both start at the top', () => {
	const app = runtime();
	app.renderRoute({ key: 'posts', pathname: '/portal/posts/' });
	app.browser.scrollY = 1200;
	app.renderRoute({ key: 'post', pathname: '/portal/post/edit/article/post-id' });
	assert.equal(app.browser.scrollY, 0);
	app.browser.scrollY = 6000;
	app.renderRoute({ key: 'home-again', pathname: '/' });
	assert.equal(app.browser.scrollY, 0);
	assert.deepEqual(app.scrolls, Array(3).fill({ left: 0, top: 0, behavior: 'instant' }));
});

test('rerendering the current route preserves the reader or editor scroll position', () => {
	const app = runtime();
	app.renderRoute({ key: 'post', pathname: '/portal/post/edit/article/post-id' });
	app.browser.scrollY = 2500;
	app.renderRoute();
	app.renderRoute();
	assert.equal(app.browser.scrollY, 2500);
	assert.equal(app.scrolls.length, 1);
});

test('history navigation and redirects reset even when reusing a pathname', () => {
	const app = runtime();
	app.renderRoute({ key: 'first', pathname: '/portal/posts/' });
	app.browser.scrollY = 1700;
	app.renderRoute({ key: 'second', pathname: '/portal/posts/' });
	assert.equal(app.browser.scrollY, 0);
	app.browser.scrollY = 2800;
	app.renderRoute({ key: 'first' });
	assert.equal(app.browser.scrollY, 0);
	app.browser.scrollY = 800;
	app.renderRoute({ key: 'redirect', pathname: '/' });
	assert.equal(app.browser.scrollY, 0);
	assert.equal(app.scrolls.length, 4);
});

test('documentation anchors preserve their targeted scroll while other routes reset', () => {
	const app = runtime();
	app.renderRoute({ key: 'docs', pathname: '/docs/posts/editor', hash: '#images' });
	assert.equal(app.browser.scrollY, 1800);
	assert.equal(app.scrolls.length, 0);
	app.renderRoute({ key: 'docs-section', hash: '#publishing' });
	assert.equal(app.browser.scrollY, 1800);
	app.renderRoute({ key: 'docs-top', hash: '' });
	assert.equal(app.browser.scrollY, 0);
	app.browser.scrollY = 2400;
	app.renderRoute({ key: 'home', pathname: '/', hash: '' });
	assert.equal(app.browser.scrollY, 0);
});

test('browser history restoration is disabled during editor navigation and restored on unmount', () => {
	const app = runtime();
	app.renderRoute();
	assert.equal(app.browser.history.scrollRestoration, 'manual');
	app.renderRoute({ key: 'post', pathname: '/portal/post/edit/article/post-id' });
	assert.equal(app.browser.history.scrollRestoration, 'manual');
	app.unmount();
	assert.equal(app.browser.history.scrollRestoration, 'auto');
});

test('successful asynchronous loading or import resets once without interrupting later edits', () => {
	const app = runtime();
	app.renderContent(0, false);
	assert.equal(app.browser.scrollY, 1800);
	assert.equal(app.scrolls.length, 0);
	app.renderContent(1, true);
	assert.equal(app.browser.scrollY, 0);
	app.browser.scrollY = 3200;
	app.renderContent(1, true);
	assert.equal(app.browser.scrollY, 3200);
	app.renderContent(2, true);
	assert.equal(app.browser.scrollY, 0);
	assert.equal(app.scrolls.length, 2);
});

function focusedPost(post) {
	return {
		...post.initStateCurrentPost,
		data: { ...post.initStateCurrentPost.data, id: 'post-id', content: [{ id: 'imported-image', type: 'image' }] },
		originalData: { title: 'Original title' },
		editor: {
			...post.initStateCurrentPost.editor,
			titleFocused: true,
			focusedBlock: 'imported-image',
			lastAddedBlockId: 'imported-image',
			toggleBlockFocus: true,
			markupUserInitiated: true,
			markup: { bold: true, italic: true, underline: true, strikethrough: true },
			blockEditMode: false,
			panelOpen: false,
		},
	};
}

function assertFocusReset(editor) {
	assert.equal(editor.titleFocused, false);
	assert.equal(editor.focusedBlock, null);
	assert.equal(editor.lastAddedBlockId, null);
	assert.equal(editor.toggleBlockFocus, false);
	assert.equal(editor.markupUserInitiated, false);
	assert.deepEqual(structuredClone(editor.markup), {
		bold: false,
		italic: false,
		underline: false,
		strikethrough: false,
	});
	assert.equal(editor.blockEditMode, false);
	assert.equal(editor.panelOpen, false);
}

test('import focus reset clears stale autofocus without changing content or editor preferences', () => {
	const { post } = runtime();
	const before = focusedPost(post);
	let action;
	post.currentPostResetFocus()((next) => (action = next));
	const after = post.currentPost(before, action);
	assertFocusReset(after.editor);
	assert.equal(after.data, before.data);
	assert.equal(after.originalData, before.originalData);
	assert.equal(before.editor.lastAddedBlockId, 'imported-image');
});

test('clearing a post also clears stale focus before loading the next post', () => {
	const { post } = runtime();
	const before = focusedPost(post);
	let action;
	post.currentPostClear()((next) => (action = next));
	const after = post.currentPost(before, action);
	assertFocusReset(after.editor);
	assert.equal(after.data.id, null);
	assert.equal(after.data.content, null);
	assert.equal(after.originalData, null);
});

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((done, fail) => {
		resolve = done;
		reject = fail;
	});
	return { promise, resolve, reject };
}

const loadedAsset = { name: 'Loaded post', metadata: { content: importedBlocks } };

test('ArticleEditor resets after async content commits and preserves scrolling during later edits', async () => {
	const pending = deferred();
	const app = runtime({ readAsset: () => pending.promise });
	await app.mount('editor');
	assert.equal(app.state.editor.loading.active, true);
	assert.equal(app.scrolls.length, 0);
	pending.resolve(loadedAsset);
	await app.flush();
	assert.equal(app.state.data.id, POST_ID);
	assert.equal(app.state.data.content[0].id, 'imported-image');
	assert.equal(app.state.editor.loading.active, false);
	assert.equal(app.browser.scrollY, 0);
	assertFocusReset(app.state.editor);
	app.browser.scrollY = 3200;
	app.output.handleBlockChange({ id: 'imported-image', content: 'Edited block' });
	await app.flush();
	assert.equal(app.browser.scrollY, 3200);
	assert.equal(app.scrolls.length, 1);
});

test('returning to an unsaved draft preserves content but clears old block focus and resets scroll', async () => {
	const app = runtime({ assetId: null, draft: true });
	const content = app.state.data.content;
	await app.mount('editor');
	assert.equal(app.state.data.content, content);
	assertFocusReset(app.state.editor);
	assert.equal(app.browser.scrollY, 0);
	assert.equal(app.scrolls.length, 1);
});

test('opening Create during a pending edit load clears the loader and ignores the late post', async () => {
	const pending = deferred();
	const app = runtime({ readAsset: () => pending.promise });
	await app.mount('editor');
	assert.equal(app.state.editor.loading.active, true);
	await app.navigateComponent(undefined);
	assert.equal(app.state.editor.loading.active, false);
	assert.equal(app.browser.scrollY, 0);
	app.browser.scrollY = 700;
	pending.resolve(loadedAsset);
	await app.flush();
	assert.equal(app.state.data.id, null);
	assert.equal(app.state.data.content, null);
	assert.equal(app.browser.scrollY, 700);
	assert.equal(app.scrolls.length, 1);
});

test('leaving an editor prevents a pending post from scrolling the destination page', async () => {
	const pending = deferred();
	const app = runtime({ readAsset: () => pending.promise });
	await app.mount('editor');
	app.unmount();
	app.browser.scrollY = 650;
	pending.resolve(loadedAsset);
	await app.flush();
	assert.equal(app.state.data.id, null);
	assert.equal(app.browser.scrollY, 650);
	assert.equal(app.scrolls.length, 0);
});

async function startImport(app, method, pending) {
	app.output.setShowOptions(true);
	await app.flush();
	if (method === 'markdown') {
		return {
			completion: app.output.handleFileChange({
				target: { files: [{ name: 'post.md', text: () => pending.promise }] },
			}),
		};
	}
	if (method === 'wordpress') {
		app.output.setWordPressUrl('https://example.com/article');
		await app.flush();
		return { completion: app.output.handleWordPressImport() };
	}
	app.output.setAssetId(POST_ID_2);
	await app.flush();
	return { completion: Promise.resolve() };
}

for (const method of ['markdown', 'wordpress', 'asset']) {
	test(`${method} import resets after success and reopening or canceling import keeps the editor position`, async () => {
		const pending = deferred();
		const app = runtime({ readAsset: () => pending.promise, convertWordPress: () => pending.promise });
		await app.mount('import');
		const { completion } = await startImport(app, method, pending);
		await app.flush();
		assert.equal(app.scrolls.length, 0);
		assert.equal(app.output.loading, true);
		pending.resolve(
			method === 'markdown' ? '![](image)' : method === 'wordpress' ? { content: importedBlocks } : loadedAsset
		);
		await completion;
		await app.flush();
		assert.equal(app.state.data.content.at(-1).id, 'imported-image');
		assertFocusReset(app.state.editor);
		assert.equal(app.output.loading, false);
		assert.equal(app.output.showOptions, false);
		assert.equal(app.browser.scrollY, 0);
		assert.equal(app.scrolls.length, 1);
		app.browser.scrollY = 4300;
		app.output.setShowOptions(true);
		await app.flush();
		app.output.setShowOptions(false);
		await app.flush();
		assert.equal(app.browser.scrollY, 4300);
		assert.equal(app.scrolls.length, 1);
	});

	test(`late ${method} import after route navigation does not replace content or jump the page`, async () => {
		const pending = deferred();
		const app = runtime({ readAsset: () => pending.promise, convertWordPress: () => pending.promise });
		await app.mount('import');
		const content = app.state.data.content;
		const { completion } = await startImport(app, method, pending);
		await app.navigateComponent(POST_ID_2);
		assert.equal(app.output.loading, false);
		app.browser.scrollY = 900;
		pending.resolve(
			method === 'markdown' ? '![](image)' : method === 'wordpress' ? { content: importedBlocks } : loadedAsset
		);
		await completion;
		await app.flush();
		assert.equal(app.state.data.content, content);
		assert.equal(app.browser.scrollY, 900);
		assert.equal(app.scrolls.length, 0);
		assert.equal(app.notices.length, 0);
	});
}

test('canceling the file picker or failing an import does not scroll the editor', async () => {
	const pending = deferred();
	const app = runtime();
	await app.mount('import');
	await app.output.handleFileChange({ target: { files: [] } });
	assert.equal(app.scrolls.length, 0);
	const { completion } = await startImport(app, 'markdown', pending);
	pending.reject(new Error('Cannot read file'));
	await completion;
	await app.flush();
	assert.equal(app.output.loading, false);
	assert.equal(app.scrolls.length, 0);
	assert.equal(app.browser.scrollY, 1800);
});
