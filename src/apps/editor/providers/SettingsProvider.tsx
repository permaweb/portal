import React from 'react';
import { debounce } from 'lodash';
import { ThemeProvider } from 'styled-components';

import { STYLING } from 'helpers/config';
import { darkTheme, lightTheme, theme } from 'helpers/themes';
import { checkWindowCutoff } from 'helpers/window';

type ThemeType = 'light-primary' | 'dark-primary';

const EDITOR_THEMES = {
	'light-primary': theme(lightTheme),
	'dark-primary': theme(darkTheme),
};

interface Settings {
	theme: ThemeType;
	syncWithSystem: boolean;
	preferredLightTheme: ThemeType;
	preferredDarkTheme: ThemeType;
	sidebarOpen: boolean;
	isDesktop: boolean;
	windowSize: { width: number; height: number };
	showCategoryAction: boolean;
	showTopicAction: boolean;
	showLinkAction: boolean;
	navWidth: number;
	drawerStates: { [key: string]: boolean };
	language: string;
}

interface SettingsContextState {
	settings: Settings;
	updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
	updateDrawerState: (key: string, isOpen: boolean) => void;
	availableThemes: any;
}

interface SettingsProviderProps {
	children: React.ReactNode;
}

const defaultSettings: Settings = {
	theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark-primary' : 'light-primary',
	syncWithSystem: true,
	preferredLightTheme: 'light-primary',
	preferredDarkTheme: 'dark-primary',
	sidebarOpen: true,
	isDesktop: true,
	windowSize: { width: window.innerWidth, height: window.innerHeight },
	showCategoryAction: false,
	showTopicAction: false,
	showLinkAction: false,
	navWidth: parseInt(STYLING.dimensions.nav.width),
	drawerStates: {},
	language: 'en',
};

function getSystemTheme(): ThemeType {
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark-primary' : 'light-primary';
}

function normalizeEditorTheme(value: unknown, fallback: ThemeType = getSystemTheme()): ThemeType {
	if (typeof value !== 'string') return fallback;
	if (value.startsWith('dark-')) return 'dark-primary';
	if (value.startsWith('light-')) return 'light-primary';
	return fallback;
}

const SettingsContext = React.createContext<SettingsContextState>({
	settings: defaultSettings,
	updateSettings: () => {},
	updateDrawerState: () => {},
	availableThemes: null,
});

export function useSettingsProvider(): SettingsContextState {
	return React.useContext(SettingsContext);
}

