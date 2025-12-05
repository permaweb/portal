import React from 'react';
import { NavLink } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getRedirect } from 'helpers/utils';

import { GlobalStyles } from '../../../global-styles';

import Search from './search';
import * as S from './styles';

export default function Navigation(props: any) {
	const preview = props.preview;
	const layout = props.layout;
	const content = props.content;

	const portalProvider = usePortalProvider();
	const { portal, layoutHeights, setLayoutHeights, navSticky, layoutEditMode } = portalProvider;
	const [isDragging, setIsDragging] = React.useState(false);
	const [startPos, setStartPos] = React.useState(0);
	const [startSize, setStartSize] = React.useState(0);

	const isSideNav = layout?.position === 'left' || layout?.position === 'right';

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

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes, Layout);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, [preview, Themes, Layout]);

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
				{content &&
					Object.entries(content).map(([key, entry]: [string, any]) => (
						<NavigationEntry key={key} index={key} entry={entry} layout={layout} />
					))}
				<Search />
			</S.NavigationEntries>
			{layoutEditMode && (
				<>
					<S.ResizeHandle
						$isDragging={isDragging}
						$isSideNav={isSideNav}
						$position={layout?.position}
						onMouseDown={handleMouseDown}
					>
						<S.HandleBar $isSideNav={isSideNav} />
					</S.ResizeHandle>
					<S.HandleLabel
						style={
							isSideNav
								? { left: layoutHeights.navigation + 10, top: '50%', transform: 'translateY(-50%)' }
								: { left: '50%', bottom: -10, transform: 'translateX(-50%)' }
						}
					>
						{isSideNav ? 'Width' : 'Height'} ({layoutHeights.navigation}px)
					</S.HandleLabel>
				</>
			)}
		</S.Navigation>
	);
}
