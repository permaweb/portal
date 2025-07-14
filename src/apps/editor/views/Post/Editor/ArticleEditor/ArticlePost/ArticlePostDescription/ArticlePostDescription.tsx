import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { Notification } from 'components/atoms/Notification';
import { Panel } from 'components/atoms/Panel';
import { TextArea } from 'components/atoms/TextArea';
import { ASSETS } from 'helpers/config';
import { NotificationType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function ArticlePostDescription() {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showPanel, setShowPanel] = React.useState<boolean>(false);
	const [response, setResponse] = React.useState<NotificationType | null>(null);
	const [originalDescription, setOriginalDescription] = React.useState<string>('');

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	const currentDescription = currentPost?.data?.description ?? '';
	const hasChanges = currentDescription !== originalDescription;

	return (
		<>
			<S.Wrapper>
				<S.ActionWrapper>
					<Button
						type={'primary'}
						label={language.editDescription}
						handlePress={() => {
							setOriginalDescription(currentDescription);
							setShowPanel(true);
						}}
						icon={ASSETS.arrow}
						height={40}
						fullWidth
					/>
				</S.ActionWrapper>
			</S.Wrapper>
			<Panel
				open={showPanel}
				header={language.editDescription}
				handleClose={() => setShowPanel(false)}
				width={500}
				closeHandlerDisabled={true}
			>
				<S.PanelBodyWrapper>
					<TextArea
						label={language.description}
						value={currentDescription}
						onChange={(e: any) => handleCurrentPostUpdate({ field: 'description', value: e.target.value })}
						onFocus={() => handleCurrentPostUpdate({ field: 'focusedBlock', value: null })}
						invalid={{ status: false, message: null }}
						disabled={false}
						hideErrorMessage
					/>
					<S.PanelActionsWrapper>
						<Button
							type={'alt1'}
							label={language.done}
							disabled={!hasChanges}
							handlePress={() => {
								setShowPanel(false);
								setResponse({ status: 'success', message: `${language.descriptionUpdated}!` });
							}}
						/>
					</S.PanelActionsWrapper>
				</S.PanelBodyWrapper>
			</Panel>
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
		</>
	);
}
