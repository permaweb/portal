import React from 'react';
import { Pagination } from 'components/atoms/Pagination';
import * as S from './styles';
import { UndernameRequestRow } from 'editor/components/molecules/UndernameRequestRow';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { ARIO } from '@ar.io/sdk';
import { useNotifications } from 'providers/NotificationProvider';
import { PARENT_UNDERNAME, TESTING_UNDERNAME } from '../../../../../processes/undernames/constants';
import { getPortalIdFromURL } from 'helpers/utils';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'released';

export type UndernameRequest = {
	id: number;
	name: string;
	requester: string;
	status: RequestStatus;
	createdAt?: number; // unix seconds
	decidedAt?: number; // unix seconds
	decidedBy?: string;
	reason?: string;
	[key: string]: any;
};

const PAGE_SIZE = 7;

export default function UndernameRequestsList(props: { isAdminView?: boolean }) {
	const { requests, approve, reject } = useUndernamesProvider();
	const portalId = getPortalIdFromURL();
	const { addNotification } = useNotifications();
	const [currentPage, setCurrentPage] = React.useState(1);
	const [loading, setLoading] = React.useState(false);

	const [statusFilter, setStatusFilter] = React.useState<RequestStatus | 'all'>('all');
	const [decidedByFilter, setDecidedByFilter] = React.useState<string>('');
	const [fromDate, setFromDate] = React.useState<string>(''); // yyyy-mm-dd
	const [toDate, setToDate] = React.useState<string>(''); // yyyy-mm-dd

	const clearFilters = React.useCallback(() => {
		setStatusFilter('all');
		setDecidedByFilter('');
		setFromDate('');
		setToDate('');
	}, []);

	const decidedByOptions = React.useMemo(() => {
		if (!props.isAdminView) return [];
		const set = new Set<string>();
		for (const r of requests) {
			if (r.decidedBy && r.decidedBy.trim()) set.add(r.decidedBy.trim());
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b));
	}, [requests, props.isAdminView]);

	const toStartOfDay = (d: string) => (d ? Math.floor(new Date(d + 'T00:00:00Z').getTime() / 1000) : undefined);
	const toEndOfDay = (d: string) => (d ? Math.floor(new Date(d + 'T23:59:59Z').getTime() / 1000) : undefined);

	const processed = React.useMemo(() => {
		let rows = requests;

		// Non-admin: show only own requests
		if (!props.isAdminView) {
			rows = rows.filter((r) => r.requester === portalId);
		}

		// Admin filters
		if (props.isAdminView) {
			if (statusFilter !== 'all') {
				rows = rows.filter((r) => r.status === statusFilter);
			}

			const decidedByTerm = decidedByFilter.trim();
			if (decidedByTerm) {
				rows = rows.filter((r) => (r.decidedBy || '').toLowerCase().includes(decidedByTerm.toLowerCase()));
			}

			const fromTs = toStartOfDay(fromDate);
			const toTs = toEndOfDay(toDate);

			if (fromTs || toTs) {
				rows = rows.filter((r) => {
					const base = r.createdAt ?? r.decidedAt ?? 0;
					if (fromTs && base < fromTs) return false;
					if (toTs && base > toTs) return false;
					return true;
				});
			}
		}

		return [...rows].sort((a, b) => {
			if (a.status === 'pending' && b.status !== 'pending') return -1;
			if (b.status === 'pending' && a.status !== 'pending') return 1;
			return (b.createdAt || 0) - (a.createdAt || 0);
		});
	}, [requests, portalId, props.isAdminView, statusFilter, decidedByFilter, fromDate, toDate]);

	const totalPages = React.useMemo(() => Math.max(1, Math.ceil(processed.length / PAGE_SIZE)), [processed.length]);

	React.useEffect(() => {
		setCurrentPage((prev) => (prev > totalPages ? totalPages : prev < 1 ? 1 : prev));
	}, [totalPages]);

	const handleAdminApprove = async (id: number, reason?: string) => {
		const ario = ARIO.mainnet();
		const arnsRecord = await ario.getArNSRecord({ name: TESTING_UNDERNAME }); // after testing change to PARENT_UNDERNAME
		console.log('ArNS Record for undername parent', arnsRecord.processId);
		const undernameRow = requests.find((r) => r.id === id);
		setLoading(true);
		await approve(id, arnsRecord.processId, reason, undernameRow.requester);
		setLoading(false);
		addNotification(`Undername ${undernameRow?.name ?? id} approved`, 'success');
	};

	const handleAdminReject = async (id: number, reason: string) => {
		setLoading(true);
		await reject(id, reason);
		setLoading(false);
		addNotification('Undername request rejected', 'success');
	};

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
				<>
					{props.isAdminView && (
						<S.FilterBar>
							<S.FilterGroup>
								<S.FilterLabel>Status</S.FilterLabel>
								<S.Select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
								>
									<option value="all">All</option>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="rejected">Rejected</option>
									<option value="cancelled">Cancelled</option>
									<option value="released">Released</option>
								</S.Select>
							</S.FilterGroup>

							<S.FilterGroup>
								<S.FilterLabel>Decided By</S.FilterLabel>
								<S.Input
									list="deciders"
									placeholder="address"
									value={decidedByFilter}
									onChange={(e) => setDecidedByFilter(e.target.value)}
								/>
								<datalist id="deciders">
									{decidedByOptions.map((v) => (
										<option key={v} value={v} />
									))}
								</datalist>
							</S.FilterGroup>

							<S.FilterGroup>
								<S.FilterLabel>Date From</S.FilterLabel>
								<S.DateInput type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
							</S.FilterGroup>

							<S.FilterGroup>
								<S.FilterLabel>Date To</S.FilterLabel>
								<S.DateInput type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
							</S.FilterGroup>

							<S.FilterActions>
								<S.ClearButton type="button" onClick={clearFilters}>
									Clear
								</S.ClearButton>
							</S.FilterActions>
						</S.FilterBar>
					)}
					<S.WrapperEmpty>
						<h3>No Subdomain requests found</h3>
					</S.WrapperEmpty>
				</>
			);
		}

		return (
			<>
				{/* Admin-only filter bar */}
				{props.isAdminView && (
					<S.FilterBar>
						<S.FilterGroup>
							<S.FilterLabel>Status</S.FilterLabel>
							<S.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}>
								<option value="all">All</option>
								<option value="pending">Pending</option>
								<option value="approved">Approved</option>
								<option value="rejected">Rejected</option>
								<option value="cancelled">Cancelled</option>
								<option value="released">Released</option>
							</S.Select>
						</S.FilterGroup>

						<S.FilterGroup>
							<S.FilterLabel>Decided By</S.FilterLabel>
							<S.Input
								list="deciders"
								placeholder="address"
								value={decidedByFilter}
								onChange={(e) => setDecidedByFilter(e.target.value)}
							/>
							<datalist id="deciders">
								{decidedByOptions.map((v) => (
									<option key={v} value={v} />
								))}
							</datalist>
						</S.FilterGroup>

						<S.FilterGroup>
							<S.FilterLabel>Date From</S.FilterLabel>
							<S.DateInput type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
						</S.FilterGroup>

						<S.FilterGroup>
							<S.FilterLabel>Date To</S.FilterLabel>
							<S.DateInput type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
						</S.FilterGroup>

						<S.FilterActions>
							<S.ClearButton type="button" onClick={clearFilters}>
								Clear
							</S.ClearButton>
						</S.FilterActions>
					</S.FilterBar>
				)}

				<S.ListWrapper>
					<S.HeaderRow>
						<S.HeaderCell>Subdomain</S.HeaderCell>
						<S.HeaderCell>Requester</S.HeaderCell>
						<S.HeaderCell>Status</S.HeaderCell>
						<S.HeaderCell>Created</S.HeaderCell>
						<S.HeaderCell>Decision</S.HeaderCell>
						<S.HeaderCell>Action</S.HeaderCell>
					</S.HeaderRow>

					{pageRows.map((r) => (
						<S.RowWrapper key={r.id}>
							<UndernameRequestRow
								row={r}
								onApprove={async (id) => await handleAdminApprove(id)}
								onReject={async (id, reason) => await handleAdminReject(id, reason)}
								loading={loading}
								isAdminView
							/>
						</S.RowWrapper>
					))}
				</S.ListWrapper>
			</>
		);
	}, [
		processed.length,
		pageRows,
		props.isAdminView,
		statusFilter,
		decidedByFilter,
		fromDate,
		toDate,
		decidedByOptions,
		loading,
	]);

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
					showRange={processed.length > 0}
					showControls={processed.length > PAGE_SIZE}
					iconButtons
				/>
			</S.Footer>
		</S.Wrapper>
	);
}
