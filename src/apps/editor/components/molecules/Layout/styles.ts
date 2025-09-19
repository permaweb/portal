import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const OptionsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const Option = styled.div<{ disabled: boolean }>`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8.5px 15px;
	background: ${(props) => props.theme.colors.button.primary.background};
	border: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-radius: ${STYLING.dimensions.radius.primary};
	cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	transition: all 100ms;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}

	&:hover {
		background: ${(props) =>
			props.disabled
				? props.theme.colors.button.primary.background
				: props.theme.colors.button.primary.active.background};
		border: 1px solid
			${(props) =>
				props.disabled ? props.theme.colors.button.primary.border : props.theme.colors.button.primary.active.border};
	}
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
