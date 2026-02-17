import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { useTheme } from 'styled-components';

import { LanguageSelect } from 'components/molecules/LanguageSelect';
import { ICONS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletConnect } from 'wallet/WalletConnect';

import * as S from './HeaderStyles';

export function Header(props: {
	showInvites?: boolean;
	onInvitesClick?: () => void;
	invitesCount?: number;
	loading?: boolean;
	id?: string;
}) {
	const theme = useTheme();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

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
					header.style.borderBottom = lastScrollY > 0 ? `1px solid ${borderColor}` : '1px solid transparent';
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	}, [theme.colors.border.primary]);

	return (
		<S.HeaderWrapper id={'navigation-header'}>
			<S.HeaderContent>
				<S.HeaderActionsWrapper>
					<Link to={URLS.base}>
						<S.HeaderLogo>
							<ReactSVG src={ICONS.portal} />
						</S.HeaderLogo>
					</Link>
					<S.HeaderAction>
						<Link to={URLS.docs}>{language?.helpCenter}</Link>
					</S.HeaderAction>
					{props.showInvites && props.onInvitesClick && (
						<S.HeaderAction>
							<button onClick={props.onInvitesClick} disabled={props.loading}>
								{language?.invites}
								{props.invitesCount !== undefined && props.invitesCount > 0 && (
									<div className={'notification'}>
										<span>{props.invitesCount}</span>
									</div>
								)}
							</button>
						</S.HeaderAction>
					)}
				</S.HeaderActionsWrapper>
				<S.HeaderActionsWrapper>
					<LanguageSelect />
					<WalletConnect app={'editor'} />
				</S.HeaderActionsWrapper>
			</S.HeaderContent>
		</S.HeaderWrapper>
	);
}
