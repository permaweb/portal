import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
	position: relative;
	max-width: ${STYLING.cutoffs.maxEditor};
	margin: 0 auto;
`;

export const ToolbarWrapper = styled.div<{ navWidth: number; hasBodyOverflow: boolean }>`
	width: calc(100vw - (${(props) => `${props.navWidth}px`} + 15px));
	position: fixed;
	top: ${STYLING.dimensions.nav.height};
	left: ${(props) => `${props.navWidth}px`};
	z-index: 1;
	background: ${(props) => props.theme.colors.view.background};
	border: 1px solid ${(props) => props.theme.colors.view.background};
	padding: 10px 20px 15px 30px;
	padding-right: ${(props) => (props.hasBodyOverflow ? '20px' : '5px')};

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
		position: relative;
		top: auto;
		left: auto;
		padding: 0;
	}
`;

export const ToolbarContent = styled.div<{ navWidth: number }>`
	max-width: ${STYLING.cutoffs.maxEditor} !important;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		padding: 0;
	}
`;

export const TitleWrapper = styled.div`
	flex: 1;
	min-width: 200px;

	input {
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
		font-size: ${(props) => props.theme.typography.size.lg};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};

		&::placeholder {
			color: ${(props) => props.theme.colors.font.alt2};
		}

		&:disabled {
			opacity: 0.6;
		}
	}
`;

export const EndActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const UpdateWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}

	.indicator {
		width: 7.5px;
		height: 7.5px;
		background: ${(props) => props.theme.colors.warning.primary};
		border-radius: 50%;
	}
`;

export const SubmitWrapper = styled.div``;

export const EditorWrapper = styled.div`
	width: 100%;
	margin: ${STYLING.dimensions.nav.height} 0 0 0;
`;

export const Editor = styled.div<{ blockEditMode: boolean }>`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const ElementWrapper = styled.div<{ blockEditMode: boolean }>`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const Element = styled.div<{ blockEditMode: boolean; direction: string }>`
	display: flex;
	gap: 20px;
	flex-direction: ${(props) => props.direction};
	width: 100%;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const PreviewContainer = styled.div`
	flex: 1;
	min-width: 0;
	max-width: 700px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex: none;
		width: 100%;
		max-width: none;
	}
`;

export const PreviewAreaWrapper = styled.div`
	display: flex;
	gap: 8px;
	align-items: stretch;
`;

export const PreviewArea = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 200px;
	padding: 10px;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const EmptyState = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px;
	color: ${(props) => props.theme.colors.font.alt2};
	font-size: ${(props) => props.theme.typography.size.small};
`;

export const DropZone = styled.div<{ $isActive?: boolean; $isDraggingOver?: boolean }>`
	min-height: ${(props) => (props.$isActive ? '70px' : '4px')};
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.alt2};
	background: ${(props) => (props.$isDraggingOver ? props.theme.colors.button.alt1.background + '15' : 'transparent')};
	border: ${(props) =>
		props.$isDraggingOver
			? `2px solid ${props.theme.colors.button.alt1.background}`
			: props.$isActive
			? `1px dashed ${props.theme.colors.border.primary}`
			: 'none'};
	transition: all 150ms ease;
`;

export const HDropZone = styled.div<{ $isActive?: boolean; $isDraggingOver?: boolean }>`
	flex: 0 0 ${(props) => (props.$isActive ? '50px' : '0')};
	min-height: 80px;
	display: ${(props) => (props.$isActive ? 'flex' : 'none')};
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.alt2};
	background: ${(props) => (props.$isDraggingOver ? props.theme.colors.button.alt1.background + '20' : 'transparent')};
	border: ${(props) =>
		props.$isDraggingOver
			? `2px solid ${props.theme.colors.button.alt1.background}`
			: props.$isActive
			? `1px dashed ${props.theme.colors.border.primary}`
			: 'none'};
	transition: all 150ms ease;
`;

export const DropIndicator = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 20px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.button.alt1.background};
	border-radius: ${STYLING.dimensions.radius.alt2};

	svg {
		width: 16px;
		height: 16px;
		fill: ${(props) => props.theme.colors.button.alt1.background};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.button.alt1.background};
		text-transform: uppercase;
	}
`;

export const RowContainer = styled.div`
	display: flex;
	gap: 8px;
	align-items: stretch;