export function SettingsProvider(props: SettingsProviderProps) {
	const loadStoredSettings = (): Settings => {
		const stored = localStorage.getItem('settings');
		const isDesktop = checkWindowCutoff(parseInt(STYLING.cutoffs.desktop));
		const preferredTheme = getSystemTheme();

		let settings: Settings;
		if (stored) {
			const parsedSettings = JSON.parse(stored);
			const syncWithSystem = parsedSettings.syncWithSystem ?? true;
			// If not desktop, ensure navWidth is at minimum to hide overlay on load
			const navWidth = isDesktop ? parsedSettings.navWidth ?? parseInt(STYLING.dimensions.nav.width) : 0;

			settings = {
				...parsedSettings,
				theme: syncWithSystem ? preferredTheme : normalizeEditorTheme(parsedSettings.theme, preferredTheme),
				isDesktop,
				windowSize: { width: window.innerWidth, height: window.innerHeight },
				sidebarOpen: isDesktop ? parsedSettings.sidebarOpen : false,
				showCategoryAction: parsedSettings.showCategoryAction ?? false,
				showTopicAction: parsedSettings.showTopicAction ?? false,
				showLinkAction: parsedSettings.showLinkAction ?? false,
				navWidth,
				drawerStates: parsedSettings.drawerStates ?? {},
				language: parsedSettings.language ?? 'en',
				syncWithSystem,
				preferredLightTheme: 'light-primary',
				preferredDarkTheme: 'dark-primary',
			};
		} else {
			settings = {
				...defaultSettings,
				theme: preferredTheme,
				isDesktop,
				sidebarOpen: isDesktop,
				navWidth: isDesktop ? parseInt(STYLING.dimensions.nav.width) : 0,
			};
		}

		return settings;
	};

	const [settings, setSettings] = React.useState<Settings>(loadStoredSettings);
	const currentTheme = EDITOR_THEMES[settings.theme];
	const initialSettingsRef = React.useRef(settings);
	const pendingSettingsRef = React.useRef<Settings | null>(null);

	const persistSettings = React.useCallback(() => {
		if (!pendingSettingsRef.current) return;
		try {
			localStorage.setItem('settings', JSON.stringify(pendingSettingsRef.current));
			pendingSettingsRef.current = null;
		} catch (error) {
			console.warn('Unable to save editor settings', error);
		}
	}, []);

	// Coalesce changes and keep serialization/storage out of the theme update.
	React.useEffect(() => {
		// Editor and viewer share storage; don't overwrite viewer preferences just by opening the editor.
		if (settings === initialSettingsRef.current) return;
		pendingSettingsRef.current = settings;
		const timeout = window.setTimeout(persistSettings, 0);
		return () => window.clearTimeout(timeout);
	}, [settings, persistSettings]);

	React.useEffect(() => {
		window.addEventListener('pagehide', persistSettings);
		return () => {
			window.removeEventListener('pagehide', persistSettings);
			persistSettings();
		};
	}, [persistSettings]);

	const handleWindowResize = React.useCallback(() => {
		const newIsDesktop = checkWindowCutoff(parseInt(STYLING.cutoffs.desktop));
		const newWindowSize = { width: window.innerWidth, height: window.innerHeight };
		setSettings((prevSettings) => {
			if (
				prevSettings.windowSize.width === newWindowSize.width &&
				prevSettings.windowSize.height === newWindowSize.height &&
				prevSettings.isDesktop === newIsDesktop
			)
				return prevSettings;
			// Determine navWidth based on desktop mode transition
			let navWidth: number;
			if (newIsDesktop && !prevSettings.isDesktop) {
				// Transitioning from mobile to desktop - restore to default width
				navWidth = parseInt(STYLING.dimensions.nav.width);
			} else if (!newIsDesktop && prevSettings.isDesktop) {
				// Transitioning from desktop to mobile - close to minimum width
				navWidth = 0;
			} else {
				// Staying in same mode - keep current width
				navWidth = prevSettings.navWidth;
			}

			const newSettings = {
				...prevSettings,
				isDesktop: newIsDesktop,
				windowSize: newWindowSize,
				sidebarOpen: newIsDesktop ? prevSettings.sidebarOpen : false,
				navWidth,
			};
			return newSettings;
		});
	}, []);

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 100), [handleWindowResize]);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);
		return () => {
			window.removeEventListener('resize', debouncedResize);
			debouncedResize.cancel();
		};
	}, [debouncedResize]);

	React.useEffect(() => {
		document.body.style.overflowY = !settings.isDesktop && settings.sidebarOpen ? 'hidden' : 'auto';
		return () => {
			document.body.style.overflowY = 'auto';
		};
	}, [settings.isDesktop, settings.sidebarOpen]);

	React.useEffect(() => {
		document.body.style.background = currentTheme.colors.view.background;
	}, [currentTheme]);

	// Listen for system theme changes when syncWithSystem is enabled
	React.useEffect(() => {
		if (!settings.syncWithSystem) return;

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			const newTheme: ThemeType = e.matches ? 'dark-primary' : 'light-primary';
			setSettings((prevSettings) => {
				if (!prevSettings.syncWithSystem || prevSettings.theme === newTheme) return prevSettings;
				return { ...prevSettings, theme: newTheme };
			});
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [settings.syncWithSystem]);

	const updateSettings = React.useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
		setSettings((prevSettings) => {
			const newSettings: Settings = { ...prevSettings, [key]: value };

			// A manual light/dark choice leaves system mode in one action.
			if (key === 'theme') {
				newSettings.theme = normalizeEditorTheme(value, prevSettings.theme);
				newSettings.syncWithSystem = false;
			}

			if (key === 'syncWithSystem' && value === true) {
				newSettings.theme = getSystemTheme();
			}

			if (
				Object.is(newSettings[key], prevSettings[key]) &&
				newSettings.theme === prevSettings.theme &&
				newSettings.syncWithSystem === prevSettings.syncWithSystem
			)
				return prevSettings;
			return newSettings;
		});
	}, []);

	const updateDrawerState = React.useCallback((key: string, isOpen: boolean) => {
		setSettings((prevSettings) => {
			if (prevSettings.drawerStates[key] === isOpen) return prevSettings;
			return {
				...prevSettings,
				drawerStates: { ...prevSettings.drawerStates, [key]: isOpen },
			};
		});
	}, []);

	const contextValue = React.useMemo(
		() => ({ settings, updateSettings, updateDrawerState, availableThemes: null }),
		[settings, updateSettings, updateDrawerState]
	);

	return (
		<SettingsContext.Provider value={contextValue}>
			<ThemeProvider theme={currentTheme}>{props.children}</ThemeProvider>
		</SettingsContext.Provider>
	);
}
