import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

import { aoDryRun, aoSend, createAtomicAsset } from '@permaweb/libs';

import { ContentEditable } from 'components/atoms/ContentEditable';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { ARTICLE_BLOCKS, ASSET_UPLOAD, ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { ArticleBlockEnum, ArticleBlockType, ArticleStatusType, NotificationType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { Image } from './Blocks/Image';
import { ArticleToolbar } from './ArticleToolbar';
import * as S from './styles';

function Block(props: {
	index: number;
	block: ArticleBlockType;
	blockEditMode: boolean;
	onChangeBlock: (id: string, content: any) => void;
	onDeleteBlock: (id: string) => void;
	autoFocus: boolean;
	onFocus: () => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	let useCustom: boolean = false;
	let element: any = null;

	switch (props.block.type) {
		case 'paragraph':
			element = 'p';
			break;
		case 'quote':
			element = 'blockquote';
			break;
		case 'ordered-list':
			element = 'ol';
			break;
		case 'unordered-list':
			element = 'ul';
			break;
		case 'code':
			element = 'code';
			break;
		case 'header-1':
			element = 'h1';
			break;
		case 'header-2':
			element = 'h2';
			break;
		case 'header-3':
			element = 'h3';
			break;
		case 'header-4':
			element = 'h4';
			break;
		case 'header-5':
			element = 'h5';
			break;
		case 'header-6':
			element = 'h6';
			break;
		case 'image':
			useCustom = true;
			element = (
				<Image
					content={props.block.content}
					onChange={(newContent: any) => props.onChangeBlock(props.block.id, newContent)}
				/>
			);
			break;
		default:
			element = 'p';
			break;
	}

	if (props.blockEditMode) {
		return (
			<Draggable draggableId={props.block.id} index={props.index}>
				{(provided) => (
					<S.ElementDragWrapper
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						onFocus={props.onFocus}
						tabIndex={-1}
					>
						<S.EDragWrapper>
							<S.EDragHandler tabIndex={-1}>
								<ReactSVG src={ASSETS.drag} />
							</S.EDragHandler>
						</S.EDragWrapper>
						<S.ElementWrapper className={'fade-in'}>
							<S.ElementToolbar tabIndex={-1}>
								<S.EToolbarHeader>
									<span>{ARTICLE_BLOCKS[props.block.type].label}</span>
								</S.EToolbarHeader>
								<S.EToolbarDelete>
									<IconButton
										type={'primary'}
										active={false}
										src={ASSETS.delete}
										handlePress={() => props.onDeleteBlock(props.block.id)}
										dimensions={{ wrapper: 23.5, icon: 13.5 }}
										tooltip={language.deleteBlock}
										tooltipPosition={'bottom-right'}
										noFocus
									/>
								</S.EToolbarDelete>
							</S.ElementToolbar>
							<S.Element blockEditMode={props.blockEditMode} type={props.block.type}>
								{useCustom ? (
									element
								) : (
									<ContentEditable
										element={element}
										value={props.block.content}
										onChange={(newContent: any) => props.onChangeBlock(props.block.id, newContent)}
										autoFocus={props.autoFocus}
									/>
								)}
							</S.Element>
						</S.ElementWrapper>
					</S.ElementDragWrapper>
				)}
			</Draggable>
		);
	}

	return (
		<S.ElementWrapper onFocus={props.onFocus} className={'fade-in'}>
			<S.Element blockEditMode={props.blockEditMode} type={props.block.type}>
				{useCustom ? (
					element
				) : (
					<ContentEditable
						element={element}
						value={props.block.content}
						onChange={(newContent: any) => props.onChangeBlock(props.block.id, newContent)}
						autoFocus={props.autoFocus}
					/>
				)}
			</S.Element>
		</S.ElementWrapper>
	);
}

// TODO: Links
// TODO: Media upload
// TODO: Categories
export default function ArticleEditor() {
	const navigate = useNavigate();
	const { assetId } = useParams<{ assetId?: string }>();

	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [title, setTitle] = React.useState<string>('');
	const [status, setStatus] = React.useState<ArticleStatusType>('draft');
	const [topics, setTopics] = React.useState<string[]>([]);
	const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([]);

	const [focusedBlock, setFocusedBlock] = React.useState<ArticleBlockType | null>(null);
	const [lastAddedBlockId, setLastAddedBlockId] = React.useState<string | null>(null);
	const [panelOpen, setPanelOpen] = React.useState<boolean>(true);
	const [blockEditMode, setBlockEditMode] = React.useState<boolean>(false);
	const [toggleBlockFocus, setToggleBlockFocus] = React.useState<boolean>(false);

	const [loading, setLoading] = React.useState<{ active: boolean; message: string | null }>({
		active: false,
		message: null,
	});
	const [response, setResponse] = React.useState<NotificationType | null>(null);

	// TODO: Auth on post
	React.useEffect(() => {
		(async function () {
			if (portalProvider.current?.id) {
				if (assetId) {
					if (!checkValidAddress(assetId)) navigate(URLS.postCreateArticle(portalProvider.current.id));

					setLoading({ active: true, message: `${language.loadingPost}...` });
					try {
						const response = await aoDryRun({
							processId: assetId,
							action: 'Get-Post',
						});

						if (response) {
							if (response.title) setTitle(response.title);
							if (response.status) setStatus(response.status);
							if (response.topics) setTopics(response.topics);
							if (response.content?.length > 0) setBlocks(response.content);
						}
					} catch (e: any) {
						console.error(e);
					}
					setLoading({ active: false, message: null });
				}
			}
		})();
	}, [assetId, portalProvider.current]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (focusedBlock) {
				switch (focusedBlock.type) {
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
			if (event.key === 'Tab' && !event.shiftKey && !toggleBlockFocus && focusedBlock) {
				const lastBlockIndex = blocks.length - 1;
				if (!blocks.length || blocks[lastBlockIndex].id === focusedBlock.id) {
					event.preventDefault();
					setToggleBlockFocus(true);
				}
			}
			if (event.key === 'Backspace' && focusedBlock) {
				const currentBlockIndex = blocks.findIndex((block: ArticleBlockType) => block.id === focusedBlock.id);
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
						setFocusedBlock(previousBlock);
						setLastAddedBlockId(previousBlock.id);
					} else if (blocks.length > 1) {
						const nextBlock = blocks[1];
						setFocusedBlock(nextBlock);
						setLastAddedBlockId(nextBlock.id);
					}
				}
			}
			if (focusedBlock && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
				const currentBlockIndex = blocks.findIndex((block: ArticleBlockType) => block.id === focusedBlock.id);
				const currentBlock = blocks[currentBlockIndex];

				const disabledNavigation =
					!currentBlock.type ||
					currentBlock.type === 'quote' ||
					currentBlock.type === 'ordered-list' ||
					currentBlock.type === 'unordered-list' ||
					currentBlock.type === 'code';

				if (!disabledNavigation) {
					if (event.key === 'ArrowDown' && currentBlockIndex < blocks.length - 1) {
						event.preventDefault();
						const nextBlock = blocks[currentBlockIndex + 1];
						setFocusedBlock(nextBlock);
						setLastAddedBlockId(nextBlock.id);
					} else if (event.key === 'ArrowUp' && currentBlockIndex > 0) {
						event.preventDefault();
						const previousBlock = blocks[currentBlockIndex - 1];
						setFocusedBlock(previousBlock);
						setLastAddedBlockId(previousBlock.id);
					}
				}
			}
			if (event.key === 'Enter' && (!blocks || blocks.length <= 0)) {
				handleKeyAddBlock(event);
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [blocks, focusedBlock, toggleBlockFocus]);

	function getSubmitDisabled() {
		return !blocks || blocks.length <= 0 || !blocks.some((block) => block.content.length > 0);
	}

	async function handleSubmit() {
		if (arProvider.wallet && arProvider.profile?.id && portalProvider.current?.id) {
			setLoading({ active: true, message: `${language.savingPost}...` });

			const data = {
				Title: title,
				Status: status,
				Content: blocks,
				Topics: topics,
				Categories: [{ label: 'Category 1', link: 'https://test.com' }], // TODO
			};

			if (assetId) {
				try {
					const assetContentUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Post',
						data: data,
					});

					console.log(`Asset content update: ${assetContentUpdateId}`);

					setResponse({ status: 'success', message: `${language.postUpdated}!` });
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? language.errorUpdatingPost });
				}
			} else {
				try {
					console.log('Creating asset...');

					const assetDataFetch = await fetch(getTxEndpoint(ASSET_UPLOAD.src.data));
					const dataSrc = await assetDataFetch.text();

					const assetId = await createAtomicAsset(
						{
							title: title,
							description: title,
							type: ASSET_UPLOAD.ansType,
							topics: topics,
							data: dataSrc,
							contentType: ASSET_UPLOAD.contentType,
							creator: arProvider.profile.id,
							tags: [{ name: 'Status', value: status }],
							src: ASSET_UPLOAD.src.process,
						},
						arProvider.wallet,
						(status) => console.log(status)
					);

					console.log(`Asset: ${assetId}`);

					const assetContentUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Post',
						data: data,
					});

					console.log(`Asset content update: ${assetContentUpdateId}`);

					const assetHoldersUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Post-Balance-Holders',
						data: { Recipients: [portalProvider.current.id] },
					});

					console.log(`Asset holders update: ${assetHoldersUpdateId}`);

					setResponse({ status: 'success', message: `${language.postSaved}!` });
					navigate(`${URLS.postEditArticle(portalProvider.current.id)}${assetId}`);
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? 'Error creating post' });
				}
			}
			setLoading({ active: false, message: null });
		}
	}

	function handleKeyAddBlock(event: any) {
		event.preventDefault();
		addBlock(blocks && blocks.length > 0 ? ArticleBlockEnum.Paragraph : ArticleBlockEnum.Header1);
		setToggleBlockFocus(false);
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
		if (loading.active) return;

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
			const focusedIndex = prevBlocks.findIndex((block) => block.id === focusedBlock?.id);
			if (focusedIndex === -1) {
				return [...prevBlocks, newBlock];
			} else {
				const newBlocks = [...prevBlocks];
				newBlocks.splice(focusedIndex + 1, 0, newBlock);
				return newBlocks;
			}
		});
		setLastAddedBlockId(newBlock.id);
	};

	const handleBlockChange = (id: string, content: string) => {
		setBlocks((prevBlocks) => prevBlocks.map((block) => (block.id === id ? { ...block, content } : block)));
	};

	const deleteBlock = (id: string) => {
		setBlocks((prevBlocks) => {
			const updatedBlocks = prevBlocks.filter((block) => block.id !== id);
			const deletedIndex = prevBlocks.findIndex((block) => block.id === id);

			if (deletedIndex > 0) {
				setFocusedBlock(updatedBlocks[deletedIndex - 1]);
			} else if (updatedBlocks.length > 0) {
				setFocusedBlock(updatedBlocks[0]);
			} else {
				setFocusedBlock(null);
			}

			return updatedBlocks;
		});
	};

	const editor = React.useMemo(() => {
		if (blocks && blocks.length) {
			return (
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId={'blocks'}>
						{(provided) => (
							<S.Editor {...provided.droppableProps} ref={provided.innerRef} blockEditMode={blockEditMode}>
								{blocks.map((block, index) => (
									<Block
										index={index}
										key={block.id}
										block={block}
										blockEditMode={blockEditMode}
										onChangeBlock={handleBlockChange}
										onDeleteBlock={deleteBlock}
										autoFocus={block.id === lastAddedBlockId}
										onFocus={() => setFocusedBlock(block)}
									/>
								))}
								{provided.placeholder}
							</S.Editor>
						)}
					</Droppable>
				</DragDropContext>
			);
		}
		return (
			<S.BlocksEmpty className={'fade-in'}>
				<span>{language.blocksEmpty}</span>
			</S.BlocksEmpty>
		);
	}, [blocks, blockEditMode, lastAddedBlockId, focusedBlock]);

	return (
		<>
			<S.Wrapper>
				<S.ToolbarWrapper>
					<ArticleToolbar
						postTitle={title}
						setPostTitle={(value: string) => setTitle(value)}
						status={status}
						setStatus={(value: ArticleStatusType) => setStatus(value)}
						topics={topics}
						setTopics={(newTopics: string[]) => setTopics(newTopics)}
						addBlock={(type: ArticleBlockEnum) => addBlock(type)}
						blockEditMode={blockEditMode}
						toggleBlockEditMode={() => setBlockEditMode(!blockEditMode)}
						panelOpen={panelOpen}
						togglePanelOpen={() => setPanelOpen(!panelOpen)}
						toggleBlockFocus={toggleBlockFocus}
						setToggleBlockFocus={() => setToggleBlockFocus(false)}
						handleInitAddBlock={(e) => handleKeyAddBlock(e)}
						handleSubmit={handleSubmit}
						submitDisabled={getSubmitDisabled()}
						loading={loading.active}
					/>
				</S.ToolbarWrapper>
				<S.EditorWrapper panelOpen={panelOpen} onClick={handleEditorClick}>
					{editor}
				</S.EditorWrapper>
			</S.Wrapper>
			{loading.active && <Loader message={loading.message} />}
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
		</>
	);
}
