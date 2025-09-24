import styled from 'styled-components';

export const Emojis = styled.div``;

export const EmojisIcon = styled.div`
	display: flex;
	justify-content: center;
	height: 100%;

	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	svg {
		width: 24px;
		height: 24px;
		stroke: rgba(var(--color-text), 0.6);
	}

	&:hover {
		cursor: pointer;

		svg {
			stroke: rgba(var(--color-text), 1);
		}
	}
`;

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
