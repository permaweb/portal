import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const InputWrapper = styled.div`
	display: flex;
	flex-direction: column;
	padding: 12.5px 15px 15px 15px;
`;

export const InputHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
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
	margin: 5px 0 20px 0;
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
	margin: -10px 0 0 0;

	input[type='file'] {
		display: none;
	}
`;

export const InputActionsFlex = styled.div`
	display: flex;
	gap: 15px;
	align-items: center;
	justify-content: flex-end;
`;

export const PreviewWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const IframeContainer = styled.div`
	position: relative;
	width: 100%;
	padding-bottom: 56.25%;
	height: 0;
	overflow: hidden;
	border-radius: ${STYLING.dimensions.radius.alt4};
	iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}
`;

export const EmbedContainer = styled.div`
	width: 100%;
	border-radius: ${STYLING.dimensions.radius.alt4};
	overflow: hidden;

	iframe {
		max-width: 100%;
		border: 0;
	}

	/* Twitter embed specific styles */
	.twitter-tweet {
		margin: 0 auto !important;
	}
`;

export const TwitterIframeContainer = styled.div`
	max-width: 550px;
	margin: 0 auto;
	border-radius: ${STYLING.dimensions.radius.alt4};
	overflow: hidden;

	iframe {
		width: 100%;
		min-height: 400px;
		border: 0;
	}
`;

export const TwitterEmbedContainer = styled.div`
	max-width: 550px;
	margin: 0 auto;

	.twitter-tweet {
		margin: 0 auto !important;
	}
`;

export const ActionsWrapper = styled.div`
	width: 100%;
	display: flex;
	gap: 15px;
	align-items: center;
	justify-content: flex-end;
	margin: 10px 0 0 0;
`;

export const CollapsedWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 15px 20px;
	border-radius: ${STYLING.dimensions.radius.alt4} !important;
`;

export const CollapsedLink = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	svg {
		height: 17.5px;
		width: 17.5px;
		flex-shrink: 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
		margin: 8.5px 5px 0 0;
	}

	a {
		color: ${(props) => props.theme.colors.link.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		&:hover {
			text-decoration: underline;
		}
	}
`;
