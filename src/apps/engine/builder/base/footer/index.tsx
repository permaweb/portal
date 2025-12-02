import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import Builder from 'engine/builder';
import SocialLinks from 'engine/components/socialLinks';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { getTxEndpoint } from 'helpers/endpoints';

import { GlobalStyles } from '../../../global-styles';

import * as S from './styles';

export default function Footer(props: any) {
	const { preview, layout, content } = props;
	const portalProvider = usePortalProvider();
	const { portal, layoutHeights, setLayoutHeights, footerFixed, layoutEditMode } = portalProvider;
	const [isDragging, setIsDragging] = React.useState(false);
	const [startY, setStartY] = React.useState(0);
	const [startHeight, setStartHeight] = React.useState(0);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		setStartY(e.clientY);
		setStartHeight(layoutHeights.footer);
	};

	React.useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const delta = startY - e.clientY;
			const newHeight = Math.max(100, Math.min(500, startHeight + delta));
			setLayoutHeights({ ...layoutHeights, footer: newHeight });
		};

		const handleMouseUp = () => setIsDragging(false);

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, startY, startHeight, layoutHeights, setLayoutHeights]);
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
			<S.FooterWrapper
				$layout={layout}
				$theme={settings?.theme}
				id="Footer"
				$editHeight={layoutHeights.footer}
				$editFixed={footerFixed}
			>
				{layoutEditMode && (
					<S.ResizeHandle $isDragging={isDragging} onMouseDown={handleMouseDown}>
						<S.HandleBar>
							<S.HandleLabel>Footer ({layoutHeights.footer}px)</S.HandleLabel>
						</S.HandleBar>
					</S.ResizeHandle>
				)}
				<S.Footer $layout={layout}>
					<Builder layout={content} preview={preview} />
					<SocialLinks isFooter />
					<S.Copyright>{Name} 2025</S.Copyright>
				</S.Footer>
			</S.FooterWrapper>
		</>
	);
}
