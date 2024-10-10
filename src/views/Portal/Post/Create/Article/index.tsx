import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ReactSVG } from 'react-svg';

import { IconButton } from 'components/atoms/IconButton';
import { ASSETS } from 'helpers/config';
import { ArticleBlockElementType, ArticleBlockType } from 'helpers/types';
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
							<S.EDragHandler {...provided.dragHandleProps}>
								<ReactSVG src={ASSETS.drag} />
							</S.EDragHandler>
						</S.EDragWrapper>
					)}
					<S.ElementWrapper>
						{props.blockEditMode && (
							<>
								<S.ElementToolbar>
									<S.EToolbarHeader>
										<span>{props.block.type.replace('-', ' ').toUpperCase()}</span>
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

export default function Article() {
	// const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([]);
	const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([
		{ id: '1', type: 'code', content: 'for i = 0; i < elements.length; i++ <br>&nbsp;&nbsp;runFn()<br>end' }, // TODO: Can't add code
		{ id: '2', type: 'quote', content: 'My famous quote' }, // TODO: Can't add quotes
		// {
		// 	id: '1',
		// 	type: 'paragraph',
		// 	content:
		// 		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat.',
		// },
		// { id: '2', type: 'header-1', content: 'Header 1' },
		// { id: '3', type: 'header-2', content: 'Header 2' },
		// { id: '4', type: 'header-3', content: 'Header 3' },
		// { id: '5', type: 'header-4', content: 'Header 4' },
		// { id: '6', type: 'header-5', content: 'Header 5' },
		// { id: '7', type: 'header-6', content: 'Header 6' },
	]);
	const [blockEditMode, setBlockEditMode] = React.useState<boolean>(true);
	const [lastAddedBlockId, setLastAddedBlockId] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (blocks.length <= 0) {
			addBlock('header-1');
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

	const addBlock = (type: ArticleBlockElementType) => {
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
					addBlock={(type: ArticleBlockElementType) => addBlock(type)}
					blockEditMode={blockEditMode}
					toggleBlockEditMode={() => setBlockEditMode(!blockEditMode)}
				/>
			</S.ToolbarWrapper>
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId={'blocks'}>
					{(provided) => (
						<S.EditorWrapper {...provided.droppableProps} ref={provided.innerRef} blockEditMode={blockEditMode}>
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
						</S.EditorWrapper>
					)}
				</Droppable>
			</DragDropContext>
			{/* <S.PreviewWrapper>
				<h3>Rendered Preview:</h3>
				{blocks.map((block) => (
					<div key={block.id} dangerouslySetInnerHTML={{ __html: block.content }} />
				))}
			</S.PreviewWrapper> */}
			{/* <S.OutputWrapper>
				<h3>HTML Output:</h3>
				<pre>{JSON.stringify(blocks, null, 2)}</pre>
			</S.OutputWrapper> */}
		</S.Wrapper>
	);
}
