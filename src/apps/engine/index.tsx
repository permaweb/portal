import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './builder/base/header';
import Navigation from './builder/base/navigation';
import { PortalProvider, usePortalProvider, useSetPortalId } from 'engine/providers/portalProvider';
// import { SettingsProvider } from 'engine/providers/settingsProvider';

import { useUI } from './hooks/portal';
import { initThemes } from 'engine/services/themes';
// import Page from './builder/base/page';
import Content from './builder/base/content';
import Footer from './builder/base/footer';
// import { Loader } from 'components/atoms/Loader';
import { DOM, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { preloadAllAssets } from 'helpers/preloader';
// import { GlobalStyle } from 'helpers/styles';
import { GlobalStyles } from './global-styles';
import { checkValidAddress } from 'helpers/utils';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { NotificationProvider } from 'providers/NotificationProvider';
import { PermawebProvider } from 'providers/PermawebProvider';

import * as S from './global-styles';
import ZoneEditor from './components/zoneEditor';

// import * as S from './styles';

const queryClient = new QueryClient();
const views = (import.meta as any).glob('./views/**/index.tsx');

/*
const Landing = getLazyImport('Landing');
const Category = getLazyImport('Category');
const Creator = getLazyImport('Creator');
const Page = getLazyImport('Page');
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
*/

function App() {
	const portalProvider = usePortalProvider();
	const { Name, Categories, Layout, Pages, Themes } = useUI();
	const [theme, setTheme] = React.useState<any>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

	React.useEffect(() => {
		preloadAllAssets();
	}, []);


  React.useEffect(() => {
    if(Themes){
      const activeTheme = Themes.find((e: any) => e.active)
			const systemScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemScheme);
      document.documentElement.setAttribute('theme', theme);
      initThemes(Themes)
    }
  },[Themes])

	const SetPortalIdComponent = () => {
    // useSetPortalId('r-5yMlWFOZ_LpSHXeHwXGkkit-2BsL-0nmhDbUiQAv8');
		useSetPortalId('dc6W1Lz5V8-KV44B6qonM7pS5x5UC1lsRzCK-CiMotQ');
    return null;
  };

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

	return Layout && Layout.footer && (
		<>
			<div id={DOM.loader} />
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			<S.PageWrapper>
				<S.Page $layout={Layout?.basics} id="Page">
					<SetPortalIdComponent />
					<Header name={Name} layout={Layout?.header.layout} content={Layout?.header.content} theme={theme} setTheme={setTheme} />
					<Navigation layout={Layout?.navigation.layout} content={Categories} theme={theme} />
					<Content layout={Layout} />
					<Footer layout={Layout?.footer.layout} content={Layout?.footer.content} theme={theme} />
				</S.Page>
				<ZoneEditor />
			</S.PageWrapper>
		</>
	);
}

ReactDOM.createRoot(document.getElementById('portal') as HTMLElement).render(
	<QueryClientProvider client={queryClient}>
		<HashRouter>
			<LanguageProvider>
				<ArweaveProvider>
					<PermawebProvider>
						<NotificationProvider>
							<PortalProvider>
								<GlobalStyles />								
								<App />
							</PortalProvider>
						</NotificationProvider>
					</PermawebProvider>
				</ArweaveProvider>
			</LanguageProvider>
		</HashRouter>
	</QueryClientProvider>
);
