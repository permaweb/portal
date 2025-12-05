import { Route, Routes } from 'react-router-dom';
import { usePortalProvider } from 'engine/providers/portalProvider';

import Page from '../page';

import * as S from './styles';

export default function Content(props: any) {
	const { layout } = props;
	const portalProvider = usePortalProvider();
	const { portal } = portalProvider;
	const navPosition = portal?.Layout?.navigation?.layout?.position;
	const isSideNav = navPosition === 'left' || navPosition === 'right';

	return (
		<S.ContentWrapper id="Content">
			<S.Content
				$layout={layout?.content}
				maxWidth={layout?.basics?.maxWidth}
				$isSideNav={isSideNav}
				$navWidth={layout?.navigation?.layout?.width}
			>
				<Routes>
					<Route path=":portalId/post/:postId" element={<Page />} />
					<Route path=":portalId/feed/:pageId" element={<Page />} />
					<Route path=":portalId/feed/category/:category" element={<Page />} />
					<Route path=":portalId/feed/tag/:tag" element={<Page />} />
					<Route path=":portalId/feed/date/:year/:month" element={<Page />} />
					<Route path=":portalId/feed/network/:network" element={<Page />} />
					<Route path=":portalId/search/:search" element={<Page />} />
					<Route path=":portalId/author/:user" element={<Page />} />
					<Route path=":portalId/author/:user/posts" element={<Page />} />
					<Route path=":portalId/static/:pageId" element={<Page />} />
					<Route path=":portalId" element={<Page />} />

					<Route path="post/:postId" element={<Page />} />
					<Route path="feed/:pageId" element={<Page />} />
					<Route path="feed/category/:category" element={<Page />} />
					<Route path="feed/tag/:tag" element={<Page />} />
					<Route path="feed/date/:year/:month" element={<Page />} />
					<Route path="feed/network/:network" element={<Page />} />
					<Route path="search/:search" element={<Page />} />
					<Route path="author/:user" element={<Page />} />
					<Route path="author/:user/posts" element={<Page />} />
					<Route path="static/:pageId" element={<Page />} />
					<Route path="*" element={<Page />} />
				</Routes>
			</S.Content>
		</S.ContentWrapper>
	);
}
