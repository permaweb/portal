import { getPortalThemeContrast, mixRgbChannels, normalizePortalTheme } from 'helpers/portalTheme';

export function updateThemeStyles(theme: string, styles: Record<string, string>) {
	let styleEl = document.getElementById('dynamic-theme-style') as HTMLStyleElement;
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'dynamic-theme-style';
		document.head.appendChild(styleEl);
	}
	const sheet = styleEl.sheet as CSSStyleSheet;
	const selector = `[theme='${theme}'], [data-theme='${theme}']`;
	const rule = `${selector} { ${Object.entries(styles)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ')} }`;

	for (let index = 0; index < sheet.cssRules.length; index += 1) {
		const selectorText = (sheet.cssRules[index] as CSSStyleRule).selectorText?.replace(/"/g, "'");
		if (selectorText?.includes(`[theme='${theme}']`) || selectorText?.includes(`[data-theme='${theme}']`)) {
			sheet.deleteRule(index);
			break;
		}
	}
	sheet.insertRule(rule, sheet.cssRules.length);
}

export function getContrastColor(background: string): string {
	return getPortalThemeContrast(background);
}

export function generateColorFromId(id?: string): string {
	if (!id) return '128,128,128';
	let hash = 0;
	for (let index = 0; index < id.length; index += 1) hash = id.charCodeAt(index) + ((hash << 5) - hash);
	const hue = Math.abs(hash % 360);
	const saturation = 0.65;
	const lightness = 0.5;
	const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
	const component = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
	const match = lightness - chroma / 2;
	let red = 0;
	let green = 0;
	let blue = 0;
	if (hue < 60) [red, green] = [chroma, component];
	else if (hue < 120) [red, green] = [component, chroma];
	else if (hue < 180) [green, blue] = [chroma, component];
	else if (hue < 240) [green, blue] = [component, chroma];
	else if (hue < 300) [red, blue] = [component, chroma];
	else [red, blue] = [chroma, component];
	return [red, green, blue].map((channel) => Math.round((channel + match) * 255)).join(',');
}

function variables(theme: any, scheme: 'light' | 'dark') {
	const normalized = normalizePortalTheme(theme);
	const { text, background, surface, accent, link, border } = normalized.colors[scheme];
	const accentHover = mixRgbChannels(accent, scheme === 'dark' ? '255,255,255' : '0,0,0', 0.18);
	const linkHover = mixRgbChannels(link, scheme === 'dark' ? '255,255,255' : '0,0,0', 0.18);
	const textHover = mixRgbChannels(text, background, 0.18);
	return {
		'--color-text': text,
		'--color-text-contrast': getPortalThemeContrast(text),
		'--color-background': background,
		'--color-primary': accent,
		'--color-primary-contrast': getPortalThemeContrast(accent),
		'--color-secondary': accentHover,
		'--color-secondary-contrast': getPortalThemeContrast(accentHover),
		'--color-border': border,
		'--color-header-background': background,
		'--color-header-opacity': '1',
		'--color-header-border': border,
		'--preference-header-shadow': 'none',
		'--color-navigation-background': `rgb(${surface})`,
		'--color-navigation-border': border,
		'--color-navigation-text': text,
		'--color-navigation-text-hover': accent,
		'--preference-navigation-shadow': 'none',
		'--color-footer-background': background,
		'--color-footer-border': border,
		'--color-content-background': `rgb(${surface})`,
		'--color-post-background': `rgb(${surface})`,
		'--color-post-border': `rgba(${border},0.32)`,
		'--color-post-border-contrast': `rgb(${getPortalThemeContrast(border)})`,
		'--preference-post-border-width': '1px',
		'--preference-post-padding': '20px',
		'--preference-post-shadow': 'none',
		'--color-card-background': `rgb(${surface})`,
		'--color-card-border': `rgba(${border},0.32)`,
		'--color-card-border-contrast': `rgb(${getPortalThemeContrast(border)})`,
		'--preference-card-shadow': 'none',
		'--color-button-default': `rgb(${getPortalThemeContrast(text)})`,
		'--color-button-default-background': `rgb(${text})`,
		'--color-button-default-border': `rgb(${text})`,
		'--color-button-default-hover': `rgb(${getPortalThemeContrast(textHover)})`,
		'--color-button-default-hover-background': `rgb(${textHover})`,
		'--color-button-default-hover-border': `rgb(${textHover})`,
		'--color-button-primary': `rgb(${getPortalThemeContrast(accent)})`,
		'--color-button-primary-background': `rgb(${accent})`,
		'--color-button-primary-border': `rgb(${accent})`,
		'--color-button-primary-hover': `rgb(${getPortalThemeContrast(accentHover)})`,
		'--color-button-primary-hover-background': `rgb(${accentHover})`,
		'--color-button-primary-hover-border': `rgb(${accentHover})`,
		'--color-link-default': `rgb(${link})`,
		'--color-link-hover': `rgb(${linkHover})`,
		'--preference-link-text-decoration-default': 'underline',
		'--preference-link-text-decoration-hover': 'underline',
		'--preference-link-font-weight-default': 'normal',
		'--preference-link-font-weight-hover': 'normal',
		'--preference-link-font-style-default': 'normal',
		'--preference-link-font-style-hover': 'normal',
		'--border-radius': `${normalized.borderRadius}px`,
	};
}

export function initThemes(themes: any[]) {
	if (!Array.isArray(themes) || !themes.length) return;
	const activeTheme = themes.find((theme) => theme?.active) || themes[0];
	updateThemeStyles('light', variables(activeTheme, 'light'));
	updateThemeStyles('dark', variables(activeTheme, 'dark'));
}
