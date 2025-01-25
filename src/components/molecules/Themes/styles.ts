import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const Header = styled.div`
	margin: 0 0 15px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		line-height: 1;
	}
`;

export const Body = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 10px 0 0 0;
`;

export const Section = styled.div`
	padding: 15px;
`;

export const SectionHeader = styled.div`
	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const SectionBody = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 10px 0 0 0;
`;

export const BackgroundWrapper = styled.div``;

export const MenusWrapper = styled.div``;

export const FlexWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 20px;
`;

export const SectionsWrapper = styled.div`
	display: flex;
	flex: 1;
`;

export const GridWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px 20px;
`;

export const ColorTooltip = styled.div`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin: 1.5px 0 0 0;

	border: 1px solid ${(props) => props.theme.colors.contrast.border};

	span {
		font-size: 10px !important;
		display: block;
		line-height: 1.65;
		text-transform: uppercase;
	}
`;

export const ColorWrapper = styled.div`
	height: fit-content;
	position: relative;
	display: flex;
	flex: 1;

	&:hover {
		${ColorTooltip} {
			display: block;
		}
	}
`;

export const ColorBody = styled.button<{ background: string; height?: number; width?: number; maxWidth?: boolean }>`
	height: ${(props) => (props.height ? `${props.height.toString()}px` : '50px')};
	width: ${(props) => (props.maxWidth ? '100%' : props.width ? `${props.width.toString()}px` : '50px')};
	background: ${(props) => props.background};
	border-radius: ${STYLING.dimensions.radius.primary};
	overflow: hidden;
	position: relative;
	flex: 1;

	::after {
		content: '';
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: ${(props) => props.theme.colors.overlay.alt1};
		opacity: 0;
		transition: all 100ms;
	}
	&:hover::after {
		opacity: 1;
	}
	&:focus::after {
		opacity: 1;
	}
	&:hover {
		cursor: pointer;
	}
`;

export const SelectorWrapper = styled.div`
	padding: 0 20px 20px 20px;

	.react-colorful {
		height: 220px;
		width: 100%;
		position: static;
	}

	.react-colorful__saturation {
		border-radius: 0;
		border: none;
		box-shadow: none;
		border-top-right-radius: ${STYLING.dimensions.radius.primary};
		border-bottom-right-radius: ${STYLING.dimensions.radius.primary};
	}

	.react-colorful__last-control {
		width: 100%;
		position: absolute;
		bottom: -40px;
		left: 0;
		border-radius: 0;
		margin: 20px 0 0 0;
		height: 10px;
		border-radius: 15px;
	}

	.react-colorful__pointer {
		height: 22.5px;
		width: 22.5px;
		cursor: pointer;
	}
`;

export const SelectorHeader = styled.div`
	margin: 0 0 15px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		line-height: 1;
	}
`;

export const SelectorActions = styled.div`
	margin: 70px 0 0 0;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 20px;

	input {
		height: ${STYLING.dimensions.form.small};
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		letter-spacing: 0.15px;
		background: ${(props) => props.theme.colors.form.background};
		border: 1px solid ${(props) => props.theme.colors.form.border};
		border-radius: ${STYLING.dimensions.radius.alt3};
		&:focus {
			outline: 0;
			border: 1px solid ${(props) => props.theme.colors.form.valid.outline};
			outline: 0.5px solid ${(props) => props.theme.colors.form.valid.outline};
			box-shadow: 0 0 0.5px ${(props) => props.theme.colors.form.valid.shadow};
			transition: box-shadow, border, outline 225ms ease-in-out;
		}
		&:disabled {
			background: ${(props) => props.theme.colors.form.disabled.background};
			color: ${(props) => props.theme.colors.form.disabled.label};
			box-shadow: none;
			border: 1px solid ${(props) => props.theme.colors.form.disabled.border};
		}
	}
`;

export const SelectorFlexActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 20px;
`;

export const SelectorFlexWrapper = styled.div`
	display: flex;
	position: relative;
`;

export const SelectorPreview = styled.div<{ background: string }>`
	height: 220px;
	min-width: 190px;
	background: ${(props) => props.background};
	border-right: 1px solid ${(props) => props.theme.colors.border.primary};
	border-top-left-radius: ${STYLING.dimensions.radius.primary};
	border-bottom-left-radius: ${STYLING.dimensions.radius.primary};
`;

export const WrapperEmpty = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;
