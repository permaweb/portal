import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { ICONS } from 'helpers/config';

import * as S from './styles';

type TableData = {
	header?: boolean; // First row is header
	rows: string[][]; // Matrix of cells
	caption?: string | null;
};

export default function TableBlock(props: {
	content?: string;
	data?: TableData;
	onChange: (html: string, data: TableData) => void;
}) {
	const initial: TableData = React.useMemo(() => {
		// Prefer existing data; else start with a simple 3x3
		if (props.data?.rows?.length)
			return { header: !!props.data.header, rows: props.data.rows, caption: props.data.caption ?? null };
		return {
			header: true,
			rows: [
				['Column 1', 'Column 2', 'Column 3'],
				['-', '-', '-'],
				['-', '-', '-'],
			],
			caption: null,
		};
	}, [props.data]);

	const [table, setTable] = React.useState<TableData>(initial);
	const captionRef = React.useRef<HTMLDivElement>(null);
	const captionValueRef = React.useRef<string>(initial.caption ?? '');
	const [contextMenu, setContextMenu] = React.useState<{
		visible: boolean;
		x: number;
		y: number;
		row: number;
		col: number;
	} | null>(null);

	// Debounce onChange to prevent cursor reset during editing
	React.useEffect(() => {
		const timer = setTimeout(() => {
			props.onChange(buildHtml(table), table);
		}, 300); // Wait 300ms after user stops typing

		return () => clearTimeout(timer);
	}, [table]); // eslint-disable-line react-hooks/exhaustive-deps

	// Close context menu on click outside
	React.useEffect(() => {
		const handleClickOutside = () => setContextMenu(null);
		if (contextMenu) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	}, [contextMenu]);

	function buildHtml(data: TableData) {
		const head = data.header
			? `<thead><tr>${data.rows[0]
					.map(escapeTd)
					.map((t) => `<th>${t}</th>`)
					.join('')}</tr></thead>`
			: '';
		const bodyRows = data.header ? data.rows.slice(1) : data.rows;
		const body = `<tbody>${bodyRows
			.map(
				(r) =>
					`<tr>${r
						.map(escapeTd)
						.map((t) => `<td>${t}</td>`)
						.join('')}</tr>`
			)
			.join('')}</tbody>`;
		const caption = data.caption ? `<caption>${escapeTd(data.caption)}</caption>` : '';
		return `<table class="portal-table" style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;">${caption}${head}${body}
		<style>
      .portal-table th, .portal-table td {
        border: 1px solid #ccc;
        padding: 6px 8px;
      }
		</style>
		</table>`;
	}

	function escapeTd(s: string) {
		return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function setCell(r: number, c: number, value: string) {
		setTable((prev) => {
			const rows = prev.rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row));
			return { ...prev, rows };
		});
	}

	function addRow(position: 'above' | 'below', index: number) {
		setTable((prev) => {
			const cols = prev.rows[0]?.length ?? 1;
			const isInsertingHeader = prev.header && position === 'above' && index === 0;
			const newRow = isInsertingHeader
				? Array(cols)
						.fill('')
						.map((_, i) => prev.rows[0]?.[i] ?? `Column ${i + 1}`)
				: Array(cols).fill('-');
			const rows = prev.rows.slice();
			const insertAt = position === 'above' ? index : index + 1;
			rows.splice(insertAt, 0, newRow);
			return { ...prev, rows };
		});
	}

	function addColumn(position: 'left' | 'right', index: number) {
		setTable((prev) => {
			const insertAt = position === 'left' ? index : index + 1;
			const rows = prev.rows.map((row, rowIndex) => {
				const r = row.slice();
				const isHeaderRow = prev.header && rowIndex === 0;
				const newCell = isHeaderRow ? `Column ${insertAt + 1}` : '-';
				r.splice(insertAt, 0, newCell);
				return r;
			});
			return { ...prev, rows };
		});
	}

	function deleteRow(index: number) {
		setTable((prev) => {
			if (prev.rows.length <= 1) return prev;
			const rows = prev.rows.slice();
			rows.splice(index, 1);
			// If header got deleted, keep header flag sane
			const header = prev.header && index === 0 ? false : prev.header;
			return { ...prev, rows, header };
		});
	}

	function deleteColumn(index: number) {
		setTable((prev) => {
			const colCount = prev.rows[0]?.length ?? 0;
			if (colCount <= 1) return prev;
			const rows = prev.rows.map((row) => {
				const r = row.slice();
				r.splice(index, 1);
				return r;
			});
			return { ...prev, rows };
		});
	}

	function handleKeyDown(e: React.KeyboardEvent, rowIndex: number, colIndex: number) {
		if (e.key === 'Tab') {
			e.preventDefault();
			const cols = table.rows[0]?.length ?? 0;
			const rows = table.rows.length;

			let nextRow = rowIndex;
			let nextCol = colIndex;

			if (e.shiftKey) {
				// Shift+Tab: go to previous cell
				nextCol = colIndex - 1;
				if (nextCol < 0) {
					nextCol = cols - 1;
					nextRow = rowIndex - 1;
				}
			} else {
				// Tab: go to next cell
				nextCol = colIndex + 1;
				if (nextCol >= cols) {
					nextCol = 0;
					nextRow = rowIndex + 1;
				}
			}

			if (nextRow >= 0 && nextRow < rows) {
				const nextCell = document.querySelector(`[data-cell="${nextRow}-${nextCol}"]`) as HTMLElement;
				nextCell?.focus();
			}
		}
	}

	function handleContextMenu(e: React.MouseEvent, rowIndex: number, colIndex: number) {
		e.preventDefault();
		setContextMenu({
			visible: true,
			x: e.clientX,
			y: e.clientY,
			row: rowIndex,
			col: colIndex,
		});
	}

	function handleContextMenuAction(action: string) {
		if (!contextMenu) return;

		const { row, col } = contextMenu;

		switch (action) {
			case 'insert-row-above':
				addRow('above', row);
				break;
			case 'insert-row-below':
				addRow('below', row);
				break;
			case 'insert-column-left':
				addColumn('left', col);
				break;
			case 'insert-column-right':
				addColumn('right', col);
				break;
			case 'delete-row':
				deleteRow(row);
				break;
			case 'delete-column':
				deleteColumn(col);
				break;
		}

		setContextMenu(null);
	}

	return (
		<S.TableWrapper className={'border-wrapper-primary scroll-wrapper-hidden'}>
			<S.TableToolbar>
				<S.TableHeaderInfo>
					<ReactSVG src={ICONS.info} />
					<span>Right click any cell for table actions</span>
				</S.TableHeaderInfo>
				<div className="right">
					{!table.header && (
						<Button
							type="alt3"
							label="Add header row"
							handlePress={() => {
								setTable((p) => {
									const cols = p.rows[0]?.length ?? 1;
									const headerRow = Array(cols)
										.fill('')
										.map((_, i) => `Column ${i + 1}`);
									return { ...p, header: true, rows: [headerRow, ...p.rows] };
								});
							}}
						/>
					)}
					<Button
						type="alt3"
						label={table.caption == null ? 'Add caption' : 'Remove caption'}
						handlePress={() => setTable((p) => ({ ...p, caption: p.caption == null ? '' : null }))}
					/>
					<Button type="alt3" label="Insert row" handlePress={() => addRow('below', table.rows.length - 1)} />
					<Button
						type="alt3"
						label="Insert column"
						handlePress={() => addColumn('right', (table.rows[0]?.length ?? 1) - 1)}
					/>
				</div>
			</S.TableToolbar>

			{table.caption != null && (
				<S.CaptionEdit
					ref={captionRef}
					contentEditable
					suppressContentEditableWarning
					onInput={() => {
						if (captionRef.current) {
							captionValueRef.current = captionRef.current.textContent ?? '';
						}
					}}
					onBlur={() => {
						if (captionRef.current) {
							const text = (captionRef.current.textContent ?? '').trim();
							setTable((p) => ({ ...p, caption: text }));
							captionValueRef.current = text;
						}
					}}
					dangerouslySetInnerHTML={{ __html: escapeTd(captionValueRef.current) }}
				/>
			)}

			<S.Table role="table" className="portal-table">
				{/* Header row (optional) */}
				{table.header && table.rows[0] && (
					<div role="row" className="row header">
						{table.rows[0].map((cell, ci) => (
							<div key={`h-${ci}`} role="columnheader" className="cell th">
								<div
									className="cell-editor"
									contentEditable
									suppressContentEditableWarning
									data-cell={`0-${ci}`}
									onBlur={(e) => setCell(0, ci, e.currentTarget?.textContent ?? '')}
									onKeyDown={(e) => handleKeyDown(e, 0, ci)}
									onContextMenu={(e) => handleContextMenu(e, 0, ci)}
									dangerouslySetInnerHTML={{ __html: escapeTd(cell) }}
								/>
							</div>
						))}
					</div>
				)}

				{/* Body rows */}
				{(table.header ? table.rows.slice(1) : table.rows).map((row, ri) => {
					const actualIndex = table.header ? ri + 1 : ri;
					return (
						<div key={`r-${actualIndex}`} role="row" className="row">
							{row.map((cell, ci) => (
								<div key={`c-${actualIndex}-${ci}`} role="cell" className="cell td">
									<div
										className="cell-editor"
										contentEditable
										suppressContentEditableWarning
										data-cell={`${actualIndex}-${ci}`}
										onBlur={(e) => setCell(actualIndex, ci, e.currentTarget?.textContent ?? '')}
										onKeyDown={(e) => handleKeyDown(e, actualIndex, ci)}
										onContextMenu={(e) => handleContextMenu(e, actualIndex, ci)}
										dangerouslySetInnerHTML={{ __html: escapeTd(cell) }}
									/>
								</div>
							))}
						</div>
					);
				})}
			</S.Table>

			{contextMenu && (
				<S.ContextMenu x={contextMenu.x} y={contextMenu.y} className={'border-wrapper-alt1'}>
					{!(table.header && contextMenu.row === 0) && (
						<S.ContextMenuItem onClick={() => handleContextMenuAction('insert-row-above')}>
							<ReactSVG src={ICONS.plus} />
							Insert row above
						</S.ContextMenuItem>
					)}
					<S.ContextMenuItem onClick={() => handleContextMenuAction('insert-row-below')}>
						<ReactSVG src={ICONS.plus} />
						Insert row below
					</S.ContextMenuItem>
					<S.ContextMenuItem onClick={() => handleContextMenuAction('insert-column-left')}>
						<ReactSVG src={ICONS.plus} />
						Insert column left
					</S.ContextMenuItem>
					<S.ContextMenuItem onClick={() => handleContextMenuAction('insert-column-right')}>
						<ReactSVG src={ICONS.plus} />
						Insert column right
					</S.ContextMenuItem>
					<S.ContextMenuItem onClick={() => handleContextMenuAction('delete-row')}>
						<ReactSVG src={ICONS.minus} /> Delete row
					</S.ContextMenuItem>
					<S.ContextMenuItem onClick={() => handleContextMenuAction('delete-column')}>
						<ReactSVG src={ICONS.minus} />
						Delete column
					</S.ContextMenuItem>
				</S.ContextMenu>
			)}
		</S.TableWrapper>
	);
}
