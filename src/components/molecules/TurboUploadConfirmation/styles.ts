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

export const InputActionsInfo = styled.div<{ disabled?: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 7.5px;
	margin: 10px 0;
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};
`;

export const InputActionsInfoDivider = styled.div`
	height: 1px;
	width: 100%;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const InputActionsInfoLine = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		display: flex;
		width: 170px;
	}

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		font-family: ${(props) => props.theme.typography.family.primary};
		display: flex;
	}
`;

export const InputActionsMessage = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 5px 0 0 0;

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
	margin: 10px 0 0 0;
`;

export const UploadOptionsHeader = styled.div`
	margin: 0 0 10px 0;
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
	}
`;

export const RadioGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const RadioOption = styled.div<{ selected: boolean; disabled?: boolean }>`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 15px;
	border-radius: ${STYLING.dimensions.radius.primary};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	background: transparent;
	cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	transition: all 0.15s ease;

	${(props) =>
		props.selected &&
		!props.disabled &&
		`
		border-color: ${props.theme.colors.border.alt2};
		background: ${props.theme.colors.container.alt3.background};
	`}

	&:hover {
		border-color: ${(props) => (props.disabled ? props.theme.colors.border.primary : props.theme.colors.border.alt2)};
	}

	button {
		pointer-events: auto;
	}
`;

export const RadioOptionContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
`;

export const RadioOptionHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

export const RadioButton = styled.div<{ selected: boolean; disabled?: boolean }>`
	width: 18px;
	height: 18px;
	min-width: 18px;
	border-radius: 50%;
	border: 2px solid ${(props) => (props.selected ? props.theme.colors.border.alt2 : props.theme.colors.border.primary)};
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s ease;
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};
`;

export const RadioButtonInner = styled.div<{ selected: boolean }>`
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: ${(props) => (props.selected ? props.theme.colors.border.alt2 : 'transparent')};
	transition: all 0.15s ease;
`;

export const RadioLabel = styled.div<{ disabled?: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 2px;
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		margin: 0;
	}
`;