`;

export const Row = styled.div<{ $isDraggingOver?: boolean }>`
	display: flex;
	gap: 10px;
	padding: 10px;
	min-height: 100px;
	border-radius: ${STYLING.dimensions.radius.alt2};
	background: ${(props) =>
		props.$isDraggingOver
			? props.theme.colors.button.alt1.background + '10'
			: props.theme.colors.container.alt2.background};
	border: 2px solid
		${(props) =>
			props.$isDraggingOver ? props.theme.colors.button.alt1.background : props.theme.colors.border.primary};
	transition: all 150ms ease;
`;

export const ColumnWrapper = styled.div`
	flex: 1;
	display: flex;
	min-width: 0;
`;

export const Column = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
`;

export const BlockRow = styled.div`
	display: flex;
	align-items: stretch;
`;

export const BlockDropZone = styled.div<{ $isActive?: boolean; $isDraggingOver?: boolean }>`
	min-height: ${(props) => (props.$isActive ? '40px' : '4px')};
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.alt2};
	background: ${(props) => (props.$isDraggingOver ? props.theme.colors.button.alt1.background + '20' : 'transparent')};
	border: ${(props) =>
		props.$isDraggingOver
			? `2px solid ${props.theme.colors.button.alt1.background}`
			: props.$isActive
			? `1px dashed ${props.theme.colors.border.primary}`
			: 'none'};
	transition: all 150ms ease;
`;

export const ColumnDropZone = styled.div<{ $isActive?: boolean; $isDraggingOver?: boolean }>`
	width: ${(props) => (props.$isActive ? '50px' : '8px')};
	min-height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.alt2};
	background: ${(props) =>
		props.$isDraggingOver
			? props.theme.colors.button.alt1.background + '20'
			: props.$isActive
			? 'rgba(100, 100, 100, 0.1)'
			: 'rgba(100, 100, 100, 0.05)'};
	border: ${(props) =>
		props.$isDraggingOver
			? `2px solid ${props.theme.colors.button.alt1.background}`
			: props.$isActive
			? `2px dashed ${props.theme.colors.border.primary}`
			: `1px dashed ${props.theme.colors.border.primary}40`};
	transition: all 150ms ease;
`;

export const EdgeDropZone = styled.div<{
	$isActive?: boolean;
	$isDraggingOver?: boolean;
	$position?: 'left' | 'right';
}>`
	flex: 0 0 ${(props) => (props.$isActive ? '50px' : '0')};
	min-height: ${(props) => (props.$isActive ? '80px' : '0')};
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.alt2};
	background: ${(props) =>
		props.$isDraggingOver
			? props.theme.colors.button.alt1.background + '20'
			: props.$isActive
			? 'rgba(100, 100, 100, 0.15)'
			: 'transparent'};
	border: ${(props) =>
		props.$isDraggingOver
			? `2px solid ${props.theme.colors.button.alt1.background}`
			: props.$isActive
			? `2px dashed ${props.theme.colors.border.primary}`
			: 'none'};
	transition: all 150ms ease;
	overflow: hidden;
`;

export const BlockWrapper = styled.div<{ $isDragging?: boolean }>`
	width: 100%;
	user-select: none;
	opacity: ${(props) => (props.$isDragging ? 0.8 : 1)};
`;

export const Block = styled.div`
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
	overflow: hidden;
`;

export const BlockHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 6px 8px;
	background: ${(props) => props.theme.colors.container.alt3.background};
	cursor: grab;

	&:active {
		cursor: grabbing;
	}

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
	}
`;

export const BlockHeaderLeft = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
`;

export const DragHandle = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 14px;
	height: 14px;

	svg {
		width: 10px;
		height: 10px;
		fill: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const BlockContent = styled.div<{ $type?: string }>`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
	aspect-ratio: ${(props) => (props.$type === 'thumbnail' ? '16 / 9' : 'auto')};
	min-height: ${(props) => (props.$type === 'thumbnail' ? 'auto' : '60px')};

	svg {
		width: 24px;
		height: 24px;
		fill: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const BlockPreviewCard = styled.div<{ $isGhost?: boolean }>`
	flex: 1;
	min-width: 120px;
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.button.alt1.background};
	border-radius: ${STYLING.dimensions.radius.alt2};
	overflow: hidden;
	opacity: ${(props) => (props.$isGhost ? 0.7 : 1)};
