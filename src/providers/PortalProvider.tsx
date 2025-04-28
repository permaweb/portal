import React from 'react';
import { useLocation } from 'react-router-dom';

import { Notification } from 'components/atoms/Notification';
import { Panel } from 'components/atoms/Panel';
import { PortalManager } from 'components/organisms/PortalManager';
import { STORAGE } from 'helpers/config';
import {
	PortalAssetType,
	PortalDetailType,
	PortalHeaderType,
	PortalPermissionsType,
	PortalRolesType,
	PortalUserRoleType,
	RefreshFieldType,
} from 'helpers/types';
import { areAssetsEqual } from 'helpers/utils';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';
import { usePermawebProvider } from './PermawebProvider';

interface PortalContextState {
	portals: PortalHeaderType[] | null;
	current: PortalDetailType | null;
	permissions: PortalPermissionsType | null;
	showPortalManager: boolean;
	setShowPortalManager: (toggle: boolean, useNew?: boolean) => void;
	refreshCurrentPortal: (field?: RefreshFieldType) => void;
	fetchPortalUserProfile: any;
	usersByPortalId: any;
	updating: boolean;
}

const DEFAULT_CONTEXT = {
	portals: null,
	current: null,
	permissions: null,
	showPortalManager: false,
	setShowPortalManager(_toggle: boolean) {},
	refreshCurrentPortal() {},
	fetchPortalUserProfile(_thing: PortalRolesType) {},
	usersByPortalId: {},
	updating: false,
};

const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

export function PortalProvider(props: { children: React.ReactNode }) {
	const location = useLocation();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [portals, setPortals] = React.useState<PortalHeaderType[] | null>(null);
	const [usersByPortalId, setUsersByPortalId] = React.useState<{}>({});

	const [currentId, setCurrentId] = React.useState<string | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);
	const [permissions, setPermissions] = React.useState<PortalPermissionsType | null>(null);

	const [refreshCurrentTrigger, setRefreshCurrentTrigger] = React.useState<boolean>(false);
	const [refreshField, setRefreshField] = React.useState<RefreshFieldType | null>(null);
	const [updating, setUpdating] = React.useState<boolean>(false);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);
	const [createNewPortal, setCreateNewPortal] = React.useState<boolean>(false);

	React.useEffect(() => {
		setPortals(null);
		setCurrent(null);
		setPermissions(null);
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		if (permawebProvider.profile) {
			setPortals(permawebProvider.profile.portals ?? []);
		} else {
			setPermissions(null);
		}
	}, [permawebProvider.profile]);

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
			try {
				console.log('currentId', currentId, permawebProvider.profile);
				if (currentId) {
					handleInitPermissionSet(true); // TODO: Permissions
					const cachedPortal = getCachedPortal(currentId);
					if (cachedPortal && false) {
						console.log('cached');
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
	}, [currentId, permawebProvider.profile]);

	React.useEffect(() => {
		(async function () {
			let changeDetected = false;
			let tries = 0;
			const maxTries = 10;

			console.log('Starting portal update check...');

			if (current) {
				setUpdating(true);
				while (!changeDetected && tries < maxTries) {
					try {
						console.log(`Attempt ${tries + 1} to get portal data...`);

						const existingPortal = { ...current };
						const updatedPortal = await fetchPortal();

						let changeRuleMet = JSON.stringify(existingPortal) !== JSON.stringify(updatedPortal);
						if (refreshField) {
							switch (refreshField) {
								case 'assets':
									changeRuleMet = !areAssetsEqual(existingPortal.assets, updatedPortal.assets);
									break;
								default:
									break;
							}
						}

						if (changeRuleMet) {
							console.log('Change detected in portal data. Updating current portal...');
							setCurrent(updatedPortal);
							cachePortal(currentId, updatedPortal);
							changeDetected = true;
						} else {
							console.log('No change detected. Retrying...');
							await new Promise((resolve) => setTimeout(resolve, 2000));
							tries++;
						}
					} catch (e: any) {
						console.error('Error occurred while getting portal:', e);
						setErrorMessage(e.message ?? 'An error occurred getting this portal');
					}
				}

				if (!changeDetected) {
					console.log('Max attempts reached without detecting changes.');
				}
				setUpdating(false);
			}
		})();
	}, [refreshCurrentTrigger, refreshField]);

	function fetchPortalUserProfile(userRoleEntry: PortalRolesType) {
		console.log('userRoleEntry', userRoleEntry);
		permawebProvider
			.fetchProfileById(userRoleEntry.address)
			.then((profile) => {
				console.log('profile', profile);
				if (profile && profile.id) {
					console.log('before', usersByPortalId, profile);
					setUsersByPortalId((prevState) => ({ ...prevState, [profile.id]: profile }));
					console.log('after', usersByPortalId);
					return;
				}
			})
			.catch((e) => {
				console.log('fetch error', e);
				setUsersByPortalId((prevState) => ({ ...prevState, [userRoleEntry.address]: null }));
			});
	}

	const fetchPortal = async () => {
		console.log('fetch', fetch);
		if (currentId) {
			try {
				const portalData = await permawebProvider.libs.getZone(currentId);
				console.log('portalData', portalData);
				const usersArr: PortalRolesType[] = Object.entries(portalData?.roles).map(([k, v]) => {
					console.log('k: ', k, ' v: ', v);
					return { address: k, roles: v as PortalUserRoleType[] };
				});

				let portal: PortalDetailType = {
					id: currentId,
					name: portalData.store?.name ?? 'None',
					logo: portalData.store?.logo ?? 'None',
					assets: getPortalAssets(portalData?.store?.index),
					categories: portalData?.store?.categories ?? [],
					topics: portalData?.store?.topics ?? [],
					links: portalData?.store?.links ?? [],
					uploads: portalData?.store?.uploads ?? [],
					themes: portalData?.store?.themes ?? [],
					users: usersArr || [], // TODO all of the users with roles in the portal process roles table: populate it
					domains: [], // TODO
				};

				return portal;
			} catch (e: any) {
				throw new Error(e.message ?? 'An error occurred getting this portal.');
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

	function getPortalAssets(index: PortalAssetType[]) {
		return permawebProvider.libs.mapFromProcessCase(
			index?.filter(
				(asset: any) =>
					asset.processType &&
					asset.processType === 'atomic-asset' &&
					asset.assetType &&
					asset.assetType === 'blog-post'
			)
		);
	}

	function handleInitPermissionSet(base: boolean) {
		const updatedPermissions = permissions ? { ...permissions, base: base } : { base: base };
		setPermissions(updatedPermissions);
	}

	function handleShowPortalManager(toggle: boolean, useNew?: boolean) {
		setShowPortalManager(toggle);
		setCreateNewPortal(useNew ?? false);
	}

	const refreshCurrentPortal = (field: RefreshFieldType) => {
		if (field) setRefreshField(field);
		setRefreshCurrentTrigger((prev) => !prev);
	};

	return (
		<PortalContext.Provider
			value={{
				portals,
				current,
				permissions,
				showPortalManager,
				setShowPortalManager: handleShowPortalManager,
				refreshCurrentPortal: (field?: RefreshFieldType) => refreshCurrentPortal(field),
				fetchPortalUserProfile: (userRole: PortalRolesType) => fetchPortalUserProfile(userRole),
				usersByPortalId: usersByPortalId,
				updating,
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
			{errorMessage && <Notification type={'warning'} message={errorMessage} callback={() => setErrorMessage(null)} />}
		</PortalContext.Provider>
	);
}
