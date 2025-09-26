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
	getCachedPortal,
	getCachedProfile,
	getPortalAssets,
	getPortalUsers,
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

	const hasFetchedMeta = React.useRef(false);
	const authoritiesRef = React.useRef(false);

	const [portals, setPortals] = React.useState<PortalHeaderType[] | null>(null);
	const [invites, setInvites] = React.useState<PortalHeaderType[] | null>(null);
	const [usersByPortalId, setUsersByPortalId] = React.useState<{}>({});

	const [currentId, setCurrentId] = React.useState<string | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);
	const [permissions, setPermissions] = React.useState<PortalPermissionsType | null>(null);

	const [refreshCurrentTrigger, setRefreshCurrentTrigger] = React.useState<boolean>(false);
	const [refreshFields, setRefreshFields] = React.useState<PortalPatchMapEnum[] | null>(null);
	const [updating, setUpdating] = React.useState<boolean>(false);
	const [updateAvailable, setUpdateAvailable] = React.useState<boolean>(false);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);
	const [createNewPortal, setCreateNewPortal] = React.useState<boolean>(false);

	React.useEffect(() => {
		setCurrent(null);
		setPortals(null);
		if (!arProvider.walletAddress) {
			setPermissions(null);
		}
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		if (permawebProvider.profile?.id) {
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

								let data = cached;
								if (!data) {
									data = permawebProvider.libs.mapFromProcessCase(
										await permawebProvider.libs.readState({ processId: portal.id, path: PortalPatchMapEnum.Overview })
									);

									data.users = permawebProvider.libs.mapFromProcessCase(
										await permawebProvider.libs.readState({ processId: portal.id, path: PortalPatchMapEnum.Users })
									);
								}

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
					setPermissions({ base: false });
				}
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
				console.error(e);
				addNotification(e.message ?? 'An error occurred getting this portal', 'warning');
			}
		})();
	}, [current, currentId, permawebProvider.libs]);

	React.useEffect(() => {
		(async function () {
			if (current && refreshFields && refreshFields.length > 0) {
				await Promise.all(refreshFields.map((field) => fetchPortal({ patchKey: field })));
			}
		})();
	}, [refreshCurrentTrigger, refreshFields]);

	const fetchPortal = async (opts?: { patchKey?: string }) => {
		if (currentId) {
			const patchKeys = opts?.patchKey ? [opts.patchKey] : Object.keys(PORTAL_PATCH_MAP);

			setUpdating(true);
			await Promise.all(
				patchKeys.map(async (key) => {
					try {
						const data = permawebProvider.libs.mapFromProcessCase(
							await permawebProvider.libs.readState({ processId: currentId, path: key })
						);

						setCurrent((prevPortal) => {
							if (!prevPortal) {
								const newPortal: PortalDetailType = {
									id: currentId,
									name: null,
									logo: null,
									icon: null,
									assets: null,
									requests: null,
									categories: null,
									topics: null,
									links: null,
									uploads: null,
									fonts: null,
									themes: null,
									users: null,
									pages: null,
									layout: null,
									roleOptions: null,
									permissions: null,
									domains: null,
								};
								prevPortal = newPortal;
							}

							const updatedPortal = { ...prevPortal };

							switch (key) {
								case 'overview':
									if (
										data.authorities &&
										!data.authorities.includes(AO_NODE.authority) &&
										permawebProvider.libs?.updateZoneAuthorities &&
										!authoritiesRef.current
									) {
										authoritiesRef.current = true;
										permawebProvider.libs.updateZoneAuthorities({
											zoneId: currentId,
											authorityId: AO_NODE.authority,
										});
									}

									/* Check for portal version update */
									if (
										data.version !== CurrentZoneVersion &&
										arProvider.wallet &&
										arProvider.walletAddress === data.owner
									) {
										setUpdateAvailable(true);
									} else setUpdateAvailable(false);

									updatedPortal.name = data.name ?? updatedPortal.name;
									updatedPortal.logo = data.logo ?? updatedPortal.logo;
									updatedPortal.icon = data.icon ?? updatedPortal.icon;
									break;
								case 'users':
									updatedPortal.roleOptions = data.roleOptions ?? updatedPortal.roleOptions;
									updatedPortal.permissions = data.permissions ?? updatedPortal.permissions;
									if (data.roles) {
										updatedPortal.users = getPortalUsers(data.roles);
										if (permawebProvider.profile?.id && updatedPortal.users) {
											setPermissions(
												getUserPermissions(
													permawebProvider.profile.id,
													updatedPortal.users,
													data.permissions ?? updatedPortal.permissions
												)
											);
										}
									}
									break;
								case 'presentation':
									updatedPortal.layout = data.layout ?? updatedPortal.layout;
									updatedPortal.pages = data.pages ?? updatedPortal.pages;
									updatedPortal.themes = data.themes ?? updatedPortal.themes;
									updatedPortal.fonts = data.fonts ?? updatedPortal.fonts;
									break;
								case 'navigation':
									updatedPortal.categories = data.categories ?? updatedPortal.categories ?? [];
									updatedPortal.topics = data.topics ?? updatedPortal.topics ?? [];
									updatedPortal.links = data.links ?? updatedPortal.links ?? [];
									updatedPortal.domains = data.domains ?? updatedPortal.domains ?? [];
									break;
								case 'media':
									updatedPortal.uploads = data.uploads ?? updatedPortal.uploads ?? [];
									break;
								case 'posts':
									updatedPortal.assets = getPortalAssets(data?.index);
									break;
								case 'requests':
									updatedPortal.requests = data?.indexRequests ?? updatedPortal.requests;
									break;
							}

							cachePortal(currentId, updatedPortal);

							return updatedPortal;
						});
					} catch (e) {
						console.warn(`Failed to fetch patch data for ${key}:`, e);
					}
				})
			);
			setUpdating(false);
		}
	};

	function getUserPermissions(address: string, users: PortalUserType[], permissions: PortalPermissionsType) {
		const user = users?.find((user: PortalUserType) => user.address === address);

		if (!user) return { base: false };

		if (user?.roles) {
			const hasPermission = (permissonKeys: string | string[]) => {
				const keys = Array.isArray(permissonKeys) ? permissonKeys : [permissonKeys];
				const allowedRoles = keys.flatMap((key) => permissions?.[key] ?? []);
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
