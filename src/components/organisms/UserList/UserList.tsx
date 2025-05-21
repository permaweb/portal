import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Panel } from 'components/atoms/Panel';
import { ASSETS, URLS } from 'helpers/config';
import { PortalRolesType, ViewLayoutType } from 'helpers/types';
import { formatAddress, formatRoleLabel } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { UserManager } from '../UserManager';

import * as S from './styles';

function User(props: { user: PortalRolesType }) {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [fetched, setFetched] = React.useState<boolean>(false);
	const [showManageUser, setShowManageUser] = React.useState<boolean>(false);

	React.useEffect(() => {
		(async function () {
			if (!fetched) {
				await portalProvider.fetchPortalUserProfile(props.user);
			}
			setFetched(true);
		})();
	}, [props.user, fetched]);

	const userProfile = portalProvider.usersByPortalId?.[props.user.profileId] ?? { id: props.user.profileId };
	const unauthorized = !portalProvider?.permissions?.users;

	return (
		<>
			<S.UserWrapper key={props.user.profileId} className={'fade-in'}>
				<S.UserHeader>
					<Avatar owner={userProfile} dimensions={{ wrapper: 23.5, icon: 15 }} callback={null} />
					<p>{userProfile.username ?? formatAddress(userProfile.id, false)}</p>
				</S.UserHeader>
				<S.UserDetail>
					<S.UserActions>
						{props.user.roles.map((role) => (
							<S.UserRole key={role} role={role}>
								<span>{formatRoleLabel(role)}</span>
							</S.UserRole>
						))}
						<IconButton
							type={'alt1'}
							active={false}
							src={ASSETS.write}
							handlePress={() => setShowManageUser((prev) => !prev)}
							disabled={unauthorized}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={unauthorized ? language.unauthorized : language.manage}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					</S.UserActions>
				</S.UserDetail>
			</S.UserWrapper>
			<Panel
				open={showManageUser}
				width={500}
				header={language.manageUser}
				handleClose={() => setShowManageUser((prev) => !prev)}
				closeHandlerDisabled
			>
				<UserManager
					user={{
						...props.user,
						owner: userProfile?.owner,
					}}
					handleClose={() => setShowManageUser(false)}
				/>
			</Panel>
		</>
	);
}

export default function UserList(props: { type: ViewLayoutType }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	function getHeader() {
		switch (props.type) {
			case 'header':
				return (
					<S.UsersHeaderDetails className={'border-wrapper-alt3'}>
						<p>{language.users}</p>
						<S.PostsHeaderDetailsActions>
							<Button
								type={'alt3'}
								label={language.usersLink}
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
					<p>{`${language.gettingUsers}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.users.length === 0) {
			return (
				<S.WrapperEmpty type={props.type}>
					<p>{language.noUsersFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.UsersWrapper type={props.type}>
				{portalProvider.current.users.map((user: PortalRolesType) => {
					return <User user={user} key={user.profileId} />;
				})}
			</S.UsersWrapper>
		) : null;
	}, [portalProvider, portalProvider.current?.id, portalProvider.current?.users, language]);

	return (
		<S.Wrapper>
			{getHeader()}
			{users}
		</S.Wrapper>
	);
}
