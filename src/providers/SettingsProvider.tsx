import React from 'react';
import { debounce } from 'lodash';
import { ThemeProvider } from 'styled-components';

import { STYLING } from 'helpers/config';
import { darkTheme, lightTheme, theme } from 'helpers/themes';
import { checkWindowCutoff } from 'helpers/window';

type ThemeType = 'light' | 'dark';

interface Settings {
	theme: ThemeType;
	sidebarOpen: boolean;
	isDesktop: boolean;
}

interface SettingsContextState {
	settings: Settings;
	updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

interface SettingsProviderProps {
	children: React.ReactNode;
}

const defaultSettings: Settings = {
	theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
	sidebarOpen: true,
	isDesktop: true,
};

const SettingsContext = React.createContext<SettingsContextState>({
	settings: defaultSettings,
	updateSettings: () => {},
});

export function useSettingsProvider(): SettingsContextState {
	return React.useContext(SettingsContext);
}

export function SettingsProvider(props: SettingsProviderProps) {
	const loadStoredSettings = (): Settings => {
		const stored = localStorage.getItem('settings');
		const isDesktop = checkWindowCutoff(parseInt(STYLING.cutoffs.desktop));
		const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

		let settings: Settings;
		if (stored) {
			const parsedSettings = JSON.parse(stored);
			settings = {
				...parsedSettings,
				isDesktop,
				sidebarOpen: isDesktop ? parsedSettings.sidebarOpen : false,
			};
		} else {
			settings = {
				...defaultSettings,
				theme: preferredTheme, // Use the preferred theme instead of defaultSettings.theme
				isDesktop,
				sidebarOpen: isDesktop,
			};
		}

		return settings;
	};

	const [settings, setSettings] = React.useState<Settings>(loadStoredSettings());
	const [isDesktop, _setIsDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));

	const handleWindowResize = React.useCallback(() => {
		const newIsDesktop = checkWindowCutoff(parseInt(STYLING.cutoffs.desktop));
		const newSettings = {
			...settings,
			isDesktop: newIsDesktop,
			sidebarOpen: newIsDesktop ? settings.sidebarOpen : settings.isDesktop ? false : settings.sidebarOpen,
		};
		setSettings(newSettings);
		localStorage.setItem('settings', JSON.stringify(newSettings));
	}, [settings]);

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), [handleWindowResize]);

	React.useEffect(() => {
		handleWindowResize();
		window.addEventListener('resize', debouncedResize);

		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, []);

	React.useEffect(() => {
		if (!isDesktop && settings.sidebarOpen) {
			document.body.style.overflowY = 'hidden';
		} else {
			document.body.style.overflowY = 'auto';
		}

		return () => {
			document.body.style.overflowY = 'auto';
		};
	}, [isDesktop, settings.sidebarOpen]);

	const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
		const newSettings = { ...settings, [key]: value };
		localStorage.setItem('settings', JSON.stringify(newSettings));
		setSettings(newSettings);
	};

	function getTheme() {
		const themeObject = settings.theme === 'light' ? lightTheme : darkTheme;
		return theme(themeObject);
	}

	return (
		<SettingsContext.Provider value={{ settings, updateSettings }}>
			<ThemeProvider theme={getTheme()}>{props.children}</ThemeProvider>
		</SettingsContext.Provider>
	);
}
