import styled, { DefaultTheme } from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';
import { ArticleBlockEnum } from 'helpers/types';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	position: relative;
`;

export const ToolbarWrapper = styled.div`
	position: sticky;
	top: ${STYLING.dimensions.nav.height};
	z-index: 1;
	background: ${(props) => props.theme.colors.view.background};
	padding: 10px 0;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		position: relative;
		top: auto;
	}
`;

export const EditorWrapper = styled.div<{ panelOpen: boolean }>`
	padding: 0 ${(props) => (props.panelOpen ? `350px` : '0')} 0 0;
	transition: padding-right ${transition2};
	transition: none;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 0;
	}

	@media (min-width: ${STYLING.cutoffs.max}) {
		transition: none;
	}
`;

export const Editor = styled.div<{ blockEditMode: boolean }>`
	display: flex;
	flex-direction: column;

	[contenteditable] {
		&:focus {
			outline: 0;
			outline: none;
		}
	}

	> * {
		margin: ${(props) => (props.blockEditMode ? '0 0 30px 0' : '0 0 20px 0')};
	}
`;

export const ElementDragWrapper = styled.div`
	display: flex;
	gap: 10px;
	position: relative;
`;

export const ElementWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 5px;
	position: relative;
	cursor: default;
`;

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
			return '10px 15px';
		default:
			return '10px';
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
				border-radius: ${blockEditMode ? STYLING.dimensions.radius.alt2 : '0'};
			`;
		default:
			return `
				padding: ${blockEditMode ? getElementPadding(type) : '0'};
				background: ${blockEditMode ? theme.colors.container.alt1.background : 'transparent'};
				border: 1px solid ${blockEditMode ? theme.colors.border.primary : 'transparent'};
				border-radius: ${blockEditMode ? STYLING.dimensions.radius.alt2 : '0'};
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

export const Element = styled.div<{ blockEditMode: boolean; type: ArticleBlockEnum }>`
	${(props) => getElementWrapper(props.blockEditMode, props.type, props.theme)};

	cursor: ${(props) => getElementCursor(props.type)};

	p {
		font-size: 16px;
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
		border-radius: ${STYLING.dimensions.radius.alt2};
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
`;

export const ElementToolbar = styled.div`
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

export const EToolbarDelete = styled.div`
	width: fit-content;
	margin: 0 0 0 auto;
	button {
		color: ${(props) => props.theme.colors.warning.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 100%;
		overflow: hidden;

		&:hover {
			color: ${(props) => props.theme.colors.warning.alt1} !important;
		}
	}
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

export const BlocksEmpty = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt3};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
`;
