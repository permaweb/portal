import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { debounce } from 'lodash';

const Landing = getLazyImport('Landing');
const Portal = getLazyImport('Portal');
const PostCreate = getLazyImport('Portal/Post/Create');
const ArticleCreate = getLazyImport('Portal/Post/Create/Article');
const Docs = getLazyImport('Docs');
const NotFound = getLazyImport('NotFound');

import { DOM, STYLING, URLS } from 'helpers/config';
import { checkWindowCutoff } from 'helpers/window';
import { Navigation } from 'navigation/Navigation';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

function getLazyImport(view: string) {
	return lazy(() =>
		import(`../views/${view}/index.tsx`).then((module) => ({
			default: module.default,
		}))
	);
}

export default function App() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [navigationOpen, setNavigationOpen] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.desktop))) {
			setDesktop(true);
			setNavigationOpen(navigationOpen);
		} else {
			setDesktop(false);
			setNavigationOpen(false);
		}
	}

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), [navigationOpen]);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);

		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, [debouncedResize]);

	React.useEffect(() => {
		if (!desktop && navigationOpen) {
			document.body.style.overflowY = 'hidden';
		} else {
			document.body.style.overflowY = 'auto';
		}

		return () => {
			document.body.style.overflowY = 'auto';
		};
	}, [desktop, navigationOpen]);

	function getRoute(path: string, element: React.ReactNode) {
		const baseRoutes = [URLS.base, URLS.docs, `URLS.docs/*`, `${URLS.docs}:active/*`, URLS.notFound, '*'];

		if (baseRoutes.includes(path)) return <Route path={path} element={element} />;
		return (
			<Route
				path={path}
				element={
					<>
						<Navigation open={navigationOpen} toggle={() => setNavigationOpen(!navigationOpen)} />
						<S.View navigationOpen={navigationOpen}>{element}</S.View>
						<S.Footer navigationOpen={navigationOpen}>
							<p>
								{language.app} {new Date().getFullYear()}
							</p>
						</S.Footer>
					</>
				}
			/>
		);
	}

	return (
		<>
			<div id={DOM.loader} />
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			<Suspense fallback={null}>
				<S.App>
					<Routes>
						{getRoute(URLS.base, <Landing />)}
						{getRoute(`${URLS.base}:portalId`, <Portal />)}
						{getRoute(`${URLS.base}:portalId/post/create`, <PostCreate />)}
						{getRoute(`${URLS.base}:portalId/post/create/article`, <ArticleCreate />)}
						{getRoute(URLS.docs, <Docs />)}
						{getRoute(`${URLS.docs}:active/*`, <Docs />)}
						{getRoute(URLS.notFound, <NotFound />)}
						{getRoute(`*`, <NotFound />)}
					</Routes>
				</S.App>
			</Suspense>
		</>
	);
}
