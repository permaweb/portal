import styled, { DefaultTheme } from 'styled-components';

import { STYLING } from 'helpers/config';
import { PageSectionEnum } from 'helpers/types';

function getElementPadding(_type: PageSectionEnum) {
	return '10px';
}

function getElementWrapper(blockEditMode: boolean, type: PageSectionEnum, theme: DefaultTheme) {
	return `
		padding: ${blockEditMode ? getElementPadding(type) : '0'};
		background: ${blockEditMode ? theme.colors.container.primary.background : 'transparent'};
		border: 1px solid ${blockEditMode ? theme.colors.border.primary : 'transparent'};
		border-radius: ${blockEditMode ? STYLING.dimensions.radius.primary : '0'};
	`;
}

function getElementCursor(_type: PageSectionEnum) {
	return 'default';
}

export const ElementWrapper = styled.div<{ blockEditMode: boolean; type: PageSectionEnum }>`
	width: ${(props) => (props.blockEditMode ? 'calc(100% - 27.5px)' : '100%')};
	display: flex;
	flex-direction: column;
	gap: 10px;
	position: relative;
	cursor: default;
`;

export const Element = styled.div<{ blockEditMode: boolean; type: PageSectionEnum }>`
	${(props) => getElementWrapper(props.blockEditMode, props.type, props.theme)};
	cursor: ${(props) => getElementCursor(props.type)};
	display: flex;
	gap: 10px;
	flex-direction: ${(props) => props.type ?? 'row'};
`;

export const DefaultElementWrapper = styled.div`
	position: relative;
`;

export const ElementDragWrapper = styled.div`
	display: flex;
	gap: 10px;
	position: relative;
`;

export const EDragWrapper = styled.div`
	width: 17.5px;
	cursor: default;
`;

export const EDragHandler = styled.div`
	height: 26.75px;
	cursor: grab;
	border-radius: ${STYLING.dimensions.radius.alt4};
	transition: all 200ms;
	&:active {
		cursor: grabbing;
	}

	svg {
		width: 17.5px;
		margin: 5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}

	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const ElementToolbarWrapper = styled.div``;

export const ElementToolbarToggle = styled.div`
	position: absolute;
	top: -22.5px;
	display: none;
	width: 100%;
	justify-content: space-between;
`;

export const ElementToolbar = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
`;

export const EToolbarHeader = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 100%;
		overflow: hidden;
	}
`;

export const EToolbarActions = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 0 0 0 auto;
`;

export const SubElementWrapper = styled.div<{ width: number }>`
	display: flex;
	flex: ${(props) => props.width};
	flex-direction: column;
	gap: 10px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
	padding: 15px;
	position: relative;
	max-width: 100%;
	overflow: visible;
`;

export const ResizeHandle = styled.div<{ $side: 'left' | 'right' }>`
	position: absolute;
	top: 0;
	right: ${(props) => (props.$side === 'right' ? '-5px' : 'auto')};
	left: ${(props) => (props.$side === 'left' ? '-5px' : 'auto')};
	width: 10px;
	height: 100%;
	cursor: col-resize;
	z-index: 0;
	transition: all 100ms;

	&:hover::after,
	&:active::after {
		content: '';
		position: absolute;
		top: 4px;
		left: ${(props) => (props.$side === 'left' ? 'calc(50% + 1px)' : 'calc(50% - 1px)')};
		transform: translateX(-50%);
		width: 2px;
		height: calc(100% - 8px);
		background: ${(props) => props.theme.colors.border.alt7};
		border-radius: 2px;
		z-index: 1;
	}
`;

export const SubElementHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const SubElementHeaderAction = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;

	p {
		color: ${(props) => props.theme.colors.font.alt1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 100%;
		overflow: hidden;
	}
`;

export const SubElementBody = styled.div`
	width: 100%;
`;

export const NestedSectionWrapper = styled.div`
	width: 100%;
	position: relative;
	contain: layout style;

	/* Prevent nested section content from overflowing during drag */
	> * {
		max-width: 100%;
	}

	/* Constrain nested section when being dragged */
	[data-rbd-draggable-context-id] {
		max-width: 100%;
		overflow: hidden;
	}
`;

export const BlockSelector = styled.div`
	width: 100%;
	display: flex;
	gap: 10px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex-direction: column;
	}
`;

export const BlockSelectorColumn = styled(BlockSelector)`
	flex-direction: column;
`;

export const BlockSelectorActions = styled.div`
	button {
		margin: 10px 0 0 0;
	}
`;

export const DroppableContainer = styled.div<{ $direction: 'row' | 'column' }>`
	display: flex;
	gap: 10px;
	flex-direction: ${(props) => props.$direction};
	width: 100%;
	flex-wrap: nowrap;
`;
