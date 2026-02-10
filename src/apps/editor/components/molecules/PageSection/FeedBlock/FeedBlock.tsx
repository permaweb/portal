import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType, PortalAssetType } from 'helpers/types';

import * as S from './styles';

const FALLBACK_DATA = {
	category: 'Category',
	title: 'Title',
	description: 'Description',
};

export default function FeedBlock(props: { index: number; block: PageBlockType }) {
	const portalProvider = usePortalProvider();

	const [posts, setPosts] = React.useState<PortalAssetType[]>([]);

	React.useEffect(() => {
		if (portalProvider.current?.assets && portalProvider.current.assets.length > 0) {
			setPosts(portalProvider.current.assets);
		}
	}, [portalProvider.current?.assets]);

	const displayPosts = posts.length > 0 ? posts.slice(0, 2) : [null, null];

	const categoryNames = displayPosts.map((post) => post?.metadata?.categories?.[0]?.name || FALLBACK_DATA.category);

	const currentLayout = props.block?.layout ?? 'blog';

	return (
		<S.Wrapper>
			<S.ContentWrapper layout={currentLayout}>
				{displayPosts.map((post, index) => {
					const categoryName = categoryNames[index];
					const postTitle = post?.name || FALLBACK_DATA.title;
					const postDescription = post?.metadata?.description || FALLBACK_DATA.description;
					const postThumbnail = post?.metadata?.thumbnail;

					const image = (
						<S.PostImage hasImage={!!postThumbnail}>
							{postThumbnail ? <img src={getTxEndpoint(postThumbnail)} alt={postTitle} /> : <span>Post Image</span>}
						</S.PostImage>
					);

					return (
						<S.CategoryWrapper key={index} layout={currentLayout}>
							<S.CategoryHeader layout={currentLayout}>
								<p>{categoryName}</p>
							</S.CategoryHeader>
							<S.CategoryBody>
								<S.PostWrapper>
									<S.PostInfo layout={currentLayout}>
										{props.block?.layout === 'blog' && image}
										<p>{postTitle}</p>
										{props.block?.layout !== 'blog' && <span>{postDescription}</span>}
									</S.PostInfo>
									{props.block?.layout === 'journal' && image}
								</S.PostWrapper>
							</S.CategoryBody>
						</S.CategoryWrapper>
					);
				})}
			</S.ContentWrapper>
		</S.Wrapper>
	);
}
