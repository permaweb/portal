import React from 'react';

import { Button } from 'components/atoms/Button';

import * as S from './styles'; // add styles below or in your shared styles file

type TableData = {
	header?: boolean; // first row is header
	rows: string[][]; // matrix of cells
	caption?: string | null;
};

export default function TableBlock(props: {
	content?: string;
	data?: TableData;
	onChange: (html: string, data: TableData) => void;
}) {
	const initial: TableData = React.useMemo(() => {
		// prefer existing data; else start with a simple 3x3
		if (props.data?.rows?.length)
			return { header: !!props.data.header, rows: props.data.rows, caption: props.data.caption ?? null };
		return {
			header: true,
			rows: [
				['Column A', 'Column B', 'Column C'],
				['—', '—', '—'],
				['—', '—', '—'],
			],
			caption: null,
		};
	}, [props.data]);

	const [table, setTable] = React.useState<TableData>(initial);

	// Debounce onChange to prevent cursor reset during editing
	React.useEffect(() => {
		const timer = setTimeout(() => {
			props.onChange(buildHtml(table), table);
		}, 300); // Wait 300ms after user stops typing

		return () => clearTimeout(timer);
	}, [table]); // eslint-disable-line react-hooks/exhaustive-deps

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
		return `<table class="portal-table">${caption}${head}${body}</table>`;
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
			const empty = Array(cols).fill('');
			const rows = prev.rows.slice();
			const insertAt = position === 'above' ? index : index + 1;
			rows.splice(insertAt, 0, empty);
			return { ...prev, rows };
		});
	}

	function addColumn(position: 'left' | 'right', index: number) {
		setTable((prev) => {
			const insertAt = position === 'left' ? index : index + 1;
			const rows = prev.rows.map((row) => {
				const r = row.slice();
				r.splice(insertAt, 0, '');
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
			// if header got deleted, keep header flag sane
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

	return (
		<S.TableWrapper className="border-wrapper-alt2">
			<S.TableToolbar>
				<div className="left">
					<Button
						type="alt3"
						label={table.header ? 'Unset header' : 'Set header'}
						handlePress={() => setTable((p) => ({ ...p, header: !p.header }))}
					/>
					<Button
						type="alt3"
						label={table.caption == null ? 'Add caption' : 'Remove caption'}
						handlePress={() => setTable((p) => ({ ...p, caption: p.caption == null ? '' : null }))}
					/>
				</div>
			</S.TableToolbar>

			{table.caption != null && (
				<S.CaptionEdit
					contentEditable
					suppressContentEditableWarning
					onInput={(e) => setTable((p) => ({ ...p, caption: (e.currentTarget.textContent ?? '').trim() }))}
				>
					{table.caption}
				</S.CaptionEdit>
			)}

			<S.Table role="table" className="portal-table">
				{/* Header row (optional) */}
				{table.header && table.rows[0] && (
					<div role="row" className="row header">
						{table.rows[0].map((cell, ci) => (
							<div key={`h-${ci}`} role="columnheader" className="cell th">
								<div
									key={cell}
									className="cell-editor"
									contentEditable
									suppressContentEditableWarning
									onBlur={(e) => setCell(0, ci, e.currentTarget.textContent ?? '')}
									dangerouslySetInnerHTML={{ __html: escapeTd(cell) }}
								/>
								<div className="cell-tools">
									<Button type="alt3" label="＋L" handlePress={() => addColumn('left', ci)} />
									<Button type="alt3" label="＋R" handlePress={() => addColumn('right', ci)} />
									<Button type="alt3" label="—" handlePress={() => deleteColumn(ci)} />
								</div>
							</div>
						))}
						<div className="row-tools">
							<Button type="alt3" label="＋Below" handlePress={() => addRow('below', 0)} />
							<Button type="alt3" label="—" handlePress={() => deleteRow(0)} />
						</div>
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
										key={cell}
										className="cell-editor"
										contentEditable
										suppressContentEditableWarning
										onBlur={(e) => setCell(actualIndex, ci, e.currentTarget.textContent ?? '')}
										dangerouslySetInnerHTML={{ __html: escapeTd(cell) }}
									/>
									<div className="cell-tools">
										<Button type="alt3" label="＋L" handlePress={() => addColumn('left', ci)} />
										<Button type="alt3" label="＋R" handlePress={() => addColumn('right', ci)} />
										<Button type="alt3" label="—" handlePress={() => deleteColumn(ci)} />
									</div>
								</div>
							))}
							<div className="row-tools">
								<Button type="alt3" label="＋Above" handlePress={() => addRow('above', actualIndex)} />
								<Button type="alt3" label="＋Below" handlePress={() => addRow('below', actualIndex)} />
								<Button type="alt3" label="—" handlePress={() => deleteRow(actualIndex)} />
							</div>
						</div>
					);
				})}
			</S.Table>
		</S.TableWrapper>
	);
}
