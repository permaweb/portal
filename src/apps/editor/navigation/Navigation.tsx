import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';
import { useTheme } from 'styled-components';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { ICONS, STYLING, URLS } from 'helpers/config';
import { PortalHeaderType, PortalPatchMapEnum } from 'helpers/types';
import { formatAddress, isOnlyPortal, resolvePrimaryDomain } from 'helpers/utils';
import { checkWindowCutoff } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletConnect } from 'wallet/WalletConnect';
import { CloseHandler } from 'wrappers/CloseHandler';

import { useNavigation } from './NavigationContext';
import * as S from './styles';

export default function Navigation(props: { open: boolean; toggle: () => void }) {
	const navigate = useNavigate();
	const location = useLocation();
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();
	const { navWidth, setNavWidth } = useNavigation();
	const theme = useTheme();

	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
	const [showPortalDropdown, setShowPortalDropdown] = React.useState<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [portalUpdating, setPortalUpdating] = React.useState<boolean>(false);
	const [pendingPortalId, setPendingPortalId] = React.useState<string | null>(null);
	const [isResizing, setIsResizing] = React.useState<boolean>(false);

	React.useEffect(() => {
		const header = document.getElementById('navigation-header');
		if (!header) return;

		let lastScrollY = 0;
		let ticking = false;
		const borderColor = theme.colors.border.primary;

		const handleScroll = () => {
			lastScrollY = window.scrollY;
			if (!ticking) {
				window.requestAnimationFrame(() => {
					const parts = window.location.href.split('/');
					const isEditorPage = parts.some((part) => part === 'post' || part === 'page');
					if (!isEditorPage) {
						header.style.borderBottom = lastScrollY > 0 ? `1px solid ${borderColor}` : '1px solid transparent';
					} else {
						const subheader = document.getElementById('toolbar-wrapper');
						if (!subheader) return;

						subheader.style.borderBottom = lastScrollY > 0 ? `1px solid ${borderColor}` : '1px solid transparent';
					}
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	}, [location.pathname, theme.colors.border.primary]);

	React.useEffect(() => {
		if (pendingPortalId && permawebProvider.profile?.portals) {
			setLoading(true);
			const hasJoinedPortal = permawebProvider.profile.portals.find(
				(portal: PortalHeaderType) => portal.id === pendingPortalId
			);

			if (hasJoinedPortal) {
				navigate(`${URLS.base}${pendingPortalId}`);
				setLoading(false);
				setPendingPortalId(null);

				window.location.reload();
			}
		}
	}, [pendingPortalId, permawebProvider.profile?.portals, navigate]);

	const paths = React.useMemo(() => {
		const hash = window.location.hash;
		const parts = hash.split('/').filter(Boolean);
		const currentId = parts[1];
		return [
			{
				path: currentId ? URLS.portalBase(currentId) : URLS.base,
				icon: ICONS.portal,
				label: language?.home,
			},
			{
				path: currentId ? URLS.portalPosts(currentId) : URLS.base,
				icon: ICONS.posts,
				label: language?.posts,
			},
			{
				path: currentId ? URLS.portalModeration(currentId) : URLS.base,
				icon: ICONS.moderation,
				label: language?.moderation,
			},
			{
				path: currentId ? URLS.portalDesign(currentId) : URLS.base,
				icon: ICONS.design,
				label: language?.design,
			},
			{
				path: currentId ? URLS.portalMedia(currentId) : URLS.base,
				icon: ICONS.media,
				label: language?.media,
				useFill: true,
			},
			{
				path: currentId ? URLS.portalSetup(currentId) : URLS.base,
				icon: ICONS.setup,
				label: language?.setup,
			},
			{
				path: currentId ? URLS.portalUsers(currentId) : URLS.base,
				icon: ICONS.users,
				label: language?.users,
			},
			{
				path: currentId ? URLS.portalPages(currentId) : URLS.base,
				icon: ICONS.pages,
				label: language?.pages,
			},
			{
				path: currentId ? URLS.portalDomains(currentId) : URLS.base,
				icon: ICONS.domains,
				label: language?.domains,
			},
			{
				path: currentId ? URLS.portalMonetization(currentId) : URLS.base,
				icon: ICONS.money,
				label: 'Monetization',
			},
		];
	}, [languageProvider?.current]);

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.desktop))) {
			setDesktop(true);
		} else {
			setDesktop(false);
		}
	}

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), []);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);
		return () => window.removeEventListener('resize', debouncedResize);
	}, [debouncedResize]);

	const handleResizeStart = React.useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	}, []);

	const handleResizeMove = React.useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return;

			const newWidth = Math.max(STYLING.dimensions.nav.widthMin, Math.min(260, e.clientX));
			const finalWidth = newWidth < 140 ? STYLING.dimensions.nav.widthMin : newWidth;

			setNavWidth(finalWidth);

			document.documentElement.style.setProperty('--nav-width', `${finalWidth}px`);
		},
		[isResizing, setNavWidth]
	);

	const handleResizeEnd = React.useCallback(() => {
		setIsResizing(false);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}, []);

	React.useEffect(() => {
		if (isResizing) {
			document.addEventListener('mousemove', handleResizeMove);
			document.addEventListener('mouseup', handleResizeEnd);
			return () => {
				document.removeEventListener('mousemove', handleResizeMove);
				document.removeEventListener('mouseup', handleResizeEnd);
			};
		}
	}, [isResizing, handleResizeMove, handleResizeEnd]);

	React.useEffect(() => {
		document.documentElement.style.setProperty('--nav-width', `${navWidth}px`);
	}, [navWidth]);

	const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
		e.preventDefault();
		navigate(to);
		if (!desktop) props.toggle();
	};

	const navigationToggle = React.useMemo(() => {
		return (
			<S.ToggleWrapper open={props.open}>
				<IconButton
					type={props.open ? 'primary' : 'alt1'}
					src={ICONS.navigation}
					handlePress={props.toggle}
					dimensions={{
						wrapper: 33.5,
						icon: 19.5,
					}}
					tooltip={props.open ? language?.sidebarClose : language?.sidebarOpen}
					tooltipPosition={props.open ? 'right' : 'bottom-left'}
				/>
			</S.ToggleWrapper>
		);
	}, [props.open]);

	const panel = React.useMemo(() => {
		const showText = navWidth > 120;
		const content = (
			<>
				<S.PanelHeader>{navigationToggle}</S.PanelHeader>
				<S.PanelContent open={props.open} className={'fade-in scroll-wrapper-hidden'}>
					{paths.map((element, index) => (
						<S.PanelLink key={index} showText={showText} useFill={element.useFill}>
							<Link to={element.path} onClick={(e) => handleNavigate(e, element.path)}>
								<ReactSVG src={element.icon} />
								{showText && element.label}
								{!showText && (
									<S.LinkTooltip className={'info'}>
										<span>{element.label}</span>
									</S.LinkTooltip>
								)}
							</Link>
						</S.PanelLink>
					))}
				</S.PanelContent>
				<S.PanelFooter open={props.open} showText={showText} className={'fade-in'}>
					<Link to={URLS.docsIntro} onClick={(e) => handleNavigate(e, URLS.docsIntro)}>
						<ReactSVG src={ICONS.help} />
						{showText && language?.helpCenter}
						{!showText && (
							<S.HelpCenterTooltip className={'info'}>
								<span>{language?.help}</span>
							</S.HelpCenterTooltip>
						)}
					</Link>
				</S.PanelFooter>
			</>
		);

		if (desktop) {
			return (
				<S.Panel open={props.open} className={'fade-in'} width={props.open ? navWidth : 0}>
					{props.open && (
						<>
							{content}
							<S.ResizeHandle onMouseDown={handleResizeStart} />
						</>
					)}
				</S.Panel>
			);
		} else {
			return (
				<>
					<S.Panel open={props.open} className={'fade-in'} width={navWidth}>
						<CloseHandler active={props.open} disabled={!props.open} callback={() => props.toggle()}>
							{content}
						</CloseHandler>
					</S.Panel>
					<S.PanelOverlay open={props.open} />
				</>
			);
		}
	}, [navWidth, props.open, desktop, languageProvider?.current]);

	async function handlePortalUpdate() {
		if (portalProvider.current?.id) {
			setPortalUpdating(true);
			try {
				await permawebProvider.libs.updateZoneVersion({
					zoneId: portalProvider.current.id,
				});
				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Overview);
				addNotification(`${language.portalUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'An error occurred getting this portal', 'warning');
			}
			setPortalUpdating(false);
		}
	}

	async function joinPortal(portalId: string) {
		if (portalId && permawebProvider.profile?.id) {
			setShowPortalDropdown(false);
			setLoading(true);
			try {
				const profileUpdateId = await permawebProvider.libs.joinZone(
					{
						zoneToJoinId: portalId,
						storePath: 'Portals',
					},
					permawebProvider.profile.id
				);

				console.log(`Profile update: ${profileUpdateId}`);

				setPendingPortalId(portalId);
				permawebProvider.refreshProfile();
			} catch (e: any) {
				console.error(e);
				setPendingPortalId(null);
			}
			setLoading(false);
		}
	}

	const portal = React.useMemo(() => {
		if (portalProvider.current?.id) {
			return (
				<S.PortalWrapper className={'fade-in'}>
					<CloseHandler
						active={showPortalDropdown}
						disabled={!showPortalDropdown}
						callback={() => setShowPortalDropdown(false)}
					>
						<S.Portal
							onClick={() => setShowPortalDropdown(!showPortalDropdown)}
							active={showPortalDropdown}
							disabled={!portalProvider.current}
						>
							<span>{portalProvider.current ? portalProvider.current.name : '-'}</span>
							<ReactSVG src={ICONS.arrow} />
							{(portalProvider.updateAvailable || portalProvider.invites?.length > 0) && (
								<S.UpdateNotification>
									{(portalProvider.updateAvailable ? 1 : 0) + (portalProvider.invites?.length || 0)}
								</S.UpdateNotification>
							)}
						</S.Portal>
						{showPortalDropdown && (
							<S.PortalDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper-hidden'}>
								<S.PDropdownHeader>
									<p>{language?.portals}</p>
								</S.PDropdownHeader>
								{portalProvider.portals && portalProvider.portals.length > 0 && (
									<S.PDropdownBody>
										{portalProvider.portals.map((portal: PortalHeaderType) => {
											const hash = window.location.hash;
											const parts = hash.split('/').filter(Boolean);

											const currentId = parts[1] || ''; // Portal ID

											let section = parts[2] || ''; // Sub-Navigation, Posts, Media, Setup, Etc
											let afterSection = parts[3] || ''; // Post ID / Page ID

											if (afterSection) section = ''; // Special case for Editor

											const active = portalProvider.current ? currentId === portal.id : false;
											const path = `${URLS.base}${portal.id}/${section}`;

											return (
												<S.PDropdownLink key={portal.id} active={active} onClick={() => setShowPortalDropdown(false)}>
													<Link to={path} onClick={(e) => handleNavigate(e, path)}>
														<p>{portal.name ?? formatAddress(portal.id, false)}</p>
														{active && (
															<>
																{portalProvider.updateAvailable ? (
																	<Button
																		type={'alt4'}
																		label={`${language.updateAvailable}`}
																		handlePress={(e: any) => {
																			e.stopPropagation();
																			e.preventDefault();
																			setShowPortalDropdown(false);
																			handlePortalUpdate();
																		}}
																	/>
																) : (
																	<S.PIndicator>
																		<ReactSVG src={ICONS.checkmark} />
																	</S.PIndicator>
																)}
															</>
														)}
													</Link>
												</S.PDropdownLink>
											);
										})}
									</S.PDropdownBody>
								)}
								{portalProvider.invites?.length > 0 && (
									<S.PDropdownInvites>
										<S.PDropdownHeader>
											<p>{language?.invites}</p>
										</S.PDropdownHeader>
										<S.PDropdownBody>
											{portalProvider.invites.map((portal: PortalHeaderType) => {
												return (
													<S.PDropdownAction key={portal.id} onClick={() => setShowPortalDropdown(false)}>
														<button
															onClick={(e) => {
																e.stopPropagation();
																joinPortal(portal.id);
															}}
														>
															<p>{portal.name ?? formatAddress(portal.id, false)}</p>
															<div className={'info'}>
																<span className={'join-portal-info'}>{language?.joinPortal}</span>
															</div>
														</button>
													</S.PDropdownAction>
												);
											})}
										</S.PDropdownBody>
									</S.PDropdownInvites>
								)}
								<S.PDropdownFooter>
									<button
										onClick={() => {
											window.open(resolvePrimaryDomain(portalProvider.current?.domains, portalProvider.current?.id));
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ICONS.site} />
										{language?.goToSite}
									</button>
									<button
										onClick={(e: any) => {
											handleNavigate(e, `${URLS.base}${portalProvider.current.id}`);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ICONS.portal} />
										{language?.portalReturn}
									</button>
									<button
										onClick={() => {
											portalProvider.setShowPortalManager(true);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ICONS.write} />
										{language?.editPortal}
									</button>
									<button
										onClick={() => {
											portalProvider.setShowPortalManager(true, true);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ICONS.add} />
										{language?.createPortal}
									</button>
									{!isOnlyPortal(portalProvider.portals, permawebProvider.profile?.id) && (
										<button onClick={(e: any) => handleNavigate(e, URLS.base)}>
											<ReactSVG src={ICONS.disconnect} />
											{language?.portalsReturn}
										</button>
									)}
								</S.PDropdownFooter>
							</S.PortalDropdown>
						)}
					</CloseHandler>
					{portalProvider.updating && (
						<S.PortalUpdateWrapper>
							<span>{`${language?.updating}...`}</span>
						</S.PortalUpdateWrapper>
					)}
				</S.PortalWrapper>
			);
		}
		return (
			<S.LoadingWrapper>
				<span>{`${language?.loading}...`}</span>
			</S.LoadingWrapper>
		);
	}, [
		showPortalDropdown,
		portalProvider.portals,
		portalProvider.current?.id,
		portalProvider.current?.name,
		portalProvider.updating,
		permawebProvider.profile?.id,
		languageProvider?.current,
	]);

	return (
		<>
			{loading && <Loader message={`${language?.loading}...`} />}
			{portalUpdating && <Loader message={`${language.updatingPortal}...`} />}
			{panel}
			<S.Header
				id={'navigation-header'}
				navigationOpen={props.open}
				navWidth={props.open ? navWidth : 0}
				className={'fade-in'}
			>
				<S.Content>
					<S.C1Wrapper>
						{!props.open && navigationToggle}
						{portal}
					</S.C1Wrapper>
					<S.ActionsWrapper>
						<WalletConnect app={'editor'} />
					</S.ActionsWrapper>
				</S.Content>
			</S.Header>
		</>
	);
}
