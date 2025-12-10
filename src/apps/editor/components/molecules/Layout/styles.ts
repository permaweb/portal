import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const OptionsWrapper = styled.div`
	display: flex;
	gap: 15px;
`;

export const Option = styled.div<{ disabled: boolean; $active: boolean }>`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	background: ${(props) =>
		props.$active ? props.theme.colors.button.primary.active.background : props.theme.colors.button.primary.background};
	border: 2px solid
		${(props) => (props.$active ? props.theme.colors.indicator.active : props.theme.colors.button.primary.border)};
	border-radius: ${STYLING.dimensions.radius.primary};
	cursor: ${(props) => (props.$active ? 'default' : props.disabled ? 'not-allowed' : 'pointer')};
	transition: all 100ms;
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};

	&:hover {
		background: ${(props) =>
			props.$active
				? props.theme.colors.button.primary.active.background
				: props.disabled
				? props.theme.colors.button.primary.background
				: props.theme.colors.button.primary.active.background};
		border: 2px solid
			${(props) =>
				props.$active
					? props.theme.colors.indicator.active
					: props.disabled
					? props.theme.colors.button.primary.border
					: props.theme.colors.button.primary.active.border};
	}
`;

export const OptionIcon = styled.div<{ $active: boolean }>`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 12px;

	img {
		width: 100%;
		height: auto;
		opacity: ${(props) => (props.$active ? 1 : 0.5)};
	}
`;

export const OptionLabel = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall} !important;
	font-weight: ${(props) => props.theme.typography.weight.bold} !important;
	font-family: ${(props) => props.theme.typography.family.primary} !important;
	text-transform: uppercase;
	margin: 0;
`;

export const Indicator = styled.div<{ active: boolean }>`
	height: 17.5px;
	width: 17.5px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid ${(props) => (props.active ? props.theme.colors.indicator.active : props.theme.colors.border.alt1)};
	background: ${(props) =>
		props.active ? props.theme.colors.indicator.active : props.theme.colors.container.alt1.background};
	border-radius: 50%;

	svg {
		height: 10.5px !important;
		width: 10.5px !important;
		color: ${(props) => props.theme.colors.font.light1} !important;
		fill: ${(props) => props.theme.colors.font.light1} !important;
		margin: 0 0 0.5px 0 !important;

		polyline {
			stroke-width: 40px !important;
		}
	}
`;

export const EndActions = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;
	margin: 17.5px 0 0 0;
`;
