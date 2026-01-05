import { useNavigate } from 'react-router-dom';
import Avatar from 'engine/components/avatar';
import Placeholder from 'engine/components/placeholder';
import Tag from 'engine/components/tag';

import { getTxEndpoint } from 'helpers/endpoints';
import { getRedirect, urlify } from 'helpers/utils';

import * as S from './styles';
import Embed from 'engine/builder/blocks/embed';
import Supporters from 'engine/builder/blocks/supporters';
import OdyseeEmbed from 'engine/builder/blocks/odyseeEmbed';

type ContentEntryType =
	| 'header-1'
	| 'header-2'
	| 'header-3'
	| 'header-4'
	| 'header-5'
	| 'header-6'
	| 'image'
	| 'video'
	| 'paragraph'
	| 'quote'
	| 'code'
	| 'html'
	| 'unordered-list'
	| 'ordered-list'
	| 'divider-solid'
	| 'divider-dashed'
	| 'spacer-horizontal'
	| 'spacer-vertical'
	| 'table'
	| 'monetizationButton'
	| 'embed'
	| 'supporters';

type ContentEntry = {
	id: string | number;
	type: ContentEntryType;
	content?: string;
	data?: any;
};

type PostMeta = {
	status?: 'draft' | 'published';
	description?: string;
	thumbnail?: string;
	topics?: any[];
};

type PostType = {
	name?: string;
	dateCreated?: number | string; // epoch ms or string that can be Number(...)
	metadata?: PostMeta;
};

type ProfileType = {
	id?: string;
	username?: string;
	displayName?: string;
	thumbnail?: string;
};

type PostRendererProps = {
	isLoadingPost?: boolean;
	isLoadingProfile?: boolean;
	isLoadingContent?: boolean;
	post?: PostType | null;
	profile?: ProfileType | null;
	content?: ContentEntry[] | null;
	isPreview?: boolean;
	postId?: string;
};

export default function PostRenderer(props: PostRendererProps) {
	const navigate = useNavigate();
	const isLoadingPost = !!props.isLoadingPost;
	const isLoadingProfile = !!props.isLoadingProfile;
	const isLoadingContent = !!props.isLoadingContent;

	const post = props.post ?? null;
	const profile = props.profile ?? null;
	const content = props.content ?? null;

	const dateMs = post?.dateCreated !== undefined && post?.dateCreated !== null ? Number(post.dateCreated) : undefined;

	const handleAuthorClick = () => {
		if (profile?.id) {
			navigate(getRedirect(`author/${profile.username ? urlify(profile.username) : profile.id}`));
		}
	};

	return (
		<>
			<S.TitleWrapper>
				<h1>{isLoadingPost ? <Placeholder width="180" /> : post?.name}</h1>

				{post?.metadata?.status === 'draft' && (
					<S.DraftIndicator>
						<S.DraftDot />
						Draft
					</S.DraftIndicator>
				)}
			</S.TitleWrapper>

			{post?.metadata?.description && <S.Description>{post.metadata.description}</S.Description>}

			<S.Meta>
				<S.Author onClick={handleAuthorClick}>
					<Avatar profile={profile} isLoading={isLoadingProfile} size={20} hoverable={true} />
					{isLoadingProfile ? <Placeholder width="100" /> : profile?.displayName}
				</S.Author>
				&nbsp;
				<span>
					•{' '}
					{isLoadingPost ? (
						<>
							<Placeholder width="40" /> <Placeholder width="30" />
						</>
					) : dateMs ? (
						<>
							{new Date(dateMs).toLocaleDateString()}{' '}
							{new Date(dateMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</>
					) : null}
				</span>
			</S.Meta>

			{!isLoadingPost && post?.metadata?.thumbnail && (
				<S.Thumbnail
					className="loadingThumbnail"
					onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
					src={getTxEndpoint(post.metadata.thumbnail)}
					alt=""
				/>
			)}

			<S.Tags>
				{post?.metadata?.topics?.map((topic: any, index: number) => (
					<Tag key={index} tag={topic} />
				))}
			</S.Tags>

			{isLoadingContent && <p>Loading content...</p>}

			{!isLoadingPost &&
				!isLoadingContent &&
				content &&
				Array.isArray(content) &&
				content.map((entry) => {
					switch (entry.type) {
						case 'header-1':
							return (
								<h1
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'header-2':
							return (
								<h2
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'header-3':
							return (
								<h3
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'header-4':
							return (
								<h4
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'header-5':
							return (
								<h5
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'header-6':
							return (
								<h6
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'image':
						case 'video': {
							let modifiedContent = entry.content || '';
							let marginStyle = 'margin-left: auto; margin-right: auto;';

							if (modifiedContent.includes('justify-content: flex-start')) {
								marginStyle = 'margin-left: 0; margin-right: auto;';
							} else if (modifiedContent.includes('justify-content: flex-end')) {
								marginStyle = 'margin-left: auto; margin-right: 0;';
							}

							modifiedContent = modifiedContent.replace(/style="([^"]*)"/, `style="$1 ${marginStyle}"`);
							return <div key={entry.id} dangerouslySetInnerHTML={{ __html: modifiedContent }} />;
						}
						case 'paragraph':
							return (
								<p key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content || '' }} style={{ ...entry.data }} />
							);
						case 'quote':
							return (
								<blockquote
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'code': {
							const handleCopy = () => {
								const tempDiv = document.createElement('div');
								tempDiv.innerHTML = entry.content || '';
								const textContent = tempDiv.textContent || tempDiv.innerText || '';
								navigator.clipboard.writeText(textContent).then(() => {
									const button = document.querySelector(`[data-code-id="${entry.id}"]`) as HTMLButtonElement;
									if (button) {
										const originalText = button.textContent;
										button.textContent = 'Copied!';
										setTimeout(() => {
											button.textContent = originalText;
										}, 2000);
									}
								});
							};

							return (
								<div key={entry.id} className="portal-code-wrapper">
									<button data-code-id={entry.id} onClick={handleCopy}>
										Copy
									</button>
									<code dangerouslySetInnerHTML={{ __html: entry.content || '' }} />
								</div>
							);
						}
						case 'html':
							return (
								<div
									key={entry.id}
									className="portal-html-wrapper"
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
								/>
							);
						case 'unordered-list':
							return (
								<ul
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'ordered-list':
							return (
								<ol
									key={entry.id}
									dangerouslySetInnerHTML={{ __html: entry.content || '' }}
									style={{ ...entry.data }}
								/>
							);
						case 'divider-solid':
							return <div key={entry.id} className="article-divider-solid" />;
						case 'divider-dashed':
							return <div key={entry.id} className="article-divider-dashed" />;
						case 'spacer-vertical':
							return <div key={entry.id} style={{ height: `${entry.data?.height || 50}px` }} />;
						case 'spacer-horizontal':
							return <div key={entry.id} style={{ flex: entry.data?.width || 1 }} />;
						case 'table':
							return <div key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content || '' }} />;
						case 'monetizationButton':
							return (
								<TipsButton
									key={entry.id}
									element={entry}
									preview={props.isPreview ?? false}
									location="post"
									postId={props.postId}
								/>
							);
						case 'supporters':
							return (
								<Supporters
									key={entry.id}
									element={entry}
									preview={props.isPreview ?? false}
									location="post"
									postId={props.postId}
								/>
							);
						case 'embed':
							return <Embed key={entry.id} element={entry} />;
						default:
							return <b key={entry.id}>{JSON.stringify(entry)}</b>;
					}
				})}
		</>
	);
}
