import React from 'react';
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

import * as S from './styles';

export default function Header(props: any) {
	const { name, layout, content, preview } = props;
	const { portal } = usePortalProvider();
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
			<S.Header $layout={layout} theme={settings?.theme as any} id="Header">
				<S.HeaderContentWrapper $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
					<S.HeaderContent $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
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
								<Toggle theme state={settings?.theme === 'dark'} setState={() => setTheme()} />
							</S.ThemeToggle>
						</S.Actions>
						<SocialLinks />
					</S.HeaderContent>
				</S.HeaderContentWrapper>
			</S.Header>
		</>
	);
}
