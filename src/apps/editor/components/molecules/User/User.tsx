import React from 'react';

import { UserManager } from 'editor/components/organisms/UserManager';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { PortalHeaderType, PortalUserType } from 'helpers/types';
import { formatAddress, formatRoleLabel } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ShareCredits } from '../ShareCredits';

import * as S from './styles';

export default function User(props: {
	user: PortalUserType;
	onInviteDetected?: (userAddress: string, hasPendingInvite: boolean) => void;
	hideAction?: boolean;
}) {
	const arweaveProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [fetched, setFetched] = React.useState<boolean>(false);
	const [showManageUser, setShowManageUser] = React.useState<boolean>(false);
	const [showShareCredits, setShowShareCredits] = React.useState<boolean>(false);
	const currentLoggedInUser =
		arweaveProvider?.walletAddress === portalProvider.usersByPortalId?.[props.user.address]?.owner;

	React.useEffect(() => {
		(async function () {
			if (!fetched) portalProvider.fetchPortalUserProfile(props.user);
			setFetched(true);
		})();
	}, [props.user, fetched]);

	const userProfile = portalProvider.usersByPortalId?.[props.user.address] ?? { id: props.user.address };
	const unauthorized = !portalProvider?.permissions?.updateUsers;
	const invitePending =
		userProfile?.invites?.find((invite: PortalHeaderType) => invite.id === portalProvider.current?.id) !== undefined;
	const canShareCredits = portalProvider?.permissions?.updateUsers && !currentLoggedInUser && !invitePending;
	React.useEffect(() => {
		if (props.onInviteDetected && !props.hideAction) {
			props.onInviteDetected(props.user.address, invitePending);
		}
	}, [props.onInviteDetected, props.user.address, props.hideAction, invitePending]);

	return (
		<>
			<S.UserWrapper
				key={props.user.address}
				className={'fade-in'}
				onClick={() => (props.hideAction || unauthorized ? {} : setShowManageUser((prev) => !prev))}
				disabled={unauthorized}
				hideAction={props.hideAction}
				isCurrent={currentLoggedInUser && !props.hideAction}
			>
				<S.UserHeader>
					<Avatar owner={userProfile} dimensions={{ wrapper: 23.5, icon: 15 }} callback={null} />
					<p>{userProfile.username ?? formatAddress(userProfile.id, false)}</p>
				</S.UserHeader>
				{!props.hideAction && (
					<S.UserDetail>
						{invitePending && (
							<S.PendingInvite className={'border-wrapper-alt3'}>
								<span>{language.invitePending}</span>
								<S.Indicator />
							</S.PendingInvite>
						)}
						{canShareCredits && (
							<S.UserActions>
								<Button
									type={'alt3'}
									label={language?.shareCredits}
									handlePress={(e) => {
										e.stopPropagation();
										setShowShareCredits((prev) => !prev);
									}}
									disabled={unauthorized}
									loading={false}
								/>
							</S.UserActions>
						)}
						{props.user.roles && (
							<S.UserActions>
								{props.user.roles.map((role) => (
									<S.UserRole key={role} role={role}>
										<span>{formatRoleLabel(role)}</span>
									</S.UserRole>
								))}
							</S.UserActions>
						)}
					</S.UserDetail>
				)}
			</S.UserWrapper>

			<Panel
				open={showShareCredits}
				width={575}
				header={language.shareCredits}
				handleClose={() => setShowShareCredits((prev) => !prev)}
				closeHandlerDisabled
			>
				<ShareCredits
					user={{
						...props.user,
						owner: userProfile?.owner,
					}}
					handleClose={() => setShowManageUser(false)}
				/>
			</Panel>

			{props.user.roles && (
				<Panel
					open={showManageUser}
					width={575}
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
