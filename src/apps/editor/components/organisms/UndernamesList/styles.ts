import styled from 'styled-components';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const OwnersFooter = styled.div``;

export const OwnersWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;

	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};

	border-top-left-radius: ${STYLING.dimensions.radius.alt2};
	border-top-right-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
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

export const OwnerWrapper = styled.div`
	overflow: hidden;
`;

export const WrapperEmpty = styled.div`
	width: 100%;
	padding: 12.5px 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-top-left-radius: ${STYLING.dimensions.radius.alt2};
	border-top-right-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};
	margin: 20px 0 0 0;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const HeaderRow = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 0.5fr 1fr 1.6fr 0.9fr 1fr 1fr;
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

export const Toolbar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 12px 12px 12px 12px;
`;
