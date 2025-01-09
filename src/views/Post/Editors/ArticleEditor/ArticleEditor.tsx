import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { aoDryRun, aoSend, createAtomicAsset, globalLog, mapFromProcessCase, mapToProcessCase } from '@permaweb/libs';

import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { ASSET_UPLOAD, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { ArticleBlockEnum, ArticleBlockType, NotificationType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { RootState } from 'store';
import { currentPostUpdate } from 'store/post';

import { ArticleBlock } from './ArticleBlock';
import { ArticleToolbar } from './ArticleToolbar';
import * as S from './styles';

export default function ArticleEditor() {
	const navigate = useNavigate();
	const { assetId } = useParams<{ assetId?: string }>();

	const dispatch = useDispatch();

	const currentPost = useSelector((state: RootState) => state.currentPost);

	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// const [title, setTitle] = React.useState<string>('');
	// const [status, setStatus] = React.useState<ArticleStatusType>('draft');
	// const [categories, setCategories] = React.useState<PortalCategoryType[]>([]);
	// const [topics, setTopics] = React.useState<string[]>([]);
	const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([]);

	// const [titleFocused, setTitleFocused] = React.useState<boolean>(false);
	// const [focusedBlock, setFocusedBlock] = React.useState<ArticleBlockType | null>(null);
	// const [lastAddedBlockId, setLastAddedBlockId] = React.useState<string | null>(null);
	// const [panelOpen, setPanelOpen] = React.useState<boolean>(true);
	// const [blockEditMode, setBlockEditMode] = React.useState<boolean>(false);
	// const [toggleBlockFocus, setToggleBlockFocus] = React.useState<boolean>(false);

	// const [loading, setLoading] = React.useState<{ active: boolean; message: string | null }>({
	// 	active: false,
	// 	message: null,
	// });
	const [response, setResponse] = React.useState<NotificationType | null>(null);

	const handleDispatch = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	console.log(currentPost);

	// TODO: Set from redux
	React.useEffect(() => {
		(async function () {
			if (portalProvider.current?.id) {
				if (assetId) {
					if (!checkValidAddress(assetId)) navigate(URLS.postCreateArticle(portalProvider.current.id));

					handleDispatch({ field: 'loading', value: { active: true, message: `${language.loadingPost}...` } });
					try {
						const response = await aoDryRun({
							processId: assetId,
							action: 'Get-Asset',
						});

						if (response) {
							if (response.Title) handleDispatch({ field: 'title', value: response.Title });
							if (response.Status) handleDispatch({ field: 'status', value: response.Status });
							if (response.Categories)
								handleDispatch({ field: 'categories', value: mapFromProcessCase(response.Categories) });
							if (response.Topics) handleDispatch({ field: 'topics', value: mapFromProcessCase(response.Topics) });
							if (response.Content?.length > 0) setBlocks(mapFromProcessCase(response.Content));
						}
					} catch (e: any) {
						console.error(e);
					}
					handleDispatch({ field: 'loading', value: { active: false, message: null } });
				}
			}
		})();
	}, [assetId, portalProvider.current?.id]);

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
					const lastBlockIndex = blocks.length - 1;
					if (!blocks.length || blocks[lastBlockIndex].id === currentPost.editor.focusedBlock.id) {
						event.preventDefault();
						handleDispatch({ field: 'toggleBlockFocus', value: true });
					}
				}
				if (event.key === 'Backspace' && currentPost.editor.focusedBlock && !currentPost.editor.titleFocused) {
					const currentBlockIndex = blocks.findIndex(
						(block: ArticleBlockType) => block.id === currentPost.editor.focusedBlock.id
					);
					const currentBlock = blocks[currentBlockIndex];
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
							const previousBlock = blocks[currentBlockIndex - 1];
							handleDispatch({ field: 'focusedBlock', value: previousBlock });
							handleDispatch({ field: 'lastAddedBlockId', value: previousBlock.id });
						} else if (blocks.length > 1) {
							const nextBlock = blocks[1];
							handleDispatch({ field: 'focusedBlock', value: nextBlock });
							handleDispatch({ field: 'lastAddedBlockId', value: nextBlock.id });
						}
					}
				}
				if (currentPost.editor.focusedBlock && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
					const currentBlockIndex = blocks.findIndex(
						(block: ArticleBlockType) => block.id === currentPost.editor.focusedBlock.id
					);
					const currentBlock = blocks[currentBlockIndex];

					const selection = window.getSelection();
					const isTextHighlighted = selection && !selection.isCollapsed;

					const disabledNavigation =
						isTextHighlighted ||
						!currentBlock.type ||
						currentBlock.type === 'quote' ||
						currentBlock.type === 'ordered-list' ||
						currentBlock.type === 'unordered-list' ||
						currentBlock.type === 'code';

					if (!disabledNavigation) {
						if (event.key === 'ArrowDown' && currentBlockIndex < blocks.length - 1) {
							event.preventDefault();
							const nextBlock = blocks[currentBlockIndex + 1];
							handleDispatch({ field: 'focusedBlock', value: nextBlock });
							handleDispatch({ field: 'lastAddedBlockId', value: nextBlock.id });
						} else if (event.key === 'ArrowUp' && currentBlockIndex > 0) {
							event.preventDefault();
							const previousBlock = blocks[currentBlockIndex - 1];
							handleDispatch({ field: 'focusedBlock', value: previousBlock });
							handleDispatch({ field: 'lastAddedBlockId', value: previousBlock.id });
						}
					}
				}

				if (event.key === 'Enter' && (!blocks || blocks.length <= 0)) {
					handleKeyAddBlock(event);
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [
		blocks,
		currentPost.editor.focusedBlock,
		currentPost.editor.toggleBlockFocus,
		currentPost.editor.titleFocused,
		portalProvider.current,
	]);

	function validateSubmit() {
		let valid: boolean = true;
		let message: string | null = null;

		if (!currentPost.data.title) {
			valid = false;
			message = 'Post title is required';
		}
		if (!currentPost.data.status) {
			valid = false;
			message = 'Status is required';
		}
		if (!blocks?.length) {
			valid = false;
			message = 'No content found in post';
		}
		if (!currentPost.data.categories?.length) {
			valid = false;
			message = 'Categories are required';
		}
		if (!currentPost.data.categories?.length) {
			valid = false;
			message = 'Topics are required';
		}

		if (!valid) {
			setResponse({ status: 'warning', message: message });
		}

		return valid;
	}

	async function handleSubmit() {
		if (arProvider.wallet && arProvider.profile?.id && portalProvider.current?.id) {
			handleDispatch({ field: 'loading', value: { active: true, message: `${language.savingPost}...` } });
			if (!validateSubmit()) {
				handleDispatch({ field: 'loading', value: { active: false, message: null } });
				return;
			}

			const data = {
				Title: currentPost.data.title,
				Status: currentPost.data.status,
				Content: mapToProcessCase(blocks),
				Topics: mapToProcessCase(currentPost.data.topics),
				Categories: mapToProcessCase(currentPost.data.categories),
			};

			if (assetId) {
				try {
					const assetContentUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						data: data,
					});

					globalLog(`Asset content update: ${assetContentUpdateId}`);

					setResponse({ status: 'success', message: `${language.postUpdated}!` });

					portalProvider.refreshCurrentPortal('assets');
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? language.errorUpdatingPost });
				}
			} else {
				try {
					const assetDataFetch = await fetch(getTxEndpoint(ASSET_UPLOAD.src.data));
					const dataSrc = await assetDataFetch.text();

					const assetId = await createAtomicAsset(
						{
							title: currentPost.data.title,
							description: currentPost.data.title,
							type: ASSET_UPLOAD.ansType,
							topics: currentPost.data.topics,
							data: dataSrc,
							contentType: ASSET_UPLOAD.contentType,
							creator: arProvider.profile.id,
							tags: [{ name: 'Status', value: status }],
							src: ASSET_UPLOAD.src.process,
						},
						arProvider.wallet,
						(status) => globalLog(status)
					);

					globalLog(`Asset ID: ${assetId}`);

					const assetContentUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						data: data,
					});

					globalLog(`Asset content update: ${assetContentUpdateId}`);

					const indexRecipients = [portalProvider.current.id];

					for (const recipient of indexRecipients) {
						const zoneIndexUpdateId = await aoSend({
							processId: recipient,
							wallet: arProvider.wallet,
							action: 'Add-Index-Id',
							tags: [{ name: 'IndexId', value: assetId }],
						});

						globalLog(`Zone index update: ${zoneIndexUpdateId}`);
					}

					const assetIndexUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Send-Index',
						tags: [
							{ name: 'AssetType', value: ASSET_UPLOAD.ansType },
							{ name: 'ContentType', value: ASSET_UPLOAD.contentType },
							{ name: 'DateAdded', value: new Date().getTime().toString() },
						],
						data: { Recipients: indexRecipients },
					});

					globalLog(`Asset index update: ${assetIndexUpdateId}`);

					portalProvider.refreshCurrentPortal('assets');

					setResponse({ status: 'success', message: `${language.postSaved}!` });

					navigate(`${URLS.postEditArticle(portalProvider.current.id)}${assetId}`);
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? 'Error creating post' });
				}
			}
			handleDispatch({ field: 'loading', value: { active: false, message: null } });
		}
	}

	function handleKeyAddBlock(event: any) {
		event.preventDefault();
		addBlock(blocks && blocks.length > 0 ? ArticleBlockEnum.Paragraph : ArticleBlockEnum.Header1);
		handleDispatch({ field: 'toggleBlockFocus', value: false });
	}

	const onDragEnd = (result: any) => {
		if (!result.destination) {
			return;
		}

		const items = Array.from(blocks);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setBlocks(items);
	};

	const handleEditorClick = () => {
		if (!blocks || blocks.length <= 0) {
			addBlock(ArticleBlockEnum.Header1);
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

		setBlocks((prevBlocks) => {
			const focusedIndex = prevBlocks.findIndex((block) => block.id === currentPost.editor.focusedBlock?.id);
			if (focusedIndex === -1) {
				return [...prevBlocks, newBlock];
			} else {
				const newBlocks = [...prevBlocks];
				newBlocks.splice(focusedIndex + 1, 0, newBlock);
				return newBlocks;
			}
		});
		handleDispatch({ field: 'lastAddedBlockId', value: newBlock.id });
	};

	const handleBlockChange = (id: string, content: string, data?: any) => {
		setBlocks((prevBlocks) =>
			prevBlocks.map((block) =>
				block.id === id ? (data ? { ...block, content, data } : { ...block, content }) : block
			)
		);
	};

	const deleteBlock = (id: string) => {
		setBlocks((prevBlocks) => {
			const updatedBlocks = prevBlocks.filter((block) => block.id !== id);
			const deletedIndex = prevBlocks.findIndex((block) => block.id === id);

			if (deletedIndex > 0) {
				handleDispatch({ field: 'focusedBlock', value: updatedBlocks[deletedIndex - 1] });
			} else if (updatedBlocks.length > 0) {
				handleDispatch({ field: 'focusedBlock', value: updatedBlocks[0] });
			} else {
				handleDispatch({ field: 'focusedBlock', value: null });
			}

			return updatedBlocks;
		});
	};

	return (
		<>
			<S.Wrapper>
				<S.ToolbarWrapper>
					<ArticleToolbar
						addBlock={(type: ArticleBlockEnum) => addBlock(type)}
						handleInitAddBlock={(e) => handleKeyAddBlock(e)}
						handleSubmit={handleSubmit}
					/>
				</S.ToolbarWrapper>
				<S.EditorWrapper panelOpen={currentPost.editor.panelOpen} onClick={handleEditorClick}>
					{blocks?.length ? (
						<DragDropContext onDragEnd={onDragEnd}>
							<Droppable droppableId={'blocks'}>
								{(provided) => (
									<S.Editor
										{...provided.droppableProps}
										ref={provided.innerRef}
										blockEditMode={currentPost.editor.blockEditMode}
									>
										{blocks.map((block, index) => (
											<ArticleBlock
												index={index}
												key={block.id}
												block={block}
												blockEditMode={currentPost.editor.blockEditMode}
												onChangeBlock={handleBlockChange}
												onDeleteBlock={deleteBlock}
												autoFocus={block.id === currentPost.editor.lastAddedBlockId}
												onFocus={() => handleDispatch({ field: 'focusedBlock', value: block })}
											/>
										))}
										{provided.placeholder}
									</S.Editor>
								)}
							</Droppable>
						</DragDropContext>
					) : (
						<S.BlocksEmpty className={'fade-in'}>
							<span>{language.blocksEmpty}</span>
						</S.BlocksEmpty>
					)}
				</S.EditorWrapper>
			</S.Wrapper>
			{currentPost.editor.loading.active && <Loader message={currentPost.editor.loading.message} />}
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
		</>
	);
}
