import { useSelector } from 'react-redux';

import { EditorStoreRootState } from 'editor/store';

import { hasUnsavedChanges } from 'helpers/utils';

import * as S from './styles';

export default function ArticlePostChanges() {
	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const isEmpty =
		!currentPost.data.content ||
		currentPost.data.content.length === 0 ||
		currentPost.data.content.every((block) => !block.content || block.content.trim() === '');

	const hasChanges = hasUnsavedChanges(currentPost.data, currentPost.originalData) && !isEmpty;

	return (
		<S.Wrapper>
			<S.StatusIndicator hasChanges={hasChanges} />
			<S.StatusText>{hasChanges ? 'Unsaved changes' : 'No changes'}</S.StatusText>
		</S.Wrapper>
	);
}
