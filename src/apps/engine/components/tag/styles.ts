import styled from 'styled-components';

export const Tag = styled.div`
	background: rgba(var(--color-primary),1);
	color: rgba(var(--color-primary-contrast),1);
	min-width: fit-content;
	padding:0 4px;
	font-size:14px;
	font-weight:600;

	&:hover{
		cursor:pointer;
		background: rgba(var(--color-secondary),1);
	}
`;
