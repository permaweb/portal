import React from 'react';

import { Avatar } from 'components/atoms/Avatar';
import { PortalRolesType, PortalUserType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { User } from '../User';

import * as S from './styles';

export default function UserList() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const users = React.useMemo(() => {
		if (!portalProvider.current?.users) {
			return (
				<S.LoadingWrapper>
					<p>{`${language.gettingUsers}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.users.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noUsersFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.Wrapper>
				{portalProvider.current.users.map((user: PortalRolesType) => {
					return <User user={user} key={user.address} />;
				})}
			</S.Wrapper>
		) : null;
	}, [portalProvider, portalProvider.current?.id, portalProvider.current?.users, language]);

	return users;
}
