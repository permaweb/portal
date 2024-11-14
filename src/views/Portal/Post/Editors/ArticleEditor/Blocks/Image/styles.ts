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
	gap: 12.5px;
`;

export const Content = styled.div`
	.portal-image-wrapper {
		display: flex;
		gap: 12.5px;
	}

	.portal-image-row {
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
		border-radius: 10px;
	}

	.portal-image-row img {
		width: calc(100% - 312.5px);
	}
	.portal-image-row-reverse img {
		width: calc(100% - 312.5px);
	}
	.portal-image-column img {
		width: 100%;
	}
	.portal-image-column-reverse img {
		width: 100%;
	}

	.portal-image-wrapper p {
		min-width: 300px;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const CaptionEmpty = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt3};
		font-size: ${(props) => props.theme.typography.size.small};
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
		case 'portal-image-row':
			return `
				top: 30px;
			`;
		case 'portal-image-row-reverse':
			return `
				top: 30px;
			`;
		case 'portal-image-column':
			return `
				bottom: 35px;
			`;
		case 'portal-image-column-reverse':
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
	justify-content: center;
	align-items: center;
	gap: 10px;
	padding: 10px 15px 15px 15px;
	display: flex;
	${(props) => getContentActionPosition(props.alignment)};

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
	}
`;

export const ContentActions = styled.div<{ useColumn: boolean }>`
	display: flex;
	flex-direction: ${(props) => (props.useColumn ? 'column' : 'row')};
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
`;

export const ContentActionsEnd = styled.div<{ useColumn: boolean }>`
	width: fit-content;
	display: flex;
	flex-direction: ${(props) => (props.useColumn ? 'column' : 'row')};
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
	margin: ${(props) => (props.useColumn ? '10px 0 0 0' : '7.5px auto 0 auto')};
`;

export const CaptionWrapper = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 10px;
	p {
		cursor: text;
	}
`;

export const CaptionToolsAction = styled.div``;
