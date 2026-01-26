import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const InputDescription = styled.div`
	margin: 5px 0 10px 0;
	span {
		color: ${(props) => props.theme?.colors?.font?.alt1 || 'rgba(var(--color-text), 0.7)'};
		font-size: ${(props) => props.theme?.typography?.size?.xSmall || '12px'};
		font-weight: ${(props) => props.theme?.typography?.weight?.medium || '500'};
		font-family: ${(props) => props.theme?.typography?.family?.primary || 'inherit'};
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
	border-top: 1px solid ${(props) => props.theme?.colors?.border?.primary || 'rgba(var(--color-border), 1)'};
`;

export const InputActionsInfoLine = styled.div`
	span {
		color: ${(props) => props.theme?.colors?.font?.alt1 || 'rgba(var(--color-text), 0.7)'};
		font-size: ${(props) => props.theme?.typography?.size?.xSmall || '12px'} !important;
		font-weight: ${(props) => props.theme?.typography?.weight?.medium || '500'};
		font-family: ${(props) => props.theme?.typography?.family?.primary || 'inherit'};
		display: flex;
		width: 185px;
	}

	p {
		color: ${(props) => props.theme?.colors?.font?.primary || 'rgba(var(--color-text), 1)'};
		font-size: ${(props) => props.theme?.typography?.size?.xSmall || '12px'} !important;
		font-weight: ${(props) => props.theme?.typography?.weight?.xBold || '700'} !important;
		font-family: ${(props) => props.theme?.typography?.family?.primary || 'inherit'} !important;
		display: flex;
	}
`;

export const InputActionsMessage = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 5px 0 0 0;

	p {
		color: ${(props) => props.theme?.colors?.font?.alt1 || 'rgba(var(--color-text), 0.7)'};
		font-size: ${(props) => props.theme?.typography?.size?.xSmall || '12px'} !important;
		font-weight: ${(props) => props.theme?.typography?.weight?.bold || '600'};
		font-family: ${(props) => props.theme?.typography?.family?.primary || 'inherit'};
	}
`;

export const InputActionsFlex = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;
	margin: 25px 0 0 0;
`;

export const UploadOptionsHeader = styled.div`
	margin: 0 0 10px 0;
	span {
		color: ${(props) => props.theme?.colors?.font?.alt1 || 'rgba(var(--color-text), 0.7)'};
		font-size: ${(props) => props.theme?.typography?.size?.xSmall || '12px'};
		font-weight: ${(props) => props.theme?.typography?.weight?.bold || '600'};
		font-family: ${(props) => props.theme?.typography?.family?.primary || 'inherit'};
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
	border: 1px solid ${(props) => props.theme?.colors?.border?.primary || 'rgba(var(--color-border), 1)'};
	background: ${(props) => props.theme.colors.container.alt1.background};
	cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	transition: all 0.15s ease;

	${(props) =>
		props.selected &&
		!props.disabled &&
		`
		border-color: ${props.theme?.colors?.border?.alt2 || 'rgba(var(--color-primary), 1)'};
		background: ${props.theme?.colors?.container?.alt3?.background || 'rgba(var(--color-primary), 0.1)'};
	`}

	&:hover {
		border-color: ${(props) =>
			props.disabled
				? props.theme?.colors?.border?.primary || 'rgba(var(--color-border), 1)'
				: props.theme?.colors?.border?.alt2 || 'rgba(var(--color-primary), 1)'};
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

export const AddFundsAction = styled.div`
	button {
		min-width: 0 !important;
		max-width: 500px !important;
		margin: 10px auto;
	}
`;

export const RadioOptionHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
`;

export const RadioButton = styled.div<{ selected: boolean; disabled?: boolean }>`
	width: 18px;
	height: 18px;
	min-width: 18px;
	border-radius: 50%;
	border: 2px solid
		${(props) =>
			props.selected
				? props.theme?.colors?.border?.alt2 || 'rgba(var(--color-primary), 1)'
				: props.theme?.colors?.border?.primary || 'rgba(var(--color-border), 1)'};
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
	background: ${(props) =>
		props.selected ? props.theme?.colors?.border?.alt2 || 'rgba(var(--color-primary), 1)' : 'transparent'};
	transition: all 0.15s ease;
`;

export const RadioLabel = styled.div<{ disabled?: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 2px;
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};

	span {
		color: ${(props) => props.theme?.colors?.font?.primary || 'rgba(var(--color-text), 1)'};
		font-size: ${(props) => props.theme?.typography?.size?.small || '14px'};
		font-weight: ${(props) => props.theme?.typography?.weight?.bold || '600'};
		font-family: ${(props) => props.theme?.typography?.family?.primary || 'inherit'};
	}

	p {
		color: ${(props) => props.theme?.colors?.font?.alt1 || 'rgba(var(--color-text), 0.7)'};
		font-size: ${(props) => props.theme?.typography?.size?.xSmall || '12px'};
		font-weight: ${(props) => props.theme?.typography?.weight?.xBold || '700'};
		font-family: ${(props) => props.theme?.typography?.family?.primary || 'inherit'};
		margin: 0;
	}
`;
