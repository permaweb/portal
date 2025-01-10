import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	margin: 10px 0 0 0;
`;

export const ActionWrapper = styled.div`
	width: 100%;

	display: flex;
	align-items: center;
	justify-content: center;

	button {
		justify-content: space-between;
		border-radius: ${STYLING.dimensions.radius.primary} !important;
		border: none !important;
		span {
			color: ${(props) => props.theme.colors.font.alt1};
			font-size: ${(props) => props.theme.typography.size.xSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.bold} !important;
			font-family: ${(props) => props.theme.typography.family.primary} !important;
		}

		svg {
			height: 18.5px;
			width: 18.5px;
			transform: rotate(270deg);
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
	}
`;

export const PanelBodyWrapper = styled.div`
	padding: 0 20px;
`;

export const PanelActionsWrapper = styled.div`
	width: 100%;
	margin: 20px 0 0 0;
	display: flex;
	gap: 15px;
	justify-content: flex-end;
`;
