import React from 'react';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { defaultPages } from 'engine/defaults/pages.defaults';
// Temp
import { defaultThemes } from 'engine/defaults/theme.defaults';
import WebFont from 'webfontloader';

import {
	areAssetsEqual,
	cachePortal,
	cacheProfile,
	getCachedPortal,
	getCachedProfile,
	getPortalAssets,
} from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

export interface PortalContextState {
	portalId: string | null;
	portal: any;
	setPortalId: (portalId: string) => void;
	editorMode: string;
	setEditorMode: (mode: string) => void;
}

const DEFAULT_CONTEXT = {
	portalId: null,
	portal: null,
	setPortalId(_portalId: string) {},
	editorMode: 'hidden',
	setEditorMode(_mode: string) {},
};

export const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function useSetPortalId(id: string) {
	const context = React.useContext(PortalContext);

	React.useEffect(() => {
		if (context) {
			context.setPortalId(id);
		}
	}, [id, context]);
}

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

export function PortalProvider(props: { children: React.ReactNode }) {
	const permawebProvider = usePermawebProvider();
	const defaultPortal = { themes: defaultThemes, layout: defaultLayout, pages: defaultPages };

	const [portalId, setPortalId] = React.useState<string | null>(null);
	const [portal, setPortal] = React.useState(null);
	const [editorMode, setEditorMode] = React.useState('hidden');
	const [updating, setUpdating] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (!portalId || !permawebProvider.libs) return;

		(async () => {
			try {
				const cached = getCachedPortal(portalId);
				const res = await permawebProvider.libs.getZone(portalId);
				console.log('Zone: ', res);

				const zone = {
					...defaultPortal,
					...cached,
					...res.store,
					posts: res.store?.index ? [...res.store.index].reverse() : [],
				};

				const Name = zone?.name;
				const Categories = zone?.categories;
				const Layout = zone?.layout;
				const Pages = zone?.pages;
				const Posts = zone?.posts;
				const Themes = zone?.themes;
				const Logo = zone?.logo;
				const Fonts = zone?.fonts;

				const portalData = { Name, Categories, Layout, Pages, Themes, Posts, Logo, Fonts };
				console.log('portalData: ', portalData);
				setPortal(portalData);
				if (portalId && portalData) cachePortal(portalId, portalData);
			} catch (err) {
				console.error('Failed to fetch zone:', err);
				const cached = getCachedPortal(portalId);
				const zone = {
					...defaultPortal,
					...cached,
				};
				setPortal(zone);
			}
		})();
	}, [portalId, permawebProvider.libs]);

	if (portal?.Fonts) {
		const fonts = portal?.Fonts;
		const families = [];

		if (fonts.headers) families.push(fonts.headers);
		if (fonts.body) families.push(fonts.body);

		if (families.length > 0) {
			WebFont.load({
				google: { families: families },
				active: () => {
					const [bodyFont, bodyWeight] = fonts.body.trim().split(':');
					const bodyWeights = bodyWeight.split(',');
					document.documentElement.style.setProperty('--font-body', bodyFont);
					document.documentElement.style.setProperty('--font-body-weight', bodyWeights[0]);
					document.documentElement.style.setProperty('--font-body-weight-bold', bodyWeights[1]);

					const [headerFont, headerWeight] = fonts.headers.trim().split(':');
					const headerWeights = headerWeight.split(',');
					document.documentElement.style.setProperty('--font-header', headerFont);
					document.documentElement.style.setProperty('--font-header-weight', headerWeights[0]);
					document.documentElement.style.setProperty('--font-header-weight-bold', headerWeights[1]);
				},
			});
		}
	}

	return (
		<>
			<PortalContext.Provider
				value={{
					portalId,
					portal,
					setPortalId,
					editorMode,
					setEditorMode,
				}}
			>
				{props.children}
			</PortalContext.Provider>
		</>
	);
}
