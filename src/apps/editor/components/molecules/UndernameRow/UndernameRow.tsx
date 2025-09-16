import React from 'react';
import { Panel } from 'components/atoms/Panel';
import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { TypeUndernameOwnerRow } from 'editor/components/organisms/UndernamesList/UndernamesList';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { IS_TESTNET } from 'helpers/config';
import { ANT, ArconnectSigner, ARIO } from '@ar.io/sdk';
import { useNotifications } from 'providers/NotificationProvider';
import { PARENT_UNDERNAME } from '../../../../../processes/undernames/constants';

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
	const { forceRelease } = useUndernamesProvider();
	const { addNotification } = useNotifications();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showPanel, setShowPanel] = React.useState(false);
	const [reason, setReason] = React.useState('');

	const handleRelease = async () => {
		try {
			if (IS_TESTNET) {
				console.warn('Releasing undernames on testnet is not supported yet.');
				addNotification('Releasing undernames on testnet is not supported yet.', 'warning');
				return;
			}
			const ario = ARIO.mainnet();
			const arnsRecord = await ario.getArNSRecord({ name: PARENT_UNDERNAME });
			const signer = new ArconnectSigner(window.arweaveWallet);
			const ant = ANT.init({
				processId: arnsRecord.processId,
				signer,
			});
			const { id: txId } = await ant.removeUndernameRecord(
				{ undername: props.row.name },
				{ tags: [{ name: 'PortalReleaseUndername', value: props.row.name }] }
			);
			console.log('Release transaction ID:', txId);
			await forceRelease(props.row.name, reason);
			addNotification(`Undername released`, 'success');
			setShowPanel(false);
		} catch (error) {
			console.error('Failed to release undername:', error);
		}
	};

	return (
		<>
			{/* Table row */}
			<S.RowWrapper className="fade-in" onClick={() => setShowPanel(true)}>
				<S.Cell>
					<p>
						<a
							href={`https://${props.row.name}_${PARENT_UNDERNAME}.arweave.net/`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{props.row.name}
						</a>
					</p>
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
					<S.Section>
						<S.SectionHeader>Release Undername</S.SectionHeader>
						<S.SectionBody>
							<S.TextArea
								rows={4}
								placeholder={language?.reason || 'Reason (optional)'}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</S.SectionBody>
						<S.SectionFooter>
							<Button
								type="warning"
								label={language?.release || 'Release'}
								handlePress={(e) => {
									e.stopPropagation();
									handleRelease();
									setShowPanel(false);
								}}
							/>
						</S.SectionFooter>
					</S.Section>
				</S.PanelContent>
			</Panel>
		</>
	);
}
