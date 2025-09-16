import React from 'react';
import { ReactSVG } from 'react-svg';
import { WanderConnect } from '@wanderapp/connect';

import { TurboCredits } from 'editor/components/molecules/TurboCredits';
import { ProfileManager } from 'editor/components/organisms/ProfileManager';
import { useSettingsProvider as useEditorSettingsProvider } from 'editor/providers/SettingsProvider';
import { useSettingsProvider as useViewerSettingsProvider } from 'viewer/providers/SettingsProvider';

import { Avatar } from 'components/atoms/Avatar';
import { Panel } from 'components/atoms/Panel';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import { ASSETS } from 'helpers/config';
import { LanguageEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function WalletConnect(props: { app?: 'editor' | 'viewer' | 'engine'; callback?: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { auth, backupsNeeded } = arProvider;
	const { profile } = permawebProvider;

	const { settings, updateSettings, availableThemes } =
		props.app === 'editor' ? useEditorSettingsProvider() : useViewerSettingsProvider();

	const [showWallet, _setShowWallet] = React.useState<boolean>(true);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [showWalletDropdown, setShowWalletDropdown] = React.useState<boolean>(false);
	const [showThemeSelector, setShowThemeSelector] = React.useState<boolean>(false);
	const [showLanguageSelector, setShowLanguageSelector] = React.useState<boolean>(false);
	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);
	const [instance, setInstance] = React.useState(null);
	const [label, setLabel] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const hasInitializedRef = React.useRef<boolean>(false);
	const wrapperRef = React.useRef();

	React.useEffect(() => {
		if (!hasInitializedRef.current) {
			hasInitializedRef.current = true;
		}
	}, []);

	React.useEffect(() => {
		if (window.wanderInstance && !instance) {
			setInstance(window.wanderInstance);
		} else if (!instance && !window.wanderInstance) {
			try {
				const wanderInstance = new WanderConnect({
					clientId: 'FREE_TRIAL',
					theme: 'dark',
					button: {
						parent: wrapperRef.current,
						label: false,
						customStyles: `
							#wanderConnectButtonHost {
								display:none;
							}`,
					},
					iframe: {
						routeLayout: {
							default: {
								type: 'modal',
							},
							auth: {
								type: 'modal',
							},
							'auth-request': {
								type: 'modal',
							},
						},
						cssVars: {
							light: {},
							dark: {
								boxShadow: 'none',
							},
						},
						customStyles: ``,
					},
				});

				setInstance(wanderInstance);
				window.wanderInstance = wanderInstance;
			} catch (e) {
				console.error(e);
			}
		}

		return () => {
			try {
				if (instance && instance !== window.wanderInstance) {
					instance.destroy();
					setInstance(null);
				}
			} catch (e) {
				console.error('Error destroying WanderConnect instance:', e);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	React.useEffect(() => {
		if (auth?.authStatus === 'loading') {
			setIsLoading(true);
			setLabel('Signing in');
		} else if (arProvider.walletAddress) {
			if (profile) {
				setIsLoading(false);
				setLabel(profile.displayName || 'My Profile');
			} else {
				// Wallet connected but no profile
				setIsLoading(false);
				setLabel('My Wallet');
			}
		} else {
			// Not connected
			setLabel('Log in');
		}
	}, [showWallet, arProvider.walletAddress, permawebProvider.profile, language, auth]);

	function handlePress() {
		if ((auth?.authStatus === 'authenticated' || arProvider.walletAddress) && arProvider.walletAddress) {
			setShowWalletDropdown(!showWalletDropdown);
		} else if (window.wanderInstance) {
			window.wanderInstance.open();
		} else {
			console.error('WanderInstance not initialized');
		}
	}

	function handleDisconnect() {
		const doRedirect = props.app === 'editor';
		arProvider.handleDisconnect(doRedirect);
		setLabel('Log in');
		setShowWalletDropdown(false);
		if (props.callback) {
			props.callback();
		}
	}

	return (
		<>
			<S.Wrapper>
				<CloseHandler
					callback={() => {
						setShowWalletDropdown(false);
					}}
					active={showWalletDropdown}
					disabled={!showWalletDropdown}
				>
					<S.PWrapper>
						<Avatar
							owner={permawebProvider.profile}
							loading={isLoading}
							dimensions={{ wrapper: 35, icon: 21.5 }}
							callback={handlePress}
						/>
						{backupsNeeded > 0 && arProvider.walletAddress && <S.BackupWarning>{backupsNeeded}</S.BackupWarning>}
						<div ref={wrapperRef} />
					</S.PWrapper>
					{showWalletDropdown && (
						<S.Dropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
							<S.DHeaderWrapper>
								<S.DHeaderFlex>
									<Avatar owner={permawebProvider.profile} dimensions={{ wrapper: 32.5, icon: 19.5 }} callback={null} />
									<S.DHeader>
										<p>{label}</p>
									</S.DHeader>
								</S.DHeaderFlex>
							</S.DHeaderWrapper>
							<S.DCreditsWrapper>
								<TurboCredits showBorderBottom setShowFundUpload={setShowFundUpload} />
							</S.DCreditsWrapper>
							<S.DBodyWrapper>
								{auth?.authType !== 'NATIVE_WALLET' && window.wanderInstance && (
									<li
										onClick={() => window.wanderInstance.open(backupsNeeded > 0 ? 'backup' : undefined)}
										style={{ position: 'relative' }}
									>
										<ReactSVG src={ASSETS.wallet} />
										{language?.wallet}
										{backupsNeeded > 0 && <S.MenuBadge>{backupsNeeded}</S.MenuBadge>}
									</li>
								)}
								<li onClick={() => setShowProfileManager(true)}>
									<ReactSVG src={ASSETS.write} />
									{language?.profile}
								</li>
								<li onClick={() => setShowLanguageSelector(true)}>
									<ReactSVG src={ASSETS.language} />
									{language?.language}
								</li>
								{availableThemes && (
									<li onClick={() => setShowThemeSelector(true)}>
										<ReactSVG src={ASSETS.design} />
										{language?.appearance}
									</li>
								)}
							</S.DBodyWrapper>
							<S.DFooterWrapper>
								<li onClick={handleDisconnect}>
									<ReactSVG src={ASSETS.disconnect} />
									{language?.disconnect}
								</li>
							</S.DFooterWrapper>
						</S.Dropdown>
					)}
				</CloseHandler>
			</S.Wrapper>
			<Panel
				open={showProfileManager}
				header={permawebProvider.profile?.id ? language?.editProfile : `${language?.createProfile}!`}
				handleClose={() => setShowProfileManager(false)}
				width={575}
				closeHandlerDisabled
			>
				<ProfileManager
					profile={permawebProvider.profile?.id ? permawebProvider.profile : null}
					handleClose={() => setShowProfileManager(false)}
					handleUpdate={null}
				/>
			</Panel>

			<Panel
				open={showFundUpload}
				width={575}
				header={language?.fundTurboBalance}
				handleClose={() => setShowFundUpload(false)}
				className={'modal-wrapper'}
			>
				<TurboBalanceFund handleClose={() => setShowFundUpload(false)} />
			</Panel>
			{availableThemes && (
				<Panel
					open={showThemeSelector}
					width={430}
					header={language?.chooseAppearance}
					handleClose={() => setShowThemeSelector(false)}
				>
					<S.MWrapper className={'modal-wrapper'}>
						{Object.entries(availableThemes).map(([key, theme]: any) => (
							<S.MSection key={key}>
								<S.ThemeSectionHeader>
									<ReactSVG src={theme.icon} />
									<p>{theme.label}</p>
								</S.ThemeSectionHeader>
								<S.ThemeSectionBody>
									{theme.variants.map((variant: any) => (
										<S.MSectionBodyElement key={variant.id} onClick={() => updateSettings('theme', variant.id as any)}>
											<S.Preview background={variant.background} accent={variant.accent1}>
												<div id={'preview-accent-1'} />
											</S.Preview>
											<div>
												<S.Indicator active={settings.theme === variant.id} />
												<p>{variant.name}</p>
											</div>
										</S.MSectionBodyElement>
									))}
								</S.ThemeSectionBody>
							</S.MSection>
						))}
					</S.MWrapper>
				</Panel>
			)}
			<Panel
				open={showLanguageSelector}
				width={430}
				header={language?.language}
				handleClose={() => setShowLanguageSelector(false)}
			>
				<S.MWrapper className={'modal-wrapper'}>
					{Object.entries(LanguageEnum).map(([key, label]) => (
						<S.MSection key={key}>
							<S.MSectionBodyElement
								onClick={() => {
									languageProvider.setCurrent(key as any);
									setShowLanguageSelector(false);
								}}
							>
								<div>
									<S.Indicator active={languageProvider.current === key} />
									<p>{label}</p>
								</div>
							</S.MSectionBodyElement>
						</S.MSection>
					))}
				</S.MWrapper>
			</Panel>
		</>
	);
}
