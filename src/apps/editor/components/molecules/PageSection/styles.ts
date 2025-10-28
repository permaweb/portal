import styled from 'styled-components';

import { STYLING } from 'helpers/config';
import { PageSectionEnum } from 'helpers/types';

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
	cursor: ${(props) => getElementCursor(props.type)};
	display: flex;
	gap: 10px;
	flex-direction: ${(props) => props.type ?? 'row'};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
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
		margin: 5px 0 0 -3px;
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

export const SubElementWrapper = styled.div<{ blockEditMode: boolean; width: number }>`
	display: flex;
	flex: ${(props) => props.width};
	flex-direction: column;
	gap: 5px;
	background: ${(props) => (props.blockEditMode ? props.theme.colors.container.primary.background : 'transparent')};
	box-shadow: ${(props) => (props.blockEditMode ? `${props.theme.colors.shadow.primary} 0px 1px 5px 0.5px` : 'none')};
	border: 1px solid ${(props) => (props.blockEditMode ? props.theme.colors.border.primary : 'transparent')};
	border-radius: ${STYLING.dimensions.radius.primary};
	padding: ${(props) => (props.blockEditMode ? '12.5px 15px 15px 12.5px' : '0')};
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
		background: ${(props) => props.theme.colors.border.alt5};
		border-radius: 2px;
		z-index: 1;
	}

	&:active {
		cursor: col-resize;
	}
`;

export const SubElementHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const NestedSectionDragHandle = styled.div`
	display: flex;
	align-items: center;
	padding: 5px 0;
	margin-bottom: 5px;
	cursor: grab;

	&:active {
		cursor: grabbing;
	}
`;

export const SubElementHeaderAction = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;
	width: 100%;

	p {
		color: ${(props) => props.theme.colors.font.alt1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 75%;
		overflow: hidden;
	}
`;

export const SubElementBody = styled.div`
	width: 100%;
`;

export const NestedSectionWrapper = styled.div`
	width: 100%;
	position: relative;
	overflow: hidden;
	contain: layout style paint;

	/* Ensure nested sections don't break layout during drag */
	> * {
		width: 100%;
		max-width: 100%;
		position: relative;
	}
`;

export const BlocksEmpty = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const BlockSelector = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex-direction: column;
	}
`;

export const PageBlocks = styled.div`
	height: 100%;
	width: 265px;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const ArticleBlocks = styled.div`
	width: calc(100% - 265px);
`;

export const BlockSelectorColumn = styled(BlockSelector)`
	flex-direction: column;
`;

export const BlockSelectorActions = styled.div`
	width: 100%;
	button {
		margin: 10px 0 0 0;
	}
`;

export const DroppableContainer = styled.div<{ $direction: 'row' | 'column' | 'grid' }>`
	display: flex;
	gap: 10px;
	flex-direction: ${(props) => (props.$direction === 'grid' ? 'row' : props.$direction)};
	width: 100%;
	flex-wrap: ${(props) => (props.$direction === 'grid' ? 'wrap' : 'nowrap')};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;
