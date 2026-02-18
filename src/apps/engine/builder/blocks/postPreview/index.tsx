import React from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from 'engine/components/avatar';
import Placeholder from 'engine/components/placeholder';
import useNavigate from 'engine/helpers/preview';
import { useComments } from 'engine/hooks/comments';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { POST_PREVIEWS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, getRedirect, urlify } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

type PostPreviewTemplate = {
	id: string;
	name: string;
	type: string;
	layout: {
		direction?: string;
		gap?: string;
	};
	content?: PostPreviewElement[];
	rows?: PostPreviewRow[];
};

type PostPreviewElement = {
	id?: string;
	type: string;
	layout?: any;
	content?: any;
};

type PostPreviewColumn = {
	id?: string;
	blocks: PostPreviewElement[];
};

type PostPreviewRow = {
	id?: string;
	columns: PostPreviewColumn[];
};

interface PostPreviewDynamicProps {
	template?: PostPreviewTemplate;
	templateId?: string;
	post: any;
}

export default function PostPreviewDynamic(props: PostPreviewDynamicProps) {
	const navigate = useNavigate();
	const { portal } = usePortalProvider();
	usePermawebProvider();
	const Layout = portal?.Layout;

	const { templateId, post } = props;
	const template = props.template || POST_PREVIEWS[templateId as keyof typeof POST_PREVIEWS] || POST_PREVIEWS.blog;

	const { profile, isLoading: isLoadingProfile } = useProfile(post?.creator || null);
	const { comments } = useComments(post?.id || null, true);

	const isPortalCreator = post?.creator === portal?.id;
	const displayName = isPortalCreator ? portal?.name : profile?.displayName;
	const displayThumbnail = isPortalCreator ? portal?.logo : profile?.thumbnail;
	const isLoadingPost = !post;
	const [thumbnailFailed, setThumbnailFailed] = React.useState(false);

	React.useEffect(() => {
		setThumbnailFailed(false);
	}, [post?.metadata?.thumbnail]);

	const normalizeElement = (element: PostPreviewElement | string): PostPreviewElement => {
		if (typeof element === 'string') {
			return { type: element, id: element };
		}

		if (element.type === 'body' || element.type === 'meta') {
			const children = (element.content || []).map((child: PostPreviewElement | string) => normalizeElement(child));
			return { ...element, content: children };
		}

		return element;
	};

	const isRenderable = (element: PostPreviewElement): boolean => {
		if (isLoadingPost) return true;

		switch (element.type) {
			case 'thumbnail':
				return !!post?.metadata?.thumbnail && checkValidAddress(post.metadata.thumbnail) && !thumbnailFailed;
			case 'description':
				return !!post?.metadata?.description;
			case 'categories':
				return (post?.metadata?.categories?.length || 0) > 0;
			case 'comments':
				if (element.layout?.hideWhenEmpty !== 'false' && !comments?.length) return false;
				return true;
			case 'body':
			case 'meta': {
				const children = (element.content || []).map((child: PostPreviewElement | string) => normalizeElement(child));
				return children.some((child) => isRenderable(child));
			}
			default:
				return true;
		}
	};

	const getRows = (target: PostPreviewTemplate): PostPreviewRow[] => {
		if (Array.isArray(target.rows) && target.rows.length > 0) {
			return target.rows.map((row) => ({
				...row,
				columns: (row.columns || []).map((col) => ({
					...col,
					blocks: (col.blocks || []).map((block) => normalizeElement(block)),
				})),
			}));
		}

		if (Array.isArray(target.content) && target.content.length > 0) {
			return [
				{
					id: 'row-legacy',
					columns: [
						{
							id: 'col-legacy',
							blocks: target.content.map((block) => normalizeElement(block)),
						},
					],
				},
			];
		}

		return [];
	};

	const renderElement = (element: PostPreviewElement, index: number): React.ReactNode => {
		switch (element.type) {
			case 'categories': {
				const maxCount = element.layout?.maxCount || 1;
				const visibleCategories = post?.metadata?.categories?.slice(0, maxCount) || [];
				return (
					<S.Categories key={index} $layout={element.layout} $isFirst={index === 0}>
						{post ? (
							<>
								{visibleCategories.map((category: any, catIndex: number) => (
									<React.Fragment key={catIndex}>
										<NavLink to={getRedirect(`feed/category/${category.name}`)}>
											<S.Category $layout={element.layout}>{category.name}</S.Category>
										</NavLink>
										{catIndex < visibleCategories.length - 1 && <>,&nbsp;</>}
									</React.Fragment>
								))}
							</>
						) : (
							<Placeholder />
						)}
					</S.Categories>
				);
			}

			case 'thumbnail':
				if (!post?.metadata?.thumbnail) return null;
				return (
					<S.ThumbnailWrapper key={index} $layout={element.layout}>
						<img
							className="loadingThumbnail"
							onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
							onError={() => setThumbnailFailed(true)}
							onClick={() => navigate(getRedirect(`post/${post?.metadata?.url ?? post?.id}`))}
							src={getTxEndpoint(post.metadata.thumbnail)}
						/>
					</S.ThumbnailWrapper>
				);

			case 'title':
				return (
					<S.TitleWrapper key={index}>
						<h2
							className={!post ? 'loadingPlaceholder' : ''}
							onClick={() => navigate(getRedirect(`post/${post?.metadata?.url ?? post?.id}`))}
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
				);

			case 'description':
				if (!post?.metadata?.description) return null;
				if (element.layout?.maxChars) {
					const max = Number(element.layout.maxChars);
					if (!Number.isNaN(max) && max > 0) {
						const text = post.metadata.description;
						const trimmed = text.length > max ? `${text.slice(0, Math.max(0, max - 3))}...` : text;
						return <S.Description key={index}>{trimmed}</S.Description>;
					}
				}
				return <S.Description key={index}>{post?.metadata?.description}</S.Description>;

			case 'author': {
				const showAvatar = element.layout?.showAvatar !== 'false';
				return (
					<S.Author
						key={index}
						onClick={() =>
							!isPortalCreator &&
							navigate(getRedirect(`author/${profile?.username ? urlify(profile.username) : profile?.id}`))
						}
						style={{
							cursor: isPortalCreator ? 'default' : 'pointer',
							width: element.layout?.width === 'flex' ? undefined : 'fit-content',
							flex: element.layout?.width === 'flex' ? element.layout?.flex || 1 : undefined,
						}}
					>
						{showAvatar && (
							<Avatar
								src={
									displayThumbnail && checkValidAddress(displayThumbnail) ? getTxEndpoint(displayThumbnail) : undefined
								}
								profile={isPortalCreator ? { id: portal?.id } : profile}
								isLoading={isLoadingProfile}
								size={20}
								hoverable={true}
							/>
						)}
						{isLoadingProfile ? <Placeholder width="100" /> : displayName}
					</S.Author>
				);
			}

			case 'date':
				return (
					<S.Date
						key={index}
						style={{
							width: element.layout?.width === 'flex' ? undefined : 'fit-content',
							flex: element.layout?.width === 'flex' ? element.layout?.flex || 1 : undefined,
						}}
					>
						{isLoadingProfile ? (
							<Placeholder width="120" />
						) : (
							`${new Date(Number(post?.metadata?.releaseDate)).toLocaleDateString()} ${new Date(
								Number(post?.metadata?.releaseDate)
							).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
						)}
					</S.Date>
				);

			case 'tags':
				if (!post?.metadata?.topics?.length) return null;
				return (
					<S.Tags key={index}>
						{post?.metadata?.topics?.map((tag: string, tagIndex: number) => (
							<React.Fragment key={tagIndex}>
								<NavLink to={getRedirect(`feed/tag/${tag}`)}>
									<S.Tag>#{tag}</S.Tag>
								</NavLink>
							</React.Fragment>
						))}
					</S.Tags>
				);

			case 'meta':
				const metaItems = (element.content as string[]) || ['author', 'date'];
				return (
					<S.Meta key={index}>
						{metaItems.includes('author') && (
							<S.Author
								onClick={() =>
									!isPortalCreator &&
									navigate(getRedirect(`author/${profile?.username ? urlify(profile.username) : profile?.id}`))
								}
								style={{ cursor: isPortalCreator ? 'default' : 'pointer' }}
							>
								<Avatar
									src={
										displayThumbnail && checkValidAddress(displayThumbnail)
											? getTxEndpoint(displayThumbnail)
											: undefined
									}
									profile={isPortalCreator ? { id: portal?.id } : profile}
									isLoading={isLoadingProfile}
									size={20}
									hoverable={true}
								/>
								{isLoadingProfile ? <Placeholder width="100" /> : displayName}
							</S.Author>
						)}
						{metaItems.includes('date') && (
							<S.Date>
								{isLoadingProfile ? (
									<Placeholder width="120" />
								) : (
									`${new Date(Number(post?.metadata?.releaseDate)).toLocaleDateString()} ${new Date(
										Number(post?.metadata?.releaseDate)
									).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
								)}
							</S.Date>
						)}
					</S.Meta>
				);

			case 'body':
				const bodyChildren = (element.content || [])
					.map((child: PostPreviewElement | string) => normalizeElement(child))
					.filter((child) => isRenderable(child));
				if (bodyChildren.length === 0) return null;
				return (
					<S.Body key={index} $layout={element.layout}>
						{bodyChildren.map((child: PostPreviewElement, childIndex: number) => renderElement(child, childIndex))}
					</S.Body>
				);

			case 'comments': {
				if (element.layout?.hideWhenEmpty !== 'false' && !comments?.length) return null;
				const maxComments = element.layout?.maxCount || comments?.length || 0;
				const sortedComments = element.layout?.sortOrder === 'asc' ? [...(comments || [])].reverse() : comments || [];
				const visibleComments = sortedComments.slice(0, maxComments);
				return (
					<S.Comments key={index}>
						<h3>Comments</h3>
						{visibleComments.map((comment: any, commentIndex: number) => (
							<Comment key={commentIndex} data={comment} />
						))}
					</S.Comments>
				);
			}

			default:
				return null;
		}
	};

	const rows = getRows(template);
	const paddingValue = template.layout?.padding;
	const paddingTopValue = template.layout?.paddingTop;
	const hasAbsoluteCategories = rows.some((row) =>
		row.columns.some((col) =>
			col.blocks.some((block) => block.type === 'categories' && block.layout?.position === 'absolute')
		)
	);
	const containerStyle: React.CSSProperties = {};
	if (paddingValue !== undefined && paddingValue !== null && paddingValue !== '') {
		containerStyle.padding = typeof paddingValue === 'number' ? `${paddingValue}px` : `${paddingValue}`;
	}
	if (paddingTopValue !== undefined && paddingTopValue !== null && paddingTopValue !== '') {
		containerStyle.paddingTop = typeof paddingTopValue === 'number' ? `${paddingTopValue}px` : `${paddingTopValue}`;
	} else if (hasAbsoluteCategories) {
		containerStyle.paddingTop = '32px';
	}
	const containerStyleValue = Object.keys(containerStyle).length > 0 ? containerStyle : undefined;

	return (
		<S.Container $layout={template.layout} $portalLayout={Layout} style={containerStyleValue}>
			{rows
				.map((row) => ({
					...row,
					columns: (row.columns || [])
						.map((col) => ({
							...col,
							blocks: (col.blocks || []).map((block) => normalizeElement(block)).filter((block) => isRenderable(block)),
						}))
						.filter((col) => col.blocks.length > 0),
				}))
				.filter((row) => row.columns.length > 0)
				.map((row, rowIndex) => (
					<S.Row key={row.id || rowIndex} $layout={template.layout}>
						{row.columns.map((col, colIndex) => (
							<S.Column key={col.id || colIndex}>
								{col.blocks.map((element, index) => renderElement(element, index))}
							</S.Column>
						))}
					</S.Row>
				))}
		</S.Container>
	);
}

function Comment({ data }: { data: any }) {
	const { profile, isLoading: isLoadingProfile } = useProfile(data.creator || null);

	return (
		<S.Comment>
			<S.CommentHeader>
				<Avatar profile={profile} isLoading={isLoadingProfile} size={18} />
				<S.Username>{profile?.displayName || '[[displayName]]'}</S.Username>
				<S.CommentDate>
					{`${new Date(data?.dateCreated || 'now').toLocaleDateString()} ${new Date(
						data.dateCreated
					).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
				</S.CommentDate>
			</S.CommentHeader>
			<S.CommentText>{data?.content || '[[content]]'}</S.CommentText>
		</S.Comment>
	);
}
