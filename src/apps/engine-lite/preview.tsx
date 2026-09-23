import React from 'react';

import { type LitePortal, type LitePost, normalizeLayout } from './data';
import { attachDocsSidebar, attachDocsTableOfContents } from './docs';
import { renderDocs, renderPost, renderShell } from './render';
import styles from './styles.css?inline';
import { getLiteFontStylesheet, getLiteThemeVars } from './theme';

const DOCS_PREVIEW_SCRIPT = `<script>
(() => {
	const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>';
	const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>';
	(${attachDocsSidebar.toString()})(document, { collapsed: false, mobileOpen: false, query: '', collapsedCategories: new Set() });
	(${attachDocsTableOfContents.toString()})(document);
	const scrollToId = (id) => {
		let targetId = id;
		try { targetId = decodeURIComponent(id); } catch {}
		const target = document.getElementById(targetId);
		if (!target) return false;
		window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 95, behavior: 'smooth' });
		return true;
	};
	document.querySelectorAll('.lite-docs-copy a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
		if (scrollToId((link.getAttribute('href') || '').slice(1))) event.preventDefault();
	}));
	document.querySelectorAll('.lite-docs-copy pre').forEach((block) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'lite-code-copy';
		button.title = 'Copy code';
		button.setAttribute('aria-label', 'Copy code');
		button.innerHTML = copyIcon;
		button.addEventListener('click', async () => {
			const value = block.querySelector('code')?.textContent || '';
			let copied = false;
			try { await navigator.clipboard.writeText(value); copied = true; } catch {
				const textarea = document.createElement('textarea');
				textarea.value = value;
				document.body.appendChild(textarea);
				textarea.select();
				copied = document.execCommand('copy');
				textarea.remove();
			}
			if (!copied) return;
			button.classList.add('is-copied');
			button.title = 'Copied';
			button.setAttribute('aria-label', 'Copied code');
			button.innerHTML = checkIcon;
			window.setTimeout(() => {
				button.classList.remove('is-copied');
				button.title = 'Copy code';
				button.setAttribute('aria-label', 'Copy code');
				button.innerHTML = copyIcon;
			}, 2000);
		});
		block.appendChild(button);
	});
})();
</script>`;

export function EngineLitePostPreview(props: {
	post: LitePost;
	themes: LitePortal['themes'];
	fonts: LitePortal['fonts'];
	layout?: unknown;
	portalName?: string;
}) {
	const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	const source = React.useMemo(() => {
		const layout = normalizeLayout(props.layout);
		const portal: LitePortal = {
			id: 'preview',
			name: props.portalName || 'Portal',
			description: '',
			logo: null,
			icon: null,
			fonts: props.fonts,
			themes: props.themes || [],
			layout,
			featuredPosts: [],
			posts: [props.post],
		};
		const variables = Object.entries(getLiteThemeVars(portal, scheme))
			.map(([key, value]) => `${key}:${value}`)
			.join(';');
		const fontStylesheet = getLiteFontStylesheet(props.fonts);
		const content =
			layout === 'docs'
				? renderShell(
						renderDocs(portal, props.post, () => '#'),
						portal,
						'#',
						null,
						'system',
						props.post,
						() => '#'
				  )
				: renderPost(props.post, '#', { showBackLink: false });
		return `<!DOCTYPE html>
			<html lang="en" data-lite-scheme="${scheme}" style="${variables};color-scheme:${scheme}">
				<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />${
					fontStylesheet ? `<link rel="stylesheet" href="${fontStylesheet}" />` : ''
				}<style>${styles}</style></head>
				<body><div id="portal">${layout === 'docs' ? content : `<div class="lite-shell is-${layout}">${content}</div>`}</div>${
			layout === 'docs'
				? DOCS_PREVIEW_SCRIPT +
				  `<script>
			const themes = ${JSON.stringify({
				light: getLiteThemeVars(portal, 'light'),
				dark: getLiteThemeVars(portal, 'dark'),
			}).replace(/</g, '\\u003c')};
			document.querySelectorAll('[data-theme-mode]').forEach((button) => button.addEventListener('click', () => {
				const mode = button.dataset.themeMode;
				const scheme = mode === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
				Object.entries(themes[scheme]).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
				document.documentElement.dataset.liteScheme = scheme;
				document.documentElement.style.colorScheme = scheme;
				document.querySelectorAll('[data-theme-mode]').forEach((entry) => {
					entry.classList.toggle('is-active', entry === button);
					entry.setAttribute('aria-pressed', String(entry === button));
				});
			}));
		</script>`
				: ''
		}</body>
			</html>`;
	}, [props.post, props.themes, props.fonts, props.layout, props.portalName, scheme]);

	return <iframe title={'Engine Lite post preview'} srcDoc={source} sandbox={'allow-scripts'} />;
}
