import * as React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { ArticleStatusType, PortalAssetRequestType } from 'helpers/types';
import { usePermawebProvider } from 'providers/PermawebProvider';

type RequestRow = {
	id: string;
	name: string;
	creatorId: string;
	releaseDate: number;
};

export function usePostsList(props: { pageSize?: number }) {
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();

	const [currentPage, setCurrentPage] = React.useState<number>(1);
	const [pageCount, setPageCount] = React.useState<number>(props.pageSize || 10);
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
		if (!showRequests) {
			setRequests(null);
			return;
		}

		(async function () {
			const ids = portalProvider.current?.requests?.map((asset: PortalAssetRequestType) => asset.id) ?? [];

			if (!ids?.length) {
				setRequests([]);
				return;
			}

			try {
				if (ids.length > 0) {
					let cancelled = false;
					let remaining = ids.length;

					ids.forEach(async (id) => {
						try {
							const asset = await permawebProvider.libs.getAtomicAsset(id);
							if (cancelled) return;

							const formatted = {
								id: asset.id,
								name: asset.name,
								creatorId: asset.creator,
								releaseDate: asset.metadata?.releaseDate,
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
				setRequests((prev) => prev);
			}
		})();
	}, [showRequests, portalProvider.current?.requests]);

	const assets = React.useMemo(() => {
		if (!portalProvider.current?.assets) return [];
		return portalProvider.current.assets
			.filter((asset: any) => currentStatusFilter === 'all' || asset.metadata?.status === currentStatusFilter)
			.sort((a, b) => {
				const dateA = new Date(Number(a.metadata?.releaseDate)).getTime();
				const dateB = new Date(Number(b.metadata?.releaseDate)).getTime();
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
