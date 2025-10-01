import React, { forwardRef } from 'react';

const ContentEditable = forwardRef(
	(
		props: {
			element: any;
			value: string;
			onChange: (content: string) => void;
			autoFocus?: boolean;
		},
		ref
	) => {
		const innerRef = React.useRef<HTMLDivElement>(null);

		React.useImperativeHandle(ref, () => innerRef.current);

		React.useEffect(() => {
			if (innerRef.current && props.value !== innerRef.current.innerHTML) {
				innerRef.current.innerHTML = props.value;
			}
		}, [props.value]);

		React.useEffect(() => {
			if (props.autoFocus && innerRef.current) {
				innerRef.current.focus();
				const range = document.createRange();
				const selection = window.getSelection();
				range.selectNodeContents(innerRef.current);
				range.collapse(false);
				selection?.removeAllRanges();
				selection?.addRange(range);
			}
		}, [props.autoFocus]);

		const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
			const newValue = e.currentTarget.innerHTML;
			props.onChange(newValue);
		};

		const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
			e.preventDefault();
			const text = e.clipboardData.getData('text/plain');
			document.execCommand('insertText', false, text);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			// Clear formatting when Enter is pressed to avoid carrying it to next block
			if (e.key === 'Enter') {
				// Remove all active formatting before Enter creates new block
				['bold', 'italic', 'underline', 'strikethrough'].forEach((format) => {
					if (document.queryCommandState(format)) {
						document.execCommand(format, false);
					}
				});
			}
		};

		const Element = props.element;

		return (
			<Element
				ref={innerRef}
				contentEditable
				onInput={handleInput}
				onPaste={handlePaste}
				onKeyDown={handleKeyDown}
				suppressContentEditableWarning={true}
			/>
		);
	}
);

export default ContentEditable;
