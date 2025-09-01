import React from 'react';
import { checkValidAddress, getARAmountFromWinc } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { TurboFactory, ArconnectSigner } from '@ardrive/turbo-sdk/web';
import * as S from './styles';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { FormField } from 'components/atoms/FormField';
import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';

export default function ShareCredits(props: { user?: any; handleClose: () => void }) {
	const arProvider = useArweaveProvider();
	const signer = new ArconnectSigner(arProvider.wallet);
	const turbo = TurboFactory.authenticated({ signer });
	const turboBalance = arProvider.turboBalance ? getARAmountFromWinc(arProvider.turboBalance) : 0;
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [walletAddress, setWalletAddress] = React.useState<string>(props.user?.owner ?? '');
	const [approvedWincAmount, setApprovedWincAmount] = React.useState<any>(turboBalance);

	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	async function handleSubmit() {
		setLoading(true);
		try {
			const { approvalDataItemId, approvedWincAmount } = await turbo.shareCredits({
				approvedAddress: walletAddress,
				approvedWincAmount: 165612630192,
			});

			if (!approvalDataItemId) {
				addNotification(language?.errorOccurred ?? 'Could not share credits.', 'warning');
				return;
			}

			console.log('Credits shared:', { approvalDataItemId, approvedWincAmount });
			arProvider?.refreshTurboBalance();
			props?.handleClose?.();
		} catch (err: unknown) {
			console.error('turbo.shareCredits failed:', err);
			const msg = err instanceof Error ? err.message : 'Unexpected error';
			addNotification(`${language?.errorOccurred ?? 'Error occurred'}: ${msg}`, 'warning');
		} finally {
			setLoading(false);
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
					disabled={true}
					sm
					hideErrorMessage
				/>
				<FormField
					label={'Amount to Share'}
					value={approvedWincAmount}
					onChange={(e) => setApprovedWincAmount(Number(e.target.value))}
					invalid={{
						status: approvedWincAmount
							? approvedWincAmount <= 0 || approvedWincAmount > arProvider.turboBalance
							: false,
						message: null,
					}}
					disabled={loading || turboBalance === 0}
					sm
					hideErrorMessage
				/>

				<S.ActionsWrapper>
					<Button
						type={'alt1'}
						label={language?.shareCredits}
						handlePress={handleSubmit}
						disabled={loading || !walletAddress || !checkValidAddress(walletAddress)}
						loading={loading}
						icon={props.user ? null : ASSETS.add}
						iconLeftAlign
						height={45}
						fullWidth
					/>
				</S.ActionsWrapper>
			</S.Wrapper>
		</>
	);
}
