import React from 'react';
import { defaultThemes } from 'engine/defaults/theme.defaults';
import { initThemes } from 'engine/helpers/themes';
import { useCommentRules, useComments, usePaidComments } from 'engine/hooks/comments';
import { usePortalProvider } from 'engine/providers/portalProvider';

import Comment from './comment';
import CommentAdd from './commentAdd';
import * as S from './styles';

export default function Comments(props: any) {
	const { preview, commentsId, postAuthorId } = props;
	const { portal } = usePortalProvider();
	const Themes = preview ? defaultThemes : portal?.Themes;
	const { comments: fetchedComments } = useComments(commentsId);
	const { rules } = useCommentRules(commentsId);
	const { paidComments } = usePaidComments(commentsId);

	const [activeTab, setActiveTab] = React.useState<'all' | 'paid'>('all');

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

	const showTabs = rules?.showPaidTab && rules?.enableTipping;
	const showHighlightStrip = rules?.highlightPaidComments && rules?.enableTipping && paidComments.length > 0;

	const displayComments = activeTab === 'paid' ? paidComments : comments;

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

			{showHighlightStrip && (
				<S.HighlightStrip>
					{paidComments.slice(0, 10).map((comment: any, index: number) => (
						<S.HighlightCard key={`highlight-${comment.id}-${index}`}>
							<S.HighlightAmount>
								{comment.tipAmount} {comment.tipAssetSymbol || 'Tip'}
							</S.HighlightAmount>
							<S.HighlightContent>{comment.content}</S.HighlightContent>
						</S.HighlightCard>
					))}
				</S.HighlightStrip>
			)}

			{showTabs && (
				<S.TabBar>
					<S.Tab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
						All
					</S.Tab>
					<S.Tab $active={activeTab === 'paid'} onClick={() => setActiveTab('paid')}>
						Paid
					</S.Tab>
				</S.TabBar>
			)}

			<S.CommentList>
				{displayComments &&
					displayComments.map((comment: any, index: number) => {
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
