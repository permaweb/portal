import React from 'react';
import { Panel } from 'components/atoms/Panel';
import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { TypeUndernameOwnerRow } from 'editor/components/organisms/UndernamesList/UndernamesList';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { ARIO } from '@ar.io/sdk';
import { useNotifications } from 'providers/NotificationProvider';
import { PARENT_UNDERNAME, TESTING_UNDERNAME } from '../../../../../processes/undernames/constants';
import { IS_TESTNET } from 'helpers/config';
import { ConfirmModal } from 'components/atoms/ConfirmModal';

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

export default function UndernameRow(props: { row: TypeUndernameOwnerRow; isAdminView?: boolean }) {
	const { forceRelease } = useUndernamesProvider();
	const { addNotification } = useNotifications();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showPanel, setShowPanel] = React.useState(false);
	const [reason, setReason] = React.useState('');
	const [showConfirm, setShowConfirm] = React.useState(false);
	const confirmDisabled = !reason.trim(); // require reason
	const handleRelease = async () => {
		try {
			const ario = ARIO.mainnet();
			const arnsRecord = await ario.getArNSRecord({ name: TESTING_UNDERNAME }); // after testing we change to PARENT_UNDERNAME
			await forceRelease(props.row.name, arnsRecord.processId, reason);
			addNotification(`Subdomain released`, 'success');
			setShowPanel(false);
		} catch (error) {
			console.error('Failed to release subdomain:', error);
		}
	};
	const compactMode = !props.isAdminView;
	return (
		<>
			<S.RowWrapper className="fade-in" compact={compactMode}>
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
				{props.isAdminView && (
					<>
						<S.Cell>
							<p>{fmtTs(props.row.requestedAt)}</p>
						</S.Cell>
						<S.Cell>
							<p>{fmtTs(props.row.approvedAt)}</p>
						</S.Cell>
						<S.Cell>
							<p>{srcLabel(props.row.source)}</p>
						</S.Cell>
					</>
				)}
				<S.Cell mono>
					<Button type={'alt3'} label={language?.manage || 'Manage'} handlePress={() => setShowPanel(true)} />
				</S.Cell>
			</S.RowWrapper>

			{/* Details panel */}
			<Panel
				open={showPanel}
				width={500}
				header={language?.manageUndername || 'Manage Subdomain'}
				handleClose={() => setShowPanel(false)}
				closeHandlerDisabled
			>
				<S.PanelContent>
					<S.KV>
						<span>Subdomain</span>
						<code>{props.row.name}</code>
					</S.KV>

					<S.KV>
						<span>Owner</span>
						<code title={props.row.owner}>{props.row.owner}</code>
					</S.KV>

					<S.KV>
						<span>Requested At</span>
						<time dateTime={props.row.requestedAt ? new Date(props.row.requestedAt).toISOString() : undefined}>
							{fmtTs(props.row.requestedAt)}
						</time>
					</S.KV>

					<S.KV>
						<span>Approved At</span>
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
						<S.SectionHeader>Release Subdomain</S.SectionHeader>
						<S.SectionBody>
							<S.TextArea
								rows={4}
								placeholder={'Reason (mandatory)'}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</S.SectionBody>
						<S.SectionFooter>
							<Button
								type="warning"
								label={language?.release || 'Release'}
								disabled={confirmDisabled}
								handlePress={(e) => {
									e.stopPropagation();
									setShowConfirm(true);
								}}
							/>
						</S.SectionFooter>
					</S.Section>
				</S.PanelContent>
				<ConfirmModal
					open={showConfirm}
					message={
						<>
							<strong>Release “{props.row.name}”?</strong>
							<br />
							This will revoke ownership and remove the record on-chain. Reason:
							<br />
							<em>{reason || '—'}</em>
						</>
					}
					confirmLabel="Yes, release"
					rejectLabel="Cancel"
					onReject={() => {
						setShowConfirm(false);
					}}
					onClose={() => setShowConfirm(false)}
					onConfirm={async () => {
						if (confirmDisabled) return;
						await handleRelease();
					}}
				/>
			</Panel>
		</>
	);
}
