import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PageToolbar(props: { handleSubmit: () => void }) {
	const dispatch = useDispatch();

	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const handleCurrentPageUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPageUpdate(updatedField));
	};

	const titleRef = React.useRef<any>(null);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	return (
		<S.Wrapper>
			<S.TitleWrapper>
				<input
					ref={titleRef}
					value={currentPage.data.title ?? ''}
					onChange={(e: any) => handleCurrentPageUpdate({ field: 'title', value: e.target.value })}
					placeholder={language?.pageTitle}
					disabled={currentPage.editor.loading.active || !portalProvider.current?.id}
				/>
			</S.TitleWrapper>
			<S.EndActions>
				{/* <ArticleToolbarMarkup />
				<Button
					type={'primary'}
					label={language?.toolkit}
					handlePress={() => {
						handleCurrentPostUpdate({ field: 'panelOpen', value: !currentPost.editor.panelOpen });
						setCurrentTab(TABS[0]!.label);
					}}
					active={currentPost.editor.panelOpen}
					disabled={currentPost.editor.loading.active}
					icon={currentPost.editor.panelOpen ? ICONS.close : ICONS.tools}
					iconLeftAlign
					tooltip={'CTRL + K'}
					noFocus
				/>
				<Button
					type={'primary'}
					label={language?.layout}
					handlePress={() =>
						handleCurrentPostUpdate({ field: 'blockEditMode', value: !currentPost.editor.blockEditMode })
					}
					active={currentPost.editor.blockEditMode}
					disabled={currentPost.editor.loading.active}
					icon={currentPost.editor.blockEditMode ? ICONS.close : ICONS.layout}
					iconLeftAlign
					tooltip={'CTRL + L'}
					noFocus
				/> */}
				<S.SubmitWrapper>
					<Button
						type={'alt1'}
						label={language?.save}
						handlePress={props.handleSubmit}
						active={false}
						disabled={unauthorized}
						noFocus
					/>
				</S.SubmitWrapper>
			</S.EndActions>
		</S.Wrapper>
	);
}
