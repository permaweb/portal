import React from 'react';
import { NavLink } from 'react-router-dom';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Placeholder from 'engine/components/placeholder';
import useNavigate from 'engine/helpers/preview';
import { useComments } from 'engine/hooks/comments';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function PostPreview_Journal(props: any) {
	const navigate = useNavigate();
	const { profile: user } = usePermawebProvider();
	const { portal } = usePortalProvider();
	const { layout, post } = props;
	const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || null);
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
		<S.Post $layout={layout && layout.card}>
			<ContextMenu entries={menuEntries} />
			<S.Categories>
				{post ? (
					post?.metadata?.categories?.map((category: any, index: number) => {
						return (
							<React.Fragment key={index}>
								<NavLink to={`/feed/category/${category.id}`}>
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
						<h2 className={!post ? 'loadingPlaceholder' : ''} onClick={(e) => navigate(`/post/${post?.id}`)}>
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
						<S.SourceIcon
							className="loadingAvatar"
							onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
							src={
								!isLoadingProfile && profile?.thumbnail && checkValidAddress(profile.thumbnail)
									? getTxEndpoint(profile.thumbnail)
									: ICONS.user
							}
						/>
						<S.Author onClick={() => navigate(`/user/${profile.id}`)}>
							{isLoadingProfile ? <Placeholder width="100" /> : profile?.displayName}
						</S.Author>
						<S.Date>
							{isLoadingProfile ? (
								<Placeholder width="120" />
							) : (
								`${new Date(Number(post.dateCreated)).toLocaleDateString()} ${new Date(
									Number(post.dateCreated)
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
							onClick={() => navigate(`/post/${post?.id}`)}
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
