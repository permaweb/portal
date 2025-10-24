import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ blockEditMode: boolean; height?: number }>`
	height: ${(props) => `${props.height}px`};
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => (props.blockEditMode ? props.theme.colors.container.alt1.background : 'transparent')};
	border: 1px dashed ${(props) => (props.blockEditMode ? props.theme.colors.border.primary : 'transparent')};
	border-radius: ${STYLING.dimensions.radius.alt4};
	padding: 5px;
	position: relative;

	svg {
		height: 20px;
		width: 20px;
		margin: 7.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const ResizeHandle = styled.div<{ $side: 'left' | 'right' | 'top' | 'bottom' }>`
	position: absolute;
	top: ${(props) => (props.$side === 'top' ? '-5px' : props.$side === 'bottom' ? 'auto' : '0')};
	bottom: ${(props) => (props.$side === 'bottom' ? '-5px' : 'auto')};
	right: ${(props) => (props.$side === 'right' ? '-5px' : 'auto')};
	left: ${(props) =>
		props.$side === 'left' ? '-5px' : props.$side === 'top' || props.$side === 'bottom' ? '0' : 'auto'};
	width: ${(props) => (props.$side === 'top' || props.$side === 'bottom' ? '100%' : '10px')};
	height: ${(props) => (props.$side === 'left' || props.$side === 'right' ? '100%' : '10px')};
	cursor: ${(props) => (props.$side === 'left' || props.$side === 'right' ? 'col-resize' : 'row-resize')};
	z-index: 0;
	transition: all 100ms;

	&:hover::after,
	&:active::after {
		content: '';
		position: absolute;
		${(props) => {
			if (props.$side === 'left' || props.$side === 'right') {
				return `
					top: 4px;
					left: ${props.$side === 'left' ? 'calc(50% + 1px)' : 'calc(50% - 1px)'};
					transform: translateX(-50%);
					width: 2px;
					height: calc(100% - 8px);
				`;
			} else {
				return `
					left: 4px;
					top: ${props.$side === 'top' ? 'calc(50% + 1px)' : 'calc(50% - 1px)'};
					transform: translateY(-50%);
					width: calc(100% - 8px);
					height: 2px;
				`;
			}
		}}
		background: ${(props) => props.theme.colors.border.alt5};
		border-radius: 2px;
		z-index: 1;
	}

	&:active {
		cursor: ${(props) => (props.$side === 'left' || props.$side === 'right' ? 'col-resize' : 'row-resize')};
	}
`;
