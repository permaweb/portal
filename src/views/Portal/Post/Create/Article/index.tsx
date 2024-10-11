import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ReactSVG } from 'react-svg';

import { IconButton } from 'components/atoms/IconButton';
import { ARTICLE_BLOCKS, ASSETS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ArticleToolbar } from './ArticleToolbar';
import * as S from './styles';

function ContentEditable(props: { value: string; onChange: (content: string) => void; autoFocus?: boolean }) {
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
			ref.current.focus();
		}
	}, [props.autoFocus]);

	const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
		const newValue = e.currentTarget.innerHTML;
		isUserInput.current = true;
		props.onChange(newValue);
	};

	return <div ref={ref} contentEditable onInput={handleInput} suppressContentEditableWarning={true} />;
}

function Block(props: {
	index: number;
	block: ArticleBlockType;
	blockEditMode: boolean;
	onChangeBlock: (id: string, content: any) => void;
	onDeleteBlock: (id: string) => void;
	autoFocus: boolean;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	let Element: any = null;

	switch (props.block.type) {
		case 'paragraph':
			Element = 'p';
			break;
		case 'quote':
			Element = 'blockquote';
			break;
		case 'ordered-list':
			Element = 'ol';
			break;
		case 'unordered-list':
			Element = 'ul';
			break;
		case 'code':
			Element = 'code';
			break;
		case 'header-1':
			Element = 'h1';
			break;
		case 'header-2':
			Element = 'h2';
			break;
		case 'header-3':
			Element = 'h3';
			break;
		case 'header-4':
			Element = 'h4';
			break;
		case 'header-5':
			Element = 'h5';
			break;
		case 'header-6':
			Element = 'h6';
			break;
		default:
			Element = 'p';
			break;
	}

	// TODO: Tab index
	return (
		<Draggable draggableId={props.block.id} index={props.index} className={'fade-in'}>
			{(provided) => (
				<S.ElementDragWrapper ref={provided.innerRef} {...provided.draggableProps}>
					{props.blockEditMode && (
						<S.EDragWrapper>
							<S.EDragHandler {...provided.dragHandleProps} tabIndex={-1}>
								<ReactSVG src={ASSETS.drag} />
							</S.EDragHandler>
						</S.EDragWrapper>
					)}
					<S.ElementWrapper>
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
							<Element>
								<ContentEditable
									value={props.block.content}
									onChange={(newContent: any) => props.onChangeBlock(props.block.id, newContent)}
									autoFocus={props.autoFocus}
								/>
							</Element>
						</S.Element>
					</S.ElementWrapper>
				</S.ElementDragWrapper>
			)}
		</Draggable>
	);
}

// TODO: Can't see quotes / code cursor
// TODO: No blocks indicator
// TODO: Enter key on header - create paragraph block
export default function Article() {
	const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([]);
	const [lastAddedBlockId, setLastAddedBlockId] = React.useState<string | null>(null);

	const [panelOpen, setPanelOpen] = React.useState<boolean>(true);
	const [blockEditMode, setBlockEditMode] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (blocks.length <= 0) {
			addBlock(ArticleBlockEnum.Header1);
		}
	}, []);

	const onDragEnd = (result: any) => {
		if (!result.destination) {
			return;
		}

		const items = Array.from(blocks);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setBlocks(items);
	};

	const handleBlockChange = (id: string, content: string) => {
		setBlocks((prevBlocks) => prevBlocks.map((block) => (block.id === id ? { ...block, content } : block)));
	};

	const addBlock = (type: ArticleBlockEnum) => {
		const newBlock: ArticleBlockType = {
			id: Date.now().toString(),
			type,
			content: type === 'ordered-list' || type === 'unordered-list' ? '<li></li>' : '',
		};
		setBlocks([...blocks, newBlock]);
		setLastAddedBlockId(newBlock.id);
	};

	const deleteBlock = (id: string) => {
		setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
	};

	return (
		<S.Wrapper>
			<S.ToolbarWrapper>
				<ArticleToolbar
					addBlock={(type: ArticleBlockEnum) => addBlock(type)}
					blockEditMode={blockEditMode}
					toggleBlockEditMode={() => setBlockEditMode(!blockEditMode)}
					panelOpen={panelOpen}
					togglePanelOpen={() => setPanelOpen(!panelOpen)}
				/>
			</S.ToolbarWrapper>
			<S.EditorWrapper panelOpen={panelOpen}>
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
									/>
								))}
								{provided.placeholder}
							</S.Editor>
						)}
					</Droppable>
				</DragDropContext>
			</S.EditorWrapper>
		</S.Wrapper>
	);
}
