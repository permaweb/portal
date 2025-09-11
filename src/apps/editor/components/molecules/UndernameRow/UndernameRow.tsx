import React from 'react';
import { Panel } from 'components/atoms/Panel';
import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { TypeUndernameOwnerRow } from 'editor/components/organisms/UndernamesList/UndernamesList';

function fmtTs(ts?: number) {
	return ts ? new Date(ts).toLocaleString() : '—';
}
function srcLabel(src?: 'approval' | 'reserved' | 'self') {
	if (!src) return '—';
	if (src === 'approval') return 'Approved by controller';
	if (src === 'reserved') return 'Reserved auto-claim';
	if (src === 'self') return 'Self-claim';
	return src;
}
export function shortAddr(a?: string) {
	return a ? `${a.slice(0, 6)}…${a.slice(-6)}` : '—';
}

export default function UndernameRow(props: { row: TypeUndernameOwnerRow }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [showPanel, setShowPanel] = React.useState(false);

	return (
		<>
			{/* Table row */}
			<S.RowWrapper className="fade-in" onClick={() => setShowPanel(true)}>
				<S.Cell>
					<p>{props.row.name}</p>
				</S.Cell>
				<S.Cell>
					<S.Address title={props.row.owner}>{shortAddr(props.row.owner)}</S.Address>
				</S.Cell>
				<S.Cell>
					<p>{fmtTs(props.row.requestedAt)}</p>
				</S.Cell>
				<S.Cell>
					<p>{fmtTs(props.row.approvedAt)}</p>
				</S.Cell>
				<S.Cell>
					<p>{srcLabel(props.row.source)}</p>
				</S.Cell>
			</S.RowWrapper>

			{/* Details panel */}
			<Panel
				open={showPanel}
				width={500}
				header={language?.manageUndername || 'Manage Undername'}
				handleClose={() => setShowPanel(false)}
				closeHandlerDisabled
			>
				<S.PanelContent>
					<S.KV>
						<span>{language?.undername || 'Undername'}</span>
						<code>{props.row.name}</code>
					</S.KV>

					<S.KV>
						<span>{language?.owner || 'Owner'}</span>
						<code title={props.row.owner}>{props.row.owner}</code>
					</S.KV>

					<S.KV>
						<span>{language?.requestedAt || 'Requested at'}</span>
						<time dateTime={props.row.requestedAt ? new Date(props.row.requestedAt).toISOString() : undefined}>
							{fmtTs(props.row.requestedAt)}
						</time>
					</S.KV>

					<S.KV>
						<span>{language?.approvedAt || 'Approved at'}</span>
						<time dateTime={props.row.approvedAt ? new Date(props.row.approvedAt).toISOString() : undefined}>
							{fmtTs(props.row.approvedAt)}
						</time>
					</S.KV>

					<S.KV>
						<span>{language?.approvedBy || 'Approved by'}</span>
						<code>{props.row.approvedBy || '—'}</code>
					</S.KV>

					<S.KV>
						<span>{language?.requestId || 'Request ID'}</span>
						<code>{props.row.requestId ?? '—'}</code>
					</S.KV>

					<S.KV>
						<span>{language?.grantSource || 'Grant source'}</span>
						<span>{srcLabel(props.row.source)}</span>
					</S.KV>

					<S.KV>
						<span>{language?.auto || 'Auto'}</span>
						<span>{props.row.auto ? 'Yes' : 'No'}</span>
					</S.KV>

					<S.ActionsWrapper>
						<Button
							type="warning"
							label={language?.release || 'Release'}
							handlePress={(e) => {
								e.stopPropagation();
								console.log('release undername', props.row.name);
								setShowPanel(false);
							}}
						/>
					</S.ActionsWrapper>
				</S.PanelContent>
			</Panel>
		</>
	);
}
