import React from 'react';
import { useParams } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Placeholder from 'engine/components/placeholder';
import Tag from 'engine/components/tag';
import { usePost } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import {
	buildHtmlDoc,
	contentToInnerHtml,
	contentToMarkdown,
	downloadBlob,
	escapeHtml,
	htmlDocToPlainText,
} from 'helpers/export-options';
import { checkValidAddress } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import Comments from '../comments';

import * as S from './styles';

export default function Post(props: any) {
	const { preview } = props;
	const { postId } = useParams();
	const { portal } = usePortalProvider();
	const { profile: user } = usePermawebProvider();
	const Name = portal?.Name;
	const { post, isLoading: isLoadingPost, error } = usePost(postId || '');
	const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || '');
	const [content, setContent] = React.useState<any>(null);
	const [isLoadingContent, setIsLoadingContent] = React.useState(false);
	const { toPDF, targetRef } = usePDF({ filename: post?.name ? `${post.name}.pdf` : 'post.pdf' });
	const canEditPost = user?.owner && user?.roles && ['Admin', 'Moderator'].some((r) => user.roles.includes(r));

	React.useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'auto' });
	}, []);

	const menuEntries: MenuItem[] = [];

	if (canEditPost) {
		menuEntries.push({
			icon: ICONS.edit,
			label: 'Edit Post',
			action: 'editPost',
			postId: post?.id,
		});
	}

	const safe = (fn: () => void) => () => {
		if (!exportDisabled) fn();
	};

	menuEntries.push(
		{
			icon: ICONS.tools,
			label: 'Download as PDF',
			onClick: safe(() => handleDownload('pdf')),
		},
		{
			icon: ICONS.tools,
			label: 'Download as Markdown (.md)',
			onClick: safe(() => handleDownload('markdown')),
		},
		{
			icon: ICONS.tools,
			label: 'Download as Text (.txt)',
			onClick: safe(() => handleDownload('text')),
		},
		{
			icon: ICONS.tools,
			label: 'Download as HTML (.html)',
			onClick: safe(() => handleDownload('html')),
		}
	);

	const titleForExport = post?.name ? String(post.name) : 'post';
	const exportDisabled = isLoadingPost || isLoadingContent || !content || !Array.isArray(content);

	const handleDownload = async (fmt: 'html' | 'markdown' | 'text' | 'word' | 'pdf') => {
		if (exportDisabled) return;

		const author = !isLoadingProfile ? profile?.displayName || '' : '';
		const dt = post?.dateCreated ? new Date(Number(post.dateCreated)) : null;
		const dateStr = dt ? dt.toLocaleString() : '';
		const tags: string[] = post?.metadata?.topics || [];

		const headerHtml = `
    <h1>${escapeHtml(post?.name || '')}</h1>
    <div class="meta">
      ${author ? escapeHtml(author) : ''} ${dateStr ? ` • ${escapeHtml(dateStr)}` : ''}
    </div>
    ${post?.metadata?.description ? `<p>${escapeHtml(post.metadata.description)}</p>` : ''}
    ${
			tags.length
				? `<div class="tags">${tags.map((t) => `<span class="tag">${escapeHtml(String(t))}</span>`).join(' ')}</div>`
				: ''
		}
  `;

		const bodyInner = headerHtml + '\n' + contentToInnerHtml(content);
		const fullHtml = buildHtmlDoc(`${post?.name || 'Post'} - ${portal?.Name || ''}`, bodyInner);

		switch (fmt) {
			case 'html':
				downloadBlob(`${titleForExport}.html`, 'text/html;charset=utf-8', fullHtml);
				break;
			case 'markdown': {
				const md =
					`# ${post?.name || ''}\n\n` +
					(post?.metadata?.description ? `${post.metadata.description}\n\n` : '') +
					(tags.length ? `Tags: ${tags.join(', ')}\n\n` : '') +
					contentToMarkdown(content);
				downloadBlob(`${titleForExport}.md`, 'text/markdown;charset=utf-8', md);
				break;
			}
			case 'text': {
				const text = htmlDocToPlainText(fullHtml);
				downloadBlob(`${titleForExport}.txt`, 'text/plain;charset=utf-8', text);
				break;
			}
			case 'word': {
				downloadBlob(`${titleForExport}.doc`, 'application/msword;charset=utf-8', fullHtml);
				break;
			}
			case 'pdf': {
				toPDF({
					page: { format: 'a4', margin: 30 },
					canvas: { useCORS: true },
					filename: `${titleForExport}.pdf`,
				});
				break;
			}
		}
	};

	React.useEffect(() => {
		if (!post || !Name) return;

		const title = `${post.name} - ${Name}`;
		const description = post?.metadata.description || 'Read this post on our portal.';
		const image = post.metadata?.thumbnail ? getTxEndpoint(post.metadata?.thumbnail) : undefined;
		const url = window.location.href;

		document.title = title;

		const created: HTMLMetaElement[] = [];

		const ensureMeta = (attr: string, key: string, value: string) => {
			let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
			if (!tag) {
				tag = document.createElement('meta');
				tag.setAttribute(attr, key);
				document.head.appendChild(tag);
				created.push(tag);
			}
			tag.setAttribute('content', value);
		};

		ensureMeta('property', 'og:title', title);
		ensureMeta('property', 'og:description', description);
		if (image) ensureMeta('property', 'og:image', image);
		ensureMeta('property', 'og:url', url);

		ensureMeta('name', 'twitter:title', title);
		ensureMeta('name', 'twitter:description', description);
		if (image) ensureMeta('name', 'twitter:image', image);
		ensureMeta('name', 'twitter:url', url);

		return () => {
			// when navigating away, remove the tags we created
			created.forEach((tag) => tag.remove());
		};
	}, [Name, post]);

	React.useEffect(() => {
		if (post?.metadata?.content) {
			setContent(post.metadata.content);
		} else if (post?.metadata?.contentTx) {
			setIsLoadingContent(true);
			fetch(getTxEndpoint(post.metadata.contentTx))
				.then((res) => res.json())
				.then((data) => {
					setContent(data);
					setIsLoadingContent(false);
				})
				.catch((err) => {
					console.error('Failed to load content:', err);
					setIsLoadingContent(false);
				});
		}
	}, [post]);
	console.log('post content', content);
	return (
		<S.Wrapper>
			<S.Post>
				<ContextMenu entries={menuEntries} />

				<div ref={targetRef}>
					<S.TitleWrapper>
						<h1>{isLoadingPost ? <Placeholder width="180" /> : post?.name}</h1>
						{post?.metadata?.status === 'draft' && (
							<S.DraftIndicator>
								<S.DraftDot />
								Draft
							</S.DraftIndicator>
						)}
					</S.TitleWrapper>

					{post?.metadata.description && <S.Description>{post?.metadata.description}</S.Description>}
					<S.Meta>
						<img
							className="loadingAvatar"
							onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
							src={
								!isLoadingProfile && profile?.thumbnail && checkValidAddress(profile.thumbnail)
									? getTxEndpoint(profile.thumbnail)
									: ICONS.user
							}
						/>
						<span>{isLoadingProfile ? <Placeholder width="100" /> : profile?.displayName}</span>&nbsp;
						<span>
							• {isLoadingPost ? <Placeholder width="40" /> : new Date(Number(post?.dateCreated)).toLocaleDateString()}{' '}
							{isLoadingPost ? (
								<Placeholder width="30" />
							) : (
								new Date(Number(post?.dateCreated)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
							)}
						</span>
					</S.Meta>
					{!isLoadingPost && post?.metadata?.thumbnail && (
						<S.Thumbnail
							className="loadingThumbnail"
							onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
							src={!isLoadingPost && post?.metadata?.thumbnail ? getTxEndpoint(post.metadata.thumbnail) : ''}
						/>
					)}
					<S.Tags>
						{post &&
							post?.metadata?.topics &&
							post?.metadata?.topics.map((topic: any, index: number) => {
								return <Tag key={index} tag={topic} />;
							})}
					</S.Tags>
					{isLoadingContent && <p>Loading content...</p>}
					{!isLoadingPost &&
						!isLoadingContent &&
						content &&
						Array.isArray(content) &&
						content.map((entry) => {
							switch (entry.type) {
								case 'header-1':
									return <h1 key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'header-2':
									return <h2 key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'header-3':
									return <h3 key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'header-4':
									return <h4 key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'header-5':
									return <h5 key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'header-6':
									return <h6 key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'image':
									return <div key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'video':
									return <div key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'paragraph':
									return <p key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'quote':
									return <blockquote key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'code':
									return <code key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'unordered-list':
									return <ul key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'ordered-list':
									return <ul key={entry.id} dangerouslySetInnerHTML={{ __html: entry.content }} />;
								case 'divider-solid':
									return <div key={entry.id} className="article-divider-solid" />;
								case 'divider-dashed':
									return <div key={entry.id} className="article-divider-dashed" />;
								default:
									return <b key={entry.id}>{JSON.stringify(entry)}</b>;
							}
						})}
				</div>
			</S.Post>
			<Comments commentsId={post?.metadata?.comments} postAuthorId={post?.creator} />
		</S.Wrapper>
	);
}
