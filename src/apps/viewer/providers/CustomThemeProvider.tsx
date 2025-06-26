import { ThemeProvider } from 'styled-components';

import { lightTheme, theme } from 'helpers/themes';

import { usePortalProvider } from './PortalProvider';

interface CustomThemeProviderProps {
	children: React.ReactNode;
}

export function CustomThemeProvider(props: CustomThemeProviderProps) {
	const portalProvider = usePortalProvider();

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

	function rgbStringToHex(rgbString) {
		// Split on commas, trim whitespace, and parse to numbers
		const parts = rgbString.split(',').map((s) => s.trim());
		if (parts.length !== 3) {
			throw new Error(`Invalid RGB string: "${rgbString}"`);
		}

		const [r, g, b] = parts.map((s) => {
			const n = Number(s);
			if (!Number.isInteger(n) || n < 0 || n > 255) {
				throw new Error(`RGB component out of range: "${s}"`);
			}
			return n;
		});

		// Convert each to a two-digit hex string
		const toHex = (n) => n.toString(16).padStart(2, '0');

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
	}

	function createThemeFromCustom(customThemes) {
		if (!customThemes?.length) return lightTheme;

		const active = customThemes.find((t) => t.active) || customThemes[0];
		const { colors, scheme } = active;

		// Base bg
		const bgHex = rgbArrayToHex(parseRgbString(colors.background));
		const isBgDark = luminance(bgHex) < 0.5;

		// Move toward mid-gray
		const neutralPercents = isBgDark
			? [5, 10, 15, 20, 25, 30, 35, 40, 45] // Lighten in steps
			: [-5, -10, -15, -20, -25, -30, -35, -40, -45]; // Darken in steps

		const neutrals = neutralPercents.reduce((acc, pct, idx) => {
			acc[`neutral${idx + 1}`] = shadeColor(bgHex, pct);
			return acc;
		}, {});

		const accentPercents = isBgDark
			? [95, 80, 75, 70, 65, 60, 55] // Light text on dark bg
			: [-95, -80, -75, -70, -65, -60, -55]; // Dark text on light bg

		const neutralsA = accentPercents.reduce((acc, pct, idx) => {
			acc[`neutralA${idx + 1}`] = shadeColor(bgHex, pct);
			return acc;
		}, {});

		const primaryHex = rgbArrayToHex(parseRgbString(colors.primary));
		const linkHex = rgbArrayToHex(parseRgbString(colors.links));

		const theme = {
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
				alt1: rgbStringToHex(colors.menus),
				alt2: rgbStringToHex(colors.secondary),
				alt3: rgbStringToHex(colors.sections),
			},
			positive1: lightTheme.positive1,
			positive2: lightTheme.positive2,
			caution1: lightTheme.caution1,
			negative1: lightTheme.negative1,
			negative2: lightTheme.negative2,
			light1: lightTheme.light1,
			light2: lightTheme.light2,
			light3: lightTheme.light3,
			dark1: lightTheme.dark1,
			dark2: lightTheme.dark2,
		};

		return theme;
	}

	const customTheme = createThemeFromCustom(portalProvider.current?.themes ?? []);

	return <ThemeProvider theme={theme(customTheme)}>{props.children}</ThemeProvider>;
}
