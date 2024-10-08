import React from 'react';

import * as S from './styles';

export default function Create() {
	const editorRef = React.useRef(null);

	const [htmlContent, setHtmlContent] = React.useState('<p>Type something here...</p>');

	// To initialize content on mount
	React.useEffect(() => {
		if (editorRef.current) {
			editorRef.current.innerHTML = htmlContent; // Set initial content
		}
	}, [htmlContent]);

	const handleInput = () => {
		// Do not update state immediately to avoid re-renders
		// Just keep the content inside the div and handle updates onBlur
	};

	const handleBlur = () => {
		// Update the state when user exits the editor, capturing the latest HTML content
		if (editorRef.current) {
			setHtmlContent(editorRef.current.innerHTML);
		}
	};

	return (
		<S.Wrapper>
			<div className="rich-text-editor">
				<div
					ref={editorRef}
					contentEditable
					className="editor"
					onInput={handleInput}
					onBlur={handleBlur} // Only update the state when user is done editing
				/>
				<div className="output">
					<h3>HTML Output:</h3>
					<pre>{htmlContent}</pre>
				</div>
				<div className="rendered-output">
					<h3>Rendered Preview:</h3>
					<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
				</div>
			</div>
		</S.Wrapper>
	);
}
