import React from 'react';
import { Panel } from 'components/atoms/Panel';
import * as S from './styles';
import type { UndernameRequest } from 'editor/components/organisms/UndernameRequestsList/UndernameRequestsList';
import { StatusBadge } from '../StatusBadge';
import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { shortAddr } from '../UndernameRow/UndernameRow';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { ConfirmModal } from 'components/atoms/ConfirmModal';
import { useUndernamesProvider } from 'providers/UndernameProvider';

function ts(ts?: number) {
	return ts ? new Date(ts).toLocaleString() : '—';
}

type ConfirmKind = 'approve' | 'reject' | null;

export default function UndernameRequestRow(props: {
	row: UndernameRequest;
	onApprove: (id: number, reason?: string) => Promise<void>;
	onReject: (id: number, reason: string) => Promise<void>;
	loading: boolean;
}) {
	const { isLoggedInUserController } = useUndernamesProvider();
	const languageProvider = useLanguageProvider();
	const { fetchProfile } = usePermawebProvider();
	const language = languageProvider.object[languageProvider.current];
	const [open, setOpen] = React.useState(false);
	const [reason, setReason] = React.useState('');
	const [confirmKind, setConfirmKind] = React.useState<ConfirmKind>(null); // << which action to confirm
	const pending = props.row.status === 'pending';
	const showConfirm = confirmKind !== null;
	const [decidedBy, setDecidedBy] = React.useState<string | null>(null);

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			if (!props.row.decidedBy) {
				setDecidedBy(null);
				return;
			}

			try {
				const profile = await fetchProfile(props.row.decidedBy);
				if (!cancelled) {
					setDecidedBy(profile?.username ?? props.row.decidedBy);
				}
			} catch {
				if (!cancelled) {
					setDecidedBy(props.row.decidedBy);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [props.row.decidedBy, fetchProfile]);

	const confirmLabel = confirmKind === 'approve' ? language?.approve || 'Approve' : language?.reject || 'Reject';
	const rejectLabel = language?.cancel || 'Cancel';

	const handleOpenConfirm = React.useCallback((kind: ConfirmKind) => {
		setConfirmKind(kind);
	}, []);
	const confirmMessage = React.useMemo(() => {
		if (!confirmKind) return null;
		if (confirmKind === 'approve') {
			return (
				<>
					<strong>Approve request for {props.row.name}?</strong>
				</>
			);
		}
		return (
			<>
				<strong>Reject request for {props.row.name}?</strong>
			</>
		);
	}, [confirmKind, props.row.id, props.row.name, reason]);

	const handleConfirm = React.useCallback(async () => {
		if (!confirmKind) return;
		if (confirmKind === 'approve') {
			if (!reason.trim()) {
				await props.onApprove(props.row.id, reason);
				return;
			}
			await props.onApprove(props.row.id);
		} else {
			if (!reason.trim()) return; // guard
			await props.onReject(props.row.id, reason.trim());
		}
		setConfirmKind(null);
		setOpen(false);
	}, [confirmKind, props.onApprove, props.onReject, props.row.id, reason]);
	const showAdminControls = pending && isLoggedInUserController;
	const showUserInfoOnPending = pending && !isLoggedInUserController;
	return (
		<>
			<S.Row role="row" title="Click to manage">
				<S.Cell mono>{props.row.name}</S.Cell>
				<S.Cell mono>
					<S.Address title={props.row.requester}>{shortAddr(props.row.requester)}</S.Address>
				</S.Cell>
				<S.Cell mono>
					<StatusBadge status={props.row.status} />
				</S.Cell>
				<S.Cell mono>{ts(props.row.createdAt)}</S.Cell>
				<S.Cell mono>{ts(props.row.decidedAt)}</S.Cell>
				<S.Cell mono>
					<Button type={'alt3'} label={language?.manage || 'Manage'} handlePress={() => setOpen(true)} />
				</S.Cell>
			</S.Row>

			<Panel
				open={open}
				width={560}
				header={`Subdomain #${props.row.id}`}
				handleClose={() => setOpen(false)}
				closeHandlerDisabled
			>
				<S.PanelContent>
					<S.KV>
						<span>Subdomain</span>
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
							<p>{props.row.status === 'cancelled' ? props.row.requester : decidedBy}</p>
						</S.KV>
					)}
					{showUserInfoOnPending && (
						<S.Section>
							<S.SectionHeader>Note</S.SectionHeader>
							<S.SectionBody>Your request is pending. You will be notified once a controller reviews it.</S.SectionBody>
						</S.Section>
					)}
					{props.row.reason ? <S.ReasonNote>Reason: {props.row.reason}</S.ReasonNote> : null}
					{showAdminControls && (
						<S.Sections>
							<S.Section>
								<S.SectionHeader>Approve or Reject</S.SectionHeader>
								<S.SectionBody>
									<S.TextArea
										rows={4}
										placeholder={'Reason (optional for approval, mandatory for rejection)'}
										value={reason}
										onChange={(e) => setReason(e.target.value)}
									/>
								</S.SectionBody>
								<S.SectionFooter>
									<Button
										type={'alt1'}
										label={props.loading ? language?.approving || 'Approving...' : language?.approve || 'Approve'}
										handlePress={() => handleOpenConfirm('approve')}
										disabled={props.loading}
									/>
									<Button
										type={'warning'}
										label={props.loading ? language?.rejecting || 'Rejecting...' : language?.reject || 'Reject'}
										handlePress={() => handleOpenConfirm('reject')}
										disabled={props.loading || !reason.trim()}
									/>
								</S.SectionFooter>
							</S.Section>
						</S.Sections>
					)}
				</S.PanelContent>
			</Panel>
			<ConfirmModal
				open={showConfirm}
				message={confirmMessage}
				confirmLabel={confirmLabel}
				rejectLabel={rejectLabel}
				onConfirm={handleConfirm}
				onReject={() => {
					setConfirmKind(null);
				}}
				onClose={() => setConfirmKind(null)}
			/>
		</>
	);
}
