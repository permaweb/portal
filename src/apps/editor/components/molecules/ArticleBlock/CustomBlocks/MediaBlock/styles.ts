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
	padding: 10px 20px 17.5px 20px;
`;

export const InputOverlay = styled.div`
	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	border: none !important;
	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.alt2} !important;

	p {
		position: absolute;
		bottom: 25px;
		padding: 2.5px 10px;
		color: ${(props) => props.theme.colors.font.alt1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const InputOverlayActions = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
	margin: 15px 0 0 0;
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

export const InputActionsFlex = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 15px 20px;
`;

export const ContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const MediaResizeWrapper = styled.div<{
	width?: number | null;
	align?: 'left' | 'center' | 'right';
}>`
	position: relative;
	width: ${(props) => (props.width ? `${props.width}px` : '100%')};
	max-width: 100%;

	/* Horizontal alignment when used inside a CSS grid or block layout */
	justify-self: ${(props) => (props.align === 'left' ? 'start' : props.align === 'right' ? 'end' : 'center')};

	margin-left: ${(props) => (props.align === 'left' ? '0' : props.align === 'center' ? 'auto' : 'auto')};
	margin-right: ${(props) => (props.align === 'right' ? '0' : props.align === 'center' ? 'auto' : 'auto')};

	> .portal-media-wrapper {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;

		> img,
		> video {
			max-width: 100%;
			height: auto;
			display: block;
		}
	}
`;

export const ResizeHandle = styled.div<{ side: 'left' | 'right' }>`
	position: absolute;
	${(props) => props.side}: 0;
	top: 0;
	bottom: 0;
	width: 5px;
	cursor: ew-resize;
	opacity: 0;
	transition: opacity 100ms ease;
	z-index: 10;

	&:hover {
		opacity: 1;
	}

	&::after {
		height: 40px;
		width: 3.5px;
		content: '';
		position: absolute;
		${(props) => props.side}: 0;
		top: 45%;
		transform: translateY(-50%);
		background: ${(props) => props.theme.colors.contrast.color};
		border: 1px solid ${(props) => props.theme.colors.contrast.border};
		border-radius: 2px;
	}
`;

export const Content = styled.div`
	.portal-media-wrapper {
		display: flex;
		gap: 15px;

		img,
		video {
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

			img,
			video {
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
		img,
		video {
			width: 100%;
		}
	}

	.portal-media-row img,
	.portal-media-row video,
	.portal-media-row-reverse img,
	.portal-media-row-reverse video {
		width: calc(100% - 312.5px);
	}

	.portal-media-wrapper.force-column {
		flex-direction: column !important;

		img,
		video {
			width: 100% !important;
		}
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
	margin: 10px 0 0 0;
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
	gap: 15px;
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
			border-radius: ${STYLING.dimensions.radius.alt4};
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

	button {
		padding: 3.5px 0 0 1.15px !important;
	}
`;
