import styled from 'styled-components';

export const Wrapper = styled.div`
	margin: 10px 0 0 0;
`;

export const PanelWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PanelInfo = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const PanelSection = styled.div``;

export const PanelSectionDivider = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}

	.divider {
		height: 1px;
		width: 50%;
		border-top: 1px solid ${(props) => props.theme.colors.border.primary};
	}
`;

export const PanelActions = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;
`;
