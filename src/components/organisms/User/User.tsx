import React, { useState } from 'react';

import { Avatar } from 'components/atoms/Avatar';
import { PortalRolesType, PortalUserType } from 'helpers/types';
import { formatAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function UserList(props: { user: PortalRolesType }) {
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [fetched, setFetched] = useState<boolean>(false);

	React.useEffect(() => {
		(async function () {
			if (!fetched) {
				await portalProvider.fetchPortalUserProfile(props.user);
			}
			setFetched(true);
		})();
	}, [props.user, fetched]);

	const userProfile = portalProvider.usersByPortalId?.[props.user.address] ?? { id: props.user.address };

	return (
		<S.UserWrapper key={props.user.address} className={'fade-in'}>
			<S.UserHeader>
				<Avatar owner={userProfile} dimensions={{ wrapper: 23.5, icon: 15 }} callback={null} />
				<p>{userProfile.username ?? formatAddress(userProfile.id, false)}</p>
			</S.UserHeader>
			<S.UserDetail>
				<S.UserActions>
					{props.user.roles.map((role) => (
						<S.UserRole key={role} role={role}>
							<span>{role}</span>
						</S.UserRole>
					))}
				</S.UserActions>
			</S.UserDetail>
		</S.UserWrapper>
	);
}
