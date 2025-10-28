import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType, PortalAssetType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const FALLBACK_DATA = {
	category: 'Category',
	title: 'Title',
	description: 'Description',
};

export default function PostBlock(_props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [post, setPost] = React.useState<PortalAssetType | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.assets && portalProvider.current.assets.length > 0) {
			setPost(portalProvider.current.assets[0]);
		}
	}, [portalProvider.current?.assets]);

	const postTitle = post?.name || FALLBACK_DATA.title;
	const postDescription = post?.metadata?.description || FALLBACK_DATA.description;
	const postThumbnail = post?.metadata?.thumbnail;

	return (
		<S.Wrapper>
			<S.PostWrapper>
				<S.PostContent>
					<S.PostInfo>
						<h1>{postTitle}</h1>
						<p>{postDescription}</p>
					</S.PostInfo>

					{postThumbnail && (
						<S.PostImage>
							<img src={getTxEndpoint(postThumbnail)} alt={postTitle} />
						</S.PostImage>
					)}

					<S.ContentPlaceholderSection>
						<span>{`${language.postContentInfo}.`}</span>
						<S.ContentPlaceholderLine flex={0.95} />
						<S.ContentPlaceholderLine flex={0.75} />
						<S.ContentPlaceholderLine flex={0.85} />
						<S.ContentPlaceholderLine flex={0.65} />
					</S.ContentPlaceholderSection>
					<S.ContentPlaceholderSection>
						<S.ContentPlaceholderLine flex={0.85} />
						<S.ContentPlaceholderLine flex={0.75} />
						<S.ContentPlaceholderLine flex={0.85} />
						<S.ContentPlaceholderLine flex={0.65} />
					</S.ContentPlaceholderSection>
					<S.ContentPlaceholderSection>
						<S.ContentPlaceholderLine flex={0.85} />
						<S.ContentPlaceholderLine flex={0.75} />
						<S.ContentPlaceholderLine flex={0.85} />
						<S.ContentPlaceholderLine flex={0.65} />
					</S.ContentPlaceholderSection>
					<S.ContentPlaceholderSection>
						<S.ContentPlaceholderLine flex={0.85} />
						<S.ContentPlaceholderLine flex={0.75} />
						<S.ContentPlaceholderLine flex={0.85} />
						<S.ContentPlaceholderLine flex={0.65} />
					</S.ContentPlaceholderSection>
				</S.PostContent>
			</S.PostWrapper>
		</S.Wrapper>
	);
}
