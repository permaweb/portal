import React from 'react';
import { createPortal } from 'react-dom';
import { ReactSVG } from 'react-svg';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS } from 'helpers/config';
import { PortalAssetType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';

import * as S from './styles';

const CATEGORY_GROUP_DND_TYPE = 'category-group';
const UNCATEGORIZED_GROUP_ID = '__uncategorized__';

type PostGroup = {
	id: string;
	name: string;
	posts: PortalAssetType[];
};

function DragPortal(props: { active: boolean; children: React.ReactElement }) {
	return props.active ? createPortal(props.children, document.body) : props.children;
}

function groupPosts(posts: PortalAssetType[], uncategorizedLabel: string): PostGroup[] {
	const groups = new Map<string, PostGroup>();
	for (const post of posts) {
		const firstCategory = post.metadata?.categories?.[0];
		const categoryId = firstCategory?.id || firstCategory?.name || UNCATEGORIZED_GROUP_ID;
		const groupId = `category:${categoryId}`;
		const group = groups.get(groupId) ?? {
			id: groupId,
			name: firstCategory?.name || uncategorizedLabel,
			posts: [],
		};
		group.posts.push(post);
		groups.set(groupId, group);
	}
	return [...groups.values()];
}

export default function PostReorder(props: { closeAction: () => void }) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [groups, setGroups] = React.useState<PostGroup[]>(() =>
		groupPosts(portalProvider.current?.assets ?? [], language?.uncategorized || 'Uncategorized')
	);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		setGroups(groupPosts(portalProvider.current?.assets ?? [], language?.uncategorized || 'Uncategorized'));
	}, [portalProvider.current?.id, portalProvider.current?.assets, language?.uncategorized]);

	function handleDragEnd(result: DropResult) {
		if (!result.destination || result.destination.index === result.source.index) return;
		setGroups((current) => {
			if (result.type === CATEGORY_GROUP_DND_TYPE) {
				const reordered = [...current];
				const [moved] = reordered.splice(result.source.index, 1);
				reordered.splice(result.destination.index, 0, moved);
				return reordered;
			}

			if (result.source.droppableId !== result.destination.droppableId) return current;
			const groupIndex = current.findIndex((group) => `posts:${group.id}` === result.source.droppableId);
			if (groupIndex < 0) return current;
			const reordered = [...current];
			const posts = [...reordered[groupIndex].posts];
			const [moved] = posts.splice(result.source.index, 1);
			posts.splice(result.destination.index, 0, moved);
			reordered[groupIndex] = { ...reordered[groupIndex], posts };
			return reordered;
		});
	}

	const orderedPosts = groups.flatMap((group) => group.posts);
	const hasChanges =
		orderedPosts.length !== (portalProvider.current?.assets?.length ?? 0) ||
		orderedPosts.some((post, index) => post.id !== portalProvider.current?.assets?.[index]?.id);

	async function handleSave() {
		if (!hasChanges || loading) return;
		setLoading(true);
		try {
			await portalProvider.reorderPosts(orderedPosts.map((post) => post.id));
			addNotification(`${language?.postOrderUpdated}!`, 'success');
			props.closeAction();
		} catch (e: any) {
			addNotification(e.message ?? 'Error updating post order', 'warning');
		} finally {
			setLoading(false);
		}
	}

	return (
		<S.Wrapper>
			<S.Description>{language?.reorderPostsInfo}</S.Description>
			{groups.length > 0 ? (
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId={'category-groups'} type={CATEGORY_GROUP_DND_TYPE}>
						{(provided) => (
							<S.Groups ref={provided.innerRef} {...provided.droppableProps}>
								{groups.map((group, groupIndex) => (
									<Draggable key={group.id} draggableId={group.id} index={groupIndex} isDragDisabled={loading}>
										{(groupProvided, groupSnapshot) => (
											<DragPortal active={groupSnapshot.isDragging}>
												<S.Group
													ref={groupProvided.innerRef}
													{...groupProvided.draggableProps}
													$isDragging={groupSnapshot.isDragging}
												>
													<S.GroupHeader>
														<S.GroupDragHandle
															{...groupProvided.dragHandleProps}
															aria-label={`${language?.reorderPosts}: ${group.name}`}
														>
															<ReactSVG src={ICONS.drag} />
														</S.GroupDragHandle>
														<S.GroupName>{group.name}</S.GroupName>
														<S.PostCount>
															{group.posts.length} {group.posts.length === 1 ? language?.post : language?.posts}
														</S.PostCount>
													</S.GroupHeader>
													<Droppable droppableId={`posts:${group.id}`} type={`posts:${group.id}`}>
														{(postsProvided) => (
															<S.Posts ref={postsProvided.innerRef} {...postsProvided.droppableProps}>
																{group.posts.map((post, postIndex) => (
																	<Draggable
																		key={post.id}
																		draggableId={post.id}
																		index={postIndex}
																		isDragDisabled={loading}
																	>
																		{(postProvided, postSnapshot) => (
																			<DragPortal active={postSnapshot.isDragging}>
																				<S.Post
																					ref={postProvided.innerRef}
																					{...postProvided.draggableProps}
																					$isDragging={postSnapshot.isDragging}
																				>
																					<S.DragHandle
																						{...postProvided.dragHandleProps}
																						aria-label={language?.reorderPosts}
																					>
																						<ReactSVG src={ICONS.drag} />
																					</S.DragHandle>
																					<S.PostTitle>{post.name}</S.PostTitle>
																					{post.metadata?.status && <S.Status>{post.metadata.status}</S.Status>}
																				</S.Post>
																			</DragPortal>
																		)}
																	</Draggable>
																))}
																{postsProvided.placeholder}
															</S.Posts>
														)}
													</Droppable>
												</S.Group>
											</DragPortal>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</S.Groups>
						)}
					</Droppable>
				</DragDropContext>
			) : (
				<S.Empty>{language?.noPostsFound}</S.Empty>
			)}
			<S.Actions>
				<Button type={'primary'} label={language?.cancel} handlePress={props.closeAction} disabled={loading} />
				<Button
					type={'alt1'}
					label={language?.save}
					handlePress={handleSave}
					disabled={!hasChanges || loading}
					loading={loading}
				/>
			</S.Actions>
		</S.Wrapper>
	);
}
