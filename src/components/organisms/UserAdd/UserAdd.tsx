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

function UserAdd() {
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

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			setLoading(true);
			try {
				const profileLookup = await permawebProvider.libs.getProfileByWalletAddress(walletAddress);

				if (!profileLookup?.id) {
					setResponse({ status: 'warning', message: 'No associated profile found' });
					setLoading(false);
					return;
				}

				console.log(profileLookup);
				const portalUpdateId = await permawebProvider.libs.setZoneRoles(
					{
						granteeId: profileLookup.id,
						roles: [role.id],
					},
					portalProvider.current.id,
					arProvider.wallet
				);

				console.log(`Portal update: ${portalUpdateId}`);

				setResponse({ status: 'success', message: 'User added!' });
				portalProvider.refreshCurrentPortal();
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
					disabled={loading}
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
						label={language.add}
						handlePress={handleSubmit}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress)}
						loading={loading}
						icon={ASSETS.add}
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

export default UserAdd;
