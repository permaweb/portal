import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const Header = styled.div<{ $compact?: boolean }>`
	display: flex;
	flex-direction: ${(props) => (props.$compact ? 'column' : 'row')};
	align-items: flex-start;
	justify-content: space-between;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		flex-direction: column;
	}
`;

export const HeaderCopy = styled.div`
	max-width: 680px;

	h2 {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.lg};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}

	p {
		margin-top: 5px;
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}
`;

export const HeaderActions = styled.div<{ $compact?: boolean }>`
	width: ${(props) => (props.$compact ? '100%' : 'auto')};
	display: flex;
	align-items: center;
	justify-content: ${(props) => (props.$compact ? 'flex-end' : 'initial')};
	gap: 10px;
	flex-shrink: 0;
`;

export const Palettes = styled.div<{ $compact?: boolean }>`
	display: grid;
	grid-template-columns: ${(props) => (props.$compact ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
	gap: 20px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		grid-template-columns: 1fr;
	}
`;

export const Palette = styled.section`
	overflow: hidden;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
`;

export const PaletteHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 15px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	h3 {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const PaletteTitle = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;

	> div {
		display: flex;
		align-items: center;
	}

	svg {
		width: 16.5px;
		height: 16.5px;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
		margin: 0 0 -3px 0;
	}
`;

export const PaletteBody = styled.div`
	display: flex;
	flex-direction: column;
	padding: 5px 15px;
`;

export const ColorRow = styled.div`
	min-height: 68px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	padding: 10px 0;

	&:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	}
`;

export const ColorInfo = styled.div`
	min-width: 0;
`;

export const ColorLabel = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
`;

export const ColorDescription = styled.p`
	margin-top: 2px;
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
`;

export const ColorButton = styled.button`
	min-width: 128px;
	height: 40px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 5px 9px 5px 5px;
	background: ${(props) => props.theme.colors.button.primary.background};
	border: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-radius: ${STYLING.dimensions.radius.primary};
	cursor: pointer;

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}

	&:hover:not(:disabled) {
		background: ${(props) => props.theme.colors.button.primary.active.background};
		border-color: ${(props) => props.theme.colors.button.primary.active.border};
	}

	&:disabled {
		opacity: 0.55;
		cursor: default;
	}
`;

export const ColorSwatch = styled.span<{ $color: string }>`
	width: 28px;
	height: 28px;
	display: block;
	flex-shrink: 0;
	background: ${(props) => props.$color};
	border: 1px solid ${(props) => props.theme.colors.border.alt1};
	border-radius: ${STYLING.dimensions.radius.alt3};
`;

export const Preview = styled.div<{ $background: string; $text: string }>`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 15px;
	color: rgb(${(props) => props.$text});
	background: rgb(${(props) => props.$background});
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};

	h3 {
		color: rgb(${(props) => props.$text});
	}
`;

export const PreviewNav = styled.div<{ $surface: string; $border: string; $radius: number }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	padding: 9px 11px;
	background: rgb(${(props) => props.$surface});
	border: 1px solid rgba(${(props) => props.$border}, 0.32);
	border-radius: ${(props) => props.$radius}px;
	font-size: 12px;
	font-weight: 600;
`;

export const PreviewLink = styled.span<{ $color: string }>`
	color: rgb(${(props) => props.$color});
`;

export const PreviewCard = styled.div<{ $surface: string; $border: string; $radius: number }>`
	padding: 14px;
	background: rgb(${(props) => props.$surface});
	border: 1px solid rgba(${(props) => props.$border}, 0.32);
	border-radius: ${(props) => props.$radius}px;

	h3 {
		margin-top: 4px;
		font-size: 16px;
	}

	p {
		margin-top: 5px;
		font-size: 12px;
		opacity: 0.62;
	}
`;

export const PreviewKicker = styled.span<{ $accent: string }>`
	color: rgb(${(props) => props.$accent});
	font-size: 10px;
	font-weight: 700;
`;

export const PreviewButton = styled.span<{ $accent: string; $color: string; $radius: number }>`
	width: fit-content;
	display: block;
	margin-top: 12px;
	padding: 6px 9px;
	color: rgb(${(props) => props.$color});
	font-size: 11px;
	font-weight: 600;
	background: rgb(${(props) => props.$accent});
	border-radius: ${(props) => Math.min(props.$radius, 8)}px;
`;

export const Radius = styled.section`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 25px;
	padding: 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: stretch;
		flex-direction: column;
	}
`;

export const RadiusCopy = styled.div`
	h3 {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}

	p {
		margin-top: 2px;
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
	}
`;

export const RadiusControl = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;

	input {
		width: 180px;
		height: 4px;
		margin: 0;
		padding: 0;
		appearance: none;
		background: ${(props) => props.theme.colors.border.alt1};
		border-radius: ${STYLING.dimensions.radius.button};
		accent-color: ${(props) => props.theme.colors.button.alt1.background};
		cursor: pointer;
	}

	input::-webkit-slider-thumb {
		width: 16px;
		height: 16px;
		appearance: none;
		background: ${(props) => props.theme.colors.button.alt1.background};
		border: 2px solid ${(props) => props.theme.colors.container.primary.background};
		border-radius: 50%;
	}

	input::-moz-range-thumb {
		width: 14px;
		height: 14px;
		background: ${(props) => props.theme.colors.button.alt1.background};
		border: 2px solid ${(props) => props.theme.colors.container.primary.background};
		border-radius: 50%;
	}

	input:disabled {
		opacity: 0.55;
		cursor: default;
	}

	span {
		min-width: 36px;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		width: 100%;

		input {
			width: 100%;
		}
	}
`;

export const Picker = styled.div`
	padding: 0 20px 20px;

	.react-colorful {
		width: 100%;
		height: 240px;
	}
`;

export const PickerPreview = styled.div<{ $color: string }>`
	height: 55px;
	margin-bottom: 12px;
	background: ${(props) => props.$color};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const PickerFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	margin-top: 15px;

	input {
		height: ${STYLING.dimensions.form.small};
		width: 145px;
		padding: 0 10px;
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		background: ${(props) => props.theme.colors.form.background};
		border: 1px solid ${(props) => props.theme.colors.form.border};
		border-radius: ${STYLING.dimensions.radius.alt3};
	}
`;

export const PickerActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;
