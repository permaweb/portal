export function updateThemeStyles(theme: string, styles: Record<string, string>) {
  let styleEl = document.getElementById('dynamic-theme-style') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme-style';
    document.head.appendChild(styleEl);
  }
  const sheet = styleEl.sheet as CSSStyleSheet;
  const rule = `[theme='${theme}'], [data-theme='${theme}'] { ${Object.entries(styles).map(([k, v]) => `${k}: ${v};`).join(' ')} }`

  for (let i = 0; i < sheet.cssRules.length; i++) {
    if ((sheet.cssRules[i] as CSSStyleRule).selectorText === `[theme='${theme}']`) {
      sheet.deleteRule(i);
      break;
    }
  }
  sheet.insertRule(rule, sheet.cssRules.length);
}

export function initThemes(Themes: any[]) {  
  console.log('initThemes')
  const activeTheme = Themes.find((e: any) => e.active)

  function getColor(theme: any, value: string) {
    switch(value) {
      case 'primary': return theme.basics.colors.primary;
      case 'secondary': return theme.basics.colors.secondary;
      case 'background': return theme.basics.colors.background;
      case 'text': return theme.basics.colors.text;
      case 'border': return theme.basics.colors.border;
      default: return value;
    }
  }

  function setScheme(theme: any, scheme: string){
    updateThemeStyles(scheme, {
      // Basics
      '--color-text': theme.basics.colors.text[scheme],
      '--color-background': theme.basics.colors.background[scheme],
      '--color-primary': theme.basics.colors.primary[scheme],
      '--color-secondary': theme.basics.colors.secondary[scheme],

      // Header
      '--color-header-background': getColor(theme, theme.header.colors.background[scheme]),
      '--color-header-opacity': theme.header.preferences.opacity[scheme],
      '--color-header-border': getColor(theme, theme.header.colors.border[scheme]),

      // Navigation
      '--color-navigation-background': `rgba(${theme.navigation.colors.background[scheme]}, ${theme.navigation.preferences.opacity[scheme]})`,
      '--color-navigation-border': getColor(theme, theme.navigation.colors.border[scheme]),
      '--color-navigation-text': getColor(theme, theme.navigation.colors.text[scheme]),
      '--color-navigation-text-hover': getColor(theme, theme.navigation.colors.hover[scheme]),
      '--shadow-navigation-entry': theme.navigation.preferences.shadow[scheme],

      // Footer
      '--color-footer-background': getColor(theme, theme.footer.colors.background[scheme]),

      // Content
      '--color-content-background': `rgba(${theme.content.colors.background[scheme]},${theme.content.preferences.opacity[scheme]})`,

      // Cards
      // '--color-card-background': `rgba(${theme.card.colors.background[scheme]},${theme.card.preferences.opacity[scheme]})`,

      // Buttons
      '--color-button-default': `rgba(${getColor(theme, theme.buttons.default.default.colors.color[scheme])},1)`,
      '--color-button-default-background': `rgba(${getColor(theme, theme.buttons.default.default.colors.background[scheme])},${theme.buttons.default.default.preferences.opacity[scheme]})`,
      '--color-button-default-border': `rgba(${getColor(theme, theme.buttons.default.default.colors.border[scheme])},1)`,
      '--color-button-default-hover': `rgba(${getColor(theme, theme.buttons.default.hover.colors.color[scheme])},1)`,
      '--color-button-default-hover-background': `rgba(${getColor(theme, theme.buttons.default.hover.colors.background[scheme])},${theme.buttons.default.hover.preferences.opacity[scheme]})`,
      '--color-button-default-hover-border': `rgba(${getColor(theme, theme.buttons.default.hover.colors.border[scheme])},1)`,

      '--color-button-primary': `rgba(${getColor(theme, theme.buttons.primary.default.colors.color[scheme])},1)`,
      '--color-button-primary-background': `rgba(${getColor(theme, theme.buttons.primary.default.colors.background[scheme])},${theme.buttons.primary.default.preferences.opacity})`,
      '--color-button-primary-border': `rgba(${getColor(theme, theme.buttons.primary.default.colors.border[scheme])},1)`,
      '--color-button-primary-hover': `rgba(${getColor(theme, theme.buttons.primary.hover.colors.color[scheme])},1)`,
      '--color-button-primary-hover-background': `rgba(${getColor(theme, theme.buttons.primary.hover.colors.background[scheme])},${theme.buttons.primary.hover.preferences.opacity})`,
      '--color-button-primary-hover-border': `rgba(${getColor(theme, theme.buttons.primary.hover.colors.border[scheme])},1)`,

    });

    if(theme.basics.preferences) document.documentElement.style.setProperty('--border-radius', `${theme.basics.preferences.borderRadius}px`);
  }

  setScheme(activeTheme, 'dark');
  setScheme(activeTheme, 'light');
}
