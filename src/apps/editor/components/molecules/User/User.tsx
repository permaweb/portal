import React from 'react';

import { UserManager } from 'editor/components/organisms/UserManager';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Avatar } from 'components/atoms/Avatar';
import { Panel } from 'components/atoms/Panel';
import { PortalHeaderType, PortalUserType, SelectOptionType } from 'helpers/types';
import { checkValidAddress, formatAddress, formatRoleLabel, getARAmountFromWinc } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { TurboFactory } from '@ardrive/turbo-sdk';
import * as S from './styles';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { ArweaveSigner } from '@ar.io/sdk';

export default function User(props: {
	user: PortalUserType;
	onInviteDetected?: (userAddress: string, hasPendingInvite: boolean) => void;
	hideAction?: boolean;
}) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [fetched, setFetched] = React.useState<boolean>(false);
	const [showManageUser, setShowManageUser] = React.useState<boolean>(false);
	const [showShareCredits, setShowShareCredits] = React.useState<boolean>(false);
	const canShareCredits = portalProvider?.permissions?.updateUsers;
	const turboBalance = arProvider.turboBalance ? getARAmountFromWinc(arProvider.turboBalance) : 0;

	const turbo = TurboFactory.unauthenticated();

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
				onClick={() => (props.hideAction ? {} : setShowManageUser((prev) => !prev))}
				disabled={unauthorized}
				hideAction={props.hideAction}
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
							<S.UserActions
								onClick={(e) => {
									e.stopPropagation();
									setShowShareCredits((prev) => !prev);
								}}
							>
								Share Credits
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
			{showShareCredits && (
				<Panel
					open={showShareCredits}
					width={500}
					header={'Share Credits'}
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
			)}
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

export function ShareCredits(props: { user?: any; handleClose: () => void }) {
	const arProvider = useArweaveProvider();

	const turbo = TurboFactory.authenticated({ signer: arProvider.wallet as ArweaveSigner });
	const turboBalance = arProvider.turboBalance ? getARAmountFromWinc(arProvider.turboBalance) : 0;
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [walletAddress, setWalletAddress] = React.useState<string>(props.user?.owner ?? '');
	const [approvedWincAmount, setApprovedWincAmount] = React.useState<any>(turboBalance);

	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	async function handleSubmit() {
		const { approvalDataItemId, approvedWincAmount } = await turbo.shareCredits({
			approvedAddress: walletAddress,
			approvedWincAmount: approvedWincAmount as BigNumber.,
			expiresBySeconds: 3600,
		});
	}

	return (
		<>
			<S.Wrapper>
				<FormField
					label={language?.walletAddress}
					value={walletAddress}
					onChange={(e) => setWalletAddress(e.target.value)}
					invalid={{ status: walletAddress ? !checkValidAddress(walletAddress) : false, message: null }}
					disabled={true}
					sm
					hideErrorMessage
				/>
				<FormField
					label={'Amount to Share'}
					value={approvedWincAmount}
					onChange={(e) => setApprovedWincAmount(Number(e.target.value))}
					invalid={{
						status: approvedWincAmount
							? approvedWincAmount <= 0 || approvedWincAmount > arProvider.turboBalance
							: false,
						message: null,
					}}
					disabled={loading || turboBalance === 0}
					sm
					hideErrorMessage
				/>

				<S.ActionsWrapper>
					<Button
						type={'alt1'}
						label={language?.shareCredits}
						handlePress={handleSubmit}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress)}
						loading={loading}
						icon={props.user ? null : ASSETS.add}
						iconLeftAlign
						height={45}
						fullWidth
					/>
				</S.ActionsWrapper>
			</S.Wrapper>
		</>
	);
}
