import React from 'react';

import { UserManager } from 'editor/components/organisms/UserManager';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Avatar } from 'components/atoms/Avatar';
import { IconButton } from 'components/atoms/IconButton';
import { Panel } from 'components/atoms/Panel';
import { ASSETS } from 'helpers/config';
import { PortalUserType } from 'helpers/types';
import { formatAddress, formatRoleLabel } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function User(props: { user: PortalUserType }) {
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

	const userProfile = portalProvider.usersByPortalId?.[props.user.address] ?? { id: props.user.address };
	const unauthorized = !portalProvider?.permissions?.updateUsers;

	return (
		<>
			<S.UserWrapper key={props.user.address} className={'fade-in'}>
				<S.UserHeader>
					<Avatar owner={userProfile} dimensions={{ wrapper: 23.5, icon: 15 }} callback={null} />
					<p>{userProfile.username ?? formatAddress(userProfile.id, false)}</p>
				</S.UserHeader>
				{props.user.roles && (
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
								tooltip={unauthorized ? language?.unauthorized : language?.manage}
								tooltipPosition={'bottom-right'}
								noFocus
							/>
						</S.UserActions>
					</S.UserDetail>
				)}
			</S.UserWrapper>
			{props.user.roles && (
				<Panel
					open={showManageUser}
					width={500}
					header={language?.manageUser}
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
			)}
		</>
	);
}
