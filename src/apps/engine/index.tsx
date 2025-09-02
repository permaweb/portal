import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { initThemes } from 'engine/helpers/themes';
import { PortalProvider, usePortalProvider, useSetPortalId } from 'engine/providers/portalProvider';

import { DOM, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { preloadAllAssets } from 'helpers/preloader';
import { checkValidAddress, getPortalIdFromURL } from 'helpers/utils';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { NotificationProvider } from 'providers/NotificationProvider';
import { PermawebProvider } from 'providers/PermawebProvider';

import Content from './builder/base/content';
import Footer from './builder/base/footer';
import Header from './builder/base/header';
import Navigation from './builder/base/navigation';
import ZoneEditor from './components/zoneEditor';
import { GlobalStyles } from './global-styles';
import * as S from './global-styles';
import Loader from './components/loader';


function App() {
	const location = useLocation();
	const portalProvider = usePortalProvider();
	const { Name, Categories, Layout, Themes } = portalProvider?.portal || {};
	const [theme, setTheme] = React.useState<any>(
		window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	);
	const [portalId, setPortalId] = React.useState<string | null>(null);

	// Get portal ID from URL or domain
	React.useEffect(() => {
		(async function () {
			// First check if there's a portal ID in the URL
			const urlPortalId = getPortalIdFromURL();
			if (urlPortalId) {
				setPortalId(urlPortalId);
			} else {
				// Try to resolve from ArNS domain
				try {
					// Make a request to the current origin to get ArNS headers
					// This works when the site is served through an ArNS gateway
					const response = await fetch(`${window.location.protocol}//${window.location.host}`);
					const resolvedId = response.headers.get('X-Arns-Resolved-Id');
					if (resolvedId) {
						setPortalId(resolvedId);
					} else {
						console.warn('No portal ID found in URL or ArNS headers');
					}
				} catch (e: any) {
					console.error('Failed to resolve portal ID from ArNS:', e);
				}
			}
		})();
	}, [location.pathname]);

	// Set the portal ID in the provider
	useSetPortalId(portalId || '');

	React.useEffect(() => {
		if (Themes) {
			const activeTheme = Themes.find((e: any) => e.active);
			const systemScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			setTheme(systemScheme);
			document.documentElement.setAttribute('theme', theme);
			initThemes(Themes);
		}
	}, [Themes]);

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
				<Loader />
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
					<Header
						name={Name}
						layout={Layout?.header?.layout}
						content={Layout?.header?.content}
						theme={theme}
						setTheme={setTheme}
					/>
					<Navigation layout={Layout?.navigation?.layout} content={Categories} theme={theme} />
					<Content layout={Layout} />
					<Footer layout={Layout?.footer?.layout} content={Layout?.footer?.content} theme={theme} />
				</S.Page>
				<ZoneEditor />
			</S.PageWrapper>
		</>
	) : (
		<>Loading</>
	);
}

ReactDOM.createRoot(document.getElementById('portal') as HTMLElement).render(
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
);
