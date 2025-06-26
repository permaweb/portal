import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	height: 100%;
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	position: relative;
	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const ContentWrapper = styled.div`
	width: calc(100% - ${STYLING.dimensions.nav.width});
	max-width: 1000px;
	padding: calc(${STYLING.dimensions.nav.height} + 40px) 0 25px calc(${STYLING.dimensions.nav.width} - 40px);
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		padding: calc(${STYLING.dimensions.nav.height} + 20px) 20px;
	}
`;
