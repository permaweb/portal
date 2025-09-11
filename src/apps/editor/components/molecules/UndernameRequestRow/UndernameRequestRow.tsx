import React from 'react';
import { Panel } from 'components/atoms/Panel';
import * as S from './styles';
import type { UndernameRequest } from 'editor/components/organisms/UndernameRequestsList/UndernameRequestsList';
import { StatusBadge } from '../StatusBadge';

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
				header={'Undername Request'}
				handleClose={() => setOpen(false)}
				closeHandlerDisabled
			>
				<S.PanelContent>
					<S.KV>
						<span>Id</span>
						<code>#{props.row.id}</code>
					</S.KV>
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
						<S.StatusPill data-status={props.row.status}>{props.row.status}</S.StatusPill>
					</S.KV>
					<S.KV>
						<span>Created</span>
						<p>{ts(props.row.createdAt)}</p>
					</S.KV>
					<S.KV>
						<span>Decision</span>
						<p>{ts(props.row.decidedAt)}</p>
					</S.KV>
					{props.row.reason ? <S.ReasonNote>Reason: {props.row.reason}</S.ReasonNote> : null}

					<S.ActionsBar>
						{pending ? (
							<>
								<S.Primary
									onClick={() => {
										props.onApprove(props.row.id);
										setOpen(false);
									}}
								>
									Approve
								</S.Primary>
								<S.Reason>
									<input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
									<S.Danger
										onClick={() => {
											props.onReject(props.row.id, reason || '');
											setOpen(false);
										}}
									>
										Reject
									</S.Danger>
								</S.Reason>
							</>
						) : (
							<S.MutedNote>
								{props.row.status === 'approved'
									? 'Already approved'
									: props.row.status === 'rejected'
									? 'Already rejected'
									: 'Cancelled'}
							</S.MutedNote>
						)}
					</S.ActionsBar>
				</S.PanelContent>
			</Panel>
		</>
	);
}
