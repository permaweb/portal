import React from 'react';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { UserList } from 'editor/components/organisms/UserList';
import { UserManager } from 'editor/components/organisms/UserManager';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Panel } from 'components/atoms/Panel';
import { ICONS } from 'helpers/config';
import { PortalPatchMapEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Users() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const { addNotification } = useNotifications();
	const language = languageProvider.object[languageProvider.current];

	const [loading, setLoading] = React.useState<boolean>(false);
	const [showAddUser, setShowAddUser] = React.useState<boolean>(false);
	const [showTransferInvitesModal, setShowTransferInvitesModal] = React.useState<boolean>(false);

	const currentWalletAddress = arProvider.walletAddress;

	const pendingOwnershipInvites = React.useMemo(() => {
		return (portalProvider.current?.transfers ?? []).filter((request: any) => {
			const inviteeAddress = request.To ?? request.to;
			const stateValue = (request.State ?? request.state)?.toLowerCase?.();
			return inviteeAddress === currentWalletAddress && stateValue === 'pending';
		});
	}, [portalProvider.current?.transfers, currentWalletAddress]);

	const [inviteProfiles, setInviteProfiles] = React.useState<Record<string, any>>({});

	React.useEffect(() => {
		const loadProfiles = async () => {
			const profiles: Record<string, any> = {};

			for (const request of pendingOwnershipInvites) {
				const inviterAddress = request.From ?? request.from;
				if (!inviterAddress) continue;

				// avoid refetching same address
				if (!profiles[inviterAddress]) {
					try {
						const profile = await permawebProvider.fetchProfile(inviterAddress);
						profiles[inviterAddress] = profile;
					} catch (err) {
						console.error('Failed to fetch profile for', inviterAddress, err);
					}
				}
			}

			setInviteProfiles(profiles);
		};

		if (pendingOwnershipInvites?.length > 0) {
			loadProfiles();
		}
	}, [pendingOwnershipInvites, permawebProvider]);

	async function handleAcceptOwnershipInvite() {
		if (!portalProvider.current?.id) return;
		try {
			setLoading(true);
			setShowTransferInvitesModal(false);
			await permawebProvider.libs.transferZoneOwnership({
				zoneId: portalProvider.current.id,
				op: 'Accept',
			});
			addNotification(language?.inviteAccepted ?? 'Ownership invite accepted', 'success');
			portalProvider.refreshCurrentPortal([PortalPatchMapEnum.Transfers, PortalPatchMapEnum.Users]);
		} catch (error: any) {
			console.error(error);
			addNotification(error?.message ?? 'Error accepting invite', 'warning');
		} finally {
			setLoading(false);
		}
	}

	async function handleRejectOwnershipInvite() {
		if (!portalProvider.current?.id) return;
		try {
			setLoading(true);
			setShowTransferInvitesModal(false);
			await permawebProvider.libs.transferZoneOwnership({
				zoneId: portalProvider.current.id,
				op: 'Reject',
			});
			addNotification(language?.inviteRejected ?? 'Ownership invite rejected', 'success');
			portalProvider.refreshCurrentPortal([PortalPatchMapEnum.Transfers, PortalPatchMapEnum.Users]);
		} catch (error: any) {
			console.error(error);
			addNotification(error?.message ?? 'Error rejecting invite', 'warning');
		} finally {
			setLoading(false);
		}
	}

	function getTransferInvitesModal() {
		const hasInvites = pendingOwnershipInvites.length > 0;

		return (
			<Modal
				header={'Transfer Invites'}
				handleClose={loading ? undefined : () => setShowTransferInvitesModal(false)}
				className={'modal-wrapper'}
			>
				<S.TransferInvitesWrapper>
					{hasInvites && (
						<S.TransferInvitesList className={'scroll-wrapper'}>
							{pendingOwnershipInvites.map((request: any, index: number) => {
								const inviterAddress = request.From ?? request.from;
								const inviterUsername = inviteProfiles[inviterAddress]?.username ?? inviterAddress;

								return (
									<S.TransferInviteRow key={`${inviterAddress}-${index}`}>
										<S.TransferInviteMeta>
											<span>{inviterUsername} is inviting you to take ownership of the current portal.</span>
										</S.TransferInviteMeta>
										<S.TransferInviteActions>
											<Button
												type={'primary'}
												label={language?.reject ?? 'Reject'}
												handlePress={handleRejectOwnershipInvite}
												disabled={loading}
												height={32}
											/>
											<Button
												type={'alt1'}
												label={language?.accept ?? 'Accept'}
												handlePress={handleAcceptOwnershipInvite}
												disabled={loading}
												height={32}
											/>
										</S.TransferInviteActions>
									</S.TransferInviteRow>
								);
							})}
						</S.TransferInvitesList>
					)}
				</S.TransferInvitesWrapper>
			</Modal>
		);
	}

	return (
		<>
			<S.Wrapper className={'fade-in'}>
				<ViewHeader
					header={language?.users}
					actions={[
						<S.HeaderAction key={'transfers'}>
							{pendingOwnershipInvites.length > 0 && (
								<>
									<Button
										type={'primary'}
										label={language?.transfersLabel ?? 'Transfers'}
										handlePress={(e: any) => {
											e.preventDefault();
											e.stopPropagation();
											setShowTransferInvitesModal((prev) => !prev);
										}}
									/>
									<div className={'notification'}>
										<span>{pendingOwnershipInvites.length}</span>
									</div>
								</>
							)}
						</S.HeaderAction>,
						<Button
							key={'add-user'}
							type={'alt1'}
							label={language?.addUser}
							handlePress={() => setShowAddUser(!showAddUser)}
							disabled={!portalProvider?.permissions?.updateUsers}
							icon={ICONS.add}
							iconLeftAlign
						/>,
					]}
				/>

				<S.BodyWrapper>
					<UserList type={'detail'} />
					{!portalProvider?.permissions?.updateUsers && (
						<S.InfoWrapper className={'warning'}>
							<span>{language?.unauthorizedUsersUpdate}</span>
						</S.InfoWrapper>
					)}
				</S.BodyWrapper>
			</S.Wrapper>

			<Panel
				open={showAddUser}
				width={500}
				header={language?.addUser}
				handleClose={() => setShowAddUser((prev) => !prev)}
				closeHandlerDisabled
			>
				<UserManager handleClose={() => setShowAddUser(false)} />
			</Panel>
			{showTransferInvitesModal && getTransferInvitesModal()}
			{loading && <Loader message={`${language.loading}...`} />}
		</>
	);
}
