import React from 'react';
import { debounce } from 'lodash';
import { ThemeProvider } from 'styled-components';

import { ICONS, STYLING } from 'helpers/config';
import {
	darkTheme,
	darkThemeAlt1,
	darkThemeAlt2,
	darkThemeHighContrast,
	lightTheme,
	lightThemeAlt1,
	lightThemeAlt2,
	lightThemeHighContrast,
	theme,
} from 'helpers/themes';
import { checkWindowCutoff } from 'helpers/window';

type ThemeType =
	| 'light-primary'
	| 'light-high-contrast'
	| 'light-alt-1'
	| 'light-alt-2'
	| 'dark-primary'
	| 'dark-high-contrast'
	| 'dark-alt-1'
	| 'dark-alt-2';

interface Settings {
	theme: ThemeType;
	sidebarOpen: boolean;
	isDesktop: boolean;
	windowSize: { width: number; height: number };
	showCategoryAction: boolean;
	showTopicAction: boolean;
	showLinkAction: boolean;
	navWidth: number;
}

interface SettingsContextState {
	settings: Settings;
	updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
	availableThemes: any;
}

interface SettingsProviderProps {
	children: React.ReactNode;
}

const defaultSettings: Settings = {
	theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark-primary' : 'light-primary',
	sidebarOpen: true,
	isDesktop: true,
	windowSize: { width: window.innerWidth, height: window.innerHeight },
	showCategoryAction: true,
	showTopicAction: true,
	showLinkAction: true,
	navWidth: parseInt(STYLING.dimensions.nav.width),
};

const SettingsContext = React.createContext<SettingsContextState>({
	settings: defaultSettings,
	updateSettings: () => {},
	availableThemes: null,
});

export function useSettingsProvider(): SettingsContextState {
	return React.useContext(SettingsContext);
}

export function SettingsProvider(props: SettingsProviderProps) {
	const loadStoredSettings = (): Settings => {
		const stored = localStorage.getItem('settings');
		const isDesktop = checkWindowCutoff(parseInt(STYLING.cutoffs.desktop));
		const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches
			? 'dark-primary'
			: 'light-primary';

		let settings: Settings;
		if (stored) {
			const parsedSettings = JSON.parse(stored);
			// If not desktop, ensure navWidth is at minimum to hide overlay on load
			const navWidth = isDesktop
				? parsedSettings.navWidth ?? parseInt(STYLING.dimensions.nav.width)
				: STYLING.dimensions.nav.widthMin;

			settings = {
				...parsedSettings,
				isDesktop,
				windowSize: { width: window.innerWidth, height: window.innerHeight },
				sidebarOpen: isDesktop ? parsedSettings.sidebarOpen : false,
				showCategoryAction: parsedSettings.showCategoryAction ?? false,
				showTopicAction: parsedSettings.showTopicAction ?? false,
				showLinkAction: parsedSettings.showLinkAction ?? false,
				navWidth,
			};
		} else {
			settings = {
				...defaultSettings,
				theme: preferredTheme,
				isDesktop,
				sidebarOpen: isDesktop,
				navWidth: isDesktop ? parseInt(STYLING.dimensions.nav.width) : STYLING.dimensions.nav.widthMin,
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
				navWidth = STYLING.dimensions.nav.widthMin;
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
			'light-high-contrast': '#FEFEFE',
			'light-alt-1': '#FEFEFE',
			'light-alt-2': '#FCFCFC',
			'dark-primary': '#1B1B1B',
			'dark-high-contrast': '#191A1E',
			'dark-alt-1': '#16161C',
			'dark-alt-2': '#17191F',
		};

		const backgroundColor = themeBackgrounds[settings.theme] || themeBackgrounds['dark-primary'];
		document.body.style.backgroundColor = backgroundColor;
	}, [settings.theme]);

	const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
		setSettings((prevSettings) => {
			const newSettings = { ...prevSettings, [key]: value };
			localStorage.setItem('settings', JSON.stringify(newSettings));
			return newSettings;
		});
	};

	const AVAILABLE_THEMES = {
		light: {
			label: 'Light Themes',
			icon: ICONS.light,
			variants: [
				{
					id: 'light-primary',
					name: 'Light Default',
					background: lightTheme.neutral1,
					accent1: lightTheme.primary1,
				},
				{
					id: 'light-high-contrast',
					name: 'Light High Contrast',
					background: lightThemeHighContrast.neutral1,
					accent1: lightThemeHighContrast.neutral9,
				},
				{
					id: 'light-alt-1',
					name: 'Sunlit',
					background: lightThemeAlt1.neutral1,
					accent1: lightThemeAlt1.primary1,
				},
				{
					id: 'light-alt-2',
					name: 'Daybreak',
					background: lightThemeAlt2.neutral1,
					accent1: lightThemeAlt2.primary1,
				},
			],
		},
		dark: {
			label: 'Dark Themes',
			icon: ICONS.dark,
			variants: [
				{
					id: 'dark-primary',
					name: 'Dark Default',
					background: darkTheme.neutral1,
					accent1: darkTheme.primary1,
				},
				{
					id: 'dark-high-contrast',
					name: 'Dark High Contrast',
					background: darkThemeHighContrast.neutral1,
					accent1: darkThemeHighContrast.neutralA1,
				},
				{
					id: 'dark-alt-1',
					name: 'Eclipse',
					background: darkThemeAlt1.neutral1,
					accent1: darkThemeAlt1.primary1,
				},
				{
					id: 'dark-alt-2',
					name: 'Midnight',
					background: darkThemeAlt2.neutral1,
					accent1: darkThemeAlt2.primary1,
				},
			],
		},
	};

	function getTheme() {
		switch (settings.theme) {
			case 'light-primary':
				return theme(lightTheme);
			case 'light-high-contrast':
				return theme(lightThemeHighContrast);
			case 'light-alt-1':
				return theme(lightThemeAlt1);
			case 'light-alt-2':
				return theme(lightThemeAlt2);
			case 'dark-primary':
				return theme(darkTheme);
			case 'dark-high-contrast':
				return theme(darkThemeHighContrast);
			case 'dark-alt-1':
				return theme(darkThemeAlt1);
			case 'dark-alt-2':
				return theme(darkThemeAlt2);
			default:
				return theme(lightTheme);
		}
	}

	return (
		<SettingsContext.Provider
			value={{ settings: settings, updateSettings: updateSettings, availableThemes: AVAILABLE_THEMES }}
		>
			<ThemeProvider theme={getTheme()}>{props.children}</ThemeProvider>
		</SettingsContext.Provider>
	);
}