`;

export const BlockPreviewHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 8px;
	background: ${(props) => props.theme.colors.container.alt3.background};

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
	}

	svg {
		width: 12px;
		height: 12px;
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const BlockPreviewBody = styled.div<{ $type?: string }>`
	padding: 15px;
	aspect-ratio: ${(props) => (props.$type === 'thumbnail' ? '16 / 9' : 'auto')};
	min-height: ${(props) => (props.$type === 'thumbnail' ? 'auto' : '40px')};
`;

export const BlocksContainer = styled.div`
	flex: 0 0 240px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-left: auto;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex: none;
		width: 100%;
		margin-left: 0;
	}
`;

export const BlocksPanel = styled.div`
	width: 100%;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	overflow: hidden;
`;

export const BlocksPanelHeader = styled.div`
	width: 100%;
	padding: 12px 15px;
	background: ${(props) => props.theme.colors.container.alt3.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
		margin: 0;
	}
`;

export const BlocksList = styled.div`
	display: flex;
	flex-direction: column;
	padding: 8px;
	min-height: 50px;
`;

export const AvailableBlock = styled.div<{ $isDragging?: boolean }>`
	height: 40px;
	width: 100%;
	display: flex;
	align-items: center;
	gap: 10px;
	border-radius: ${STYLING.dimensions.radius.alt2};
	padding: 0 12px;
	background: ${(props) => (props.$isDragging ? props.theme.colors.button.alt1.background : 'transparent')};
	cursor: grab;
	transition: background 100ms ease;
	user-select: none;

	&:active {
		cursor: grabbing;
	}

	span {
		color: ${(props) => (props.$isDragging ? props.theme.colors.button.alt1.color : props.theme.colors.font.primary)};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}

	svg {
		height: 16px;
		width: 16px;
		flex-shrink: 0;
		color: ${(props) => (props.$isDragging ? props.theme.colors.button.alt1.color : props.theme.colors.font.alt1)};
		fill: ${(props) => (props.$isDragging ? props.theme.colors.button.alt1.color : props.theme.colors.font.alt1)};
	}

	&:hover {
		background: ${(props) => props.theme.colors.button.alt1.background};
		span {
			color: ${(props) => props.theme.colors.button.alt1.color};
		}
		svg {
			color: ${(props) => props.theme.colors.button.alt1.color};
			fill: ${(props) => props.theme.colors.button.alt1.color};
		}
	}
`;

export const AllUsed = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;

	span {
		color: ${(props) => props.theme.colors.font.alt2};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}
`;

export const DragOverlayBlock = styled.div`
	width: 200px;
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 2px solid ${(props) => props.theme.colors.button.alt1.background};
	border-radius: ${STYLING.dimensions.radius.alt2};
	overflow: hidden;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
	cursor: grabbing;
`;

export const PreviewModeContainer = styled.div`
	max-width: 700px;
`;

export const LivePreview = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 20px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const PreviewRow = styled.div<{ $blockCount: number }>`
	display: flex;
	gap: 20px;
	align-items: flex-start;
`;

export const PreviewColumn = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const PreviewThumbnail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	aspect-ratio: 16 / 9;
	background: ${(props) => props.theme.colors.container.alt3.background};
	border-radius: ${STYLING.dimensions.radius.alt2};

	svg {
		width: 32px;
		height: 32px;
		fill: ${(props) => props.theme.colors.font.alt2};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;

export const PreviewTitle = styled.h2`
	margin: 0;
	font-size: ${(props) => props.theme.typography.size.lg};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const PreviewDescription = styled.p`
	margin: 0;
	font-size: ${(props) => props.theme.typography.size.small};
	color: ${(props) => props.theme.colors.font.alt1};
	line-height: 1.5;
`;

export const PreviewAuthor = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;

	.avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: ${(props) => props.theme.colors.container.alt3.background};
	}

	span {
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const PreviewDate = styled.div`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	color: ${(props) => props.theme.colors.font.alt2};
`;

export const PreviewCategories = styled.div`
	display: flex;
	gap: 8px;

	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
		text-transform: uppercase;
	}
`;

export const PreviewTags = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;

	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		color: ${(props) => props.theme.colors.button.alt1.background};
	}
`;

export const PreviewComments = styled.div`
	span {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		color: ${(props) => props.theme.colors.font.alt2};
	}
`;
