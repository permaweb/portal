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
	const [commentData, setCommentData] = React.useState(data);
	const [isUpdating, setIsUpdating] = React.useState(false);
	const { profile: user, libs } = usePermawebProvider();

	const canEditCommentStatus = user?.owner && ['Admin', 'Moderator'].some((r) => user?.roles?.includes(r));
	const canRemoveComment =
		(user?.owner && ['Admin', 'Moderator'].some((r) => user?.roles?.includes(r))) ||
		commentData.creator === user?.owner;
	const canEditComment = user?.owner && commentData.creator === user?.owner;
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

	const menuEntries: MenuItem[] = [];

	if (canEditComment) {
		menuEntries.push({
			icon: ICONS.edit,
			label: 'Edit Comment',
			onClick: () => {}, // TODO: implement edit functionality
		});
		// Add spacer after edit if there are other options
		if (canEditCommentStatus || canRemoveComment) {
			menuEntries.push({ type: 'spacer' });
		}
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
		<S.Wrapper status={commentData.status}>
			<S.Comment $level={level}>
				{isUpdating && (
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
					</S.Meta>
					<S.Text>{commentData.content}</S.Text>
					<ContextMenu entries={menuEntries} />
					<S.Actions>
						<S.Action onClick={() => setShowEditor(true)}>
							<ReactSVG src={ICONS.reply} />
							Reply
						</S.Action>
						{/* <S.Action><ReactSVG src={`img/icons/arrow_up.svg`} />Up</S.Action> */}
						{/* <S.Action><ReactSVG src={`img/icons/arrow_down.svg`} />Down</S.Action> */}
					</S.Actions>
				</S.Content>
			</S.Comment>
			{showEditor && <CommentAdd commentsId={commentsId} parentId={commentData.id} />}
		</S.Wrapper>
	);
}
