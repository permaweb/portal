import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 7.5px 0 0 0;
`;

export const PaginationActions = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	> *:first-child {
		svg {
			transform: rotate(90deg);
		}
	}

	> *:nth-child(2) {
		svg {
			transform: rotate(270deg);
		}
	}
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
