import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 12px 14px;
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const Title = styled.p`
	margin: 0;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const Body = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
	gap: 12px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const FieldColumn = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const LabelRow = styled.label`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
`;

export const Select = styled.select`
	width: 100%;
	min-height: 36px;
	padding: 6px 10px;
	border-radius: ${STYLING.dimensions.radius.secondary};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	background: ${(props) => props.theme.colors.container.alt1.background};
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	outline: none;

	&:focus-visible {
		border-color: ${(props) => props.theme.colors.roles.primary};
		box-shadow: 0 0 0 1px ${(props) => props.theme.colors.roles.primary};
	}
`;

export const InfoMessage = styled.div`
	display: flex;
	align-items: center;
	padding: 8px 10px;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.warning.background};
	color: ${(props) => props.theme.colors.warning.color};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};

	span {
		line-height: 1.4;
	}
`;
