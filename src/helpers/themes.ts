import { DefaultTheme } from 'styled-components';

export const common = {
	positive1: '#64B686',
	positive2: '#4EA673',
	caution1: '#EECA00',
	negative1: '#F16A82',
	negative2: '#EE4463',
	editorLight: {
		primary: '#ec3063',
		alt1: '#13ab8f',
		alt2: '#5E66DB',
		alt3: '#00a66b',
		alt4: '#006dff',
		alt5: '#8580d9',
		alt6: '#FF5722',
		alt7: '#FFC107',
		alt8: '#1681c7',
		alt9: '#8BC34A',
		alt10: '#3a3a3a',
	},
	editorDark: {
		primary: '#D975E6',
		alt1: '#62c1b1',
		alt2: '#45c6ae',
		alt3: '#5bdcbf',
		alt4: '#67cac0',
		alt5: '#8580d9',
		alt6: '#FFC107',
		alt7: '#FFC107',
		alt8: '#7EBEEF',
		alt9: '#4AC37E',
		alt10: '#BCBCBC',
	},
	roles: {
		primary: '#F38284',
		alt1: '#59b3b9',
		alt2: '#8886D9',
		alt3: '#EE9339',
	},
};

export const lightTheme = {
	scheme: 'light',
	...common,
	editor: { ...common.editorLight },
	neutral1: '#FFFFFF',
	neutral2: '#F9F9F9',
	neutral3: '#F0F0F0',
	neutral4: '#E4E4E4',
	neutral5: '#D6D6D6',
	neutral6: '#C1C1C1',
	neutral7: '#ADADAD',
	neutral8: '#A3A3A3',
	neutral9: '#8F8F8F',
	neutralA1: '#151515',
	neutralA2: '#333333',
	neutralA3: '#3D3D3D',
	neutralA4: '#474747',
	neutralA5: '#525252',
	neutralA6: '#666666',
	neutralA7: '#707070',
	overlay1: 'rgb(0, 0, 0, .45)',
	overlay2: 'rgb(0, 0, 0, .5)',
	shadow1: 'rgb(200, 200, 200, .15)',
	shadow2: 'rgb(0, 0, 0, .15)',
	primary1: '#5E66DB',
	primary2: '#454CB0',
	light1: '#FFFFFF',
	light2: '#DADADA',
	light3: '#B3B3B3',
	dark1: '#151515',
	dark2: '#333333',
	link1: '#0074E4',
	link2: '#0069CC',
};

export const lightThemeHighContrast = {
	scheme: 'light',
	...common,
	editor: { ...common.editorLight },
	neutral1: '#FEFEFE',
	neutral2: '#F0F0F0',
	neutral3: '#E0E0E0',
	neutral4: '#BDBDBD',
	neutral5: '#8C8C8C',
	neutral6: '#545454',
	neutral7: '#616161',
	neutral8: '#424242',
	neutral9: '#212121',
	neutralA1: '#000000',
	neutralA2: '#212121',
	neutralA3: '#424242',
	neutralA4: '#3A3A3A',
	neutralA5: '#0A0A0A',
	neutralA6: '#9E9E9E',
	neutralA7: '#BDBDBD',
	overlay1: 'rgb(0, 0, 0, .45)',
	overlay2: 'rgb(0, 0, 0, .5)',
	shadow1: 'rgb(200, 200, 200, .15)',
	shadow2: 'rgb(0, 0, 0, .15)',
	primary1: '#5E66DB',
	primary2: '#454CB0',
	light1: '#FFFFFF',
	light2: '#F2F2F2',
	light3: '#B0B0B0',
	dark1: '#151515',
	dark2: '#333333',
	link1: '#0074E4',
	link2: '#0069CC',
};

export const lightThemeAlt1 = {
	scheme: 'light',
	...common,
	editor: { ...common.editorLight },
	neutral1: '#FEFEFE',
	neutral2: '#F9F9F9',
	neutral3: '#F0F0F0',
	neutral4: '#C9C9C9',
	neutral5: '#BFBFBF',
	neutral6: '#B3B3B3',
	neutral7: '#A6A6A6',
	neutral8: '#999999',
	neutral9: '#8D8D8D',
	neutralA1: '#1C1C1C',
	neutralA2: '#393939',
	neutralA3: '#454545',
	neutralA4: '#505050',
	neutralA5: '#3A3A3A',
	neutralA6: '#787878',
	neutralA7: '#858585',
	overlay1: 'rgba(0, 0, 0, 0.4)',
	overlay2: 'rgba(0, 0, 0, 0.55)',
	shadow1: 'rgb(200, 200, 200, .15)',
	shadow2: 'rgb(0, 0, 0, .15)',
	primary1: '#DB5461',
	primary2: '#D43545',
	light1: '#FFFFFF',
	light2: '#E5E5E5',
	light3: '#BFBFBF',
	dark1: '#1C1C1C',
	dark2: '#383838',
	link1: '#0074E4',
	link2: '#0069CC',
};

