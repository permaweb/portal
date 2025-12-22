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
	gap: 16px;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 10px;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const SectionTitle = styled.h4`
	margin: 0;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
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
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const CheckboxGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const ColumnsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const ScopeRow = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const ScopeOption = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: flex-start;
	gap: 10px;
	padding: 10px;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => (props.$active ? props.theme.colors.container.alt2.background : 'transparent')};
	border: 1px solid ${(props) => (props.$active ? props.theme.colors.border.alt5 : props.theme.colors.border.primary)};
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: ${(props) => props.theme.colors.container.alt2.background};
		border-color: ${(props) => props.theme.colors.border.alt5};
	}
`;

export const RadioDot = styled.div<{ $active: boolean }>`
	width: 16px;
	height: 16px;
	min-width: 16px;
	margin-top: 2px;
	border-radius: 50%;
	border: 2px solid ${(props) => (props.$active ? props.theme.colors.border.alt5 : props.theme.colors.border.primary)};
	background: ${(props) => (props.$active ? props.theme.colors.border.alt5 : 'transparent')};
	position: relative;

	&::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: ${(props) => (props.$active ? props.theme.colors.font.light1 : 'transparent')};
	}
`;

export const ScopeLabel = styled.div`
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.primary};
	margin-bottom: 4px;
`;

export const ScopeDescription = styled.div`
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	color: ${(props) => props.theme.colors.font.alt1};
	line-height: 1.4;
`;

export const InfoMessage = styled.div`
	display: flex;
	align-items: center;
	padding: 8px 10px;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.alt2.background};
	border: 1px solid ${(props) => props.theme.colors.warning.primary};

	&.warning {
		background: ${(props) => props.theme.colors.container.alt2.background};
	}

	span {
		line-height: 1.4;
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}
`;
