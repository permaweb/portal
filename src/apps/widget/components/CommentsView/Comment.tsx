import React from 'react';
import styled from 'styled-components';

import { useProfile } from '../../hooks/useProfile';
import { useModeration } from '../../hooks/useModeration';
import { usePermawebProvider } from '../../providers/WidgetPermawebProvider';
import { useWalletProvider } from '../../providers/WalletBridgeProvider';
import { useWidgetProvider } from '../../providers/WidgetProvider';
import { useLanguageProvider } from '../../providers/WidgetLanguageProvider';
import Avatar from '../shared/Avatar';
import CommentAdd from './CommentAdd';

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const CommentWrapper = styled.div<{ $level: number; $isPinned: boolean; $isBlocked: boolean }>`
	display: flex;
	gap: 10px;
	margin-left: ${(p) => p.$level * 28}px;
	opacity: ${(p) => (p.$isBlocked ? 0.5 : 1)};
	position: relative;
	background: ${(p) => (p.$isPinned ? 'var(--widget-hover)' : 'transparent')};
	border-radius: 8px;
	padding: 4px;
`;

const AvatarWrapper = styled.div`
	flex-shrink: 0;
	cursor: pointer;
`;

const Content = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const Meta = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 6px;
`;

const Username = styled.span`
	font-weight: 600;
	font-size: 13px;
	color: var(--widget-text);
	cursor: pointer;

	&:hover {
		text-decoration: underline;
	}
`;

const Badge = styled.span<{ $variant?: 'pin' | 'hidden' | 'edit' }>`
	font-size: 10px;
	padding: 1px 5px;
	border-radius: 4px;
	font-weight: 600;
	background: ${(p) =>
		p.$variant === 'pin' ? 'var(--widget-primary)' : p.$variant === 'hidden' ? '#ef4444' : 'var(--widget-input-bg)'};
	color: ${(p) => (p.$variant === 'pin' || p.$variant === 'hidden' ? '#fff' : 'var(--widget-text)')};
	opacity: ${(p) => (p.$variant === 'edit' ? 0.7 : 1)};
`;

const DateText = styled.span`
	font-size: 11px;
	opacity: 0.5;
`;

const EditedText = styled.span`
	font-size: 11px;
	opacity: 0.4;
	font-style: italic;
`;

const Text = styled.p`
	margin: 0;
	font-size: 13px;
	line-height: 1.5;
	color: var(--widget-text);
	word-break: break-word;
	white-space: pre-wrap;
`;

const Actions = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	margin-top: 2px;
`;

const ActionButton = styled.button`
	background: transparent;
	border: none;
	padding: 0;
	font-size: 12px;
	color: var(--widget-text);
	opacity: 0.5;
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover {
		opacity: 1;
	}
`;

const DangerButton = styled(ActionButton)`
	color: #ef4444;

	&:hover {
		opacity: 0.8;
	}
`;

const ReplyEditorWrapper = styled.div<{ $level: number }>`
	margin-left: ${(p) => (p.$level + 1) * 28}px;
	margin-top: 4px;
`;

const RepliesToggle = styled.button<{ $level: number }>`
	display: flex;
	align-items: center;
	gap: 4px;
	background: transparent;
	border: none;
	padding: 4px 0;
	margin-left: ${(p) => (p.$level + 1) * 28}px;
	font-size: 12px;
	font-weight: 600;
	color: var(--widget-primary);
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover {
		opacity: 0.8;
	}
`;

const RepliesList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-top: 4px;
`;

const EditContainer = styled.div`
	margin-top: 4px;
`;

const MenuBar = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 4px;
`;

const LoadingOverlay = styled.div`
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.15);
	border-radius: 8px;
	z-index: 10;
`;

