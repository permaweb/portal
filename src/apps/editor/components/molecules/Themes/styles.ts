import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
`;

export const SectionHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 2.5px;
	p {
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const SectionHeaderActions = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;
`;

export const SectionBody = styled.div`
	display: flex;
	flex-direction: column;
	gap: 25px;
	margin: 10px 0 0 0;
`;

export const SectionActions = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;
	margin: 10px 0 0 0;
`;

export const BackgroundWrapper = styled.div``;

export const MenusWrapper = styled.div``;

export const FlexWrapper = styled.div`
	display: flex;
	flex-direction: column;
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

export const GridRows = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 5px;

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const GridRow = styled.div`
	display: flex;
	flex: 1;
`;

export const AttributesWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
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

	&:hover {
		${ColorTooltip} {
			display: block;
		}
	}
`;

export const ColorBody = styled.button<{
	background: string;
	text: string;
	height?: number;
	width?: number;
	maxWidth?: boolean;
}>`
	height: ${(props) => (props.height ? `${props.height.toString()}px` : '40px')};
	width: ${(props) => (props.maxWidth ? '100%' : props.width ? `${props.width.toString()}px` : '50px')};
	background: ${(props) => props.background};
	border-radius: ${STYLING.dimensions.radius.primary};
	border: 1px solid ${(props) => props.theme.colors.border.alt8};
	overflow: hidden;
	position: relative;
	flex: 1;
	transform: scale(1);

	span {
		color: ${(props) => props.text};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}

	&:hover {
		transform: scale(1.02);
	}

	::after {
		content: '';
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
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

	&:disabled {
		pointer-events: none;
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
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-top-left-radius: ${STYLING.dimensions.radius.primary};
	border-bottom-left-radius: ${STYLING.dimensions.radius.primary};
`;

export const EndActions = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 20px;
	margin: 15px 0 0 0;
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

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0 20px 20px 20px !important;
`;

export const ModalBodyWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const ModalBodyElements = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.5px;
	margin: 15px 0 0 0;
`;

export const ModalBodyElement = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const ModalActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;

export const ThemeWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
	margin: -7.5px 0 0 0;
`;

export const Theme = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const ThemeRowWrapper = styled.div``;

export const ThemeRow = styled.div`
	display: flex;
	width: 100%;
	justify-content: space-between;
	gap: 15px;
`;

export const ThemeRowHeader = styled.div`
	display: flex;
	width: 100%;
	height: 15px;
	gap: 15px;
`;

export const ThemeRowFooter = styled.div`
	display: flex;
	width: 100%;
	height: 15px;
	gap: 15px;
`;

export const ThemeKey = styled.div`
	width: 100px;

	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ThemeValue = styled.div``;

export const ThemeLight = styled.div<{ colors: any }>`
	display: flex;
	color: ${(props) => props.theme.colors.font.primary};
`;

export const ThemeDark = styled.div<{ colors: any }>`
	display: flex;
`;

export const ThemeSectionWrapper = styled.div<{ $show: boolean }>`
	display: ${(props) => (props.$show ? 'flex' : 'none')};
	flex-direction: column;
`;

export const ThemeSection = styled.div<{ colors: any; preferences: any }>`
	display: flex;
	flex-direction: column;
	width: 100%;

	span {
		margin-top: 30px;
		margin-bottom: 5px;
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}

	${ThemeRowHeader} > ${ThemeLight} {
		border-top-left-radius: ${STYLING.dimensions.radius.primary};
		border-top-right-radius: ${STYLING.dimensions.radius.primary};

		${ThemeValue} {
			border-top-left-radius: ${STYLING.dimensions.radius.primary};
			border-top-right-radius: ${STYLING.dimensions.radius.primary};
			border-top: ${(props) => `1px solid rgba(${props.colors.border.light},1)`};
		}
	}

	${ThemeRowFooter} > ${ThemeLight} {
		border-bottom-left-radius: ${STYLING.dimensions.radius.primary};
		border-bottom-right-radius: ${STYLING.dimensions.radius.primary};
		${ThemeValue} {
			border-bottom-left-radius: ${STYLING.dimensions.radius.primary};
			border-bottom-right-radius: ${STYLING.dimensions.radius.primary};
			border-bottom: ${(props) => `1px solid rgba(${props.colors.border.light},1)`};
		}
	}

	${ThemeRowHeader} > ${ThemeDark} {
		border-top-left-radius: ${STYLING.dimensions.radius.primary};
		border-top-right-radius: ${STYLING.dimensions.radius.primary};
		border-top: ${(props) => `1px solid rgba(${props.colors.border.dark},1)`};

		${ThemeValue} {
			border-top-left-radius: ${STYLING.dimensions.radius.primary};
			border-top-right-radius: ${STYLING.dimensions.radius.primary};
		}
	}

	${ThemeRowFooter} > ${ThemeDark} {
		border-bottom-left-radius: ${STYLING.dimensions.radius.primary};
		border-bottom-right-radius: ${STYLING.dimensions.radius.primary};
		border-bottom: ${(props) => `1px solid rgba(${props.colors.border.dark},1)`};
		${ThemeValue} {
			border-bottom-left-radius: ${STYLING.dimensions.radius.primary};
			border-bottom-right-radius: ${STYLING.dimensions.radius.primary};
		}
	}
`;

export const ThemeVariantsWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

export const ThemeSectionColumnWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

export const ThemeSectionColumnAction = styled.button<{ open: boolean }>`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 6.5px 15px;
	background: ${(props) => props.theme.colors.button.primary.background};

	border-top: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-right: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-bottom: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-left: 1px solid ${(props) => props.theme.colors.button.primary.border};

	border-top-right-radius: ${STYLING.dimensions.radius.primary};
	border-top-left-radius: ${STYLING.dimensions.radius.primary};
	border-bottom-right-radius: ${(props) => (props.open ? '0' : STYLING.dimensions.radius.primary)};
	border-bottom-left-radius: ${(props) => (props.open ? '0' : STYLING.dimensions.radius.primary)};

	cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	transition: all 100ms;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}

	svg {
		height: 18.5px;
		width: 18.5px;
		transform: rotate(${(props) => (props.open ? '360deg' : '270deg')});
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
		margin: 5px 0 0 0;
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

export const ThemeSectionColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 10.5px 15px 15px 15px;
	background: ${(props) => props.theme.colors.container.alt1.background};

	border-right: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-bottom: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-left: 1px solid ${(props) => props.theme.colors.button.primary.border};

	border-bottom-right-radius: ${STYLING.dimensions.radius.primary};
	border-bottom-left-radius: ${STYLING.dimensions.radius.primary};

	> * {
		&:not(:last-child) {
			border-bottom: 1px dotted ${(props) => props.theme.colors.border.primary};
			padding: 0 0 15px 0;
		}
	}
`;

export const ThemeSectionHeader = styled.div`
	padding: 0 0 7.5px 0 !important;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.alt1} !important;
	display: flex;
	align-items: center;
	justify-content: space-between;
	span {
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const ThemeSectionHeaderVariants = styled.div`
	width: 270px;
	display: flex;
	align-items: center;
	gap: 20px;

	span {
		width: 135px;
		display: flex;
		align-items: center;
		gap: 7.5px;
		color: ${(props) => props.theme.colors.font.alt1};

		svg {
			height: 15px;
			width: 15px;
			margin: 7.5px 0 0 0;
		}
	}
`;

export const ButtonPreview = styled.button<{ theme: any }>`
	color: ${(props) => `rgba(${props.theme.default.colors.color},1)`};
	background: ${(props) => `rgba(${props.theme.default.colors.background},1)`};
	border: ${(props) => `1px solid rgba(${props.theme.default.colors.border},1)`};
	width: fit-content;
	padding: 6px 12px;

	&:hover {
		color: ${(props) => `rgba(${props.theme.hover.colors.color},1)`};
		background: ${(props) => `rgba(${props.theme.hover.colors.background},1)`};
		border: ${(props) => `1px solid rgba(${props.theme.hover.colors.border},1)`};
	}
`;

export const ThemePreview = styled.div``;
