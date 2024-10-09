import React from 'react';

import * as S from './styles';

interface Block {
	id: string;
	type: 'paragraph' | 'header' | 'image';
	content: string;
}

const ContentEditable = ({ value, onChange }) => {
	const ref = React.useRef(null);
	const isUserInput = React.useRef(false);

	React.useEffect(() => {
		console.log('Effect running, value:', value);
		console.log('ref.current:', ref.current);
		console.log('ref.current.innerHTML:', ref.current?.innerHTML);

		if (ref.current && value !== ref.current.innerHTML && !isUserInput.current) {
			console.log('Updating content');
			ref.current.innerHTML = value;
		} else {
			console.log('No update needed');
		}
		isUserInput.current = false;
	}, [value]);

	const handleInput = (e: any) => {
		const newValue = e.target.innerHTML;
		console.log('handleInput called, newValue:', newValue);
		isUserInput.current = true;
		onChange(newValue);
	};

	return <div ref={ref} contentEditable onInput={handleInput} suppressContentEditableWarning={true} />;
};

const Block = ({ block, onChangeBlock }) => {
	console.log('Block rendering, content:', block.content);
	const Element = block.type === 'header' ? 'h2' : 'div';

	return (
		<S.Editor>
			<Element>
				<ContentEditable
					value={block.content}
					onChange={(newContent: any) => {
						console.log('onChange called with:', newContent);
						onChangeBlock(block.id, newContent);
					}}
				/>
			</Element>
		</S.Editor>
	);
};

export default function Article() {
	const [blocks, setBlocks] = React.useState<Block[]>([{ id: Date.now().toString(), type: 'paragraph', content: '' }]);

	const handleBlockChange = (id: string, content: string) => {
		console.log('handleBlockChange called, id:', id, 'content:', content);
		setBlocks((prevBlocks) => prevBlocks.map((block) => (block.id === id ? { ...block, content } : block)));
	};

	const addBlock = (type: Block['type']) => {
		const newBlock: Block = {
			id: Date.now().toString(),
			type,
			content: '',
		};
		setBlocks([...blocks, newBlock]);
	};

	return (
		<S.Wrapper>
			<S.ToolbarWrapper>
				<button onClick={() => addBlock('paragraph')}>Add Paragraph</button>
				<button onClick={() => addBlock('header')}>Add Header</button>
			</S.ToolbarWrapper>
			<S.EditorWrapper>
				{blocks.map((block) => (
					<Block key={block.id} block={block} onChangeBlock={handleBlockChange} />
				))}
			</S.EditorWrapper>
			{/* <S.PreviewWrapper>
				<h3>Rendered Preview:</h3>
				{blocks.map((block) => (
					<div key={block.id} dangerouslySetInnerHTML={{ __html: block.content }} />
				))}
			</S.PreviewWrapper> */}
			<S.OutputWrapper>
				<h3>HTML Output:</h3>
				<pre>{JSON.stringify(blocks, null, 2)}</pre>
			</S.OutputWrapper>
		</S.Wrapper>
	);
}
