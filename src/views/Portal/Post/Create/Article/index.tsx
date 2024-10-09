import React from 'react';

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
}) {
	const Element = props.block.type === 'header' ? 'h2' : 'div';

	return (
		<S.ElementWrapper>
			{props.blockEditMode && (
				<S.ElementToolbar>
					<S.EToolbarHeader>
						<span>{props.block.type.toUpperCase()}</span>
					</S.EToolbarHeader>
					<S.EToolbarDelete>
						<button onClick={() => props.onDeleteBlock(props.block.id)}>Delete</button>
					</S.EToolbarDelete>
				</S.ElementToolbar>
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
	);
}

export default function Article() {
	const [blockEditMode, setBlockEditMode] = React.useState<boolean>(true);

	const [blocks, setBlocks] = React.useState<ArticleBlockType[]>([
		{ id: Date.now().toString(), type: 'paragraph', content: '1' },
		{ id: (Date.now() + 1).toString(), type: 'paragraph', content: '2' },
		{ id: (Date.now() + 2).toString(), type: 'paragraph', content: '3' },
		{ id: (Date.now() + 3).toString(), type: 'paragraph', content: '4' },
	]);

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
			<S.EditorWrapper blockEditMode={blockEditMode}>
				{blocks.map((block) => (
					<Block
						key={block.id}
						block={block}
						blockEditMode={blockEditMode}
						onChangeBlock={handleBlockChange}
						onDeleteBlock={deleteBlock}
					/>
				))}
			</S.EditorWrapper>
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
