import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { getTxEndpoint } from 'helpers/endpoints';
import { PortalAssetType } from 'helpers/types';

import * as S from './styles';

const FALLBACK_DATA = {
	category: 'Category',
	title: `Post Title`,
	description: `Post Description`,
};

// TODO: Render based on layout prop
// TODO: Allow change layout
export default function FeedBlock(props: { block: any }) {
	const portalProvider = usePortalProvider();
	const [posts, setPosts] = React.useState<PortalAssetType[]>([]);

	React.useEffect(() => {
		if (portalProvider.current?.assets && portalProvider.current.assets.length > 0) {
			setPosts(portalProvider.current.assets);
		}
	}, [portalProvider.current?.assets]);

	const displayPost = posts.length > 0 ? posts[0] : null;
	const categoryName = displayPost?.metadata?.categories?.[0]?.name || FALLBACK_DATA.category;
	const postTitle = displayPost?.name || FALLBACK_DATA.title;
	const postDescription = displayPost?.metadata?.description || FALLBACK_DATA.description;
	const postThumbnail = displayPost?.metadata?.thumbnail;

	return (
		<S.Wrapper>
			<S.CategoryWrapper>
				<S.CategoryHeader>
					<p>{categoryName}</p>
				</S.CategoryHeader>
				<S.CategoryBody>
					<S.PostWrapper>
						<S.PostInfo>
							<p>{postTitle}</p>
							<span>{postDescription}</span>
						</S.PostInfo>
						{props.block?.layout === 'journal' && postThumbnail && (
							<S.PostImage>
								<img src={getTxEndpoint(postThumbnail)} alt={postTitle} />
							</S.PostImage>
						)}
					</S.PostWrapper>
				</S.CategoryBody>
			</S.CategoryWrapper>
		</S.Wrapper>
	);
}
