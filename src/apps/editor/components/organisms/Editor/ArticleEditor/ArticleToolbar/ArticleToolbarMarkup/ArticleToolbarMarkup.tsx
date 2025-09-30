import { useDispatch, useSelector } from 'react-redux';

import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { IconButton } from 'components/atoms/IconButton';
import { ASSETS } from 'helpers/config';

import * as S from './styles';

export default function ArticleToolbarMarkup() {
	const dispatch = useDispatch();
	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	function getMarkupAction(markupType: 'bold' | 'italic' | 'underline' | 'strikethrough') {
		let icon = null;
		let tooltip = null;

		switch (markupType) {
			case 'bold':
				icon = ASSETS.bold;
				tooltip = 'Bold (Cmd + B)';
				break;
			case 'italic':
				icon = ASSETS.italic;
				tooltip = 'Italic (Cmd + I)';
				break;
			case 'underline':
				icon = ASSETS.underline;
				tooltip = 'Underline (Cmd + U)';
				break;
			case 'strikethrough':
				icon = ASSETS.strikethrough;
				tooltip = 'Strikethrough (Cmd + S)';
				break;
		}

		const isActive = currentPost.editor.markup[markupType];

		return (
			<IconButton
				type={'primary'}
				src={icon}
				handlePress={() => handleCurrentPostUpdate({ field: `markup.${markupType}`, value: !isActive })}
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
