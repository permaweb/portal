import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const InputDescription = styled.div`
	margin: 5px 0 10px 0;
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const InputActions = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;

	input {
		max-width: 400px;
	}

	#media-file-input {
		display: none;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		align-items: flex-start;
		flex-direction: column;
		gap: 15px;
	}
`;

export const InputActionsInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 7.5px;
	margin: 10px 0;
`;

export const InputActionsInfoDivider = styled.div`
	height: 1px;
	width: 100%;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const InputActionsInfoLine = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		font-family: ${(props) => props.theme.typography.family.primary};
		display: flex;
	}

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		display: flex;
		width: 170px;
	}
`;

export const InputActionsMessage = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 5px 0 15px 0;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const InputActionsFlex = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 15px 20px;
`;