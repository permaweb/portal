import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 0;
`;

export const Header = styled.div`
	display: none;
`;

export const Title = styled.p`
	display: none;
`;

export const Body = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const SectionTitle = styled.div`
	margin: 0 0 4px 0;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
	gap: 10px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const FieldColumn = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0;
`;

export const SelectFieldColumn = styled(FieldColumn)`
	margin-top: 6px;
`;

export const LabelRow = styled.label`
	display: block;
	margin: 0 0 6px 0;
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const CheckboxGroup = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 8px 16px;
`;

export const CheckboxContainer = styled.div<{ disabled?: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};

	&:hover {
		span {
			color: ${(props) => (props.disabled ? props.theme.colors.font.alt1 : props.theme.colors.font.primary)};
		}
	}

	span {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt1};
		transition: all 0.2s ease;
	}
`;

export const ColumnsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
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
