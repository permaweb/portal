import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import ts from 'typescript';

function compile(source) {
	return ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			jsx: ts.JsxEmit.React,
			esModuleInterop: true,
		},
	}).outputText;
}

const paths = {
	settings: '../src/apps/editor/providers/SettingsProvider.tsx',
	language: '../src/providers/LanguageProvider.tsx',
	navigation: '../src/apps/editor/navigation/NavigationContext.tsx',
};
const sources = Object.fromEntries(
	await Promise.all(
		Object.entries(paths).map(async ([name, path]) => [
			name,
			compile(await readFile(new URL(path, import.meta.url), 'utf8')),
		])
	)
);

function eventTarget() {
	const listeners = new Map();
	return {
		listeners,
		addEventListener(type, callback) {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type).add(callback);
		},
		removeEventListener(type, callback) {
			listeners.get(type)?.delete(callback);
		},
		dispatch(type, event = {}) {
			for (const callback of listeners.get(type) || []) callback(event);
		},
	};
}

function runtime({ stored, systemDark = false, width = 1440, moduleSources = sources } = {}) {
	const components = new Map();
	const timers = new Map();
	const writes = [];
	const warnings = [];
	const stats = { storageReads: 0, themeBuilds: 0, transitions: 0 };
	let timerId = 0;
	let active;
	let cursor = 0;
	let dirty = true;
	let mounted = true;
	let effects = [];
	let renderedTheme;
	let storage = stored === undefined ? null : JSON.stringify(stored);
	let failStorageWrites = false;
	const media = { ...eventTarget(), matches: systemDark };
	const browser = {
		...eventTarget(),
		innerWidth: width,
		innerHeight: 900,
		matchMedia: () => media,
	};
	const document = { body: { style: {} } };
	const setTimeout = (callback, delay) => {
		const id = ++timerId;
		timers.set(id, { callback, delay });
		return id;
	};
	const clearTimeout = (id) => timers.delete(id);
	browser.setTimeout = setTimeout;
	browser.clearTimeout = clearTimeout;
	const sameDependencies = (before, after) =>
		before && after && before.length === after.length && before.every((value, index) => Object.is(value, after[index]));
	const React = {
		createContext(initial) {
			const context = { value: initial };
			context.Provider = { context };
			return context;
		},
		createElement(type, props) {
			if (type?.context) type.context.value = props.value;
			if (type === 'theme-provider') renderedTheme = props.theme;
			return null;
		},
		useContext: (context) => context.value,
		useState(initial) {
			const index = cursor++;
			if (!active[index]) {
				const slot = { value: typeof initial === 'function' ? initial() : initial };
				slot.set = (next) => {
					const value = typeof next === 'function' ? next(slot.value) : next;
					if (!Object.is(value, slot.value)) {
						slot.value = value;
						dirty = true;
					}
				};
				active[index] = slot;
			}
			return [active[index].value, active[index].set];
		},
		useRef(initial) {
			const index = cursor++;
			if (!active[index]) active[index] = { current: initial };
			return active[index];
		},
		useEffect(callback, dependencies) {
			const index = cursor++;
			const previous = active[index];
			if (!previous || !sameDependencies(previous.dependencies, dependencies)) {
				const slot = { dependencies, cleanup: previous?.cleanup };
				active[index] = slot;
				effects.push(() => {
					slot.cleanup?.();
					slot.cleanup = callback();
				});
			}
		},
		useMemo(factory, dependencies) {
			const index = cursor++;
			if (!active[index] || !sameDependencies(active[index].dependencies, dependencies)) {
				active[index] = { dependencies, value: factory() };
			}
			return active[index].value;
		},
		useCallback: (callback, dependencies) => React.useMemo(() => callback, dependencies),
		startTransition(callback) {
			stats.transitions++;
			callback();
		},
	};
	React.useLayoutEffect = React.useEffect;
	const context = vm.createContext({
		console: { ...console, warn: (...args) => warnings.push(args) },
		window: browser,
		document,
		localStorage: {
			getItem(key) {
				assert.equal(key, 'settings');
				stats.storageReads++;
				return storage;
			},
			setItem(key, value) {
				assert.equal(key, 'settings');
				if (failStorageWrites) throw new Error('Storage unavailable');
				storage = value;
				writes.push(JSON.parse(value));
			},
		},
		setTimeout,
		clearTimeout,
	});
	const translations = { en: { home: 'Home' }, es: { home: 'Inicio' }, de: { home: 'Startseite' } };
	const modules = {
		react: React,
		lodash: {
			debounce(callback, delay) {
				let timer;
				const debounced = (...args) => {
					clearTimeout(timer);
					timer = setTimeout(() => callback(...args), delay);
				};
				debounced.cancel = () => clearTimeout(timer);
				return debounced;
			},
		},
		'styled-components': { ThemeProvider: 'theme-provider' },
		'helpers/config': { STYLING: { dimensions: { nav: { width: '280px' } }, cutoffs: { desktop: '1024px' } } },
		'helpers/themes': {
			darkTheme: { name: 'dark' },
			lightTheme: { name: 'light' },
			theme: (palette) => {
				stats.themeBuilds++;
				return { colors: { ...palette, view: { background: palette.name === 'dark' ? '#17181A' : '#FFFFFF' } } };
			},
		},
		'helpers/window': { checkWindowCutoff: (cutoff) => browser.innerWidth >= cutoff },
		'helpers/language': {
			LanguageEnum: { en: 'en', es: 'es', de: 'de' },
			loadLanguage: (language) => translations[language],
			loadLanguageAsync: async (language) => translations[language],
		},
	};
	function load(name) {
		const exports = {};
		vm.runInContext(`(function(require, exports) { ${moduleSources[name]}\n})`, context)((id) => {
			assert.ok(modules[id], `Unexpected dependency: ${id}`);
			return modules[id];
		}, exports);
		return exports;
	}
	const settingsModule = load('settings');
	modules['editor/providers/SettingsProvider'] = settingsModule;
	const languageModule = load('language');
	const navigationModule = load('navigation');
	const providers = [
		settingsModule.SettingsProvider,
		languageModule.LanguageProvider,
		navigationModule.NavigationProvider,
	];
	async function flush() {
		let idle = 0;
		for (let iteration = 0; iteration < 100; iteration++) {
			if (dirty && mounted) {
				dirty = false;
				effects = [];
				for (const provider of providers) {
					if (!components.has(provider)) components.set(provider, []);
					active = components.get(provider);
					cursor = 0;
					provider({ children: null });
				}
				for (const effect of effects) effect();
				idle = 0;
			}
			await Promise.resolve();
			if (!dirty && ++idle >= 10) return;
		}
		throw new Error('Theme providers did not settle');
	}
	return {
		get settings() {
			return settingsModule.useSettingsProvider();
		},
		get language() {
			return languageModule.useLanguageProvider();
		},
		get navigation() {
			return navigationModule.useNavigation();
		},
		get theme() {
			return renderedTheme;
		},
		stats,
		writes,
		warnings,
		timers,
		browser,
		media,
		document,
		flush,
		failStorageWrites(value) {
			failStorageWrites = value;
		},
		async rerender() {
			dirty = true;
			await flush();
		},
		async runTimers() {
			await flush();
			for (let iteration = 0; timers.size && iteration < 20; iteration++) {
				const [id, timer] = timers.entries().next().value;
				timers.delete(id);
				timer.callback();
				await flush();
			}
			assert.equal(timers.size, 0, 'Theme persistence must settle');
		},
		async systemTheme(dark) {
			media.matches = dark;
			media.dispatch('change', { matches: dark });
			await flush();
		},
		unmount() {
			mounted = false;
			for (const hooks of components.values()) {
				for (const hook of hooks) hook?.cleanup?.();
			}
		},
	};
}