export const lightThemeAlt2 = {
	scheme: 'light',
	...common,
	editor: { ...common.editorLight },
	positive1: '#5AB6A0',
	positive2: '#4BAA94',
	neutral1: '#FEFEFE',
	neutral2: '#F7F7F7',
	neutral3: '#F0F0F0',
	neutral4: '#C9C9C9',
	neutral5: '#BFBFBF',
	neutral6: '#B3B3B3',
	neutral7: '#A6A6A6',
	neutral8: '#999999',
	neutral9: '#8D8D8D',
	neutralA1: '#1C1C1C',
	neutralA2: '#393939',
	neutralA3: '#454545',
	neutralA4: '#505050',
	neutralA5: '#3A3A3A',
	neutralA6: '#787878',
	neutralA7: '#858585',
	overlay1: 'rgba(0, 0, 0, 0.4)',
	overlay2: 'rgba(0, 0, 0, 0.55)',
	shadow1: 'rgb(200, 200, 200, .15)',
	shadow2: 'rgb(0, 0, 0, .15)',
	primary1: '#5AB6A0',
	primary2: '#4BAA94',
	light1: '#FFFFFF',
	light2: '#E3E3E3',
	light3: '#BCBCBC',
	dark1: '#1C1C1C',
	dark2: '#393939',
	link1: '#0C84CB',
	link2: '#2274A5',
};

export const darkTheme = {
	scheme: 'dark',
	...common,
	editor: { ...common.editorDark },
	positive1: '#38BD80',
	positive2: '#2F9D6A',
	neutral1: '#1B1B1B',
	neutral2: '#202020',
	neutral3: '#2D2D2D',
	neutral4: '#2F2F2F',
	neutral5: '#3D3D3D',
	neutral6: '#474747',
	neutral7: '#525252',
	neutral8: '#5C5C5C',
	neutral9: '#666666',
	neutralA1: '#F9F9F9',
	neutralA2: '#E4E4E4',
	neutralA3: '#D6D6D6',
	neutralA4: '#CCCCCC',
	neutralA5: '#CDCDCD',
	neutralA6: '#8F8F8F',
	neutralA7: '#707070',
	overlay1: 'rgb(0, 0, 0, .35)',
	overlay2: 'rgb(0, 0, 0, .5)',
	shadow1: 'rgb(0, 0, 0, .5)',
	shadow2: 'rgb(0, 0, 0, .55)',
	primary1: '#5E66DB',
	primary2: '#454CB0',
	light1: '#FFFFFF',
	light2: '#DADADA',
	light3: '#B3B3B3',
	dark1: '#151515',
	dark2: '#333333',
	link1: '#4DA8FF',
	link2: '#0074E4',
};

export const darkThemeHighContrast = {
	scheme: 'dark',
	...common,
	editor: { ...common.editorDark },
	positive1: '#38BD80',
	positive2: '#2F9D6A',
	neutral1: '#101013',
	neutral2: '#161619',
	neutral3: '#1d1e23',
	neutral4: '#2a2c33',
	neutral5: '#40434b',
	neutral6: '#b9b9cc',
	neutral7: '#62656d',
	neutral8: '#6e7179',
	neutral9: '#7d7f87',
	neutralA1: '#FAFAFA',
	neutralA2: '#f0f1f3',
	neutralA3: '#e0e2e5',
	neutralA4: '#c9ccd1',
	neutralA5: '#bfc4cb',
	neutralA6: '#999ea6',
	neutralA7: '#7f848c',
	overlay1: 'rgba(0, 0, 0, 0.4)',
	overlay2: 'rgba(0, 0, 0, 0.6)',
	shadow1: 'rgba(0, 0, 0, 0.5)',
	shadow2: 'rgb(0, 0, 0, .55)',
	primary1: '#5E66DB',
	primary2: '#454CB0',
	light1: '#FFFFFF',
	light2: '#EAEAEA',
	light3: '#C2C2C2',
	dark1: '#151515',
	dark2: '#333333',
	link1: '#009AF7',
	link2: '#0074E4',
};

