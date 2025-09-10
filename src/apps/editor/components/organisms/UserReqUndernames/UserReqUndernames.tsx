import React from 'react';
import * as S from './styles';
import { StatusBadge } from 'editor/components/molecules/StatusBadge';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type UndernameRequest = {
	id: number;
	name: string;
	requester: string;
	status: RequestStatus;
	createdAt: number;
	decidedAt?: number;
	decidedBy?: string;
	reason?: string;
};

export default function UserReqUndernames(props: {
	requests: UndernameRequest[];
	isSubmitting?: boolean;
	maxLen?: number;
	validateName?: (name: string) => string | null; // return string message when invalid
	handleSubmit: (name: string) => void;
	handleCancel: (id: number) => void;
}) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [name, setName] = React.useState('');
	const [error, setError] = React.useState<string | null>(null);

	// 3) Handlers
	const handleChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setName(e.target.value);
			if (error) setError(null);
		},
		[error]
	);

	const handleRequest = React.useCallback(() => {
		const trimmed = name.trim();
		if (!trimmed) {
			setError('Name is required');
			return;
		}
		if (props.maxLen && trimmed.length > props.maxLen) {
			setError(`Max ${props.maxLen} chars`);
			return;
		}
		if (props.validateName) {
			const msg = props.validateName(trimmed);
			if (msg) {
				setError(msg);
				return;
			}
		}
		props.handleSubmit(trimmed);
	}, [name, props.maxLen, props.validateName, props.handleSubmit]);

	const handleCancel = React.useCallback(
		(id: number) => {
			props.handleCancel(id);
		},
		[props.handleCancel]
	);

	// 4) Render
	return (
		<S.Wrapper>
			<S.Card>
				<S.Title>Claim an undername</S.Title>
				<S.Row>
					<S.Input
						ref={inputRef}
						placeholder="e.g. tom_portal"
						value={name}
						onChange={handleChange}
						maxLength={props.maxLen}
						disabled={props.isSubmitting}
					/>
					<S.PrimaryButton onClick={handleRequest} disabled={props.isSubmitting || !name.trim()}>
						{props.isSubmitting ? 'Requesting…' : 'Request'}
					</S.PrimaryButton>
				</S.Row>
				{error && <S.Error>{error}</S.Error>}
				<S.Helper>
					Use lowercase letters, digits, `_ . -`. Example: <code>tom_portal</code>
				</S.Helper>
			</S.Card>

			<S.Card>
				<S.SubTitle>Your previous requests</S.SubTitle>
				<S.Table role="table">
					<S.Thead role="rowgroup">
						<S.Tr role="row">
							<S.Th>Name</S.Th>
							<S.Th>Status</S.Th>
							<S.Th>Created</S.Th>
							<S.Th>Decision</S.Th>
							<S.Th>Action</S.Th>
						</S.Tr>
					</S.Thead>
					<S.Tbody role="rowgroup">
						{props.requests.length === 0 ? (
							<S.EmptyRow>No requests yet.</S.EmptyRow>
						) : (
							props.requests.map((r) => (
								<S.Tr key={r.id} role="row">
									<S.Td>
										<S.Code>{r.name}</S.Code>
									</S.Td>
									<S.Td>
										<StatusBadge status={r.status} />
									</S.Td>
									<S.Td>{new Date(r.createdAt).toLocaleString()}</S.Td>
									<S.Td>{r.decidedAt ? new Date(r.decidedAt).toLocaleString() : '—'}</S.Td>
									<S.Td>
										{r.status === 'pending' ? (
											<S.DangerButton onClick={() => handleCancel(r.id)}>Cancel</S.DangerButton>
										) : r.status === 'rejected' && r.reason ? (
											<S.Note>Reason: {r.reason}</S.Note>
										) : (
											<S.Muted>—</S.Muted>
										)}
									</S.Td>
								</S.Tr>
							))
						)}
					</S.Tbody>
				</S.Table>
			</S.Card>
		</S.Wrapper>
	);
}
