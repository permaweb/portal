import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { TextArea } from 'components/atoms/TextArea';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { RootState } from 'store';
import { currentPostUpdate } from 'store/post';

import * as S from './styles';

// TODO
export default function ArticleToolbarPostDescription() {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: RootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showPanel, setShowPanel] = React.useState<boolean>(false);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	return (
		<>
			<S.Wrapper>
				<S.ActionWrapper>
					<Button
						type={'primary'}
						label={language.editSummary}
						handlePress={() => setShowPanel(true)}
						icon={ASSETS.arrow}
						height={40}
						fullWidth
					/>
				</S.ActionWrapper>
			</S.Wrapper>
			<Panel
				open={showPanel}
				header={language.editSummary}
				handleClose={() => setShowPanel(false)}
				width={500}
				closeHandlerDisabled={true}
			>
				<S.PanelBodyWrapper>
					<TextArea
						label={language.summary}
						value={currentPost?.data?.description ?? ''}
						onChange={(e: any) => handleCurrentPostUpdate({ field: 'description', value: e.target.value })}
						invalid={{ status: false, message: null }}
						disabled={false}
						hideErrorMessage
					/>
					<S.PanelActionsWrapper>
						<Button type={'alt1'} label={language.done} handlePress={() => setShowPanel(false)} />
					</S.PanelActionsWrapper>
				</S.PanelBodyWrapper>
			</Panel>
		</>
	);
}
