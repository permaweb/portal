import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	max-width: ${STYLING.cutoffs.max};
	margin: 0 auto;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;
`;

export const TopicModalWrapper = styled.div`
	padding: 0 20px 15px 20px !important;
`;
