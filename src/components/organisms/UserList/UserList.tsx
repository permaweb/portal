import React from 'react';

import { Avatar } from 'components/atoms/Avatar';
import { PortalUserType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function UserList() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const users = React.useMemo(() => {
		if (!portalProvider.current?.assets) {
			return (
				<S.LoadingWrapper>
					<p>{`${language.gettingUsers}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.assets.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noUsersFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.Wrapper>
				{portalProvider.current.users.map((user: PortalUserType) => {
					return (
						<S.UserWrapper key={user.username} className={'fade-in'}>
							<S.UserHeader>
								<Avatar owner={null} dimensions={{ wrapper: 23.5, icon: 15 }} callback={null} />
								<p>{user.displayName}</p>
							</S.UserHeader>
							<S.UserDetail>
								<S.UserActions>
									<S.UserRole role={user.role}>
										<span>{user.role}</span>
									</S.UserRole>
								</S.UserActions>
							</S.UserDetail>
						</S.UserWrapper>
					);
				})}
			</S.Wrapper>
		) : null;
	}, [portalProvider, languageProvider, portalProvider.current?.id, portalProvider.current?.assets, language]);

	return users;
}
