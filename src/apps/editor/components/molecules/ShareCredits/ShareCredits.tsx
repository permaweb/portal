import React from 'react';
// @ts-ignore
import { ArconnectSigner, type TurboCreateCreditShareApprovalParams, TurboFactory } from '@ardrive/turbo-sdk/web';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Panel } from 'components/atoms/Panel';
import { TurboBalanceFund } from 'components/molecules/TurboBalanceFund';
import { ICONS } from 'helpers/config';
import { checkValidAddress, getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';

import { TurboCredits } from '../TurboCredits';

import * as S from './styles';

export default function ShareCredits(props: { user?: any; handleClose: () => void }) {
	const arProvider = useArweaveProvider();
	const signer = new ArconnectSigner(arProvider.wallet);
	const turbo = TurboFactory.authenticated({ signer });
	const turboBalance = arProvider.turboBalance ? getARAmountFromWinc(arProvider.turboBalance) : 0;
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [walletAddress, setWalletAddress] = React.useState<string>(props.user?.owner ?? '');
	const [approvedWincAmountInput, setApprovedWincAmount] = React.useState(0);
	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);

	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	async function handleSubmit() {
		setLoading(true);
		try {
			const { approvalDataItemId } = await turbo.shareCredits({
				approvedAddress: walletAddress,
				approvedWincAmount: approvedWincAmountInput * 1e12,
			} as TurboCreateCreditShareApprovalParams);

			if (!approvalDataItemId) {
				addNotification(language?.errorSharingCredits, 'warning');
				return;
			}
			addNotification(language?.creditsSharedSuccessfully, 'success');
			arProvider?.refreshTurboBalance();
			props?.handleClose();
		} catch (err: unknown) {
			console.error('turbo.shareCredits failed:', err);
			const msg = err instanceof Error ? err.message : 'Unexpected error';
			addNotification(`${language?.errorSharingCredits}: ${msg}`, 'warning');
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<S.Wrapper>
				<TurboCredits
					showBorderBottom={false}
					allowExpandApprovals={true}
					setShowFundUpload={() => setShowFundUpload(true)}
				/>
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
					type={'number'}
					label={language.amountToShare}
					value={approvedWincAmountInput}
					onChange={(e) => setApprovedWincAmount(Number(e.target.value))}
					invalid={{
						status: approvedWincAmountInput
							? approvedWincAmountInput <= 0 || approvedWincAmountInput > arProvider.turboBalance
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
						disabled={
							loading ||
							!walletAddress ||
							!checkValidAddress(walletAddress) ||
							!approvedWincAmountInput ||
							approvedWincAmountInput <= 0
						}
						loading={loading}
						icon={props.user ? null : ICONS.add}
						iconLeftAlign
						height={45}
						fullWidth
					/>
				</S.ActionsWrapper>
			</S.Wrapper>
			<Panel
				open={showFundUpload}
				width={575}
				header={language?.fundTurboBalance}
				handleClose={() => setShowFundUpload(false)}
				className={'modal-wrapper'}
			>
				<TurboBalanceFund handleClose={() => setShowFundUpload(false)} />
			</Panel>
		</>
	);
}
