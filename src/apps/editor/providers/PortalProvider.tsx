import React from 'react';
import { useLocation } from 'react-router-dom';

import { CurrentZoneVersion } from '@permaweb/libs';

import { PortalManager } from 'editor/components/organisms/PortalManager';

import { Notification } from 'components/atoms/Notification';
import { Panel } from 'components/atoms/Panel';
import { STORAGE } from 'helpers/config';
import {
	PortalDetailType,
	PortalHeaderType,
	PortalPermissionsType,
	PortalUserType,
	RefreshFieldType,
} from 'helpers/types';
import {
	areAssetsEqual,
	cachePortal,
	cacheProfile,
	checkValidAddress,
	getCachedPortal,
	getCachedProfile,
	getPortalAssets,
} from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

interface PortalContextState {
	portals: PortalHeaderType[] | null;
	invites: PortalHeaderType[] | null;
	current: PortalDetailType | null;
	permissions: PortalPermissionsType | null;
	showPortalManager: boolean;
	setShowPortalManager: (toggle: boolean, useNew?: boolean) => void;
	refreshCurrentPortal: (field?: RefreshFieldType) => void;
	fetchPortalUserProfile: (user: PortalUserType) => void;
	usersByPortalId: any;
	updating: boolean;
}

const DEFAULT_CONTEXT = {
	portals: null,
	invites: null,
	current: null,
	permissions: null,
	showPortalManager: false,
	setShowPortalManager(_toggle: boolean) {},
	refreshCurrentPortal() {},
	fetchPortalUserProfile(_user: PortalUserType) {},
	usersByPortalId: {},
	updating: false,
};

const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

