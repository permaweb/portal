import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Label } from 'components/atoms/Drawer/styles';
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
						handlePress={() => {}}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress)}
						loading={loading}
						iconLeftAlign
						height={45}
						fullWidth
					/>
				</S.ActionsWrapper>
			</S.Wrapper>
		</>
	);
}
