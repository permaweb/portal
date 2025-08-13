import React from 'react';
import { useNavigate } from 'react-router-dom';

import { User } from 'editor/components/molecules/User';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { URLS } from 'helpers/config';
import { PortalUserType, ViewLayoutType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function UserList(props: { type: ViewLayoutType }) {
	const navigate = useNavigate();

	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [usersWithPendingInvites, setUsersWithPendingInvites] = React.useState<Set<string>>(new Set());

	const handleInviteDetected = React.useCallback((userAddress: string, hasPendingInvite: boolean) => {
		setUsersWithPendingInvites((prev) => {
			const newSet = new Set(prev);
			if (hasPendingInvite) {
				newSet.add(userAddress);
			} else {
				newSet.delete(userAddress);
			}
			return newSet;
		});
	}, []);

	const roleOrder = ['Admin', 'Moderator', 'Contributor', 'ExternalContributor'];

	const getRolePriority = (user: PortalUserType) => {
		if (!user.roles || user.roles.length === 0) return roleOrder.length;
		const highestRole = user.roles.find((role) => roleOrder.includes(role));
		return highestRole ? roleOrder.indexOf(highestRole) : roleOrder.length;
	};

	function getHeader() {
		switch (props.type) {
			case 'header':
				return (
					<S.UsersHeaderDetails className={'border-wrapper-alt3'}>
						<p>{language?.users}</p>
						<S.PostsHeaderDetailsActions>
							<Button
								type={'alt3'}
								label={language?.usersLink}
								handlePress={() => navigate(URLS.portalUsers(portalProvider.current.id))}
							/>
						</S.PostsHeaderDetailsActions>
					</S.UsersHeaderDetails>
				);
			case 'detail':
				return null;
			default:
				return null;
		}
	}

	const users = React.useMemo(() => {
		if (!portalProvider.current?.users) {
			return (
				<S.LoadingWrapper type={props.type}>
					<p>{`${language?.gettingUsers}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.users.length === 0) {
			return (
				<S.WrapperEmpty type={props.type}>
					<p>{language?.noUsersFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.UsersWrapper type={props.type}>
				{portalProvider.current.users
					?.filter((user) => user.type === 'process')
					.sort((a, b) => {
						if (a.address === permawebProvider.profile?.id) return -1;
						if (b.address === permawebProvider.profile?.id) return 1;

						const aRolePriority = getRolePriority(a);
						const bRolePriority = getRolePriority(b);

						return aRolePriority - bRolePriority;
					})
					.map((user: PortalUserType) => {
						return (
							<S.UserWrapper key={user.address}>
								<User user={user} onInviteDetected={handleInviteDetected} />
							</S.UserWrapper>
						);
					})}
			</S.UsersWrapper>
		) : null;
	}, [
		permawebProvider.profile?.id,
		portalProvider.current?.id,
		portalProvider.current?.users,
		language,
		usersWithPendingInvites,
	]);

	return (
		<S.Wrapper>
			{getHeader()}
			{users}
		</S.Wrapper>
	);
}
