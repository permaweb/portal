import React from 'react';
import { Link, useParams } from 'react-router-dom';
import parse from 'html-react-parser';

import { Loader } from 'components/atoms/Loader';
import { URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { ArticleBlockType, PortalAssetType, PortalCategoryType } from 'helpers/types';
import { checkValidAddress, formatAddress, formatDate, getPortalIdFromURL } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

// TODO: Profiles
export default function Post() {
	const { postId } = useParams<{ postId?: string }>();

	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [post, setPost] = React.useState<PortalAssetType | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		(async function () {
			if (!post && postId && checkValidAddress(postId) && permawebProvider.libs) {
				setLoading(true);
				try {
					const post = await permawebProvider.libs.getAtomicAsset(postId);
					setPost(post);
				} catch (e: any) {
					console.error(e);
				}
				setLoading(false);
			}
		})();
	}, [postId, permawebProvider.libs]);

	function getCategoryRedirect(categoryId: string) {
		const portalId = getPortalIdFromURL();
		if (portalId) return `${URLS.portalBase(portalId)}${URLS.category(categoryId)}`;
		return URLS.category(categoryId);
	}

	if (loading) return <Loader sm relative />;

	function getArticleBlock(block: ArticleBlockType) {
		let Element: any = null;

		switch (block.type) {
			case 'paragraph':
				Element = 'p';
				break;
			case 'quote':
				Element = 'blockquote';
				break;
			case 'ordered-list':
				Element = 'ol';
				break;
			case 'unordered-list':
				Element = 'ul';
				break;
			case 'code':
				Element = 'code';
				break;
			case 'header-1':
				Element = 'h1';
				break;
			case 'header-2':
				Element = 'h2';
				break;
			case 'header-3':
				Element = 'h3';
				break;
			case 'header-4':
				Element = 'h4';
				break;
			case 'header-5':
				Element = 'h5';
				break;
			case 'header-6':
				Element = 'h6';
				break;
			default:
				Element = null;
				break;
		}

		if (Element)
			return (
				<Element key={block.id} className={'fade-in'}>
					{parse(block.content)}
				</Element>
			);
		return parse(block.content);
	}

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
							<p>
								<span>By </span> {formatAddress(post.creator, false)}
							</p>
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
									<Link to={getCategoryRedirect(category.id)} key={category.id}>
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
			{post?.metadata?.content && (
				<S.Content>
					{post.metadata.content.map((block: ArticleBlockType) => {
						return getArticleBlock(block);
					})}
				</S.Content>
			)}
			<S.FooterWrapper className={'fade-in'}>
				{post?.metadata?.topics && (
					<S.TopicsWrapper>
						<p>{language.topics}</p>
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
