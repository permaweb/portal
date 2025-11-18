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
	const menuRef = React.useRef<HTMLDivElement>(null);
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

	return (
		<S.Menu ref={menuRef}>
			{children ? (
				<div onClick={() => setOpenMenu(!openMenu)}>{children}</div>
			) : (
				<S.IconWrapper onClick={() => setOpenMenu(!openMenu)}>
					<ReactSVG src={ICONS.ENGINE.menu} />
				</S.IconWrapper>
			)}
			{openMenu && (
				<S.MenuEntries>
					{entries.map((item, index) => {
						if ('type' in item && item.type === 'spacer') {
							return <S.MenuSpacer key={index} />;
						}
						const entry = item as MenuEntry;

						if (entry.submenu) {
							return (
								<S.MenuEntryWithSubmenu
									key={index}
									onMouseEnter={() => setOpenSubmenu(index)}
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
										<S.Submenu>
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
