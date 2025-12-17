import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import SocialLinks from 'engine/components/socialLinks';
import Toggle from 'engine/components/toggle';
import WalletConnect from 'engine/components/wallet/walletConnect';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { getRedirect } from 'helpers/utils';

import { GlobalStyles } from '../../../global-styles';
import Search from '../navigation/search';

import * as S from './styles';

export default function Header(props: any) {
	const { name, layout, content, preview } = props;
	const portalProvider = usePortalProvider();
	const { portal, layoutHeights, setLayoutHeights, logoSettings, layoutEditMode, headerSticky } = portalProvider;

	const navPosition = portal?.Layout?.navigation?.layout?.position;
	const isSideNav = navPosition === 'left' || navPosition === 'right';
	const [isDragging, setIsDragging] = React.useState(false);
	const [startY, setStartY] = React.useState(0);
	const [startHeight, setStartHeight] = React.useState(0);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		setStartY(e.clientY);
		setStartHeight(layoutHeights.header);
	};

	React.useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			const delta = e.clientY - startY;
			const newHeight = Math.max(48, Math.min(300, startHeight + delta));
			setLayoutHeights({ ...layoutHeights, header: newHeight });
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
	const Layout = preview ? defaultLayout : portal?.Layout;
	const Logo = portal?.Logo === 'None' ? ICONS.logo : portal?.Logo;
	const [logoError, setLogoError] = React.useState<{ [key: string]: boolean }>({});
	const { settings, updateSetting } = preview
		? (() => {
				const [localSettings, setLocalSettings] = React.useState({ theme: 'light' });
				const updateSetting = (key: string, value: any) => {
					setLocalSettings((prev) => ({ ...prev, [key]: value }));
				};
				return { settings: localSettings, updateSetting };
		  })()
		: useSettings();

	function setTheme() {
		const newTheme = settings?.theme === 'dark' || !settings?.theme ? 'light' : 'dark';

		if (!preview) {
			updateSetting('theme', newTheme);
			document.documentElement.setAttribute('theme', newTheme);
		} else {
			updateSetting('theme', newTheme);
			document.getElementById('preview')?.setAttribute('data-theme', newTheme);
		}
	}

	const renderLogo = (txId: string) => {
		const url = txId.startsWith('http') ? txId : getTxEndpoint(txId);

		if (logoError[txId]) {
			return <img src={url} alt="Logo" />;
		}

		return (
			<span style={{ color: 'rgba(var(--color-text), 1)' }}>
				<ReactSVG
					src={url}
					beforeInjection={(_svg) => {
						if (logoError[txId]) {
							setLogoError((prev) => ({ ...prev, [txId]: false }));
						}
					}}
					fallback={() => {
						setLogoError((prev) => ({ ...prev, [txId]: true }));
						return <img src={url} alt="Logo" />;
					}}
				/>
			</span>
		);
	};

	React.useEffect(() => {
		if (preview && settings) {
			initThemes(Themes);
		}
	}, [settings]);

	if (!layout) return null;
	return (
		<>
			{preview && <GlobalStyles />}
			<S.Header
				$layout={layout}
				theme={settings?.theme as any}
				id="Header"
				$editHeight={layoutHeights.header}
				$sticky={headerSticky && isSideNav}
				$isSideNav={isSideNav}
			>
				<S.HeaderContentWrapper
					$layout={layout}
					maxWidth={Layout?.basics?.maxWidth}
					$isSideNav={isSideNav}
					$navWidth={Layout?.navigation?.layout?.width}
				>
					<S.HeaderContent $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
						{isSideNav ? (
							<S.HeaderSearch>
								<Search />
							</S.HeaderSearch>
						) : Logo ? (
							<S.Logo $layout={content.logo} $editLogo={logoSettings}>
								{Logo ? (
									preview ? (
										<a href="">{renderLogo(Logo)}</a>
									) : (
										<NavLink to={getRedirect()} style={{ color: 'inherit' }}>
											{renderLogo(Logo)}
										</NavLink>
									)
								) : (
									<h1>{name}</h1>
								)}
							</S.Logo>
						) : (
							<NavLink to={getRedirect()} style={{ color: 'inherit' }}>
								<h1>{name}</h1>
							</NavLink>
						)}
						<S.Actions $isLogo={Boolean(Logo)}>
							<WalletConnect />
							<S.ThemeToggle>
								<Toggle theme state={settings?.theme === 'dark'} setState={() => setTheme()} />
							</S.ThemeToggle>
						</S.Actions>
						<S.Links>
							<S.LinksList>
								<SocialLinks />
							</S.LinksList>
						</S.Links>
					</S.HeaderContent>
				</S.HeaderContentWrapper>
			</S.Header>
			{layoutEditMode &&
				ReactDOM.createPortal(
					<S.ResizeHandle
						$isDragging={isDragging}
						onMouseDown={handleMouseDown}
						style={{
							top: layoutHeights.header,
							left:
								isSideNav && navPosition === 'left'
									? `calc((100vw - ${Layout?.basics?.maxWidth || 1200}px) / 2 + ${
											Layout?.navigation?.layout?.width || 300
									  }px)`
									: 0,
							right:
								isSideNav && navPosition === 'right'
									? `calc((100vw - ${Layout?.basics?.maxWidth || 1200}px) / 2 + ${
											Layout?.navigation?.layout?.width || 300
									  }px)`
									: 0,
						}}
					>
						<S.HandleBar>
							<S.HandleLabel>Header ({layoutHeights.header}px)</S.HandleLabel>
						</S.HandleBar>
					</S.ResizeHandle>,
					document.body
				)}
		</>
	);
}
