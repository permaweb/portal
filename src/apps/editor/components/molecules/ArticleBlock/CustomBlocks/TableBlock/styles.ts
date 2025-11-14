import styled from 'styled-components';

export const TableWrapper = styled.div`
	position: relative;
	overflow-x: auto;
	padding: 8px;
	border: 1px solid ${(p) => p.theme.colors.border.alt2};
	border-radius: 8px;
	background: ${(p) => p.theme.colors.container.alt2};
`;

export const TableToolbar = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 8px;
	gap: 8px;

	.left,
	.right {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
`;

export const CaptionEdit = styled.div`
	outline: none;
	margin: 4px 0 8px;
	font-size: 0.9rem;
	color: ${(p) => p.theme.colors.font.alt2};
	border-bottom: 1px dashed ${(p) => p.theme.colors.border.alt2};
	padding-bottom: 4px;
`;

export const Table = styled.div`
	display: grid;
	gap: 4px;

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
		border: 1px solid ${(p) => p.theme.colors.border.primary};
		border-radius: 6px;
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
