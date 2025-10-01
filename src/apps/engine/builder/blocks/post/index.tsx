import React from 'react';
import { useParams } from 'react-router-dom';
import ContextMenu, { MenuItem } from 'engine/components/contextMenu';
import Placeholder from 'engine/components/placeholder';
import Tag from 'engine/components/tag';
import { usePost } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
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

	React.useEffect(() => {
		if (Name && post && !document.title.includes(post.name)) {
			// @ts-ignore
			document.title = `${post.name} - ${Name}`;
		}
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
								console.log('Vid: ', entry);
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
							default:
								return <b key={entry.id}>{JSON.stringify(entry)}</b>;
						}
					})}
			</S.Post>
			<Comments commentsId={post?.metadata?.comments} />
		</S.Wrapper>
	);
}
