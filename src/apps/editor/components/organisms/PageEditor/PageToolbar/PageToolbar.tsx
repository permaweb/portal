import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { Button } from 'components/atoms/Button';
import { ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

// TODO: Layout shortcut
export default function PageToolbar(props: { handleSubmit: () => void; addSection: (type: string) => void }) {
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

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey) {
				if (event.key.toLowerCase() === 'l') {
					event.preventDefault();
					handleCurrentPageUpdate({ field: 'blockEditMode', value: !currentPage.editor.blockEditMode });
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [currentPage.editor.blockEditMode]);

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
				<Button
					type={'primary'}
					label={language?.layout}
					handlePress={() =>
						handleCurrentPageUpdate({ field: 'blockEditMode', value: !currentPage.editor.blockEditMode })
					}
					active={currentPage.editor.blockEditMode}
					disabled={currentPage.editor.loading.active}
					icon={currentPage.editor.blockEditMode ? ICONS.close : ICONS.layout}
					iconLeftAlign
					tooltip={'CTRL + L'}
					noFocus
				/>
				<Button
					type={'primary'}
					label={language?.addSection}
					handlePress={() => props.addSection('row')}
					disabled={currentPage.editor.loading.active}
					icon={ICONS.add}
					iconLeftAlign
					tooltip={null}
					noFocus
				/>
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
