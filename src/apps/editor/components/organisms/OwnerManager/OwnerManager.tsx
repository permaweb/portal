import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { PortalPatchMapEnum } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function OwnerManager(props: { handleClose: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [walletAddress, setWalletAddress] = React.useState<string>('');

	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	async function handleSubmit() {
		if (arProvider.wallet && portalProvider.current?.id) {
			setLoading(true);
			try {
				await permawebProvider.libs.transferZoneOwnership({
					zoneId: portalProvider.current.id,
					op: 'Invite',
					to: walletAddress,
				});
				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Transfers);

				addNotification(`Invite sent!`, 'success');
				props.handleClose();
				setWalletAddress('');
			} catch (e: any) {
				console.error(e);
				addNotification(e.message ?? 'Error adding user', 'warning');
			}
			setLoading(false);
		}
	}

	const [inviteProfiles, setInviteProfiles] = React.useState<Record<string, any>>({});

	React.useEffect(() => {
		const loadProfiles = async () => {
			const profiles: Record<string, any> = {};

			for (const request of portalProvider.transfers) {
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
		if (portalProvider.transfers?.length > 0) {
			loadProfiles();
		}
	}, [portalProvider.transfers]);

	// Cancel a pending invite
	async function handleCancelTransferInvite(inviteeAddress: string) {
		if (!portalProvider.current?.id) return;
		try {
			setLoading(true);
			await permawebProvider.libs.transferZoneOwnership({
				zoneId: portalProvider.current.id,
				op: 'Cancel',
				to: inviteeAddress,
			});
			addNotification('Transfer invite cancelled', 'success');
			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Transfers);
		} catch (error: any) {
			console.error(error);
			addNotification(error?.message ?? 'Error cancelling transfer invite', 'warning');
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<S.Wrapper>
				{language?.transferOwnershipDescription}
				<FormField
					label={language?.walletAddress}
					value={walletAddress}
					onChange={(e) => {
						setWalletAddress(e.target.value);
					}}
					invalid={{ status: walletAddress ? !checkValidAddress(walletAddress) : false, message: null }}
					disabled={loading}
					sm
					hideErrorMessage
				/>
				<S.ActionsWrapper>
					<Button
						type={'alt1'}
						label={language?.transferOwnership}
						handlePress={handleSubmit}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress)}
						loading={loading}
						iconLeftAlign
						height={45}
						fullWidth
					/>
				</S.ActionsWrapper>
				{/* Transfer history header + refresh */}
				<S.TransferHeader>
					<S.TransferTitle>{language?.transferHistory ?? 'Ownership Transfer History'}</S.TransferTitle>
				</S.TransferHeader>

				{/* Transfer history table */}
				<S.TableViewport>
					<S.TransferTable>
						<S.TableHead>
							<tr>
								<S.TableHeaderCell>Invitee (To)</S.TableHeaderCell>
								<S.TableHeaderCell>State</S.TableHeaderCell>
								<S.TableHeaderCell>Action</S.TableHeaderCell>
							</tr>
						</S.TableHead>
						<S.TableBody>
							{portalProvider.transfers?.length === 0 ? (
								<S.TableRow>
									<S.TableCell colSpan={7} style={{ opacity: 0.7 }}>
										{language?.noTransfers ?? 'No transfer records yet.'}
									</S.TableCell>
								</S.TableRow>
							) : (
								portalProvider?.transfers?.map((transferItem: any, index: number) => {
									const stateValue = transferItem.State ?? transferItem.state;
									const inviteeAddress = transferItem.To ?? transferItem.to;
									const inviteeUsername = inviteProfiles[inviteeAddress]?.username ?? inviteeAddress;

									return (
										<S.TableRow key={`${inviteeAddress}-${index}`}>
											<S.TableCell>{inviteeUsername}</S.TableCell>
											<S.TableCell>
												<S.StateBadge $state={stateValue}>{stateValue}</S.StateBadge>
											</S.TableCell>
											<S.ActionsCell>
												<Button
													type="primary"
													label={language?.cancel ?? 'Cancel'}
													handlePress={() => handleCancelTransferInvite(inviteeAddress)}
													disabled={loading || stateValue !== 'pending'}
													height={34}
												/>
											</S.ActionsCell>
										</S.TableRow>
									);
								})
							)}
						</S.TableBody>
					</S.TransferTable>
				</S.TableViewport>
			</S.Wrapper>
		</>
	);
}
