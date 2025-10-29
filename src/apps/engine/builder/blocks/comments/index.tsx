import React from 'react';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useComments } from 'engine/hooks/comments';
import { usePortalProvider } from 'engine/providers/portalProvider';

import Comment from './comment';
import CommentAdd from './commentAdd';
import * as S from './styles';

export default function Comments(props: any) {
	const { preview, commentsId, postAuthorId } = props;
	const { portal } = usePortalProvider();
	const Themes = preview ? defaultThemes : portal?.Themes;
	const { comments: fetchedComments } = useComments(commentsId);

	const organizeComments = React.useCallback((commentsList: any[]) => {
		if (!commentsList || commentsList.length === 0) return [];

		const commentsMap = new Map();
		const pinnedComments: any[] = [];
		const rootComments: any[] = [];

		commentsList.forEach((comment) => {
			commentsMap.set(comment.id, { ...comment, replies: [] });
		});

		commentsList.forEach((comment) => {
			if (comment.depth === -1) {
				pinnedComments.push(commentsMap.get(comment.id));
			} else if (comment.parentId && commentsMap.has(comment.parentId)) {
				const parent = commentsMap.get(comment.parentId);
				const child = commentsMap.get(comment.id);
				if (parent && child) {
					parent.replies.push(child);
				}
			} else if (comment.depth === 0 || !comment.parentId) {
				rootComments.push(commentsMap.get(comment.id));
			}
		});

		const sortByDate = (a: any, b: any) => b.dateCreated - a.dateCreated;
		pinnedComments.sort(sortByDate);
		rootComments.sort(sortByDate);

		[...pinnedComments, ...rootComments].forEach((comment) => {
			if (comment.replies) {
				comment.replies.sort(sortByDate);
			}
		});

		return [...pinnedComments, ...rootComments];
	}, []);

	const comments = React.useMemo(() => organizeComments(fetchedComments), [fetchedComments, organizeComments]);

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, []);

	return (
		<S.Comments>
			<h2>Comments</h2>
			<CommentAdd commentsId={commentsId} />
			<S.CommentList>
				{comments &&
					comments.map((comment: any, index: number) => {
						return (
							<Comment
								key={`${comment.id}-${index}`}
								data={comment}
								level={0}
								commentsId={commentsId}
								postAuthorId={postAuthorId}
							/>
						);
					})}
			</S.CommentList>
		</S.Comments>
	);
}
