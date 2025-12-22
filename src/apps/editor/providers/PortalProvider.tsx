import React from 'react';
import { useLocation } from 'react-router-dom';

import { CurrentZoneVersion } from '@permaweb/libs';

import { PortalManager } from 'editor/components/organisms/PortalManager';

import { Panel } from 'components/atoms/Panel';
import { AO_NODE, PORTAL_PATCH_MAP } from 'helpers/config';
import {
	PortalDetailType,
	PortalHeaderType,
	PortalPatchMapEnum,
	PortalPermissionsType,
	PortalUserType,
} from 'helpers/types';
import {
	cachePortal,
	cacheProfile,
	debugLog,
	fixBooleanStrings,
	getCachedPortal,
	getCachedProfile,
	getPortalAssets,
	getPortalUsers,
	isEqual,
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
	transfers: any;
	showPortalManager: boolean;
	setShowPortalManager: (toggle: boolean, useNew?: boolean) => void;
	refreshCurrentPortal: (field?: PortalPatchMapEnum | PortalPatchMapEnum[]) => void;
	fetchPortalUserProfile: (user: PortalUserType) => void;
	usersByPortalId: any;
	updating: boolean;
	updateAvailable: boolean;
}

const DEFAULT_CONTEXT = {
	portals: null,
	invites: null,
	current: null,
	permissions: null,
	transfers: null,
	showPortalManager: false,
	setShowPortalManager(_toggle: boolean) {},
	refreshCurrentPortal() {},
	fetchPortalUserProfile(_user: PortalUserType) {},
	usersByPortalId: {},
	updating: false,
	updateAvailable: false,
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
	const { addNotification } = useNotifications();

	const authoritiesRef = React.useRef(false);
	const patchMapRef = React.useRef(false);
	const portalsRequestRef = React.useRef(false);

	const [portals, setPortals] = React.useState<PortalHeaderType[] | null>(null);
	const [invites, setInvites] = React.useState<PortalHeaderType[] | null>(null);
	const [usersByPortalId, setUsersByPortalId] = React.useState<{}>({});

	const [currentId, setCurrentId] = React.useState<string | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);
	const [permissions, setPermissions] = React.useState<PortalPermissionsType | null>(null);
	const [transfers, _setTransfers] = React.useState<any>([]);

	const [refreshCurrentTrigger, setRefreshCurrentTrigger] = React.useState<boolean>(false);
	const [refreshFields, setRefreshFields] = React.useState<PortalPatchMapEnum[] | null>(null);
	const [updating, setUpdating] = React.useState<boolean>(false);
	const [updateAvailable, setUpdateAvailable] = React.useState<boolean>(false);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);
	const [createNewPortal, setCreateNewPortal] = React.useState<boolean>(false);

	const parseField = React.useCallback(
		(key: PortalPatchMapEnum, response: any, patchKey?: string) => {
			const value = patchKey === key ? response : response[key];
			try {
				return fixBooleanStrings(permawebProvider.libs.mapFromProcessCase(JSON.parse(value)));
			} catch {
				return value || null;
			}
		},
		[permawebProvider.libs]
	);

	React.useEffect(() => {
		setCurrent(null);
		setPortals(null);
		portalsRequestRef.current = false;
		if (!arProvider.walletAddress) {
			setPermissions(null);
		}
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		if (permawebProvider.profile?.id && !portalsRequestRef.current) {
			const profilePortals = permawebProvider.profile?.portals ?? [];

			setPortals(profilePortals);
			setInvites(permawebProvider.profile?.invites ?? []);

			if (profilePortals.length > 0) {
				portalsRequestRef.current = true;
				(async () => {
					const updated = await Promise.all(
						profilePortals.map(async (portal: PortalHeaderType) => {
							try {
								const response = fixBooleanStrings(
									permawebProvider.libs.mapFromProcessCase(
										await permawebProvider.libs.readState({ processId: portal.id })
									)
								);

								let overview: any = {};
								if (response?.overview) overview = parseField(PortalPatchMapEnum.Overview, response);

								let users: any = {};
								if (response?.users) users = parseField(PortalPatchMapEnum.Users, response);
								console.log(response);
								console.log('users', users);
								let transfers: any = {};
								if (response?.transfers) {
									transfers = parseField(PortalPatchMapEnum.Transfers, response);
								}
								return {
									...portal,
									name: overview.name ?? overview.store?.name ?? 'None',
									logo: overview.banner ?? overview.logo ?? overview.store?.logo ?? 'None',
									icon: overview.thumbnail ?? overview.icon ?? overview.store?.icon ?? 'None',
									users: users.users ?? getPortalUsers(users.roles),
									transfers: transfers.transfers ?? [],
								};
							} catch (e) {
								debugLog(
									'warn',
									'PortalProvider',
									`Failed to fetch portal metadata for ${portal.id}:`,
									e.message ?? 'Unknown error'
								);
								const cached = getCachedPortal(portal.id);
								if (cached) {
									return {
										...portal,
										name: cached.name ?? portal.name ?? 'None',
										logo: cached.logo ?? portal.logo ?? 'None',
										icon: cached.icon ?? portal.icon ?? 'None',
										users: cached.users ?? portal.roles ?? [],
										transfers: cached.transfers ?? [],
									};
								}
								return portal;
							}
						})
					);
					setPortals(updated);
				})();
			} else {
				setPermissions({ base: false });
			}
		}
	}, [
		arProvider.walletAddress,
		permawebProvider.profile?.id,
		permawebProvider.profile?.portals,
		permawebProvider.profile?.invites,
	]);

	React.useEffect(() => {
		if (portals?.length > 0) {
			const currentPortal = portals.find((portal) => location.pathname.startsWith(`/${portal.id}`));
			if (currentPortal?.id) {
				if (currentId !== currentPortal.id) {
					setPermissions(null);
					setCurrentId(currentPortal.id);
					setCurrent(null);
				}
			}
		}
	}, [location.pathname, portals, currentId]);

	React.useEffect(() => {
		(async function () {
			try {
				if (!current && currentId && permawebProvider.libs) {
					const cachedPortal = getCachedPortal(currentId);
					if (cachedPortal) setCurrent(cachedPortal);
					await fetchPortal();
				}
			} catch (e: any) {
				debugLog('error', 'PortalProvider', 'Error getting portal:', e.message ?? 'Unknown error');
				addNotification(e.message ?? 'An error occurred getting this portal', 'warning');
			}
		})();
	}, [current, currentId, permawebProvider.libs]);

	React.useEffect(() => {
		(async function () {
			if (current && refreshFields && refreshFields.length > 0) {
				try {
					await Promise.all(refreshFields.map((field) => fetchPortal({ patchKey: field })));
				} catch (e: any) {
					debugLog('error', 'PortalProvider', 'Error refreshing portal:', e.message ?? 'Unknown error');
				} finally {
					setRefreshFields(null);
				}
			}
		})();
	}, [refreshCurrentTrigger, refreshFields]);

	const fetchPortal = async (opts?: { patchKey?: string }) => {
		if (!currentId) return;

		setUpdating(true);
		try {
			const response = fixBooleanStrings(
				permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({
						processId: currentId,
						path: opts?.patchKey,
						hydrate: !!opts?.patchKey,
					})
				)
			);

			const overview = parseField(PortalPatchMapEnum.Overview, response, opts?.patchKey);
			const users = parseField(PortalPatchMapEnum.Users, response, opts?.patchKey);
			const navigation = parseField(PortalPatchMapEnum.Navigation, response, opts?.patchKey);
			const presentation = parseField(PortalPatchMapEnum.Presentation, response, opts?.patchKey);
			const media = parseField(PortalPatchMapEnum.Media, response, opts?.patchKey);
			const posts = parseField(PortalPatchMapEnum.Posts, response, opts?.patchKey);
			const requests = parseField(PortalPatchMapEnum.Requests, response, opts?.patchKey);
			const monetization = parseField(PortalPatchMapEnum.Monetization, response, opts?.patchKey);
			const transfers = parseField(PortalPatchMapEnum.Transfers, response, opts?.patchKey);

			/* Check for node updates and add the new node address as an authority */
			if (
				overview?.authorities &&
				!overview?.authorities.includes(AO_NODE.authority) &&
				permawebProvider.libs?.updateZoneAuthorities &&
				!authoritiesRef.current
			) {
				authoritiesRef.current = true;
				permawebProvider.libs.updateZoneAuthorities({
					zoneId: currentId,
					authorityId: AO_NODE.authority,
				});
			}

			/* Check for updates in the portal patch map */
			if (
				overview &&
				(!overview?.patchMap || !isEqual(overview?.patchMap, PORTAL_PATCH_MAP)) &&
				permawebProvider.libs?.updateZonePatchMap &&
				!patchMapRef.current
			) {
				debugLog('info', 'PortalProvider', 'Portal patchMap:', overview?.patchMap);
				patchMapRef.current = true;
				try {
					permawebProvider.libs.updateZonePatchMap({ ...PORTAL_PATCH_MAP }, currentId);
				} catch (e: any) {
					debugLog('error', 'PortalProvider', 'Failed to update portal patch map:', e.message ?? 'Unknown error');
				}
			}

			setUpdateAvailable(
				overview?.version !== CurrentZoneVersion && arProvider.wallet && arProvider.walletAddress === overview?.owner
			);

			const portalState: PortalDetailType = {
				id: currentId,
				name: overview?.name ?? current?.name ?? null,
				logo: overview?.banner ?? overview?.logo ?? current?.logo ?? null,
				icon: overview?.thumbnail ?? overview?.icon ?? current?.icon ?? null,
				wallpaper: overview?.wallpaper ?? current?.wallpaper ?? null,
				owner: overview?.owner ?? current?.owner ?? null,
				moderation: overview?.moderation ?? current?.moderation ?? null,
				assets: posts?.index ? getPortalAssets(posts.index) : current?.assets ?? [],
				requests: requests?.indexRequests ?? current?.requests ?? null,
				categories: navigation?.categories ?? current?.categories ?? [],
				topics: navigation?.topics ?? current?.topics ?? [],
				links: navigation?.links ?? current?.links ?? [],
				uploads: media?.uploads ?? current?.uploads ?? [],
				fonts: presentation?.fonts ?? current?.fonts ?? null,
				themes: presentation?.themes ?? current?.themes ?? null,
				pages: presentation?.pages ?? current?.pages ?? null,
				layout: presentation?.layout ?? current?.layout ?? null,
				users: users?.roles ? getPortalUsers(users.roles) : current?.users ?? null,
				roleOptions: users?.roleOptions ?? current?.roleOptions ?? null,
				permissions: users?.permissions ?? current?.permissions ?? null,
				domains: navigation?.domains ?? current?.domains ?? [],
				monetization: monetization ?? current?.monetization ?? null,
				transfers: transfers?.transfers ?? current?.transfers ?? [],
			};

			if (permawebProvider.profile?.id && portalState.users) {
				setPermissions(getUserPermissions(permawebProvider.profile.id, portalState.users, portalState.permissions));
			}

			cachePortal(currentId, portalState);
			setCurrent(portalState);
		} catch (e: any) {
			debugLog('error', 'PortalProvider', 'Failed to fetch portal data:', e.message ?? 'Unknown error');
		}
		setUpdating(false);
	};

	function getUserPermissions(address: string, users: PortalUserType[], permissions: PortalPermissionsType) {
		const user = users?.find((user: PortalUserType) => user.address === address);

		if (!user) return { base: false };

		if (user?.roles) {
			const hasPermission = (permissonKeys: string | string[]) => {
				const keys = Array.isArray(permissonKeys) ? permissonKeys : [permissonKeys];
				const allowedRoles = keys.flatMap((key) => permissions?.[key]?.roles ?? permissions?.[key] ?? []);
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
				updatePostStatus: hasPermission('Update-Status-Index-Request'),
				externalContributor: isExternalContributor,
			};
		}

		return null;
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
					const freshProfile = await permawebProvider.libs.getProfileById(user.address, { hydrate: true });
					if (freshProfile) {
						profile = freshProfile;
						cacheProfile(user.address, profile);
					}
				} catch (e: any) {
					debugLog('error', 'PortalProvider', 'Error fetching profile:', e.message ?? 'Unknown error');
				}
			}

			if (profile?.id) {
				setUsersByPortalId((prev) => ({
					...prev,
					[profile.id]: profile,
				}));
			}
		} catch (e: any) {
			debugLog('error', 'PortalProvider', 'Error fetching user profile:', e.message ?? 'Unknown error');
		}
	}

	function handleShowPortalManager(toggle: boolean, useNew?: boolean) {
		setShowPortalManager(toggle);
		setCreateNewPortal(useNew ?? false);
	}

	const refreshCurrentPortal = (field?: PortalPatchMapEnum | PortalPatchMapEnum[]) => {
		if (field) {
			const fieldsArray = Array.isArray(field) ? field : [field];
			setRefreshFields(fieldsArray);
		}
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
				refreshCurrentPortal: (field?: PortalPatchMapEnum | PortalPatchMapEnum[]) => refreshCurrentPortal(field),
				fetchPortalUserProfile: (userRole: PortalUserType) => fetchPortalUserProfile(userRole),
				usersByPortalId: usersByPortalId,
				updating,
				updateAvailable,
				transfers,
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
