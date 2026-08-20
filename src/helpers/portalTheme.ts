export type PortalThemeScheme = 'light' | 'dark';
export type PortalThemeColorKey = 'background' | 'surface' | 'text' | 'accent' | 'link' | 'border';

export type PortalThemePalette = Record<PortalThemeColorKey, string>;

export type SimplePortalTheme = {
	colors: Record<PortalThemeScheme, PortalThemePalette>;
	borderRadius: number;
};

export const DEFAULT_PORTAL_THEME: SimplePortalTheme = {
	colors: {
		light: {
			background: '250,250,250',
			surface: '255,255,255',
			text: '0,0,0',
			accent: '94,102,219',
			link: '94,102,219',
			border: '50,50,50',
		},
		dark: {
			background: '0,0,0',
			surface: '0,0,0',
			text: '255,255,255',
			accent: '94,102,219',
			link: '94,102,219',
			border: '160,160,160',
		},
	},
	borderRadius: 10,
};

const LEGACY_KEY_BY_COLOR: Record<PortalThemeColorKey, string> = {
	background: 'background',
	surface: 'background',
	text: 'text',
	accent: 'primary',
	link: 'primary',
	border: 'border',
};

function clampChannel(value: number) {
	return Math.max(0, Math.min(255, Math.round(value)));
}

export function normalizeRgbChannels(value: unknown, fallback: string): string {
	if (typeof value !== 'string') return fallback;
	const trimmed = value.trim();
	const namedColors: Record<string, string> = {
		black: '0,0,0',
		white: '255,255,255',
		red: '255,0,0',
		green: '0,128,0',
		blue: '0,0,255',
		gray: '128,128,128',
		grey: '128,128,128',
	};
	if (namedColors[trimmed.toLowerCase()]) return namedColors[trimmed.toLowerCase()];

	const shortHex = trimmed.match(/^#([\da-f])([\da-f])([\da-f])$/i);
	const longHex = trimmed.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
	if (shortHex) {
		return shortHex
			.slice(1)
			.map((channel) => parseInt(`${channel}${channel}`, 16))
			.join(',');
	}
	if (longHex)
		return longHex
			.slice(1)
			.map((channel) => parseInt(channel, 16))
			.join(',');

	const channelString = trimmed.replace(/^rgba?\(|\)$/gi, '').split('/')[0];
	const channels = channelString
		.split(channelString.includes(',') ? ',' : /\s+/)
		.slice(0, 3)
		.map((channel) => Number(channel.trim()));
	if (channels.length !== 3 || channels.some((channel) => !Number.isFinite(channel))) return fallback;
	return channels.map(clampChannel).join(',');
}

function legacyBasicColor(theme: any, key: string, scheme: PortalThemeScheme) {
	return theme?.basics?.colors?.[key]?.[scheme];
}

function resolveLegacyValue(theme: any, value: unknown, scheme: PortalThemeScheme, fallback: string) {
	if (typeof value !== 'string') return fallback;
	const referenced = legacyBasicColor(theme, value, scheme);
	return normalizeRgbChannels(referenced ?? value, fallback);
}

export function getPortalThemeColor(theme: any, key: PortalThemeColorKey, scheme: PortalThemeScheme): string {
	const fallback = DEFAULT_PORTAL_THEME.colors[scheme][key];
	const simpleValue = theme?.colors?.[scheme]?.[key];
	if (simpleValue !== undefined) return normalizeRgbChannels(simpleValue, fallback);

	if (theme?.scheme === scheme) {
		const flatKey = key === 'surface' ? 'background' : key === 'link' ? 'links' : LEGACY_KEY_BY_COLOR[key];
		const flatValue = theme?.colors?.[flatKey];
		if (flatValue !== undefined) return normalizeRgbChannels(flatValue, fallback);
	}

	if (key === 'surface') {
		return resolveLegacyValue(theme, theme?.content?.colors?.background?.[scheme], scheme, fallback);
	}
	if (key === 'link') {
		return resolveLegacyValue(
			theme,
			theme?.links?.colors?.default?.[scheme] ?? legacyBasicColor(theme, 'primary', scheme),
			scheme,
			fallback
		);
	}

	return resolveLegacyValue(theme, legacyBasicColor(theme, LEGACY_KEY_BY_COLOR[key], scheme), scheme, fallback);
}

export function normalizePortalTheme(theme: any): SimplePortalTheme {
	const radius = Number(theme?.borderRadius ?? theme?.basics?.preferences?.borderRadius);
	return {
		colors: {
			light: {
				background: getPortalThemeColor(theme, 'background', 'light'),
				surface: getPortalThemeColor(theme, 'surface', 'light'),
				text: getPortalThemeColor(theme, 'text', 'light'),
				accent: getPortalThemeColor(theme, 'accent', 'light'),
				link: getPortalThemeColor(theme, 'link', 'light'),
				border: getPortalThemeColor(theme, 'border', 'light'),
			},
			dark: {
				background: getPortalThemeColor(theme, 'background', 'dark'),
				surface: getPortalThemeColor(theme, 'surface', 'dark'),
				text: getPortalThemeColor(theme, 'text', 'dark'),
				accent: getPortalThemeColor(theme, 'accent', 'dark'),
				link: getPortalThemeColor(theme, 'link', 'dark'),
				border: getPortalThemeColor(theme, 'border', 'dark'),
			},
		},
		borderRadius: Number.isFinite(radius)
			? Math.max(0, Math.min(24, Math.round(radius)))
			: DEFAULT_PORTAL_THEME.borderRadius,
	};
}

export function getPortalThemeContrast(rgb: string) {
	const [red, green, blue] = normalizeRgbChannels(rgb, '0,0,0').split(',').map(Number);
	const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
	return luminance > 0.6 ? '0,0,0' : '255,255,255';
}

export function mixRgbChannels(source: string, target: string, amount: number) {
	const sourceChannels = normalizeRgbChannels(source, '0,0,0').split(',').map(Number);
	const targetChannels = normalizeRgbChannels(target, '0,0,0').split(',').map(Number);
	const ratio = Math.max(0, Math.min(1, amount));
	return sourceChannels
		.map((channel, index) => clampChannel(channel + (targetChannels[index] - channel) * ratio))
		.join(',');
}

export function rgbChannelsToHex(rgb: string) {
	return `#${normalizeRgbChannels(rgb, '0,0,0')
		.split(',')
		.map((channel) => Number(channel).toString(16).padStart(2, '0'))
		.join('')}`;
}

export function hexToRgbChannels(hex: string) {
	return normalizeRgbChannels(hex, '0,0,0');
}
