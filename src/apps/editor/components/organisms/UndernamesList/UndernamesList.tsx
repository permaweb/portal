import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Pagination } from 'components/atoms/Pagination';
import * as S from './styles';
import { UndernameRow } from 'editor/components/molecules/UndernameRow';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { getPortalIdFromURL } from 'helpers/utils';

type OwnerRecord = {
	owner: string;
	requestedAt?: number;
	approvedAt?: number;
	approvedBy?: string;
	requestId?: number | null;
	source?: 'approval' | 'reserved' | 'self';
	auto?: boolean;
};

export type TypeUndernameOwnerRow = {
	name: string;
} & OwnerRecord;

const PAGE_SIZE = 10;

export default function UndernamesList(props: { isAdminView?: boolean }) {
	const { owners } = useUndernamesProvider();
	const { fetchProfile } = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [currentPage, setCurrentPage] = React.useState(1);
	const [processedOwners, setProcessedOwners] = React.useState<TypeUndernameOwnerRow[]>([]);

	const [sourceFilter, setSourceFilter] = React.useState<'all' | 'approval' | 'reserved' | 'self'>('all');
	const [approvedByFilter, setApprovedByFilter] = React.useState('');
	const [autoFilter, setAutoFilter] = React.useState<'all' | 'true' | 'false'>('all');

	const portalId = getPortalIdFromURL();

	const clearAdminFilters = React.useCallback(() => {
		setSourceFilter('all');
		setApprovedByFilter('');
		setAutoFilter('all');
	}, []);

	const approvedByOptions = React.useMemo(() => {
		if (!props.isAdminView) return [];
		const set = new Set<string>();
		for (const [_, rec] of Object.entries(owners ?? {})) {
			const val = rec.approvedBy?.trim();
			if (val) set.add(val);
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b));
	}, [owners, props.isAdminView]);

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			// shape rows with resolved approvedBy profile usernames when possible
			const rows: TypeUndernameOwnerRow[] = await Promise.all(
				Object.entries(owners ?? {}).map(async ([name, rec]) => {
					const approvedBy = rec.approvedBy
						? (await fetchProfile(rec.approvedBy))?.username ?? rec.approvedBy
						: rec.approvedBy ?? null;

					return {
						name,
						owner: rec.owner,
						requestedAt: rec.requestedAt ?? null,
						approvedAt: rec.approvedAt ?? null,
						approvedBy: approvedBy ?? undefined,
						requestId: rec.requestId ?? null,
						source: (rec.source as any) ?? null,
						auto: !!rec.auto,
					};
				})
			);

			let filtered = rows;

			if (!props.isAdminView) {
				filtered = filtered.filter((o) => o.owner === portalId);
			}

			if (props.isAdminView) {
				if (sourceFilter !== 'all') {
					filtered = filtered.filter((o) => (o.source ?? undefined) === sourceFilter);
				}

				if (approvedByFilter.trim()) {
					const term = approvedByFilter.trim().toLowerCase();
					filtered = filtered.filter((o) => (o.approvedBy ?? '').toLowerCase().includes(term));
				}

				if (autoFilter !== 'all') {
					const want = autoFilter === 'true';
					filtered = filtered.filter((o) => !!o.auto === want);
				}
			}

			const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
			if (!cancelled) setProcessedOwners(sorted);
		})();

		return () => {
			cancelled = true;
		};
	}, [owners, fetchProfile, props.isAdminView, portalId, sourceFilter, approvedByFilter, autoFilter]);

	const totalPages = React.useMemo(
		() => Math.max(1, Math.ceil(processedOwners.length / PAGE_SIZE)),
		[processedOwners.length]
	);

	React.useEffect(() => {
		setCurrentPage((prev) => (prev > totalPages ? totalPages : prev < 1 ? 1 : prev));
	}, [totalPages]);

	const startIndex = (currentPage - 1) * PAGE_SIZE;
	const endIndexExclusive = Math.min(startIndex + PAGE_SIZE, processedOwners.length);

	const pageOwners = React.useMemo(
		() => processedOwners.slice(startIndex, endIndexExclusive),
		[processedOwners, startIndex, endIndexExclusive]
	);

	const currentRange = React.useMemo(
		() => ({
			start: processedOwners.length > 0 ? startIndex + 1 : 0,
			end: processedOwners.length > 0 ? endIndexExclusive : 0,
			total: processedOwners.length,
		}),
		[processedOwners.length, startIndex, endIndexExclusive]
	);

	const rows = React.useMemo(() => {
		if (processedOwners.length === 0) {
			return (
				<>
					{props.isAdminView && (
						<>
							<S.FilterBar>
								<S.FilterGroup>
									<S.FilterLabel>Source</S.FilterLabel>
									<S.Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}>
										<option value="all">All</option>
										<option value="approval">Approval</option>
										<option value="reserved">Reserved</option>
										<option value="self">Self</option>
									</S.Select>
								</S.FilterGroup>

								<S.FilterGroup>
									<S.FilterLabel>Approved By</S.FilterLabel>
									<S.Input
										list="approvedByList"
										placeholder="address"
										value={approvedByFilter}
										onChange={(e) => setApprovedByFilter(e.target.value)}
									/>
									<datalist id="approvedByList">
										{approvedByOptions.map((v) => (
											<option key={v} value={v} />
										))}
									</datalist>
								</S.FilterGroup>

								<S.FilterGroup>
									<S.FilterLabel>Auto</S.FilterLabel>
									<S.Select value={autoFilter} onChange={(e) => setAutoFilter(e.target.value as any)}>
										<option value="all">All</option>
										<option value="true">Yes</option>
										<option value="false">No</option>
									</S.Select>
								</S.FilterGroup>

								<S.FilterActions>
									<S.ClearButton type="button" onClick={clearAdminFilters}>
										Clear
									</S.ClearButton>
								</S.FilterActions>
							</S.FilterBar>
						</>
					)}

					<S.WrapperEmpty>
						<h3>No Owned Subdomains found</h3>
					</S.WrapperEmpty>
				</>
			);
		}

		return (
			<>
				{props.isAdminView && (
					<>
						<S.FilterBar>
							<S.FilterGroup>
								<S.FilterLabel>Source</S.FilterLabel>
								<S.Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}>
									<option value="all">All</option>
									<option value="approval">Approval</option>
									<option value="reserved">Reserved</option>
									<option value="self">Self</option>
								</S.Select>
							</S.FilterGroup>

							<S.FilterGroup>
								<S.FilterLabel>Approved By</S.FilterLabel>
								<S.Input
									list="approvedByList"
									placeholder="address"
									value={approvedByFilter}
									onChange={(e) => setApprovedByFilter(e.target.value)}
								/>
								<datalist id="approvedByList">
									{approvedByOptions.map((v) => (
										<option key={v} value={v} />
									))}
								</datalist>
							</S.FilterGroup>

							<S.FilterGroup>
								<S.FilterLabel>Auto</S.FilterLabel>
								<S.Select value={autoFilter} onChange={(e) => setAutoFilter(e.target.value as any)}>
									<option value="all">All</option>
									<option value="true">Yes</option>
									<option value="false">No</option>
								</S.Select>
							</S.FilterGroup>

							<S.FilterActions>
								<S.ClearButton type="button" onClick={clearAdminFilters}>
									Clear
								</S.ClearButton>
							</S.FilterActions>
						</S.FilterBar>
					</>
				)}

				<S.OwnersWrapper>
					<S.HeaderRow>
						<S.HeaderCell>Subdomain</S.HeaderCell>
						<S.HeaderCell>{language?.owner || 'Owner'}</S.HeaderCell>
						{props.isAdminView && (
							<>
								<S.HeaderCell>{language?.requestedAt || 'Requested'}</S.HeaderCell>
								<S.HeaderCell>{language?.approvedAt || 'Approved'}</S.HeaderCell>
								<S.HeaderCell>{language?.grantSource || 'Source'}</S.HeaderCell>
							</>
						)}
						<S.HeaderCell>Action</S.HeaderCell>
					</S.HeaderRow>

					{pageOwners.map((row) => (
						<S.OwnerWrapper key={row.name}>
							<UndernameRow row={row} isAdminView />
						</S.OwnerWrapper>
					))}
				</S.OwnersWrapper>
			</>
		);
	}, [
		processedOwners.length,
		pageOwners,
		language,
		props.isAdminView,
		sourceFilter,
		approvedByFilter,
		autoFilter,
		approvedByOptions,
	]);

	return (
		<S.Wrapper>
			{rows}
			<S.OwnersFooter>
				<Pagination
					totalItems={processedOwners.length}
					totalPages={totalPages}
					currentPage={currentPage}
					currentRange={currentRange}
					setCurrentPage={setCurrentPage}
					showRange={processedOwners.length > 0}
					showControls={processedOwners.length > PAGE_SIZE}
					iconButtons
				/>
			</S.OwnersFooter>
		</S.Wrapper>
	);
}
