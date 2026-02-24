import React from 'react';
import styled from 'styled-components';

import { useComments } from '../../hooks/useComments';
import { useWidgetProvider } from '../../providers/WidgetProvider';
import Comment from './Comment';
import CommentAdd from './CommentAdd';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow-y: auto;
	padding: 12px;
	gap: 12px;
`;

const CommentList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const InputWrapper = styled.div`
	border-top: 1px solid var(--widget-border);
	padding: 8px 12px;
	flex-shrink: 0;
`;

const Empty = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	opacity: 0.5;
	font-size: 13px;
`;

export default function CommentsView() {
	const { config } = useWidgetProvider();
	const { comments: fetchedComments, isLoading } = useComments(config.processId);

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

	return (
		<>
			<Container>
				{isLoading && comments.length === 0 ? (
					<Empty>Loading comments...</Empty>
				) : comments.length === 0 ? (
					<Empty>No comments yet</Empty>
				) : (
					<CommentList>
						{comments.map((comment: any, index: number) => (
							<Comment key={`${comment.id}-${index}`} data={comment} level={0} commentsId={config.processId} />
						))}
					</CommentList>
				)}
			</Container>
			<InputWrapper>
				<CommentAdd commentsId={config.processId} />
			</InputWrapper>
		</>
	);
}