const Spinner = styled.div`
	width: 18px;
	height: 18px;
	border: 2px solid var(--widget-border);
	border-top-color: var(--widget-primary);
	border-radius: 50%;
	animation: spin 0.6s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(ts: number): string {
	if (!ts) return '';
	return new Date(ts).toLocaleString('en-US', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CommentProps {
	data: any;
	level: number;
	commentsId: string;
}

export default function Comment(props: CommentProps) {
	const { data, level, commentsId } = props;

	// useLanguageProvider is available for future i18n use
	useLanguageProvider();

	const { profile: user, libs } = usePermawebProvider();
	const { walletAddress } = useWalletProvider();
	const { config } = useWidgetProvider();
	const moderationId = config.moderationId;

	const { profile, isLoading: isLoadingProfile } = useProfile(data?.creator || '');
	const { blockedComments, blockedUsers } = useModeration(moderationId);

	const [commentData, setCommentData] = React.useState<any>(data);
	const [showReplyEditor, setShowReplyEditor] = React.useState(false);
	const [showReplies, setShowReplies] = React.useState(false);
	const [isEditMode, setIsEditMode] = React.useState(false);
	const [isUpdating, setIsUpdating] = React.useState(false);
	const [isEditSubmitting, setIsEditSubmitting] = React.useState(false);

	const prevReplyCountRef = React.useRef<number>(data?.replies?.length || 0);

	// Sync external data updates and auto-expand replies when new ones arrive
	React.useEffect(() => {
		setCommentData(data);
		const currentCount = data?.replies?.length || 0;
		if (currentCount > prevReplyCountRef.current) {
			setShowReplies(true);
		}
		prevReplyCountRef.current = currentCount;
	}, [data]);

	// ---------------------------------------------------------------------------
	// Derived state
	// ---------------------------------------------------------------------------

	const roles = Array.isArray(user?.roles) ? user.roles : user?.roles ? [user.roles] : [];
	const userIsAdmin = roles.includes('Admin');
	const userIsModerator = roles.includes('Moderator');
	const isModerator = userIsAdmin || userIsModerator;

	const isOwnComment = Boolean(walletAddress && commentData.creator === user?.owner);
	const isPinned = commentData.depth === -1;
	const isHidden = commentData.status !== 'active';

	const isCommentBlocked = blockedComments.has(commentData.id);
	const isUserBlocked = blockedUsers.has(commentData.creator);
	const isBlocked = isCommentBlocked || isUserBlocked;

	const canPin = isModerator && (!commentData.parentId || commentData.depth === 0 || commentData.depth === -1);

	// Show moderated comments only if user has mod permission
	const hasModPermission = user?.owner && isModerator;
	if (!commentData) return null;
	if (isHidden && !hasModPermission) return null;

	// ---------------------------------------------------------------------------
	// Handlers
	// ---------------------------------------------------------------------------

	async function handlePinToggle() {
		if (!libs || !commentsId) return;
		setIsUpdating(true);
		try {
			if (isPinned) {
				const result = await libs.unpinComment({ commentsId, commentId: commentData.id });
				if (result) setCommentData((prev: any) => ({ ...prev, depth: 0 }));
			} else {
				const result = await libs.pinComment({ commentsId, commentId: commentData.id });
				if (result) setCommentData((prev: any) => ({ ...prev, depth: -1 }));
			}
			window.dispatchEvent(new CustomEvent('commentAdded', { detail: { commentsId } }));
		} catch (err) {
			console.error('Failed to pin/unpin comment:', err);
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleBlockComment() {
		if (!moderationId || !libs || !user?.owner) return;
		setIsUpdating(true);
		try {
			await libs.addModerationEntry({
				moderationId,
				targetType: 'comment',
				targetId: commentData.id,
				status: 'blocked',
				targetContext: commentsId,
				moderator: user.owner,
				reason: 'default',
			});
			window.dispatchEvent(new CustomEvent('commentAdded', { detail: { commentsId } }));
		} catch (err) {
			console.error('Error blocking comment:', err);
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleUnblockComment() {
		if (!moderationId || !libs || !user?.owner) return;
		setIsUpdating(true);
		try {
			await libs.removeModerationEntry({
				moderationId,
				targetType: 'comment',
				targetId: commentData.id,
			});
			window.dispatchEvent(new CustomEvent('commentAdded', { detail: { commentsId } }));
		} catch (err) {
			console.error('Error unblocking comment:', err);
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleBlockUser() {
		if (!moderationId || !libs || !user?.owner) return;
		setIsUpdating(true);
		try {
			await libs.addModerationEntry({
				moderationId,
				targetType: 'profile',
				targetId: commentData.creator,
				status: 'blocked',
				targetContext: commentsId,
				moderator: user.owner,
				reason: 'default',
			});
			window.dispatchEvent(new CustomEvent('commentAdded', { detail: { commentsId } }));
		} catch (err) {
			console.error('Error blocking user:', err);
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleUnblockUser() {
		if (!moderationId || !libs || !user?.owner) return;
		setIsUpdating(true);
		try {
			await libs.removeModerationEntry({
				moderationId,
				targetType: 'profile',
				targetId: commentData.creator,
			});
			window.dispatchEvent(new CustomEvent('commentAdded', { detail: { commentsId } }));
		} catch (err) {
			console.error('Error unblocking user:', err);
		} finally {
			setIsUpdating(false);
		}
	}

	// Profile click is a no-op in the widget (no navigation)
	function handleProfileClick() {
		// no-op: no router available in widget context
	}

	// ---------------------------------------------------------------------------
	// Render
	// ---------------------------------------------------------------------------

	const replyCount = commentData.replies?.length || 0;

	return (
		<>
			{/* Main comment row */}
			<CommentWrapper $level={level} $isPinned={isPinned} $isBlocked={isBlocked}>
				{(isUpdating || isEditSubmitting) && (
					<LoadingOverlay>
						<Spinner />
					</LoadingOverlay>
				)}

				<AvatarWrapper onClick={handleProfileClick}>
					<Avatar profile={profile} isLoading={isLoadingProfile} size={32} />
				</AvatarWrapper>

				<Content>
					{/* Header row */}
					<Meta>
						<Username onClick={handleProfileClick}>
							{isLoadingProfile ? '...' : profile?.displayName || profile?.id || '?'}
						</Username>

						{isPinned && <Badge $variant="pin">Pinned</Badge>}
						{isEditMode && <Badge $variant="edit">Editing</Badge>}
						{isHidden && <Badge $variant="hidden">Hidden</Badge>}
						{isCommentBlocked && <Badge $variant="hidden">Blocked Comment</Badge>}
						{!isCommentBlocked && isUserBlocked && <Badge $variant="hidden">Blocked User</Badge>}

						<DateText>{formatDate(commentData.dateCreated)}</DateText>

						{commentData.updatedAt && commentData.updatedAt !== commentData.dateCreated && (
							<EditedText title={`Edited: ${formatDate(commentData.updatedAt)}`}>(edited)</EditedText>
						)}
					</Meta>

					{/* Body: edit mode or read mode */}
					{isEditMode ? (
						<EditContainer>
							<CommentAdd
								commentsId={commentsId}
								parentId={commentData.parentId}
								initialContent={commentData.content}
								isEditMode={true}
								commentId={commentData.id}
								onCommentAdded={(updatedContent: string) => {
									setCommentData((prev: any) => ({ ...prev, content: updatedContent }));
									setIsEditMode(false);
								}}
								onSubmittingChange={setIsEditSubmitting}
								onCancel={() => setIsEditMode(false)}
							/>
						</EditContainer>
					) : (
						<Text>{commentData.content}</Text>
					)}

					{/* Action bar */}
					{!isEditMode && (
						<>
							<Actions>
								{/* Reply — any logged-in user */}
								{walletAddress && (
									<ActionButton onClick={() => setShowReplyEditor((v) => !v)}>
										{showReplyEditor ? 'Cancel' : 'Reply'}
									</ActionButton>
								)}

								{/* Edit — own comment */}
								{isOwnComment && <ActionButton onClick={() => setIsEditMode(true)}>Edit</ActionButton>}
							</Actions>

							{/* Moderator action bar */}
							{isModerator && (
								<MenuBar>
									{canPin && <ActionButton onClick={handlePinToggle}>{isPinned ? 'Unpin' : 'Pin'}</ActionButton>}

									{isCommentBlocked ? (
										<ActionButton onClick={handleUnblockComment}>Unblock Comment</ActionButton>
									) : (
										<DangerButton onClick={handleBlockComment}>Block Comment</DangerButton>
									)}

									{isUserBlocked ? (
										<ActionButton onClick={handleUnblockUser}>Unblock User</ActionButton>
									) : (
										<DangerButton onClick={handleBlockUser}>Block User</DangerButton>
									)}
								</MenuBar>
							)}
						</>
					)}
				</Content>
			</CommentWrapper>

			{/* Inline reply editor */}
			{showReplyEditor && (
				<ReplyEditorWrapper $level={level}>
					<CommentAdd
						commentsId={commentsId}
						parentId={commentData.id}
						onCommentAdded={() => setShowReplyEditor(false)}
					/>
				</ReplyEditorWrapper>
			)}

			{/* Replies toggle */}
			{replyCount > 0 && (
				<RepliesToggle $level={level} onClick={() => setShowReplies((v) => !v)}>
					{showReplies ? 'Hide' : 'View'} {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
				</RepliesToggle>
			)}

			{/* Nested replies */}
			{showReplies && replyCount > 0 && (
				<RepliesList>
					{commentData.replies.map((reply: any, index: number) => (
						<Comment key={`${reply.id}-${index}`} data={reply} level={level + 1} commentsId={commentsId} />
					))}
				</RepliesList>
			)}
		</>
	);
}
