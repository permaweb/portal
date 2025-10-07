import styled from 'styled-components';

export const Tag = styled.div`
	background: rgba(var(--color-background), 1);
	color: rgba(var(--color-primary-contrast), 1);
	border: 1px solid rgba(var(--color-border), 1);
	border-radius: var(--border-radius);
	transition: all 100ms;

	min-width: fit-content;
	padding: 0 4px;
	font-size: 13px;
	font-weight: 600;
	font-family: var(--font-header);

	&:hover {
		cursor: pointer;
		color: rgba(var(--color-secondary), 1);
		border: 1px solid rgba(var(--color-secondary), 1);
	}
`;
