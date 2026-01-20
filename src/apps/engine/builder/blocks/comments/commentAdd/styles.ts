import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
	from {
		opacity: 0;
		transform: scaleY(0);
		transform-origin: top;
	}
	to {
		opacity: 1;
		transform: scaleY(1);
		transform-origin: top;
	}
`;

export const CommentAdd = styled.div<{ $active: boolean; $hasIcon?: boolean }>`
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
		top: 50%;
		transform: translateY(-50%);
		left: ${(props) => (props.$hasIcon ? '42px' : '10px')};
		font-size: var(--font-size-normal);
		line-height: 1.5;
		color: rgba(var(--color-text), 0.5);
		pointer-events: none;
		user-select: none;
	}
`;

export const Editor = styled.div`
	position: relative;
	background: var(--color-card-background);
	border-radius: var(--border-radius);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	padding: 8px 80px 8px 10px;
	min-height: 24px;
	display: flex;
	align-items: center;

	.editor-input {
		outline: none;
		color: rgba(var(--color-text), 1);
		font-size: var(--font-size-normal);
		line-height: 1.5;
		position: relative;
		z-index: 2;
		cursor: text;
		width: 100%;
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

export const Emojis = styled.div`
	position: relative;
`;

export const EmojiPicker = styled.div`
	position: absolute;
	bottom: 40px;
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
	font-size: var(--font-size-normal);
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

export const CancelButton = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	background: rgba(231, 76, 60, 1);
	border-radius: 50%;
	width: 28px;
	height: 28px;
	cursor: pointer;
	transition: transform 0.2s;

	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	svg {
		width: 16px;
		height: 16px;
		color: white;
	}

	&:hover {
		transform: scale(1.1);
		background: rgba(231, 76, 60, 0.9);
	}
`;

export const AuthorSelector = styled.div`
	display: flex;
	position: relative;
	margin-right: 8px;
`;

export const AuthorIconWrapper = styled.div`
	cursor: pointer;
`;

export const AuthorDropdown = styled.div`
	position: absolute;
	top: calc(100% + 8px);
	left: 0;
	background: var(--color-navigation-background);
	backdrop-filter: blur(5px);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	padding: 4px;
	min-width: 150px;
	z-index: 1000;
	animation: ${slideDown} 0.2s ease-out forwards;
	transform-origin: top center;
`;

export const AuthorOption = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 10px 4px 6px;
	margin-bottom: 2px;
	cursor: pointer;
	background: ${(props) => (props.$active ? 'rgba(var(--color-primary), 0.15)' : 'transparent')};

	&:last-child {
		margin-bottom: 0;
	}

	&:hover {
		background: ${(props) => (props.$active ? 'rgba(var(--color-primary), 0.2)' : 'rgba(var(--color-text), 0.1)')};
	}

	> div:first-child {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		object-fit: cover;
	}

	span {
		color: rgba(var(--color-text), 1);
		font-size: var(--font-size-normal);
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

export const ModalOverlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.55);
	backdrop-filter: blur(2px);
	display: flex;
	align-items: center;
	justify-content: center;
	/* very high to beat any in-app layers */
	z-index: 2147483000;
`;

export const ModalContent = styled.div`
	background: var(--color-card-background);
	color: rgba(var(--color-text), 1);
	border-radius: var(--border-radius);
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
	width: min(720px, 92vw);
	max-height: 90vh;
	overflow: auto;
	padding: 16px;
`;

export const ModalHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
`;

export const ModalTitle = styled.h3`
	margin: 0;
	font-size: var(--font-size-h4, 1.25rem);
	line-height: 1.2;
`;

export const CloseButton = styled.button`
	border: none;
	background: transparent;
	color: rgba(var(--color-text), 1);
	font-size: 1.5rem;
	line-height: 1;
	cursor: pointer;
	padding: 4px 6px;

	&:hover {
		opacity: 0.85;
	}
`;

export const RuleError = styled.div`
	background: rgba(231, 76, 60, 0.15);
	border: 1px solid rgba(231, 76, 60, 0.3);
	color: #e74c3c;
	padding: 8px 12px;
	border-radius: var(--border-radius);
	font-size: var(--font-size-small);
	margin-bottom: 8px;
	display: flex;
	align-items: center;
	gap: 8px;
`;
