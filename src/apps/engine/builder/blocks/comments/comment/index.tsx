import React from 'react';
import { ReactSVG } from 'react-svg';
import { usePermawebProvider } from 'providers/PermawebProvider';
import Placeholder from 'engine/components/placeholder';
import { useProfile } from 'engine/hooks/profiles';
import { ICONS_UI } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import CommentAdd from '../commentAdd';

import * as S from './styles';

export default function Comment(props: any) {
	const { data, level, commentsId } = props;
	const { profile, isLoading: isLoadingProfile } = useProfile(data?.creator || '');
	const [showEditor, setShowEditor] = React.useState(false);
	const [openMenu, setOpenMenu] = React.useState(false);
	const menuRef = React.useRef<HTMLDivElement>(null);
	const { profile: user, libs } = usePermawebProvider();

	const canEditCommentStatus = ['Admin', 'Moderator'].some((r) => user.roles.includes(r));
	const canRemoveComment = ['Admin', 'Moderator'].some((r) => user.roles.includes(r)) || data.creator === user.owner;
	const showMenu = canEditCommentStatus || canRemoveComment;

	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpenMenu(false);
			}
		}

		if (showMenu) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	}, [showMenu]);

	function handleUserMute() {
		console.log('Mute user: ', profile?.id);
	}

	function handleUserBlock() {
		console.log('Block user: ', profile?.id);
	}

	async function handleCommentRemove() {
		const removeId = await libs.removeComment({
			commentsId: commentsId,
			commentId: data.id,
		});
		console.log('removeId: ', removeId);
	}

	async function handleCommentStatus(status: string) {
		console.log('Block comment: ', commentsId);
		const updateId = await libs.updateCommentStatus({
			commentsId: commentsId,
			commentId: data.id,
			status: status,
		});
		console.log('updateId: ', updateId);
	}

	return data && (data.status === 'active' || canEditCommentStatus) ? (
		<S.Wrapper status={data.status}>
			<S.Comment $level={level}>
				<S.Avatar>
					<img
						className="loadingAvatar"
						onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
						src={!isLoadingProfile && profile?.thumbnail ? getTxEndpoint(profile.thumbnail) : null}
					/>
				</S.Avatar>
				<S.Content>
					<S.Meta>
						<S.Username>{isLoadingProfile ? <Placeholder /> : profile?.displayName}</S.Username>
						<S.Date>
							{!data?.dateCreated ? (
								<Placeholder />
							) : (
								new Date(data.dateCreated).toLocaleString('en-US', {
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
					<S.Text>{data.content}</S.Text>
					{showMenu && (
						<S.Menu ref={menuRef}>
							<S.IconWrapper onClick={() => setOpenMenu(!openMenu)}>
								<ReactSVG src={ICONS_UI.MENU} />
							</S.IconWrapper>
							{openMenu && (
								<S.MenuEntries>
									<S.MenuCategory>
										{canEditCommentStatus && (
											<S.MenuEntry
												onClick={() => handleCommentStatus(data.status === 'active' ? 'inactive' : 'active')}
											>
												<ReactSVG src={data.status === 'active' ? ICONS_UI.HIDE : ICONS_UI.SHOW} />
												{data.status === 'active' ? 'Hide Comment' : 'Unhide Comment'}
											</S.MenuEntry>
										)}
										{canRemoveComment && (
											<S.MenuEntry onClick={handleCommentRemove}>
												<ReactSVG src={ICONS_UI.REMOVE} />
												Remove Comment
											</S.MenuEntry>
										)}
									</S.MenuCategory>
									{/* <S.MenuCategory>
								<S.MenuEntry onClick={handleUserMute}>Mute User</S.MenuEntry>
								<S.MenuEntry onClick={handleUserBlock}>Block User</S.MenuEntry>
							</S.MenuCategory> */}
								</S.MenuEntries>
							)}
						</S.Menu>
					)}
					<S.Actions>
						<S.Action onClick={() => setShowEditor(true)}>
							<ReactSVG src={ICONS_UI.REPLY} />
							Reply
						</S.Action>
						{/* <S.Action><ReactSVG src={`img/icons/arrow_up.svg`} />Up</S.Action> */}
						{/* <S.Action><ReactSVG src={`img/icons/arrow_down.svg`} />Down</S.Action> */}
					</S.Actions>
				</S.Content>
			</S.Comment>
			{showEditor && <CommentAdd commentsId={commentsId} parentId={data.id} />}
		</S.Wrapper>
	) : null;
}
