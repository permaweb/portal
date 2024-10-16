import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;

	img {
		width: 100%;
		border-radius: ${STYLING.dimensions.radius.primary};
	}
`;

export const InputWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	padding: 10px 20px;
	border: 1px solid ${(props) => props.theme.colors.border.alt4} !important;
`;

export const InputHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}

	svg {
		height: 15px;
		width: 15px;
		margin: 8.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
	}
`;

export const InputDescription = styled.div`
	margin: 5px 0 0 0;
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const InputActions = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
	margin: 15px 0 0 0;

	button {
		margin: 28.5px 0 0 0;
	}

	input {
		max-width: 400px;
	}

	#image-file-input {
		display: none;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		align-items: flex-start;
		flex-direction: column;
		gap: 15px;
	}
`;

export const InputActionsDivider = styled.div`
	margin: 23.5px 0 0 0;
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;
