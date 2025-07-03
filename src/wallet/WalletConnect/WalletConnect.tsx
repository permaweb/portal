import React from 'react';
import { ReactSVG } from 'react-svg';

import { ProfileManager } from 'editor/components/organisms/ProfileManager';
import { useSettingsProvider as useEditorSettingsProvider } from 'editor/providers/SettingsProvider';
import { useSettingsProvider as useViewerSettingsProvider } from 'viewer/providers/SettingsProvider';

import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { Modal } from 'components/atoms/Modal';
import { Panel } from 'components/atoms/Panel';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import { ASSETS } from 'helpers/config';
import { WalletEnum } from 'helpers/types';
import { formatAddress, getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

const AR_WALLETS = [{ type: WalletEnum.wander, label: 'Wander', logo: ASSETS.wander }];

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

export default function WalletConnect(props: { app: 'editor' | 'viewer'; callback?: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings, availableThemes } =
		props.app === 'editor' ? useEditorSettingsProvider() : useViewerSettingsProvider();

	const [showWallet, setShowWallet] = React.useState<boolean>(false);
	const [walletModalVisible, setWalletModalVisible] = React.useState<boolean>(false);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [showWalletDropdown, setShowWalletDropdown] = React.useState<boolean>(false);
	const [showThemeSelector, setShowThemeSelector] = React.useState<boolean>(false);
	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);

	const [label, setLabel] = React.useState<string | null>(null);

	React.useEffect(() => {
		setTimeout(() => {
			setShowWallet(true);
		}, 200);
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		if (!showWallet) {
			setLabel(`${language.loading}...`);
		} else {
			if (arProvider.walletAddress) {
				if (permawebProvider.profile && permawebProvider.profile.username) {
					setLabel(permawebProvider.profile.username);
				} else {
					setLabel(formatAddress(arProvider.walletAddress, false));
				}
			} else {
				setLabel(language.connect);
			}
		}
	}, [showWallet, arProvider.walletAddress, permawebProvider.profile]);

	function handlePress() {
		if (arProvider.walletAddress) {
			setShowWalletDropdown(!showWalletDropdown);
		} else {
			setWalletModalVisible(true);
		}
	}

	function handleDisconnect() {
		arProvider.handleDisconnect();
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
									<p>{language.uploadBalance}</p>
								</S.DBalanceHeader>
								<S.DBalanceBody>
									<p>
										{arProvider.turboBalance !== null
											? `${getARAmountFromWinc(arProvider.turboBalance)} ${language.credits}`
											: `${language.loading}...`}
									</p>
									<Button
										type={'alt3'}
										label={language.add}
										handlePress={() => setShowFundUpload(true)}
										icon={ASSETS.add}
										iconLeftAlign
									/>
								</S.DBalanceBody>
							</S.DBalanceWrapper>

							<S.DBodyWrapper>
								<li onClick={() => setShowProfileManager(true)}>
									<ReactSVG src={ASSETS.write} />
									{language.profile}
								</li>
								{availableThemes && (
									<li onClick={() => setShowThemeSelector(true)}>
										<ReactSVG src={ASSETS.design} />
										{language.appearance}
									</li>
								)}
							</S.DBodyWrapper>
							<S.DFooterWrapper>
								<li onClick={handleDisconnect}>
									<ReactSVG src={ASSETS.disconnect} />
									{language.disconnect}
								</li>
							</S.DFooterWrapper>
						</S.Dropdown>
					)}
				</CloseHandler>
			</S.Wrapper>
			<Panel
				open={showProfileManager}
				header={permawebProvider.profile?.id ? language.editProfile : `${language.createProfile}!`}
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
				header={language.fundTurboBalance}
				handleClose={() => setShowFundUpload(false)}
			>
				<TurboBalanceFund handleClose={() => setShowFundUpload(false)} />
			</Panel>
			{availableThemes && (
				<Panel
					open={showThemeSelector}
					width={430}
					header={language.chooseAppearance}
					handleClose={() => setShowThemeSelector(false)}
				>
					<S.MWrapper className={'modal-wrapper'}>
						{Object.entries(availableThemes).map(([key, theme]: any) => (
							<S.ThemeSection key={key}>
								<S.ThemeSectionHeader>
									<ReactSVG src={theme.icon} />
									<p>{theme.label}</p>
								</S.ThemeSectionHeader>
								<S.ThemeSectionBody>
									{theme.variants.map((variant: any) => (
										<S.ThemeSectionBodyElement
											key={variant.id}
											onClick={() => updateSettings('theme', variant.id as any)}
										>
											<S.Preview background={variant.background} accent={variant.accent1}>
												<div id={'preview-accent-1'} />
											</S.Preview>
											<div>
												<S.Indicator active={settings.theme === variant.id} />
												<p>{variant.name}</p>
											</div>
										</S.ThemeSectionBodyElement>
									))}
								</S.ThemeSectionBody>
							</S.ThemeSection>
						))}
					</S.MWrapper>
				</Panel>
			)}
			{walletModalVisible && (
				<Modal header={language.connectWallet} handleClose={() => setWalletModalVisible(false)}>
					<WalletList
						handleConnect={(type: WalletEnum) => {
							arProvider.handleConnect(type);
							setWalletModalVisible(false);
						}}
					/>
				</Modal>
			)}
		</>
	);
}
