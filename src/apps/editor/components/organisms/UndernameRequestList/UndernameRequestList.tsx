import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Pagination } from 'components/atoms/Pagination';
import * as S from './styles';
import { UndernameRequestRow } from 'editor/components/molecules/UndernameRequestRow';

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

const PAGE_SIZE = 10;

export default function UndernameRequestsList(props: {
	requests: UndernameRequest[];
	filterByRequester?: string; // optional filter
	busyIds?: number[];
	onApprove: (id: number) => void;
	onReject: (id: number, reason: string) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [currentPage, setCurrentPage] = React.useState(1);

	// Filter + sort (newest first by id / createdAt)
	const processed = React.useMemo(() => {
		let rows = props.requests;
		if (props.filterByRequester) rows = rows.filter((r) => r.requester === props.filterByRequester);
		return [...rows].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
	}, [props.requests, props.filterByRequester]);

	const totalPages = React.useMemo(() => Math.max(1, Math.ceil(processed.length / PAGE_SIZE)), [processed.length]);

	React.useEffect(() => {
		setCurrentPage((prev) => (prev > totalPages ? totalPages : prev < 1 ? 1 : prev));
	}, [totalPages]);

	const startIndex = (currentPage - 1) * PAGE_SIZE;
	const endIndexExclusive = Math.min(startIndex + PAGE_SIZE, processed.length);
	const pageRows = React.useMemo(
		() => processed.slice(startIndex, endIndexExclusive),
		[processed, startIndex, endIndexExclusive]
	);

	const currentRange = React.useMemo(
		() => ({
			start: processed.length > 0 ? startIndex + 1 : 0,
			end: processed.length > 0 ? endIndexExclusive : 0,
			total: processed.length,
		}),
		[processed.length, startIndex, endIndexExclusive]
	);

	const rows = React.useMemo(() => {
		if (processed.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noRequestsFound || 'No requests found'}</p>
				</S.WrapperEmpty>
			);
		}
		return (
			<S.ListWrapper>
				<S.HeaderRow>
					<S.HeaderCell>Id</S.HeaderCell>
					<S.HeaderCell>Undername</S.HeaderCell>
					<S.HeaderCell>Requester</S.HeaderCell>
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
						/>
					</S.RowWrapper>
				))}
			</S.ListWrapper>
		);
	}, [processed.length, pageRows, language, props.busyIds, props.onApprove, props.onReject]);

	return (
		<S.Wrapper>
			{rows}
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
		</S.Wrapper>
	);
}
