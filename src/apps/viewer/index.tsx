import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { Footer } from 'viewer/navigation/footer';
import { Header } from 'viewer/navigation/header';
import { PortalProvider, usePortalProvider } from 'viewer/providers/PortalProvider';
import { SettingsProvider } from 'viewer/providers/SettingsProvider';

import { Loader } from 'components/atoms/Loader';
import { DOM, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { GlobalStyle } from 'helpers/styles';
import { checkValidAddress } from 'helpers/utils';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { PermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

const views = (import.meta as any).glob('./views/**/index.tsx');

const Landing = getLazyImport('Landing');
const Category = getLazyImport('Category');
const Post = getLazyImport('Post');
const NotFound = getLazyImport('NotFound');

function getLazyImport(view: string) {
	const key = `./views/${view}/index.tsx`;
	const loader = views[key];

	if (!loader) {
		throw new Error(`View not found: ${view}`);
	}

	return lazy(async () => {
		const module = await loader();
		return { default: module.default };
	});
}

function App() {
	const portalProvider = usePortalProvider();

	React.useEffect(() => {
		if (portalProvider.current?.name) document.title = portalProvider.current.name;
	}, [portalProvider.current?.name]);

	React.useEffect(() => {
		const txIcon = portalProvider.current?.icon;
		if (!txIcon || !checkValidAddress(txIcon)) return;

		const iconUrl = getTxEndpoint(txIcon);
		const head = document.head;
		
		head.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']").forEach((el) => head.removeChild(el));
		
		const newLink = document.createElement('link');
		newLink.rel = 'icon';
		newLink.href = iconUrl;
		head.appendChild(newLink);

		return () => {
			head.removeChild(newLink);
		};
	}, [portalProvider.current?.icon]);

	if (!portalProvider.current) {
		return (
			<>
				<div id={DOM.loader} />
				<Loader />
			</>
		);
	}

	return (
		<>
			<div id={DOM.loader} />
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			<Header />
			<S.View className={'max-view-wrapper'} navHeight={85}>
				<Suspense fallback={null}>
					<Routes>
						<Route path={URLS.base} element={<Landing />} />
						<Route path={`${URLS.base}:portalId`} element={<Landing />} />

						<Route path={`${URLS.base}category/:categoryId`} element={<Category />} />
						<Route path={`${URLS.base}:portalId/category/:categoryId`} element={<Category />} />

						<Route path={`${URLS.base}post/:postId`} element={<Post />} />
						<Route path={`${URLS.base}:portalId/post/:postId`} element={<Post />} />

						<Route path={URLS.notFound} element={<NotFound />} />
						<Route path={'*'} element={<NotFound />} />
					</Routes>
				</Suspense>
			</S.View>
			<Footer />
		</>
	);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<HashRouter>
		<LanguageProvider>
			<ArweaveProvider>
				<PermawebProvider>
					<PortalProvider>
						<SettingsProvider>
							<GlobalStyle />
							<App />
						</SettingsProvider>
					</PortalProvider>
				</PermawebProvider>
			</ArweaveProvider>
		</LanguageProvider>
	</HashRouter>
);
