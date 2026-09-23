import { mixRgbChannels, normalizePortalTheme } from 'helpers/portalTheme';

import type { LitePortal } from './data';

function fontFamily(value: unknown) {
	const family = typeof value === 'string' ? value.split(':')[0].trim() : '';
	return family || 'Arial';
}

export function getLiteThemeVars(
	portal: Pick<LitePortal, 'themes' | 'fonts'>,
	scheme: 'light' | 'dark'
): Record<string, string> {
	const activeTheme = normalizePortalTheme(portal.themes?.find((theme) => theme?.active) || portal.themes?.[0]);
	const { text, background, surface, accent, link, border } = activeTheme.colors[scheme];
	const linkHover = mixRgbChannels(link, text, 0.18);
	const altSurface = mixRgbChannels(surface, text, scheme === 'dark' ? 0.06 : 0.035);

	const variables = {
		'--lite-text': `rgb(${text})`,
		'--lite-background': `rgb(${background})`,
		'--lite-surface': `rgb(${surface})`,
		'--lite-alt-surface': `rgb(${altSurface})`,
		'--lite-primary': `rgb(${accent})`,
		'--lite-link': `rgb(${link})`,
		'--lite-link-hover': `rgb(${linkHover})`,
		'--lite-muted': `rgba(${text}, 0.62)`,
		'--lite-faint': `rgba(${text}, 0.48)`,
		'--lite-border': `rgba(${border}, 0.32)`,
		'--lite-border-strong': `rgba(${border}, 0.65)`,
		'--lite-radius': `${activeTheme.borderRadius}px`,
		'--lite-code-primary': `rgb(${link})`,
		'--lite-code-function': `rgb(${accent})`,
		'--lite-code-number': `rgb(${mixRgbChannels(accent, text, 0.35)})`,
		'--lite-code-deleted': `rgb(${mixRgbChannels(link, text, 0.2)})`,
		'--lite-code-inserted': `rgb(${mixRgbChannels(accent, text, 0.2)})`,
		'--lite-header-font': `'${fontFamily(portal.fonts?.headers)}', Arial, sans-serif`,
		'--lite-body-font': `'${fontFamily(portal.fonts?.body)}', Arial, sans-serif`,
	};
	return variables;
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
