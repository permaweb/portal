import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const GlobalWrapper = styled.div`
	.max-view-wrapper {
		max-width: 1600px;
	}
`;

function getNavHeightOffset(navHeight?: number) {
	if (navHeight) return `${navHeight.toString()}px`;
	return STYLING.dimensions.nav.height;
}

export const View = styled.main<{ navHeight?: number }>`
	min-height: calc(100vh - ${(props) => getNavHeightOffset(props.navHeight)} - ${STYLING.dimensions.nav.linksHeight});
	position: relative;
	padding: 20px;
`;