export const darkThemeAlt1 = {
	scheme: 'dark',
	...common,
	editor: { ...common.editorDark },
	positive1: '#38BD80',
	positive2: '#2F9D6A',
	neutral1: '#16161c',
	neutral2: '#1D1E24',
	neutral3: '#23242A',
	neutral4: '#282930',
	neutral5: '#2E2F36',
	neutral6: '#474952',
	neutral7: '#3A3B42',
	neutral8: '#404148',
	neutral9: '#47484F',
	neutralA1: '#F9F9F9',
	neutralA2: '#E4E4E4',
	neutralA3: '#D6D6D6',
	neutralA4: '#CCCCCC',
	neutralA5: '#CFCFCF',
	neutralA6: '#8F8F8F',
	neutralA7: '#707070',
	overlay1: 'rgb(0, 0, 0, .35)',
	overlay2: 'rgb(0, 0, 0, .5)',
	shadow1: '#17191f85',
	shadow2: '#17191f85',
	primary1: '#DB5461',
	primary2: '#D43545',
	light1: '#FFFFFF',
	light2: '#DADADA',
	light3: '#B3B3B3',
	dark1: '#151515',
	dark2: '#333333',
	link1: '#4DA8FF',
	link2: '#0074E4',
};

export const darkThemeAlt2 = {
	scheme: 'dark',
	...common,
	editor: { ...common.editorDark },
	positive1: '#38BD80',
	positive2: '#2F9D6A',
	neutral1: '#17191f',
	neutral2: '#1c1f25',
	neutral3: '#262834',
	neutral4: '#2E2F34',
	neutral5: '#3d3e45',
	neutral6: '#484953',
	neutral7: '#52545F',
	neutral8: '#4D4F57',
	neutral9: '#36363F',
	neutralA1: '#F9F9F9',
	neutralA2: '#E4E4E4',
	neutralA3: '#D6D6D6',
	neutralA4: '#CCCCCC',
	neutralA5: '#CFCFCF',
	neutralA6: '#8F8F8F',
	neutralA7: '#707070',
	overlay1: 'rgb(0, 0, 0, .35)',
	overlay2: 'rgb(0, 0, 0, .5)',
	shadow1: '#17191f85',
	shadow2: '#17191f85',
	primary1: '#5AB6A0',
	primary2: '#4BAA94',
	light1: '#FFFFFF',
	light2: '#DADADA',
	light3: '#B3B3B3',
	dark1: '#151515',
	dark2: '#333333',
	link1: '#00B1CC',
	link2: '#00ccbf',
};

