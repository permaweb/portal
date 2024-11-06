import React from 'react';
import { useLocation } from 'react-router-dom';

import { getAtomicAssets, getStoreNamespace, getZone, ZoneAssetType } from '@permaweb/libs';

import { Panel } from 'components/molecules/Panel';
import { PortalManager } from 'components/organisms/PortalManager';
import { PortalDetailType, PortalHeaderType } from 'helpers/types';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';

interface PortalContextState {
	portals: PortalHeaderType[] | null;
	current: PortalDetailType | null;
	showPortalManager: boolean;
	setShowPortalManager: (toggle: boolean) => void;
}

const DEFAULT_CONTEXT = {
	portals: null,
	current: null,
	showPortalManager: false,
	setShowPortalManager(_toggle: boolean) {},
};

const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

// TODO: Create new portal from home page selects current portal
export function PortalProvider(props: { children: React.ReactNode }) {
	const location = useLocation();

	const arProvider = useArweaveProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [portals, setPortals] = React.useState<PortalHeaderType[] | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (arProvider.profile) {
			const portalsList: any[] = getStoreNamespace(arProvider.profile, 'portal');
			setPortals(portalsList);
		}
	}, [arProvider.profile]);

	React.useEffect(() => {
		(async function () {
			if (portals) {
				try {
					const currentPortal = portals.find((portal) => location.pathname.startsWith(`/${portal.id}`));

					if (currentPortal && currentPortal.id) {
						if (current && current.id && current.id !== currentPortal.id) setCurrent(null);
						const currentPortalFetch = await getZone(currentPortal.id);
						if (currentPortalFetch) {
							let data: PortalDetailType = {
								id: currentPortal.id,
								name: currentPortalFetch.store?.name || 'None',
								logo: currentPortalFetch.store?.logo || 'None',
							};

							if (currentPortalFetch.assets && currentPortalFetch.assets.length > 0) {
								const assetsFetch = await getAtomicAssets({
									ids: currentPortalFetch.assets.map((asset: ZoneAssetType) => asset.id),
								});
								if (assetsFetch && assetsFetch.length > 0) data.assets = assetsFetch;
							}

							setCurrent(data);
						}
					}
				} catch (e: any) {
					setCurrent(null);
				}
			} else {
				setCurrent(null);
			}
		})();
	}, [location.pathname, portals]);

	return (
		<>
			<PortalContext.Provider value={{ portals, current, showPortalManager, setShowPortalManager }}>
				{props.children}
				<Panel
					open={showPortalManager}
					header={current && current.id ? language.editPortal : language.createPortal}
					handleClose={() => setShowPortalManager(false)}
					width={500}
				>
					<PortalManager portal={current} handleClose={() => setShowPortalManager(false)} handleUpdate={null} />
				</Panel>
			</PortalContext.Provider>
		</>
	);
}
