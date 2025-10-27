import { useDispatch, useSelector } from 'react-redux';

import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { IconButton } from 'components/atoms/IconButton';
import { ICONS } from 'helpers/config';
import { isMac } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PageToolbarMarkup() {
	const dispatch = useDispatch();
	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const handleCurrentPageUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPageUpdate(updatedField));
	};

	const modKey = isMac ? 'Cmd' : 'Ctrl';

	// Get current text alignment from focused block
	const focusedBlock = currentPage.editor.focusedBlock;
	const currentAlignment = focusedBlock?.data?.textAlign || 'left';

	function getMarkupAction(markupType: 'bold' | 'italic' | 'underline' | 'strikethrough') {
		let icon = null;
		let tooltip = null;

		switch (markupType) {
			case 'bold':
				icon = ICONS.bold;
				tooltip = `${language?.bold || 'Bold'} (${modKey} + B)`;
				break;
			case 'italic':
				icon = ICONS.italic;
				tooltip = `${language?.italic || 'Italic'} (${modKey} + I)`;
				break;
			case 'underline':
				icon = ICONS.underline;
				tooltip = `${language?.underline || 'Underline'} (${modKey} + U)`;
				break;
			case 'strikethrough':
				icon = ICONS.strikethrough;
				tooltip = `${language?.strikethrough || 'Strikethrough'} (${modKey} + Shift + X)`;
				break;
		}

		const isActive = currentPage.editor.markup[markupType];

		return (
			<IconButton
				type={'primary'}
				src={icon}
				handlePress={() => {
					// Set a flag to indicate this is a user-initiated change
					handleCurrentPageUpdate({ field: 'markupUserInitiated', value: true });
					handleCurrentPageUpdate({ field: `markup.${markupType}`, value: !isActive });
				}}
				dimensions={{
					wrapper: 26.5,
					icon: 17.5,
				}}
				tooltip={tooltip}
				active={isActive}
			/>
		);
	}

	function getAlignmentAction(alignmentType: 'left' | 'center' | 'right') {
		let icon = null;
		let tooltip = null;

		switch (alignmentType) {
			case 'left':
				icon = ICONS.textAlignLeft;
				tooltip = `${language?.alignLeft || 'Left Align'}`;
				break;
			case 'center':
				icon = ICONS.textAlignCenter;
				tooltip = `${language?.alignCenter || 'Center Align'}`;
				break;
			case 'right':
				icon = ICONS.textAlignRight;
				tooltip = `${language?.alignRight || 'Right Align'}`;
				break;
		}

		const isActive = currentAlignment === alignmentType;

		return (
			<IconButton
				type={'primary'}
				src={icon}
				handlePress={() => {
					if (!focusedBlock) return;

					// Find and update the block in the nested page section structure
					const updatedContent = currentPage.data.content?.map((section: any) => {
						const updatedBlocks = section.content?.map((block: any) => {
							if (block.id === focusedBlock.id) {
								return {
									...block,
									data: {
										...block.data,
										textAlign: alignmentType,
									},
								};
							}
							return block;
						});

						return {
							...section,
							content: updatedBlocks,
						};
					});

					handleCurrentPageUpdate({ field: 'content', value: updatedContent });

					// Update the focused block in editor state as well
					handleCurrentPageUpdate({
						field: 'focusedBlock',
						value: {
							...focusedBlock,
							data: {
								...focusedBlock.data,
								textAlign: alignmentType,
							},
						},
					});
				}}
				dimensions={{
					wrapper: 26.5,
					icon: 17.5,
				}}
				tooltip={tooltip}
				active={isActive}
			/>
		);
	}

	return (
		<S.Wrapper className={'border-wrapper-alt3'}>
			<S.Section>
				{getAlignmentAction('left')}
				{getAlignmentAction('center')}
				{getAlignmentAction('right')}
			</S.Section>
			<S.Divider />
			<S.Section>
				{getMarkupAction('bold')}
				{getMarkupAction('italic')}
				{getMarkupAction('underline')}
				{getMarkupAction('strikethrough')}
			</S.Section>
		</S.Wrapper>
	);
}
