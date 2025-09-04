import React from 'react';
import { useLocation } from 'react-router-dom';

import { CurrentZoneVersion } from '@permaweb/libs';

import { PortalManager } from 'editor/components/organisms/PortalManager';

import { Panel } from 'components/atoms/Panel';
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
	getCachedPortal,
	getCachedProfile,
	getPortalAssets,
} from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
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
	isPermissionsLoading: boolean;
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
	isPermissionsLoading: false,
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
	const { addNotification } = useNotifications();

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);
	const [createNewPortal, setCreateNewPortal] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (!arProvider.walletAddress) {
			setPortals(null);
			handlePortalSetup(null);
			setPermissions(null);
		} else {
			setPortals(null);
			handlePortalSetup(null);
		}
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		const profilePortals = permawebProvider.profile?.portals ?? [];
		setPortals(profilePortals);
		setInvites(permawebProvider.profile?.invites ?? []);
		if (!hasFetchedMeta.current) {
			hasFetchedMeta.current = true;
			if (profilePortals.length > 0) {
				(async () => {
					const updated = await Promise.all(
						profilePortals.map(async (portal: PortalHeaderType) => {
							const cached = getCachedPortal(portal.id);
							const data = cached ?? (await permawebProvider.libs.getZone(portal.id));
							return {
								...portal,
								name: data.name ?? data.store?.name ?? 'None',
								logo: data.logo ?? data.store?.logo ?? 'None',
								icon: data.icon ?? data.store?.icon ?? 'None',
								users: data.users ?? getPortalUsers(data.roles),
							};
						})
					);
					setPortals(updated);
				})();
			} else {
				setPermissions(null);
			}
		}
	}, [arProvider.walletAddress, permawebProvider.profile?.portals, permawebProvider.profile?.invites]);

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
				addNotification(e.message ?? 'An error occurred getting this portal', 'warning');
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
									changeRuleMet = !areAssetsEqual(existingPortal.assets ?? [], updatedPortal.assets ?? []);
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
						addNotification(e.message ?? 'An error occurred getting this portal', 'warning');
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

		if (!user) return { base: false };

		if (user?.roles) {
			const hasPermission = (permissonKeys: string | string[]) => {
				const keys = Array.isArray(permissonKeys) ? permissonKeys : [permissonKeys];
				const allowedRoles = keys.flatMap((key) => portal.permissions?.[key] ?? []);
				return user.roles.some((role) => allowedRoles.includes(role));
			};

			const isExternalContributor = user.roles.length === 1 && user.roles[0] === 'ExternalContributor';

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
				const cachedProfile = getCachedProfile(user.address);
				if (cachedProfile) profile = cachedProfile;

				if (profile?.id) {
					setUsersByPortalId((prev) => ({
						...prev,
						[profile.id]: profile,
					}));
				}

				try {
					const freshProfile = await permawebProvider.libs.getProfileById(user.address);
					if (freshProfile) {
						profile = freshProfile;
						cacheProfile(user.address, profile);
					}
				} catch (e: any) {
					console.error(e);
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

	function getPortalUsers(roles: any) {
		const users: PortalUserType[] = [];
		if (roles) {
			for (const entry of Object.keys(roles)) {
				users.push({
					address: entry,
					type: roles[entry].type,
					roles: roles[entry].roles,
				});
			}
		}
		return users;
	}

	const fetchPortal = async () => {
		if (currentId) {
			try {
				const portalData = await permawebProvider.libs.getZone(currentId);
				// console.log('portalData:', JSON.stringify(portalData, null, 2));

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
					users: getPortalUsers(portalData?.roles),
					pages: portalData?.store?.pages ?? [],
					layout: portalData?.store?.layout,
					roleOptions: portalData.roleOptions ?? {},
					permissions: portalData.permissions ?? {},
					domains: [],
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

	const isPermissionsLoading = React.useMemo(() => {
		if (!currentId) return false; // no portal selected → nothing to load
		return permissions === null || updating; // waiting for permissions or actively fetching
	}, [currentId, permissions, updating]);

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
				isPermissionsLoading,
			}}
		>
			{props.children}
			<Panel
				open={showPortalManager}
				header={
					current && current.id && !createNewPortal
						? language?.editPortal || 'Edit Portal'
						: language?.createPortal || 'Create Portal'
				}
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
		</PortalContext.Provider>
	);
}
