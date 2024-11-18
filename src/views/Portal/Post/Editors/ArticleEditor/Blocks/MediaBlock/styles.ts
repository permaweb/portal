import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const InputWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
	padding: 10px 20px;
	border: 1px solid ${(props) => props.theme.colors.border.alt4} !important;
`;

export const InputOverlay = styled.div`
	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	border: none !important;
	display: flex;
	align-items: center;
	justify-content: center;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
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
	margin: 25px 0 0 0;

	button {
		margin: 29.5px 0 0 0;
	}

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

		button {
			margin: 0;
		}
	}
`;

export const ContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const Content = styled.div`
	.portal-media-wrapper {
		display: flex;
		gap: 15px;

		img {
			height: fit-content;
			border-radius: 10px;
		}

		p {
			min-width: 300px;
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.small};
			font-weight: ${(props) => props.theme.typography.weight.medium};
			font-family: ${(props) => props.theme.typography.family.primary};
		}

		@media (max-width: 840px) {
			flex-direction: column !important;

			img {
				width: 100% !important;
			}

			p {
				max-width: 100% !important;
			}
		}
	}

	.portal-media-row,
	.portal-media-row-reverse,
	.portal-media-column,
	.portal-media-column-reverse {
		img {
			width: 100%;
		}
	}

	.portal-media-row img,
	.portal-media-row-reverse img {
		width: calc(100% - 312.5px);
	}

	.portal-media-row-reverse {
		flex-direction: row-reverse;
	}

	.portal-media-column {
		flex-direction: column;
	}

	.portal-media-column-reverse {
		flex-direction: column-reverse;
	}
`;

export const CaptionEmpty = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt3};
		font-size: ${(props) => props.theme.typography.size.small} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium};
		cursor: text;
	}
`;

export const ModalCaptionWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const ModalCaptionActionWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 20px;
	margin: 10px 0 0 0;
`;

function getContentActionPosition(alignment: string) {
	switch (alignment) {
		case 'portal-media-row':
			return `
				top: 30px;
			`;
		case 'portal-media-row-reverse':
			return `
				top: 30px;
			`;
		case 'portal-media-column':
			return `
				bottom: 35px;
			`;
		case 'portal-media-column-reverse':
			return `
				top: 35px;
			`;
	}
}

export const ContentActionsWrapper = styled.div<{ alignment: string }>`
	width: fit-content;
	max-width: 90vw;
	display: flex;
	flex-direction: column;
	gap: 12.5px;
	display: flex;
	${(props) => getContentActionPosition(props.alignment)};

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const ContentActions = styled.div<{ useColumn: boolean }>`
	display: flex;
	flex-direction: ${(props) => (props.useColumn ? 'column' : 'row')};
	align-items: center;
	gap: 12.5px;
	flex-wrap: wrap;
`;

export const ContentActionsEnd = styled.div<{ useColumn: boolean }>`
	width: fit-content;
	display: flex;
	flex-direction: ${(props) => (props.useColumn ? 'column' : 'row')};
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
	margin: ${(props) => (props.useColumn ? '10px 0 0 0' : '0 auto')};
`;

export const CaptionWrapper = styled.div<{ editMode: boolean; useColumn: boolean }>`
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 15px;
	p {
		cursor: text;
		max-width: ${(props) => (props.useColumn ? '300px' : '100%')} !important;
		padding: 0 50px 0 0;
		${(props) =>
			props.editMode &&
			`
			padding: 10px 50px 10px 10px;
			background: ${props.theme.colors.container.alt1.background};
			border: 1px solid ${props.theme.colors.border.primary};
			border-radius: ${STYLING.dimensions.radius.alt2};
		`}
	}
`;

export const CaptionToolsAction = styled.div`
	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const CaptionToolsInline = styled.div<{ editMode: boolean }>`
	position: absolute;
	top: 0;
	right: ${(props) => (props.editMode ? '10px' : '0')};
`;
