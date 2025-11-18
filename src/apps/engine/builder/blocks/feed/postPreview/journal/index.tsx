import React from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from 'engine/components/avatar';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Placeholder from 'engine/components/placeholder';
import useNavigate from 'engine/helpers/preview';
import { useComments } from 'engine/hooks/comments';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, getRedirect, urlify } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function PostPreview_Journal(props: any) {
	const navigate = useNavigate();
	const { profile: user } = usePermawebProvider();
	const { portal } = usePortalProvider();
	const { layout, post } = props;
	const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || null);
	const { comments, isLoading: isLoadingComments, error: errorComments } = useComments(post?.id || null, true);

	const roles = Array.isArray(user?.roles)
		? user.roles
		: user?.roles
		? [user.roles] // if it’s a single string
		: [];
	const canEditPost = user?.owner && roles && ['Admin', 'Moderator'].some((r) => roles?.includes(r));

	// Check if post creator is the portal itself
	const isPortalCreator = post?.creator === portal?.Id;
	const displayName = isPortalCreator ? portal?.Name : profile?.displayName;
	const displayThumbnail = isPortalCreator
		? portal?.Icon && checkValidAddress(portal?.Icon)
			? portal?.Icon
			: ICONS.portal
		: profile?.thumbnail;

	const menuEntries: MenuItem[] = [];

	if (canEditPost) {
		menuEntries.push({
			icon: ICONS.edit,
			label: 'Edit Post',
			action: 'editPost',
			postId: post?.id,
		});
	}

	const Comment = (data: any) => {
		const { data: comment } = data;
		const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(comment.creator || null);

		return (
			<S.Comment>
				<S.CommentHeader>
					<Avatar profile={profile} isLoading={isLoadingProfile} size={18} />
					<S.Username>{profile?.displayName || '[[displayName]]'}</S.Username>
					<S.Date>{`${new Date(comment?.dateCreated || 'now').toLocaleDateString()} ${new Date(
						comment.dateCreated
					).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</S.Date>
				</S.CommentHeader>
				<S.CommentText>{comment?.content || '[[content]]'}</S.CommentText>
			</S.Comment>
		);
	};

	return (
		<S.Post $layout={layout && layout.card}>
			<ContextMenu entries={menuEntries} />
			<S.Categories>
				{post ? (
					post?.metadata?.categories?.map((category: any, index: number) => {
						return (
							<React.Fragment key={index}>
								<NavLink to={getRedirect(`feed/category/${category.name}`)}>
									<S.Category>{category.name}</S.Category>
								</NavLink>
								{index < post.metadata.categories.length - 1 && <>,&nbsp;</>}
							</React.Fragment>
						);
					})
				) : (
					<Placeholder />
				)}
			</S.Categories>
			<S.Content>
				<S.SideA>
					<S.TitleWrapper>
						<h2
							className={!post ? 'loadingPlaceholder' : ''}
							onClick={(e) => navigate(getRedirect(`post/${post?.metadata?.url ?? post?.id}`))}
						>
							<span>{post ? post?.name : <Placeholder width="180" />}</span>
						</h2>
						{post?.metadata?.status === 'draft' && (
							<S.DraftIndicator>
								<S.DraftDot />
								Draft
							</S.DraftIndicator>
						)}
					</S.TitleWrapper>
					<p>{post?.metadata.description}</p>
					<S.Meta>
						<S.Author
							onClick={() =>
								!isPortalCreator &&
								navigate(getRedirect(`author/${profile.username ? urlify(profile.username) : profile.id}`))
							}
							style={{ cursor: isPortalCreator ? 'default' : 'pointer' }}
						>
							<Avatar
								src={
									displayThumbnail && checkValidAddress(displayThumbnail) ? getTxEndpoint(displayThumbnail) : undefined
								}
								profile={isPortalCreator ? { id: portal?.Id } : profile}
								isLoading={isLoadingProfile}
								size={20}
								hoverable={true}
							/>
							{isLoadingProfile ? <Placeholder width="100" /> : displayName}
						</S.Author>
						<S.Date>
							{isLoadingProfile ? (
								<Placeholder width="120" />
							) : (
								`${new Date(Number(post.metadata?.releaseDate)).toLocaleDateString()} ${new Date(
									Number(post.metadata?.releaseDate)
								).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
							)}
						</S.Date>
					</S.Meta>
				</S.SideA>
				{post?.metadata?.thumbnail && (
					<S.SideB>
						<img
							className="loadingThumbnail"
							onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
							onClick={() => navigate(getRedirect(`post/${post?.metadata?.url ?? post?.id}`))}
							src={post?.metadata?.thumbnail ? getTxEndpoint(post.metadata.thumbnail) : ''}
						/>
					</S.SideB>
				)}
			</S.Content>
			{comments?.length > 0 && (
				<S.Comments>
					<h3>Comments</h3>
					{comments &&
						comments.map((comment: any, index: any) => {
							return <Comment key={index} data={comment} commentsId={post?.metadata?.comments} />;
						})}
				</S.Comments>
			)}
		</S.Post>
	);
}
