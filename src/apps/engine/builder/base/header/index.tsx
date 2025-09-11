import React from 'react';
import { NavLink } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import Icon from 'engine/components/icon';
import Toggle from 'engine/components/toggle';
import WalletConnect from 'engine/components/wallet/walletConnect';
import * as ICONS from 'engine/constants/icons';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { getRedirect } from 'helpers/utils';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { GlobalStyles } from '../../../global-styles';

import * as S from './styles';

export default function Header(props: any) {
	const { name, layout, content, preview } = props;
	const { portal } = usePortalProvider();
	const Themes = preview ? defaultThemes : portal?.Themes;
	const Layout = preview ? defaultLayout : portal?.Layout;
	const Logo = portal?.Logo === 'None' ? ASSETS.portalLogo : portal?.Logo;
	const [logoError, setLogoError] = React.useState<{ [key: string]: boolean }>({});
	const { settings, updateSetting } = preview
		? (() => {
				const [localSettings, setLocalSettings] = React.useState({ theme: 'dark' });
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
			document.getElementById('preview')?.setAttribute('data-theme', settings?.theme);
		}
	}

	const renderLogo = (txId: string) => {
		const url = txId.startsWith('http') ? txId : getTxEndpoint(txId);

		if (logoError[txId]) {
			return <img src={url} alt="Logo" />;
		}

		return (
			<ReactSVG
				src={url}
				beforeInjection={(svg) => {
					if (logoError[txId]) {
						setLogoError((prev) => ({ ...prev, [txId]: false }));
					}
				}}
				fallback={() => {
					setLogoError((prev) => ({ ...prev, [txId]: true }));
					return <img src={url} alt="Logo" />;
				}}
			/>
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
			<S.Header $layout={layout} theme={settings?.theme} id="Header">
				<S.HeaderContentWrapper $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
					<S.HeaderContent>
						{Logo ? (
							<S.Logo $layout={content.logo}>
								{Logo ? (
									preview ? (
										<a href="">{renderLogo(Logo)}</a>
									) : (
										<NavLink to={getRedirect()}>{renderLogo(Logo)}</NavLink>
									)
								) : (
									<h1>{name}</h1>
								)}
							</S.Logo>
						) : (
							<NavLink to={getRedirect()}>
								<h1>{name}</h1>
							</NavLink>
						)}
						<S.Actions>
							<WalletConnect />
							<S.ThemeToggle>
								<Toggle theme state={settings?.theme === 'dark' ? true : false} setState={() => setTheme()} />
							</S.ThemeToggle>
						</S.Actions>
						{content.links && (
							<S.Links>
								<S.LinksList>
									{content.links.map((link: any, index: number) => {
										return (
											<a key={index} href={link.uri} target="_blank" title={link.title}>
												<Icon icon={ICONS[link.icon.toUpperCase()]} />
												<ReactSVG src={`img/icons/links/${link.icon}.svg`} />
											</a>
										);
									})}
								</S.LinksList>
							</S.Links>
						)}
					</S.HeaderContent>
				</S.HeaderContentWrapper>
			</S.Header>
		</>
	);
}