export const theme = (currentTheme: any): DefaultTheme => ({
	scheme: currentTheme.scheme,
	colors: {
		accordion: {
			background: currentTheme.neutral1,
			hover: currentTheme.neutral2,
			color: currentTheme.neutralA1,
		},
		border: {
			primary: currentTheme.neutral6,
			alt1: currentTheme.neutral7,
			alt2: currentTheme.neutral8,
			alt3: currentTheme.neutral9,
			alt4: currentTheme.neutralA7,
			alt5: currentTheme.primary1,
			alt6: currentTheme.primary2,
			alt7: currentTheme.neutralA5,
			alt8: currentTheme.dark2,
			alt9: currentTheme.neutral3,
		},
		editor: {
			primary: currentTheme.editor.primary,
			alt1: currentTheme.editor.alt1,
			alt2: currentTheme.editor.alt2,
			alt3: currentTheme.editor.alt3,
			alt4: currentTheme.editor.alt4,
			alt5: currentTheme.editor.alt5,
			alt6: currentTheme.editor.alt6,
			alt7: currentTheme.editor.alt7,
			alt8: currentTheme.editor.alt8,
			alt9: currentTheme.editor.alt9,
			alt10: currentTheme.editor.alt10,
		},
		button: {
			primary: {
				background: currentTheme.neutral2,
				border: currentTheme.neutral6,
				color: currentTheme.neutralA1,
				active: {
					background: currentTheme.neutral3,
					border: currentTheme.neutral8,
					color: currentTheme.neutralA1,
				},
				disabled: {
					background: currentTheme.neutral3,
					border: currentTheme.neutral5,
					color: currentTheme.neutral7,
				},
			},
			alt1: {
				background: currentTheme.primary1,
				border: currentTheme.primary1,
				color: currentTheme.light1,
				active: {
					background: currentTheme.primary2,
					border: currentTheme.primary2,
					color: currentTheme.light1,
				},
				disabled: {
					background: currentTheme.neutral3,
					border: currentTheme.neutral5,
					color: currentTheme.neutral7,
				},
			},
			alt2: {
				background: currentTheme.neutralA1,
				border: currentTheme.neutralA1,
				color: currentTheme.neutralA1,
				active: {
					background: currentTheme.neutralA4,
					border: currentTheme.neutralA4,
					color: currentTheme.neutralA4,
				},
				disabled: {
					background: currentTheme.neutral3,
					border: currentTheme.neutral3,
					color: currentTheme.neutral7,
				},
			},
		},
		checkbox: {
			active: {
				background: currentTheme.primary1,
			},
			background: currentTheme.neutral1,
			hover: currentTheme.neutral3,
			disabled: currentTheme.neutral5,
		},
		container: {
			primary: {
				background: currentTheme.neutral1,
				active: currentTheme.neutral3,
			},
			alt1: {
				background: currentTheme.neutral2,
			},
			alt2: {
				background: currentTheme.neutral3,
			},
			alt3: {
				background: currentTheme.neutral4,
			},
			alt4: {
				background: currentTheme.neutral5,
			},
			alt5: {
				background: currentTheme.neutralA4,
			},
			alt6: {
				background: currentTheme.primary1,
			},
			alt7: {
				background: currentTheme.neutralA3,
			},
			alt8: {
				background: currentTheme.dark1,
			},
			alt9: {
				background: currentTheme.primary1,
			},
			alt10: {
				background: currentTheme.primary2,
			},
			alt11: {
				background: currentTheme.dark2,
			},
		},
		contrast: {
			background: currentTheme.dark2,
			border: currentTheme.neutral9,
			color: currentTheme.light1,
		},
		font: {
			primary: currentTheme.neutralA1,
			alt1: currentTheme.neutralA5,
			alt2: currentTheme.neutralA4,
			alt3: currentTheme.neutral8,
			alt4: currentTheme.neutral1,
			alt5: currentTheme.primary1,
			light1: currentTheme.light1,
			light2: currentTheme.light2,
			light3: currentTheme.light3,
			dark1: currentTheme.dark1,
			dark2: currentTheme.dark2,
		},
		form: {
			background: currentTheme.neutral1,
			border: currentTheme.neutral6,
			invalid: {
				outline: currentTheme.negative1,
				shadow: currentTheme.negative2,
			},
			valid: {
				outline: currentTheme.primary1,
				shadow: currentTheme.primary2,
			},
			disabled: {
				background: currentTheme.neutral2,
				border: currentTheme.neutral5,
				label: currentTheme.neutralA2,
			},
		},
		gradient: {
			start: currentTheme.primary1,
			middle: currentTheme.primary1,
			end: currentTheme.primary2,
		},
		icon: {
			primary: {
				fill: currentTheme.neutralA4,
				active: currentTheme.neutral3,
				disabled: currentTheme.neutralA3,
			},
			alt1: {
				fill: currentTheme.neutral4,
				active: currentTheme.neutral5,
				disabled: currentTheme.neutral3,
			},
			alt2: {
				fill: currentTheme.neutralA1,
				active: currentTheme.neutralA4,
				disabled: currentTheme.neutral3,
			},
			alt3: {
				fill: currentTheme.neutralA2,
				active: currentTheme.neutral1,
				disabled: currentTheme.neutral3,
			},
		},
		indicator: {
			base: currentTheme.positive2,
			active: currentTheme.positive1,
			neutral: currentTheme.caution1,
			alt1: currentTheme.negative2,
		},
		link: {
			color: currentTheme.link1,
			active: currentTheme.link2,
		},
		loader: {
			primary: currentTheme.primary1,
		},
		overlay: {
			primary: currentTheme.overlay1,
			alt1: currentTheme.overlay2,
		},
		roles: {
			primary: currentTheme.roles.primary,
			alt1: currentTheme.roles.alt1,
			alt2: currentTheme.roles.alt2,
			alt3: currentTheme.roles.alt3,
		},
		row: {
			active: {
				background: currentTheme.neutral3,
				border: currentTheme.neutral2,
			},
			hover: {
				background: currentTheme.neutral2,
			},
		},
		scrollbar: {
			track: currentTheme.neutral2,
			thumb: currentTheme.neutral5,
		},
		shadow: {
			primary: currentTheme.shadow1,
			alt1: currentTheme.shadow2,
		},
		status: {
			draft: currentTheme.caution1,
			published: currentTheme.positive1,
		},
		tabs: {
			color: currentTheme.neutralA4,
			active: {
				background: currentTheme.primary1,
				color: currentTheme.neutralA1,
			},
		},
		view: {
			background: currentTheme.neutral1,
		},
		warning: {
			primary: currentTheme.negative1,
			background: currentTheme.primary1,
			alt1: currentTheme.negative2,
		},
	},
	typography: {
		family: {
			primary: currentTheme.typography?.family?.primary ?? `'Open Sans', sans-serif`,
			alt1: currentTheme.typography?.family?.alt1 ?? `'Crimson Pro', serif`,
		},
		size: {
			xxxxSmall: '11px',
			xxxSmall: '12px',
			xxSmall: '13px',
			xSmall: '14px',
			small: '15px',
			base: '16px',
			lg: '18px',
			xLg: '24px',
			xxLg: 'clamp(26px, 2.5vw, 28px)',
			h1: 'clamp(28.8px, 2.8vw, 44.8px)',
			h2: 'clamp(27.2px, 2.6vw, 40px)',
			h4: 'clamp(25.6px, 2.5vw, 38.6px)',
		},
		weight: {
			light: '300',
			regular: '400',
			medium: '500',
			bold: '600',
			xBold: '700',
		},
	},
});

