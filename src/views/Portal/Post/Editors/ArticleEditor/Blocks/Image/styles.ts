import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
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

export const ContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	/* justify-content: center;
	align-items: center; */
`;

export const Content = styled.div`
	.portal-image-wrapper {
		display: flex;
		gap: 12.5px;
	}

	.portal-image-row {
		/* Default Flex */
	}
	.portal-image-row-reverse {
		flex-direction: row-reverse;
	}
	.portal-image-column {
		flex-direction: column;
	}
	.portal-image-column-reverse {
		flex-direction: column-reverse;
	}

	.portal-image-wrapper img {
		width: 100%;
		/* max-width: 700px; */
		/* margin: 0 auto; */
		border-radius: 10px;
	}

	.portal-image-wrapper p {
		/* display: flex;
		align-items: center;
		text-align: center; */
		max-width: 600px;
		/* margin: 0 auto; */
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const ContentActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	flex-direction: column;
	gap: 7.5px;
	padding: 12.5px 15px 15px 15px;

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
	}
`;

export const ContentActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
`;
