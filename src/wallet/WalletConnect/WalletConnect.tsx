import React from 'react';
import { ReactSVG } from 'react-svg';
import { WanderConnect } from "@wanderapp/connect";
import { STORAGE } from 'helpers/config';

import { ProfileManager } from 'editor/components/organisms/ProfileManager';
import { useSettingsProvider as useEditorSettingsProvider } from 'editor/providers/SettingsProvider';
import { useSettingsProvider as useViewerSettingsProvider } from 'viewer/providers/SettingsProvider';
import { checkValidAddress } from 'helpers/utils';

import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ASSETS } from 'helpers/config';
import { LanguageEnum, WalletEnum } from 'helpers/types';
import { formatAddress, getARAmountFromWinc } from 'helpers/utils';

import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { Modal } from 'components/atoms/Modal';
import { Panel } from 'components/atoms/Panel';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';

import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

const AR_WALLETS = [{ type: WalletEnum.wander, label: 'Wander', logo: ASSETS.wander }];

/*
function WalletList(props: { handleConnect: any }) {
	return (
		<S.WalletListContainer>
			{AR_WALLETS.map((wallet: any, index: number) => (
				<S.WalletListItem
					key={index}
					onClick={() => props.handleConnect(wallet.type)}
					className={'border-wrapper-primary'}
				>
					<img src={wallet.logo} alt={''} />
					<span>{wallet.label}</span>
				</S.WalletListItem>
			))}
			<S.WalletLink>
				<span>
					Don't have an Arweave Wallet? You can create one{' '}
					<a href={'https://arconnect.io'} target={'_blank'}>
						here.
					</a>
				</span>
			</S.WalletLink>
		</S.WalletListContainer>
	);
}
*/

export default function WalletConnect(props: { app?: 'editor' | 'viewer' | 'engine'; callback?: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { auth } = arProvider;
	const { profile } = permawebProvider;

	const { settings, updateSettings, availableThemes } =
		props.app === 'editor' ? useEditorSettingsProvider() : useViewerSettingsProvider();

	const [showWallet, setShowWallet] = React.useState<boolean>(false);
	const [walletModalVisible, setWalletModalVisible] = React.useState<boolean>(false);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [showWalletDropdown, setShowWalletDropdown] = React.useState<boolean>(false);
	const [showThemeSelector, setShowThemeSelector] = React.useState<boolean>(false);
	const [showLanguageSelector, setShowLanguageSelector] = React.useState<boolean>(false);
	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);
	const [instance, setInstance] = React.useState(null);
	const [avatar, setAvatar] = React.useState<string>('');
	const [banner, setBanner] = React.useState<string>('');
	const [label, setLabel] = React.useState<string | null>(null);
	const hasInitializedRef = React.useRef<boolean>(false);
	const wrapperRef = React.useRef();

	React.useEffect(() => {
		if (!hasInitializedRef.current) {
			const timer = setTimeout(() => {
				setShowWallet(true);
				hasInitializedRef.current = true;
			}, 200);
			return () => clearTimeout(timer);
		}
	}, []);

	React.useEffect(() => {
		if(!instance){
			try {
				const wanderInstance = new WanderConnect({
					clientId: 'FREE_TRIAL',
					theme: 'Dark',				
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
							light: {
							},
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
				window.wanderInstance.destroy();
				// if(instance) instance.destroy();
			} catch {}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps

	}, []);

	React.useEffect(() => {
		if(auth){
			const status = auth.authStatus
			if(status === 'loading') setLabel('Signing in') 
			else if((status === 'authenticated' || auth.authType === 'NATIVE_WALLET') && profile){
				setLabel(profile.displayName || 'My Profile')
				setAvatar(profile?.thumbnail && checkValidAddress(profile.thumbnail) ? `https://arweave.net/${profile?.thumbnail}` : '');
				// setBanner(profile?.banner && checkValidAddress(profile.banner) ? `https://arweave.net/${profile?.banner}` : '');
			} 
		} else if (localStorage.getItem(STORAGE.walletType) === 'NATIVE_WALLET' && profile) {
			setLabel(profile.displayName || 'My Profile')
			setAvatar(profile?.thumbnail && checkValidAddress(profile.thumbnail) ? `https://arweave.net/${profile?.thumbnail}` : '');
			// setBanner(profile?.banner && checkValidAddress(profile.banner) ? `https://arweave.net/${profile?.banner}` : '');
		} else {
			setLabel('Log in')
			setAvatar('');
			// setBanner('');
		}
	}, [showWallet, arProvider.walletAddress, permawebProvider.profile, language]);

	function handlePress() {
		if (arProvider.walletAddress) {
			setShowWalletDropdown(!showWalletDropdown);
		} else {
			setWalletModalVisible(true);
		}
	}

	function handleDisconnect() {
		const doRedirect = props.app === 'editor';
		arProvider.handleDisconnect(doRedirect);
		setShowWalletDropdown(false);
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
						<Avatar owner={permawebProvider.profile} dimensions={{ wrapper: 35, icon: 21.5 }} callback={handlePress} />
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

							<S.DBalanceWrapper>
								<S.DBalanceHeader>
									<p>{language?.creditBalance}</p>
								</S.DBalanceHeader>
								<S.DBalanceBody>
									<p>
										{arProvider.turboBalance !== null
											? `${getARAmountFromWinc(arProvider.turboBalance)} ${language?.credits}`
											: `${language?.loading}...`}
									</p>
									<Button
										type={'alt3'}
										label={language?.add}
										handlePress={() => setShowFundUpload(true)}
										icon={ASSETS.add}
										iconLeftAlign
									/>
								</S.DBalanceBody>
							</S.DBalanceWrapper>
							<S.DBodyWrapper>
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
			{/* walletModalVisible && (
				<Modal header={language?.connectWallet} handleClose={() => setWalletModalVisible(false)}>
					<WalletList
						handleConnect={(type: WalletEnum) => {
							arProvider.handleConnect(type);
							setWalletModalVisible(false);
						}}
					/>
				</Modal>
			) */}
		</>
	);
}
