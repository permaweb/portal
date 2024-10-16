import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ReactSVG } from 'react-svg';

import { IconButton } from 'components/atoms/IconButton';
import { ARTICLE_BLOCKS, ASSETS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { Image } from './blocks/Image';
import { ArticleToolbar } from './ArticleToolbar';
import * as S from './styles';

function ContentEditable(props: {
	element: any;
	value: string;
	onChange: (content: string) => void;
	autoFocus?: boolean;
}) {
	const ref = React.useRef<HTMLDivElement>(null);
	const isUserInput = React.useRef(false);

	React.useEffect(() => {
		if (ref.current && props.value !== ref.current.innerHTML && !isUserInput.current) {
			ref.current.innerHTML = props.value;
		}
		isUserInput.current = false;
	}, [props.value]);

	React.useEffect(() => {
		if (props.autoFocus && ref.current) {
			const focusElement = () => {
				ref.current?.focus();
				const range = document.createRange();
				const selection = window.getSelection();
				range.selectNodeContents(ref.current);
				range.collapse(false);
				selection?.removeAllRanges();
				selection?.addRange(range);
			};

			focusElement();
			setTimeout(focusElement, 0);
		}
	}, [props.autoFocus]);

	const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
		const newValue = e.currentTarget.innerHTML;
		isUserInput.current = true;
		props.onChange(newValue);
	};

	const Element = props.element;

	return <Element ref={ref} contentEditable onInput={handleInput} suppressContentEditableWarning={true} />;
}

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

	return (
		<Draggable draggableId={props.block.id} index={props.index}>
			{(provided) => (
				<S.ElementDragWrapper ref={provided.innerRef} {...provided.draggableProps} onFocus={props.onFocus}>
					{props.blockEditMode && (
						<S.EDragWrapper>
							<S.EDragHandler {...provided.dragHandleProps} tabIndex={-1}>
								<ReactSVG src={ASSETS.drag} />
							</S.EDragHandler>
						</S.EDragWrapper>
					)}
					<S.ElementWrapper className={'fade-in'}>
						{props.blockEditMode && (
							<>
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
							</>
						)}
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

// TODO: Links
export default function Article() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([]);
	const [focusedBlock, setFocusedBlock] = React.useState<ArticleBlockType | null>(null);
	const [lastAddedBlockId, setLastAddedBlockId] = React.useState<string | null>(null);
	const [panelOpen, setPanelOpen] = React.useState<boolean>(true);
	const [blockEditMode, setBlockEditMode] = React.useState<boolean>(true);
	const [postTitle, setPostTitle] = React.useState<string>('');

	const [toggleBlockFocus, setToggleBlockFocus] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (blocks.length <= 0) {
			addBlock(ArticleBlockEnum.Header1);
		}
	}, []);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			switch (focusedBlock.type) {
				case 'ordered-list':
				case 'unordered-list':
				case 'quote':
				case 'code':
					if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && focusedBlock) {
						event.preventDefault();
						addBlock(ArticleBlockEnum.Paragraph);
						setToggleBlockFocus(false);
					}
					break;
				case 'paragraph':
				case 'header-1':
				case 'header-2':
				case 'header-3':
				case 'header-4':
				case 'header-5':
				case 'header-6':
					if (event.key === 'Enter' && focusedBlock) {
						event.preventDefault();
						addBlock(ArticleBlockEnum.Paragraph);
						setToggleBlockFocus(false);
					}
					break;
				default:
					break;
			}
			if (event.key === 'Tab' && !event.shiftKey && !toggleBlockFocus) {
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
					currentBlock &&
					!(currentBlock.type === 'image') &&
					(!currentBlock.content.length ||
						(currentBlock.type === 'ordered-list' && currentBlock.content === '<li></li>') ||
						currentBlock.content === '<li><br></li>' ||
						(currentBlock.type === 'ordered-list' && currentBlock.content === '<li></li>') ||
						currentBlock.content === '<li><br></li>')
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
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [blocks, focusedBlock, toggleBlockFocus]);

	const onDragEnd = (result: any) => {
		if (!result.destination) {
			return;
		}

		const items = Array.from(blocks);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setBlocks(items);
	};

	const addBlock = (type: ArticleBlockEnum) => {
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
			const focusedIndex = prevBlocks.findIndex((block) => block.id === focusedBlock.id);
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
		setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
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
				<span>{`${language.blocksEmpty}!`}</span>
			</S.BlocksEmpty>
		);
	}, [blocks, blockEditMode, lastAddedBlockId, focusedBlock]);

	return (
		<S.Wrapper>
			<S.ToolbarWrapper>
				<ArticleToolbar
					postTitle={postTitle}
					setPostTitle={(value: string) => setPostTitle(value)}
					addBlock={(type: ArticleBlockEnum) => addBlock(type)}
					blockEditMode={blockEditMode}
					toggleBlockEditMode={() => setBlockEditMode(!blockEditMode)}
					panelOpen={panelOpen}
					togglePanelOpen={() => setPanelOpen(!panelOpen)}
					toggleBlockFocus={toggleBlockFocus}
					setToggleBlockFocus={() => setToggleBlockFocus(false)}
				/>
			</S.ToolbarWrapper>
			<S.EditorWrapper panelOpen={panelOpen}>{editor}</S.EditorWrapper>
		</S.Wrapper>
	);
}
