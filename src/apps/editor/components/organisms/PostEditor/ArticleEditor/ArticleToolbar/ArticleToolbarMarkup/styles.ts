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
