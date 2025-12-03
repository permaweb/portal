import React from 'react';
import Builder from 'engine/builder';
import SocialLinks from 'engine/components/socialLinks';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { GlobalStyles } from '../../../global-styles';

import * as S from './styles';

export default function Footer(props: any) {
	const { preview, layout, content } = props;
	const portalProvider = usePortalProvider();
	const { portal, footerFixed } = portalProvider;
	const Themes = preview ? defaultThemes : portal?.Themes;
	const Name = portal?.Name;

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
			<S.FooterWrapper $layout={layout} $theme={settings?.theme} id="Footer" $editFixed={footerFixed}>
				<S.Footer $layout={layout}>
					<Builder layout={content} preview={preview} />
					<SocialLinks isFooter />
					<S.Copyright $hasContentAbove={!!content?.content?.length || !!portal?.Links?.length}>
						{Name} 2025
					</S.Copyright>
				</S.Footer>
			</S.FooterWrapper>
		</>
	);
}
