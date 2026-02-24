import styled from 'styled-components';

export const Emojis = styled.div`
	position: relative;
`;

export const EmojisIcon = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	opacity: 0.6;
	transition: opacity 0.2s;

	&:hover {
		opacity: 1;
	}

	span {
		font-size: 20px;
		line-height: 1;
	}
`;

export const EmojiPicker = styled.div`
	position: absolute;
	bottom: 40px;
	right: -8px;
	z-index: 100;
	background: var(--widget-card-bg);
	border: 1px solid var(--widget-border);
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
	padding: 6px 8px;
	border: 1px solid var(--widget-border);
	border-radius: 6px;
	background: var(--widget-input-bg);
	color: var(--widget-text);
	font-size: 13px;
	outline: none;
	box-sizing: border-box;

	&::placeholder {
		color: var(--widget-text);
		opacity: 0.5;
	}

	&:focus {
		border-color: var(--widget-primary);
	}
`;

export const EmojiCategories = styled.div`
	display: flex;
	margin-bottom: 8px;
	gap: 2px;
`;

export const EmojiCategoryTab = styled.div<{ $active: boolean }>`
	background: ${(props) => (props.$active ? 'var(--widget-primary)' : 'transparent')};
	border-radius: 6px;
	padding: 4px;
	font-size: 14px;
	cursor: pointer;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;
	opacity: ${(props) => (props.$active ? 1 : 0.6)};

	&:hover {
		opacity: 1;
	}
`;

export const EmojiGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(8, 1fr);
	gap: 2px;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	scrollbar-width: thin;
	scrollbar-color: var(--widget-border) transparent;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: var(--widget-border);
		border-radius: 3px;
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
		background: var(--widget-hover);
	}
`;
