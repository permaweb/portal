import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import { ICONS } from 'helpers/config';
import { PortalPatchMapEnum, SelectOptionType } from 'helpers/types';
import { checkValidAddress, formatRoleLabel } from 'helpers/utils';
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

	const [walletAddress, setWalletAddress] = React.useState<string>('');

	const [role, setRole] = React.useState<SelectOptionType | null>(null);
	const [unauthorized, setUnauthorized] = React.useState<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	const roleDescriptions = {
		Admin: language?.roleDescriptionAdmin || [],
		Moderator: language?.roleDescriptionModerator || [],
		Contributor: language?.roleDescriptionContributor || [],
		ExternalContributor: language?.roleDescriptionExternalContributor || [],
	};

	const isOwner = portalProvider?.current?.owner === arProvider.walletAddress;

	const roleOptions = React.useMemo(() => {
		const raw = portalProvider.current?.roleOptions;
		if (!raw) return [];

		const roleOrder = Object.keys(roleDescriptions);

		const sorted = Object.values(raw)
			.map((role) => ({ id: role, label: formatRoleLabel(role) }))
			.sort((a, b) => roleOrder.indexOf(a.id) - roleOrder.indexOf(b.id));

		setRole(sorted[1]);
		// hide Admin for non-owners
		return isOwner && props.user ? sorted : sorted.filter((r) => r.id !== 'Admin');
	}, [portalProvider.current?.roleOptions, isOwner, arProvider.walletAddress, props.user]);

	React.useEffect(() => {
		if (props.user && roleOptions) {
			if (props.user.owner && checkValidAddress(props.user.owner)) setWalletAddress(props.user.owner);
			if (props.user.roles) {
				const activeRole = props.user.roles[0];
				if (roleOptions.find((role) => role.id === activeRole)) {
					setRole(roleOptions.find((role) => role.id === activeRole));
				} else {
					setRole({
						id: 'Admin',
						label: 'Admin',
					});
				}
				setUnauthorized(false);
				if (activeRole === 'Admin' && portalProvider?.current?.owner !== arProvider.walletAddress) {
					// only super admins can change admin's role
					setUnauthorized(true);
				}
			}
		}
	}, [props.user]);

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			setLoading(true);
			try {
				let profile = null;

				if (props.user) profile = { id: props.user.address };
				else profile = await permawebProvider.libs.getProfileByWalletAddress(walletAddress);

				if (!profile?.id) {
					addNotification(language?.noProfileFound, 'warning');
					setLoading(false);
					return;
				}

				const rolesUpdate = await permawebProvider.libs.setZoneRoles(
					[
						{ granteeId: walletAddress, roles: [role.id], type: 'wallet', sendInvite: false },
						{ granteeId: profile.id, roles: [role.id], type: 'process', sendInvite: !props.user },
					],
					portalProvider.current.id,
					arProvider.wallet
				);

				console.log(`Roles update: ${rolesUpdate}`);

				addNotification(`${props.user ? language?.userUpdated : language?.userAdded}!`, 'success');
				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Users);
				props.handleClose();
				setWalletAddress('');
				setRole(null);
			} catch (e: any) {
				console.error(e);
				addNotification(e.message ?? 'Error adding user', 'warning');
			}
			setLoading(false);
		}
	}

	return (
		<>
			<S.Wrapper>
				<FormField
					label={language?.walletAddress}
					value={walletAddress}
					onChange={(e) => {
						setWalletAddress(e.target.value);
					}}
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
						<span>{`${formatRoleLabel(role.label)} ${language.permissions}`}</span>
						{roleDescriptions[role.id].map((description: string) => {
							return <p key={description}>{`· ${description}`}</p>;
						})}
					</S.InfoWrapper>
				)}
				{!props.user && (
					<S.InfoWrapper className={'border-wrapper-alt3'}>
						<p>{language.userInviteInfo}</p>
					</S.InfoWrapper>
				)}
				<S.ActionsWrapper>
					<Button
						type={'alt1'}
						label={props.user ? language?.save : language?.add}
						handlePress={handleSubmit}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress) || unauthorized}
						loading={loading}
						icon={props.user ? null : ICONS.add}
						iconLeftAlign
						height={45}
						fullWidth
					/>
				</S.ActionsWrapper>
			</S.Wrapper>
		</>
	);
}
