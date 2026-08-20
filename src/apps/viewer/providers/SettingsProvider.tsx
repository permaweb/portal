import React from 'react';
import { ThemeProvider } from 'styled-components';
import WebFont from 'webfontloader';

import { ICONS } from 'helpers/config';
import { mixRgbChannels, normalizePortalTheme, PortalThemeScheme, rgbChannelsToHex } from 'helpers/portalTheme';
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

type ThemeSelection = {
	id: string;
	scheme: PortalThemeScheme;
	theme: PortalThemeType;
};

const DEFAULT_THEME_NAME = 'Default';

function getSystemScheme(): PortalThemeScheme {
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getThemeName(portalTheme: PortalThemeType, index: number) {
	return typeof portalTheme?.name === 'string' && portalTheme.name.trim()
		? portalTheme.name.trim()
		: index === 0
		? DEFAULT_THEME_NAME
		: `Theme ${index + 1}`;
}

function getThemeId(portalTheme: PortalThemeType, index: number, scheme: PortalThemeScheme) {
	return `${getThemeName(portalTheme, index)}:${scheme}`;
}

const defaultSettings: Settings = {
	theme: `${DEFAULT_THEME_NAME}:${getSystemScheme()}`,
	syncWithSystem: true,
	preferredLightTheme: `${DEFAULT_THEME_NAME}:light`,
	preferredDarkTheme: `${DEFAULT_THEME_NAME}:dark`,
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
	const preferredFallbackTheme = getSystemScheme() === 'dark' ? darkTheme : lightTheme;

	const loadStoredSettings = (): Settings => {
		const stored = localStorage.getItem('settings');
		if (!stored) return defaultSettings;

		try {
			const parsedSettings = JSON.parse(stored);
			return {
				...defaultSettings,
				...parsedSettings,
				syncWithSystem: parsedSettings.syncWithSystem ?? true,
			};
		} catch {
			return defaultSettings;
		}
	};

	const [settings, setSettings] = React.useState<Settings>(loadStoredSettings());

	function getThemeSelection(
		themeId: string,
		fallbackScheme: PortalThemeScheme,
		requireScheme = false
	): ThemeSelection | null {
		const portalThemes = portalProvider.current?.themes;
		if (!Array.isArray(portalThemes) || !portalThemes.length) return null;

		for (let index = 0; index < portalThemes.length; index += 1) {
			const portalTheme = portalThemes[index];
			for (const scheme of ['light', 'dark'] as PortalThemeScheme[]) {
				if (portalTheme?.scheme && portalTheme.scheme !== scheme) continue;
				if (getThemeId(portalTheme, index, scheme) === themeId) {
					if (!requireScheme || scheme === fallbackScheme) {
						return { id: themeId, scheme, theme: portalTheme };
					}
				}
			}
		}

		const fallbackIndex = Math.max(
			0,
			portalThemes.findIndex((portalTheme: PortalThemeType) => portalTheme?.active || portalTheme?.Active)
		);
		const fallbackTheme =
			portalThemes.find(
				(portalTheme: PortalThemeType) => !portalTheme?.scheme || portalTheme.scheme === fallbackScheme
			) || portalThemes[fallbackIndex];
		const index = portalThemes.indexOf(fallbackTheme);
		const scheme =
			fallbackTheme?.scheme === 'dark' ? 'dark' : fallbackTheme?.scheme === 'light' ? 'light' : fallbackScheme;

		return {
			id: getThemeId(fallbackTheme, index, scheme),
			scheme,
			theme: fallbackTheme,
		};
	}

	React.useEffect(() => {
		if (!portalProvider.current?.themes?.length) return;

		setSettings((current) => {
			const light = getThemeSelection(current.preferredLightTheme, 'light', true);
			const dark = getThemeSelection(current.preferredDarkTheme, 'dark', true);
			const systemScheme = getSystemScheme();
			const selected = getThemeSelection(current.theme, systemScheme);
			const next = {
				...current,
				preferredLightTheme: light?.id || current.preferredLightTheme,
				preferredDarkTheme: dark?.id || current.preferredDarkTheme,
				theme: current.syncWithSystem
					? systemScheme === 'dark'
						? dark?.id || current.theme
						: light?.id || current.theme
					: selected?.id || current.theme,
			};

			if (JSON.stringify(next) === JSON.stringify(current)) return current;
			localStorage.setItem('settings', JSON.stringify(next));
			return next;
		});
	}, [portalProvider.current?.themes]);

	React.useEffect(() => {
		if (!settings.syncWithSystem || !portalProvider.current?.themes) return;

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (event: MediaQueryListEvent) => {
			const newTheme = event.matches ? settings.preferredDarkTheme : settings.preferredLightTheme;
			setSettings((current) => {
				const next = { ...current, theme: newTheme };
				localStorage.setItem('settings', JSON.stringify(next));
				return next;
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
		const fonts = portalProvider.current?.fonts;
		if (!fonts) return;

		const families = [fonts.headers, fonts.body].filter(Boolean);
		if (families.length) WebFont.load({ google: { families } });
	}, [portalProvider.current?.fonts]);

	function createThemeFromCustom(currentTheme: PortalThemeType, scheme: PortalThemeScheme) {
		const palette = normalizePortalTheme(currentTheme).colors[scheme];
		const backgroundHex = rgbChannelsToHex(palette.background);
		const surfaceHex = rgbChannelsToHex(palette.surface);
		const textHex = rgbChannelsToHex(palette.text);
		const borderHex = rgbChannelsToHex(palette.border);
		const primaryHex = rgbChannelsToHex(palette.accent);
		const neutralMixes = [0.06, 0.11, 0.17, 0.23, 0.34, 0.42];
		const textMixes = [0, 0.08, 0.14, 0.21, 0.29, 0.39, 0.5];

		const customTheme: any = {
			scheme,
			neutral1: backgroundHex,
			neutral2: surfaceHex,
			neutral3: rgbChannelsToHex(mixRgbChannels(palette.surface, palette.text, neutralMixes[0])),
			neutral4: rgbChannelsToHex(mixRgbChannels(palette.surface, palette.text, neutralMixes[1])),
			neutral5: rgbChannelsToHex(mixRgbChannels(palette.surface, palette.text, neutralMixes[2])),
			neutral6: borderHex,
			neutral7: rgbChannelsToHex(mixRgbChannels(palette.surface, palette.text, neutralMixes[3])),
			neutral8: rgbChannelsToHex(mixRgbChannels(palette.surface, palette.text, neutralMixes[4])),
			neutral9: rgbChannelsToHex(mixRgbChannels(palette.surface, palette.text, neutralMixes[5])),
			overlay1: 'rgba(0,0,0,0.45)',
			overlay2: 'rgba(0,0,0,0.5)',
			shadow1: 'rgba(0,0,0,0.15)',
			shadow2: 'rgba(0,0,0,0.25)',
			primary1: primaryHex,
			primary2: rgbChannelsToHex(mixRgbChannels(palette.accent, scheme === 'dark' ? '255,255,255' : '0,0,0', 0.2)),
			link1: rgbChannelsToHex(palette.link),
			link2: rgbChannelsToHex(mixRgbChannels(palette.link, scheme === 'dark' ? '255,255,255' : '0,0,0', 0.2)),
			roles: {
				primary: primaryHex,
				alt1: primaryHex,
				alt2: primaryHex,
				alt3: primaryHex,
			},
			editor: preferredFallbackTheme.editor,
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

		textMixes.forEach((amount, index) => {
			customTheme[`neutralA${index + 1}`] =
				index === 0 ? textHex : rgbChannelsToHex(mixRgbChannels(palette.text, palette.background, amount));
		});

		if (portalProvider.current?.fonts) {
			const { body, headers } = portalProvider.current.fonts;
			customTheme.typography.family = {
				...(body && { primary: stripFontWeights(body) }),
				...(headers && { alt1: stripFontWeights(headers) }),
			};
		}

		return customTheme;
	}

	const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
		React.startTransition(() => {
			setSettings((current) => {
				const next = { ...current, [key]: value };

				if (key === 'theme') {
					const selected = getThemeSelection(value as string, getSystemScheme());
					if (selected && current.syncWithSystem) {
						if (selected.scheme === 'light') next.preferredLightTheme = selected.id;
						else next.preferredDarkTheme = selected.id;
						next.theme = selected.scheme === getSystemScheme() ? selected.id : current.theme;
					}
				}

				if (key === 'syncWithSystem' && value === true) {
					next.theme = getSystemScheme() === 'dark' ? current.preferredDarkTheme : current.preferredLightTheme;
				}

				localStorage.setItem('settings', JSON.stringify(next));
				return next;
			});
		});
	};

	function getAvailableThemes() {
		const portalThemes = portalProvider.current?.themes;
		if (!Array.isArray(portalThemes) || !portalThemes.length) return null;

		const getVariants = (scheme: PortalThemeScheme) =>
			portalThemes
				.map((portalTheme: PortalThemeType, index: number) => ({ portalTheme, index }))
				.filter(({ portalTheme }) => !portalTheme?.scheme || portalTheme.scheme === scheme)
				.map(({ portalTheme, index }) => {
					const palette = normalizePortalTheme(portalTheme).colors[scheme];
					return {
						id: getThemeId(portalTheme, index, scheme),
						name: getThemeName(portalTheme, index),
						background: rgbChannelsToHex(palette.background),
						accent1: rgbChannelsToHex(palette.accent),
					};
				});

		return {
			light: { label: 'Light Themes', icon: ICONS.light, variants: getVariants('light') },
			dark: { label: 'Dark Themes', icon: ICONS.dark, variants: getVariants('dark') },
		};
	}

	const currentTheme = React.useMemo(() => {
		const selection = getThemeSelection(settings.theme, getSystemScheme());
		return theme(selection ? createThemeFromCustom(selection.theme, selection.scheme) : preferredFallbackTheme);
	}, [settings.theme, portalProvider.current?.themes, portalProvider.current?.fonts]);

	const availableThemes = React.useMemo(() => getAvailableThemes(), [portalProvider.current?.themes]);

	return (
		<SettingsContext.Provider value={{ settings, updateSettings, availableThemes }}>
			<ThemeProvider theme={currentTheme}>{props.children}</ThemeProvider>
		</SettingsContext.Provider>
	);
}