test('opening the editor does not overwrite stored viewer theme preferences', async () => {
	const app = runtime({
		stored: {
			theme: 'dark-blue',
			syncWithSystem: false,
			preferredLightTheme: 'light-green',
			preferredDarkTheme: 'dark-blue',
		},
	});
	await app.runTimers();
	await app.rerender();
	assert.equal(app.settings.settings.theme, 'dark-primary');
	assert.equal(app.writes.length, 0);
	assert.equal(app.timers.size, 0);
	app.unmount();
	assert.equal(app.writes.length, 0);
});

test('theme changes reuse the light and dark themes without rereading storage', async () => {
	const app = runtime();
	await app.flush();
	const light = app.theme;
	app.settings.updateSettings('theme', 'dark-primary');
	await app.flush();
	const dark = app.theme;
	assert.notEqual(dark, light);
	app.settings.updateSettings('theme', 'light-primary');
	await app.flush();
	assert.equal(app.theme, light);
	app.settings.updateSettings('theme', 'dark-primary');
	await app.flush();
	assert.equal(app.theme, dark);
	assert.equal(app.stats.themeBuilds, 2);
	assert.equal(app.stats.storageReads, 1);
	assert.equal(app.stats.transitions, 0, 'An explicit theme selection must not be a deferred React transition');
	assert.equal(app.document.body.style.background, '#17181A');
});

