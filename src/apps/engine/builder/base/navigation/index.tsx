import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import SocialLinks from 'engine/components/socialLinks';
import Toggle from 'engine/components/toggle';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { getRedirect } from 'helpers/utils';

import { GlobalStyles } from '../../../global-styles';

import Search from './search';
import * as S from './styles';

export default function Navigation(props: any) {
	const preview = props.preview;
	const layout = props.layout;
	const content = props.content;

	const portalProvider = usePortalProvider();
	const {
		portal,
		layoutHeights,
		setLayoutHeights,
		navSticky,
		layoutEditMode,
		logoSettings,
		mobileMenuOpen,
		setMobileMenuOpen,
	} = portalProvider;
	const { settings, updateSetting } = useSettings();
	const [isDragging, setIsDragging] = React.useState(false);
	const [startPos, setStartPos] = React.useState(0);
	const [startSize, setStartSize] = React.useState(0);

	function setTheme() {
		const newTheme = settings?.theme === 'dark' || !settings?.theme ? 'light' : 'dark';
		updateSetting('theme', newTheme);
		document.documentElement.setAttribute('theme', newTheme);
	}

	const isSideNav = layout?.position === 'left' || layout?.position === 'right';

	const staticPages = React.useMemo(() => {
		if (!portal?.Pages) return [];
		return Object.entries(portal.Pages)
			.filter(([_, page]: [string, any]) => page?.type === 'static')
			.map(([key, page]: [string, any]) => ({ key, ...page }));
	}, [portal?.Pages]);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		setStartPos(isSideNav ? e.clientX : e.clientY);
		setStartSize(layoutHeights.navigation);
	};

	React.useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (isSideNav) {
				const delta = layout?.position === 'right' ? startPos - e.clientX : e.clientX - startPos;
				const newWidth = Math.max(200, Math.min(400, startSize + delta));
				setLayoutHeights({ ...layoutHeights, navigation: newWidth });
			} else {
				const delta = e.clientY - startPos;
				const newHeight = Math.max(30, Math.min(100, startSize + delta));
				setLayoutHeights({ ...layoutHeights, navigation: newHeight });
			}
		};

		const handleMouseUp = () => setIsDragging(false);

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, startPos, startSize, layoutHeights, setLayoutHeights, isSideNav, layout?.position]);
	const Layout = preview ? defaultLayout : portal?.Layout;
	const Themes = preview ? defaultThemes : portal?.Themes;
	const Logo = portal?.Logo === 'None' ? ICONS.logo : portal?.Logo;
	const [logoError, setLogoError] = React.useState<{ [key: string]: boolean }>({});

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, [preview, Themes]);

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

	const NavigationEntry = (childProps: any) => {
		const entry = childProps.entry;
		const index = childProps.index ?? 0;

		const containerRef = React.useRef<HTMLDivElement | null>(null);
		const closeTimerRef = React.useRef<number | null>(null);

		const [open, setOpen] = React.useState(false);

		if (entry?.metadata?.hidden) return null;

		const hasChildren = !!entry?.children?.length;

		const clearCloseTimer = () => {
			if (closeTimerRef.current !== null) {
				window.clearTimeout(closeTimerRef.current);
				closeTimerRef.current = null;
			}
		};

		const scheduleClose = () => {
			clearCloseTimer();
			// small delay prevents flicker when crossing tiny gaps
			closeTimerRef.current = window.setTimeout(() => {
				setOpen(false);
				closeTimerRef.current = null;
			}, 150);
		};

		const handlePointerEnter = () => {
			clearCloseTimer();
			if (hasChildren) setOpen(true);
		};

		const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
			// If moving into a descendant (e.g., submenu), don't close
			const rt = e.relatedTarget as Node | null;
			if (containerRef.current && rt && containerRef.current.contains(rt)) {
				return;
			}
			scheduleClose();
		};

		const handleMenuEnter = () => {
			clearCloseTimer();
			if (hasChildren) setOpen(true);
		};

		const handleMenuLeave = (e: React.PointerEvent<HTMLDivElement>) => {
			const rt = e.relatedTarget as Node | null;
			if (containerRef.current && rt && containerRef.current.contains(rt)) {
				return;
			}
			scheduleClose();
		};

		const handleFocus = () => {
			if (hasChildren) setOpen(true);
		};
		const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
			const rt = e.relatedTarget as Node | null;
			if (containerRef.current && rt && containerRef.current.contains(rt)) {
				return;
			}
			scheduleClose();
		};

		return (
			<S.NavigationEntry
				ref={containerRef}
				id={`entry-${index}-${entry?.name ?? 'unnamed'}`}
				$layout={layout}
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}
				onFocus={handleFocus}
				onBlur={handleBlur}
			>
				<S.NavItem aria-haspopup={hasChildren ? 'menu' : undefined} aria-expanded={hasChildren ? open : undefined}>
					<NavLink to={getRedirect(`feed/category/${entry.name}`)}>
						{entry?.icon && (
							<S.Icon>
								<ReactSVG src={`/img/icons/${entry.icon}.svg`} />
							</S.Icon>
						)}
						{entry.name}
						{hasChildren && (
							<S.Arrow>
								<ReactSVG src={ICONS.ENGINE.arrow} />
							</S.Arrow>
						)}
					</NavLink>

					{(entry?.metadata?.description || entry?.description) && (
						<S.Tooltip>{entry?.metadata?.description ?? entry?.description}</S.Tooltip>
					)}
				</S.NavItem>

				{hasChildren && open && (
					<S.NavigationEntryMenu
						$layout={layout}
						role="menu"
						onPointerEnter={handleMenuEnter}
						onPointerLeave={handleMenuLeave}
					>
						{entry.children.map((child: any, i: number) => (
							<NavigationEntry
								key={`${entry.name}-${child?.name ?? 'child'}-${i}`}
								index={i}
								entry={child}
								preview={preview}
								layout={layout}
							/>
						))}
					</S.NavigationEntryMenu>
				)}
			</S.NavigationEntry>
		);
	};

	const MobileNavigationEntry = (mobileProps: { entry: any; onClose: () => void }) => {
		const entry = mobileProps.entry;

		if (entry?.metadata?.hidden) return null;

		const hasChildren = !!entry?.children?.length;

		return (
			<>
				<S.MobileNavEntry>
					<NavLink to={getRedirect(`feed/category/${entry.name}`)} onClick={mobileProps.onClose}>
						{entry.name}
					</NavLink>
				</S.MobileNavEntry>
				{hasChildren && (
					<S.MobileSubEntries>
						{entry.children.map((child: any, i: number) => (
							<MobileNavigationEntry key={`mobile-${entry.name}-${i}`} entry={child} onClose={mobileProps.onClose} />
						))}
					</S.MobileSubEntries>
				)}
			</>
		);
	};

	if (!layout) return null;

	return (
		<S.Navigation
			$layout={layout}
			maxWidth={Layout?.basics?.maxWidth}
			id="Navigation"
			$editHeight={layoutHeights.navigation}
			$editSticky={navSticky}
		>
			{preview && <GlobalStyles />}
			<S.NavigationEntries $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
				{isSideNav && Logo && (
					<S.NavLogo id="Logo" $logoSize={logoSettings?.size} $positionX={logoSettings?.positionX}>
						<NavLink to={getRedirect()}>{renderLogo(Logo)}</NavLink>
					</S.NavLogo>
				)}
				{content &&
					Object.entries(content).map(([key, entry]: [string, any]) => (
						<NavigationEntry key={key} index={key} entry={entry} layout={layout} />
					))}
				{staticPages.map((page: any) => (
					<S.NavigationEntry key={`static-${page.key}`} $layout={layout}>
						<S.NavItem>
							<NavLink to={getRedirect(`post/${page.id}`)}>{page.name}</NavLink>
						</S.NavItem>
					</S.NavigationEntry>
				))}
				{!isSideNav && <Search />}
			</S.NavigationEntries>
			{layoutEditMode && (
				<S.ResizeHandle
					$isDragging={isDragging}
					$isSideNav={isSideNav}
					$position={layout?.position}
					onMouseDown={handleMouseDown}
				>
					<S.HandleBar $isSideNav={isSideNav} />
					<S.HandleLabel $isSideNav={isSideNav}>
						{isSideNav ? 'Width' : 'Height'} ({layoutHeights.navigation || layout?.width || 300}px)
					</S.HandleLabel>
				</S.ResizeHandle>
			)}
			{!isSideNav &&
				ReactDOM.createPortal(
					<>
						<S.MobileOverlay $open={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
						<S.MobileDrawer $open={mobileMenuOpen}>
							<S.MobileDrawerHeader>
								<S.MobileThemeToggle>
									<Toggle theme state={settings?.theme === 'dark'} setState={() => setTheme()} />
								</S.MobileThemeToggle>
								<S.MobileDrawerClose onClick={() => setMobileMenuOpen(false)}>✕</S.MobileDrawerClose>
							</S.MobileDrawerHeader>
							<S.MobileSpacer />
							<Search expanded />
							<S.MobileSpacer />
							<S.MobileDrawerEntries>
								{content &&
									Object.entries(content).map(([key, entry]: [string, any]) => (
										<MobileNavigationEntry
											key={`mobile-${key}`}
											entry={entry}
											onClose={() => setMobileMenuOpen(false)}
										/>
									))}
								{staticPages.map((page: any) => (
									<S.MobileNavEntry key={`mobile-static-${page.key}`}>
										<NavLink to={getRedirect(`post/${page.id}`)} onClick={() => setMobileMenuOpen(false)}>
											{page.name}
										</NavLink>
									</S.MobileNavEntry>
								))}
							</S.MobileDrawerEntries>
							<S.MobileLinks>
								<SocialLinks />
							</S.MobileLinks>
						</S.MobileDrawer>
					</>,
					document.body
				)}
		</S.Navigation>
	);
}
