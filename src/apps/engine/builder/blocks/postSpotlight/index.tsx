import React from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from 'engine/components/avatar';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import ModalPortal from 'engine/components/modalPortal';
import Placeholder from 'engine/components/placeholder';
import { usePost, usePosts } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { SelectOptionType } from 'helpers/types';
import { checkValidAddress, getRedirect } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function PostSpotlight(props: any) {
	const { txId, onSetPost } = props;
	const { profile: user } = usePermawebProvider();
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

	const [showSetPostModal, setShowSetPostModal] = React.useState(false);
	const [selectedPost, setSelectedPost] = React.useState<SelectOptionType | null>(null);
	const [filterText, setFilterText] = React.useState('');

	const roles = Array.isArray(user?.roles) ? user.roles : user?.roles ? [user.roles] : [];
	const isAdmin = user?.owner && roles && ['Admin', 'Moderator'].some((r) => roles?.includes(r));

	const postOptions: SelectOptionType[] = React.useMemo(() => {
		if (!allPosts || !Array.isArray(allPosts)) return [];
		return allPosts.map((p: any) => ({
			id: p.id,
			label: p.name || p.id,
		}));
	}, [allPosts]);

	const filteredOptions = React.useMemo(() => {
		if (!filterText) return postOptions;
		return postOptions.filter((o) => o.label.toLowerCase().includes(filterText.toLowerCase()));
	}, [postOptions, filterText]);

	React.useEffect(() => {
		if (showSetPostModal && post && postOptions.length > 0 && !selectedPost) {
			const currentOption = postOptions.find((opt) => opt.id === post.id);
			if (currentOption) setSelectedPost(currentOption);
		}
	}, [showSetPostModal]);

	const handleSetPost = () => {
		if (selectedPost && onSetPost) {
			onSetPost(selectedPost.id);
		}
		setShowSetPostModal(false);
		setFilterText('');
	};

	const handleCloseModal = () => {
		setShowSetPostModal(false);
		setFilterText('');
	};

	const menuEntries: MenuItem[] = [];
	if (isAdmin) {
		menuEntries.push({
			icon: ICONS.featuredPost,
			label: 'Set post',
			onClick: () => setShowSetPostModal(true),
		});
	}

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
		<>
			<S.Wrapper id="PostSpotlight">
				{menuEntries.length > 0 && (
					<S.MenuWrapper onClick={(e) => e.preventDefault()}>
						<ContextMenu entries={menuEntries} />
					</S.MenuWrapper>
				)}
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
							<Avatar profile={profile} isLoading={isLoadingProfile} size={18} />
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
			{showSetPostModal && (
				<ModalPortal>
					<S.ModalOverlay onClick={handleCloseModal}>
						<S.ModalContainer onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<span>Set Spotlight Post</span>
								<S.ModalClose onClick={handleCloseModal}>×</S.ModalClose>
							</S.ModalHeader>
							<S.ModalContent>
								<S.ModalLabel>Select a post</S.ModalLabel>
								<S.ModalFilterInput
									type="text"
									placeholder="Filter posts..."
									value={filterText}
									onChange={(e) => setFilterText(e.target.value)}
								/>
								<S.ModalSelect
									value={selectedPost?.id || ''}
									onChange={(e) => {
										const option = postOptions.find((o) => o.id === e.target.value);
										if (option) setSelectedPost(option);
									}}
								>
									<option value="" disabled>
										Select a post
									</option>
									{filteredOptions.map((option) => (
										<option key={option.id} value={option.id}>
											{option.label}
										</option>
									))}
								</S.ModalSelect>
								<S.ModalActions>
									<S.ModalButton onClick={handleCloseModal}>Cancel</S.ModalButton>
									<S.ModalButtonPrimary onClick={handleSetPost} disabled={!selectedPost}>
										Set
									</S.ModalButtonPrimary>
								</S.ModalActions>
							</S.ModalContent>
						</S.ModalContainer>
					</S.ModalOverlay>
				</ModalPortal>
			)}
		</>
	);
}
