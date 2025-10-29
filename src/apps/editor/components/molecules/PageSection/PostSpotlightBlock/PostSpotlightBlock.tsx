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

export default function PostSpotlightBlock(_props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();

	const [post, setPost] = React.useState<PortalAssetType | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.assets && portalProvider.current.assets.length > 0) {
			setPost(portalProvider.current.assets[0]);
		}
	}, [portalProvider.current?.assets]);

	const postCategory = post?.metadata?.categories?.[0].name || FALLBACK_DATA.category;
	const postTitle = post?.name || FALLBACK_DATA.title;
	const postThumbnail = post?.metadata?.thumbnail;

	return (
		<S.Wrapper>
			<S.PostWrapper>
				<S.PostContent>
					{postThumbnail && (
						<S.PostImage>
							<img src={getTxEndpoint(postThumbnail)} alt={postTitle} />
						</S.PostImage>
					)}
					<S.PostInfo>
						<p>{postCategory}</p>
						<h1>
							<span>{postTitle}</span>
						</h1>
					</S.PostInfo>
				</S.PostContent>
			</S.PostWrapper>
		</S.Wrapper>
	);
}
