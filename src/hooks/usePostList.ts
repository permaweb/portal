import * as React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { ArticleStatusType, GQLNodeResponseType, PortalAssetRequestType } from 'helpers/types';
import { getTagValue } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

type RequestRow = {
	id: string;
	name: string;
	creatorId: string;
	dateCreated: string; // keep as string to match your existing UI (formatDate handles it)
};

export function usePostsList(props: { pageSize?: number }) {
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();

	const [currentPage, setCurrentPage] = React.useState<number>(1);
	const [pageCount, setPageCount] = React.useState<number>(props.pageSize);
	const [currentStatusFilter, setCurrentStatusFilter] = React.useState<ArticleStatusType | 'all'>('all');
	const [dateAscending, setDateAscending] = React.useState<boolean>(false);
	const [showFilterActions, setShowFilterActions] = React.useState<boolean>(false);
	const [showRequests, setShowRequests] = React.useState<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [requests, setRequests] = React.useState<PortalAssetRequestType[] | null>(null);
	const totalCount = portalProvider.current?.assets?.length ?? '-';
	const publishedCount =
		portalProvider.current?.assets?.filter((asset: any) => asset.metadata?.status === 'published').length ?? '-';
	const draftCount =
		portalProvider.current?.assets?.filter((asset: any) => asset.metadata?.status === 'draft').length ?? '-';

	React.useEffect(() => {
		setCurrentPage(1);
	}, [currentStatusFilter]);

	React.useEffect(() => {
		(async function () {
			if (requests !== null) return;
			if (!showRequests) return;

			const ids = portalProvider.current?.requests.map((asset: PortalAssetRequestType) => asset.id);

			if (!ids?.length) {
				setRequests([]);
				return;
			}

			try {
				const gqlResponse = await permawebProvider.libs.getAggregatedGQLData({ ids });
				setLoading(true);
				const seeded = (gqlResponse ?? []).map((el: GQLNodeResponseType) => ({
					id: el.node.id,
					name: getTagValue(el.node.tags, 'Bootloader-Name'),
					creatorId: getTagValue(el.node.tags, 'Creator'),
					dateCreated: (el.node.block?.timestamp * 1000).toString() ?? '-',
				}));

				setRequests(seeded);

				const returnedIds = new Set((gqlResponse ?? []).map((el: GQLNodeResponseType) => el.node.id));
				const missingIds = ids.filter((id) => !returnedIds.has(id));

				if (missingIds.length > 0) {
					let cancelled = false;
					let remaining = missingIds.length;

					missingIds.forEach(async (id) => {
						try {
							const asset = await permawebProvider.libs.getAtomicAsset(id);
							if (cancelled) return;

							const formatted = {
								id: asset.id,
								name: asset.name,
								creatorId: asset.creator,
								dateCreated: asset.dateCreated,
							};

							setRequests((prev) => {
								const base = prev ?? [];
								return base.some((r) => r.id === formatted.id) ? base : [...base, formatted];
							});
						} catch (e) {
							console.error('fetch asset failed', id, e);
						} finally {
							if (!cancelled && --remaining === 0) {
								setLoading(false);
							}
						}
					});

					return () => {
						cancelled = true;
						setLoading(false);
					};
				}
				setLoading(false);
			} catch (e: any) {
				console.error(e);
				setLoading(false);
				setRequests((prev) => prev ?? []);
			}
		})();
	}, [requests, showRequests, portalProvider.current?.requests]);

	const assets = React.useMemo(() => {
		if (!portalProvider.current?.assets) return [];
		return portalProvider.current.assets
			.filter((asset: any) => currentStatusFilter === 'all' || asset.metadata?.status === currentStatusFilter)
			.sort((a, b) => {
				const dateA = new Date(Number(a.dateCreated)).getTime();
				const dateB = new Date(Number(b.dateCreated)).getTime();
				return dateAscending ? dateA - dateB : dateB - dateA;
			});
	}, [portalProvider.current?.assets, currentStatusFilter, dateAscending]);

	const totalPages = Math.ceil(assets.length / pageCount);

	const paginatedPosts = React.useMemo(() => {
		const startIndex = (currentPage - 1) * pageCount;
		const endIndex = startIndex + pageCount;
		return assets.slice(startIndex, endIndex);
	}, [assets, currentPage]);

	const currentRange = React.useMemo(() => {
		const start = (currentPage - 1) * pageCount + 1;
		const end = Math.min(currentPage * pageCount, assets.length);
		const total = assets.length;
		return { start, end, total };
	}, [currentPage, assets.length]);
	return {
		loading,
		showFilterActions,
		setShowFilterActions,
		showRequests,
		setShowRequests,
		requests: requests as RequestRow[] | null,
		setRequests,
		totalCount,
		publishedCount,
		draftCount,
		currentStatusFilter,
		setCurrentStatusFilter,
		dateAscending,
		setDateAscending,
		paginatedPosts,
		currentPage,
		setCurrentPage,
		pageCount,
		setPageCount,
		totalPages,
		currentRange,
		assets,
	};
}
