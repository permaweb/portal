import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { CurrentZoneVersion } from '@permaweb/libs';

import { Navigation, NavigationProvider, useNavigation } from 'editor/navigation';
import { PortalProvider, usePortalProvider } from 'editor/providers/PortalProvider';
import { SettingsProvider, useSettingsProvider } from 'editor/providers/SettingsProvider';
import { persistor, store } from 'editor/store';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Portal } from 'components/atoms/Portal';
import { DOM, URLS } from 'helpers/config';
import { preloadAllAssets } from 'helpers/preloader';
import { GlobalStyle } from 'helpers/styles';
import { ArweaveProvider, useArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider, useLanguageProvider } from 'providers/LanguageProvider';
import { NotificationProvider } from 'providers/NotificationProvider';
import { PermawebProvider, usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';
import { WalletConnect } from 'wallet/WalletConnect';

const views = (import.meta as any).glob('./views/**/index.tsx');

const Landing = getLazyImport('Landing');
const PortalView = getLazyImport('Portal');
const Posts = getLazyImport('Posts');
const PageCreate = getLazyImport('Page/Create');
const PageEdit = getLazyImport('Page/Edit');
const PostCreate = getLazyImport('Post/Create');
const PostEdit = getLazyImport('Post/Edit');
const Setup = getLazyImport('Setup');
const Design = getLazyImport('Design');
const Media = getLazyImport('Media');
const Users = getLazyImport('Users');
const Pages = getLazyImport('Pages');
const Domains = getLazyImport('Domains');
const DomainsRegister = getLazyImport('Domains/Register');
const Docs = getLazyImport('Docs');
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

function AppContent() {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { navWidth } = useNavigation();

	const { settings, updateSettings } = useSettingsProvider();

	const hasCheckedProfileRef = React.useRef(false);
	const hasInitializedPreloaderRef = React.useRef(false);

	React.useEffect(() => {
		if (!hasInitializedPreloaderRef.current) {
			preloadAllAssets();
			hasInitializedPreloaderRef.current = true;
		}
	}, []);

	React.useEffect(() => {
		(async function () {
			if (hasCheckedProfileRef.current) return;
			if (permawebProvider.profile?.id) {
				const userVersion = permawebProvider.profile.version;
				if (!userVersion || userVersion !== CurrentZoneVersion) {
					console.log('User profile version does match current version, updating...');

					await permawebProvider.libs.updateProfileVersion({
						profileId: permawebProvider.profile.id,
					});

					console.log('Updated profile version.');

					hasCheckedProfileRef.current = true;
				}
			}
		})();
	}, [permawebProvider.profile]);

	function getRoute(path: string, element: React.ReactNode) {
		const baseRoutes = [URLS.base, URLS.docs, `URLS.docs/*`, `${URLS.docs}:active/*`, URLS.notFound, '*'];

		if (baseRoutes.includes(path)) {
			return <Route path={path} element={element} />;
		}

		const view = (() => {
			if (!arProvider.wallet) {
				return (
					<Portal node={DOM.overlay}>
						<S.CenteredWrapper className={'overlay'}>
							<WalletBlock />
						</S.CenteredWrapper>
					</Portal>
				);
			}

			if (!permawebProvider.profile) {
				return (
					<Portal node={DOM.overlay}>
						<S.CenteredWrapper className={'overlay'}>
							<S.MessageWrapper>
								<p>{`${language?.gettingProfile}...`}</p>
							</S.MessageWrapper>
						</S.CenteredWrapper>
					</Portal>
				);
			}
			if (!portalProvider.permissions?.base || portalProvider.permissions?.externalContributor) {
				return (
					<Portal node={DOM.overlay}>						
						<S.CenteredWrapper className={'overlay'}>
							<S.MessageWrapper>
								{portalProvider.isPermissionsLoading ? (
									<p>{`${language?.loggingIn}...`}</p>
								) : (
									<>
										<p>
											{portalProvider.permissions?.externalContributor
												? language?.permissionExternalContributor
												: language?.permissionBaseDenied}
										</p>
										<Button type="primary" label={language?.returnHome} handlePress={() => navigate(URLS.base)} />
									</>
								)}
							</S.MessageWrapper>
						</S.CenteredWrapper>
					</Portal>
				);
			}
			return (
				<>
					{!portalProvider.current && <Loader message={`${language?.loadingPortal}...`} />}
					<Navigation open={settings.sidebarOpen} toggle={() => updateSettings('sidebarOpen', !settings.sidebarOpen)} />
					<S.View className={'max-view-wrapper'} navigationOpen={settings.sidebarOpen} navWidth={navWidth}>
						{element}
					</S.View>
					<S.Footer navigationOpen={settings.sidebarOpen} navWidth={navWidth}>
						<p>
							{language?.app} {new Date().getFullYear()}
						</p>
					</S.Footer>
				</>
			);
		})();

		return <Route path={path} element={view} />;
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
						{getRoute(`${URLS.base}:portalId`, <PortalView />)}
						{getRoute(`${URLS.base}:portalId/posts`, <Posts />)}
						{getRoute(`${URLS.base}:portalId/post/create`, <PostCreate />)}
						{getRoute(`${URLS.base}:portalId/post/create/article`, <PostEdit />)}
						{getRoute(`${URLS.base}:portalId/post/edit/article/:assetId`, <PostEdit />)}
						{getRoute(`${URLS.base}:portalId/page/create`, <PageCreate />)}
						{getRoute(`${URLS.base}:portalId/page/edit/:assetId`, <PageEdit />)}
						{getRoute(`${URLS.base}:portalId/setup`, <Setup />)}
						{getRoute(`${URLS.base}:portalId/design`, <Design />)}
						{getRoute(`${URLS.base}:portalId/media`, <Media />)}
						{getRoute(`${URLS.base}:portalId/users`, <Users />)}
						{getRoute(`${URLS.base}:portalId/pages`, <Pages />)}
						{getRoute(`${URLS.base}:portalId/domains`, <Domains />)}
						{getRoute(`${URLS.base}:portalId/domains/register`, <DomainsRegister />)}
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

function App() {
	return (
		<NavigationProvider>
			<AppContent />
		</NavigationProvider>
	);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<HashRouter>
				<SettingsProvider>
					<LanguageProvider>
						<ArweaveProvider>
							<PermawebProvider>
								<NotificationProvider>
									<PortalProvider>
										<GlobalStyle />										
										<App />
										<WalletConnect app="editor" />
									</PortalProvider>
								</NotificationProvider>
							</PermawebProvider>
						</ArweaveProvider>
					</LanguageProvider>
				</SettingsProvider>
			</HashRouter>
		</PersistGate>
	</Provider>
);
