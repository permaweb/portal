import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Landing = getLazyImport('Landing');
const Portal = getLazyImport('Portal');
const PostCreate = getLazyImport('Portal/Post/Create');
const ArticleCreate = getLazyImport('Portal/Post/Create/Article');
const Docs = getLazyImport('Docs');
const NotFound = getLazyImport('NotFound');

import { DOM, URLS } from 'helpers/config';
import { Navigation } from 'navigation/Navigation';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';

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

	const { settings, updateSettings } = useSettingsProvider();

	function getRoute(path: string, element: React.ReactNode) {
		const baseRoutes = [URLS.base, URLS.docs, `URLS.docs/*`, `${URLS.docs}:active/*`, URLS.notFound, '*'];

		if (baseRoutes.includes(path)) return <Route path={path} element={element} />;
		return (
			<Route
				path={path}
				element={
					<>
						<Navigation
							open={settings.sidebarOpen}
							toggle={() => updateSettings('sidebarOpen', !settings.sidebarOpen)}
						/>
						<S.View navigationOpen={settings.sidebarOpen}>{element}</S.View>
						<S.Footer navigationOpen={settings.sidebarOpen}>
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
