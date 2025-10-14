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
				tooltip = `${language?.strikethrough || 'Strikethrough'} (${modKey} + X)`;
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

	return (
		<S.Wrapper className={'border-wrapper-alt3'}>
			{getMarkupAction('bold')}
			{getMarkupAction('italic')}
			{getMarkupAction('underline')}
			{getMarkupAction('strikethrough')}
		</S.Wrapper>
	);
}
