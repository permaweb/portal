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

export function initThemes(Themes: any[], Layout: any) {
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

  for (let theme of Themes) {

    // tmp fix
    if(theme.name === 'Dark Default') theme.name = "Dark";
    else if(theme.name === 'Light Default') theme.name = "Light"

    updateThemeStyles(theme.name, {
      // Basics
      '--color-primary': theme.basics.colors.primary,
      '--color-primary-contrast': theme.basics.colors.primaryContrast,
      '--color-secondary': theme.basics.colors.secondary,
      '--color-background': theme.basics.colors.background,
      '--color-text': theme.basics.colors.text,
      '--color-text-contrast': theme.basics.colors.textContrast,
      

      // Header
      '--color-header-background': getColor(theme, theme.header.colors.background),
      '--color-header-opacity': theme.header.preferences.opacity,
      '--color-header-border': getColor(theme, theme.header.colors.border),

      // Navigation
      '--color-navigation-background': `rgba(${theme.navigation.colors.background}, ${theme.navigation.preferences.opacity})`,
      '--color-navigation-border': getColor(theme, theme.navigation.colors.border),
      '--color-navigation-text': getColor(theme, theme.navigation.colors.text),
      '--color-navigation-text-hover': getColor(theme, theme.navigation.colors.hover),
      '--shadow-navigation-entry': theme.navigation.preferences.shadow,

      // Footer
      '--color-footer-background': getColor(theme, theme.footer.colors.background),

      // Content
      '--color-content-background': `rgba(${theme.content.colors.background},${theme.content.preferences.opacity})`,

      // Posts
      '--color-post-background': `rgba(${theme.posts.colors.background},${theme.posts.preferences.opacity})`,

      // Cards

      // Buttons
      '--color-button-default': `rgba(${getColor(theme, theme.buttons.default.default.colors.color)},1)`,
      '--color-button-default-background': `rgba(${getColor(theme, theme.buttons.default.default.colors.background)},${theme.buttons.default.default.preferences.opacity})`,
      '--color-button-default-border': `rgba(${getColor(theme, theme.buttons.default.default.colors.border)},1)`,
      '--color-button-default-hover': `rgba(${getColor(theme, theme.buttons.default.hover.colors.color)},1)`,
      '--color-button-default-hover-background': `rgba(${getColor(theme, theme.buttons.default.hover.colors.background)},${theme.buttons.default.hover.preferences.opacity})`,
      '--color-button-default-hover-border': `rgba(${getColor(theme, theme.buttons.default.hover.colors.border)},1)`,

      '--color-button-primary': `rgba(${getColor(theme, theme.buttons.primary.default.colors.color)},1)`,
      '--color-button-primary-background': `rgba(${getColor(theme, theme.buttons.primary.default.colors.background)},${theme.buttons.primary.default.preferences.opacity})`,
      '--color-button-primary-border': `rgba(${getColor(theme, theme.buttons.primary.default.colors.border)},1)`,
      '--color-button-primary-hover': `rgba(${getColor(theme, theme.buttons.primary.hover.colors.color)},1)`,
      '--color-button-primary-hover-background': `rgba(${getColor(theme, theme.buttons.primary.hover.colors.background)},${theme.buttons.primary.hover.preferences.opacity})`,
      '--color-button-primary-hover-border': `rgba(${getColor(theme, theme.buttons.primary.hover.colors.border)},1)`,

    });

    document.documentElement.style.setProperty('--border-radius', `${Layout.basics.borderRadius}px`);
  }  
}
