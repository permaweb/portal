import React from 'react';

import type { LitePortal, LitePost } from './data';
import { renderPost, renderShell } from './render';
import styles from './styles.css?inline';
import { getLiteFontStylesheet, getLiteThemeVars } from './theme';

export function EngineLitePostPreview(props: {
	post: LitePost;
	themes: LitePortal['themes'];
	fonts: LitePortal['fonts'];
	portalName?: string | null;
	portalLogo?: string | null;
}) {
	const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	const source = React.useMemo(() => {
		const variables = Object.entries(getLiteThemeVars({ themes: props.themes || [], fonts: props.fonts }, scheme))
			.map(([key, value]) => `${key}:${value}`)
			.join(';');
		const fontStylesheet = getLiteFontStylesheet(props.fonts);
		const portalLogo = /^[a-zA-Z0-9_-]{43}$/.test(props.portalLogo || '')
			? `https://arweave.net/${props.portalLogo}`
			: props.portalLogo || null;
		const content = renderShell(
			renderPost(props.post, '#'),
			{ name: props.portalName || 'Portal', logo: portalLogo },
			'#',
			null,
			'system'
		);
		return `<!DOCTYPE html>
			<html lang="en" data-lite-scheme="${scheme}" style="${variables};color-scheme:${scheme}">
				<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />${
					fontStylesheet ? `<link rel="stylesheet" href="${fontStylesheet}" />` : ''
				}<style>${styles}</style></head>
				<body><div id="portal">${content}</div></body>
			</html>`;
	}, [props.post, props.themes, props.fonts, props.portalName, props.portalLogo, scheme]);

	return <iframe title={'Engine Lite post preview'} srcDoc={source} sandbox={''} />;
}
