import React from 'react';

import type { LitePortal, LitePost } from './data';
import { renderPost } from './render';
import styles from './styles.css?inline';
import { getLiteFontStylesheet, getLiteThemeVars } from './theme';

export function EngineLitePostPreview(props: {
	post: LitePost;
	themes: LitePortal['themes'];
	fonts: LitePortal['fonts'];
}) {
	const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	const source = React.useMemo(() => {
		const variables = Object.entries(getLiteThemeVars({ themes: props.themes || [], fonts: props.fonts }, scheme))
			.map(([key, value]) => `${key}:${value}`)
			.join(';');
		const fontStylesheet = getLiteFontStylesheet(props.fonts);
		const content = renderPost(props.post, '#', { showBackLink: false });
		return `<!DOCTYPE html>
			<html lang="en" data-lite-scheme="${scheme}" style="${variables};color-scheme:${scheme}">
				<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />${
					fontStylesheet ? `<link rel="stylesheet" href="${fontStylesheet}" />` : ''
				}<style>${styles}</style></head>
				<body><div id="portal">${content}</div></body>
			</html>`;
	}, [props.post, props.themes, props.fonts, scheme]);

	return <iframe title={'Engine Lite post preview'} srcDoc={source} sandbox={''} />;
}
