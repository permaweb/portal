import styled from 'styled-components';

export const PaginationActions = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const PaginationRangeDetails = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 2.5px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;
