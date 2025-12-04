import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useLocation } from 'react-router-dom';
import { initThemes } from 'engine/helpers/themes';
import { PortalProvider, usePortalProvider, useSetPortalId } from 'engine/providers/portalProvider';

import { DOM } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, getPortalIdFromURL } from 'helpers/utils';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { NotificationProvider } from 'providers/NotificationProvider';
import { PermawebProvider } from 'providers/PermawebProvider';

import Content from './builder/base/content';
import Footer from './builder/base/footer';
import Header from './builder/base/header';
import Navigation from './builder/base/navigation';
import Loader from './components/loader';
import ZoneEditor from './components/zoneEditor';
import { GlobalStyles } from './global-styles';
import * as S from './global-styles';

function App() {
	const location = useLocation();
	const portalProvider = usePortalProvider();
	const { Name, Categories, Layout, Themes, Icon, Wallpaper } = portalProvider?.portal || {};
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
					const response = await fetch(window.location.origin);
					const resolvedId = response.headers.get('X-Arns-Resolved-Id');
					if (resolvedId) {
						console.log(`Resolved ID from Domain: ${resolvedId}`);
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

	React.useEffect(() => {
		const txIcon = Icon;
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
	}, [Icon]);

	// Set the portal ID in the provider
	useSetPortalId(portalId || '');

	React.useEffect(() => {
		if (Themes) {
			const systemScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			setTheme(systemScheme);
			document.documentElement.setAttribute('theme', theme);
			initThemes(Themes);
		}
	}, [Themes]);

	React.useEffect(() => {
		const portal = portalProvider.portal;
		if (!portal?.Name) return;

		const { Name, Logo, Posts } = portal;

		// Title
		const title = Name;
		document.title = title;

		// Counts
		const postCount = Array.isArray(Posts) ? Posts.length : 0;
		const authorCount = Array.isArray(Posts) ? new Set(Posts.map((p: any) => p?.creator).filter(Boolean)).size : 0;

		const description = `${Name} has ${postCount} ${postCount === 1 ? 'post' : 'posts'} by ${authorCount} ${
			authorCount === 1 ? 'author' : 'authors'
		}`;

		// OG image from Logo
		const image = Logo ? (checkValidAddress(Logo) ? getTxEndpoint(Logo) : Logo) : undefined;

		const url = window.location.href;

		// Track only tags we create this run, so we can clean them up
		const created: HTMLMetaElement[] = [];

		const ensureMeta = (attr: 'name' | 'property', key: string, value: string) => {
			let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
			if (!tag) {
				tag = document.createElement('meta');
				tag.setAttribute(attr, key);
				document.head.appendChild(tag);
				created.push(tag);
			}
			tag.setAttribute('content', value);
		};

		// Open Graph
		ensureMeta('property', 'og:title', title);
		ensureMeta('property', 'og:description', description);
		ensureMeta('property', 'og:url', url);
		if (image) ensureMeta('property', 'og:image', image);

		ensureMeta('name', 'twitter:title', title);
		ensureMeta('name', 'twitter:description', description);
		if (image) ensureMeta('name', 'twitter:image', image);

		return () => {
			// remove only the tags we created (don’t touch global/base tags)
			created.forEach((tag) => tag.remove());
		};
	}, [portalProvider.portal]);

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

	const navPosition = Layout?.navigation?.layout?.position || 'top';
	const isSideNav = navPosition === 'left' || navPosition === 'right';

	return portalProvider?.portal ? (
		<>
			<div id={DOM.loader} />
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			<S.PageWrapper>
				{isSideNav ? (
					<S.SideNavLayout $navPosition={navPosition}>
						<Navigation layout={Layout?.navigation?.layout} content={Categories} theme={theme} />
						<S.Page $layout={Layout?.basics} wallpaper={Wallpaper} id="Page">
							<Header
								name={Name}
								layout={Layout?.header?.layout}
								content={Layout?.header?.content}
								theme={theme}
								setTheme={setTheme}
							/>
							<Content layout={Layout} />
							<Footer layout={Layout?.footer?.layout} content={Layout?.footer?.content} theme={theme} />
						</S.Page>
					</S.SideNavLayout>
				) : (
					<S.Page $layout={Layout?.basics} wallpaper={Wallpaper} id="Page">
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
				)}
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
