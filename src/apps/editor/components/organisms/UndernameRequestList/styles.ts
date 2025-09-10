import styled from 'styled-components';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const Footer = styled.div``;

export const ListWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;

	background: ${(p) => p.theme.colors.container.primary.background};
	border: 1px solid ${(p) => p.theme.colors.border.primary};

	border-top-left-radius: ${STYLING.dimensions.radius.alt2};
	border-top-right-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
		}
		&:first-child {
			border-top-left-radius: ${STYLING.dimensions.radius.alt2};
			border-top-right-radius: ${STYLING.dimensions.radius.alt2};
		}
		&:last-child {
			border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
			border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};
		}
	}
`;

export const HeaderRow = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 0.5fr 1fr 1.6fr 0.9fr 1fr 1fr 0.9fr;
	gap: 8px;
	align-items: center;
	padding: 12.5px 15px;
	background: ${(p) => p.theme.colors.container.alt1.background};
	border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
`;

export const HeaderCell = styled.div`
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.small};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const RowWrapper = styled.div`
	overflow: hidden;
`;

export const WrapperEmpty = styled.div`
	width: 100%;
	padding: 12.5px 15px;
	background: ${(p) => p.theme.colors.container.primary.background};
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-top-left-radius: ${STYLING.dimensions.radius.alt2};
	border-top-right-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};
	margin: 20px 0 0 0;

	p {
		color: ${(p) => p.theme.colors.font.alt1};
		font-size: ${(p) => p.theme.typography.size.xxSmall} !important;
		font-weight: ${(p) => p.theme.typography.weight.bold} !important;
		font-family: ${(p) => p.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;
