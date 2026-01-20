import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const SectionLabel = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const SectionInfo = styled.p`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	margin: 0;
	line-height: 1.5;
`;

export const ProgressWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const ProgressBar = styled.div`
	height: 8px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: 4px;
	overflow: hidden;
`;

export const ProgressFill = styled.div<{ $progress: number }>`
	height: 100%;
	width: ${(props) => props.$progress}%;
	background: ${(props) => props.theme.colors.button.primary.background};
	transition: width 0.3s ease;
`;

export const ProgressMessage = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const PreviewWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
	max-height: 400px;
	overflow-y: auto;
`;

export const PreviewHeader = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding-bottom: 10px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const PreviewTitle = styled.h3`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.base};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
	margin: 0;
`;

export const PreviewDescription = styled.p`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	margin: 0;
`;

export const PreviewStats = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	gap: 10px;
`;

export const PreviewStat = styled.div`
	display: flex;
	flex-direction: column;
	gap: 3px;
	padding: 10px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.alt1};
`;

export const PreviewStatLabel = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	text-transform: uppercase;
`;

export const PreviewStatValue = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.base};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ErrorWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding: 15px;
	background: ${(props) => props.theme.colors.warning.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const ErrorMessage = styled.span`
	color: ${(props) => props.theme.colors.font.light1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const Actions = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
`;

export const PostList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-height: 200px;
	overflow-y: auto;
`;

export const PostItem = styled.div<{ $selected: boolean }>`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px;
	background: ${(props) =>
		props.$selected ? props.theme.colors.container.primary.active : props.theme.colors.container.alt1.background};
	border: 1px solid
		${(props) => (props.$selected ? props.theme.colors.button.primary.background : props.theme.colors.border.primary)};
	border-radius: ${STYLING.dimensions.radius.alt1};
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const PostItemContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex: 1;
	min-width: 0;
`;

export const PostItemTitle = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const PostItemMeta = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const SelectAllWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 0;
`;

export const Tabs = styled.div`
	display: flex;
	gap: 5px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	padding-bottom: 10px;
`;

export const Tab = styled.button<{ $active: boolean }>`
	padding: 8px 16px;
	background: ${(props) =>
		props.$active ? props.theme.colors.button.primary.background : props.theme.colors.container.alt1.background};
	color: ${(props) => (props.$active ? props.theme.colors.button.primary.color : props.theme.colors.font.primary)};
	border: 1px solid
		${(props) => (props.$active ? props.theme.colors.button.primary.border : props.theme.colors.border.primary)};
	border-radius: ${STYLING.dimensions.radius.alt1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover:not(:disabled) {
		background: ${(props) =>
			props.$active
				? props.theme.colors.button.primary.active.background
				: props.theme.colors.container.primary.active};
	}
`;

export const ThemePreview = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const ColorPalette = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const ColorSwatch = styled.div<{ $color: string; $isLight: boolean }>`
	width: 40px;
	height: 40px;
	border-radius: ${STYLING.dimensions.radius.alt1};
	background: ${(props) => props.$color};
	border: 1px solid ${(props) => (props.$isLight ? props.theme.colors.border.primary : 'transparent')};
	cursor: pointer;
	position: relative;
	transition: transform 0.2s ease;

	&:hover {
		transform: scale(1.1);
	}
`;

export const ColorSwatchLabel = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
`;

export const ColorSwatchName = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	text-align: center;
	max-width: 60px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const ExtractedColors = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
	gap: 12px;
`;

export const ExtractedColorItem = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
`;

export const ExtractedColorSwatch = styled.div<{ $color: string }>`
	width: 50px;
	height: 50px;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.$color};
	border: 2px solid ${(props) => props.theme.colors.border.primary};
`;

export const ExtractedColorLabel = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	text-transform: capitalize;
`;

export const ExtractedColorValue = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ThemeSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const ThemeSectionTitle = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const FontPreview = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const FontItem = styled.div<{ $fontFamily?: string }>`
	padding: 10px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.alt1};
	font-family: ${(props) => props.$fontFamily || 'inherit'};
`;

export const FontLabel = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	text-transform: uppercase;
	margin-bottom: 4px;
	display: block;
`;

export const FontSample = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.base};
`;

export const NoThemeMessage = styled.div`
	padding: 15px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.primary};
	text-align: center;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;
