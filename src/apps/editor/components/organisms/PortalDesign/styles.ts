import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	padding: 10px 0;
	display: flex;
	flex-direction: column;
`;

export const ActionWrapper = styled.div`
	width: 100%;
	padding: 7.5px 15px;

	display: flex;
	align-items: center;
	justify-content: center;

	button {
		justify-content: space-between;
		border-radius: ${STYLING.dimensions.radius.primary} !important;
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
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 20px;
	margin: 20px 0;
`;
