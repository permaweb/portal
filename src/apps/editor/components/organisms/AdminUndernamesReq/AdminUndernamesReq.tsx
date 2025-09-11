import React from 'react';
import * as S from './styles';
import { StatusBadge } from 'editor/components/molecules/StatusBadge';
import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type UndernameRequest = {
	id: number;
	name: string;
	requester: string;
	status: RequestStatus;
	createdAt?: number;
	decidedAt?: number;
	decidedBy?: string;
	reason?: string;
};

export default function AdminUndernamesReq(props: {
	requests: UndernameRequest[];
	busyIds?: number[];
	handleApprove: (id: number) => void;
	handleReject: (id: number, reason: string) => void;
}) {
	const busy = React.useMemo(() => new Set(props.busyIds || []), [props.busyIds]);
	const [reasons, setReasons] = React.useState<Record<number, string>>({});
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const handleReasonChange = React.useCallback((id: number, value: string) => {
		setReasons((prev) => ({ ...prev, [id]: value }));
	}, []);

	return (
		<S.Card>
			<S.Title>Undername requests</S.Title>
			<S.Table role="table">
				<S.Thead role="rowgroup">
					<S.Tr role="row">
						<S.Th>ID</S.Th>
						<S.Th>Name</S.Th>
						<S.Th>Requester</S.Th>
						<S.Th>Status</S.Th>
						<S.Th>Created</S.Th>
						<S.Th>Decision</S.Th>
						<S.Th>Actions</S.Th>
					</S.Tr>
				</S.Thead>
				<S.Tbody role="rowgroup">
					{props.requests.length === 0 ? (
						<S.EmptyRow>No requests.</S.EmptyRow>
					) : (
						props.requests.map((r) => {
							const isBusy = busy.has(r.id);
							return (
								<S.Tr key={r.id} role="row" data-busy={isBusy ? '1' : '0'}>
									<S.Td>#{r.id}</S.Td>
									<S.Td>
										<S.Code>{r.name}</S.Code>
									</S.Td>
									<S.Td>
										<S.Code>{r.requester}</S.Code>
									</S.Td>
									<S.Td>
										<StatusBadge status={r.status} />
									</S.Td>
									<S.Td>{new Date(r.createdAt).toLocaleString()}</S.Td>
									<S.Td>{r.decidedAt ? new Date(r.decidedAt).toLocaleString() : '—'}</S.Td>
									<S.Td>
										{r.status === 'pending' ? (
											<S.Wrapper>
												<S.ReasonInput
													placeholder="Reason"
													value={reasons[r.id] || ''}
													onChange={(e) => handleReasonChange(r.id, e.target.value)}
												/>
												<S.ActionRow>
													<Button
														type={'alt1'}
														label={language?.approve || 'approve'}
														handlePress={() => props.handleApprove(r.id)}
													/>
													<Button
														type="warning"
														label={language?.reject || 'reject'}
														handlePress={() => props.handleReject(r.id, reasons[r.id] || '')}
													/>
												</S.ActionRow>
											</S.Wrapper>
										) : r.status === 'rejected' && r.reason ? (
											<S.Note>Reason: {r.reason}</S.Note>
										) : (
											<S.Muted>—</S.Muted>
										)}
									</S.Td>
								</S.Tr>
							);
						})
					)}
				</S.Tbody>
			</S.Table>
		</S.Card>
	);
}
