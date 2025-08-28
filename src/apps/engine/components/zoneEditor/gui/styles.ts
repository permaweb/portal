import styled from 'styled-components';

export const GUI = styled.div<{ $active: boolean }>`
	display: flex;
	flex-direction: column;
	flex: 1;
	padding: 20px;
	padding-left: 0;
	background: #222;
	overflow-y: scroll;

	label {
		display: flex;
		margin-top: 4px;
		input {
			margin-left: auto;
		}
	}
`;

export const CategoryKey = styled.h3`
	color: rgba(var(--color-primary), 1);
	margin-top: 4px;
`;

export const Row = styled.div`
	display: flex;
	flex-direction: column;
	margin-left: 10px;
`;
