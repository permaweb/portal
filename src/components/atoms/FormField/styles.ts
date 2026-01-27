import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ sm: boolean | undefined; noMargin?: boolean }>`
	width: 100%;
	margin: ${(props) => (props.noMargin ? '0' : '10px 0')};
	display: flex;
	flex-direction: column;
	position: relative;
	@media (max-width: ${STYLING.cutoffs.initial}) {
		max-width: none;
	}
`;

export const TWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 2.5px 0 0;
	button {
		margin: 0 -7.5px 0 0 !important;
		svg {
			margin: 0 0 1.5px 0;
		}
	}
`;

export const Label = styled.label`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
`;

export const Tooltip = styled.div`
	padding: 0 20px 20px 20px;
	p {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		line-height: 1.5;
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const Input = styled.input<{
	sm: boolean | undefined;
	disabled: boolean;
	invalid: boolean;
}>`
	height: ${(props) => (props.sm ? STYLING.dimensions.form.small : STYLING.dimensions.form.max)};
	color: ${(props) =>
		props.disabled ? props.theme.colors.button.primary.disabled.color : props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	letter-spacing: 0.15px;
	margin: 7.5px 0 0 0;
	background: ${(props) => props.theme.colors.form.background};
	border: 1px solid
		${(props) => (props.invalid ? props.theme.colors.form.invalid.outline : props.theme.colors.form.border)};
	border-radius: ${STYLING.dimensions.radius.alt3};
	&:focus {
		outline: 0;
		border: 1px solid
			${(props) => (props.invalid ? props.theme.colors.form.invalid.outline : props.theme.colors.form.valid.outline)};
		outline: 0.5px solid
			${(props) => (props.invalid ? props.theme.colors.form.invalid.outline : props.theme.colors.form.valid.outline)};
		box-shadow: 0 0 0.5px
			${(props) => (props.invalid ? props.theme.colors.form.invalid.shadow : props.theme.colors.form.valid.shadow)};
		transition: box-shadow, border, outline 225ms ease-in-out;
	}
	&:disabled {
		background: ${(props) => props.theme.colors.form.disabled.background};
		color: ${(props) => props.theme.colors.form.disabled.label};
		box-shadow: none;
		border: 1px solid ${(props) => props.theme.colors.form.disabled.border};
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		font-size: ${(props) => props.theme.typography.size.base};
	}
`;

export const EndTextContainer = styled.div<{
	sm: boolean | undefined;
	disabled: boolean;
}>`
	height: fit-content;
	max-width: 100px;
	position: absolute;
	top: 36.15px;
	right: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow-x: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	background: transparent;
`;

export const EndText = styled.span<{ sm: boolean | undefined }>`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) =>
		props.sm ? props.theme.typography.size.xxSmall : props.theme.typography.size.small ?? '15px'};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	width: 100%;
`;

export const ErrorContainer = styled.div`
	margin: 8.5px 0 0 0;
	height: 25px;
	overflow-x: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const Error = styled.span`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.regular};
	border-left: 2.75px solid ${(props) => props.theme.colors.warning.primary};
	padding-left: 5px;
`;
