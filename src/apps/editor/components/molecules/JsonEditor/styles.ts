import styled from 'styled-components';

import { open, transition1 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;

	h4 {
		margin: 0 0 20px 0;
	}
`;

export const Editor = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
	max-height: 40vh;
	margin-left: auto;
	margin-right: auto;
	flex: 1;
	overflow: hidden;
	padding: 15px;

	button {
		padding: 10px 20px;
		background: ${(props) => props.theme.colors.button.primary.background};
		color: ${(props) => props.theme.colors.button.primary.color};
		border: 1px solid ${(props) => props.theme.colors.button.primary.border};
		border-radius: ${STYLING.dimensions.radius.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover:not(:disabled) {
			background: ${(props) => props.theme.colors.button.primary.active.background};
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
`;

export const Code = styled.div`
	position: relative;
	display: flex;
	gap: 10px;
	flex: 1;
	overflow-y: auto;

	textarea,
	pre {
		flex: 1;
		border: 1px solid #3d3d3d;
		min-height: 100%;
		overflow-y: scroll;
		background: #222;
		margin: 0;
		padding: 10px;
		box-sizing: border-box;
		white-space: pre-wrap;

		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		line-height: 18px;
	}

	textarea {
		resize: none;
		border: none;
		outline: none;
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const Pre = styled.pre`
	background: #222;
	padding: 10px;
	margin: 0;
	box-sizing: border-box;
	white-space: pre-wrap;
`;
