import { useDispatch, useSelector } from 'react-redux';

import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { IconButton } from 'components/atoms/IconButton';
import { ICONS } from 'helpers/config';
import { isMac } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function ArticleToolbarMarkup() {
	const dispatch = useDispatch();
	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	const modKey = isMac ? 'Cmd' : 'Ctrl';

	// Get current text alignment from focused block
	const focusedBlock = currentPost.editor.focusedBlock;
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

		const isActive = currentPost.editor.markup[markupType];

		return (
			<IconButton
				type={'primary'}
				src={icon}
				handlePress={() => {
					// Set a flag to indicate this is a user-initiated change
					handleCurrentPostUpdate({ field: 'markupUserInitiated', value: true });
					handleCurrentPostUpdate({ field: `markup.${markupType}`, value: !isActive });
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

					// Update the focused block's data with the new alignment
					const updatedContent = currentPost.data.content?.map((block: any) => {
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

					handleCurrentPostUpdate({ field: 'content', value: updatedContent });

					// Update the focused block in editor state as well
					handleCurrentPostUpdate({
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
