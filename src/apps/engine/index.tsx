import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './builder/base/header';
import Navigation from './builder/base/navigation';
import { PortalProvider, usePortalProvider, useSetPortalId } from 'engine/providers/portalProvider';
import { initThemes } from 'engine/services/themes';
import Content from './builder/base/content';
import Footer from './builder/base/footer';
import { DOM, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { preloadAllAssets } from 'helpers/preloader';
import { GlobalStyles } from './global-styles';
import { checkValidAddress } from 'helpers/utils';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { NotificationProvider } from 'providers/NotificationProvider';
import { PermawebProvider } from 'providers/PermawebProvider';
import ZoneEditor from './components/zoneEditor';

import * as S from './global-styles';

// import * as S from './styles';

const queryClient = new QueryClient();

function App() {
	const portalProvider = usePortalProvider();
	const { Name, Categories, Layout, Themes } = portalProvider?.portal || {};
	const [theme, setTheme] = React.useState<any>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

	console.log('portalProvider: ', portalProvider)


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
		
    return null;
  };
	useSetPortalId('dc6W1Lz5V8-KV44B6qonM7pS5x5UC1lsRzCK-CiMotQ');

	React.useEffect(() => {
		if (portalProvider.portal?.Name) document.title = portalProvider.portal.Name;
	}, [portalProvider.portal?.Name]);

	React.useEffect(() => {
		const txIcon = portalProvider.portal?.icon;
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
	}, [portalProvider.portal?.icon]);

	if (!portalProvider.portal) {
		return (
			<>
				<div id={DOM.loader} />
				sdd
			</>
		);
	}

	return portalProvider?.portal ? (
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
	) : <>Loading</>;
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
