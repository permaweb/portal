import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const CreditsWrapper = styled.div`
	padding: 5px 15px;
	border-radius: ${STYLING.dimensions.radius.primary} !important;
	background: ${(props) => props.theme.colors.container.alt11.background};

	p {
		color: ${(props) => props.theme.colors.font.light1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.xBold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const BodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;

export const MediaWrapper = styled.div`
	padding: 15px;
`;
