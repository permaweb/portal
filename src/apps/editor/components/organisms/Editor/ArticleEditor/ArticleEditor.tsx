import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostClear, currentPostUpdate } from 'editor/store/post';

import { Loader } from 'components/atoms/Loader';
import { URLS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType, RequestUpdateType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ArticleBlock } from './ArticleBlock';
import { ArticleToolbar } from './ArticleToolbar';
import * as S from './styles';

export default function ArticleEditor(props: {
	handleSubmit: () => void;
	handleRequestUpdate: (updateType: RequestUpdateType) => void;
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

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	React.useEffect(() => {
		(async function () {
			if (portalProvider.current?.id) {
				if (assetId) {
					if (!checkValidAddress(assetId)) navigate(URLS.postCreateArticle(portalProvider.current.id));

					handleCurrentPostUpdate({
						field: 'loading',
						value: { active: true, message: `${language?.loadingPost}...` },
					});
					try {
						const response = await permawebProvider.libs.getAtomicAsset(assetId);

						handleCurrentPostUpdate({ field: 'title', value: response?.name });
						handleCurrentPostUpdate({ field: 'creator', value: response?.creator });
						handleCurrentPostUpdate({ field: 'status', value: response?.metadata?.status });
						handleCurrentPostUpdate({ field: 'categories', value: response?.metadata?.categories });
						handleCurrentPostUpdate({ field: 'topics', value: response?.metadata?.topics });
						handleCurrentPostUpdate({ field: 'content', value: response?.metadata?.content });
						handleCurrentPostUpdate({ field: 'thumbnail', value: response?.metadata?.thumbnail });
						handleCurrentPostUpdate({ field: 'description', value: response?.metadata?.description });
					} catch (e: any) {
						console.error(e);
					}
					handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				} else {
					dispatch(currentPostClear());
				}
			}
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
						!currentPost.data.content.length ||
						currentPost.data.content[lastBlockIndex].id === currentPost.editor.focusedBlock.id
					) {
						event.preventDefault();
						handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: true });
					}
				}
				if (event.key === 'Backspace' && currentPost.editor.focusedBlock && !currentPost.editor.titleFocused) {
					const currentBlockIndex = currentPost.data.content.findIndex(
						(block: ArticleBlockType) => block.id === currentPost.editor.focusedBlock.id
					);
					const currentBlock = currentPost.data.content[currentBlockIndex];
					if (
						(currentBlock &&
							!(currentBlock.type === 'image') &&
							(!currentBlock.content.length ||
								(currentBlock.type === 'ordered-list' && currentBlock.content === '<li></li>') ||
								currentBlock.content === '<li><br></li>' ||
								(currentBlock.type === 'ordered-list' && currentBlock.content === '<li></li>') ||
								currentBlock.content === '<li><br></li>')) ||
						currentBlock.content === '<br>'
					) {
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
					const currentBlockIndex = currentPost.data.content.findIndex(
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
			case 'paragraph':
			case 'quote':
			case 'code':
			case 'header-1':
			case 'header-2':
			case 'header-3':
			case 'header-4':
			case 'header-5':
			case 'header-6':
			case 'image':
				content = '';
				break;
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

	const handleBlockChange = (args: { id: string; content: string; type?: any; data?: any }) => {
		const updatedBlocks = [...currentPost.data.content].map((block) =>
			block.id === args.id
				? { ...block, content: args.content, type: args.type ?? block.type, data: args.data ?? block.data ?? null }
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
		<>
			<S.Wrapper>
				<S.ToolbarWrapper>
					<ArticleToolbar
						addBlock={(type: ArticleBlockEnum) => addBlock(type)}
						handleInitAddBlock={(e) => handleKeyAddBlock(e)}
						handleSubmit={props.handleSubmit}
						handleRequestUpdate={props.handleRequestUpdate}
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
			{currentPost.editor.loading.active && <Loader message={currentPost.editor.loading.message} />}
		</>
	);
}
