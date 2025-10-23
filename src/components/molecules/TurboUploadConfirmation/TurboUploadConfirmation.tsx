import React from 'react';

import { Button } from 'components/atoms/Button';
import { ICONS } from 'helpers/config';
import { getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { TurboBalanceFund } from '../TurboBalanceFund';

import * as S from './styles';

export default function TurboUploadConfirmation(props: {
	uploadCost: number;
	uploadDisabled: boolean;
	handleUpload: () => void;
	handleCancel: () => void;
	message?: string;
	insufficientBalance?: boolean;
}) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);

	return (
		<>
			<S.Wrapper>
				<S.InputDescription>
					<span>{language?.mediaUploadCostInfo}</span>
				</S.InputDescription>
				<S.InputActions>
					<S.InputActionsInfo>
						<S.InputActionsInfoLine>
							<p>
								<span>{`${language?.yourUploadBalance}:`}</span>
								&nbsp;
								{arProvider.turboBalanceObj.effectiveBalance
									? `${getARAmountFromWinc(Number(arProvider.turboBalanceObj.effectiveBalance))} ${language?.credits}`
									: '-'}
							</p>
						</S.InputActionsInfoLine>
						<S.InputActionsInfoLine>
							<p>
								<span>{`${language?.costToUpload}:`}</span>
								&nbsp;
								{props.uploadCost ? `${getARAmountFromWinc(props.uploadCost)} ${language?.credits}` : '-'}
							</p>
						</S.InputActionsInfoLine>
						<S.InputActionsInfoDivider />
						<S.InputActionsInfoLine>
							<p>
								<span>{`${language?.remainingAfterUpload}:`}</span>
								&nbsp;
								{arProvider.turboBalanceObj.effectiveBalance && props.uploadCost
									? `${getARAmountFromWinc(Number(arProvider.turboBalanceObj.effectiveBalance) - props.uploadCost)} ${
											language?.credits
									  }`
									: '-'}
							</p>
						</S.InputActionsInfoLine>
					</S.InputActionsInfo>
					<S.InputActionsFlex>
						<Button type={'primary'} label={language?.cancel} handlePress={props.handleCancel} width={140} />
						<Button
							type={'alt1'}
							label={language?.upload}
							handlePress={props.handleUpload}
							disabled={props.uploadDisabled || props.insufficientBalance}
							width={140}
						/>
					</S.InputActionsFlex>
					{props.insufficientBalance && (
						<>
							<S.InputActionsMessage>
								{props.message && <p>{props.message}</p>}
								<Button
									type={'alt1'}
									label={language?.addFunds}
									handlePress={() => setShowFundUpload(true)}
									disabled={showFundUpload}
									icon={ICONS.add}
									iconLeftAlign
									height={50}
									fullWidth
								/>
							</S.InputActionsMessage>
							{showFundUpload && <TurboBalanceFund handleClose={() => setShowFundUpload(false)} />}
						</>
					)}
				</S.InputActions>
			</S.Wrapper>
		</>
	);
}
