import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { Types } from '@permaweb/libs';

import { AssetContent } from 'viewer/components/molecules/AssetContent';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Loader } from 'components/atoms/Loader';
import { URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalAssetType, PortalCategoryType } from 'helpers/types';
import { checkValidAddress, formatAddress, formatDate, getRedirect } from 'helpers/utils';
import { scrollTo } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Post() {
	const { postId } = useParams<{ postId?: string }>();

	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [post, setPost] = React.useState<PortalAssetType | null>(null);
	const [creator, setCreator] = React.useState<Types.ProfileType | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		scrollTo(0, 0, 'smooth');
	}, [postId]);

	React.useEffect(() => {
		(async function () {
			if (!post && postId && checkValidAddress(postId) && permawebProvider.libs) {
				setLoading(true);
				try {
					const fetchedPost = await permawebProvider.libs.getAtomicAsset(postId);
					setPost(fetchedPost);

					if (fetchedPost?.creator) {
						try {
							const fetchedCreator = await portalProvider.fetchUserProfile(fetchedPost.creator);
							setCreator(fetchedCreator);
						} catch (e: any) {
							console.error(e);
						}
					}
				} catch (e: any) {
					console.error(e);
				}
				setLoading(false);
			}
		})();
	}, [postId, permawebProvider.libs]);

	if (loading) return <Loader sm relative />;
	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<S.Title className={'fade-in'}>
					<h1>{post?.name ?? '-'}</h1>
				</S.Title>
				{post?.metadata?.description && (
					<S.Description>
						<p>{post.metadata.description}</p>
					</S.Description>
				)}
				<S.InfoWrapper className={'fade-in'}>
					{post?.creator && (
						<S.Author>
							<Link to={getRedirect(URLS.creator(post.creator))}>
								<p>{creator?.displayName ?? formatAddress(post.creator, false)}</p>
							</Link>
						</S.Author>
					)}
					{post?.metadata?.releasedDate && (
						<S.ReleasedDate>
							<span>{formatDate(post.metadata.releasedDate, 'iso', true)}</span>
						</S.ReleasedDate>
					)}
					{post?.metadata?.categories && (
						<S.Categories>
							{post.metadata.categories.map((category: PortalCategoryType) => {
								return (
									<Link to={getRedirect(URLS.category(category.id))} key={category.id}>
										{category.name}
									</Link>
								);
							})}
						</S.Categories>
					)}
				</S.InfoWrapper>
				{post?.metadata?.thumbnail && checkValidAddress(post?.metadata?.thumbnail) && (
					<S.FeaturedImage className={'fade-in'}>
						<img src={getTxEndpoint(post.metadata.thumbnail)} alt={post?.name} />
					</S.FeaturedImage>
				)}
			</S.HeaderWrapper>
			{post?.metadata?.content && <AssetContent content={post.metadata.content} />}
			<S.FooterWrapper className={'fade-in'}>
				{post?.metadata?.topics && (
					<S.TopicsWrapper>
						<p>{language?.topics}</p>
						<S.Topics>
							{post.metadata.topics.map((topic: string) => {
								return <span key={topic}>{topic}</span>;
							})}
						</S.Topics>
					</S.TopicsWrapper>
				)}
			</S.FooterWrapper>
		</S.Wrapper>
	);
}
