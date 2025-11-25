export function updateThemeStyles(theme: string, styles: Record<string, string>) {
	let styleEl = document.getElementById('dynamic-theme-style') as HTMLStyleElement;
	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'dynamic-theme-style';
		document.head.appendChild(styleEl);
	}
	const sheet = styleEl.sheet as CSSStyleSheet;
	const rule = `[theme='${theme}'], [data-theme='${theme}'] { ${Object.entries(styles)
		.map(([k, v]) => `${k}: ${v};`)
		.join(' ')} }`;

	for (let i = 0; i < sheet.cssRules.length; i++) {
		if ((sheet.cssRules[i] as CSSStyleRule).selectorText === `[theme='${theme}']`) {
			sheet.deleteRule(i);
			break;
		}
	}
	sheet.insertRule(rule, sheet.cssRules.length);
}

export function getContrastColor(bg: string): string {
	const rgba = bg.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
	const r = parseInt(rgba[0]);
	const g = parseInt(rgba[1]);
	const b = parseInt(rgba[2]);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? '0,0,0' : '255,255,255';
}

export function generateColorFromId(id?: string): string {
	if (!id) return '128, 128, 128';

	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = id.charCodeAt(i) + ((hash << 5) - hash);
	}

	const hue = Math.abs(hash % 360);
	const saturation = 65;
	const lightness = 50;

	const c = ((1 - Math.abs((2 * lightness) / 100 - 1)) * saturation) / 100;
	const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
	const m = lightness / 100 - c / 2;

	let r = 0,
		g = 0,
		b = 0;
	if (hue >= 0 && hue < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (hue >= 60 && hue < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (hue >= 120 && hue < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (hue >= 180 && hue < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (hue >= 240 && hue < 300) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	const red = Math.round((r + m) * 255);
	const green = Math.round((g + m) * 255);
	const blue = Math.round((b + m) * 255);

	return `${red}, ${green}, ${blue}`;
}

export function initThemes(Themes: any[]) {
	const activeTheme = Themes.find((e: any) => e.active);

	function getColor(theme: any, scheme: string, value: string) {
		switch (value) {
			case 'primary':
				return theme.basics.colors.primary[scheme];
			case 'secondary':
				return theme.basics.colors.secondary[scheme];
			case 'background':
				return theme.basics.colors.background[scheme];
			case 'text':
				return theme.basics.colors.text[scheme];
			case 'border':
				return theme.basics.colors.border[scheme];
			default:
				return value;
		}
	}

	function setScheme(theme: any, scheme: string) {
		if (!theme.basics) return null;
		updateThemeStyles(scheme, {
			// Basics
			'--color-text': theme.basics.colors.text[scheme],
			'--color-text-contrast': getContrastColor(theme.basics.colors.text[scheme]),
			'--color-background': theme.basics.colors.background[scheme],
			'--color-primary': theme.basics.colors.primary[scheme],
			'--color-primary-contrast': getContrastColor(theme.basics.colors.primary[scheme]),
			'--color-secondary': theme.basics.colors.secondary[scheme],
			'--color-secondary-contrast': getContrastColor(theme.basics.colors.secondary[scheme]),
			'--color-border': theme.basics.colors.border[scheme],

			// Header
			'--color-header-background': getColor(theme, scheme, theme.header.colors.background[scheme]),
			'--color-header-opacity': theme.header.preferences.opacity[scheme],
			'--color-header-border': getColor(theme, scheme, theme.header.colors.border[scheme]),

			// Navigation
			'--color-navigation-background': `rgba(${theme.navigation.colors.background[scheme]}, ${theme.navigation.preferences.opacity[scheme]})`,
			'--color-navigation-border': getColor(theme, scheme, theme.navigation.colors.border[scheme]),
			'--color-navigation-text': getColor(theme, scheme, theme.navigation.colors.text[scheme]),
			'--color-navigation-text-hover': getColor(theme, scheme, theme.navigation.colors.hover[scheme]),
			'--shadow-navigation-entry': theme.navigation.preferences.shadow[scheme],

			// Footer
			'--color-footer-background': getColor(theme, scheme, theme.footer.colors.background[scheme]),

			// Content
			'--color-content-background': `rgba(${theme.content.colors.background[scheme]},${theme.content.preferences.opacity[scheme]})`,

			// Posts
			...(theme?.post
				? {
						'--color-post-background': `rgba(${getColor(theme, scheme, theme.post.colors.background[scheme])},${
							theme.post.preferences.opacity[scheme]
						})`,
						'--color-post-border': `rgba(${getColor(theme, scheme, theme.post.colors.border[scheme])},1)`,
						'--color-post-border-contrast': `rgba(${getContrastColor(
							getColor(theme, scheme, theme.post.colors.border[scheme])
						)},1)`,
				  }
				: {}),

			// Cards
			'--color-card-background': `rgba(${getColor(theme, scheme, theme.card.colors.background[scheme])},${
				theme.card.preferences.opacity[scheme]
			})`,
			'--color-card-border': `rgba(${getColor(theme, scheme, theme.card.colors.border[scheme])},1)`,
			'--color-card-border-contrast': `rgba(${getContrastColor(
				getColor(theme, scheme, theme.card.colors.border[scheme])
			)},1)`,

			// Buttons
			'--color-button-default': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.default.default.colors.color[scheme]
			)},1)`,
			'--color-button-default-background': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.default.default.colors.background[scheme]
			)},${theme.buttons.default.default.preferences.opacity[scheme]})`,
			'--color-button-default-border': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.default.default.colors.border[scheme]
			)},1)`,
			'--color-button-default-hover': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.default.hover.colors.color[scheme]
			)},1)`,
			'--color-button-default-hover-background': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.default.hover.colors.background[scheme]
			)},${theme.buttons.default.hover.preferences.opacity[scheme]})`,
			'--color-button-default-hover-border': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.default.hover.colors.border[scheme]
			)},1)`,

			'--color-button-primary': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.primary.default.colors.color[scheme]
			)},1)`,
			'--color-button-primary-background': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.primary.default.colors.background[scheme]
			)},${theme.buttons.primary.default.preferences.opacity})`,
			'--color-button-primary-border': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.primary.default.colors.border[scheme]
			)},1)`,
			'--color-button-primary-hover': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.primary.hover.colors.color[scheme]
			)},1)`,
			'--color-button-primary-hover-background': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.primary.hover.colors.background[scheme]
			)},${theme.buttons.primary.hover.preferences.opacity})`,
			'--color-button-primary-hover-border': `rgba(${getColor(
				theme,
				scheme,
				theme.buttons.primary.hover.colors.border[scheme]
			)},1)`,

			// Links
			...(theme?.links?.colors?.default &&
			theme?.links?.colors?.hover &&
			theme?.links?.preferences?.default &&
			theme?.links?.preferences?.hover
				? {
						'--color-link-default': `rgba(${getColor(theme, scheme, theme.links.colors.default[scheme])},1)`,
						'--color-link-hover': `rgba(${getColor(theme, scheme, theme.links.colors.hover[scheme])},1)`,
						'--link-text-decoration-default': theme.links.preferences.default.underline ? 'underline' : 'none',
						'--link-text-decoration-hover': theme.links.preferences.hover.underline ? 'underline' : 'none',
						'--link-font-weight-default': theme.links.preferences.default.bold ? 'bold' : 'normal',
						'--link-font-weight-hover': theme.links.preferences.hover.bold ? 'bold' : 'normal',
						'--link-font-style-default': theme.links.preferences.default.cursive ? 'italic' : 'normal',
						'--link-font-style-hover': theme.links.preferences.hover.cursive ? 'italic' : 'normal',
				  }
				: {}),
		});

		if (theme.basics.preferences)
			document.documentElement.style.setProperty('--border-radius', `${theme.basics.preferences.borderRadius}px`);
	}

	setScheme(activeTheme, 'dark');
	setScheme(activeTheme, 'light');
}
