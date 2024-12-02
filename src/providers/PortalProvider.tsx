import React from 'react';
import { useLocation } from 'react-router-dom';

import { getZone, mapFromProcessCase } from '@permaweb/libs';

import { Notification } from 'components/atoms/Notification';
import { Panel } from 'components/molecules/Panel';
import { PortalManager } from 'components/organisms/PortalManager';
import { STORAGE } from 'helpers/config';
import { PortalDetailType, PortalHeaderType, PortalPermissionsType } from 'helpers/types';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';

interface PortalContextState {
	portals: PortalHeaderType[] | null;
	current: PortalDetailType | null;
	permissions: PortalPermissionsType | null;
	showPortalManager: boolean;
	setShowPortalManager: (toggle: boolean, useNew?: boolean) => void;
	refreshCurrentPortal: () => void;
}

const DEFAULT_CONTEXT = {
	portals: null,
	current: null,
	permissions: null,
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
	const [permissions, setPermissions] = React.useState<PortalPermissionsType | null>(null);

	const [refreshCurrentTrigger, setRefreshCurrentTrigger] = React.useState<boolean>(false);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);
	const [createNewPortal, setCreateNewPortal] = React.useState<boolean>(false);

	const refreshCurrentPortal = () => setRefreshCurrentTrigger((prev) => !prev);

	React.useEffect(() => {
		if (arProvider.profile) {
			setPortals(arProvider.profile.portals ?? []);
		} else {
			setPermissions(null);
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
		} else {
			setPermissions(null);
		}
	}, [location.pathname, portals, currentId]);

	React.useEffect(() => {
		(async function () {
			if (currentId) {
				try {
					const fetchedPortal = await fetchPortal();
					if (fetchedPortal) {
						setCurrent(fetchedPortal);
						cachePortal(currentId, fetchedPortal);
					}
				} catch (e: any) {
					console.error(e);
					setErrorMessage(e.message ?? 'An error occurred fetching this portal.');
				}
			}
		})();
	}, [currentId]);

	React.useEffect(() => {
		(async function () {
			try {
				if (currentId) {
					handleInitPermissionSet(true); // TODO: Fetch permissions
					const cachedPortal = getCachedPortal(currentId);
					if (cachedPortal) {
						setCurrent(cachedPortal);
					} else {
						const fetchedPortal = await fetchPortal();
						if (fetchedPortal) {
							setCurrent(fetchedPortal);
							cachePortal(currentId, fetchedPortal);
						}
					}
				}
			} catch (e: any) {
				console.error(e);
				setErrorMessage(e.message ?? 'An error occurred getting this portal');
			}
		})();
	}, [currentId, arProvider.profile]);

	React.useEffect(() => {
		(async function () {
			let changeDetected = false;
			let tries = 0;
			const maxTries = 10;

			while (!changeDetected && tries < maxTries) {
				try {
					const existingPortal = current;
					const updatedPortal = await fetchPortal();

					if (updatedPortal && JSON.stringify(existingPortal) !== JSON.stringify(updatedPortal)) {
						setCurrent(updatedPortal);
						cachePortal(currentId, updatedPortal);
						changeDetected = true;
					} else {
						await new Promise((resolve) => setTimeout(resolve, 1000));
						tries++;
					}
				} catch (e: any) {
					console.error(e);
					setErrorMessage(e.message ?? 'An error occurred getting this portal');
				}
			}
		})();
	}, [refreshCurrentTrigger]);

	const fetchPortal = async () => {
		if (currentId) {
			try {
				const portalData = await getZone(currentId);

				if (portalData) {
					let portal: PortalDetailType = {
						id: currentId,
						name: portalData.Store?.Name || 'None',
						logo: portalData.Store?.Logo || 'None',
						assets: portalData.Store?.Index
							? mapFromProcessCase(
									portalData.Store.Index.filter(
										(asset: any) =>
											asset.ProcessType &&
											asset.ProcessType === 'atomic-asset' &&
											asset.AssetType &&
											asset.AssetType === 'blog-post'
									)
							  )
							: [],
						categories: portalData.Store?.Categories ? mapFromProcessCase(portalData.Store.Categories) : [],
						topics: portalData.Store?.Topics ? mapFromProcessCase(portalData.Store.Topics) : [],
						links: portalData.Store?.Links ? mapFromProcessCase(portalData.Store.Links) : [],
						uploads: portalData.Store?.Uploads ? mapFromProcessCase(portalData.Store.Uploads) : [],
						users: [
							{ username: 'bob_crypto', displayName: 'Bob Smith', role: 'contributor' },
							{ username: 'carol_dev', displayName: 'Carol Williams', role: 'admin' },
							{ username: 'dave_builder', displayName: 'Dave Anderson', role: 'contributor' },
							{ username: 'eva_permaweb', displayName: 'Eva Martinez', role: 'contributor' },
						],
						domains: ['stratpol', 'stratpol-staging'], // TODO
					};

					return portal;
				}
			} catch (e: any) {
				console.error(e);
				setErrorMessage(e.message ?? 'An error occurred getting this portal.');
			}
		}
	};

	const getCachedPortal = (id: string) => {
		const cached = localStorage.getItem(STORAGE.portal(id));
		return cached ? JSON.parse(cached) : null;
	};

	const cachePortal = (id: string, portalData: any) => {
		localStorage.setItem(STORAGE.portal(id), JSON.stringify(portalData));
	};

	function handleInitPermissionSet(base: boolean) {
		const updatedPermissions = permissions ? { ...permissions, base: base } : { base: base };
		setPermissions(updatedPermissions);
	}

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
					permissions,
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
