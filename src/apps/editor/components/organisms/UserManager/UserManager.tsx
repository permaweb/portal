import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Modal } from 'components/atoms/Modal';
import { Select } from 'components/atoms/Select';
import { ICONS } from 'helpers/config';
import { PortalPatchMapEnum, SelectOptionType } from 'helpers/types';
import { checkValidAddress, debugLog, formatRoleLabel } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function UserManager(props: { user?: any; handleClose: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { addNotification } = useNotifications();

	const [walletAddress, setWalletAddress] = React.useState<string>('');
	const [role, setRole] = React.useState<SelectOptionType | null>(null);
	const [unauthorized, setUnauthorized] = React.useState<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [showRemoveConfirm, setShowRemoveConfirm] = React.useState(false);

	// must match backend
	const ROLE_PRIORITY: Record<string, number> = React.useMemo(
		() => ({
			ExternalContributor: 1,
			Contributor: 2,
			Moderator: 3,
			Admin: 4,
		}),
		[]
	);

	const roleDescriptions = React.useMemo(
		() => ({
			Admin: language?.roleDescriptionAdmin || [],
			Moderator: language?.roleDescriptionModerator || [],
			Contributor: language?.roleDescriptionContributor || [],
			ExternalContributor: language?.roleDescriptionExternalContributor || [],
		}),
		[language]
	);

	const isOwner = portalProvider?.current?.owner === arProvider.walletAddress;

	function highestPriority(roles?: string[]) {
		if (!roles || roles.length === 0) return 0;
		return roles.reduce((max, r) => Math.max(max, ROLE_PRIORITY[r] ?? 0), 0);
	}

	function findRolesForActor(wallet?: string, profileId?: string) {
		const list = portalProvider.current?.users ?? [];
		const me =
			list.find((u: any) => u?.owner && wallet && u.owner === wallet) ||
			list.find((u: any) => u?.address && profileId && u.address === profileId) ||
			list.find((u: any) => u?.address && wallet && u.address === wallet);

		return (me?.roles as string[]) ?? [];
	}

	// resolve the target's "profile process id" + wallet owner address from the same place the UI uses
	const targetProfile = React.useMemo(() => {
		if (!props.user) return null;
		// In your User component, usersByPortalId is keyed by props.user.address
		return portalProvider.usersByPortalId?.[props.user.address] ?? { id: props.user.address, owner: props.user.owner };
	}, [props.user, portalProvider.usersByPortalId]);

	const targetWallet = React.useMemo(() => {
		if (!props.user) return '';
		return (targetProfile?.owner as string) || props.user.owner || walletAddress || '';
	}, [props.user, targetProfile, walletAddress]);

	const targetProcessId = React.useMemo(() => {
		if (!props.user) return '';
		return (targetProfile?.id as string) || props.user.address || '';
	}, [props.user, targetProfile]);

	const actorRoles = React.useMemo(() => {
		return findRolesForActor(arProvider.walletAddress, permawebProvider.profile?.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [portalProvider.current?.users, arProvider.walletAddress, permawebProvider.profile?.id]);

	const actorPriority = React.useMemo(() => highestPriority(actorRoles), [actorRoles]);
	const targetPriority = React.useMemo(() => highestPriority(props.user?.roles), [props.user?.roles]);

	const isTargetOwner = React.useMemo(() => {
		if (!props.user) return false;
		const portalOwner = portalProvider.current?.owner;
		const targetOwnerWallet = targetWallet;
		return !!portalOwner && !!targetOwnerWallet && portalOwner === targetOwnerWallet;
	}, [props.user, portalProvider.current?.owner, targetWallet]);

	const isMe = React.useMemo(() => {
		if (!props.user) return false;
		const myWallet = arProvider.walletAddress;
		const myProfileId = permawebProvider.profile?.id;

		return (
			(!!myWallet && !!targetWallet && myWallet === targetWallet) ||
			(!!myProfileId && !!targetProcessId && myProfileId === targetProcessId) ||
			(!!myWallet && !!targetProcessId && myWallet === targetProcessId) // defensive
		);
	}, [props.user, arProvider.walletAddress, permawebProvider.profile?.id, targetWallet, targetProcessId]);

	const canRemoveUser = React.useMemo(() => {
		if (!props.user) return false;
		if (loading || unauthorized) return false;
		if (isTargetOwner) return false;
		if (isMe) return false;
		// backend rule: must strictly outrank target unless you are Owner
		return isOwner || actorPriority > targetPriority;
	}, [props.user, loading, unauthorized, isTargetOwner, isMe, isOwner, actorPriority, targetPriority]);

	const roleOptions = React.useMemo(() => {
		const raw = portalProvider.current?.roleOptions;
		if (!raw) return [];

		const roleOrder = Object.keys(roleDescriptions);

		const sorted = Object.values(raw)
			.map((r) => ({ id: r as string, label: formatRoleLabel(r as string) }))
			.sort((a, b) => roleOrder.indexOf(a.id) - roleOrder.indexOf(b.id));

		// hide Admin for non-owners
		return isOwner ? sorted : sorted.filter((r) => r.id !== 'Admin');
	}, [portalProvider.current?.roleOptions, roleDescriptions, isOwner]);

	// Initialize form state for edit vs add
	React.useEffect(() => {
		// edit existing user
		if (props.user) {
			const existingWallet = props.user.owner || targetProfile?.owner;
			if (existingWallet && checkValidAddress(existingWallet)) setWalletAddress(existingWallet);

			const activeRole = props.user.roles?.[0];
			if (activeRole) {
				const opt = roleOptions.find((r) => r.id === activeRole) || {
					id: activeRole,
					label: formatRoleLabel(activeRole),
				};
				setRole(opt);
			}

			// only owner can modify Admin users
			setUnauthorized(false);
			if (activeRole === 'Admin' && portalProvider?.current?.owner !== arProvider.walletAddress) {
				setUnauthorized(true);
			}
			return;
		}

		// add new user defaults
		setUnauthorized(false);
		setWalletAddress('');
		const defaultRole = roleOptions.find((r) => r.id === 'Contributor') || roleOptions[0] || null;
		setRole(defaultRole);
	}, [props.user, roleOptions, portalProvider?.current?.owner, arProvider.walletAddress, targetProfile?.owner]);

	async function handleSubmit() {
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		if (!walletAddress || !checkValidAddress(walletAddress)) return;
		if (!role) return;

		setLoading(true);
		try {
			let profile: any = null;

			if (props.user) {
				// Editing: Process ID should already exist
				profile = { id: targetProcessId || props.user.address };
			} else {
				// Adding: Resolve profile process id from wallet
				profile = await permawebProvider.libs.getProfileByWalletAddress(walletAddress);
			}

			if (!profile?.id) {
				addNotification(language?.noProfileFound ?? 'No profile found', 'warning');
				return;
			}

			const rolesUpdate = await permawebProvider.libs.setZoneRoles(
				[
					{ granteeId: walletAddress, roles: [role.id], type: 'wallet', sendInvite: false, remoteZonePath: 'Portals' },
					{
						granteeId: profile.id,
						roles: [role.id],
						type: 'process',
						sendInvite: !props.user,
						remoteZonePath: 'Portals',
					},
				],
				portalProvider.current.id,
				arProvider.wallet
			);

			debugLog('info', 'UserManager', 'Roles update:', rolesUpdate);

			addNotification(`${props.user ? language?.userUpdated : language?.userAdded}!`, 'success');
			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Users);
			props.handleClose();
			setWalletAddress('');
			setRole(null);
		} catch (e: any) {
			debugLog('error', 'UserManager', 'Error saving user:', e.message ?? 'Unknown error');
			addNotification(e.message ?? 'Error saving user', 'warning');
		} finally {
			setLoading(false);
		}
	}

	async function handleRemoveUser() {
		if (!props.user) return;
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		if (!canRemoveUser) return;

		if (!targetWallet || !checkValidAddress(targetWallet)) {
			addNotification(language?.invalidWallet ?? 'Invalid wallet address', 'warning');
			return;
		}

		if (!targetProcessId) {
			addNotification(language?.invalidProfile ?? 'Invalid profile id', 'warning');
			return;
		}

		setLoading(true);
		try {
			await permawebProvider.libs.setZoneRoles(
				[
					{ granteeId: targetWallet, roles: [], type: 'wallet', sendInvite: false, remoteZonePath: 'Portals' },
					{ granteeId: targetProcessId, roles: [], type: 'process', sendInvite: false, remoteZonePath: 'Portals' },
				],
				portalProvider.current.id,
				arProvider.wallet
			);
			console.log('User removed successfully', targetWallet, targetProcessId);
			addNotification(language?.userRemoved ?? 'User removed', 'success');
			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Users);
			props.handleClose();
		} catch (e: any) {
			debugLog('error', 'UserManager', 'Error removing user:', e.message ?? 'Unknown error');
			addNotification(e.message ?? 'Error removing user', 'warning');
		} finally {
			setLoading(false);
			setShowRemoveConfirm(false);
		}
	}

	return (
		<>
			<S.Wrapper>
				<FormField
					label={language?.walletAddress}
					value={walletAddress}
					onChange={(e) => setWalletAddress(e.target.value)}
					invalid={{ status: walletAddress ? !checkValidAddress(walletAddress) : false, message: null }}
					disabled={loading || (props.user && props.user?.owner !== null) || unauthorized}
					sm
					hideErrorMessage
				/>

				<Select
					label={language?.role}
					activeOption={role}
					setActiveOption={(option) => setRole(option)}
					options={roleOptions}
					disabled={loading || unauthorized}
				/>

				{role && (
					<S.InfoWrapper className={'border-wrapper-alt3'}>
						<span>{`${formatRoleLabel(role.label)} ${language?.permissions ?? 'permissions'}`}</span>
						{(roleDescriptions as any)[role.id]?.map((description: string) => (
							<p key={description}>{`· ${description}`}</p>
						))}
					</S.InfoWrapper>
				)}

				{!props.user && (
					<S.InfoWrapper className={'border-wrapper-alt3'}>
						<p>{language?.userInviteInfo}</p>
					</S.InfoWrapper>
				)}

				<S.ActionsWrapper>
					<Button
						type={'alt1'}
						label={props.user ? language?.save : language?.add}
						handlePress={handleSubmit}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress) || unauthorized || !role}
						loading={loading}
						icon={props.user ? null : ICONS.add}
						iconLeftAlign
						height={45}
						fullWidth
					/>
				</S.ActionsWrapper>

				{props.user && canRemoveUser && (
					<S.ActionsWrapper>
						<Button
							type={'warning'}
							label={language?.removeUser ?? 'Remove User'}
							handlePress={() => setShowRemoveConfirm(true)}
							disabled={loading || showRemoveConfirm}
							height={45}
							fullWidth
						/>
					</S.ActionsWrapper>
				)}
			</S.Wrapper>

			{showRemoveConfirm && (
				<Modal
					header={language?.confirmRemoval ?? 'Confirm Removal'}
					handleClose={loading ? undefined : () => setShowRemoveConfirm(false)}
					className={'modal-wrapper'}
				>
					<p className={'default-text'}>
						{language?.removeUserWarning ?? 'This will remove the user from the portal.'}
					</p>

					<S.ActionsWrapper>
						<Button
							type={'primary'}
							label={language?.cancel ?? 'Cancel'}
							handlePress={() => setShowRemoveConfirm(false)}
							disabled={loading}
						/>
						<Button
							type={'warning'}
							label={language?.remove ?? 'Remove'}
							handlePress={handleRemoveUser}
							disabled={!canRemoveUser}
							loading={loading}
						/>
					</S.ActionsWrapper>
				</Modal>
			)}
		</>
	);
}
