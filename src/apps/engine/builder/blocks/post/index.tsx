import React from 'react';
import { useParams } from 'react-router-dom';
import { usePDF } from 'react-to-pdf';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import { usePost } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { PostRenderer } from 'components/molecules/PostRenderer';
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
import { usePermawebProvider } from 'providers/PermawebProvider';

import Comments from '../comments';

import * as S from './styles';

export default function Post(props: any) {
	const { preview, txId } = props;
	const { postId: routePostId } = useParams();
	const postId = txId || routePostId;
	const { portal } = usePortalProvider();
	const { profile: user } = usePermawebProvider();
	const Name = portal?.Name;
	const { post, isLoading: isLoadingPost, error } = usePost(postId || '');
	const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || '');
	const [content, setContent] = React.useState<any>(null);
	const [isLoadingContent, setIsLoadingContent] = React.useState(false);
	const { toPDF, targetRef } = usePDF({ filename: post?.name ? `${post.name}.pdf` : 'post.pdf' });
	const roles = Array.isArray(user?.roles)
		? user.roles
		: user?.roles
		? [user.roles] // if it’s a single string
		: [];
	const canEditPost = user?.owner && roles && ['Admin', 'Moderator'].some((r) => roles?.includes(r));

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

	const titleForExport = post?.name ? String(post.name) : 'post';
	const exportDisabled = isLoadingPost || isLoadingContent || !content || !Array.isArray(content);

	const safe = (fn: () => void) => () => {
		if (!exportDisabled) fn();
	};

	menuEntries.push({
		icon: ICONS.download,
		label: 'Download',
		submenu: [
			{
				icon: ICONS.pdf,
				label: 'PDF',
				onClick: safe(() => handleDownload('pdf')),
			},
			{
				icon: ICONS.markdown,
				label: 'Markdown',
				onClick: safe(() => handleDownload('markdown')),
			},
			{
				icon: ICONS.text,
				label: 'Text',
				onClick: safe(() => handleDownload('text')),
			},
			{
				icon: ICONS.html,
				label: 'HTML',
				onClick: safe(() => handleDownload('html')),
			},
		],
	});

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
					page: { format: 'a4', margin: { top: 20, right: 10, bottom: 20, left: 10 } },
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
	return (
		<S.Wrapper>
			<S.Post>
				<ContextMenu entries={menuEntries} />

				<div ref={targetRef}>
					<PostRenderer
						isLoadingPost={isLoadingPost}
						isLoadingProfile={isLoadingProfile}
						isLoadingContent={isLoadingContent}
						post={post}
						profile={profile}
						content={content}
						isPreview={false}
					/>
				</div>
			</S.Post>
			<Comments commentsId={post?.metadata?.comments} postAuthorId={post?.creator} />
		</S.Wrapper>
	);
}