export function getThemeVars(theme: any, scheme: 'light' | 'dark') {
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

	function getContrastColor(bg: string) {
		const rgba = bg.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
		const [r, g, b] = rgba.map(Number);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.6 ? '0,0,0' : '255,255,255';
	}

	const vars: Record<string, string> = {
		'--color-text': theme.basics?.colors?.text?.[scheme] ?? '0,0,0',
		'--color-text-contrast': getContrastColor(theme.basics?.colors?.text?.[scheme] ?? '0,0,0'),
		'--color-background': theme.basics?.colors?.background?.[scheme] ?? '255,255,255',
		'--color-primary': theme.basics?.colors?.primary?.[scheme] ?? '0,122,255',
		'--color-primary-contrast': getContrastColor(theme.basics?.colors?.primary?.[scheme] ?? '0,122,255'),
		'--color-secondary': theme.basics?.colors?.secondary?.[scheme] ?? '128,128,128',
		'--color-secondary-contrast': getContrastColor(theme.basics?.colors?.secondary?.[scheme] ?? '128,128,128'),
		'--color-border': theme.basics?.colors?.border?.[scheme] ?? '200,200,200',
		'--color-header-background': getColor(theme, scheme, theme.header?.colors?.background?.[scheme] ?? 'inherit'),
		'--color-content-background': `rgba(${theme.content?.colors?.background?.[scheme] ?? '255,255,255'},${
			theme.content?.preferences?.opacity?.[scheme] ?? 1
		})`,
		'--color-post-background': `rgba(${getColor(
			theme,
			scheme,
			theme.post?.colors?.background?.[scheme] ?? 'inherit'
		)},${theme.post?.preferences?.opacity?.[scheme] ?? 1})`,
		'--color-card-background': `rgba(${getColor(
			theme,
			scheme,
			theme.card?.colors?.background?.[scheme] ?? 'inherit'
		)},${theme.card?.preferences?.opacity?.[scheme] ?? 1})`,
		'--border-radius': `${theme.basics?.preferences?.borderRadius ?? 8}px`,
	};

	if (
		theme?.links?.colors?.default &&
		theme?.links?.colors?.hover &&
		theme?.links?.preferences?.default &&
		theme?.links?.preferences?.hover
	) {
		vars['--color-link-default'] = `rgba(${getColor(theme, scheme, theme.links.colors.default[scheme])},1)`;
		vars['--color-link-hover'] = `rgba(${getColor(theme, scheme, theme.links.colors.hover[scheme])},1)`;
		vars['--preference-link-text-decoration-default'] = theme.links.preferences.default.underline
			? 'underline'
			: 'none';
		vars['--preference-link-text-decoration-hover'] = theme.links.preferences.hover.underline ? 'underline' : 'none';
		vars['--preference-link-font-weight-default'] = theme.links.preferences.default.bold ? 'bold' : 'normal';
		vars['--preference-link-font-weight-hover'] = theme.links.preferences.hover.bold ? 'bold' : 'normal';
		vars['--preference-link-font-style-default'] = theme.links.preferences.default.cursive ? 'italic' : 'normal';
		vars['--preference-link-font-style-hover'] = theme.links.preferences.hover.cursive ? 'italic' : 'normal';
	}

	return vars;
}
