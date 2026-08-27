import React from 'react';
import { useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { ProfileManager } from 'editor/components/organisms/ProfileManager';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { useSettingsProvider as useEditorSettingsProvider } from 'editor/providers/SettingsProvider';
import { useSettingsProvider as useViewerSettingsProvider } from 'viewer/providers/SettingsProvider';

import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { ICONS } from 'helpers/config';
import { FEATURES, IS_BASE_MODE, PORTAL_CAPABILITIES } from 'helpers/features';
import { LanguageEnum } from 'helpers/language';
import type { PendingTransaction } from 'helpers/pendingTransactions';
import {
	getPendingTransactions,
	refreshPendingTransactions,
	subscribeToPendingTransactions,
} from 'helpers/pendingTransactions';
import { WalletEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

const LUNAR_EXPLORER = 'https://lunar.arweave.net/#/explorer';
type EditorAppearance = 'system' | 'light' | 'dark';

function CopyAddressIcon() {
	return (
		<S.OutlineIcon aria-hidden={'true'} viewBox={'0 0 24 24'}>
			<rect x={'9'} y={'9'} width={'13'} height={'13'} rx={'2'} />
			<path d={'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'} />
		</S.OutlineIcon>
	);
}

function SystemAppearanceIcon() {
	return (
		<S.OutlineIcon aria-hidden={'true'} viewBox={'0 0 24 24'}>
			<rect x={'4'} y={'4'} width={'16'} height={'12'} rx={'1.5'} />
			<path d={'M2.5 19.5h19M9 16v3.5M15 16v3.5'} />
		</S.OutlineIcon>
	);
}

export default function WalletConnect(props: { app?: 'editor' | 'viewer' | 'engine'; callback?: () => void }) {
	const isEditor = props.app === 'editor';
	const { portalId: routePortalId } = useParams<{ portalId?: string }>();
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { auth, backupsNeeded } = arProvider;
	const { profile } = permawebProvider;

	const { settings, updateSettings, availableThemes } = isEditor
		? useEditorSettingsProvider()
		: useViewerSettingsProvider();
	const editorAppearance: EditorAppearance = settings.syncWithSystem
		? 'system'
		: settings.theme.startsWith('dark')
		? 'dark'
		: 'light';

	const [showWallet, _setShowWallet] = React.useState<boolean>(true);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [showWalletDropdown, setShowWalletDropdown] = React.useState<boolean>(false);
	const [showWalletSelector, setShowWalletSelector] = React.useState<boolean>(false);
	const [showPendingDropdown, setShowPendingDropdown] = React.useState<boolean>(false);
	const [pendingTransactions, setPendingTransactions] = React.useState<PendingTransaction[]>([]);
	const [showThemeSelector, setShowThemeSelector] = React.useState<boolean>(false);
	const [showLanguageSelector, setShowLanguageSelector] = React.useState<boolean>(false);
	const [instance, setInstance] = React.useState(null);
	const [label, setLabel] = React.useState<string | null>(null);
	const [addressCopied, setAddressCopied] = React.useState<boolean>(false);
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const hasInitializedRef = React.useRef<boolean>(false);
	const wrapperRef = React.useRef();

	React.useEffect(() => {
		if (!hasInitializedRef.current) {
			hasInitializedRef.current = true;
		}
	}, []);

	React.useEffect(() => {
		const address = arProvider.walletAddress;
		const portalId = portalProvider.current?.id || routePortalId;
		if (!IS_BASE_MODE || !address) {
			setPendingTransactions([]);
			setShowPendingDropdown(false);
			return;
		}

		const updatePendingTransactions = (transactions: PendingTransaction[]) => {
			const unique = Array.from(new Map(transactions.map((transaction) => [transaction.id, transaction])).values());
			setPendingTransactions((current) => {
				const currentIds = current.map((transaction) => transaction.id).join(':');
				const nextIds = unique.map((transaction) => transaction.id).join(':');
				return currentIds === nextIds ? current : unique;
			});
		};
		const loadLocal = () => updatePendingTransactions(getPendingTransactions(address, portalId));
		const refresh = () => {
			void refreshPendingTransactions(address, portalId).then(updatePendingTransactions);
		};
		loadLocal();
		refresh();
		const unsubscribe = subscribeToPendingTransactions(address, refresh);
		const interval = window.setInterval(refresh, 10_000);
		return () => {
			unsubscribe();
			window.clearInterval(interval);
		};
	}, [arProvider.walletAddress, portalProvider.current?.id, routePortalId]);

	React.useEffect(() => {
		if (!FEATURES.WANDER_EMBEDDED_AUTH) return;
		let active = true;

		void (async () => {
			if (window.wanderInstance && !instance) {
				setInstance(window.wanderInstance);
			} else if (!instance && !window.wanderInstance) {
				try {
					const { WanderConnect } = await import('@wanderapp/connect');
					if (!active || window.wanderInstance) return;
					const wanderInstance = new WanderConnect({
						clientId: 'FREE_TRIAL',
						theme: 'dark',
						button: {
							parent: wrapperRef.current,
							label: false,
							customStyles: `
							#wanderConnectButtonHost {
								display: none;
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
						},
					});

					if (!instance) setInstance(wanderInstance);
					window.wanderInstance = wanderInstance;
				} catch (e) {
					console.error(e);
				}
			}
		})();

		return () => {
			active = false;
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
				setLabel(profile.displayName ?? profile?.displayname ?? 'My Profile');
			} else {
				// Wallet connected but no profile
				setIsLoading(false);
				setLabel('My Wallet');
			}
		} else {
			// Not connected
			setLabel(FEATURES.WANDER_EMBEDDED_AUTH ? 'Log in' : 'Connect Wallet');
		}
	}, [showWallet, arProvider.walletAddress, permawebProvider.profile, language, auth]);

	function handlePress() {
		if ((auth?.authStatus === 'authenticated' || arProvider.walletAddress) && arProvider.walletAddress) {
			setShowPendingDropdown(false);
			setShowWalletDropdown(!showWalletDropdown);
		} else {
			setShowWalletSelector(true);
		}
	}

	function handleWalletChoice(walletType: WalletEnum.permawebOs | WalletEnum.wander) {
		setShowWalletSelector(false);
		if (walletType === WalletEnum.wander && FEATURES.WANDER_EMBEDDED_AUTH && window.wanderInstance) {
			window.wanderInstance.open();
			return;
		}
		void arProvider.handleConnect(walletType);
	}

	function handleDisconnect() {
		const doRedirect = props.app === 'editor';
		arProvider.handleDisconnect(doRedirect);
		setLabel(FEATURES.WANDER_EMBEDDED_AUTH ? 'Log in' : 'Connect Wallet');
		setShowWalletDropdown(false);
		setShowPendingDropdown(false);
		if (props.callback) {
			props.callback();
		}
	}

	async function handleCopyAddress() {
		if (!arProvider.walletAddress) return;
		await navigator.clipboard.writeText(arProvider.walletAddress);
		setAddressCopied(true);
		window.setTimeout(() => setAddressCopied(false), 2000);
	}

	function handleOpenWallet() {
		arProvider.handleOpenWallet();
		setShowWalletDropdown(false);
	}

	function handleEditorAppearance(appearance: EditorAppearance) {
		if (appearance === 'system') {
			updateSettings('syncWithSystem', true as any);
			return;
		}

		updateSettings('theme', `${appearance}-primary` as any);
	}

	function pendingLabel(type: string) {
		return (
			{
				'portal-manifest': 'Portal root manifest',
				'portal-release': 'Portal release',
				'portal-membership': 'Portal membership',
				'portal-post': 'Post transaction',
				'portal-media': 'Media transaction',
			}[type] || 'Portal transaction'
		);
	}

	return (
		<>
			<S.Wrapper>
				<CloseHandler
					callback={() => {
						setShowWalletDropdown(false);
						setShowPendingDropdown(false);
					}}
					active={showWalletDropdown || showPendingDropdown}
					disabled={!showWalletDropdown && !showPendingDropdown}
				>
					<S.PWrapper>
						{IS_BASE_MODE && pendingTransactions.length > 0 && (
							<S.PendingControl>
								<S.PendingButton
									type={'button'}
									title={'Transactions waiting for Arweave indexing'}
									aria-expanded={showPendingDropdown}
									onClick={() => {
										setShowPendingDropdown(!showPendingDropdown);
										setShowWalletDropdown(false);
									}}
								>
									<S.PendingSpinner />
									<S.PendingLabel>Syncing...</S.PendingLabel>
								</S.PendingButton>
								{showPendingDropdown && (
									<S.PendingDropdown className={'border-wrapper-alt1 fade-in'}>
										<S.PendingHeader>
											<p>Waiting for Arweave</p>
										</S.PendingHeader>
										<S.PendingList>
											{pendingTransactions.map((transaction) => (
												<li key={transaction.id}>
													<button
														type={'button'}
														onClick={() =>
															window.open(`${LUNAR_EXPLORER}/${transaction.id}`, '_blank', 'noopener,noreferrer')
														}
													>
														<S.PendingTransactionHeader>
															<span>{pendingLabel(transaction.type)}</span>
															<time>{new Date(transaction.createdAt).toLocaleTimeString()}</time>
														</S.PendingTransactionHeader>
														<code>{transaction.id}</code>
													</button>
												</li>
											))}
										</S.PendingList>
									</S.PendingDropdown>
								)}
							</S.PendingControl>
						)}
						<Avatar
							owner={permawebProvider.profile}
							loading={isLoading}
							dimensions={{ wrapper: 35, icon: 21.5 }}
							callback={handlePress}
						/>
						{backupsNeeded > 0 && arProvider.walletAddress && (
							<S.NotificationBubble>{backupsNeeded}</S.NotificationBubble>
						)}
						{PORTAL_CAPABILITIES.PROFILE_EDIT &&
							arProvider.walletAddress &&
							!permawebProvider.profileLoading &&
							!permawebProvider.profile?.id && <S.NotificationBubble>!</S.NotificationBubble>}
						<div ref={wrapperRef} />
					</S.PWrapper>
					{showWalletDropdown && (
						<S.Dropdown className={'border-wrapper-alt1 fade-in scroll-wrapper-hidden'}>
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
									<p>AR balance</p>
								</S.DBalanceHeader>
								<S.DBalanceBody>
									<p>
										{arProvider.arBalance == null
											? `${language?.loading}...`
											: `${Number(arProvider.arBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })} AR`}
									</p>
								</S.DBalanceBody>
							</S.DBalanceWrapper>
							<S.DBodyWrapper>
								{arProvider.isEmbeddedWallet && (
									<li onClick={handleOpenWallet}>
										<ReactSVG src={ICONS.wallet} />
										{language?.openWallet}
									</li>
								)}
								<li onClick={() => void handleCopyAddress()}>
									<CopyAddressIcon />
									{addressCopied ? 'Copied!' : 'Copy Address'}
								</li>
								{FEATURES.WANDER_EMBEDDED_AUTH &&
									auth?.authType !== 'NATIVE_WALLET' &&
									arProvider.walletType !== 'NATIVE_WALLET' &&
									window.wanderInstance && (
										<li
											onClick={() => window.wanderInstance.open(backupsNeeded > 0 ? 'backup' : undefined)}
											style={{ position: 'relative' }}
										>
											<ReactSVG src={ICONS.wallet} />
											{language?.wallet}
											{backupsNeeded > 0 && <S.MenuBadge>{backupsNeeded}</S.MenuBadge>}
										</li>
									)}
								{PORTAL_CAPABILITIES.PROFILE_EDIT && permawebProvider.profile?.id !== portalProvider?.current?.id && (
									<li onClick={() => setShowProfileManager(true)}>
										<ReactSVG src={ICONS.write} />
										{language?.profile}
									</li>
								)}
								<li onClick={() => setShowLanguageSelector(true)}>
									<ReactSVG src={ICONS.language} />
									{language?.language}
								</li>
								{!isEditor && availableThemes && (
									<li onClick={() => setShowThemeSelector(true)}>
										<ReactSVG src={ICONS.design} />
										{language?.appearance}
									</li>
								)}
							</S.DBodyWrapper>
							{isEditor && (
								<S.AppearanceSection>
									<S.AppearanceTitle>{language?.appearance || 'Appearance'}</S.AppearanceTitle>
									<S.AppearanceOptions>
										<S.AppearanceOption
											type={'button'}
											aria-pressed={editorAppearance === 'system'}
											onClick={() => handleEditorAppearance('system')}
										>
											<SystemAppearanceIcon />
											<span>System</span>
											{editorAppearance === 'system' && <S.AppearanceIndicator />}
										</S.AppearanceOption>
										<S.AppearanceOption
											type={'button'}
											aria-pressed={editorAppearance === 'light'}
											onClick={() => handleEditorAppearance('light')}
										>
											<ReactSVG src={ICONS.light} />
											<span>Light</span>
											{editorAppearance === 'light' && <S.AppearanceIndicator />}
										</S.AppearanceOption>
										<S.AppearanceOption
											type={'button'}
											aria-pressed={editorAppearance === 'dark'}
											onClick={() => handleEditorAppearance('dark')}
										>
											<ReactSVG src={ICONS.dark} />
											<span>Dark</span>
											{editorAppearance === 'dark' && <S.AppearanceIndicator />}
										</S.AppearanceOption>
									</S.AppearanceOptions>
								</S.AppearanceSection>
							)}
							<S.DFooterWrapper>
								<li onClick={handleDisconnect}>
									<ReactSVG src={ICONS.disconnect} />
									{language?.disconnect}
								</li>
							</S.DFooterWrapper>
						</S.Dropdown>
					)}
				</CloseHandler>
			</S.Wrapper>
			<Panel
				open={showWalletSelector}
				header={'Connect Wallet'}
				handleClose={() => setShowWalletSelector(false)}
				width={430}
			>
				<S.MWrapper className={'modal-wrapper'}>
					<Button
						type={'alt1'}
						label={'PermawebOS'}
						handlePress={() => handleWalletChoice(WalletEnum.permawebOs)}
						fullWidth
					/>
					<Button type={'alt1'} label={'Wander'} handlePress={() => handleWalletChoice(WalletEnum.wander)} fullWidth />
				</S.MWrapper>
			</Panel>
			<Panel
				open={PORTAL_CAPABILITIES.PROFILE_EDIT && showProfileManager}
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

			{!isEditor && availableThemes && (
				<Panel
					open={showThemeSelector}
					width={430}
					header={language?.chooseAppearance}
					handleClose={() => setShowThemeSelector(false)}
				>
					<S.MWrapper className={'modal-wrapper'}>
						{Object.entries(availableThemes).map(([key, theme]: any) => {
							const isLightScheme = key === 'light';
							const preferredTheme = isLightScheme ? settings.preferredLightTheme : settings.preferredDarkTheme;

							// Use singular form when sync is enabled
							const themeLabel = settings.syncWithSystem ? (isLightScheme ? 'Light Theme' : 'Dark Theme') : theme.label;

							return (
								<S.MSection key={key}>
									<S.ThemeSectionHeader>
										<ReactSVG src={theme.icon} />
										<p>{themeLabel}</p>
									</S.ThemeSectionHeader>
									<S.ThemeSectionBody>
										{theme.variants.map((variant: any) => {
											const isActive = settings.syncWithSystem
												? preferredTheme === variant.id
												: settings.theme === variant.id;

											return (
												<S.MSectionBodyElement
													key={variant.id}
													onClick={() => updateSettings('theme', variant.id as any)}
												>
													<S.Preview background={variant.background} accent={variant.accent1}>
														<div id={'preview-accent-1'} />
													</S.Preview>
													<div>
														<S.Indicator active={isActive} />
														<p>{variant.name}</p>
													</div>
												</S.MSectionBodyElement>
											);
										})}
									</S.ThemeSectionBody>
								</S.MSection>
							);
						})}
						<S.SystemSyncWrapper>
							<Button
								type={'alt1'}
								label={language?.syncWithSystem || 'Sync With System'}
								handlePress={() => updateSettings('syncWithSystem', !settings.syncWithSystem)}
								active={settings.syncWithSystem}
								icon={settings.syncWithSystem ? ICONS.checkmark : null}
								height={45}
								fullWidth
							/>
						</S.SystemSyncWrapper>
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
