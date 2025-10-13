import React from 'react';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { usePermawebProvider } from 'providers/PermawebProvider';

import Comment from './comment';
import CommentAdd from './commentAdd';
import * as S from './styles';

export default function Comments(props: any) {
	const { preview, commentsId } = props;
	const { portal } = usePortalProvider();
	const Themes = preview ? defaultThemes : portal?.Themes;
	const { libs } = usePermawebProvider();
	const [comments, setComments] = React.useState(null);

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

	React.useEffect(() => {
		if (preview) {
			initThemes(Themes);
			document.getElementById('preview')?.setAttribute('data-theme', 'dark');
		}
	}, []);

	const fetchComments = React.useCallback(async () => {
		if (libs && commentsId) {
			try {
				const comments = await libs.getComments({ commentsId });
				const organized = organizeComments(comments);
				setComments(organized);
			} catch (e) {
				console.error(e);
			}
		}
	}, [libs, commentsId, organizeComments]);

	React.useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	React.useEffect(() => {
		const handleCommentAdded = (e: any) => {
			if (e.detail.commentsId === commentsId) {
				fetchComments();
			}
		};
		window.addEventListener('commentAdded', handleCommentAdded);
		return () => window.removeEventListener('commentAdded', handleCommentAdded);
	}, [commentsId, fetchComments]);

	return (
		<S.Comments>
			<h2>Comments</h2>
			<CommentAdd commentsId={commentsId} />
			<S.CommentList>
				{comments &&
					comments.map((comment: any, index: number) => {
						return <Comment key={`${comment.id}-${index}`} data={comment} level={0} commentsId={commentsId} />;
					})}
			</S.CommentList>
		</S.Comments>
	);
}
