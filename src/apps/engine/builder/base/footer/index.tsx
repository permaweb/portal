import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import Builder from 'engine/builder';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { getTxEndpoint } from 'helpers/endpoints';

import { GlobalStyles } from '../../../global-styles';

import * as S from './styles';

export default function Footer(props: any) {
	const { preview, layout, content } = props;
	const { portal } = usePortalProvider();
	const Themes = preview ? defaultThemes : portal?.Themes;
	const Name = portal?.Name;
	const Links = portal?.Links;

	const { settings } = preview ? { settings: { theme: 'dark' } } : useSettings();

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, [preview]);

	return (
		<>
			{preview && <GlobalStyles />}
			<S.FooterWrapper $layout={layout} $theme={settings?.theme} id="Footer">
				<S.Footer $layout={layout}>
					<Builder layout={content} preview={preview} />
					{Links && (
						<S.Links>
							{Links.map((link: any, index: number) => (
								<S.LinkWrapper key={index}>
									<Link to={link.url} target="_blank" rel="noopener noreferrer">
										<ReactSVG src={getTxEndpoint(link.icon)} />
									</Link>
								</S.LinkWrapper>
							))}
						</S.Links>
					)}
					<S.Copyright>{Name} 2025</S.Copyright>
				</S.Footer>
			</S.FooterWrapper>
		</>
	);
}
