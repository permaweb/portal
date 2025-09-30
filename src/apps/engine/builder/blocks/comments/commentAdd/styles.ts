import styled from 'styled-components';

export const CommentAdd = styled.div<{ $active: boolean }>`
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100%;
	gap: 6px;
	opacity: ${(props) => (props.$active ? 1 : 0.6)};
	pointer-events: ${(props) => (props.$active ? 'default' : 'none')};
	user-select: ${(props) => (props.$active ? 'default' : 'none')};

	.editor-placeholder {
		position: absolute;
		top: 0;
		bottom: 0;
		padding: 10px;
		font-size: var(--font-size-large);
		font-weight: 400;
		user-select: none;
		opacity: 0.4;
	}
`;

export const Editor = styled.div`
	position: relative;
	background: var(--color-card-background);
	border-radius: var(--border-radius);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	padding: 10px;
	padding-right: 80px;
	min-height: 30px;

	> div[data-lexical-placeholder] {
		position: absolute;
		top: 10px;
		left: 10px;
		color: rgba(var(--color-text), 0.5);
		pointer-events: none;
		font-size: 14px;
		user-select: none;
		z-index: 1;
	}

	.editor-input {
		outline: none;
		min-height: 24px;
		color: rgba(var(--color-text), 1);
		font-size: 14px;
		line-height: 1.5;
		position: relative;
		z-index: 2;
		cursor: text;
	}

	.editor-paragraph {
		margin: 0;
	}

	.editor-text-bold {
		font-weight: bold;
	}

	.editor-text-italic {
		font-style: italic;
	}

	.editor-text-underline {
		text-decoration: underline;
	}

	.editor-text-code {
		background-color: rgba(var(--color-text), 0.1);
		padding: 1px 4px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.9em;
	}
`;

export const EditorPlaceholder = styled.div`
	position: absolute;
	top: 10px;
	left: 10px;
	color: rgba(var(--color-text), 0.5);
	pointer-events: none;
	font-size: 14px;
	user-select: none;
	z-index: 1;
`;

export const Actions = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	top: 0px;
	bottom: 0;
	right: 8px;
	gap: 8px;
	width: fit-content;
	z-index: 1;
`;

export const Emojis = styled.div``;

export const EmojiPicker = styled.div`
	position: absolute;
	margin-top: 28px;
	right: -8px;
	z-index: 100;
	background: var(--color-card-background);
	border-radius: var(--border-radius);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	padding: 10px;
	width: 300px;
	height: 240px;
	display: flex;
	flex-direction: column;
`;

export const EmojiSearch = styled.div`
	margin-bottom: 8px;
`;

export const EmojiSearchInput = styled.input`
	width: 100%;
	padding: 8px;
	border: none;
	border-radius: var(--border-radius);
	background: rgba(var(--color-text), 0.1);
	color: rgba(var(--color-text), 1);
	font-size: 14px;
	outline: none;
	box-sizing: border-box;
	height: 32px;

	&::placeholder {
		color: rgba(var(--color-text), 0.5);
	}

	&:focus {
		background: rgba(var(--color-text), 0.15);
	}
`;

export const EmojiCategories = styled.div`
	display: flex;
	margin-bottom: 8px;
	padding-bottom: 6px;
`;

export const EmojiCategoryTab = styled.div<{ $active: boolean }>`
	background: ${(props) => (props.$active ? 'rgba(var(--color-text), 0.15)' : 'rgba(var(--color-text), 0.05)')};
	border-radius: var(--border-radius);
	padding: 6px;
	font-size: 16px;
	cursor: pointer;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;

	&:hover {
		background: rgba(var(--color-text), 0.15);
	}
`;

export const EmojiGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(8, 1fr);
	gap: 2px;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;

	/* Thin scrollbar */
	scrollbar-width: thin;
	scrollbar-color: rgba(var(--color-text), 0.3) transparent;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(var(--color-text), 0.3);
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: rgba(var(--color-text), 0.5);
	}
`;

export const EmojiButton = styled.button`
	background: transparent;
	border: none;
	padding: 2px;
	font-size: 16px;
	cursor: pointer;
	border-radius: 4px;
	transition: background-color 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 28px;

	&:hover {
		background: rgba(var(--color-text), 0.1);
	}
`;

export const Send = styled.div<{ $active: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;
	background: ${(props) => (props.$active ? `rgba(var(--color-primary),1)` : `rgba(100,100,100,.6)`)};
	pointer-events: ${(props) => (props.$active ? `default` : `none`)};
	border-radius: 50%;
	width: 28px;
	height: 28px;

	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	svg {
		width: 18px;
		height: 18px;
		margin-top: 2px;
		margin-right: 2px;
		color: white;
	}

	&:hover {
		cursor: pointer;
		transform: scale(1.1);
	}
`;
