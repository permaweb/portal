import React from 'react';
import { NavLink } from 'react-router-dom';
import Builder from 'engine/builder';
import SocialLinks from 'engine/components/socialLinks';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { getRedirect } from 'helpers/utils';

import { GlobalStyles } from '../../../global-styles';

import * as S from './styles';

export default function Footer(props: any) {
	const { preview, layout, content } = props;
	const portalProvider = usePortalProvider();
	const { portal, footerFixed } = portalProvider;
	const navPosition = portal?.Layout?.navigation?.layout?.position;
	const isSideNav = navPosition === 'left' || navPosition === 'right';
	const Themes = preview ? defaultThemes : portal?.Themes;
	const Name = portal?.Name;

	const { settings } = preview ? { settings: { theme: 'dark' } } : useSettings();

	const staticPages = React.useMemo(() => {
		if (!portal?.Pages) return [];
		return Object.entries(portal.Pages)
			.filter(([_, page]: [string, any]) => page?.type === 'static')
			.map(([key, page]: [string, any]) => ({ key, ...page }));
	}, [portal?.Pages]);

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, [preview]);

	return (
		<>
			{preview && <GlobalStyles />}
			<S.FooterWrapper
				$layout={layout}
				$theme={settings?.theme}
				id="Footer"
				$editFixed={footerFixed}
				$isSideNav={isSideNav}
			>
				<S.Footer
					$layout={layout}
					$isSideNav={isSideNav}
					$navWidth={portal?.Layout?.navigation?.layout?.width}
					$maxWidth={portal?.Layout?.basics?.maxWidth}
				>
					<Builder layout={content} preview={preview} />
					{staticPages.length > 0 && (
						<S.Links>
							{staticPages.map((page: any) => (
								<NavLink key={`footer-static-${page.key}`} to={getRedirect(`post/${page.id}`)}>
									{page.name}
								</NavLink>
							))}
						</S.Links>
					)}
					<SocialLinks isFooter />
					<S.Copyright
						$hasContentAbove={!!content?.content?.length || !!portal?.Links?.length || staticPages.length > 0}
					>
						{Name} 2025
					</S.Copyright>
				</S.Footer>
			</S.FooterWrapper>
		</>
	);
}