test('settings callbacks and unrelated language/navigation contexts stay stable during theme changes', async () => {
	const app = runtime();
	await app.flush();
	const settings = app.settings;
	const language = app.language;
	const navigation = app.navigation;
	app.settings.updateSettings('theme', 'dark-primary');
	await app.flush();
	assert.notEqual(app.settings, settings);
	assert.equal(app.settings.updateSettings, settings.updateSettings);
	assert.equal(app.settings.updateDrawerState, settings.updateDrawerState);
	assert.equal(app.language, language);
	assert.equal(app.navigation, navigation);
	const updatedSettings = app.settings;
	await app.rerender();
	assert.equal(app.settings, updatedSettings, 'An unchanged provider render must retain its context value');
});

test('memoized language and navigation callbacks still update their settings', async () => {
	const app = runtime();
	await app.flush();
	const languageChange = app.language.setCurrent;
	const resizeNavigation = app.navigation.setNavWidth;
	app.settings.updateSettings('theme', 'dark-primary');
	await app.flush();
	languageChange('es');
	resizeNavigation(320);
	await app.flush();
	assert.equal(app.settings.settings.language, 'es');
	assert.equal(app.language.current, 'es');
	assert.equal(app.language.object.es.home, 'Inicio');
	assert.equal(app.settings.settings.navWidth, 320);
	assert.equal(app.navigation.navWidth, 320);
	assert.equal(app.language.setCurrent, languageChange);
	assert.equal(app.navigation.setNavWidth, resizeNavigation);
});

test('storage writes are deferred until after the updated theme renders and coalesce to the latest settings', async () => {
	const app = runtime();
	await app.runTimers();
	app.writes.length = 0;
	app.settings.updateSettings('theme', 'dark-primary');
	assert.equal(app.writes.length, 0, 'The click handler must not synchronously write settings');
	await app.flush();
	assert.equal(app.theme.colors.name, 'dark');
	assert.equal(app.writes.length, 0, 'Committing the theme must not synchronously write settings');
	app.settings.updateSettings('theme', 'light-primary');
	app.settings.updateDrawerState('posts', true);
	await app.flush();
	await app.runTimers();
	assert.equal(app.writes.length, 1);
	assert.equal(app.writes[0].theme, 'light-primary');
	assert.equal(app.writes[0].syncWithSystem, false);
	assert.equal(app.writes[0].drawerStates.posts, true);
});

test('no-op settings and drawer updates preserve state and do not schedule persistence', async () => {
	const app = runtime({ stored: { theme: 'light-primary', syncWithSystem: false, drawerStates: { posts: true } } });
	await app.runTimers();
	const settings = app.settings;
	app.writes.length = 0;
	app.settings.updateSettings('theme', 'light-primary');
	app.settings.updateSettings('language', 'en');
	app.settings.updateDrawerState('posts', true);
	await app.flush();
	assert.equal(app.settings, settings);
	assert.equal(app.timers.size, 0);
	assert.equal(app.writes.length, 0);
});

test('selecting the current theme still leaves system sync and persists the manual preference', async () => {
	const app = runtime();
	await app.runTimers();
	app.writes.length = 0;
	app.settings.updateSettings('theme', 'light-primary');
	await app.flush();
	assert.equal(app.settings.settings.theme, 'light-primary');
	assert.equal(app.settings.settings.syncWithSystem, false);
	await app.systemTheme(true);
	assert.equal(app.settings.settings.theme, 'light-primary');
	await app.runTimers();
	assert.equal(app.writes.length, 1);
	assert.equal(app.writes[0].syncWithSystem, false);
});

test('system theme changes update and persist, and enabling sync adopts the current system theme', async () => {
	const app = runtime();
	await app.runTimers();
	app.writes.length = 0;
	await app.systemTheme(true);
	assert.equal(app.settings.settings.theme, 'dark-primary');
	assert.equal(app.theme.colors.name, 'dark');
	assert.equal(app.writes.length, 0);
	await app.runTimers();
	assert.equal(app.writes.at(-1).theme, 'dark-primary');
	assert.equal(app.writes.at(-1).syncWithSystem, true);
	app.settings.updateSettings('theme', 'light-primary');
	await app.flush();
	app.settings.updateSettings('syncWithSystem', true);
	await app.flush();
	assert.equal(app.settings.settings.theme, 'dark-primary');
	assert.equal(app.settings.settings.syncWithSystem, true);
	await app.runTimers();
	const settings = app.settings;
	await app.systemTheme(true);
	assert.equal(app.settings, settings, 'Repeating an unchanged system preference must not rerender consumers');
	assert.equal(app.timers.size, 0);
});

