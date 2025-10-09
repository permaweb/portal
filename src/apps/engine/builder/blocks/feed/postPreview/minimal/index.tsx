import React from 'react';
import { NavLink } from 'react-router-dom';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Placeholder from 'engine/components/placeholder';
import useNavigate from 'engine/helpers/preview';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, getRedirect, urlify } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function PostPreview_Minimal(props: any) {
	const navigate = useNavigate();
	const { profile: user } = usePermawebProvider();
	const { portal } = usePortalProvider();
	const { layout, post } = props;
	const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || null);

	const canEditPost = user?.owner && user?.roles && ['Admin', 'Moderator'].some((r) => user.roles.includes(r));

	// Check if post creator is the portal itself
	const isPortalCreator = post?.creator === portal?.id;
	const displayName = isPortalCreator ? portal?.name : profile?.displayName;
	const displayThumbnail = isPortalCreator ? portal?.logo : profile?.thumbnail;

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
								<NavLink to={getRedirect(`feed/category/${category.id}`)}>
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
						<S.SourceIcon
							className="loadingAvatar"
							onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
							src={
								!isLoadingProfile && displayThumbnail && checkValidAddress(displayThumbnail)
									? getTxEndpoint(displayThumbnail)
									: ICONS.user
							}
						/>
						<S.Author
							onClick={() =>
								!isPortalCreator &&
								navigate(getRedirect(`author/${profile.username ? urlify(profile.username) : profile.id}`))
							}
							style={{ cursor: isPortalCreator ? 'default' : 'pointer' }}
						>
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
			</S.Content>
		</S.Post>
	);
}
