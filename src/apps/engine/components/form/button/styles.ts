import styled from 'styled-components';

export const Button = styled.button<{ type: string }>`
	width: fit-content;
	padding: 6px 12px;
	color: ${(props) => `var(--color-button-${props.type})`};
	background: ${(props) => `var(--color-button-${props.type}-background)`};
	border: ${(props) => `1px solid var(--color-button-${props.type}-border)`};
	border-radius: var(--border-radius);

	&:hover {
		color: ${(props) => `var(--color-button-${props.type}-hover)`};
		background: ${(props) => `var(--color-button-${props.type}-hover-background)`};
		border: ${(props) => `1px solid var(--color-button-${props.type}-hover-border)`};
	}

	&:disabled {
		opacity: 0.6;
		user-select: none;
		pointer-events: none;
	}
`;