// TODO: Remove names from external portals list, only fetch by id
export function PortalProvider(props: { children: React.ReactNode }) {
	const location = useLocation();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const hasFetchedRoles = React.useRef(false);
	const hasFetchedMeta = React.useRef(false);

	const [portals, setPortals] = React.useState<PortalHeaderType[] | null>(null);
	const [invites, setInvites] = React.useState<PortalHeaderType[] | null>(null);
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
		handlePortalSetup(null);
		setPermissions(null);
	}, [arProvider.walletAddress]);

	// TODO
	React.useEffect(() => {
		(async function () {
			if (arProvider.walletAddress && permawebProvider.profile) {
				const profilePortals = permawebProvider.profile.portals ?? [];

				setPortals(profilePortals);

				// if (!hasFetchedMeta.current) {
				// 	hasFetchedMeta.current = true;

				// 	for (const portal of profilePortals) {
				// 		try {
				// 			const portalData = await permawebProvider.libs.getZone(portal.id);
				// 			console.log(portalData);
				// 		}
				// 		catch (e: any) {
				// 			console.error(e);
				// 		}
				// 	}
				// }

				// if (!hasFetchedRoles.current) {
				// 	hasFetchedRoles.current = true;

				// 	const rolesByPortal = {};

				// 	if (profilePortals.length > 0) {
				// 		for (const portal of profilePortals) {
				// 			rolesByPortal[portal.id] = [];

				// 			const roles = await permawebProvider.libs.readState({
				// 				processId: portal.id,
				// 				path: 'roles',
				// 				serialize: true,
				// 			});

				// 			for (const address in roles) {
				// 				if (checkValidAddress(address)) {
				// 					rolesByPortal[portal.id].push({
				// 						address: address,
				// 						type: roles[address].type,
				// 						roles: roles[address].roles,
				// 					});
				// 				}
				// 			}
				// 		}

				// 		setPortals((prev) =>
				// 			prev.map((portal) => ({
				// 				...portal,
				// 				roles: rolesByPortal[portal.id] || [],
				// 			}))
				// 		);
				// 	}
				// }

				setInvites(permawebProvider.profile.invites ?? []);
			} else {
				setPermissions(null);
			}
		})();
	}, [permawebProvider.profile]);

	React.useEffect(() => {
		if (portals?.length > 0) {
			const currentPortal = portals.find((portal) => location.pathname.startsWith(`/${portal.id}`));
			if (currentPortal?.id) {
				if (currentId !== currentPortal.id) {
					setPermissions(null);
					setCurrentId(currentPortal.id);
					handlePortalSetup(null);
				}
			}
		} else {
			setPermissions(null);
		}
	}, [location.pathname, portals, currentId]);

	React.useEffect(() => {
		(async function () {
			try {
				if (!current && currentId && permawebProvider.libs) {
					handleInitPermissionSet(true);
					const cachedPortal = getCachedPortal(currentId);
					if (cachedPortal) {
						handlePortalSetup(cachedPortal);
					}

					setUpdating(true);
					const fetchedPortal = await fetchPortal();
					if (fetchedPortal) {
						handlePortalSetup(fetchedPortal);
						cachePortal(currentId, fetchedPortal);
					}
					setUpdating(false);
				}
			} catch (e: any) {
				console.error(e);
				setErrorMessage(e.message ?? 'An error occurred getting this portal');
				setUpdating(false);
			}
		})();
	}, [current, currentId, permawebProvider.libs]);

	React.useEffect(() => {
		(async function () {
			if (current) {
				let changeDetected = false;
				let tries = 0;
				const maxTries = 10;

				console.log('Starting portal update check...');

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
							handlePortalSetup(updatedPortal);
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
	}, [refreshCurrentTrigger]);

	function getUserPermissions(address: string, portal: PortalDetailType) {
		const user = portal.users.find((user: PortalUserType) => user.address === address);

		if (user?.roles) {
			const hasPermission = (permissonKeys: string | string[]) => {
				const keys = Array.isArray(permissonKeys) ? permissonKeys : [permissonKeys];
				const allowedRoles = keys.flatMap((key) => portal.permissions?.[key] ?? []);
				return user.roles.some((role) => allowedRoles.includes(role));
			};

			const isExternalContributor = user.roles.length === 1 && user.roles[0] === 'External-Contributor';

			return {
				base: true,
				updatePortalMeta: hasPermission('Zone-Update'),
				updateUsers: hasPermission('Role-Set'),
				postAutoIndex: hasPermission('Add-Index-Id'),
				postRequestIndex: hasPermission('Add-Index-Request'),
				updatePostRequestStatus: hasPermission('Update-Index-Request'),
				externalContributor: isExternalContributor,
			};
		}

		return null;
	}

	function handlePortalSetup(portal: PortalDetailType) {
		setCurrent(portal);

		if (permawebProvider.profile?.id && portal?.users) {
			setPermissions(getUserPermissions(permawebProvider.profile.id, portal));
		}
	}

	function handleInitPermissionSet(base: boolean) {
		const updatedPermissions = permissions
			? { ...permissions, base: base }
			: {
					base: base,
					updatePortalMeta: false,
					updateUsers: false,
					postAutoIndex: false,
					postRequestIndex: false,
					updatePostRequestState: false,
					externalContributor: false,
			  };
		setPermissions(updatedPermissions);
	}

	async function fetchPortalUserProfile(user: PortalUserType) {
		try {
			let profile: any = null;
			if (user.address === permawebProvider.profile?.id) {
				profile = { ...permawebProvider.profile };
			} else {
				profile = getCachedProfile(user.address);
				if (!profile) {
					profile = await permawebProvider.libs.getProfileById(user.address);
					cacheProfile(user.address, profile);
				}
			}

			if (profile?.id) {
				setUsersByPortalId((prev) => ({
					...prev,
					[profile.id]: profile,
				}));
			}
		} catch (e: any) {
			console.error(e);
		}
	}

	const fetchPortal = async () => {
		if (currentId) {
			try {
				const portalData = await permawebProvider.libs.getZone(currentId);

				const users: PortalUserType[] = [];
				if (portalData?.roles) {
					for (const entry of Object.keys(portalData.roles)) {
						users.push({
							address: entry,
							type: portalData.roles[entry].type,
							roles: portalData.roles[entry].roles,
						});
					}
				}

				/* Check and update zone version if available */
				if (portalData.version !== CurrentZoneVersion) {
					if (arProvider.wallet && arProvider.walletAddress === portalData.owner) {
						console.log('Zone version does match current version, updating...');
						await permawebProvider.libs.updateZoneVersion({
							zoneId: currentId,
						});
						console.log('Updated zone version.');
					}
				}

				const portal: PortalDetailType = {
					id: currentId,
					name: portalData.store?.name ?? 'None',
					logo: portalData.store?.logo ?? 'None',
					icon: portalData.store?.icon ?? 'None',
					assets: getPortalAssets(portalData?.store?.index),
					requests: portalData?.store?.indexRequests ?? [],
					categories: portalData?.store?.categories ?? [],
					topics: portalData?.store?.topics ?? [],
					links: portalData?.store?.links ?? [],
					uploads: portalData?.store?.uploads ?? [],
					fonts: portalData?.store?.fonts ?? {},
					themes: portalData?.store?.themes ?? [],
					users: users || [],
					roleOptions: portalData.roleOptions ?? {},
					permissions: portalData.permissions ?? {},
					domains: [], // TODO: Domains
				};

				return portal;
			} catch (e: any) {
				throw new Error('An error occurred getting this portal.');
			}
		}
	};

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
				invites,
				current,
				permissions,
				showPortalManager,
				setShowPortalManager: handleShowPortalManager,
				refreshCurrentPortal: (field?: RefreshFieldType) => refreshCurrentPortal(field),
				fetchPortalUserProfile: (userRole: PortalUserType) => fetchPortalUserProfile(userRole),
				usersByPortalId: usersByPortalId,
				updating,
			}}
		>
			{props.children}
			<Panel
				open={showPortalManager}
				header={current && current.id && !createNewPortal ? 
					(language?.editPortal || 'Edit Portal') : 
					(language?.createPortal || 'Create Portal')}
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
