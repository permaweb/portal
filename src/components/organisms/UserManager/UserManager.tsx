import React from 'react';

import { Notification } from 'components/atoms/Notification';
import { ASSETS, getPortalRoleOptions } from 'helpers/config';
import { NotificationType, SelectOptionType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { Button } from '../../atoms/Button';
import { FormField } from '../../atoms/FormField';
import { Select } from '../../atoms/Select';

import * as S from './styles';

// TODO: User prop
export default function UserManager(props: { user?: any; handleClose: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const roleOptions = getPortalRoleOptions();

	const [walletAddress, setWalletAddress] = React.useState<string>('');
	const [role, setRole] = React.useState<SelectOptionType>(roleOptions[0]);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [response, setResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (props.user) {
			if (props.user.owner && checkValidAddress(props.user.owner)) setWalletAddress(props.user.owner);
			if (props.user.roles) {
				const activeRole = props.user.roles[0];
				setRole(roleOptions.find((role) => role.id === activeRole));
			}
		}
	}, [props.user]);

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			setLoading(true);
			try {
				let profile = null;

				if (props.user) profile = { id: props.user.profileId };
				else profile = await permawebProvider.libs.getProfileByWalletAddress(walletAddress);

				if (!profile?.id) {
					setResponse({ status: 'warning', message: language.noProfileFound });
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

				setResponse({ status: 'success', message: `${props.user ? language.userUpdated : language.userAdded}!` });
				portalProvider.refreshCurrentPortal();
				props.handleClose();
			} catch (e: any) {
				console.error(e);
			}
			setLoading(false);
		}
	}

	return (
		<>
			<S.Wrapper>
				<FormField
					label={language.walletAddress}
					value={walletAddress}
					onChange={(e) => {
						setWalletAddress(e.target.value);
					}}
					invalid={{ status: walletAddress ? !checkValidAddress(walletAddress) : false, message: null }}
					disabled={loading || props.user?.owner !== null}
					sm
					hideErrorMessage
				/>
				<Select
					label={language.role}
					activeOption={role}
					setActiveOption={(option) => setRole(option)}
					options={roleOptions}
					disabled={loading}
				/>
				<S.ActionsWrapper>
					<Button
						type={'primary'}
						label={props.user ? language.save : language.add}
						handlePress={handleSubmit}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress)}
						loading={loading}
						icon={props.user ? null : ASSETS.add}
						iconLeftAlign
					/>
				</S.ActionsWrapper>
			</S.Wrapper>
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
		</>
	);
}
