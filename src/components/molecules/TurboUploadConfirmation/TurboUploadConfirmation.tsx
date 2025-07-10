import { Button } from 'components/atoms/Button';
import { getARAmountFromWinc } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

// TODO: Allow topup if insufficient balance
export default function TurboUploadConfirmation(props: {
	uploadCost: number;
	uploadDisabled: boolean;
	handleUpload: () => void;
	handleCancel: () => void;
}) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper>
			<S.InputDescription>
				<span>{language.mediaUploadCostInfo}</span>
			</S.InputDescription>
			<S.InputActions>
				<S.InputActionsInfo>
					<S.InputActionsInfoLine>
						<p>
							<span>{`${language.yourUploadBalance}:`}</span>
							&nbsp;
							{arProvider.turboBalance ? `${getARAmountFromWinc(arProvider.turboBalance)} ${language.credits}` : '-'}
						</p>
					</S.InputActionsInfoLine>
					<S.InputActionsInfoLine>
						<p>
							<span>{`${language.costToUpload}:`}</span>
							&nbsp;
							{props.uploadCost ? `${getARAmountFromWinc(props.uploadCost)} ${language.credits}` : '-'}
						</p>
					</S.InputActionsInfoLine>
					<S.InputActionsInfoDivider />
					<S.InputActionsInfoLine>
						<p>
							<span>{`${language.remainingAfterUpload}:`}</span>
							&nbsp;
							{arProvider.turboBalance && props.uploadCost
								? `${getARAmountFromWinc(arProvider.turboBalance - props.uploadCost)} ${language.credits}`
								: '-'}
						</p>
					</S.InputActionsInfoLine>
				</S.InputActionsInfo>
				<S.InputActionsFlex>
					<Button
						type={'primary'}
						label={language.cancel}
						handlePress={props.handleCancel}
						width={140}
					/>
					<Button
						type={'alt1'}
						label={language.upload}
						handlePress={props.handleUpload}
						disabled={props.uploadDisabled}
						width={140}
					/>
				</S.InputActionsFlex>
			</S.InputActions>
		</S.Wrapper>
	);
}