test('stored and selected legacy themes normalize to the supported light and dark themes', async () => {
	const app = runtime({ stored: { theme: 'dark-blue', syncWithSystem: false } });
	await app.flush();
	assert.equal(app.settings.settings.theme, 'dark-primary');
	assert.equal(app.settings.settings.preferredLightTheme, 'light-primary');
	assert.equal(app.settings.settings.preferredDarkTheme, 'dark-primary');
	app.settings.updateSettings('theme', 'light-green');
	await app.flush();
	assert.equal(app.settings.settings.theme, 'light-primary');
	assert.equal(app.theme.colors.name, 'light');
});

test('responsive settings still close the mobile sidebar and restore the desktop navigation width', async () => {
	const app = runtime({ width: 700 });
	await app.runTimers();
	assert.equal(app.settings.settings.isDesktop, false);
	assert.equal(app.settings.settings.sidebarOpen, false);
	assert.equal(app.settings.settings.navWidth, 0);
	app.browser.innerWidth = 1440;
	app.browser.dispatch('resize');
	await app.runTimers();
	assert.equal(app.settings.settings.isDesktop, true);
	assert.equal(app.settings.settings.navWidth, 280);
	app.settings.updateSettings('sidebarOpen', true);
	await app.flush();
	app.browser.innerWidth = 700;
	app.browser.dispatch('resize');
	await app.runTimers();
	assert.equal(app.settings.settings.isDesktop, false);
	assert.equal(app.settings.settings.sidebarOpen, false);
	assert.equal(app.settings.settings.navWidth, 0);
	assert.equal(app.writes.at(-1).windowSize.width, 700);
});

test('unmount removes listeners and cancels pending responsive work', async () => {
	const app = runtime();
	await app.runTimers();
	app.browser.innerWidth = 700;
	app.browser.dispatch('resize');
	assert.ok(app.timers.size > 0);
	app.unmount();
	assert.equal(app.timers.size, 0);
	assert.equal(app.browser.listeners.get('resize')?.size || 0, 0);
	assert.equal(app.media.listeners.get('change')?.size || 0, 0);
	assert.equal(app.document.body.style.overflowY, 'auto');
});

test('unmount saves the last committed choice and cancels the pending persistence timer', async () => {
	const app = runtime();
	await app.runTimers();
	app.writes.length = 0;
	app.settings.updateSettings('theme', 'dark-primary');
	await app.flush();
	assert.equal(app.writes.length, 0);
	app.unmount();
	assert.equal(app.writes.length, 1);
	assert.equal(app.writes[0].theme, 'dark-primary');
	assert.equal(app.writes[0].syncWithSystem, false);
	assert.equal(app.timers.size, 0);
	assert.equal(app.browser.listeners.get('pagehide')?.size || 0, 0);
});

test('pagehide saves pending settings before its deferred timer and avoids duplicate writes', async () => {
	const app = runtime();
	await app.runTimers();
	app.writes.length = 0;
	app.settings.updateSettings('theme', 'dark-primary');
	await app.flush();
	app.browser.dispatch('pagehide');
	assert.equal(app.writes.length, 1);
	assert.equal(app.writes[0].theme, 'dark-primary');
	await app.runTimers();
	app.unmount();
	assert.equal(app.writes.length, 1);
});

test('a storage failure preserves the chosen theme and can retry pending persistence', async () => {
	const app = runtime();
	await app.runTimers();
	app.writes.length = 0;
	app.failStorageWrites(true);
	app.settings.updateSettings('theme', 'dark-primary');
	await app.runTimers();
	assert.equal(app.theme.colors.name, 'dark');
	assert.equal(app.settings.settings.theme, 'dark-primary');
	assert.equal(app.writes.length, 0);
	assert.equal(app.warnings.length, 1);
	app.failStorageWrites(false);
	app.browser.dispatch('pagehide');
	assert.equal(app.writes.length, 1);
	assert.equal(app.writes[0].theme, 'dark-primary');
});

test('a queued system event cannot override a newly selected manual theme', async () => {
	const app = runtime();
	await app.runTimers();
	const systemListener = [...app.media.listeners.get('change')][0];
	app.settings.updateSettings('theme', 'light-primary');
	systemListener({ matches: true });
	await app.flush();
	assert.equal(app.settings.settings.theme, 'light-primary');
	assert.equal(app.settings.settings.syncWithSystem, false);
});

test('an unchanged resize does not invalidate settings or persist them again', async () => {
	const app = runtime();
	await app.runTimers();
	const settings = app.settings;
	app.writes.length = 0;
	app.browser.dispatch('resize');
	await app.runTimers();
	assert.equal(app.settings, settings);
	assert.equal(app.writes.length, 0);
});
