import React from 'react';
import { ReactSVG } from 'react-svg';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';

import * as S from './styles';

export interface MenuEntry {
	icon?: string;
	label: string;
	onClick?: () => void;
	action?: 'editPost';
	postId?: string;
	submenu?: MenuEntry[];
}

export interface MenuSpacer {
	type: 'spacer';
}

export type MenuItem = MenuEntry | MenuSpacer;

interface ContextMenuProps {
	entries: MenuItem[];
	children?: React.ReactNode;
}

export default function ContextMenu({ entries, children }: ContextMenuProps) {
	const [openMenu, setOpenMenu] = React.useState(false);
	const [openSubmenu, setOpenSubmenu] = React.useState<number | null>(null);
	const [submenuDirection, setSubmenuDirection] = React.useState<'right' | 'left'>('right');
	const [menuVerticalDirection, setMenuVerticalDirection] = React.useState<'down' | 'up'>('down');
	const menuRef = React.useRef<HTMLDivElement>(null);
	const submenuRef = React.useRef<HTMLDivElement>(null);
	const menuEntriesRef = React.useRef<HTMLDivElement>(null);
	const { portalId } = usePortalProvider();

	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpenMenu(false);
				setOpenSubmenu(null);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	if (entries.length === 0) return null;

	const handleMenuToggle = () => {
		const newOpenState = !openMenu;
		setOpenMenu(newOpenState);

		if (newOpenState) {
			setTimeout(() => {
				if (menuEntriesRef.current) {
					const rect = menuEntriesRef.current.getBoundingClientRect();
					const viewportHeight = window.innerHeight;
					if (rect.bottom > viewportHeight) {
						setMenuVerticalDirection('up');
					} else {
						setMenuVerticalDirection('down');
					}
				}
			}, 0);
		}
	};

	return (
		<S.Menu ref={menuRef}>
			{children ? (
				<div onClick={handleMenuToggle}>{children}</div>
			) : (
				<S.IconWrapper onClick={handleMenuToggle}>
					<ReactSVG src={ICONS.ENGINE.menu} />
				</S.IconWrapper>
			)}
			{openMenu && (
				<S.MenuEntries ref={menuEntriesRef} className={menuVerticalDirection === 'up' ? 'up' : ''}>
					{entries.map((item, index) => {
						if ('type' in item && item.type === 'spacer') {
							return <S.MenuSpacer key={index} />;
						}
						const entry = item as MenuEntry;

						if (entry.submenu) {
							const handleMouseEnter = () => {
								setOpenSubmenu(index);
								setTimeout(() => {
									if (submenuRef.current) {
										const rect = submenuRef.current.getBoundingClientRect();
										const viewportWidth = window.innerWidth;
										if (rect.right > viewportWidth) {
											setSubmenuDirection('left');
										} else {
											setSubmenuDirection('right');
										}
									}
								}, 0);
							};

							return (
								<S.MenuEntryWithSubmenu
									key={index}
									onMouseEnter={handleMouseEnter}
									onMouseLeave={() => setOpenSubmenu(null)}
								>
									<S.MenuEntry>
										{entry.icon && <ReactSVG src={entry.icon} />}
										{entry.label}
										<S.SubmenuArrow>
											<ReactSVG src={ICONS.ENGINE.arrow} />
										</S.SubmenuArrow>
									</S.MenuEntry>
									{openSubmenu === index && (
										<S.Submenu ref={submenuRef} className={submenuDirection === 'left' ? 'left' : ''}>
											{entry.submenu.map((subitem, subindex) => {
												const handleSubClick = () => {
													if (subitem.onClick) {
														subitem.onClick();
													}
													setOpenMenu(false);
													setOpenSubmenu(null);
												};
												return (
													<S.MenuEntry key={subindex} onClick={handleSubClick}>
														{subitem.icon && <ReactSVG src={subitem.icon} />}
														{subitem.label}
													</S.MenuEntry>
												);
											})}
										</S.Submenu>
									)}
								</S.MenuEntryWithSubmenu>
							);
						}

						const handleClick = () => {
							if (entry.action === 'editPost' && entry.postId && portalId) {
								window.open(`https://portal.arweave.net/#/${portalId}/post/edit/article/${entry.postId}`, '_blank');
							} else if (entry.onClick) {
								entry.onClick();
							}
							setOpenMenu(false);
						};
						return (
							<S.MenuEntry key={index} onClick={handleClick}>
								{entry.icon && <ReactSVG src={entry.icon} />}
								{entry.label}
							</S.MenuEntry>
						);
					})}
				</S.MenuEntries>
			)}
		</S.Menu>
	);
}
