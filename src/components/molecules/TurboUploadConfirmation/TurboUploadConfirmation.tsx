import React from 'react';

import { Button } from 'components/atoms/Button';
import { Modal } from 'components/atoms/Modal';
import { ICONS } from 'helpers/config';
import { getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { TurboBalanceFund } from '../TurboBalanceFund';

import * as S from './styles';

type UploadOption = 'compressed' | 'uncompressed';

export default function TurboUploadConfirmation(props: {
	uploadCost: number;
	uploadDisabled: boolean;
	handleUpload: () => void;
	handleCancel: () => void;
	handleCompress?: () => void;
	canCompress?: boolean;
	compressing?: boolean;
	message?: string;
	insufficientBalance?: boolean;
}) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showFundUpload, setShowFundUpload] = React.useState<boolean>(false);
	const [selectedOption, setSelectedOption] = React.useState<UploadOption>(
		props.canCompress ? 'compressed' : 'uncompressed'
	);

	const insufficientBalance = Number(arProvider.turboBalanceObj.effectiveBalance || 0) < props.uploadCost;

	const handleConfirm = () => {
		if (selectedOption === 'compressed' && props.handleCompress) {
			props.handleCompress();
		} else {
			props.handleUpload();
		}
	};

	const isConfirmDisabled =
		props.uploadDisabled || props.compressing || (selectedOption === 'uncompressed' && insufficientBalance);

	return (
		<>
			<S.Wrapper>
				<S.UploadOptionsHeader>
					<span>{language?.uploadOptions}</span>
				</S.UploadOptionsHeader>
				<S.RadioGroup>
					{props.canCompress && (
						<S.RadioOption selected={selectedOption === 'compressed'} onClick={() => setSelectedOption('compressed')}>
							<S.RadioButton selected={selectedOption === 'compressed'}>
								<S.RadioButtonInner selected={selectedOption === 'compressed'} />
							</S.RadioButton>
							<S.RadioLabel>
								<span>{language?.compressImage}</span>
								<p>{language?.free}</p>
							</S.RadioLabel>
						</S.RadioOption>
					)}
					<S.RadioOption
						selected={selectedOption === 'uncompressed'}
						onClick={() => {
							if (!insufficientBalance) setSelectedOption('uncompressed');
						}}
						disabled={insufficientBalance}
					>
						<S.RadioOptionContent>
							<S.RadioOptionHeader>
								<S.RadioButton selected={selectedOption === 'uncompressed'} disabled={insufficientBalance}>
									<S.RadioButtonInner selected={selectedOption === 'uncompressed'} />
								</S.RadioButton>
								<S.RadioLabel disabled={insufficientBalance}>
									<span>{language?.uploadUncompressed}</span>
									<p>{props.uploadCost ? `${getARAmountFromWinc(props.uploadCost)} ${language?.credits}` : '-'}</p>
								</S.RadioLabel>
							</S.RadioOptionHeader>
							<S.InputActionsInfo disabled={insufficientBalance}>
								<S.InputActionsInfoLine>
									<p>
										<span>{`${language?.yourUploadBalance}:`}</span>
										&nbsp;
										{arProvider.turboBalanceObj.effectiveBalance
											? `${getARAmountFromWinc(Number(arProvider.turboBalanceObj.effectiveBalance))} ${
													language?.credits
											  }`
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
											? `${getARAmountFromWinc(
													Number(arProvider.turboBalanceObj.effectiveBalance) - props.uploadCost
											  )} ${language?.credits}`
											: '-'}
									</p>
								</S.InputActionsInfoLine>
							</S.InputActionsInfo>
							{insufficientBalance && (
								<S.AddFundsAction>
									<Button
										type={'alt1'}
										label={language?.addFunds}
										handlePress={(e) => {
											e.stopPropagation();
											setShowFundUpload(true);
										}}
										disabled={showFundUpload}
										icon={ICONS.add}
										iconLeftAlign
										height={40}
										fullWidth
									/>
								</S.AddFundsAction>
							)}
						</S.RadioOptionContent>
					</S.RadioOption>
				</S.RadioGroup>
				{showFundUpload && (
					<Modal
						header={language?.fundTurboBalance}
						handleClose={() => setShowFundUpload(false)}
						className={'modal-wrapper'}
					>
						<TurboBalanceFund handleClose={() => setShowFundUpload(false)} />
					</Modal>
				)}
				<S.InputActionsFlex>
					<Button
						type={'primary'}
						label={language?.cancel}
						handlePress={props.handleCancel}
						disabled={props.compressing}
						width={140}
					/>
					<Button
						type={'alt1'}
						label={language?.upload}
						handlePress={handleConfirm}
						disabled={isConfirmDisabled}
						loading={props.compressing}
						width={140}
					/>
				</S.InputActionsFlex>
			</S.Wrapper>
		</>
	);
}
