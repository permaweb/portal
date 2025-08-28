import styled from 'styled-components';

export const CommentAdd = styled.div<{ $active: boolean }>`
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 6px;
	opacity: ${(props) => (props.$active ? 1 : 0.6)};
	pointer-events: ${(props) => (props.$active ? 'default' : 'none')};
	user-select: ${(props) => (props.$active ? 'default' : 'none')};
`;

export const Editor = styled.div`
	position: relative;

	.DraftEditor-root {
		padding: 10px;
		background: var(--color-card-background);
		border-radius: var(--border-radius);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
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

export const Emojis = styled.div``;

export const EmojisIcon = styled.div`
	display: flex;
	justify-content: center;
	height: 100%;

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

	svg {
		width: 18px;
		height: 18px;
		color: white;
		// color:rgba(var(--color-text),1);
	}

	&:hover {
		cursor: pointer;
		transform: scale(1.1);
	}
`;
