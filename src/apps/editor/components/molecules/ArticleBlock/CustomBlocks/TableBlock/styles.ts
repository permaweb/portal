import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const TableWrapper = styled.div`
	position: relative;
	overflow-x: auto;
	padding: 15px;
	background: ${(p) => p.theme.colors.container.alt2};
`;

export const TableToolbar = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12.5px;
	margin: 0 0 15px 0;

	.left,
	.right {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
`;

export const TableHeaderInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;
	margin: -5px 0 0 0;

	span {
		font-size: ${(p) => p.theme.typography.size.xxSmall};
		font-weight: ${(p) => p.theme.typography.weight.bold};
		color: ${(p) => p.theme.colors.font.alt1};
	}

	svg {
		height: 11.5px;
		width: 11.5px;
		margin: 5.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1} !important;
	}
`;

export const CaptionEdit = styled.div`
	outline: none;
	margin: 10px 0;
	font-size: ${(p) => p.theme.typography.size.xxSmall};
	color: ${(p) => p.theme.colors.font.alt1};
	border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
	padding-bottom: 5px;
`;

export const Table = styled.div`
	display: grid;
	gap: 5px;

	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 4px;
		align-items: stretch;
		position: relative;
	}

	.row.header .cell {
		background: ${(p) => p.theme.colors.container.alt1};
		font-weight: ${(p) => p.theme.typography.weight.bold};
	}

	.cell {
		display: grid;
		grid-template-rows: auto 0;
		background: ${(p) => p.theme.colors.container.alt1.background};
		border: 1px solid ${(p) => p.theme.colors.border.primary};
		border-radius: ${STYLING.dimensions.radius.alt3};
		font-size: ${(p) => p.theme.typography.size.xxSmall};
		min-width: 120px;
		overflow: hidden;

		&:hover .cell-tools {
			height: 28px;
			padding: 2px 4px;
			border-top: 1px solid ${(p) => p.theme.colors.border.alt1};
		}
	}

	.cell-editor {
		outline: none;
		padding: 8px;
		min-height: 36px;
		word-break: break-word;
		background: ${(p) => p.theme.colors.container.primary};
	}

	.cell-tools {
		display: flex;
		align-items: center;
		gap: 4px;
		height: 0;
		overflow: hidden;
		transition: height 0.15s ease, padding 0.15s ease;
		background: ${(p) => p.theme.colors.container.alt2};
	}

	.row-tools {
		position: sticky;
		right: 0;
		display: flex;
		gap: 6px;
		margin-left: 6px;
		align-items: center;
	}
`;

export const ContextMenu = styled.div<{ x: number; y: number }>`
	position: fixed;
	top: ${(p) => p.y}px;
	left: ${(p) => p.x}px;
	z-index: 1000;
	min-width: 180px;
	overflow: hidden;
	border-radius: ${STYLING.dimensions.radius.alt4};
`;

export const ContextMenuItem = styled.div`
	padding: 7.5px 12.5px;
	cursor: pointer;
	font-size: ${(p) => p.theme.typography.size.xxxSmall};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	color: ${(p) => p.theme.colors.font.primary};
	transition: all 100ms;
	display: flex;
	align-items: center;
	gap: 7.5px;

	svg {
		height: 10px;
		width: 10px;
		margin: 5.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.primary} !important;
		fill: ${(props) => props.theme.colors.font.primary} !important;
	}

	&:hover {
		background: ${(p) => p.theme.colors.container.primary.active};
	}

	&:active {
		background: ${(p) => p.theme.colors.container.primary.active};
	}
`;
