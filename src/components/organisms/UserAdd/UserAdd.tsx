import React from 'react';

import { DEFAULT_THEME, getPortalRoleOptions, PORTAL_DATA, URLS } from 'helpers/config';
import { PortalHeaderType, SelectOptionType } from 'helpers/types';
import { getBootTag } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { Button } from '../../atoms/Button';
import { FormField } from '../../atoms/FormField';
import { Select } from '../../atoms/Select';

import * as S from './styles';

function UserAdd(props) {
	const [address, setAddress] = React.useState('');
	const roleOptions = getPortalRoleOptions();
	const [role, setRole] = React.useState<SelectOptionType>(roleOptions[0]);
	const [adding, setAdding] = React.useState(false);
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();

	async function handleSubmit() {
		console.log('pressed');
		if (arProvider.wallet && permawebProvider.profile && permawebProvider.profile.id) {
			setAdding(true);

			const portalId = portalProvider.current.id;

			try {
				let profileUpdateId: string | null;
				let response: string | null;

				let args: any = {
					granteeId: address,
					roles: [role.id],
				};

				if (portalId) {
					// const portalUpdateId = await permawebProvider.libs.updateZone(data, portalId, arProvider.wallet);
					const userRoleUpdateId = await permawebProvider.libs.setZoneRoles(args, portalId, arProvider.wallet);
					console.log(userRoleUpdateId);

					portalProvider.refreshCurrentPortal();
				}
			} catch (e: any) {
				console.error(e);
			}

			setAdding(false);
		}
	}

	return (
		<S.FormWrapper>
			<FormField
				sm={true}
				label={'Address'}
				value={address}
				onChange={(e) => {
					setAddress(e.target.value);
				}}
				invalid={{ status: false, message: null }}
				disabled={false}
			/>
			<Select
				label={'Role'}
				activeOption={role}
				setActiveOption={(option) => setRole(option)}
				options={roleOptions}
				disabled={false}
			/>
			<Button type={'primary'} label={'Add'} handlePress={handleSubmit} />
			{adding && <span>adding</span>}
		</S.FormWrapper>
	);
}

export default UserAdd;
