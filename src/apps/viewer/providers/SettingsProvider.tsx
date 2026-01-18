import React from 'react';
import { ThemeProvider } from 'styled-components';
import WebFont from 'webfontloader';

import { ICONS } from 'helpers/config';
import { darkTheme, lightTheme, theme } from 'helpers/themes';
import { PortalThemeType } from 'helpers/types';
import { stripFontWeights } from 'helpers/utils';

import { usePortalProvider } from './PortalProvider';

interface Settings {
	theme: string;
	syncWithSystem: boolean;
	preferredLightTheme: string;
	preferredDarkTheme: string;
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
	syncWithSystem: true,
	preferredLightTheme: 'light-primary',
	preferredDarkTheme: 'dark-primary',
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
	const portalProvider = usePortalProvider();
	const preferredFallbackTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;

	const loadStoredSettings = (): Settings => {
		const stored = localStorage.getItem('settings');
		const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches
			? 'dark-primary'
			: 'light-primary';

		let settings: Settings;
		if (stored) {
			const parsedSettings = JSON.parse(stored);
			settings = {
				...parsedSettings,
				syncWithSystem: parsedSettings.syncWithSystem ?? true,
				preferredLightTheme: parsedSettings.preferredLightTheme ?? 'light-primary',
				preferredDarkTheme: parsedSettings.preferredDarkTheme ?? 'dark-primary',
			};
		} else {
			settings = {
				...defaultSettings,
				theme: preferredTheme,
			};
		}

		return settings;
	};

	const [settings, setSettings] = React.useState<Settings>(loadStoredSettings());

	// Listen for system theme changes when syncWithSystem is enabled
	React.useEffect(() => {
		if (!settings.syncWithSystem || !portalProvider.current?.themes) return;

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			const newTheme = e.matches ? settings.preferredDarkTheme : settings.preferredLightTheme;
			setSettings((prevSettings) => {
				const newSettings = { ...prevSettings, theme: newTheme };
				localStorage.setItem('settings', JSON.stringify(newSettings));
				return newSettings;
			});
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, [
		settings.syncWithSystem,
		settings.preferredLightTheme,
		settings.preferredDarkTheme,
		portalProvider.current?.themes,
	]);

	React.useEffect(() => {
		if (portalProvider.current?.fonts) {
			const fonts = portalProvider.current?.fonts;
			const families = [];

			if (fonts.headers) families.push(fonts.headers);
			if (fonts.body) families.push(fonts.body);

			if (families.length > 0) {
				WebFont.load({ google: { families: families } });
			}
		}
	}, [portalProvider.current?.fonts]);

	function luminance(hex) {
		const [r, g, b] = hexToRgbArray(hex).map((v) => v / 255);
		return 0.299 * r + 0.587 * g + 0.114 * b;
	}

	function parseRgbString(s) {
		return s.split(',').map((v) => parseInt(v, 10));
	}

	function rgbArrayToHex([r, g, b]) {
		return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
	}

	function hexToRgbArray(hex) {
		const n = parseInt(hex.slice(1), 16);
		return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
	}

	function shadeColor(hex, percent) {
		let [r, g, b] = hexToRgbArray(hex);
		if (percent > 0) {
			r += Math.round((255 - r) * (percent / 100));
			g += Math.round((255 - g) * (percent / 100));
			b += Math.round((255 - b) * (percent / 100));
		} else {
			r = Math.round(r * (1 + percent / 100));
			g = Math.round(g * (1 + percent / 100));
			b = Math.round(b * (1 + percent / 100));
		}
		return rgbArrayToHex([r, g, b]);
	}

	function createThemeFromCustom(currentTheme: PortalThemeType) {
		if (!currentTheme) return preferredFallbackTheme;

		const { colors, scheme } = currentTheme;

		const bgHex = rgbArrayToHex(parseRgbString(colors.background));
		const isBgDark = luminance(bgHex) < 0.5;

		const neutralPercents = isBgDark ? [0, 5, 10, 15, 20, 25, 30, 35, 40] : [0, -5, -10, -15, -20, -25, -30, -35, -40];

		const neutrals = neutralPercents.reduce((acc, pct, idx) => {
			acc[`neutral${idx + 1}`] = shadeColor(bgHex, pct);
			return acc;
		}, {});

		const accentPercents = isBgDark ? [100, 95, 90, 85, 80, 75, 70] : [-100, -95, -90, -85, -80, -75, -70];

		const neutralsA = accentPercents.reduce((acc, pct, idx) => {
			acc[`neutralA${idx + 1}`] = shadeColor(bgHex, pct);
			return acc;
		}, {});

		const primaryHex = rgbArrayToHex(parseRgbString(colors.primary));
		const linkHex = rgbArrayToHex(parseRgbString(colors.links));

		const theme: any = {
			scheme,
			...neutrals,
			...neutralsA,
			overlay1: 'rgba(0,0,0,0.45)',
			overlay2: 'rgba(0,0,0,0.5)',
			shadow1: 'rgba(220,220,220,0.5)',
			primary1: primaryHex,
			primary2: shadeColor(primaryHex, -20),
			link1: linkHex,
			link2: shadeColor(linkHex, -20),
			roles: {
				primary: primaryHex,
				alt1: primaryHex,
				alt2: primaryHex,
				alt3: primaryHex,
			},
			positive1: preferredFallbackTheme.positive1,
			positive2: preferredFallbackTheme.positive2,
			caution1: preferredFallbackTheme.caution1,
			negative1: preferredFallbackTheme.negative1,
			negative2: preferredFallbackTheme.negative2,
			light1: preferredFallbackTheme.light1,
			light2: preferredFallbackTheme.light2,
			light3: preferredFallbackTheme.light3,
			dark1: preferredFallbackTheme.dark1,
			dark2: preferredFallbackTheme.dark2,
			typography: {
				family: {
					primary: portalProvider.current?.fonts?.body,
					alt1: portalProvider.current?.fonts?.headers,
				},
			},
		};

		if (portalProvider.current?.fonts) {
			const { body, headers } = portalProvider.current.fonts;

			theme.typography = {
				family: {
					...(body && { primary: stripFontWeights(body) }),
					...(headers && { alt1: stripFontWeights(headers) }),
				},
			};
		}

		return theme;
	}

	const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
		React.startTransition(() => {
			setSettings((prevSettings) => {
				let newSettings = { ...prevSettings, [key]: value };

				// When changing theme and syncWithSystem is enabled, update the preferred theme
				if (key === 'theme' && prevSettings.syncWithSystem && portalProvider.current?.themes) {
					const themeValue = value as string;
					const selectedTheme = portalProvider.current.themes.find((t) => t.name === themeValue);
					const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

					if (selectedTheme) {
						if (selectedTheme.scheme === 'light') {
							newSettings.preferredLightTheme = themeValue;
							// Only apply the theme if system is currently in light mode
							if (!systemIsDark) {
								newSettings.theme = themeValue;
							} else {
								// Keep the current dark theme
								newSettings.theme = prevSettings.theme;
							}
						} else {
							newSettings.preferredDarkTheme = themeValue;
							// Only apply the theme if system is currently in dark mode
							if (systemIsDark) {
								newSettings.theme = themeValue;
							} else {
								// Keep the current light theme
								newSettings.theme = prevSettings.theme;
							}
						}
					}
				}

				// When disabling syncWithSystem, keep the current theme
				if (key === 'syncWithSystem' && value === false) {
					// Current theme stays as is
				}

				// When enabling syncWithSystem, switch to the appropriate preferred theme
				if (key === 'syncWithSystem' && value === true) {
					const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
					newSettings.theme = isDark ? prevSettings.preferredDarkTheme : prevSettings.preferredLightTheme;
				}

				localStorage.setItem('settings', JSON.stringify(newSettings));
				return newSettings;
			});
		});
	};

