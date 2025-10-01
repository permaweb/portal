import React from 'react';
import { NavLink } from 'react-router-dom';
import useNavigate from 'engine/helpers/preview';
import { useComments } from 'engine/hooks/comments';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { getRedirect } from 'helpers/utils';
import * as S from './styles';

export default function PostPreview_Default(props: any) {
	const navigate = useNavigate();
	const { portal } = usePortalProvider();
	const { profile: user } = usePermawebProvider();
	const Layout = portal?.Layout;
	const { layout, post } = props;
	const { profile, isLoading: isLoadingProfile } = useProfile(post?.creator || null);
	const { comments, isLoading: isLoadingComments, error: errorComments } = useComments(post?.id || null, true);

	const canEditPost = user?.owner && user?.roles && ['Admin', 'Moderator'].some((r) => user.roles.includes(r));

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
					<S.Avatar>
						<img src={profile?.thumbnail ? getTxEndpoint(profile.thumbnail) : ''} />
					</S.Avatar>
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
		<S.Post $layout={Layout && Layout.card}>
			<ContextMenu entries={menuEntries} />
			<S.Categories>
				{post ? (
					post?.metadata?.categories?.map((category: any, index: number) => {
						return (
							<React.Fragment key={index}>
								<NavLink to={getRedirect(`feed/category/${category.id}`)}>
									<S.Category>{category.name}</S.Category>
								</NavLink>
								{index < post.metadata.categories.length - 1 && <>,&nbsp;</>}
							</React.Fragment>
						);
					})
				) : (
					<S.Category>Loading...</S.Category>
				)}
			</S.Categories>
			<S.Content>
				{post?.metadata?.thumbnail && (
					<img
						className="loadingThumbnail"
						onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
						onClick={() => navigate(getRedirect(`post/${post?.id}`))}
						src={post?.metadata?.thumbnail ? getTxEndpoint(post.metadata.thumbnail) : ''}
					/>
				)}
				<S.TitleWrapper>
					<h2 className={!post ? 'loadingPlaceholder' : ''} onClick={() => navigate(getRedirect(`post/${post?.id}`))}>
						<span>{post ? post?.name : 'Loading...'}</span>
					</h2>
					{post?.metadata?.status === 'draft' && (
						<S.DraftIndicator>
							<S.DraftDot />
							Draft
						</S.DraftIndicator>
					)}
				</S.TitleWrapper>
				<S.Meta>
					<S.SourceIcon
						className="loadingAvatar"
						onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
						src={profile?.thumbnail ? getTxEndpoint(profile.thumbnail) : ''}
					/>
					<S.Author onClick={() => navigate(getRedirect(`user/${profile.id}`))}>{profile?.displayName}</S.Author>
					<S.Date>
						{isLoadingProfile ? (
							<span>Loading...</span>
						) : (
							`${new Date(Number(post.dateCreated)).toLocaleDateString()} ${new Date(
								Number(post.dateCreated)
							).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
						)}
					</S.Date>
				</S.Meta>
				<p>{post?.metadata.description}</p>
			</S.Content>
			{comments?.length > 0 && (
				<S.Comments>
					<h3>Comments</h3>
					{comments &&
						comments.map((comment: any, index: any) => {
							return <Comment key={index} data={comment} />;
						})}
				</S.Comments>
			)}
		</S.Post>
	);
}
