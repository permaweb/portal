import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Select } from 'components/atoms/Select';
import { ICONS } from 'helpers/config';
import { PortalPatchMapEnum, SelectOptionType } from 'helpers/types';
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

	const { addNotification } = useNotifications();

	const [profileMap, setProfileMap] = React.useState<Record<string, any>>({});
	const [walletAddress, setWalletAddress] = React.useState<string>('');
	const [activeWalletOption, setActiveWalletOption] = React.useState<SelectOptionType | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);

	// Collect all addresses we want profiles for (admins + transfer from/to)
	const allProfileAddresses = React.useMemo(() => {
		const addresses = new Set<string>();

		// Admin wallets
		for (const u of portalProvider.current?.users || []) {
			if (u?.type === 'wallet' && Array.isArray(u.roles) && u.roles.includes('Admin')) {
				addresses.add(u.address);
			}
		}

		// Transfers (from + to)
		for (const t of portalProvider.current?.transfers || []) {
			const inviter = t.from ?? t.From;
			const invitee = t.to ?? t.To;
			if (inviter) addresses.add(inviter);
			if (invitee) addresses.add(invitee);
		}

		return Array.from(addresses);
	}, [portalProvider.current?.users, portalProvider.current?.transfers]);

	// Fetch profiles for all relevant addresses
	React.useEffect(() => {
		if (!allProfileAddresses.length) return;

		const load = async () => {
			const newProfiles: Record<string, any> = { ...profileMap };

			for (const addr of allProfileAddresses) {
				if (newProfiles[addr]) continue; // already fetched

				try {
					const profile = await permawebProvider.fetchProfile(addr);
					newProfiles[addr] = profile;
					console.log('Fetched profile for', addr, profile);
				} catch (err) {
					console.warn('Failed fetching profile for', addr);
				}
			}

			setProfileMap(newProfiles);
		};

		load();
	}, [allProfileAddresses, permawebProvider, profileMap]);

	// Options for the admin wallet dropdown
	const adminWalletOptions: SelectOptionType[] = React.useMemo(() => {
		return (
			portalProvider.current?.users
				?.filter(
					(u: any) =>
						u?.type === 'wallet' &&
						Array.isArray(u.roles) &&
						u.roles.includes('Admin') &&
						u.address !== arProvider.walletAddress
				)
				.map((u: any) => ({
					id: u.address,
					label: profileMap[u.address]?.username ?? u.address,
				})) ?? []
		);
	}, [portalProvider.current?.users, profileMap, arProvider.walletAddress]);

	// Keep walletAddress in sync with selected option
	React.useEffect(() => {
		if (activeWalletOption) {
			setWalletAddress(activeWalletOption.id);
		}
	}, [activeWalletOption]);

	async function handleSubmit() {
		if (!arProvider.wallet || !portalProvider.current?.id || !walletAddress) return;

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
			setActiveWalletOption(null);
		} catch (e: any) {
			console.error(e);
			addNotification(e?.message ?? 'Error sending transfer invite', 'warning');
		} finally {
			setLoading(false);
		}
	}

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
		<S.Wrapper>
			<p>{language?.transferOwnershipDescription}</p>

			<Select
				label={language?.walletAddress}
				disabled={loading || adminWalletOptions.length === 0}
				activeOption={activeWalletOption ?? adminWalletOptions[0] ?? { id: '', label: 'Select wallet' }}
				setActiveOption={setActiveWalletOption}
				options={adminWalletOptions}
				icon={ICONS.user}
			/>

			<S.ActionsWrapper>
				<Button
					type="alt1"
					label={language?.transferOwnership}
					handlePress={handleSubmit}
					disabled={loading || !walletAddress || !checkValidAddress(walletAddress)}
					loading={loading}
					iconLeftAlign
					height={45}
					fullWidth
				/>
			</S.ActionsWrapper>

			<S.TransferHeader>
				<S.TransferTitle>{language?.transferHistory ?? 'Ownership Transfer History'}</S.TransferTitle>
			</S.TransferHeader>

			<S.TableViewport className="scroll-wrapper-hidden">
				<S.TransferTable>
					<S.TableHead>
						<tr>
							<S.TableHeaderCell>Invitee (To)</S.TableHeaderCell>
							<S.TableHeaderCell>State</S.TableHeaderCell>
							<S.TableHeaderCell>Action</S.TableHeaderCell>
						</tr>
					</S.TableHead>
					<S.TableBody>
						{portalProvider.current.transfers?.length === 0 ? (
							<S.TableRow>
								<S.TableCell colSpan={7}>{language?.noTransfers ?? 'No transfer records yet.'}</S.TableCell>
							</S.TableRow>
						) : (
							portalProvider.current.transfers?.map((transferItem: any, index: number) => {
								const stateValue = transferItem.State ?? transferItem.state;
								const inviteeAddress = transferItem.To ?? transferItem.to;
								const inviteeUsername = profileMap[inviteeAddress]?.username ?? inviteeAddress;

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
	);
}
