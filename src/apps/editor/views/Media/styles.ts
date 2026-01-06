import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const CreditsWrapper = styled.div`
	padding: 5px 15px;
	border-radius: ${STYLING.dimensions.radius.primary} !important;
	background: ${(props) => props.theme.colors.container.alt11.background};

	p {
		color: ${(props) => props.theme.colors.font.light2};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}

	b {
		color: ${(props) => props.theme.colors.font.light1};
		font-weight: ${(props) => props.theme.typography.weight.xBold} !important;
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

export const InfoWrapper = styled.div`
	width: fit-content;
	margin: 15px 0 0 auto;
	padding: 0.5px 10px 2.5px 10px;
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		margin: 0 auto;
		text-align: center;
	}
`;
