import type { LitePortal } from './data';

function fontFamily(value: unknown) {
	const family = typeof value === 'string' ? value.split(':')[0].trim() : '';
	return family || 'Arial';
}

function color(theme: any, area: string, key: string, scheme: 'light' | 'dark', fallback: string) {
	const raw = theme?.[area]?.colors?.[key]?.[scheme];
	if (!raw) return fallback;
	const basic = theme?.basics?.colors?.[raw]?.[scheme];
	return basic || raw;
}

export function getLiteThemeVars(
	portal: Pick<LitePortal, 'themes' | 'fonts'>,
	scheme: 'light' | 'dark'
): Record<string, string> {
	const activeTheme = portal.themes?.find((theme) => theme?.active) || portal.themes?.[0] || {};
	const text = color(activeTheme, 'basics', 'text', scheme, scheme === 'dark' ? '255,255,255' : '0,0,0');
	const background = color(activeTheme, 'basics', 'background', scheme, scheme === 'dark' ? '0,0,0' : '250,250,250');
	const primary = color(activeTheme, 'basics', 'primary', scheme, '94,102,219');
	const surface = color(activeTheme, 'content', 'background', scheme, background);
	const border = color(activeTheme, 'basics', 'border', scheme, text);

	return {
		'--lite-text': `rgb(${text})`,
		'--lite-background': `rgb(${background})`,
		'--lite-surface': `rgb(${surface})`,
		'--lite-primary': `rgb(${primary})`,
		'--lite-muted': `rgba(${text}, 0.62)`,
		'--lite-faint': `rgba(${text}, 0.48)`,
		'--lite-border': `rgba(${border}, 0.16)`,
		'--lite-border-strong': `rgba(${border}, 0.48)`,
		'--lite-header-font': `'${fontFamily(portal.fonts?.headers)}', Arial, sans-serif`,
		'--lite-body-font': `'${fontFamily(portal.fonts?.body)}', Arial, sans-serif`,
	};
}

export function getLiteFontFamilies(fonts: LitePortal['fonts']) {
	return [...new Set([fonts?.headers, fonts?.body].filter((font): font is string => Boolean(font)))];
}

export function getLiteFontStylesheet(fonts: LitePortal['fonts']) {
	const families = getLiteFontFamilies(fonts);
	if (!families.length) return null;
	return `https://fonts.googleapis.com/css?family=${families
		.map((family) => family.trim())
		.map(encodeURIComponent)
		.join('|')}&display=swap`;
}
