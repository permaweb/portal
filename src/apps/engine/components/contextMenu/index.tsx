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
	const menuRef = React.useRef<HTMLDivElement>(null);
	const { portalId } = usePortalProvider();

	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpenMenu(false);
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
					<ReactSVG src={ICONS.menu} />
				</S.IconWrapper>
			)}
			{openMenu && (
				<S.MenuEntries>
					{entries.map((item, index) => {
						if ('type' in item && item.type === 'spacer') {
							return <S.MenuSpacer key={index} />;
						}
						const entry = item as MenuEntry;
						const handleClick = () => {
							if (entry.action === 'editPost' && entry.postId && portalId) {
								window.open(`https://portal.arweave.net/#/${portalId}/post/edit/article/${entry.postId}`, '_blank');
							} else if (entry.onClick) {
								entry.onClick();
							}
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
