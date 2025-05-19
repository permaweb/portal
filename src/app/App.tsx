import React, { lazy, Suspense } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

const viewModules = (import.meta as any).glob('../views/**/index.tsx');

const Landing = getLazyImport('Landing');
const PortalView = getLazyImport('Portal');
const Posts = getLazyImport('Posts');
const PostCreate = getLazyImport('Post/Create');
const PostEditor = getLazyImport('Post/Editor');
const Setup = getLazyImport('Setup');
const Design = getLazyImport('Design');
const Users = getLazyImport('Users');
const Domains = getLazyImport('Domains');
const Docs = getLazyImport('Docs');
const NotFound = getLazyImport('NotFound');

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Portal } from 'components/atoms/Portal';
import { DOM, URLS } from 'helpers/config';
import { Navigation } from 'navigation/Navigation';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';

function getLazyImport(view: string) {
	const key = `../views/${view}/index.tsx`;
	const loader = viewModules[key];
	if (!loader) {
		throw new Error(`View not found: ${view}`);
	}

	return lazy(async () => {
		const module = await loader();
		return { default: module.default };
	});
}

export default function App() {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings } = useSettingsProvider();

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
								<p>{`${language.gettingProfile}...`}</p>
							</S.MessageWrapper>
						</S.CenteredWrapper>
					</Portal>
				);
			}

			if (!portalProvider.permissions?.base) {
				return (
					<Portal node={DOM.overlay}>
						<S.CenteredWrapper className={'overlay'}>
							<S.MessageWrapper>
								{!portalProvider.permissions ? (
									<p>{`${language.authenticating}...`}</p>
								) : (
									<>
										<p>{language.permissionBaseDenied}</p>
										<Button type={'primary'} label={language.returnHome} handlePress={() => navigate(URLS.base)} />
									</>
								)}
							</S.MessageWrapper>
						</S.CenteredWrapper>
					</Portal>
				);
			}

			return (
				<>
					{!portalProvider.current && <Loader message={`${language.loadingPortal}...`} />}
					<Navigation open={settings.sidebarOpen} toggle={() => updateSettings('sidebarOpen', !settings.sidebarOpen)} />
					<S.View className={'max-view-wrapper'} navigationOpen={settings.sidebarOpen}>
						{element}
					</S.View>
					<S.Footer navigationOpen={settings.sidebarOpen}>
						<p>
							{language.app} {new Date().getFullYear()}
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
						{getRoute(`${URLS.base}:portalId/post/create/article`, <PostEditor />)}
						{getRoute(`${URLS.base}:portalId/post/edit/article/:assetId`, <PostEditor />)}
						{getRoute(`${URLS.base}:portalId/setup`, <Setup />)}
						{getRoute(`${URLS.base}:portalId/design`, <Design />)}
						{getRoute(`${URLS.base}:portalId/users`, <Users />)}
						{getRoute(`${URLS.base}:portalId/domains`, <Domains />)}
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
