import React from 'react';
import { ReactSVG } from 'react-svg';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Placeholder from 'engine/components/placeholder';
import { useProfile } from 'engine/hooks/profiles';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import CommentAdd from '../commentAdd';

import * as S from './styles';

export default function Comment(props: any) {
	const { data, level, commentsId } = props;
	const { profile, isLoading: isLoadingProfile } = useProfile(data?.creator || '');
	const [showEditor, setShowEditor] = React.useState(false);
	const [showReplies, setShowReplies] = React.useState(false);
	const [isEditMode, setIsEditMode] = React.useState(false);
	const [editContent, setEditContent] = React.useState(data?.content || '');
	const [commentData, setCommentData] = React.useState(data);
	const [isUpdating, setIsUpdating] = React.useState(false);
	const [isEditSubmitting, setIsEditSubmitting] = React.useState(false);
	const { profile: user, libs } = usePermawebProvider();

	const canEditCommentStatus = user?.owner && ['Admin', 'Moderator'].some((r) => user?.roles?.includes(r));
	const canRemoveComment =
		(user?.owner && ['Admin', 'Moderator'].some((r) => user?.roles?.includes(r))) ||
		commentData.creator === user?.owner;
	const canEditComment = user?.owner && commentData.creator === user?.owner;
	const canPinComment =
		canEditCommentStatus && (!commentData.parentId || commentData.depth === 0 || commentData.depth === -1);
	const showMenu = canEditCommentStatus || canRemoveComment || canEditComment;

	function handleUserMute() {
		console.log('Mute user: ', profile?.id);
	}

	function handleUserBlock() {
		console.log('Block user: ', profile?.id);
	}

	async function handleCommentRemove() {
		setIsUpdating(true);
		try {
			await libs.removeComment({
				commentsId: commentsId,
				commentId: commentData.id,
			});
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleCommentStatus(status: string) {
		setIsUpdating(true);
		try {
			console.log('libs: ', libs);
			const updateId = await libs.updateCommentStatus({
				commentsId: commentsId,
				commentId: commentData.id,
				status: status,
			});
			if (updateId) {
				setCommentData({ ...commentData, status: status });
			}
		} finally {
			setIsUpdating(false);
		}
	}

	async function handlePinComment() {
		setIsUpdating(true);
		try {
			if (commentData.depth === -1) {
				const result = await libs.unpinComment({
					commentsId: commentsId,
					commentId: commentData.id,
				});
				if (result) {
					setCommentData({ ...commentData, depth: 0 });
				}
			} else {
				const result = await libs.pinComment({
					commentsId: commentsId,
					commentId: commentData.id,
				});
				if (result) {
					setCommentData({ ...commentData, depth: -1 });
				}
			}
			window.dispatchEvent(
				new CustomEvent('commentAdded', {
					detail: { commentsId },
				})
			);
		} catch (error) {
			console.error('Failed to pin/unpin comment:', error);
		} finally {
			setIsUpdating(false);
		}
	}

	const menuEntries: MenuItem[] = [];

	if (canEditComment && !isEditMode) {
		menuEntries.push({
			icon: ICONS.edit,
			label: 'Edit Comment',
			onClick: () => {
				setIsEditMode(true);
				setEditContent(commentData.content);
			},
		});
		// Add spacer after edit if there are other options
		if (canEditCommentStatus || canRemoveComment) {
			menuEntries.push({ type: 'spacer' });
		}
	}

	if (canPinComment) {
		menuEntries.push({
			icon: commentData.depth === -1 ? ICONS.close : ICONS.alignTop,
			label: commentData.depth === -1 ? 'Unpin Comment' : 'Pin Comment',
			onClick: handlePinComment,
		});
	}

	if (canEditCommentStatus) {
		menuEntries.push({
			icon: commentData.status === 'active' ? ICONS.hide : ICONS.show,
			label: commentData.status === 'active' ? 'Hide Comment' : 'Unhide Comment',
			onClick: () => handleCommentStatus(commentData.status === 'active' ? 'inactive' : 'active'),
		});
	}

	if (canRemoveComment) {
		menuEntries.push({
			icon: ICONS.remove,
			label: 'Remove Comment',
			onClick: handleCommentRemove,
		});
	}

	// Re-check visibility when user changes
	if (!commentData) return null;
	// Explicitly check if user is logged in and has permission for hidden comments
	const hasModPermission = user?.owner && user?.roles && ['Admin', 'Moderator'].some((r) => user.roles.includes(r));
	if (commentData.status !== 'active' && !hasModPermission) return null;

	return (
		<>
			<S.Comment $level={level} $status={commentData.status}>
				{(isUpdating || isEditSubmitting) && (
					<S.LoadingOverlay>
						<S.Spinner />
					</S.LoadingOverlay>
				)}
				<S.Avatar>
					<img
						className="loadingAvatar"
						onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
						src={
							!isLoadingProfile && profile?.thumbnail && checkValidAddress(profile.thumbnail)
								? getTxEndpoint(profile.thumbnail)
								: ICONS.user
						}
					/>
				</S.Avatar>
				<S.Content>
					<S.Meta>
						<S.Username>{isLoadingProfile ? <Placeholder /> : profile?.displayName}</S.Username>
						{isEditMode && (
							<S.EditingIndicator>
								<ReactSVG src={ICONS.edit} />
								Editing
							</S.EditingIndicator>
						)}
						{commentData.depth === -1 && (
							<S.PinnedIndicator>
								<ReactSVG src={ICONS.alignTop} />
								Pinned
							</S.PinnedIndicator>
						)}
						{commentData.status !== 'active' && (
							<S.HiddenIndicator>
								<ReactSVG src={ICONS.hide} />
								Hidden
							</S.HiddenIndicator>
						)}
						<S.Date>
							{!commentData?.dateCreated ? (
								<Placeholder />
							) : (
								new Date(commentData.dateCreated).toLocaleString('en-US', {
									day: '2-digit',
									month: '2-digit',
									year: '2-digit',
									hour: '2-digit',
									minute: '2-digit',
									hour12: false,
								})
							)}
						</S.Date>
						{commentData.updatedAt && commentData.updatedAt !== commentData.dateCreated && (
							<S.EditedIndicator
								title={`Edited: ${new Date(commentData.updatedAt).toLocaleString('en-US', {
									day: '2-digit',
									month: '2-digit',
									year: '2-digit',
									hour: '2-digit',
									minute: '2-digit',
									hour12: false,
								})}`}
							>
								(edited)
							</S.EditedIndicator>
						)}
					</S.Meta>
					{isEditMode ? (
						<S.EditContainer>
							<CommentAdd
								commentsId={commentsId}
								parentId={commentData.parentId}
								initialContent={commentData.content}
								isEditMode={true}
								commentId={commentData.id}
								onCommentAdded={(updatedContent: string) => {
									setCommentData({ ...commentData, content: updatedContent });
									setIsEditMode(false);
								}}
								onSubmittingChange={setIsEditSubmitting}
								onCancel={() => {
									setIsEditMode(false);
									setEditContent(commentData.content);
								}}
							/>
						</S.EditContainer>
					) : (
						<>
							<S.Text>{commentData.content}</S.Text>
							<ContextMenu entries={menuEntries} />
						</>
					)}
					<S.Actions>
						<S.Action onClick={() => setShowEditor(!showEditor)}>
							<ReactSVG src={showEditor ? ICONS.close : ICONS.reply} />
							{showEditor ? 'Cancel' : 'Reply'}
						</S.Action>
					</S.Actions>
				</S.Content>
			</S.Comment>
			{showEditor && (
				<S.ReplyEditor $level={level}>
					<CommentAdd commentsId={commentsId} parentId={commentData.id} onCommentAdded={() => setShowEditor(false)} />
				</S.ReplyEditor>
			)}
			{commentData.replies && commentData.replies.length > 0 && (
				<S.RepliesToggle onClick={() => setShowReplies(!showReplies)} $level={level}>
					<S.ArrowIcon $rotated={showReplies}>
						<ReactSVG src={ICONS.arrow} />
					</S.ArrowIcon>
					{showReplies ? 'Hide' : 'View'} {commentData.replies.length}{' '}
					{commentData.replies.length === 1 ? 'Reply' : 'Replies'}
				</S.RepliesToggle>
			)}
			{showReplies && commentData.replies && commentData.replies.length > 0 && (
				<>
					{commentData.replies.map((reply: any, index: number) => (
						<Comment key={`${reply.id}-${index}`} data={reply} level={parseInt(level) + 1} commentsId={commentsId} />
					))}
				</>
			)}
		</>
	);
}
