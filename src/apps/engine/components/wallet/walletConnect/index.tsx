import React from 'react';
import { ReactSVG } from 'react-svg';
import { WanderConnect } from '@wanderapp/connect';
import Avatar from 'engine/components/avatar';
import { Panel } from 'engine/components/panel';
import ProfileEditor from 'engine/components/profileEditor';
import useNavigate from 'engine/helpers/preview';
import { LogoSettings, usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS, STORAGE } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, getRedirect } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function WalletConnect(_props: { callback?: () => void }) {
	const navigate = useNavigate();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const { auth } = arProvider;
	const { profile } = permawebProvider;
	const language = languageProvider.object?.[languageProvider.current] ?? null;
	const [showUserMenu, setShowUserMenu] = React.useState<boolean>(false);
	const [saving, setSaving] = React.useState<boolean>(false);
	const [showProfileManage, setShowProfileManage] = React.useState<boolean>(false);
	const [showLayoutPanel, setShowLayoutPanel] = React.useState<boolean>(false);
	const [instance, setInstance] = React.useState(null);
	const [label, setLabel] = React.useState<string>('Log in');
	const [banner, setBanner] = React.useState<string>('');
	const [avatar, setAvatar] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const wrapperRef = React.useRef();

	const {
		layoutHeights,
		setLayoutHeights,
		logoSettings,
		setLogoSettings,
		footerFixed,
		setFooterFixed,
		navSticky,
		setNavSticky,
		headerSticky,
		setHeaderSticky,
		setLayoutEditMode,
	} = portalProvider;

	const [initialLayoutHeights, setInitialLayoutHeights] = React.useState(layoutHeights);
	const [initialLogoSettings, setInitialLogoSettings] = React.useState(logoSettings);
	const [initialFooterFixed, setInitialFooterFixed] = React.useState(footerFixed);
	const [initialNavSticky, setInitialNavSticky] = React.useState(navSticky);
	const [initialHeaderSticky, setInitialHeaderSticky] = React.useState(headerSticky);

	React.useEffect(() => {
		if (showUserMenu && !showLayoutPanel) {
			setInitialLayoutHeights({ ...layoutHeights });
			setInitialLogoSettings({ ...logoSettings });
			setInitialFooterFixed(footerFixed);
			setInitialNavSticky(navSticky);
			setInitialHeaderSticky(headerSticky);
		}
	}, [showUserMenu]);

	if (!window.wanderInstance && wrapperRef.current) {
		try {
			const wanderInstance = new WanderConnect({
				clientId: 'FREE_TRIAL',
				theme: 'Dark',
				button: {
					parent: wrapperRef.current,
					label: false,
					customStyles: `
						#wanderConnectButtonHost {
							// display:none;
						}`,
				},
				iframe: {
					routeLayout: {
						default: {
							// type: 'dropdown',
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
							shadowBlurred: 'none',
						},
						dark: {
							shadowBlurred: 'none',
							boxShadow: 'none',
						},
					},
					customStyles: ``,
				},
			});

			window.wanderInstance = wanderInstance;
		} catch (e) {
			console.error(e);
		}
	}

	React.useEffect(() => {
		return () => {
			try {
				window.wanderInstance?.destroy();
				window.wanderInstance = null;
			} catch {}
		};
	}, []);
	React.useEffect(() => {
		if (auth) {
			const status = auth.authStatus;
			if (status === 'loading') {
				setIsLoading(true);
				setLabel('');
			} else if (
				(status === 'authenticated' || auth.authType === 'NATIVE_WALLET' || localStorage.getItem(STORAGE.walletType)) &&
				profile
			) {
				setIsLoading(false);
				setLabel(profile.displayName || 'My Profile');
				setAvatar(profile?.thumbnail && checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : '');
				setBanner(profile?.banner && checkValidAddress(profile.banner) ? getTxEndpoint(profile.banner) : '');
			}
		} else if (localStorage.getItem(STORAGE.walletType) && profile) {
			setIsLoading(false);
			setLabel(profile.displayName || 'My Profile');
			setAvatar(profile?.thumbnail && checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : '');
			setBanner(profile?.banner && checkValidAddress(profile.banner) ? getTxEndpoint(profile.banner) : '');
		} else {
			setIsLoading(false);
			setLabel('Log in');
			setAvatar('');
			setBanner('');
		}
	}, [auth, profile]);

	function handlePress() {
		if (auth?.authStatus === 'authenticated' || auth?.authType === 'NATIVE_WALLET' || arProvider.walletAddress) {
			setShowUserMenu(!showUserMenu);
		} else {
			window.wanderInstance.open();
		}
	}

	function handleDisconnect() {
		arProvider.handleDisconnect(false);
		setShowUserMenu(false);
		setShowLayoutPanel(false);
		setLayoutEditMode(false);
	}

	function handleCloseMenu() {
		setShowUserMenu(false);
		setShowLayoutPanel(false);
		setLayoutEditMode(false);
	}

	const shorten = (s: string) => (s ? s.slice(0, 7) + '....' + s.slice(-4) : '');

	function handleLayoutCancel() {
		setLayoutHeights(initialLayoutHeights);
		setLogoSettings(initialLogoSettings);
		setFooterFixed(initialFooterFixed);
		setNavSticky(initialNavSticky);
		setHeaderSticky(initialHeaderSticky);
		setShowLayoutPanel(false);
		setShowUserMenu(false);
		setLayoutEditMode(false);
	}

	async function handleLayoutSave() {
		if (!arProvider.wallet || !portalProvider.portalId) {
			return;
		}

		try {
			setSaving(true);

			const currentLayout = portalProvider.portal?.Layout || {};
			const updatedLayout = {
				...currentLayout,
				header: {
					...currentLayout.header,
					layout: {
						...currentLayout.header?.layout,
						height: `${layoutHeights.header}px`,
					},
					content: {
						...currentLayout.header?.content,
						logo: {
							...currentLayout.header?.content?.logo,
							positionX: logoSettings.positionX,
							positionY: logoSettings.positionY,
							size: `${logoSettings.size}%`,
						},
					},
				},
				navigation: {
					...currentLayout.navigation,
					layout: {
						...currentLayout.navigation?.layout,
						height: layoutHeights.navigation,
					},
				},
				footer: {
					...currentLayout.footer,
					layout: {
						...currentLayout.footer?.layout,
						fixed: footerFixed,
					},
				},
			};

			const updateData = { Layout: updatedLayout };

			await permawebProvider.libs.updateZone(updateData, portalProvider.portalId, arProvider.wallet);

			setShowLayoutPanel(false);
			setShowUserMenu(false);
			setLayoutEditMode(false);
		} catch (e: any) {
			console.error('Failed to save layout:', e);
		} finally {
			setSaving(false);
		}
	}

	function getLayoutMenu() {
		const navPosition = portalProvider.portal?.Layout?.navigation?.layout?.position;
		const isSideNav = navPosition === 'left' || navPosition === 'right';

		return (
			<S.LayoutMenu>
				<S.LayoutHeader>
					<S.BackButton
						onClick={() => {
							setShowLayoutPanel(false);
							setLayoutEditMode(false);
						}}
					>
						<ReactSVG src={ICONS.ENGINE.arrow} />
					</S.BackButton>
					<span>Edit Layout</span>
					<div style={{ width: 24 }} />
				</S.LayoutHeader>
				<S.NavigationWrapper>
					<S.NavigationCategory>Header</S.NavigationCategory>
					<S.SliderRow>
						<label>Height</label>
						<input
							type="range"
							value={layoutHeights.header}
							onChange={(e) => setLayoutHeights({ ...layoutHeights, header: parseInt(e.target.value) })}
							min={48}
							max={300}
						/>
						<span>{layoutHeights.header}px</span>
					</S.SliderRow>
					{isSideNav && (
						<S.ToggleRow>
							<label>Sticky</label>
							<S.Toggle $active={headerSticky} onClick={() => setHeaderSticky(!headerSticky)} />
						</S.ToggleRow>
					)}
					{!isSideNav && (
						<>
							<S.SliderRow>
								<label>Logo Size</label>
								<input
									type="range"
									value={logoSettings.size}
									onChange={(e) => setLogoSettings({ ...logoSettings, size: parseInt(e.target.value) })}
									min={10}
									max={100}
								/>
								<span>{logoSettings.size}%</span>
							</S.SliderRow>
							<S.EntryRow>
								<label>Logo Position X</label>
								<select
									value={logoSettings.positionX}
									onChange={(e) =>
										setLogoSettings({ ...logoSettings, positionX: e.target.value as LogoSettings['positionX'] })
									}
								>
									<option value="left">Left</option>
									<option value="center">Center</option>
									<option value="right">Right</option>
								</select>
							</S.EntryRow>
							<S.EntryRow>
								<label>Logo Position Y</label>
								<select
									value={logoSettings.positionY}
									onChange={(e) =>
										setLogoSettings({ ...logoSettings, positionY: e.target.value as LogoSettings['positionY'] })
									}
								>
									<option value="top">Top</option>
									<option value="center">Center</option>
									<option value="bottom">Bottom</option>
								</select>
							</S.EntryRow>
						</>
					)}
				</S.NavigationWrapper>
				<S.DSpacer />
				<S.NavigationWrapper>
					<S.NavigationCategory>Navigation</S.NavigationCategory>
					{isSideNav ? (
						<>
							<S.SliderRow>
								<label>Width</label>
								<input
									type="range"
									value={layoutHeights.navigation}
									onChange={(e) => setLayoutHeights({ ...layoutHeights, navigation: parseInt(e.target.value) })}
									min={200}
									max={400}
								/>
								<span>{layoutHeights.navigation}px</span>
							</S.SliderRow>
							<S.SliderRow>
								<label>Logo Size</label>
								<input
									type="range"
									value={logoSettings.size}
									onChange={(e) => setLogoSettings({ ...logoSettings, size: parseInt(e.target.value) })}
									min={10}
									max={100}
								/>
								<span>{logoSettings.size}%</span>
							</S.SliderRow>
							<S.EntryRow>
								<label>Logo Position X</label>
								<select
									value={logoSettings.positionX}
									onChange={(e) =>
										setLogoSettings({ ...logoSettings, positionX: e.target.value as LogoSettings['positionX'] })
									}
								>
									<option value="left">Left</option>
									<option value="center">Center</option>
									<option value="right">Right</option>
								</select>
							</S.EntryRow>
						</>
					) : (
						<>
							<S.ToggleRow>
								<label>Sticky</label>
								<S.Toggle $active={navSticky} onClick={() => setNavSticky(!navSticky)} />
							</S.ToggleRow>
							<S.SliderRow>
								<label>Height</label>
								<input
									type="range"
									value={layoutHeights.navigation}
									onChange={(e) => setLayoutHeights({ ...layoutHeights, navigation: parseInt(e.target.value) })}
									min={30}
									max={100}
								/>
								<span>{layoutHeights.navigation}px</span>
							</S.SliderRow>
						</>
					)}
				</S.NavigationWrapper>
				<S.DSpacer />
				<S.NavigationWrapper>
					<S.NavigationCategory>Footer</S.NavigationCategory>
					<S.ToggleRow>
						<label>Fixed</label>
						<S.Toggle $active={footerFixed} onClick={() => setFooterFixed(!footerFixed)} />
					</S.ToggleRow>
				</S.NavigationWrapper>
				<S.LayoutFooter>
					<S.LayoutButton onClick={handleLayoutCancel} disabled={saving}>
						Cancel
					</S.LayoutButton>
					<S.LayoutButton $primary onClick={handleLayoutSave} disabled={saving}>
						{saving ? 'Saving...' : 'Save'}
					</S.LayoutButton>
				</S.LayoutFooter>
			</S.LayoutMenu>
		);
	}

	function getUserMenu() {
		return (
			<S.CubeWrapper>
				<S.CubeContainer $rotated={showLayoutPanel}>
					<S.CubeFaceFront $rotated={showLayoutPanel}>
						<S.UserMenu id="UserMenu">
							<S.MobileMenuClose onClick={() => setShowUserMenu(false)}>✕</S.MobileMenuClose>
							<S.HeaderWrapper>
								<S.Header>
									<S.Banner>
										{banner !== '' && (
											<img
												className="missingBanner"
												onLoad={(e) => e.currentTarget.classList.remove('missingBanner')}
												src={banner}
											/>
										)}
									</S.Banner>
									<S.AvatarWrapper>
										<Avatar profile={profile} size={52} />
									</S.AvatarWrapper>
									<S.DisplayName>{profile?.displayName ? profile.displayName : 'My Profile'}</S.DisplayName>
									<S.DAddress>
										{shorten(arProvider.walletAddress)}
										<ReactSVG src={ICONS.copy} />
									</S.DAddress>
								</S.Header>
							</S.HeaderWrapper>
							<S.NavigationWrapper>
								<S.NavigationCategory>User</S.NavigationCategory>
								{profile?.id && (
									<S.NavigationEntry
										onClick={() => {
											setShowUserMenu(false);
											navigate(getRedirect(`author/${profile.id}`));
										}}
									>
										<ReactSVG src={ICONS.user} />
										{language.myProfile}
									</S.NavigationEntry>
								)}
								<S.NavigationEntry $disabled={!profile?.id}>
									<ReactSVG src={ICONS.post} />
									{language.myPosts}
								</S.NavigationEntry>
								<S.NavigationEntry $disabled={!profile?.id}>
									<ReactSVG src={ICONS.comments} />
									{language.myComments}
								</S.NavigationEntry>
								{auth?.authType !== 'NATIVE_WALLET' && arProvider.walletType !== 'NATIVE_WALLET' && (
									<S.NavigationEntry onClick={() => window.wanderInstance.open('home')}>
										<ReactSVG src={ICONS.wallet} />
										{language.myWallet}
									</S.NavigationEntry>
								)}
								{auth?.authType !== 'NATIVE_WALLET' &&
									arProvider.walletType !== 'NATIVE_WALLET' &&
									arProvider.backupsNeeded > 0 && (
										<S.NavigationEntry onClick={() => window.wanderInstance.open('backup')}>
											<ReactSVG src={ICONS.backup} />
											{language.backupWallet || 'Backup Wallet'}
											<S.Hint>
												<ReactSVG src={ICONS.info} />
											</S.Hint>
										</S.NavigationEntry>
									)}
								<S.NavigationEntry onClick={() => setShowProfileManage(true)}>
									<ReactSVG src={profile?.id ? ICONS.edit : ICONS.user} />
									{profile?.id ? language.editProfile : language.createProfile}
									{!profile?.id && (
										<S.Hint>
											<ReactSVG src={ICONS.info} />
										</S.Hint>
									)}
								</S.NavigationEntry>
							</S.NavigationWrapper>
							<S.DSpacer />
							{(() => {
								if (!profile?.id) return null;
								const roles: string[] = Array.isArray(profile?.roles) ? profile.roles : [];
								const isAdmin = roles.includes('Admin');
								const isAdminOrMod = isAdmin || roles.includes('Moderator');
								if (!isAdminOrMod) return null;
								return (
									<>
										<S.NavigationWrapper>
											<S.NavigationCategory>Portal</S.NavigationCategory>
											{isAdmin && (
												<S.NavigationEntry
													onClick={() => {
														setShowLayoutPanel(true);
														setLayoutEditMode(true);
													}}
												>
													<ReactSVG src={ICONS.layout} />
													Edit Layout
												</S.NavigationEntry>
											)}
											{isAdmin && localStorage.getItem('devMode') === 'true' && (
												<S.NavigationEntry
													onClick={() => {
														setShowUserMenu(false);
														portalProvider.setEditorMode('mini');
													}}
												>
													<ReactSVG src={ICONS.portal} />
													Zone Editor
												</S.NavigationEntry>
											)}
											<S.NavigationEntry onClick={() => window.open('https://portal.arweave.net/', '_blank')}>
												<ReactSVG src={ICONS.portal} />
												Portal Editor
											</S.NavigationEntry>
										</S.NavigationWrapper>
										<S.DSpacer />
									</>
								);
							})()}
							<S.DFooterWrapper>
								<S.NavigationEntry onClick={handleDisconnect}>
									<ReactSVG src={ICONS.signout} />
									{language.disconnect}
								</S.NavigationEntry>
							</S.DFooterWrapper>
						</S.UserMenu>
					</S.CubeFaceFront>
					<S.CubeFaceRight $rotated={showLayoutPanel}>{getLayoutMenu()}</S.CubeFaceRight>
				</S.CubeContainer>
			</S.CubeWrapper>
		);
	}

	function getHeader() {
		const profileReady = permawebProvider.libs && !permawebProvider.profileLoading;
		const missingProfileCount = profileReady && !profile?.id ? 1 : 0;
		const isEmbeddedWallet = auth?.authType !== 'NATIVE_WALLET' && arProvider.walletType !== 'NATIVE_WALLET';
		const backupCount = isEmbeddedWallet ? arProvider.backupsNeeded || 0 : 0;
		const notificationCount = backupCount + missingProfileCount;
		const showNotification = arProvider.walletAddress && notificationCount > 0;

		return (
			<S.UserButton>
				<S.WanderConnectWrapper ref={wrapperRef} />
				{(label || isLoading) && (
					<S.LAction onClick={handlePress}>
						{avatar ? (
							<div>
								<img src={checkValidAddress(avatar) ? getTxEndpoint(avatar) : avatar} />
							</div>
						) : (
							<ReactSVG src={ICONS.user} />
						)}
						<S.MobileAvatar>
							<Avatar profile={profile} size={26} />
						</S.MobileAvatar>
						<S.LabelWrapper $loading={isLoading}>
							<S.LoadingDots $visible={isLoading}>
								<span />
								<span />
								<span />
							</S.LoadingDots>
							<span>{label || 'Log in'}</span>
						</S.LabelWrapper>
						{showNotification && <S.NotificationBubble>{notificationCount}</S.NotificationBubble>}
					</S.LAction>
				)}
			</S.UserButton>
		);
	}

	function getView() {
		return (
			<S.Wrapper>
				{getHeader()}
				{showUserMenu && (
					<Panel
						open={showUserMenu}
						header={''}
						handleClose={handleCloseMenu}
						width={300}
						transparent={showLayoutPanel}
					>
						{getUserMenu()}
					</Panel>
				)}
			</S.Wrapper>
		);
	}

	return (
		<>
			{getView()}
			{showProfileManage && (
				<Panel
					open={showProfileManage}
					header={profile && profile.id ? language.editProfile : `${language.createProfile}!`}
					handleClose={() => setShowProfileManage(false)}
				>
					<S.PManageWrapper>
						<ProfileEditor
							profile={profile && profile.id ? profile : null}
							handleClose={() => setShowProfileManage(false)}
							handleUpdate={null}
						/>
					</S.PManageWrapper>
				</Panel>
			)}
		</>
	);
}
