import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CurrentZoneVersion } from '@permaweb/libs';

import { PortalManager } from 'editor/components/organisms/PortalManager';
import { WordPressImport } from 'editor/components/organisms/WordPressImport';

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
	checkValidAddress,
	debugLog,
	filterRemoved,
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
import { replaceFeaturedImage, replaceImageUrlsInContent } from 'helpers/wordpressImageUpload';
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
	setShowWordPressImport: (toggle: boolean, createPortal?: boolean) => void;
	wordPressImportCreatePortal: boolean;
	wordPressImportData: { data: PortalImportData; posts: ConvertedPost[]; pages: ConvertedPost[] } | null;
	importWordPress: (
		data: PortalImportData,
		posts: ConvertedPost[],
		pages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean,
		selectedTopics?: Set<string>,
		createPortal?: boolean,
		uploadedImageUrls?: Map<string, string>,
		redirectPath?: string,
		redirectToCreate?: boolean,
		mediaOverrides?: {
			logoId?: string | null;
			iconId?: string | null;
			wallpaperId?: string | null;
		}
	) => Promise<void>;
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
	setShowWordPressImport(_toggle: boolean, _createPortal?: boolean) {},
	wordPressImportCreatePortal: false,
	wordPressImportData: null,
	importWordPress: async () => {},
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
	const [wordPressImportCreatePortal, setWordPressImportCreatePortal] = React.useState<boolean>(false);
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
			} else {
				setPermissions({ base: false });
				setCurrentId(null);
				setCurrent(null);
				setUsersByPortalId({});
				setRefreshFields(null);
				setUpdating(false);
				setUpdateAvailable(false);
				setShowPortalManager(false);
				setCreateNewPortal(false);
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

	const fetchPortal = async (opts?: {
		patchKey?: string;
		patchKeys?: string[];
		portalId?: string;
	}): Promise<PortalDetailType | void> => {
		const idToFetch = opts?.portalId ?? currentId;
		if (!idToFetch) return;

		setUpdating(true);
		try {
			let overview, users, navigation, presentation, media, posts, requests, monetization, transfers;

			if (opts?.patchKeys && opts.patchKeys.length > 0) {
				const responses = await Promise.all(
					opts.patchKeys.map((key) =>
						permawebProvider.libs
							.readState({
								processId: idToFetch,
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
							processId: idToFetch,
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
					zoneId: idToFetch,
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
					permawebProvider.libs.updateZonePatchMap({ ...PORTAL_PATCH_MAP }, idToFetch);
				} catch (e: any) {
					debugLog('error', 'PortalProvider', 'Failed to update portal patch map:', e.message ?? 'Unknown error');
				}
			}

			setUpdateAvailable(
				isVersionGreater(CurrentZoneVersion, overview?.version) &&
					arProvider.wallet &&
					arProvider.walletAddress === overview?.owner
			);

			const portalState: PortalDetailType = filterRemoved({
				id: idToFetch,
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
				postPreviews: presentation?.layout?.postPreviews ?? presentation?.postPreviews ?? current?.postPreviews ?? {},
				users: users?.roles ? getPortalUsers(users.roles) : current?.users ?? null,
				roleOptions: users?.roleOptions ?? current?.roleOptions ?? null,
				permissions: users?.permissions ?? current?.permissions ?? null,
				domains: navigation?.domains ?? current?.domains ?? [],
				monetization: monetization ?? current?.monetization ?? null,
				transfers: transfers?.transfers ?? current?.transfers ?? [],
			});

			if (permawebProvider.profile?.id && portalState.users) {
				const userPermissions = getUserPermissions(
					permawebProvider.profile.id,
					portalState.users,
					portalState.permissions
				);
				setPermissions(userPermissions);
				cachePermissions(idToFetch, permawebProvider.profile.id, userPermissions);
			}

			cachePortal(idToFetch, portalState);
			setCurrent(portalState);
			if (opts?.portalId) {
				setCurrentId(idToFetch);
			}
			return portalState;
		} catch (e: any) {
			console.error(e);
			debugLog('error', 'PortalProvider', 'Failed to fetch portal data:', e.message ?? 'Unknown error');
		} finally {
			setUpdating(false);
		}
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

	function handleShowWordPressImport(toggle: boolean, createPortal?: boolean) {
		setShowWordPressImport(toggle);
		setWordPressImportCreatePortal(createPortal ?? false);
	}

	async function handleWordPressImportComplete(
		data: PortalImportData,
		posts: ConvertedPost[],
		pages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean,
		selectedTopics?: Set<string>,
		createPortal?: boolean,
		uploadedImageUrls?: Map<string, string>,
		redirectPath?: string,
		redirectToCreate?: boolean,
		mediaOverrides?: {
			logoId?: string | null;
			iconId?: string | null;
			wallpaperId?: string | null;
		}
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
		// Note: Modal closing is now handled by WordPressImport component after import completes

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

				const resolveMediaOverride = async (id?: string | null) => {
					if (!id || !checkValidAddress(id)) return null;
					try {
						return await permawebProvider.libs.resolveTransaction(id);
					} catch (e: any) {
						debugLog('error', 'WordPressImport', `Failed to resolve media override: ${e.message}`);
						return null;
					}
				};

				const banner = await resolveMediaOverride(mediaOverrides?.logoId);
				const icon = await resolveMediaOverride(mediaOverrides?.iconId);
				const wallpaper = await resolveMediaOverride(mediaOverrides?.wallpaperId);

				if (banner) tags.push(getBootTag('Banner', banner));
				if (icon) tags.push(getBootTag('Thumbnail', icon));
				if (wallpaper) tags.push(getBootTag('Wallpaper', wallpaper));

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

				// Set default Layout, Pages, Theme, and Fonts (required for engine to render)
				const { LAYOUT, PAGES, THEME, FONT_OPTIONS } = await import('helpers/config');
				const defaultTheme = data.theme || THEME.DEFAULT;

				// Build Fonts object from extracted theme or use defaults
				// Portal expects format like "Montserrat:400,700" for each font
				const extractedFonts = data.extractedTheme?.fonts;
				const portalFonts = {
					headers: extractedFonts?.heading ? `${extractedFonts.heading}:400,700` : FONT_OPTIONS.headers[0],
					body: extractedFonts?.body ? `${extractedFonts.body}:400,700` : FONT_OPTIONS.body[0],
				};

				await permawebProvider.libs.updateZone(
					{
						Themes: [permawebProvider.libs.mapToProcessCase(defaultTheme)],
						Layout: permawebProvider.libs.mapToProcessCase(LAYOUT.JOURNAL),
						Pages: permawebProvider.libs.mapToProcessCase(PAGES.JOURNAL),
						Fonts: permawebProvider.libs.mapToProcessCase(portalFonts),
					},
					targetPortalId,
					arProvider.wallet
				);

				debugLog('info', 'WordPressImport', 'Set default Layout, Pages, Theme, and Fonts');

				permawebProvider.refreshProfile();
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			// Refresh current portal if we just created it or need to fetch it
			let portalToUpdate: PortalDetailType | null = current;
			if (createPortal || !portalToUpdate?.id || portalToUpdate.id !== targetPortalId) {
				const fetched = await fetchPortal({ patchKeys: [], portalId: targetPortalId });
				portalToUpdate = (fetched ?? current) as PortalDetailType | null;
			}

			if (!portalToUpdate?.id) {
				throw new Error('Failed to get portal for update');
			}

			// 1. Update portal with categories, topics, and theme
			const updates: any = {};
			const DEFAULT_TOPIC = 'Uncategorized';
			// Only import categories that user explicitly selected - no auto-import
			const effectiveCategoryIds = selectedCategories;

			// Update categories only if user selected some and createCategories is true
			if (createCategories && selectedCategories.size > 0 && data.categories && data.categories.length > 0) {
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

				// Collect effectiveCategoryIds ∪ ancestors (so hierarchy is valid)
				const selectedOrAncestors = new Set<string>();
				const collectSelectedAndAncestors = (cats: any[]): boolean => {
					let anyIncluded = false;
					for (const cat of cats) {
						const childIncluded = cat.children?.length ? collectSelectedAndAncestors(cat.children) : false;
						const include = effectiveCategoryIds.has(cat.id) || childIncluded;
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

			// Update topics (WordPress import only): only add tags that user explicitly selected.
			// If no topics selected but posts are being imported, ensure "Uncategorized" exists.
			// Use same shape as Topics component: array of { Value: string }.
			if (createTopics && selectedTopics && selectedTopics.size > 0 && data.topics && data.topics.length > 0) {
				const existingTopics = portalToUpdate.topics || [];
				const existingTopicValues = new Set(existingTopics.map((t: any) => t?.value ?? t?.Value ?? ''));
				const topicsToAdd = data.topics.filter((topic) => topic.value && selectedTopics.has(topic.value));
				const newTopics = topicsToAdd
					.filter((topic) => topic.value && !existingTopicValues.has(topic.value))
					.map((topic) => ({ Value: topic.value }));
				if (newTopics.length > 0) {
					const allTopics = [...existingTopics.map((t: any) => ({ Value: t?.value ?? t?.Value ?? '' })), ...newTopics];
					updates.Topics = allTopics;
				}
			} else if (posts.length > 0) {
				// No topics selected but importing posts - ensure "Uncategorized" exists
				const existingTopics = portalToUpdate.topics || [];
				if (!existingTopics.some((t: any) => (t?.value ?? t?.Value ?? '') === DEFAULT_TOPIC)) {
					updates.Topics = [
						...existingTopics.map((t: any) => ({ Value: t?.value ?? t?.Value ?? '' })),
						{ Value: DEFAULT_TOPIC },
					];
				}
			}

			// Update theme if we have one - replace any existing "Imported Theme" or add as new
			if (data.theme) {
				const existingThemes = portalToUpdate.themes || [];
				const newTheme = permawebProvider.libs.mapToProcessCase(data.theme);
				// Remove any existing imported themes and deactivate others when adding new active theme
				const filteredThemes = existingThemes
					.filter((t: any) => t?.name !== 'Imported Theme' && t?.Name !== 'Imported Theme')
					.map((t: any) => ({ ...t, active: false, Active: false }));
				updates.Themes = [...filteredThemes, newTheme];
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

			// 2. Auto-create each selected post (categories and topics already exist on portal)
			const excludeFromIndex = JSON.stringify([
				'Balances',
				'Ticker',
				'Process-Type',
				'Total-Supply',
				'Transferable',
				'Metadata.Content',
			]);
			// Use profile id, or when creating portal without profile use the new portal id (portal-as-profile)
			const effectiveProfileId = permawebProvider.profile?.id ?? profileId;
			const useAutoIndex = createPortal || permissions?.postAutoIndex;
			const useRequestIndex = !useAutoIndex && permissions?.postRequestIndex;

			for (const post of posts) {
				try {
					const postCategories = createCategories
						? post.categories.filter((cat) => effectiveCategoryIds.has(cat.id))
						: [];
					// Only include topics that user explicitly selected
					// If no topics selected or post has no matching topics, use "Uncategorized" as fallback
					let postTopics =
						createTopics && selectedTopics && selectedTopics.size > 0
							? post.topics.filter((t) => selectedTopics.has(t))
							: [];
					// Ensure we always have at least one topic (required by the system)
					if (postTopics.length === 0) {
						postTopics = [DEFAULT_TOPIC];
					}
					const slug = post.slug || urlify(post.title);
					const releaseDate = post.dateCreated ?? Date.now();

					// Replace image URLs in content if we have uploaded images
					let postContent = post.content;
					let postThumbnail = post.thumbnail;
					if (uploadedImageUrls && uploadedImageUrls.size > 0) {
						postContent = replaceImageUrlsInContent(post.content, uploadedImageUrls);
						postThumbnail = replaceFeaturedImage(post.thumbnail, uploadedImageUrls);
					}

					let postData: any = permawebProvider.libs.mapToProcessCase({
						name: post.title,
						description: post.description,
						status: 'published',
						content: postContent,
						topics: postTopics,
						categories: postCategories,
						creator: effectiveProfileId,
						url: slug,
						releaseDate: String(releaseDate),
						originPortal: portalToUpdate.id,
					});

					// Use the (possibly replaced) thumbnail
					const thumbnailToUse = postThumbnail || post.thumbnail;
					if (thumbnailToUse && checkValidAddress(thumbnailToUse)) {
						try {
							postData.Thumbnail = await permawebProvider.libs.resolveTransaction(thumbnailToUse);
						} catch {
							// skip thumbnail if resolve fails (e.g. external URL)
						}
					}

					const args = {
						name: post.title,
						description: post.description,
						topics: postTopics,
						creator: effectiveProfileId,
						data: PORTAL_POST_DATA(),
						contentType: ASSET_UPLOAD.contentType,
						assetType: ASSET_UPLOAD.ansType,
						users: [portalToUpdate.id],
						spawnComments: true,
					};

					const assetId = await permawebProvider.libs.createAtomicAsset(args, (status: any) =>
						debugLog('info', 'WordPressImport', `Creating post "${post.title}": ${status}`)
					);

					await permawebProvider.libs.sendMessage({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						tags: [{ name: 'Exclude-Index', value: excludeFromIndex }],
						data: postData,
					});

					if ((useAutoIndex || useRequestIndex) && effectiveProfileId) {
						const internalIndexAction = useAutoIndex ? 'Add-Index-Id' : 'Add-Index-Request';
						const zoneResult = await permawebProvider.libs.sendMessage({
							processId: effectiveProfileId,
							wallet: arProvider.wallet,
							action: 'Run-Action',
							tags: [
								{ name: 'Forward-To', value: portalToUpdate.id },
								{ name: 'Forward-Action', value: internalIndexAction },
								{ name: 'Index-Id', value: assetId },
							],
							data: { Input: {} },
							returnResult: true,
						});

						if (useAutoIndex && zoneResult?.Messages?.length > 0) {
							await permawebProvider.libs.sendMessage({
								processId: assetId,
								wallet: arProvider.wallet,
								action: 'Send-Index',
								tags: [
									{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
									{ name: 'Date-Added', value: String(releaseDate) },
									{ name: 'Exclude', value: excludeFromIndex },
								],
								data: { Recipients: [portalToUpdate.id] },
							});
						}
					}

					debugLog('info', 'WordPressImport', `Created post: ${assetId}`);
				} catch (err: any) {
					debugLog('error', 'WordPressImport', `Failed to create post "${post.title}": ${err?.message}`);
					addNotification(`Failed to create post "${post.title}": ${err?.message ?? 'Unknown error'}`, 'warning');
				}
			}

			if (posts.length > 0) {
				refreshCurrentPortal([PortalPatchMapEnum.Posts, PortalPatchMapEnum.Requests]);
				if (redirectToCreate) {
					navigate(URLS.portalCreate(portalToUpdate.id));
				} else {
					navigate(redirectPath ?? `${URLS.base}${portalToUpdate.id}`);
				}
				addNotification(
					createPortal
						? `Portal created and ${posts.length} post${posts.length !== 1 ? 's' : ''} imported.`
						: `${posts.length} post${posts.length !== 1 ? 's' : ''} imported.`,
					'success'
				);
			}

			// 3. Create pages and add to portal
			if (pages.length > 0 && permissions?.updatePortalMeta && effectiveProfileId) {
				const currentPages = portalToUpdate.pages || {};
				const updatedPages = { ...currentPages };

				for (const page of pages) {
					try {
						const args = {
							name: page.title,
							description: page.description,
							topics: [],
							creator: effectiveProfileId,
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
						portalToUpdate.id,
						arProvider.wallet
					);
					refreshCurrentPortal(PortalPatchMapEnum.Presentation);
				}
			}

			// 4. Register uploaded images in portal's media library
			if (uploadedImageUrls && uploadedImageUrls.size > 0 && portalToUpdate?.id) {
				try {
					const currentUploads = portalToUpdate.uploads || [];
					const newUploads = Array.from(uploadedImageUrls.entries()).map(([_originalUrl, arweaveUrl]) => {
						// Extract txId from arweave URL (https://arweave.net/txId)
						const txId = arweaveUrl.split('/').pop() || arweaveUrl;
						return {
							tx: txId,
							type: 'image',
							dateUploaded: Date.now().toString(),
						};
					});

					const updatedUploads = [...currentUploads, ...newUploads];

					await permawebProvider.libs.updateZone(
						{ Uploads: permawebProvider.libs.mapToProcessCase(updatedUploads) },
						portalToUpdate.id,
						arProvider.wallet
					);

					debugLog('info', 'WordPressImport', `Registered ${newUploads.length} images in media library`);
					refreshCurrentPortal(PortalPatchMapEnum.Media);
				} catch (err: any) {
					debugLog('error', 'WordPressImport', `Failed to register images in media library: ${err?.message}`);
					// Non-fatal error - images are still uploaded, just not in media library
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

	const importWordPress = async (
		data: PortalImportData,
		posts: ConvertedPost[],
		pages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean,
		selectedTopics?: Set<string>,
		createPortal?: boolean,
		uploadedImageUrls?: Map<string, string>,
		redirectPath?: string,
		redirectToCreate?: boolean,
		mediaOverrides?: {
			logoId?: string | null;
			iconId?: string | null;
			wallpaperId?: string | null;
		}
	) =>
		handleWordPressImportComplete(
			data,
			posts,
			pages,
			selectedCategories,
			createCategories,
			createTopics,
			selectedTopics,
			createPortal,
			uploadedImageUrls,
			redirectPath,
			redirectToCreate,
			mediaOverrides
		);

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
				wordPressImportCreatePortal,
				wordPressImportData,
				importWordPress,
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
				createPortal={wordPressImportCreatePortal || !current?.id}
				onImportComplete={(
					data,
					posts,
					pages,
					selectedCategories,
					createCategories,
					createTopics,
					selectedTopics,
					uploadedImageUrls
				) =>
					handleWordPressImportComplete(
						data,
						posts,
						pages,
						selectedCategories,
						createCategories,
						createTopics,
						selectedTopics,
						wordPressImportCreatePortal || !current?.id,
						uploadedImageUrls
					)
				}
			/>
		</PortalContext.Provider>
	);
}
