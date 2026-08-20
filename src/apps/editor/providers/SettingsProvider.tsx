import React from 'react';
import { debounce } from 'lodash';
import { ThemeProvider } from 'styled-components';

import { STYLING } from 'helpers/config';
import { darkTheme, lightTheme, theme } from 'helpers/themes';
import { checkWindowCutoff } from 'helpers/window';

type ThemeType = 'light-primary' | 'dark-primary';

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

	const [settings, setSettings] = React.useState<Settings>(loadStoredSettings());

	const handleWindowResize = React.useCallback(() => {
		const newIsDesktop = checkWindowCutoff(parseInt(STYLING.cutoffs.desktop));
		const newWindowSize = { width: window.innerWidth, height: window.innerHeight };
		setSettings((prevSettings) => {
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
			localStorage.setItem('settings', JSON.stringify(newSettings));
			return newSettings;
		});
	}, []);

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 100), [handleWindowResize]);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);
		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, [debouncedResize]);

	React.useEffect(() => {
		document.body.style.overflowY = !settings.isDesktop && settings.sidebarOpen ? 'hidden' : 'auto';
		return () => {
			document.body.style.overflowY = 'auto';
		};
	}, [settings.isDesktop, settings.sidebarOpen]);

	React.useEffect(() => {
		const themeBackgrounds = {
			'light-primary': '#FFFFFF',
			'dark-primary': '#1A1A1A',
		};

		const backgroundColor = themeBackgrounds[settings.theme] || themeBackgrounds[getSystemTheme()];
		document.body.style.background = backgroundColor;
	}, [settings.theme]);

	// Listen for system theme changes when syncWithSystem is enabled
	React.useEffect(() => {
		if (!settings.syncWithSystem) return;

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			const newTheme: ThemeType = e.matches ? 'dark-primary' : 'light-primary';
			setSettings((prevSettings) => {
				const newSettings = { ...prevSettings, theme: newTheme };
				localStorage.setItem('settings', JSON.stringify(newSettings));
				return newSettings;
			});
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [settings.syncWithSystem]);

	const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
		React.startTransition(() => {
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

				localStorage.setItem('settings', JSON.stringify(newSettings));
				return newSettings;
			});
		});
	};

	const updateDrawerState = (key: string, isOpen: boolean) => {
		setSettings((prevSettings) => {
			const newSettings = {
				...prevSettings,
				drawerStates: { ...prevSettings.drawerStates, [key]: isOpen },
			};
			localStorage.setItem('settings', JSON.stringify(newSettings));
			return newSettings;
		});
	};

	const currentTheme = React.useMemo(() => {
		return theme(settings.theme === 'dark-primary' ? darkTheme : lightTheme);
	}, [settings.theme]);

	return (
		<SettingsContext.Provider
			value={{
				settings: settings,
				updateSettings: updateSettings,
				updateDrawerState: updateDrawerState,
				availableThemes: null,
			}}
		>
			<ThemeProvider theme={currentTheme}>{props.children}</ThemeProvider>
		</SettingsContext.Provider>
	);
}
