import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import Avatar from 'engine/components/avatar';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Placeholder from 'engine/components/placeholder';
import { useModeration } from 'engine/hooks/moderation';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getRedirect, urlify } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import CommentAdd from '../commentAdd';

import * as S from './styles';

export default function Comment(props: any) {
	const navigate = useNavigate();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { data, level, commentsId, postAuthorId } = props;
	const { profile, isLoading: isLoadingProfile } = useProfile(data?.creator || '');
	const [showEditor, setShowEditor] = React.useState(false);
	const [showReplies, setShowReplies] = React.useState(false);
	const [isEditMode, setIsEditMode] = React.useState(false);
	const [commentData, setCommentData] = React.useState(data);
	const [isUpdating, setIsUpdating] = React.useState(false);
	const [isEditSubmitting, setIsEditSubmitting] = React.useState(false);
	const [showPortalMenu, setShowPortalMenu] = React.useState(false);
	const prevReplyCountRef = React.useRef(data?.replies?.length || 0);
	const { profile: user, libs } = usePermawebProvider();
	const { portal, portalId } = usePortalProvider();
	const moderationId = portal?.Moderation;
	const { blockedComments, blockedUsers } = useModeration();

	const isCommentBlocked = blockedComments.has(commentData.id);
	const isUserBlocked = blockedUsers.has(commentData.creator);

	React.useEffect(() => {
		setCommentData(data);
		const currentReplyCount = data?.replies?.length || 0;
		if (currentReplyCount > prevReplyCountRef.current) {
			setShowReplies(true);
		}
		prevReplyCountRef.current = currentReplyCount;
	}, [data]);

	const userIsAdmin = ['Admin'].some((r) => user?.roles?.includes(r));
	const userIsModerator = ['Moderator'].some((r) => user?.roles?.includes(r));
	// const userIsContributor = ['Contributor'].some((r) => user?.roles?.includes(r));

	const commentAuthorPortalUser = portal?.Users?.find((u: any) => u.address === commentData.creator);
	const commentAuthorIsAdmin = commentAuthorPortalUser?.roles?.includes('Admin');
	const commentAuthorIsModerator = commentAuthorPortalUser?.roles?.includes('Moderator');
	const commentAuthorIsContributor = commentAuthorPortalUser?.roles?.includes('Contributor');
	const commentAuthorIsActiveUser = commentData.creator === user?.owner;
	const commentAuthorIsPostAuthor = postAuthorId === profile?.id;
	const commentAuthorIsPortal = commentData.creator === portalId;
	const shouldHighlightAuthor = commentAuthorIsPostAuthor || commentAuthorIsPortal;
	const canPinComment =
		(userIsAdmin || userIsModerator) && (!commentData.parentId || commentData.depth === 0 || commentData.depth === -1);

	async function handleUserBlock() {
		if (!moderationId || !libs || !commentData.creator || !user?.owner) return;

		setIsUpdating(true);
		try {
			const result = await libs.addModerationEntry({
				moderationId: moderationId,
				targetType: 'profile',
				targetId: commentData.creator,
				status: 'blocked',
				targetContext: commentsId,
				moderator: user.owner,
				reason: 'default',
			});
			console.log('User blocked:', commentData.creator, result);
			window.dispatchEvent(
				new CustomEvent('commentAdded', {
					detail: { commentsId },
				})
			);
		} catch (error) {
			console.error('Error blocking user:', error);
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleCommentBlock() {
		if (!moderationId || !libs || !commentData.id || !user?.owner) return;

		setIsUpdating(true);
		try {
			console.log('Blocking comment:', {
				moderationId,
				targetType: 'comment',
				targetId: commentData.id,
				status: 'blocked',
				targetContext: commentsId,
				moderator: user.owner,
				reason: 'default',
			});
			const result = await libs.addModerationEntry({
				moderationId: moderationId,
				targetType: 'comment',
				targetId: commentData.id,
				status: 'blocked',
				targetContext: commentsId,
				moderator: user.owner,
				reason: 'default',
			});
			console.log('Block result:', result);
			window.dispatchEvent(
				new CustomEvent('commentAdded', {
					detail: { commentsId },
				})
			);
		} catch (error) {
			console.error('Error blocking comment:', error);
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleUserUnblock() {
		if (!moderationId || !libs || !commentData.creator || !user?.owner) return;

		setIsUpdating(true);
		try {
			const result = await libs.removeModerationEntry({
				moderationId: moderationId,
				targetType: 'profile',
				targetId: commentData.creator,
			});
			console.log('User unblocked:', commentData.creator, result);
			window.dispatchEvent(
				new CustomEvent('commentAdded', {
					detail: { commentsId },
				})
			);
		} catch (error) {
			console.error('Error unblocking user:', error);
		} finally {
			setIsUpdating(false);
		}
	}

	async function handleCommentUnblock() {
		if (!moderationId || !libs || !commentData.id || !user?.owner) return;

		setIsUpdating(true);
		try {
			const result = await libs.removeModerationEntry({
				moderationId: moderationId,
				targetType: 'comment',
				targetId: commentData.id,
			});
			console.log('Comment unblocked:', commentData.id, result);
			window.dispatchEvent(
				new CustomEvent('commentAdded', {
					detail: { commentsId },
				})
			);
		} catch (error) {
			console.error('Error unblocking comment:', error);
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

	function handleProfileClick() {
		if (isLoadingProfile || !profile) return;

		if (commentAuthorIsAdmin || commentAuthorIsModerator || commentAuthorIsContributor) {
			navigate(getRedirect(`author/${profile.username ? urlify(profile.username) : profile.id}`));
		} else if (profile.portals && profile.portals.length > 0) {
			setShowPortalMenu(!showPortalMenu);
		} else {
			navigate(getRedirect(`author/${profile.username ? urlify(profile.username) : profile.id}`));
		}
	}

	const portalMenuEntries: MenuItem[] = React.useMemo(() => {
		if (!profile?.portals || profile.portals.length === 0) return [];
		return profile.portals.map((portal: any) => ({
			icon: ICONS.portal,
			label: portal.name || portal.id,
			onClick: () => {
				window.open(`https://portal.arweave.net/#/${portal.id}`, '_blank');
				setShowPortalMenu(false);
			},
		}));
	}, [profile]);

	const menuEntries: MenuItem[] = [];

	if ((commentAuthorIsActiveUser || (userIsAdmin && commentAuthorIsPortal)) && !isEditMode) {
		menuEntries.push({
			icon: ICONS.edit,
			label: 'Edit Comment',
			onClick: () => {
				setIsEditMode(true);
				// setEditContent(commentData.content);
			},
		});
		if (canPinComment) {
			menuEntries.push({ type: 'spacer' });
		}
	}

	if (canPinComment) {
		menuEntries.push({
			icon: commentData.depth === -1 ? ICONS.unpin : ICONS.pin,
			label: commentData.depth === -1 ? 'Unpin Comment' : 'Pin Comment',
			onClick: handlePinComment,
		});
	}

	if (userIsAdmin || userIsModerator) {
		if (isCommentBlocked) {
			menuEntries.push({
				icon: ICONS.commentUnblock,
				label: 'Unblock Comment',
				onClick: handleCommentUnblock,
			});
		} else {
			menuEntries.push({
				icon: ICONS.commentBlock,
				label: 'Block Comment',
				onClick: handleCommentBlock,
			});
		}

		if (isUserBlocked) {
			menuEntries.push({
				icon: ICONS.userUnblock,
				label: 'Unblock User',
				onClick: handleUserUnblock,
			});
		} else {
			menuEntries.push({
				icon: ICONS.userBlock,
				label: 'Block User',
				onClick: handleUserBlock,
			});
		}
	}

	if (!commentData) return null;
	const hasModPermission = user?.owner && user?.roles && ['Admin', 'Moderator'].some((r) => user.roles?.includes(r));
	if (commentData.status !== 'active' && !hasModPermission) return null;

	return (
		<>
			<S.Comment $level={level} $status={commentData.status}>
				{(isUpdating || isEditSubmitting) && (
					<S.LoadingOverlay>
						<S.Spinner />
					</S.LoadingOverlay>
				)}
				<S.AvatarWrapper onClick={handleProfileClick}>
					<Avatar profile={profile} isLoading={isLoadingProfile} />
				</S.AvatarWrapper>
				<S.Content>
					<S.Meta>
						<S.UsernameWrapper>
							<S.Username isPostAuthor={shouldHighlightAuthor} onClick={handleProfileClick}>
								{isLoadingProfile ? <Placeholder /> : profile?.displayName}
								{(commentAuthorIsAdmin || commentAuthorIsPortal) && (
									<ReactSVG src={ICONS.admin} title={language.admin} />
								)}
								{commentAuthorIsModerator && <ReactSVG src={ICONS.moderator} title={language.moderator} />}
								{commentAuthorIsContributor && <ReactSVG src={ICONS.contributor} title={language.contributor} />}
							</S.Username>
							{portalMenuEntries.length > 0 && (
								<ContextMenu entries={portalMenuEntries}>
									<S.PortalMenuTrigger $active={showPortalMenu}>
										<ReactSVG src={ICONS.ENGINE.menu} />
									</S.PortalMenuTrigger>
								</ContextMenu>
							)}
						</S.UsernameWrapper>
						{isEditMode && (
							<S.EditingIndicator>
								<ReactSVG src={ICONS.edit} />
								Editing
							</S.EditingIndicator>
						)}
						{commentData.depth === -1 && (
							<S.PinnedIndicator>
								<ReactSVG src={ICONS.pin} />
								Pinned
							</S.PinnedIndicator>
						)}
						{commentData.status !== 'active' && (
							<S.HiddenIndicator>
								<ReactSVG src={ICONS.hide} />
								Hidden
							</S.HiddenIndicator>
						)}
						{isCommentBlocked && (
							<S.HiddenIndicator>
								<ReactSVG src={ICONS.close} />
								Blocked Comment
							</S.HiddenIndicator>
						)}
						{!isCommentBlocked && isUserBlocked && (
							<S.HiddenIndicator>
								<ReactSVG src={ICONS.close} />
								Blocked User
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
									// setEditContent(commentData.content);
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
						<Comment
							key={`${reply.id}-${index}`}
							data={reply}
							level={parseInt(level) + 1}
							commentsId={commentsId}
							postAuthorId={postAuthorId}
						/>
					))}
				</>
			)}
		</>
	);
}
