import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const InfoWrapper = styled.div`
	width: fit-content;
	margin: 0 0 0 auto;

	padding: 0.5px 10px 2.5px 10px;
	background: ${(props) => props.theme.colors.contrast.background};
	border: 1px solid ${(props) => props.theme.colors.contrast.border};
	border-radius: ${STYLING.dimensions.radius.alt4};
	span {
		color: ${(props) => props.theme.colors.contrast.color};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;
