import styled, { DefaultTheme } from 'styled-components';

import { STYLING } from 'helpers/config';
import { PageBlockEnum } from 'helpers/types';

function getElementPadding(_type: PageBlockEnum) {
	return '10px';
}

function getElementWrapper(blockEditMode: boolean, type: PageBlockEnum, theme: DefaultTheme) {
	return `
		padding: ${blockEditMode ? getElementPadding(type) : '0'};
		background: ${blockEditMode ? theme.colors.container.primary.background : 'transparent'};
		border: 1px solid ${blockEditMode ? theme.colors.border.primary : 'transparent'};
		border-radius: ${blockEditMode ? STYLING.dimensions.radius.primary : '0'};
	`;
}

function getElementCursor(_type: PageBlockEnum) {
	return 'default';
}

export const ElementWrapper = styled.div<{ blockEditMode: boolean; type: PageBlockEnum }>`
	width: ${(props) => (props.blockEditMode ? 'calc(100% - 27.5px)' : '100%')};
	display: flex;
	flex-direction: column;
	gap: 10px;
	position: relative;
	cursor: default;
`;

export const Element = styled.div<{ blockEditMode: boolean; type: PageBlockEnum }>`
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
	gap: 15px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
	padding: 15px;
`;

export const SubElementHeader = styled.div`
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

export const SubElementBody = styled.div``;

export const BlockSelector = styled.div`
	width: 100%;
`;

export const BADropdownSection = styled.div`
	min-width: 265px;
	flex: 1;
	max-width: 100%;
	padding: 10px;
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const BADropdownSectionHeader = styled.div`
	width: 100%;
	margin: 0 0 3.5px 0;
	padding: 0 10px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const BADropdownAction = styled.div`
	button {
		height: 35px;
		width: 100%;
		display: flex;
		align-items: center;
		border-radius: ${STYLING.dimensions.radius.alt4};
		transition: all 100ms;
		padding: 0 10px;
		span {
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.xxSmall};
			font-weight: ${(props) => props.theme.typography.weight.medium};
			font-family: ${(props) => props.theme.typography.family.primary};
			display: block;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width: 85%;
			overflow: hidden;
		}
		svg {
			height: 15px;
			width: 15px;
			margin: 5px 10px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
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
			p {
				background: ${(props) => props.theme.colors.button.alt1.background};
				color: ${(props) => props.theme.colors.button.alt1.color};
				border: 1px solid ${(props) => props.theme.colors.border.alt6};
			}
		}
		&:focus {
			border: 0;
			outline: 0;
			background: ${(props) => props.theme.colors.button.alt1.background};
			span {
				color: ${(props) => props.theme.colors.button.alt1.color};
			}
			svg {
				color: ${(props) => props.theme.colors.button.alt1.color};
				fill: ${(props) => props.theme.colors.button.alt1.color};
			}
			p {
				background: ${(props) => props.theme.colors.button.alt1.background};
				color: ${(props) => props.theme.colors.button.alt1.color};
				border: 1px solid ${(props) => props.theme.colors.border.alt6};
			}
		}

		&:disabled {
			background: ${(props) => props.theme.colors.container.primary.background};

			span {
				color: ${(props) => props.theme.colors.font.primary};
			}

			svg {
				color: ${(props) => props.theme.colors.font.primary};
				fill: ${(props) => props.theme.colors.font.primary};
			}

			p {
				color: ${(props) => props.theme.colors.font.primary};
				border: 1px solid transparent;
				background: ${(props) => props.theme.colors.container.alt4.background};
			}
		}
	}
`;

export const BADropdownActionShortcut = styled.div`
	display: flex;
	align-items: center;
	gap: 3.5px;
	margin: 0 0 0 auto;
	p {
		text-transform: uppercase;
		padding: 2.5px 6.5px;
		border: 1px solid transparent;
		background: ${(props) => props.theme.colors.container.alt2.background};
		border-radius: ${STYLING.dimensions.radius.alt3};
		color: ${(props) => props.theme.colors.font.primary};
		font-size: 10px !important;
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;
