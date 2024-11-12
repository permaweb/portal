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
	setShowPortalManager: (toggle: boolean, useNew?: boolean) => void;
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

export function PortalProvider(props: { children: React.ReactNode }) {
	const location = useLocation();

	const arProvider = useArweaveProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [portals, setPortals] = React.useState<PortalHeaderType[] | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);
	const [createNewPortal, setCreateNewPortal] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (arProvider.profile) {
			const portalsList: any[] = getStoreNamespace('portal', arProvider.profile);
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

						// TODO
						// setCurrent({
						// 	id: currentPortal.id,
						// 	name: currentPortal.name,
						// 	logo: currentPortal.logo ?? null
						// });

						const currentPortalFetch = await getZone(currentPortal.id);
						if (currentPortalFetch) {
							let data: PortalDetailType = {
								id: currentPortal.id,
								name: currentPortalFetch.store?.name || 'None',
								logo: currentPortalFetch.store?.logo || 'None',
								assets: [],
								topics: getStoreNamespace('topic', currentPortalFetch.store),
								users: [
									{ username: 'bob_crypto', displayName: 'Bob Smith', role: 'Contributor' },
									{ username: 'carol_dev', displayName: 'Carol Williams', role: 'Admin' },
									{ username: 'dave_builder', displayName: 'Dave Anderson', role: 'Contributor' },
									{ username: 'eva_permaweb', displayName: 'Eva Martinez', role: 'Contributor' },
								],
								domains: ['stratpol', 'stratpol-staging'], // TODO
							};

							if (currentPortalFetch.assets?.length > 0) {
								const assetsFetch = await getAtomicAssets(
									currentPortalFetch.assets.map((asset: ZoneAssetType) => asset.id)
								);
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

	function handleShowPortalManager(toggle: boolean, useNew?: boolean) {
		setShowPortalManager(toggle);
		setCreateNewPortal(useNew ?? false);
	}

	return (
		<>
			<PortalContext.Provider
				value={{ portals, current, showPortalManager, setShowPortalManager: handleShowPortalManager }}
			>
				{props.children}
				<Panel
					open={showPortalManager}
					header={current && current.id && !createNewPortal ? language.editPortal : language.createPortal}
					handleClose={() => setShowPortalManager(false)}
					width={500}
				>
					<PortalManager
						portal={createNewPortal ? null : current}
						handleClose={() => setShowPortalManager(false)}
						handleUpdate={null}
					/>
				</Panel>
			</PortalContext.Provider>
		</>
	);
}
