import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Pagination } from 'components/atoms/Pagination';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import * as S from './styles';
import { UndernameRequestRow } from 'editor/components/molecules/UndernameRequestRow';
import { useUndernamesProvider } from 'providers/UndernameProvider';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type UndernameRequest = {
	id: number;
	name: string;
	requester: string;
	status: RequestStatus;
	createdAt?: number;
	created_at?: number; // deprecated
	decided_at?: number; // deprecated
	decidedAt?: number;
	decidedBy?: string;
	decided_by?: string; // deprecated
	reason?: string;
};

const PAGE_SIZE = 10;
const MAX_UNDERNAME = 51;

function validateUndername(raw: string) {
	const name = (raw || '').toLowerCase();
	if (!name) return 'Name is required';
	if (name.length > MAX_UNDERNAME) return `Max ${MAX_UNDERNAME} characters`;
	if (name === 'www') return 'Cannot be "www"';
	if (!/^[a-z0-9_.-]+$/.test(name)) return 'Only a–z, 0–9, underscore (_), dot (.), and dash (-) allowed';
	if (/^-|-$/.test(name)) return 'No leading or trailing dashes';
	return null;
}

export default function UndernameRequestsList(props: {
	requests: UndernameRequest[];
	filterByRequester?: string;
	busyIds?: number[];
	onApprove: (id: number) => void;
	onReject: (id: number, reason: string) => void;
	onRequest: (name: string) => void; // NEW: create request
	isRequesting?: boolean; // NEW: disables submit while sending
	showRequesterColumn?: boolean; // NEW: show requester column
}) {
	const { checkAvailability } = useUndernamesProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	// pagination
	const [currentPage, setCurrentPage] = React.useState(1);

	// claim panel state
	const [openClaim, setOpenClaim] = React.useState(false);
	const [name, setName] = React.useState('');
	const [error, setError] = React.useState<string | null>(null);

	const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value.toLowerCase();
		setName(next);
		setError(validateUndername(next));
	}, []);

	const handleRequest = React.useCallback(async () => {
		const err = validateUndername(name);
		setError(err);
		if (err) return;
		const availability = await checkAvailability(name);
		if (!availability) {
			setError('Name is already taken');
			return;
		}
		if (availability.available && !availability.reserved) {
			console.log('Requesting undername', name.trim());
			// props.onRequest(name.trim());
		}
		// props.onRequest(name.trim());
		// leave panel open; if you want to close on submit success, close it in parent after refresh
	}, [name, props]);

	// data shaping
	const processed = React.useMemo(() => {
		let rows = props.requests;
		// filter non approved ones only
		rows = rows.filter((r) => r.status !== 'approved');
		if (props.filterByRequester) rows = rows.filter((r) => r.requester === props.filterByRequester);
		return [...rows].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}, [props.requests, props.filterByRequester]);

	const totalPages = React.useMemo(() => Math.max(1, Math.ceil(processed.length / PAGE_SIZE)), [processed.length]);

	React.useEffect(() => {
		setCurrentPage((prev) => (prev > totalPages ? totalPages : prev < 1 ? 1 : prev));
	}, [totalPages]);

	const startIndex = (currentPage - 1) * PAGE_SIZE;
	const endIndex = Math.min(startIndex + PAGE_SIZE, processed.length);
	const pageRows = React.useMemo(() => processed.slice(startIndex, endIndex), [processed, startIndex, endIndex]);

	const currentRange = React.useMemo(
		() => ({
			start: processed.length ? startIndex + 1 : 0,
			end: processed.length ? endIndex : 0,
			total: processed.length,
		}),
		[processed.length, startIndex, endIndex]
	);

	const content = React.useMemo(() => {
		if (processed.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noRequestsFound || 'No requests found'}</p>
				</S.WrapperEmpty>
			);
		}
		return (
			<>
				<S.Toolbar>
					<div />
					<Button
						type={'alt1'}
						label={language?.claimUndername || 'Claim undername'}
						handlePress={() => setOpenClaim(true)}
					/>
				</S.Toolbar>

				<S.ListWrapper>
					<S.HeaderRow showRequester={!!props.showRequesterColumn}>
						<S.HeaderCell>Id</S.HeaderCell>
						<S.HeaderCell>Undername</S.HeaderCell>
						{props.showRequesterColumn && <S.HeaderCell>Requester</S.HeaderCell>}
						<S.HeaderCell>Status</S.HeaderCell>
						<S.HeaderCell>Created</S.HeaderCell>
						<S.HeaderCell>Decision</S.HeaderCell>
					</S.HeaderRow>

					{pageRows.map((r) => (
						<S.RowWrapper key={r.id}>
							<UndernameRequestRow
								row={r}
								busy={!!props.busyIds?.includes(r.id)}
								onApprove={props.onApprove}
								onReject={props.onReject}
								showRequester={!!props.showRequesterColumn}
							/>
						</S.RowWrapper>
					))}
				</S.ListWrapper>
			</>
		);
	}, [processed.length, pageRows, language, props.busyIds, props.onApprove, props.onReject]);

	return (
		<S.Wrapper>
			{content}

			<S.Footer>
				<Pagination
					totalItems={processed.length}
					totalPages={totalPages}
					currentPage={currentPage}
					currentRange={currentRange}
					setCurrentPage={setCurrentPage}
					showRange
					showControls
					iconButtons
				/>
			</S.Footer>

			<Panel
				open={openClaim}
				width={560}
				header={language?.claimUndername || 'Claim an undername'}
				handleClose={() => {
					setOpenClaim(false);
					setName('');
					setError(null);
				}}
				closeHandlerDisabled
			>
				<S.ClaimCard>
					<S.Row>
						<S.Input
							placeholder="e.g. tom_portal"
							value={name}
							onChange={handleChange}
							maxLength={MAX_UNDERNAME}
							disabled={!!props.isRequesting}
						/>
						<Button
							type={'alt1'}
							label={language?.request || 'Request'}
							handlePress={handleRequest}
							disabled={!!props.isRequesting || !name.trim() || !!error}
						/>
					</S.Row>
					{error && <S.Error>{error}</S.Error>}
					<S.Helper>
						Max: 51 Characters · Allowed: a–z, 0–9, `_ . -` · No leading/trailing dashes · Cannot be “www”
					</S.Helper>
				</S.ClaimCard>
			</Panel>
		</S.Wrapper>
	);
}
