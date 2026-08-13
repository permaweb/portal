import React from 'react';

import { Button } from 'components/atoms/Button';
import { getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

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

	const [selectedOption, setSelectedOption] = React.useState<UploadOption>(
		props.canCompress ? 'compressed' : 'uncompressed'
	);

	const balanceInWinc = Number(arProvider.arBalance || 0) * 1e12;
	const insufficientBalance = props.insufficientBalance ?? balanceInWinc < props.uploadCost;
	const remainingBalance = Math.max(0, balanceInWinc - props.uploadCost);

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
									<p>{props.uploadCost ? `${getARAmountFromWinc(props.uploadCost)} AR` : '-'}</p>
								</S.RadioLabel>
							</S.RadioOptionHeader>
							<S.InputActionsInfo disabled={insufficientBalance}>
								<S.InputActionsInfoLine>
									<p>
										<span>AR balance:</span>
										&nbsp;
										{arProvider.arBalance == null ? '-' : `${Number(arProvider.arBalance).toFixed(6)} AR`}
									</p>
								</S.InputActionsInfoLine>
								<S.InputActionsInfoLine>
									<p>
										<span>{`${language?.costToUpload}:`}</span>
										&nbsp;
										{props.uploadCost ? `${getARAmountFromWinc(props.uploadCost)} AR` : '-'}
									</p>
								</S.InputActionsInfoLine>
								<S.InputActionsInfoDivider />
								<S.InputActionsInfoLine>
									<p>
										<span>{`${language?.remainingAfterUpload}:`}</span>
										&nbsp;
										{arProvider.arBalance == null || !props.uploadCost
											? '-'
											: `${getARAmountFromWinc(remainingBalance)} AR`}
									</p>
								</S.InputActionsInfoLine>
							</S.InputActionsInfo>
							{insufficientBalance && <S.AddFundsAction>Insufficient AR balance</S.AddFundsAction>}
						</S.RadioOptionContent>
					</S.RadioOption>
				</S.RadioGroup>
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
