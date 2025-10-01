import React from 'react';
import { NavLink } from 'react-router-dom';
import Placeholder from 'engine/components/placeholder';
import useNavigate from 'engine/helpers/preview';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';
import { getTxEndpoint } from 'helpers/endpoints';
import { ICONS } from 'helpers/config';
import { usePermawebProvider } from 'providers/PermawebProvider';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';

import * as S from './styles';

export default function PostPreview_Minimal(props: any) {
	const navigate = useNavigate();
	const { profile: user } = usePermawebProvider();
	const { portal } = usePortalProvider();
	const { layout, post } = props;
	const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || null);

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
							src={!isLoadingProfile && profile?.thumbnail ? getTxEndpoint(profile.thumbnail) : ''}
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
			</S.Content>
		</S.Post>
	);
}
