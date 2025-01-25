import React from 'react';

export default function ContentEditable(props: {
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

	const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text/plain');
		document.execCommand('insertText', false, text); // Insert plain text
	};

	const Element = props.element;

	return (
		<Element
			ref={ref}
			contentEditable
			onInput={handleInput}
			onPaste={handlePaste}
			suppressContentEditableWarning={true}
		/>
	);
}
