import React from 'react';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { Pagination } from 'components/atoms/Pagination';
import * as S from './styles';
import { UndernameRow } from 'editor/components/molecules/UndernameRow';
import { useUndernamesProvider } from 'providers/UndernameProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { AddController } from 'editor/components/molecules/AddController';

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

export default function UndernamesList(props: { filterAddress?: string }) {
	const { owners, isLoggedInUserController } = useUndernamesProvider();
	const { fetchProfile } = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [currentPage, setCurrentPage] = React.useState(1);
	const [processedOwners, setProcessedOwners] = React.useState<TypeUndernameOwnerRow[]>([]);

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			const rows: TypeUndernameOwnerRow[] = await Promise.all(
				Object.entries(owners ?? {}).map(async ([name, rec]) => {
					const approvedBy = rec.approvedBy
						? (await fetchProfile(rec.approvedBy))?.username ?? rec.approvedBy
						: rec.approvedBy ?? null; // keep ID/null if no profile

					return {
						name,
						owner: rec.owner,
						requestedAt: rec.requestedAt ?? null,
						approvedAt: rec.approvedAt ?? null,
						approvedBy,
						requestId: rec.requestId ?? null,
						source: rec.source ?? null,
						auto: !!rec.auto,
					};
				})
			);

			const filtered = props.filterAddress ? rows.filter((o) => o.owner === props.filterAddress) : rows;

			const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
			if (!cancelled) setProcessedOwners(sorted);
		})();

		return () => {
			cancelled = true;
		};
	}, [owners, props.filterAddress, fetchProfile]);

	const totalPages = React.useMemo(
		() => Math.max(1, Math.ceil(processedOwners.length / PAGE_SIZE)),
		[processedOwners.length]
	);

	React.useEffect(() => {
		setCurrentPage((prev) => {
			if (prev > totalPages) return totalPages;
			if (prev < 1) return 1;
			return prev;
		});
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
					{isLoggedInUserController && (
						<S.Toolbar>
							<div />
							<AddController />
						</S.Toolbar>
					)}
					<S.WrapperEmpty>
						<p>{language?.noOwnersFound || 'No undernames found'}</p>
					</S.WrapperEmpty>
				</>
			);
		}
		return (
			<>
				{isLoggedInUserController && (
					<S.Toolbar>
						<div />
						<AddController />
					</S.Toolbar>
				)}
				<S.OwnersWrapper>
					<S.HeaderRow>
						<S.HeaderCell>Subdomain</S.HeaderCell>
						<S.HeaderCell>{language?.owner || 'Owner'}</S.HeaderCell>
						<S.HeaderCell>{language?.requestedAt || 'Requested'}</S.HeaderCell>
						<S.HeaderCell>{language?.approvedAt || 'Approved'}</S.HeaderCell>
						<S.HeaderCell>{language?.grantSource || 'Source'}</S.HeaderCell>
						<S.HeaderCell>Action</S.HeaderCell>
					</S.HeaderRow>
					{pageOwners.map((row) => (
						<S.OwnerWrapper key={row.name}>
							<UndernameRow row={row} />
						</S.OwnerWrapper>
					))}
				</S.OwnersWrapper>
			</>
		);
	}, [processedOwners.length, pageOwners, language]);

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
					showRange
					showControls
					iconButtons
				/>
			</S.OwnersFooter>
		</S.Wrapper>
	);
}
