import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType, PortalAssetType, PortalCategoryType } from 'helpers/types';

import * as S from './styles';

const FALLBACK_DATA = {
	category: 'Investigative series',
};

export default function CategorySpotlightBlock(_props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();

	const [category, setCategory] = React.useState<PortalCategoryType | null>(null);
	const [posts, setPosts] = React.useState<PortalAssetType[]>([]);

	React.useEffect(() => {
		if (portalProvider.current?.categories && portalProvider.current.categories.length > 0) {
			// Get first category for demo
			const cat = portalProvider.current.categories[0];
			setCategory(cat);

			// Filter posts by this category
			if (portalProvider.current?.assets) {
				const categoryPosts = portalProvider.current.assets
					.filter((asset) => asset.metadata?.categories?.some((c) => c.id === cat.id))
					.slice(0, 6);
				setPosts(categoryPosts);
			}
		}
	}, [portalProvider.current?.categories, portalProvider.current?.assets]);

	const categoryName = category?.name || FALLBACK_DATA.category;

	// Split posts: 2 list items on left, 1 featured on right
	const listPosts = posts.slice(0, 3);
	const featuredPost = posts.length > 0 ? posts[0] : null;

	return (
		<S.Wrapper>
			<S.Header>
				<h2>{categoryName}</h2>
			</S.Header>
			<S.Content>
				<S.LeftColumn>
					{listPosts.map((post, index) => {
						const postTitle = post?.name || 'Title';
						const postThumbnail = post?.metadata?.thumbnail;

						return (
							<S.ListPost key={post.id}>
								{postThumbnail && (
									<S.ListPostImage>
										<img src={getTxEndpoint(postThumbnail)} alt={postTitle} />
										<S.ListPostNumber>{index + 1}</S.ListPostNumber>
									</S.ListPostImage>
								)}
								<S.ListPostContent>
									<S.ListPostInfo>
										<S.ListPostTitle>{postTitle}</S.ListPostTitle>
										{/* <S.PostCreator>BY {postCreator}</S.PostCreator> */}
									</S.ListPostInfo>
								</S.ListPostContent>
							</S.ListPost>
						);
					})}
				</S.LeftColumn>
				<S.RightColumn>
					{featuredPost && (
						<S.FeaturedPost>
							{featuredPost.metadata?.thumbnail && (
								<S.PostImage>
									<img src={getTxEndpoint(featuredPost.metadata.thumbnail)} alt={featuredPost.name} />
								</S.PostImage>
							)}
							<S.PostOverlay>
								<S.PostTitle>
									<span>{featuredPost.name || 'Title'}</span>
								</S.PostTitle>
								{/* <S.PostCreator>BY {featuredPost.creator || ''}</S.PostCreator> */}
							</S.PostOverlay>
						</S.FeaturedPost>
					)}
				</S.RightColumn>
			</S.Content>
		</S.Wrapper>
	);
}
