import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	height: ${STYLING.dimensions.button.height};
	display: flex;
	align-items: center;
	gap: 3.5px;
	padding: 0 3.5px;
	border-radius: ${STYLING.dimensions.radius.button} !important;
`;

export const Section = styled.div`
	display: flex;
	align-items: center;
	gap: 3.5px;
	border-radius: ${STYLING.dimensions.radius.button} !important;
`;

export const Divider = styled.div`
	height: calc(${STYLING.dimensions.button.height} - 15px);
	width: 1px;
	border-right: 1px solid ${(props) => props.theme.colors.border.primary};
`;