	function getAvailableThemes() {
		if (portalProvider.current?.themes) {
			const getVariants = (scheme: 'light' | 'dark') =>
				portalProvider.current.themes
					.filter((theme: PortalThemeType) => theme.scheme === scheme)
					.map((theme: PortalThemeType) => {
						return {
							id: theme.name,
							name: theme.name,
							background: rgbArrayToHex(parseRgbString(theme.colors.background)),
							accent1: rgbArrayToHex(parseRgbString(theme.colors.primary)),
						};
					});

			return {
				light: {
					label: 'Light Themes',
					icon: ICONS.light,
					variants: getVariants('light'),
				},
				dark: {
					label: 'Dark Themes',
					icon: ICONS.dark,
					variants: getVariants('dark'),
				},
			};
		}

		return null;
	}

	const currentTheme = React.useMemo(() => {
		if (!portalProvider.current?.themes) return theme(preferredFallbackTheme);

		let selectedTheme = portalProvider.current.themes.find((theme: PortalThemeType) => theme.name === settings.theme);

		const preferredScheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

		if (!selectedTheme) {
			const filteredThemes = portalProvider.current.themes.filter(
				(theme: PortalThemeType) => theme.scheme === preferredScheme
			);
			selectedTheme = filteredThemes[0];
			if (selectedTheme) updateSettings('theme', selectedTheme.name);
		}

		return theme(selectedTheme ? createThemeFromCustom(selectedTheme) : preferredFallbackTheme);
	}, [settings.theme, portalProvider.current?.themes]);

	const availableThemes = React.useMemo(() => getAvailableThemes(), [portalProvider.current?.themes]);

	return (
		<SettingsContext.Provider value={{ settings: settings, updateSettings: updateSettings, availableThemes }}>
			<ThemeProvider theme={currentTheme}>{props.children}</ThemeProvider>
		</SettingsContext.Provider>
	);
}
