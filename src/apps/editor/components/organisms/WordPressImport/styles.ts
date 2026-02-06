import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 18px;
`;

export const InlinePanel = styled.div`
	width: 100%;
	max-width: 700px;
	margin: 0 auto;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const InlineTitle = styled.p`
	margin: 0;
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const InputSection = styled(Section)`
	padding: 16px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
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
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	margin: 0;
	line-height: 1.55;
	max-width: 720px;
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
	border-radius: ${STYLING.dimensions.radius.alt4};
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
	max-height: min(720px, 78vh);
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
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
	padding-top: 14px;
`;

export const PostList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-height: 340px;
	min-height: 0;
	overflow-y: auto;
`;

export const CategoryListScrollArea = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-height: 520px;
	min-height: 400px;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;

	.categories-list {
		max-height: none;
		flex-shrink: 0;
	}
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
	min-height: 420px;
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

export const CheckboxGroup = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 8px 16px;
`;

export const CheckboxContainer = styled.div<{ disabled?: boolean }>`
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};

	&:hover {
		span {
			color: ${(props) => (props.disabled ? props.theme.colors.font.alt1 : props.theme.colors.font.primary)};
		}
	}

	span {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt1};
		transition: all 0.2s ease;
	}
`;

export const WhatToImportList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const WhatToImportCheckboxes = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px 18px;
`;

export const PostsLimitRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
`;

export const PostsLimitLabel = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const PostsLimitInputWrap = styled.div`
	width: 72px;
	flex-shrink: 0;

	input {
		text-align: center;
	}
`;

export const FileSelectedMessage = styled.p`
	color: ${(props) => props.theme.colors.indicator.active};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	margin: 8px 0 0 0;
	line-height: 1.4;
`;

export const SelectAllTitle = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
	cursor: pointer;
	flex: 1;

	&:hover {
		color: ${(props) => props.theme.colors.font.alt5};
	}
`;

export const CategoryButtonList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const CategoryNode = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const CategoryChildren = styled.div`
	position: relative;
	margin-left: 10px;
	margin-top: 2px;
	padding-left: 14px;
	display: flex;
	flex-direction: column;
	gap: 10px;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: -6px;
		bottom: 10px;
		border-left: 1px dashed ${(props) => props.theme.colors.border.primary};
	}

	> ${CategoryNode} {
		position: relative;
	}

	> ${CategoryNode}::before {
		content: '';
		position: absolute;
		left: -14px;
		top: 14px;
		width: 10px;
		border-top: 1px dashed ${(props) => props.theme.colors.border.primary};
	}
`;

export const CategoryButtonRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
`;

export const CategoryDescription = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	line-height: 1.4;
`;

export const CategoryLevelTag = styled.span`
	padding: 3px 8px;
	border-radius: ${STYLING.dimensions.radius.alt4};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	background: ${(props) => props.theme.colors.container.alt1.background};
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-transform: uppercase;
`;

export const TopicButtonList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
`;

export const NestedPostItem = styled(PostItem)<{ $depth: number }>`
	padding-left: ${(props) => props.$depth * 20 + 10}px;
`;

// Image grid styles – fixed-size small boxes
const THUMB_SIZE = 92;

export const ImageGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, ${THUMB_SIZE}px);
	gap: 10px;
	min-height: 200px;
	max-height: 360px;
	overflow-y: auto;
	padding: 4px;
	justify-content: start;
	flex-shrink: 0;
`;

export const ImageCard = styled.div<{ $selected: boolean }>`
	position: relative;
	width: ${THUMB_SIZE}px;
	height: ${THUMB_SIZE}px;
	border-radius: ${STYLING.dimensions.radius.alt1};
	overflow: hidden;
	border: 2px solid
		${(props) => (props.$selected ? props.theme.colors.button.primary.background : props.theme.colors.border.primary)};
	background: ${(props) => props.theme.colors.container.alt1.background};
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;

	&:hover {
		border-color: ${(props) => props.theme.colors.button.primary.background};
	}
`;

export const ImageThumbnail = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.container.alt1.background};

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
`;

export const ImageThumbnailPlaceholder = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.container.alt1.background};
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ImageOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 6px;
	pointer-events: none;
`;

export const ImageCheckbox = styled.div`
	position: absolute;
	top: 6px;
	left: 6px;
	pointer-events: auto;
	z-index: 2;
`;

export const ImageBadge = styled.span<{ $type: 'featured' | 'content' }>`
	position: absolute;
	top: 6px;
	right: 6px;
	padding: 2px 6px;
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
	background: ${(props) =>
		props.$type === 'featured' ? props.theme.colors.button.primary.background : props.theme.colors.overlay.primary};
	color: ${(props) => props.theme.colors.font.light1};
	border-radius: ${STYLING.dimensions.radius.alt4};
	text-transform: uppercase;
`;

export const ImagePostCount = styled.span`
	position: absolute;
	bottom: 6px;
	right: 6px;
	padding: 2px 6px;
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	background: ${(props) => props.theme.colors.overlay.primary};
	color: ${(props) => props.theme.colors.font.light1};
	border-radius: ${STYLING.dimensions.radius.alt4};
`;

export const ImageUploadStatus = styled.div<{ $status: string }>`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: ${(props) => {
		switch (props.$status) {
			case 'complete':
				return props.theme.colors.indicator.active;
			case 'error':
				return props.theme.colors.warning.primary;
			default:
				return props.theme.colors.overlay.primary;
		}
	}};
	color: ${(props) => props.theme.colors.font.light1};
	z-index: 3;
`;

export const ImageUploadProgress = styled.div`
	width: 60%;
	height: 4px;
	background: ${(props) => props.theme.colors.overlay.alt1};
	border-radius: ${STYLING.dimensions.radius.alt4};
	margin-top: 6px;
	overflow: hidden;
`;

export const ImageUploadProgressFill = styled.div<{ $progress: number }>`
	height: 100%;
	width: ${(props) => props.$progress}%;
	background: ${(props) => props.theme.colors.font.light1};
	transition: width 0.2s ease;
`;

export const ImageUploadStatusText = styled.span`
	font-size: ${(props) => props.theme.typography.size.xxxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
	text-transform: capitalize;
`;

export const ImageUploadStatusIcon = styled.span`
	font-size: 24px;
	margin-bottom: 4px;
`;

export const ImageSummary = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	padding: 12px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.alt1};
	margin-bottom: 12px;
`;

export const ImageSummaryStat = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

export const ImageSummaryLabel = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ImageSummaryValue = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ImageActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 12px;
`;

export const UploadWarning = styled.div`
	padding: 10px 12px;
	background: ${(props) => props.theme.colors.warning.primary};
	border-radius: ${STYLING.dimensions.radius.alt1};
	margin-top: 12px;

	span {
		color: ${(props) => props.theme.colors.font.light1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;
