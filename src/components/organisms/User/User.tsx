import React, { useState } from 'react';

import { Avatar } from 'components/atoms/Avatar';
import { PortalRolesType, PortalUserType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

type IProps = {
	user: PortalRolesType;
};

export default function UserList(props: IProps) {
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { user } = props;
	const [fetched, setFetched] = useState<boolean>(false);

	React.useEffect(() => {
		if (!fetched) {
			portalProvider.fetchPortalUserProfile(user);
		}
		setFetched(true);
	}, [user, fetched, permawebProvider, portalProvider]);

	const userProfile = portalProvider.current.users[user.address];
	console.log(user.address, userProfile);
	return (
		<S.UserWrapper key={user.address} className={'fade-in'}>
			<S.UserHeader>
				<Avatar owner={null} dimensions={{ wrapper: 23.5, icon: 15 }} callback={null} />
				<p>{user.address}</p>
			</S.UserHeader>
			<S.UserDetail>
				<S.UserActions>
					{user.roles.map((role) => (
						<S.UserRole key={role} role={role}>
							<span>{role}</span>
						</S.UserRole>
					))}
				</S.UserActions>
			</S.UserDetail>
		</S.UserWrapper>
	);
}
