import styled from 'styled-components';
import { STYLING } from 'helpers/config';

const PAD = STYLING.dimensions.button.height; // rhythm source
const GAP = '10px';

export const Overlay = styled.div`
	position: fixed;
	inset: 0;
	display: grid;
	place-items: center;
	background: rgba(0, 0, 0, 0.3);
	z-index: 9999;
`;

export const Dialog = styled.div`
	position: fixed;
	max-width: 520px;
	width: calc(100% - 40px);
	transform: translateZ(0);
	color: inherit;
	background: ${(p) => p.theme.colors.container.primary.background};
	color: ${(p) => p.theme.colors.font.primary};
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt1};
	padding: calc(${PAD} / 1.6);
	opacity: 1;
`;

export const Message = styled.div`
	margin-bottom: ${GAP};
	color: inherit;
	font: inherit;
`;

export const Actions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: ${GAP};
`;

export const Button = styled.button`
	height: ${STYLING.dimensions.button.height};
	padding: 0 calc(${PAD} / 2);
	border-radius: ${STYLING.dimensions.radius.button};
	border: 1px solid currentColor;
	background: transparent;
	color: inherit;
	font: inherit;
	font-weight: 600;
	cursor: pointer;

	&[data-variant='reject'] {
	}

	&[data-variant='confirm'] {
	}

	&:hover:not(:disabled) {
		filter: brightness(0.95);
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	&[data-loading='true'] {
		cursor: progress;
	}
`;
