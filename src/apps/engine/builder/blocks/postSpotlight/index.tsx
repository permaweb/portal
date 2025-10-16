import React from 'react';
import { NavLink } from 'react-router-dom';
import Placeholder from 'engine/components/placeholder';
import { usePost, usePosts } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, getRedirect } from 'helpers/utils';

import * as S from './styles';

export default function PostSpotlight(props: any) {
	const { txId } = props;
	const { Posts: allPosts, isLoading: isLoadingPosts } = usePosts();

	// Use provided txId for fetching specific post
	var { post: fetchedPost, isLoading: isLoadingPost } = usePost(txId || null);

	// Get the latest post from the posts list if no txId is provided
	let post = fetchedPost;
	let isLoading = isLoadingPost;

	if (!txId && allPosts && Array.isArray(allPosts) && allPosts.length > 0) {
		// Create a copy and sort by dateCreated to get the latest post
		const sortedPosts = [...allPosts].sort((a: any, b: any) => {
			const dateA = Number(a.metadata?.releasedDate || a.dateCreated || 0);
			const dateB = Number(b.metadata?.releasedDate || b.dateCreated || 0);
			return dateB - dateA;
		});
		post = sortedPosts[0];
		isLoading = isLoadingPosts;
	} else if (!txId) {
		isLoading = isLoadingPosts;
	}

	const { profile, isLoading: isLoadingProfile } = useProfile(post?.creator || '');

	// If there's no post to display and we're not loading, show a placeholder
	if (!isLoading && !post) {
		return (
			<S.Wrapper id="PostSpotlight">
				<div style={{ padding: '20px', textAlign: 'center' }}>
					<p>No posts available</p>
				</div>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper id="PostSpotlight">
			<NavLink to={getRedirect(`post/${post?.id}`)} className={isLoading || !post ? 'disabledLink' : ''}>
				<S.Thumbnail>
					<img
						className="loadingThumbnail"
						onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
						src={
							checkValidAddress(post?.metadata?.thumbnail)
								? getTxEndpoint(post?.metadata?.thumbnail)
								: post?.metadata?.thumbnail
						}
					/>
				</S.Thumbnail>
				<S.Data>
					<S.Type className={isLoading ? 'loadingPlaceholder' : ''}>
						{isLoading ? (
							<>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</>
						) : (
							post?.metadata?.categories?.[0]?.name
						)}
					</S.Type>
					<h2>
						<span className={isLoading ? 'loadingPlaceholder' : ''}>
							{isLoading ? (
								<>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</>
							) : (
								post?.name
							)}
						</span>
					</h2>
					<S.Meta>
						<img
							className="loadingAvatar"
							onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
							src={checkValidAddress(profile?.thumbnail) ? getTxEndpoint(profile?.thumbnail) : ICONS.user}
						/>
						By
						<span>{isLoadingProfile ? <Placeholder width="60" /> : profile?.displayName}</span>
						<span>
							·{' '}
							{isLoading ? (
								<Placeholder width="90" />
							) : (
								new Date(Number(post?.dateCreated)).toLocaleString('en-US', {
									day: '2-digit',
									month: '2-digit',
									year: '2-digit',
									hour: '2-digit',
									minute: '2-digit',
									hour12: false,
								})
							)}
						</span>
					</S.Meta>
				</S.Data>
			</NavLink>
		</S.Wrapper>
	);
}
