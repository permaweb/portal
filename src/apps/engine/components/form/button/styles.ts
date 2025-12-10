import styled, { css } from 'styled-components';

const primaryStyles = css`
	background: rgba(var(--color-primary), 1);
	color: white;

	&:hover:not(:disabled) {
		opacity: 0.9;
	}
`;

const defaultStyles = css`
	background: rgba(var(--color-text), 0.1);
	color: rgba(var(--color-text), 1);

	&:hover:not(:disabled) {
		background: rgba(var(--color-text), 0.2);
	}
`;

export const Button = styled.button<{ $variant?: string }>`
	width: fit-content;
	padding: 10px 20px;
	font-size: 14px;
	font-weight: 600;
	border: none;
	border-radius: var(--border-radius);
	cursor: pointer;

	${(props) => (props.$variant === 'primary' ? primaryStyles : defaultStyles)}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;
