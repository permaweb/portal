import React from 'react';
import { useLocation } from 'react-router-dom';

import { getAtomicAssets, getStoreNamespace, getZone, ZoneAssetType } from '@permaweb/libs';

import { Notification } from 'components/atoms/Notification';
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
	refreshCurrentPortal: () => void;
}

const DEFAULT_CONTEXT = {
	portals: null,
	current: null,
	showPortalManager: false,
	setShowPortalManager(_toggle: boolean) {},
	refreshCurrentPortal() {},
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
	const [currentId, setCurrentId] = React.useState<string | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);
	const [refreshCurrentTrigger, setRefreshCurrentTrigger] = React.useState<boolean>(false);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);
	const [createNewPortal, setCreateNewPortal] = React.useState<boolean>(false);

	const refreshCurrentPortal = () => setRefreshCurrentTrigger((prev) => !prev);

	React.useEffect(() => {
		if (arProvider.profile) {
			const portalsList: any[] = getStoreNamespace('portal', arProvider.profile);
			setPortals(portalsList);
		}
	}, [arProvider.profile]);

	React.useEffect(() => {
		if (portals?.length > 0) {
			const currentPortal = portals.find((portal) => location.pathname.startsWith(`/${portal.id}`));
			if (currentPortal?.id) {
				if (currentId !== currentPortal.id) {
					setCurrentId(currentPortal.id);
					setCurrent(null);
				}
			}
		}
	}, [location.pathname, portals, currentId]);

	// TODO: Duplicate zones being saved
	// TODO: Hot update saves
	React.useEffect(() => {
		(async function () {
			if (currentId) {
				try {
					const currentPortal = await getZone(currentId);
					if (currentPortal) {
						let data: PortalDetailType = {
							id: currentId,
							name: currentPortal.store?.name || 'None',
							logo: currentPortal.store?.logo || 'None',
							assets: [],
							categories: currentPortal.store?.categories || [],
							topics: getStoreNamespace('topic', currentPortal.store),
							users: [
								{ username: 'bob_crypto', displayName: 'Bob Smith', role: 'Contributor' },
								{ username: 'carol_dev', displayName: 'Carol Williams', role: 'Admin' },
								{ username: 'dave_builder', displayName: 'Dave Anderson', role: 'Contributor' },
								{ username: 'eva_permaweb', displayName: 'Eva Martinez', role: 'Contributor' },
							],
							domains: ['stratpol', 'stratpol-staging'], // TODO
						};

						if (currentPortal.assets?.length > 0) {
							const assetsFetch = await getAtomicAssets(currentPortal.assets.map((asset: ZoneAssetType) => asset.id));
							if (assetsFetch && assetsFetch.length > 0) data.assets = assetsFetch;
						}

						setCurrent(data);
					}
				} catch (e: any) {
					setErrorMessage(e.message ?? 'An error occurred getting your portal');
					setCurrent({
						id: currentId,
						name: 'Unknown',
						logo: null,
						assets: [],
						categories: [],
						topics: [],
						users: [],
						domains: [],
					});
				}
			}
		})();
	}, [currentId, refreshCurrentTrigger]);

	function handleShowPortalManager(toggle: boolean, useNew?: boolean) {
		setShowPortalManager(toggle);
		setCreateNewPortal(useNew ?? false);
	}

	return (
		<>
			<PortalContext.Provider
				value={{
					portals,
					current,
					showPortalManager,
					setShowPortalManager: handleShowPortalManager,
					refreshCurrentPortal,
				}}
			>
				{props.children}
				<Panel
					open={showPortalManager}
					header={current && current.id && !createNewPortal ? language.editPortal : language.createPortal}
					handleClose={() => setShowPortalManager(false)}
					width={500}
					closeHandlerDisabled={true}
				>
					<PortalManager
						portal={createNewPortal ? null : current}
						handleClose={() => setShowPortalManager(false)}
						handleUpdate={null}
					/>
				</Panel>
				{errorMessage && (
					<Notification type={'warning'} message={errorMessage} callback={() => setErrorMessage(null)} />
				)}
			</PortalContext.Provider>
		</>
	);
}
