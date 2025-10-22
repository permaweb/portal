import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
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

	// State for transfer requests list and UI flags
	const [transferRequests, setTransferRequests] = React.useState<any[]>([]);
	const [isTransfersRefreshing, setIsTransfersRefreshing] = React.useState<boolean>(false);

	const formatTimestamp = React.useCallback((ts?: number | string) => {
		if (!ts && ts !== 0) return '-';
		const asNumber = typeof ts === 'string' ? parseInt(ts, 10) : ts;
		if (!asNumber || Number.isNaN(asNumber)) return '-';
		return new Date(asNumber).toLocaleString();
	}, []);

	// Fetch transfer requests from the Zone (GetFullState -> Transfers)
	async function loadTransferRequests() {
		if (!portalProvider.current?.id) return;
		try {
			setIsTransfersRefreshing(true);
			const zoneState = await permawebProvider.libs.getZone(portalProvider.current.id);
			const transfersFromState = zoneState?.transfers ?? zoneState?.Transfers ?? [];
			setTransferRequests(Array.isArray(transfersFromState) ? transfersFromState : []);
		} catch (error: any) {
			console.error(error);
			addNotification(error?.message ?? 'Failed to load ownership transfer requests', 'warning');
		} finally {
			setIsTransfersRefreshing(false);
		}
	}

	async function handleSubmit() {
		if (arProvider.wallet && portalProvider.current?.id) {
			setLoading(true);
			try {
				console.log(permawebProvider.libs);
				await permawebProvider.libs.transferZoneOwnership({
					zoneId: portalProvider.current.id,
					op: 'Invite',
					to: walletAddress,
				});

				await loadTransferRequests();
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

	// Load once on open / portal change
	React.useEffect(() => {
		loadTransferRequests();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [portalProvider.current?.id]);

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
			await loadTransferRequests();
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
					<Button
						type="alt2"
						label={language?.refresh ?? 'Refresh'}
						handlePress={loadTransferRequests}
						disabled={isTransfersRefreshing}
						loading={isTransfersRefreshing}
						height={36}
					/>
				</S.TransferHeader>

				{/* Transfer history table */}
				<S.TableViewport>
					<S.TransferTable>
						<S.TableHead>
							<tr>
								<S.TableHeaderCell>Invitee (To)</S.TableHeaderCell>
								<S.TableHeaderCell>State</S.TableHeaderCell>
								<S.TableHeaderCell>Final Event</S.TableHeaderCell>
								<S.TableHeaderCell>Action</S.TableHeaderCell>
							</tr>
						</S.TableHead>
						<S.TableBody>
							{transferRequests.length === 0 ? (
								<S.TableRow>
									<S.TableCell colSpan={7} style={{ opacity: 0.7 }}>
										{language?.noTransfers ?? 'No transfer records yet.'}
									</S.TableCell>
								</S.TableRow>
							) : (
								transferRequests.map((transferItem: any, index: number) => {
									const stateValue = transferItem.State ?? transferItem.state;
									const inviteeAddress = transferItem.To ?? transferItem.to;
									const acceptedAt = transferItem.AcceptedAt ?? transferItem.acceptedAt;
									const rejectedAt = transferItem.RejectedAt ?? transferItem.rejectedAt;
									const cancelledAt = transferItem.CancelledAt ?? transferItem.cancelledAt;

									const finalEventLabel = acceptedAt
										? 'Accepted'
										: rejectedAt
										? 'Rejected'
										: cancelledAt
										? 'Cancelled'
										: '-';

									const finalEventTimestamp = acceptedAt || rejectedAt || cancelledAt;

									return (
										<S.TableRow key={`${inviteeAddress}-${index}`}>
											<S.TableCell>{inviteeAddress}</S.TableCell>
											<S.TableCell>
												<S.StateBadge $state={stateValue}>{stateValue}</S.StateBadge>
											</S.TableCell>
											<S.TableCell>
												{finalEventLabel}
												{finalEventTimestamp ? ` • ${formatTimestamp(finalEventTimestamp)}` : ''}
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
