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

	const { portal } = usePortalProvider();
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
		<S.Navigation $layout={layout} maxWidth={Layout?.basics?.maxWidth} id="Navigation">
			{preview && <GlobalStyles />}
			<S.NavigationEntries $layout={layout} maxWidth={Layout?.basics?.maxWidth}>
				{content &&
					Object.entries(content).map(([key, entry]: [string, any]) => (
						<NavigationEntry key={key} index={key} entry={entry} layout={layout} />
					))}
				<Search />
			</S.NavigationEntries>
		</S.Navigation>
	);
}
