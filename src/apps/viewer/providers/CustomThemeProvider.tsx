import React from 'react';
import { ThemeProvider } from 'styled-components';
import WebFont from 'webfontloader';

import { darkTheme, lightTheme, theme } from 'helpers/themes';
import { stripFontWeights } from 'helpers/utils';

import { usePortalProvider } from './PortalProvider';

interface CustomThemeProviderProps {
	children: React.ReactNode;
}
export function CustomThemeProvider(props: CustomThemeProviderProps) {
	const portalProvider = usePortalProvider();

	const preferredFallbackTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme;

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

	/** Compute relative luminance (0–1) */
	function luminance(hex) {
		const [r, g, b] = hexToRgbArray(hex).map((v) => v / 255);
		return 0.299 * r + 0.587 * g + 0.114 * b;
	}

	/** rgbString "r,g,b" → [r,g,b] */
	function parseRgbString(s) {
		return s.split(',').map((v) => parseInt(v, 10));
	}

	/** [r,g,b] → "#rrggbb" */
	function rgbArrayToHex([r, g, b]) {
		return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
	}

	/** hex → [r,g,b] */
	function hexToRgbArray(hex) {
		const n = parseInt(hex.slice(1), 16);
		return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
	}

	/** Shade a color by percent:
	 *  percent > 0 → lighten, percent < 0 → darken
	 */
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

	function createThemeFromCustom(customThemes) {
		if (!customThemes?.length) return preferredFallbackTheme;

		const active = customThemes.find((t) => t.active) || customThemes[0];
		const { colors, scheme } = active;

		// Base bg
		const bgHex = rgbArrayToHex(parseRgbString(colors.background));
		const isBgDark = luminance(bgHex) < 0.5;

		const neutralPercents = isBgDark
			? [0, 5, 10, 15, 20, 25, 30, 35, 40] // first = 0% lighten
			: [0, -5, -10, -15, -20, -25, -30, -35, -40]; // first = 0% darken

		const neutrals = neutralPercents.reduce((acc, pct, idx) => {
			acc[`neutral${idx + 1}`] = shadeColor(bgHex, pct);
			return acc;
		}, {});

		const accentPercents = isBgDark
			? [100, 95, 90, 85, 80, 75, 70] // White-ish for dark backgrounds
			: [-100, -95, -90, -85, -80, -75, -70]; // Black-ish for light backgrounds

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

	const customTheme = createThemeFromCustom(portalProvider.current?.themes ?? []);

	return <ThemeProvider theme={theme(customTheme ?? preferredFallbackTheme)}>{props.children}</ThemeProvider>;
}
