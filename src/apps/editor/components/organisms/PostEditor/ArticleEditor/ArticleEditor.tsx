import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { ArticleBlock } from 'editor/components/molecules/ArticleBlock';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostClear, currentPostUpdate, setOriginalData } from 'editor/store/post';

import { URLS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType, RequestUpdateType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ArticleToolbar } from './ArticleToolbar';
import * as S from './styles';

export default function ArticleEditor(props: {
	handleSubmit: () => void;
	handleRequestUpdate: (updateType: RequestUpdateType) => void;
	handleStatusUpdate?: (status: 'Pending' | 'Review') => void;
	staticPage?: boolean;
}) {
	const navigate = useNavigate();
	const { assetId } = useParams<{ assetId?: string }>();

	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [viewMode, setViewMode] = React.useState<'original' | 'new'>('new');
	const [originalData, setOriginalDataState] = React.useState({});
	const [newChanges, setNewChanges] = React.useState({});

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	const switchBetweenOriginal = (viewMode: 'original' | 'new') => {
		setViewMode(viewMode);
		if (viewMode === 'original') {
			// Revert to original data
			Object.keys(originalData).forEach((key) => {
				handleCurrentPostUpdate({ field: key, value: originalData[key as keyof typeof originalData] });
			});
		} else {
			Object.keys(newChanges).forEach((key) => {
				handleCurrentPostUpdate({ field: key, value: newChanges[key as keyof typeof newChanges] });
			});
		}
	};

	const previousAssetIdRef = React.useRef<string | undefined>(undefined);

	async function loadPostData() {
		if (portalProvider.current?.id) {
			if (assetId) {
				if (!checkValidAddress(assetId)) navigate(URLS.postCreateArticle(portalProvider.current.id));

				const hasCurrentPostData = currentPost.data.id === assetId && currentPost.data.title;

				// Always load if the assetId has changed, even if we have some post data
				const assetIdChanged = previousAssetIdRef.current !== assetId;

				if (!hasCurrentPostData || assetIdChanged) {
					dispatch(currentPostClear());
					handleCurrentPostUpdate({
						field: 'loading',
						value: {
							active: true,
							message: `${props.staticPage ? language?.loadingPage : language?.loadingPost}...`,
						},
					});
					const request: any = portalProvider.current?.requests?.find((req) => req.id === assetId);

					try {
						let source: any = null;
						let assetData = await permawebProvider.libs.getAtomicAsset(assetId);

						if (request && request.payload?.input) {
							// If request already exists, use it as the source
							source = request;
						} else {
							// Otherwise, fetch from permaweb
							source = assetData;
						}

						const meta = request && request?.payload?.input ? request.payload?.input || {} : source.metadata || {};
						if (!source) throw new Error('No source data found');

						if (request) {
							setViewMode('new');
							setNewChanges({
								id: assetId || null,
								title: meta.name || source.name || '',
								creator: meta.creator || source.creator || null,
								status: meta.status || 'draft',
								categories: meta.categories || [],
								topics: meta.topics || [],
								content: meta.content || null,
								thumbnail: meta.thumbnail || null,
								description: meta.description || '',
								externalRecipients: [],
								dateCreated: source.createdAt || null,
								lastUpdate: source.updatedAt || null,
								releaseDate: meta.releaseDate || null,
								authUsers: source.authUsers || [],
							});
							setOriginalDataState({
								id: assetId || null,
								title: assetData.metadata.name || source.name || '',
								creator: assetData.metadata.creator || source.creator || null,
								status: assetData.metadata.status || 'draft',
								categories: assetData.metadata.categories || [],
								topics: assetData.metadata.topics || [],
								content: assetData.metadata.content || null,
								thumbnail: assetData.metadata.thumbnail || null,
								description: assetData.metadata.description || '',
								externalRecipients: [],
								dateCreated: source.createdAt || null,
								lastUpdate: source.updatedAt || null,
								releaseDate: assetData.metadata.releaseDate || null,
								authUsers: source.authUsers || [],
							});
						}

						const postData = {
							id: assetId || null,
							title: meta.name || source.name || '',
							url: meta.url || null,
							creator: meta.creator || source.creator || null,
							status: meta.status || 'draft',
							categories: meta.categories || [],
							topics: meta.topics || [],
							content: meta.content || null,
							thumbnail: meta.thumbnail || null,
							description: meta.description || '',
							externalRecipients: [],
							dateCreated: source.createdAt || null,
							lastUpdate: source.updatedAt || null,
							releaseDate: meta.releaseDate || null,
							authUsers: source.authUsers || [],
						};

						// Update current data
						Object.keys(postData).forEach((key) => {
							handleCurrentPostUpdate({ field: key, value: postData[key as keyof typeof postData] });
						});

						// Set original data for comparison
						dispatch(setOriginalData(postData as any));
					} catch (e) {
						console.error(e);
					}

					handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				}
			} else {
				// Clear the post if we're creating a new post (assetId is undefined)
				// but have content from an existing post (currentPost.data.id exists)
				// This handles the case where user navigates from editing an existing post to creating new
				if (currentPost.data.id) dispatch(currentPostClear());
			}
			previousAssetIdRef.current = assetId;
		}
	}

	React.useEffect(() => {
		(async function () {
			await loadPostData();
		})();
	}, [assetId, portalProvider.current?.id]);

	React.useEffect(() => {
		if (props.staticPage) {
			handleCurrentPostUpdate({
				field: 'categories',
				value: [{ id: Date.now().toString(), name: currentPost.data.title }],
			});
			handleCurrentPostUpdate({ field: 'topics', value: [currentPost.data.title] });
		}
	}, [props.staticPage, currentPost.data.title]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (portalProvider.current?.id) {
				if (currentPost.editor.focusedBlock) {
					switch (currentPost.editor.focusedBlock.type) {
						case 'ordered-list':
						case 'unordered-list':
						case 'quote':
						case 'code':
							if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
								handleKeyAddBlock(event);
							}
							break;
						case 'paragraph':
						case 'header-1':
						case 'header-2':
						case 'header-3':
						case 'header-4':
						case 'header-5':
						case 'header-6':
							if (event.key === 'Enter') {
								handleKeyAddBlock(event);
							}
							break;
						default:
							break;
					}
				}
				if (
					event.key === 'Tab' &&
					!event.shiftKey &&
					!currentPost.editor.toggleBlockFocus &&
					currentPost.editor.focusedBlock
				) {
					const lastBlockIndex = currentPost.data?.content ? currentPost.data.content.length - 1 : 0;
					if (
						!currentPost.data?.content?.length ||
						currentPost.data?.content?.[lastBlockIndex].id === currentPost.editor.focusedBlock.id
					) {
						event.preventDefault();
						handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: true });
					}
				}
				if (event.key === 'Backspace' && currentPost.editor.focusedBlock && !currentPost.editor.titleFocused) {
					const currentBlockIndex = currentPost?.data?.content?.findIndex(
						(block: ArticleBlockType) => block.id === currentPost.editor.focusedBlock.id
					);
					const currentBlock = currentPost.data.content[currentBlockIndex];

					// Check if content is empty or will be empty after this backspace
					const isEmpty =
						!currentBlock.content.length ||
						((currentBlock.type === 'ordered-list' || currentBlock.type === 'unordered-list') &&
							currentBlock.content === '<li></li>') ||
						currentBlock.content === '<li><br></li>' ||
						currentBlock.content === '<br>';

					// For list items, also check if we're about to delete the last character in a single-item list
					let willBeEmpty = false;
					if (currentBlock.type === 'ordered-list' || currentBlock.type === 'unordered-list') {
						// Count the number of <li> elements
						const liCount = (currentBlock.content.match(/<li>/gi) || []).length;

						// Only proceed if there's exactly one list item
						if (liCount === 1) {
							const textContent = currentBlock.content.replace(/<[^>]*>/g, '').trim();
							const selection = window.getSelection();
							if (selection && selection.rangeCount > 0) {
								const range = selection.getRangeAt(0);
								// If cursor is at position 1 or less and there's only 1 character or less, this backspace will empty it
								willBeEmpty = textContent.length <= 1 && range.startOffset <= 1;
							}
						}
					}

					if (currentBlock && !(currentBlock.type === 'image') && (isEmpty || willBeEmpty)) {
						event.preventDefault();
						deleteBlock(currentBlock.id);
						if (currentBlockIndex > 0) {
							const previousBlock = currentPost.data.content[currentBlockIndex - 1];
							handleCurrentPostUpdate({ field: 'focusedBlock', value: previousBlock });
							handleCurrentPostUpdate({ field: 'lastAddedBlockId', value: previousBlock.id });
						} else if (currentPost.data.content.length > 1) {
							const nextBlock = currentPost.data.content[1];
							handleCurrentPostUpdate({ field: 'focusedBlock', value: nextBlock });
							handleCurrentPostUpdate({ field: 'lastAddedBlockId', value: nextBlock.id });
						}
					}
				}
				if (currentPost.editor.focusedBlock && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
					const currentBlockIndex = currentPost?.data?.content?.findIndex(
						(block: ArticleBlockType) => block.id === currentPost.editor.focusedBlock.id
					);
					const currentBlock = currentPost.data.content[currentBlockIndex];

					const selection = window.getSelection();
					const isTextHighlighted = selection && !selection.isCollapsed;

					const disabledNavigation =
						isTextHighlighted ||
						!currentBlock.type ||
						currentPost.editor.toggleBlockFocus ||
						currentBlock.type === 'quote' ||
						currentBlock.type === 'ordered-list' ||
						currentBlock.type === 'unordered-list' ||
						currentBlock.type === 'code';

					if (!disabledNavigation) {
						if (event.key === 'ArrowDown' && currentBlockIndex < currentPost.data.content.length - 1) {
							event.preventDefault();
							const nextBlock = currentPost.data.content[currentBlockIndex + 1];
							handleCurrentPostUpdate({ field: 'focusedBlock', value: nextBlock });
							handleCurrentPostUpdate({ field: 'lastAddedBlockId', value: nextBlock.id });
						} else if (event.key === 'ArrowUp' && currentBlockIndex > 0) {
							event.preventDefault();
							const previousBlock = currentPost.data.content[currentBlockIndex - 1];
							handleCurrentPostUpdate({ field: 'focusedBlock', value: previousBlock });
							handleCurrentPostUpdate({ field: 'lastAddedBlockId', value: previousBlock.id });
						}
					}
				}

				if (event.key === 'Enter' && (!currentPost.data.content || currentPost.data.content.length <= 0)) {
					handleKeyAddBlock(event);
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [
		currentPost.data.content,
		currentPost.editor.focusedBlock,
		currentPost.editor.toggleBlockFocus,
		currentPost.editor.titleFocused,
		portalProvider.current,
	]);

	function handleKeyAddBlock(event: any) {
		event.preventDefault();
		addBlock(ArticleBlockEnum.Paragraph);
		handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: false });
	}

	const onDragEnd = (result: any) => {
		if (!result.destination) {
			return;
		}

		const items = Array.from(currentPost.data.content);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		handleCurrentPostUpdate({ field: 'content', value: items });
	};

	const handleEditorClick = () => {
		if (!currentPost.data.content || currentPost.data.content.length <= 0) {
			addBlock(ArticleBlockEnum.Paragraph);
		}
	};

	const addBlock = (type: ArticleBlockEnum) => {
		if (currentPost.editor.loading.active) return;

		let content: any = null;

		switch (type) {
			case 'ordered-list':
			case 'unordered-list':
				content = '<li></li>';
				break;
			default:
				content = '';
				break;
		}

		const newBlock: ArticleBlockType = {
			id: Date.now().toString(),
			type,
			content: content,
		};

		let updatedBlocks = [];
		const currentContent = currentPost.data.content || [];
		const focusedIndex = currentContent.findIndex(
			(block: ArticleBlockType) => block.id === currentPost.editor.focusedBlock?.id
		);
		if (focusedIndex === -1) {
			updatedBlocks = [...currentContent, newBlock];
		} else {
			const newBlocks = [...currentContent];
			newBlocks.splice(focusedIndex + 1, 0, newBlock);
			updatedBlocks = newBlocks;
		}

		handleCurrentPostUpdate({ field: 'content', value: updatedBlocks });
		handleCurrentPostUpdate({ field: 'lastAddedBlockId', value: newBlock.id });
	};

	const handleBlockChange = (args: { id: string; content?: string; type?: any; data?: any }) => {
		const updatedBlocks = [...currentPost.data.content].map((block) =>
			block.id === args.id
				? {
						...block,
						content: args.content ?? block.content ?? null,
						type: args.type ?? block.type,
						data: args.data ?? block.data ?? null,
				  }
				: block
		);
		handleCurrentPostUpdate({ field: 'content', value: updatedBlocks });
	};

	const deleteBlock = (id: string) => {
		const updatedBlocks = [...currentPost.data.content].filter((block) => block.id !== id);
		const deletedIndex = [...currentPost.data.content].findIndex((block) => block.id === id);

		if (deletedIndex > 0) {
			handleCurrentPostUpdate({ field: 'focusedBlock', value: updatedBlocks[deletedIndex - 1] });
		} else if (updatedBlocks.length > 0) {
			handleCurrentPostUpdate({ field: 'focusedBlock', value: updatedBlocks[0] });
		} else {
			handleCurrentPostUpdate({ field: 'focusedBlock', value: null });
		}

		handleCurrentPostUpdate({ field: 'content', value: updatedBlocks });
	};

	return (
		<S.Wrapper>
			<S.ToolbarWrapper>
				<ArticleToolbar
					addBlock={(type: ArticleBlockEnum) => addBlock(type)}
					viewMode={viewMode}
					handleInitAddBlock={(e) => handleKeyAddBlock(e)}
					handleSubmit={props.handleSubmit}
					handleStatusUpdate={props.handleStatusUpdate}
					handleRequestUpdate={props.handleRequestUpdate}
					handleSwitchOriginal={switchBetweenOriginal}
					staticPage={props.staticPage}
				/>
			</S.ToolbarWrapper>
			<S.EditorWrapper panelOpen={currentPost.editor.panelOpen} onClick={handleEditorClick}>
				{currentPost.data.content?.length ? (
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable droppableId={'blocks'}>
							{(provided) => (
								<S.Editor
									{...provided.droppableProps}
									ref={provided.innerRef}
									blockEditMode={currentPost.editor.blockEditMode}
								>
									{currentPost.data.content.map((block: ArticleBlockType, index: number) => (
										<ArticleBlock
											index={index}
											type={'post'}
											key={block.id}
											block={block}
											onChangeBlock={handleBlockChange}
											onDeleteBlock={deleteBlock}
											onFocus={() => handleCurrentPostUpdate({ field: 'focusedBlock', value: block })}
										/>
									))}
									{provided.placeholder}
								</S.Editor>
							)}
						</Droppable>
					</DragDropContext>
				) : (
					<S.BlocksEmpty className={'fade-in'}>
						<span>{language?.blocksEmpty}</span>
					</S.BlocksEmpty>
				)}
			</S.EditorWrapper>
		</S.Wrapper>
	);
}
