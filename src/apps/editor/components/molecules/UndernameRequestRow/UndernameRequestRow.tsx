import React from 'react';
import { Panel } from 'components/atoms/Panel';
import * as S from './styles';
import type { UndernameRequest } from 'editor/components/organisms/UndernameRequestsList/UndernameRequestsList';
import { StatusBadge } from '../StatusBadge';
import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

function ts(ts?: number) {
	return ts ? new Date(ts).toLocaleString() : '—';
}

export default function UndernameRequestRow(props: {
	row: UndernameRequest;
	busy?: boolean;
	onApprove: (id: number) => void;
	onReject: (id: number, reason: string) => void;
	showRequester?: boolean;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [open, setOpen] = React.useState(false);
	const [reason, setReason] = React.useState('');
	const pending = props.row.status === 'pending';

	return (
		<>
			{/* Clickable grid row aligned with header (6 cols) */}
			<S.Row
				role="row"
				data-busy={props.busy ? '1' : '0'}
				onClick={() => !props.busy && setOpen(true)}
				title="Click to manage"
				showRequester={props.showRequester}
			>
				<S.Cell mono>#{props.row.id}</S.Cell>
				<S.Cell mono>{props.row.name}</S.Cell>
				{props.showRequester ? <S.Cell mono>{props.row.requester}</S.Cell> : null}
				<S.Cell mono>
					<StatusBadge status={props.row.status} />
				</S.Cell>
				<S.Cell mono>{ts(props.row.createdAt)}</S.Cell>
				<S.Cell mono>{ts(props.row.decidedAt)}</S.Cell>
			</S.Row>

			<Panel
				open={open}
				width={560}
				header={`Undername #${props.row.id}`}
				handleClose={() => setOpen(false)}
				closeHandlerDisabled
			>
				<S.PanelContent>
					<S.KV>
						<span>Undername</span>
						<code>{props.row.name}</code>
					</S.KV>
					<S.KV>
						<span>Requester</span>
						<code>{props.row.requester}</code>
					</S.KV>
					<S.KV>
						<span>Status</span>
						<StatusBadge status={props.row.status} />
					</S.KV>
					<S.KV>
						<span>Created</span>
						<p>{ts(props.row.createdAt)}</p>
					</S.KV>
					<S.KV>
						<span>Decision</span>
						<p>{ts(props.row.decidedAt)}</p>
					</S.KV>
					{props.row.status !== 'pending' && (
						<S.KV>
							<span>Decided by</span>
							<p>{props.row.status === 'cancelled' ? props.row.requester : props.row.decidedBy}</p>
						</S.KV>
					)}
					{props.row.reason ? <S.ReasonNote>Reason: {props.row.reason}</S.ReasonNote> : null}
					{pending && (
						<S.Sections>
							<S.Section>
								<S.SectionHeader>Approval</S.SectionHeader>
								<S.SectionBody>
									<S.Placeholder>Approval configuration UI goes here.</S.Placeholder>
								</S.SectionBody>
								<S.SectionFooter>
									<Button
										type={'alt1'}
										label={language?.approve || 'Approve'}
										handlePress={() => props.onApprove(props.row.id)}
									/>
								</S.SectionFooter>
							</S.Section>

							<S.Section>
								<S.SectionHeader>Rejection</S.SectionHeader>
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
										type={'warning'}
										label={language?.reject || 'Reject'}
										handlePress={() => {
											props.onReject(props.row.id, reason || '');
											setOpen(false);
										}}
									/>
								</S.SectionFooter>
							</S.Section>
						</S.Sections>
					)}
				</S.PanelContent>
			</Panel>
		</>
	);
}
