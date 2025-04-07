import styled, { DefaultTheme } from 'styled-components';

import { STYLING } from 'helpers/config';
import { ArticleBlockEnum } from 'helpers/types';

function getElementPadding(type: ArticleBlockEnum) {
	switch (type) {
		case 'paragraph':
			return '10px 12.5px';
		case 'quote':
			return '7.5px';
		case 'code':
			return '10px';
		case 'ordered-list':
			return '10px';
		case 'unordered-list':
			return '10px';
		case 'header-1':
		case 'header-2':
		case 'header-3':
		case 'header-4':
		case 'header-5':
		case 'header-6':
			return '12.5px 15px';
		default:
			return '10px';
	}
}

function getElementToolbarToggleDisplay(type: ArticleBlockEnum) {
	switch (type) {
		case 'image':
		case 'video':
		case 'code':
		case 'quote':
		case 'ordered-list':
		case 'unordered-list':
			return 'none';
		default:
			return 'block';
	}
}

function getElementWrapper(blockEditMode: boolean, type: ArticleBlockEnum, theme: DefaultTheme) {
	switch (type) {
		case 'image':
		case 'video':
			return '';
		case 'code':
			return `
				border: 1px solid ${blockEditMode ? theme.colors.border.primary : 'transparent'};
				border-radius: ${blockEditMode ? STYLING.dimensions.radius.alt4 : '0'};
			`;
		default:
			return `
				padding: ${blockEditMode ? getElementPadding(type) : '0'};
				background: ${blockEditMode ? theme.colors.container.alt1.background : 'transparent'};
				border: 1px solid ${blockEditMode ? theme.colors.border.primary : 'transparent'};
				border-radius: ${blockEditMode ? STYLING.dimensions.radius.alt4 : '0'};
			`;
	}
}

function getElementCursor(type: ArticleBlockEnum) {
	switch (type) {
		case 'image':
		case 'video':
			return 'default';
		default:
			return 'text';
	}
}

export const ElementToolbarWrapper = styled.div``;

function getElementTogglePosition(type: ArticleBlockEnum) {
	switch (type) {
		case 'header-1':
		case 'header-2':
		case 'header-3':
		case 'header-4':
		case 'header-5':
		case 'header-6':
		case 'image':
		case 'video':
		case 'code':
			return '-23.5px';
		default:
			return '-22.5px';
	}
}

function getElementDividerPosition(type: ArticleBlockEnum) {
	switch (type) {
		case 'header-1':
		case 'header-2':
		case 'header-3':
		case 'header-4':
		case 'header-5':
		case 'header-6':
		case 'image':
		case 'video':
		case 'code':
			return '-10px';
		default:
			return '-5px';
	}
}

export const ElementToolbarToggle = styled.div<{ type: ArticleBlockEnum }>`
	position: absolute;
	top: ${(props) => getElementTogglePosition(props.type)};
	display: none;
	width: 100%;
	justify-content: space-between;
`;

export const ElementIndicatorDivider = styled(ElementToolbarToggle)`
	height: 1px;
	width: 100%;
	top: auto;
	bottom: ${(props) => getElementDividerPosition(props.type)};
	border-top: 1px solid ${(props) => props.theme.colors.border.alt1};
`;

export const DefaultElementWrapper = styled.div`
	position: relative;
`;

export const ElementWrapper = styled.div<{ blockEditMode: boolean; type: ArticleBlockEnum }>`
	width: calc(100% - 27.5px);
	width: ${(props) => (props.blockEditMode ? 'calc(100% - 27.5px)' : '100%')};
	display: flex;
	flex-direction: column;
	gap: 10px;
	position: relative;
	cursor: default;

	/* ${(props) =>
		!props.blockEditMode &&
		`
		&:hover {
			${ElementToolbarToggle} {
				display: block;
			}
			${ElementIndicatorDivider} {
				display: ${getElementToolbarToggleDisplay(props.type)};
			}
		}
	`} */
`;

export const ElementDragWrapper = styled.div`
	display: flex;
	gap: 10px;
	position: relative;
`;

export const Element = styled.div<{ blockEditMode: boolean; type: ArticleBlockEnum }>`
	${(props) => getElementWrapper(props.blockEditMode, props.type, props.theme)};

	cursor: ${(props) => getElementCursor(props.type)};

	p {
		font-size: 15px;
	}

	a {
		text-decoration: underline;
		text-decoration-thickness: 1.25px;
		cursor: pointer;
	}

	blockquote {
		font-family: Georgia, serif;
		font-style: italic;
		font-size: 16px;
		font-weight: 500;
		color: ${(props) => props.theme.colors.font.alt2};
	}

	ol,
	ul {
		padding: 0 0 0 20px;

		> div {
			> li {
				margin-bottom: 5px;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}

		font-size: 15px;
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};

		li {
			color: ${(props) => props.theme.colors.font.primary};
			font-weight: ${(props) => props.theme.typography.weight.medium};
			font-size: 15px;

			&::marker {
				font-weight: ${(props) => props.theme.typography.weight.bold};
				color: ${(props) => props.theme.colors.font.alt1};
			}
		}
	}

	ol {
		list-style-type: decimal;
	}

	ul {
		list-style-type: disc;
	}

	code {
		color: ${(props) => props.theme.colors.font.primary};
		background: ${(props) => props.theme.colors.container.alt1.background};
		border-radius: ${STYLING.dimensions.radius.alt4};
		font-family: Monaco, Menlo, Consolas, Courier New, monospace;
		font-size: 12px;
		font-weight: 600;
		display: block;
		padding: 12.5px 15px;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		line-height: 1;
	}

	h1 {
		font-size: clamp(35.75px, 3.1625vw, 49.5px);
	}
	h2 {
		font-size: clamp(30.25px, 2.75vw, 44px);
	}
	h3 {
		font-size: clamp(27.5px, 2.475vw, 38.5px);
	}
	h4 {
		font-size: clamp(24.75px, 2.2vw, 33px);
	}
	h5 {
		font-size: clamp(22px, 1.925vw, 27.5px);
	}
	h6 {
		font-size: clamp(19.25px, 1.65vw, 24.75px);
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		p {
			font-size: 16px;
		}
	}
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

export const EDragWrapper = styled.div`
	width: 17.5px;
	cursor: default;
`;

export const EDragHandler = styled.div`
	cursor: grab;
	svg {
		width: 17.5px;
		margin: 5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const SelectionWrapper = styled.div`
	button {
		min-height: 22.5px !important;
		height: 22.5px !important;
		border: none !important;
		background: ${(props) => props.theme.colors.link.color} !important;
		span {
			color: ${(props) => props.theme.colors.font.light1} !important;
			font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
			text-transform: uppercase;
		}

		svg {
			color: ${(props) => props.theme.colors.font.light1} !important;
			fill: ${(props) => props.theme.colors.font.light1} !important;
		}

		&:hover {
			background: ${(props) => props.theme.colors.link.active} !important;
		}
	}
`;

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding: 0 20px 20px 20px;
`;

export const ModalActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 20px;
	margin: 15px 0 0 0;
`;
