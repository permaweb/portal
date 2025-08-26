import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const InsufficientBalanceWrapper = styled.div`
	display: flex;
	gap: 8px;
`;

export const PaymentSummaryWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const PaymentSummaryLine = styled.div`
	width: 100%;
	display: flex;
	gap: 7.5px;
	align-items: center;
	justify-content: space-between;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
	}
`;

export const PaymentSummaryLabel = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
`;

export const PaymentSummaryDivider = styled.div`
	flex: 1;
	margin: 10px 0 0 0;
	border-bottom: 1px dotted ${(props) => props.theme.colors.border.alt4};

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const PaymentSummaryValue = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.xBold};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
	margin: 0;
`;

export const PayWithSelectorWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
`;

export const PayWithSelectorLabel = styled.span`
	opacity: 0.8;
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
`;
