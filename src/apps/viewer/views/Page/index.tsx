import React from 'react';
import { useParams } from 'react-router-dom';

import { AssetContent } from 'viewer/components/molecules/AssetContent';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Loader } from 'components/atoms/Loader';
import { PortalAssetType, PortalPageType } from 'helpers/types';
import { urlify } from 'helpers/utils';
import { scrollTo } from 'helpers/window';
import { usePermawebProvider } from 'providers/PermawebProvider';

import NotFound from '../NotFound';

import * as S from './styles';

export default function Page() {
	const { page } = useParams<{ page?: string }>();

	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();

	const [pageData, setPageData] = React.useState<PortalAssetType | null>(null);
	const [notFound, setNotFound] = React.useState<boolean>(false);

	React.useEffect(() => {
		scrollTo(0, 0, 'smooth');
	}, [page]);

	React.useEffect(() => {
		if (!portalProvider.current?.pages || portalProvider.current?.pages?.length <= 0) setNotFound(true);
		else {
			const foundPage = portalProvider.current.pages.find(
				(portalPage: PortalPageType) => urlify(portalPage.name) === page
			);

			if (!foundPage) {
				setNotFound(true);
				return;
			}

			(async function () {
				setNotFound(false);
				try {
					const fetchedPage = await permawebProvider.libs.getAtomicAsset(foundPage.id);
					setPageData(fetchedPage);
				} catch (e: any) {
					console.error(e);
				}
			})();
		}
	}, [page, portalProvider.current?.pages]);

	if (notFound) return <NotFound />;

	return pageData ? (
		<S.Wrapper>
			<h1>{pageData?.name ?? '-'}</h1>
			{pageData?.metadata?.content && <AssetContent content={pageData.metadata.content} />}
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
