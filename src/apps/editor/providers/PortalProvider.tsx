import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { CurrentZoneVersion } from '@permaweb/libs';

import { PortalManager } from 'editor/components/organisms/PortalManager';
import { WordPressImport } from 'editor/components/organisms/WordPressImport';
import { currentPostClear, currentPostUpdate, setOriginalData } from 'editor/store/post';

import { Panel } from 'components/atoms/Panel';
import { AO_NODE, ASSET_UPLOAD, PORTAL_PATCH_MAP, PORTAL_POST_DATA, URLS } from 'helpers/config';
import {
	PortalDetailType,
	PortalHeaderType,
	PortalPatchMapEnum,
	PortalPermissionsType,
	PortalUserType,
} from 'helpers/types';
import {
	cachePermissions,
	cachePortal,
	cacheProfile,
	debugLog,
	fixBooleanStrings,
	getCachedPermissions,
	getCachedPortal,
	getCachedProfile,
	getPortalAssets,
	getPortalUsers,
	isEqual,
	isVersionGreater,
	urlify,
} from 'helpers/utils';
import { ConvertedPost, PortalImportData } from 'helpers/wordpress';
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
	showWordPressImport: boolean;
	setShowWordPressImport: (toggle: boolean) => void;
	wordPressImportData: { data: PortalImportData; posts: ConvertedPost[]; pages: ConvertedPost[] } | null;
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
	showWordPressImport: false,
	setShowWordPressImport(_toggle: boolean) {},
	wordPressImportData: null,
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
	const navigate = useNavigate();
	const dispatch = useDispatch();

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
	const [showWordPressImport, setShowWordPressImport] = React.useState<boolean>(false);
	const [wordPressImportData, setWordPressImportData] = React.useState<{
		data: PortalImportData;
		posts: ConvertedPost[];
		pages: ConvertedPost[];
	} | null>(null);

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

					// Load cached permissions if available
					if (permawebProvider.profile?.id) {
						const cachedPerms = getCachedPermissions(currentId, permawebProvider.profile.id);
						if (cachedPerms) setPermissions(cachedPerms);
					}

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
					refreshFields.forEach((field) => {
						debugLog('info', 'PortalProvider', `Refreshing field ${field}`);
					});
					await fetchPortal({ patchKeys: refreshFields });
				} catch (e: any) {
					debugLog('error', 'PortalProvider', 'Error refreshing portal:', e.message ?? 'Unknown error');
				} finally {
					setRefreshFields(null);
				}
			}
		})();
	}, [refreshCurrentTrigger, refreshFields]);

	const fetchPortal = async (opts?: { patchKey?: string; patchKeys?: string[] }) => {
		if (!currentId) return;

		setUpdating(true);
		try {
			let overview, users, navigation, presentation, media, posts, requests, monetization, transfers;

			if (opts?.patchKeys && opts.patchKeys.length > 0) {
				const responses = await Promise.all(
					opts.patchKeys.map((key) =>
						permawebProvider.libs
							.readState({
								processId: currentId,
								path: key,
								hydrate: true,
							})
							.then((res) => ({ key, data: fixBooleanStrings(permawebProvider.libs.mapFromProcessCase(res)) }))
					)
				);

				const responseMap = responses.reduce((acc, { key, data }) => {
					acc[key] = data;
					return acc;
				}, {} as Record<string, any>);

				overview = responseMap[PortalPatchMapEnum.Overview]
					? parseField(
							PortalPatchMapEnum.Overview,
							responseMap[PortalPatchMapEnum.Overview],
							PortalPatchMapEnum.Overview
					  )
					: null;
				users = responseMap[PortalPatchMapEnum.Users]
					? parseField(PortalPatchMapEnum.Users, responseMap[PortalPatchMapEnum.Users], PortalPatchMapEnum.Users)
					: null;
				navigation = responseMap[PortalPatchMapEnum.Navigation]
					? parseField(
							PortalPatchMapEnum.Navigation,
							responseMap[PortalPatchMapEnum.Navigation],
							PortalPatchMapEnum.Navigation
					  )
					: null;
				presentation = responseMap[PortalPatchMapEnum.Presentation]
					? parseField(
							PortalPatchMapEnum.Presentation,
							responseMap[PortalPatchMapEnum.Presentation],
							PortalPatchMapEnum.Presentation
					  )
					: null;
				media = responseMap[PortalPatchMapEnum.Media]
					? parseField(PortalPatchMapEnum.Media, responseMap[PortalPatchMapEnum.Media], PortalPatchMapEnum.Media)
					: null;
				posts = responseMap[PortalPatchMapEnum.Posts]
					? parseField(PortalPatchMapEnum.Posts, responseMap[PortalPatchMapEnum.Posts], PortalPatchMapEnum.Posts)
					: null;
				requests = responseMap[PortalPatchMapEnum.Requests]
					? parseField(
							PortalPatchMapEnum.Requests,
							responseMap[PortalPatchMapEnum.Requests],
							PortalPatchMapEnum.Requests
					  )
					: null;
				monetization = responseMap[PortalPatchMapEnum.Monetization]
					? parseField(
							PortalPatchMapEnum.Monetization,
							responseMap[PortalPatchMapEnum.Monetization],
							PortalPatchMapEnum.Monetization
					  )
					: null;
				transfers = responseMap[PortalPatchMapEnum.Transfers]
					? parseField(
							PortalPatchMapEnum.Transfers,
							responseMap[PortalPatchMapEnum.Transfers],
							PortalPatchMapEnum.Transfers
					  )
					: null;
			} else {
				const response = fixBooleanStrings(
					permawebProvider.libs.mapFromProcessCase(
						await permawebProvider.libs.readState({
							processId: currentId,
							path: opts?.patchKey,
							hydrate: !!opts?.patchKey,
						})
					)
				);

				overview = parseField(PortalPatchMapEnum.Overview, response, opts?.patchKey);
				users = parseField(PortalPatchMapEnum.Users, response, opts?.patchKey);
				navigation = parseField(PortalPatchMapEnum.Navigation, response, opts?.patchKey);
				presentation = parseField(PortalPatchMapEnum.Presentation, response, opts?.patchKey);
				media = parseField(PortalPatchMapEnum.Media, response, opts?.patchKey);
				posts = parseField(PortalPatchMapEnum.Posts, response, opts?.patchKey);
				requests = parseField(PortalPatchMapEnum.Requests, response, opts?.patchKey);
				monetization = parseField(PortalPatchMapEnum.Monetization, response, opts?.patchKey);
				transfers = parseField(PortalPatchMapEnum.Transfers, response, opts?.patchKey);
			}

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
				isVersionGreater(CurrentZoneVersion, overview?.version) &&
					arProvider.wallet &&
					arProvider.walletAddress === overview?.owner
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
				const userPermissions = getUserPermissions(
					permawebProvider.profile.id,
					portalState.users,
					portalState.permissions
				);
				setPermissions(userPermissions);
				cachePermissions(currentId, permawebProvider.profile.id, userPermissions);
			}

			cachePortal(currentId, portalState);
			setCurrent(portalState);
		} catch (e: any) {
			console.error(e);
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
			// If profile is already loaded in state, skip fetching
			if (usersByPortalId?.[user.address]) {
				return;
			}

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

	function handleShowWordPressImport(toggle: boolean) {
		setShowWordPressImport(toggle);
	}

	async function handleWordPressImportComplete(
		data: PortalImportData,
		posts: ConvertedPost[],
		pages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean,
		createPortal?: boolean
	) {
		if (!arProvider.wallet) {
			addNotification('Please connect your wallet to import content', 'warning');
			return;
		}

		// If creating a portal, we need a profile (or create portal as profile)
		let profileId = permawebProvider.profile?.id;
		if (createPortal && !profileId && !arProvider.walletAddress) {
			addNotification('Please connect your wallet to create a portal', 'warning');
			return;
		}

		// If not creating portal, we need an existing portal
		if (!createPortal && !current?.id) {
			addNotification('Please select or create a portal first', 'warning');
			return;
		}

		let targetPortalId = current?.id;

		setWordPressImportData({ data, posts, pages });
		setShowWordPressImport(false);

		// Start the import process
		try {
			addNotification(createPortal ? 'Creating portal from WordPress...' : 'Starting WordPress import...', 'info');

			// If creating a portal, create it first
			if (createPortal) {
				const { PORTAL_DATA, PORTAL_PATCH_MAP } = await import('helpers/config');
				const { PORTAL_ROLES } = await import('helpers/config');

				const getBootTag = (key: string, value: string) => ({
					name: `Zone-${key}`,
					value,
				});

				const getPatchMapTag = (key: string, values: string[]) => {
					const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
					return {
						name: `Zone-Patch-Map-${capitalizedKey}`,
						value: JSON.stringify(values),
					};
				};

				const tags = [
					getBootTag('Name', data.name || 'Imported Portal'),
					{ name: 'Content-Type', value: 'text/html' },
					{ name: 'Zone-Type', value: 'Portal' },
				];

				for (const key of Object.keys(PORTAL_PATCH_MAP)) {
					tags.push(getPatchMapTag(key, PORTAL_PATCH_MAP[key]));
				}

				// Use site logo/icon if available (would need to fetch from media)
				// For now, leave as None

				if (!profileId) {
					tags.push({ name: 'Zone-Type', value: 'User' });
					tags.push(getBootTag('Username', data.name || 'Imported Portal'));
					tags.push(getBootTag('DisplayName', data.name || 'Imported Portal'));
					tags.push(getBootTag('Description', data.description || ''));
				}

				targetPortalId = await permawebProvider.libs.createZone(
					{
						tags: tags,
						data: PORTAL_DATA(),
						spawnModeration: false,
						authUsers: [arProvider.walletAddress],
					},
					(status: any) => debugLog('info', 'WordPressImport', status)
				);

				debugLog('info', 'WordPressImport', `Created portal: ${targetPortalId}`);

				if (!profileId) profileId = targetPortalId;

				// Set roles
				await permawebProvider.libs.setZoneRoles(
					[
						{
							granteeId: arProvider.walletAddress,
							roles: [PORTAL_ROLES.ADMIN],
							type: 'wallet',
							sendInvite: false,
							remoteZonePath: 'Portals',
						},
						{
							granteeId: profileId,
							roles: [PORTAL_ROLES.ADMIN],
							type: 'process',
							sendInvite: false,
							remoteZonePath: 'Portals',
						},
					],
					targetPortalId,
					arProvider.wallet
				);

				// Add to profile
				const currentPortals = Array.isArray(permawebProvider.profile?.portals) ? permawebProvider.profile.portals : [];
				const updatedPortals = [...currentPortals, { Id: targetPortalId, Name: data.name || 'Imported Portal' }];
				await permawebProvider.libs.updateZone(
					{ Portals: permawebProvider.libs.mapToProcessCase(updatedPortals) },
					profileId,
					arProvider.wallet
				);

				permawebProvider.refreshProfile();
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Refresh current portal if we just created it or need to fetch it
			let portalToUpdate = current;
			if (createPortal || !portalToUpdate?.id || portalToUpdate.id !== targetPortalId) {
				await fetchPortal(targetPortalId, { patchKeys: [] });
				// Get the updated portal from state
				portalToUpdate = current;
			}

			if (!portalToUpdate?.id) {
				throw new Error('Failed to get portal for update');
			}

			// 1. Update portal with categories, topics, and theme
			const updates: any = {};

			// Update categories if we have any and createCategories is true
			if (createCategories && data.categories && data.categories.length > 0) {
				const existingCategories = portalToUpdate.categories || [];

				// Flatten existing tree to get all ids (we only had roots before)
				const existingIds = new Set<string>();
				const flattenExisting = (cats: any[]) => {
					cats.forEach((cat: any) => {
						if (cat?.id) existingIds.add(cat.id);
						if (cat?.children?.length) flattenExisting(cat.children);
					});
				};
				flattenExisting(existingCategories);

				// Collect selected ∪ ancestors of selected (so hierarchy is valid)
				const selectedOrAncestors = new Set<string>();
				const collectSelectedAndAncestors = (cats: any[]): boolean => {
					let anyIncluded = false;
					for (const cat of cats) {
						const childIncluded = cat.children?.length ? collectSelectedAndAncestors(cat.children) : false;
						const include = selectedCategories.has(cat.id) || childIncluded;
						if (include) {
							selectedOrAncestors.add(cat.id);
							anyIncluded = true;
						}
					}
					return anyIncluded;
				};
				collectSelectedAndAncestors(data.categories);

				// Build new tree (only selected + ancestors) from data.categories, preserving hierarchy
				const buildNewSubtree = (cats: any[]): any[] => {
					const out: any[] = [];
					for (const cat of cats) {
						if (!selectedOrAncestors.has(cat.id)) continue;
						if (existingIds.has(cat.id)) continue;
						const children = cat.children?.length ? buildNewSubtree(cat.children) : [];
						out.push({
							id: cat.id,
							name: cat.name,
							parent: cat.parent || undefined,
							metadata: cat.metadata || {},
							children,
						});
					}
					return out;
				};
				const newTreeRoots = buildNewSubtree(data.categories);

				// Zone expects full tree: existing (unchanged) + new roots
				const mergedRoots = [...existingCategories, ...newTreeRoots];
				updates.Categories = permawebProvider.libs.mapToProcessCase(mergedRoots);
			}

			// Update topics if we have any and createTopics is true
			if (createTopics && data.topics && data.topics.length > 0) {
				const existingTopics = portalToUpdate.topics || [];
				const existingTopicValues = new Set(existingTopics.map((t: any) => t.value));
				const newTopics = data.topics
					.filter((topic) => !existingTopicValues.has(topic.value))
					.map((topic) => ({ Value: topic.value }));
				const allTopics = [...existingTopics.map((t: any) => ({ Value: t.value })), ...newTopics];
				updates.Topics = permawebProvider.libs.mapToProcessCase(allTopics);
			}

			// Update theme if we have one
			if (data.theme) {
				const existingThemes = portalToUpdate.themes || [];
				const newTheme = permawebProvider.libs.mapToProcessCase(data.theme);
				updates.Themes = [...existingThemes, newTheme];
			}

			// Update portal metadata if we have site info (always set for new portals)
			if (data.name && (createPortal || !portalToUpdate.name)) {
				updates.Name = data.name;
			}
			if (data.description && (createPortal || !portalToUpdate.description)) {
				updates.Description = data.description;
			}

			// Apply portal updates FIRST (categories and topics must exist before creating posts)
			if (Object.keys(updates).length > 0) {
				await permawebProvider.libs.updateZone(updates, portalToUpdate.id, arProvider.wallet);
				refreshCurrentPortal([
					PortalPatchMapEnum.Navigation,
					PortalPatchMapEnum.Overview,
					PortalPatchMapEnum.Presentation,
				]);
				addNotification('Portal updated with categories, topics, and theme', 'success');

				// Wait a moment for the portal state to update
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// 2. Open first post in editor instead of creating
			if (posts.length > 0) {
				const firstPost = posts[0];

				// Clear current post state
				dispatch(currentPostClear());

				// Set post data in Redux store (only assign categories we created)
				const postCategories = createCategories
					? firstPost.categories.filter((cat) => selectedCategories.has(cat.id))
					: [];
				const postTopics = createTopics ? firstPost.topics : [];
				const postData = {
					id: null,
					title: firstPost.title,
					description: firstPost.description,
					content: firstPost.content,
					creator: permawebProvider.profile.id,
					status: 'draft' as const,
					categories: postCategories,
					topics: postTopics,
					externalRecipients: [],
					thumbnail: firstPost.thumbnail,
					dateCreated: firstPost.dateCreated,
					lastUpdate: null,
					releaseDate: firstPost.dateCreated,
					authUsers: [],
					url: null,
				};

				// Update Redux state
				Object.keys(postData).forEach((key) => {
					dispatch(currentPostUpdate({ field: key, value: postData[key as keyof typeof postData] }));
				});

				// Set original data
				dispatch(setOriginalData(postData));

				// Navigate to post editor
				const portalId = portalToUpdate.id;
				navigate(`${URLS.base}${portalId}/post/create/article`);

				addNotification(
					`Opening "${firstPost.title}" in editor. ${
						posts.length > 1
							? `${posts.length - 1} more post${posts.length > 2 ? 's' : ''} will be available after.`
							: ''
					}`,
					'success'
				);
			}

			// 3. Create pages and add to portal
			if (pages.length > 0 && permissions?.updatePortalMeta) {
				const currentPages = current.pages || {};
				const updatedPages = { ...currentPages };

				for (const page of pages) {
					try {
						const args = {
							name: page.title,
							description: page.description,
							topics: [],
							creator: permawebProvider.profile.id,
							data: PORTAL_POST_DATA(),
							contentType: ASSET_UPLOAD.contentType,
							assetType: ASSET_UPLOAD.ansType,
							users: [],
							spawnComments: false,
						};

						const assetId = await permawebProvider.libs.createAtomicAsset(args, (status: any) =>
							debugLog('info', 'WordPressImport', `Creating page "${page.title}": ${status}`)
						);

						// Update asset with content
						const contentData = {
							content: page.content,
							thumbnail: page.thumbnail,
							status: page.status,
						};

						await permawebProvider.libs.sendMessage({
							processId: assetId,
							wallet: arProvider.wallet,
							action: 'Update-Asset',
							tags: [],
							data: contentData,
						});

						// Add to portal pages
						const pageSlug = urlify(page.title);
						updatedPages[pageSlug] = {
							type: 'static',
							id: assetId,
							name: page.title,
						};

						addNotification(`Created page: ${page.title}`, 'success');
					} catch (error: any) {
						debugLog('error', 'WordPressImport', `Failed to create page "${page.title}": ${error.message}`);
						addNotification(`Failed to create page "${page.title}": ${error.message}`, 'warning');
					}
				}

				// Update portal with pages
				if (Object.keys(updatedPages).length > Object.keys(currentPages).length) {
					await permawebProvider.libs.updateZone(
						{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
						current.id,
						arProvider.wallet
					);
					refreshCurrentPortal(PortalPatchMapEnum.Presentation);
				}
			}

			// Clear import data
			setWordPressImportData(null);

			// Refresh portal to show new content
			refreshCurrentPortal();
		} catch (error: any) {
			debugLog('error', 'WordPressImport', `Import failed: ${error.message}`);
			addNotification(`Import failed: ${error.message}`, 'warning', { persistent: true });
		}
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
				showWordPressImport,
				setShowWordPressImport: handleShowWordPressImport,
				wordPressImportData,
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
			<WordPressImport
				open={showWordPressImport}
				handleClose={() => setShowWordPressImport(false)}
				createPortal={!current?.id}
				onImportComplete={(data, posts, pages, selectedCategories, createCategories, createTopics) =>
					handleWordPressImportComplete(
						data,
						posts,
						pages,
						selectedCategories,
						createCategories,
						createTopics,
						!current?.id
					)
				}
			/>
		</PortalContext.Provider>
	);
}
