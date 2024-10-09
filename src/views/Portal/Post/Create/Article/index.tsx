import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { ReactSVG } from 'react-svg';

import { IconButton } from 'components/atoms/IconButton';
import { ASSETS } from 'helpers/config';
import { ArticleBlockElementType, ArticleBlockType } from 'helpers/types';

import { ArticleToolbar } from './ArticleToolbar';
import * as S from './styles';

function ContentEditable(props: { value: any; onChange: any }) {
	const ref = React.useRef(null);
	const isUserInput = React.useRef(false);

	React.useEffect(() => {
		if (ref.current && props.value !== ref.current.innerHTML && !isUserInput.current) {
			ref.current.innerHTML = props.value;
		}
		isUserInput.current = false;
	}, [props.value]);

	const handleInput = (e: any) => {
		const newValue = e.target.innerHTML;
		isUserInput.current = true;
		props.onChange(newValue);
	};

	return <div ref={ref} contentEditable onInput={handleInput} suppressContentEditableWarning={true} />;
}

// TODO: Auto focus
// TODO: All element types
function Block(props: {
	block: ArticleBlockType;
	blockEditMode: boolean;
	onChangeBlock: (id: string, content: any) => void;
	onDeleteBlock: (id: string) => void;
	index: number;
}) {
	const Element = props.block.type === 'header' ? 'h2' : 'div';

	return (
		<Draggable draggableId={props.block.id} index={props.index}>
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
										<span>{props.block.type.toUpperCase()}</span>
									</S.EToolbarHeader>
									<S.EToolbarDelete>
										<IconButton
											type={'primary'}
											active={false}
											src={ASSETS.delete}
											handlePress={() => props.onDeleteBlock(props.block.id)}
											dimensions={{ wrapper: 23.5, icon: 13.5 }}
											tooltip={'Delete block'}
											tooltipPosition={'bottom-right'}
										/>
									</S.EToolbarDelete>
								</S.ElementToolbar>
							</>
						)}
						<S.Element blockEditMode={props.blockEditMode}>
							<Element>
								<ContentEditable
									value={props.block.content}
									onChange={(newContent: any) => props.onChangeBlock(props.block.id, newContent)}
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
	const [blockEditMode, setBlockEditMode] = React.useState<boolean>(true);

	const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([
		{
			id: Date.now().toString(),
			type: 'paragraph',
			content:
				'Here is a **Lorem ipsum** text with approximately 300 characters:*Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat.*',
		},
		{
			id: (Date.now() + 1).toString(),
			type: 'paragraph',
			content:
				'Here is a **Lorem ipsum** text with approximately 300 characters:*Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat.*',
		},
		{
			id: (Date.now() + 2).toString(),
			type: 'paragraph',
			content:
				'Here is a **Lorem ipsum** text with approximately 300 characters:*Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat.*',
		},
		{
			id: (Date.now() + 3).toString(),
			type: 'paragraph',
			content:
				'Here is a **Lorem ipsum** text with approximately 300 characters:*Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra risus et ante ultricies, vel facilisis justo aliquet. Morbi eu mauris vehicula, cursus turpis sed, aliquet metus. Donec at facilisis metus. Cras convallis lacus vel ex malesuada, eget suscipit sapien euismod. Aliquam erat volutpat.*',
		},
	]);

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
			content: '',
		};
		setBlocks([...blocks, newBlock]);
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
				<Droppable droppableId="blocks">
					{(provided) => (
						<S.EditorWrapper {...provided.droppableProps} ref={provided.innerRef} blockEditMode={blockEditMode}>
							{blocks.map((block, index) => (
								<Block
									key={block.id}
									block={block}
									blockEditMode={blockEditMode}
									onChangeBlock={handleBlockChange}
									onDeleteBlock={deleteBlock}
									index={index}
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
