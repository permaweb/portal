import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CurrentZoneVersion } from '@permaweb/libs';

import { PortalManager } from 'editor/components/organisms/PortalManager';
import { WordPressImport } from 'editor/components/organisms/WordPressImport';

import { Panel } from 'components/atoms/Panel';
import { AO_NODE, ASSET_UPLOAD, PORTAL_PATCH_MAP, PORTAL_POST_DATA, URLS } from 'helpers/config';
import { IS_BASE_MODE, PORTAL_CAPABILITIES } from 'helpers/features';
import { registerPortalUpload } from 'helpers/portalMedia';
import {
	ArticleStatusType,
	PortalDetailType,
	PortalHeaderType,
	PortalPatchMapEnum,
	PortalPermissionsType,
	PortalUploadType,
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
	resolvePrimaryDomain,
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
	setFeaturedPost: (postId: string, featured: boolean) => Promise<void>;
	reorderPosts: (postIds: string[]) => Promise<void>;
	setPostStatus: (postId: string, status: ArticleStatusType) => Promise<void>;
	openCurrentPortalSite: () => Promise<void>;
	refreshCurrentPortal: (field?: PortalPatchMapEnum | PortalPatchMapEnum[]) => void;
	addPortalUpload: (upload: PortalUploadType) => Promise<void>;
	fetchPortalUserProfile: (user: PortalUserType) => void;
	usersByPortalId: any;
	updating: boolean;
	loadError: string | null;
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
	setFeaturedPost: async () => {},
	reorderPosts: async () => {},
	setPostStatus: async () => {},
	openCurrentPortalSite: async () => {},
	refreshCurrentPortal() {},
	addPortalUpload: async () => {},
	fetchPortalUserProfile(_user: PortalUserType) {},
	usersByPortalId: {},
	updating: false,
	loadError: null,
	updateAvailable: false,
};

const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

function mergePostPreviews(...values: unknown[]) {
	return values.reduce<Record<string, any>>((result, value) => {
		if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
		return { ...result, ...(value as Record<string, any>) };
	}, {});
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
	const portalsRequestRef = React.useRef(0);
	const portalHeadersRef = React.useRef(new Map<string, PortalHeaderType>());
	const externalUsersRequestsRef = React.useRef(new Map<string, { libs: any; promise: Promise<any> }>());
	const userProfileRequestsRef = React.useRef(new Map<string, Promise<void>>());
	const routePortalId = location.pathname.split('/').filter(Boolean)[0] || null;
	const portalSessionRef = React.useRef({
		walletAddress: arProvider.walletAddress,
		portalId: routePortalId,
		libs: permawebProvider.libs,
	});
	if (
		portalSessionRef.current.walletAddress !== arProvider.walletAddress ||
		portalSessionRef.current.portalId !== routePortalId ||
		portalSessionRef.current.libs !== permawebProvider.libs
	) {
		// Each visit has its own identity, including when returning to the same portal.
		portalSessionRef.current = {
			walletAddress: arProvider.walletAddress,
			portalId: routePortalId,
			libs: permawebProvider.libs,
		};
	}

	const [portals, setPortals] = React.useState<PortalHeaderType[] | null>(null);
	const [invites, setInvites] = React.useState<PortalHeaderType[] | null>(null);
	const [usersByPortalId, setUsersByPortalId] = React.useState<{}>({});

	const [currentId, setCurrentId] = React.useState<string | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);
	const currentRef = React.useRef(current);
	currentRef.current = current;
	const mediaWritesRef = React.useRef<Promise<void>>(Promise.resolve());
	const [permissions, setPermissions] = React.useState<PortalPermissionsType | null>(null);
	const [transfers, _setTransfers] = React.useState<any>([]);

	const [refreshCurrentTrigger, setRefreshCurrentTrigger] = React.useState<boolean>(false);
	const [refreshFields, setRefreshFields] = React.useState<PortalPatchMapEnum[] | null>(null);
	const [updating, setUpdating] = React.useState<boolean>(false);
	const [loadError, setLoadError] = React.useState<string | null>(null);
	const [portalLoadTrigger, setPortalLoadTrigger] = React.useState(0);
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
		setCurrentId(null);
		setPortals(null);
		setInvites(null);
		setUsersByPortalId({});
		setLoadError(null);
		portalsRequestRef.current += 1;
		portalHeadersRef.current.clear();
		if (!arProvider.walletAddress) {
			setPermissions(null);
		}
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		let cancelled = false;
		if (permawebProvider.profile?.id) {
			const requestId = ++portalsRequestRef.current;
			const profilePortals = permawebProvider.profile?.portals ?? [];
			const routePortalId = location.pathname.split('/').filter(Boolean)[0] || null;
			// Profile data is enough for portal cards. External user lists are only needed
			// while composing a cross-portal post, so avoid loading every portal on home.
			const hydrateExternalPortalUsers =
				PORTAL_CAPABILITIES.CROSS_POSTING && /\/post\/(?:create|edit)(?:\/|$)/.test(location.pathname);
			const portalHeaders = profilePortals.map((portal: PortalHeaderType) => {
				const hydrated = portalHeadersRef.current.get(portal.id);
				const cached = getCachedPortal(portal.id);
				return {
					...cached,
					...hydrated,
					...portal,
					name: portal.name ?? hydrated?.name ?? cached?.name ?? 'None',
					logo: portal.logo ?? portal.banner ?? hydrated?.logo ?? cached?.logo ?? null,
					icon: portal.icon ?? portal.thumbnail ?? hydrated?.icon ?? cached?.icon ?? null,
					users: portal.users?.length
						? portal.users
						: portal.roles?.length
						? portal.roles
						: hydrated?.users ?? cached?.users ?? [],
				};
			});

			setPortals(portalHeaders);
			setInvites(permawebProvider.profile?.invites ?? []);

			const headersToHydrate = hydrateExternalPortalUsers
				? portalHeaders.filter(
						(portal: PortalHeaderType) =>
							portal.id !== routePortalId &&
							!portalHeadersRef.current.has(portal.id) &&
							!portal.users?.length &&
							!portal.roles?.length
				  )
				: [];

			if (headersToHydrate.length > 0) {
				(async () => {
					const updated: PortalHeaderType[] = [];
					let cursor = 0;
					const workers = Array.from({ length: Math.min(2, headersToHydrate.length) }, async () => {
						while (!cancelled && cursor < headersToHydrate.length) {
							const portal = headersToHydrate[cursor++];
							try {
								let request = externalUsersRequestsRef.current.get(portal.id);
								if (request?.libs !== permawebProvider.libs) {
									const promise = permawebProvider.libs
										.readState({ processId: portal.id, path: PortalPatchMapEnum.Users, hydrate: true })
										.then((response: any) =>
											parseField(
												PortalPatchMapEnum.Users,
												fixBooleanStrings(permawebProvider.libs.mapFromProcessCase(response)),
												PortalPatchMapEnum.Users
											)
										);
									request = { libs: permawebProvider.libs, promise };
									externalUsersRequestsRef.current.set(portal.id, request);
									void promise
										.finally(() => {
											if (externalUsersRequestsRef.current.get(portal.id)?.promise === promise) {
												externalUsersRequestsRef.current.delete(portal.id);
											}
										})
										.catch(() => {});
								}
								const users = await request.promise;
								if (cancelled) return;
								const hydrated = {
									...portal,
									users: users?.users ?? getPortalUsers(users?.roles),
								};
								portalHeadersRef.current.set(portal.id, hydrated);
								updated.push(hydrated);
							} catch (e) {
								if (cancelled) return;
								debugLog(
									'warn',
									'PortalProvider',
									`Failed to fetch portal metadata for ${portal.id}:`,
									e.message ?? 'Unknown error'
								);
								const cached = getCachedPortal(portal.id);
								if (cached) {
									const hydrated = {
										...portal,
										name: cached.name ?? portal.name ?? 'None',
										logo: cached.logo ?? portal.logo ?? 'None',
										icon: cached.icon ?? portal.icon ?? 'None',
										users: cached.users ?? portal.roles ?? [],
									};
									portalHeadersRef.current.set(portal.id, hydrated);
									updated.push(hydrated);
									continue;
								}
								updated.push(portal);
							}
						}
					});
					await Promise.all(workers);
					if (!cancelled && portalsRequestRef.current === requestId) {
						const hydratedById = new Map(updated.map((portal) => [portal.id, portal]));
						setPortals(
							(currentPortals) =>
								currentPortals?.map((portal) => hydratedById.get(portal.id) ?? portal) ?? currentPortals
						);
					}
				})();
			}
		}
		return () => {
			cancelled = true;
		};
	}, [
		arProvider.walletAddress,
		permawebProvider.profile?.id,
		permawebProvider.profile?.portals,
		permawebProvider.profile?.invites,
		location.pathname,
		permawebProvider.libs,
	]);

	React.useEffect(() => {
		if (portals !== null) {
			const routePortalId = location.pathname.split('/').filter(Boolean)[0] || null;
			const currentPortal = portals.find((portal) => portal.id === routePortalId);
			const portalIdToLoad =
				currentPortal?.id || (IS_BASE_MODE && routePortalId && checkValidAddress(routePortalId) ? routePortalId : null);
			if (portalIdToLoad) {
				if (currentId !== portalIdToLoad) {
					setLoadError(null);
					setPermissions(null);
					setCurrentId(portalIdToLoad);
					setCurrent(null);
				}
			} else {
				setLoadError(null);
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
		if (
			!currentId ||
			currentId !== routePortalId ||
			!permawebProvider.libs ||
			!arProvider.walletAddress ||
			!permawebProvider.profile?.id
		)
			return;

		let cancelled = false;
		let retryTimer: ReturnType<typeof setTimeout>;
		const session = portalSessionRef.current;
		const isCurrent = () => !cancelled && portalSessionRef.current === session;
		const cachedPortal = getCachedPortal(currentId);
		if (cachedPortal && currentRef.current?.id !== currentId) setCurrent(cachedPortal);
		const permissionAddress = IS_BASE_MODE ? arProvider.walletAddress : permawebProvider.profile.id;
		const cachedPerms = getCachedPermissions(currentId, permissionAddress);
		// Base permissions must come from a complete replay. Persisted permissions
		// may include a denial produced by an earlier, incomplete content load.
		if (IS_BASE_MODE) setPermissions(null);
		else if (cachedPerms) setPermissions(cachedPerms);
		setLoadError(null);

		const load = async (attempt: number) => {
			try {
				await fetchPortal({ isCurrent });
			} catch (error: any) {
				if (!isCurrent()) return;
				if (attempt < 2) {
					retryTimer = setTimeout(() => void load(attempt + 1), 1000 * (attempt + 1));
				} else {
					setLoadError(error.message ?? 'Unable to load this portal. Please try again.');
				}
			}
		};
		void load(0);
		return () => {
			cancelled = true;
			clearTimeout(retryTimer);
		};
	}, [
		currentId,
		routePortalId,
		permawebProvider.libs,
		arProvider.walletAddress,
		permawebProvider.profile?.id,
		portalLoadTrigger,
	]);

	React.useEffect(() => {
		(async function () {
			if (current?.id === routePortalId && refreshFields && refreshFields.length > 0) {
				try {
					refreshFields.forEach((field) => {
						debugLog('info', 'PortalProvider', `Refreshing field ${field}`);
					});
					await fetchPortal({ patchKeys: refreshFields });
				} catch (e: any) {
					debugLog('error', 'PortalProvider', 'Error refreshing portal:', e.message ?? 'Unknown error');
				} finally {
					setRefreshFields((fields) => (fields === refreshFields ? null : fields));
				}
			}
		})();
	}, [refreshCurrentTrigger, refreshFields]);

	const fetchPortal = async (opts?: {
		patchKey?: string;
		patchKeys?: string[];
		portalId?: string;
		isCurrent?: () => boolean;
	}): Promise<PortalDetailType | void> => {
		const idToFetch = opts?.portalId ?? currentId;
		if (!idToFetch) return;
		const session = portalSessionRef.current;
		if (!opts?.portalId && session.portalId !== idToFetch) return;
		const sessionIsCurrent = () => portalSessionRef.current === session && (!opts?.isCurrent || opts.isCurrent());
		if (!sessionIsCurrent()) return;

		setUpdating(true);
		try {
			let overview, users, navigation, presentation, media, posts, requests, monetization, transfers;

			if (opts?.patchKeys && opts.patchKeys.length > 0) {
				const responses = await Promise.all(
					[...new Set(opts.patchKeys)].map((key) =>
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

			// A completed request for the previous route must not replace the active portal.
			if (!sessionIsCurrent()) return;
			if (
				!opts?.patchKey &&
				!opts?.patchKeys?.length &&
				(!overview || typeof overview !== 'object' || !users?.roles || typeof users.roles !== 'object')
			) {
				throw new Error('Portal data is not available yet. Please try again.');
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
				!IS_BASE_MODE &&
					isVersionGreater(CurrentZoneVersion, overview?.version) &&
					arProvider.wallet &&
					arProvider.walletAddress === overview?.owner
			);

			const previous = currentRef.current?.id === idToFetch ? currentRef.current : null;
			const portalState: PortalDetailType = filterRemoved({
				id: idToFetch,
				mode: overview?.mode ?? (IS_BASE_MODE ? 'base' : 'process'),
				manifestTxId: overview?.manifestTxId ?? previous?.manifestTxId ?? null,
				rootTxId: overview?.rootTxId ?? previous?.rootTxId ?? null,
				siteTxId: overview?.siteTxId ?? previous?.siteTxId ?? null,
				engineReferenceId: overview?.engineReference ?? previous?.engineReferenceId ?? null,
				name: overview?.name ?? previous?.name ?? null,
				logo: overview?.banner ?? overview?.logo ?? previous?.logo ?? null,
				icon: overview?.thumbnail ?? overview?.icon ?? previous?.icon ?? null,
				wallpaper: overview?.wallpaper ?? previous?.wallpaper ?? null,
				owner: overview?.owner ?? previous?.owner ?? null,
				moderation: overview?.moderation ?? previous?.moderation ?? null,
				assets: posts?.index ? getPortalAssets(posts.index) : previous?.assets ?? [],
				featuredPosts: posts?.featuredPosts ?? previous?.featuredPosts ?? [],
				requests: requests?.indexRequests ?? previous?.requests ?? null,
				categories: navigation?.categories ?? previous?.categories ?? [],
				topics: navigation?.topics ?? previous?.topics ?? [],
				links: navigation?.links ?? previous?.links ?? [],
				uploads: media?.uploads ?? previous?.uploads ?? [],
				fonts: presentation?.fonts ?? previous?.fonts ?? null,
				themes: presentation?.themes ?? previous?.themes ?? null,
				pages: presentation?.pages ?? previous?.pages ?? null,
				layout: presentation?.layout ?? previous?.layout ?? null,
				postPreviews: mergePostPreviews(
					presentation?.postPreviews === undefined ? previous?.postPreviews : undefined,
					presentation?.layout?.postPreviews,
					presentation?.postPreviews
				),
				users: users?.roles ? getPortalUsers(users.roles) : previous?.users ?? null,
				roleOptions: users?.roleOptions ?? previous?.roleOptions ?? null,
				permissions: users?.permissions ?? previous?.permissions ?? null,
				domains: navigation?.domains ?? previous?.domains ?? [],
				monetization: monetization ?? previous?.monetization ?? null,
				transfers: transfers?.transfers ?? previous?.transfers ?? [],
			});

			const permissionAddress = IS_BASE_MODE ? arProvider.walletAddress : permawebProvider.profile?.id;
			if (permissionAddress && portalState.users) {
				const userPermissions = getUserPermissions(permissionAddress, portalState.users, portalState.permissions);
				setPermissions(userPermissions);
				cachePermissions(idToFetch, permissionAddress, userPermissions);
			}

			cachePortal(idToFetch, portalState);
			const portalHeader: PortalHeaderType = {
				...(portalHeadersRef.current.get(idToFetch) || {}),
				id: idToFetch,
				name: portalState.name,
				mode: portalState.mode,
				manifestTxId: portalState.manifestTxId,
				rootTxId: portalState.rootTxId,
				siteTxId: portalState.siteTxId,
				engineReferenceId: portalState.engineReferenceId,
				logo: portalState.logo,
				icon: portalState.icon,
				users: portalState.users,
			};
			portalHeadersRef.current.set(idToFetch, portalHeader);
			setPortals(
				(currentPortals) =>
					currentPortals?.map((portal) => (portal.id === idToFetch ? { ...portal, ...portalHeader } : portal)) ??
					currentPortals
			);
			setCurrent(portalState);
			if (opts?.portalId) {
				setCurrentId(idToFetch);
			}
			return portalState;
		} catch (e: any) {
			if (!sessionIsCurrent()) return;
			debugLog('error', 'PortalProvider', 'Failed to fetch portal data:', e.message ?? 'Unknown error');
			if (Array.isArray(e.pendingTransactionIds)) {
				debugLog('error', 'PortalProvider', 'Blocking Arweave transactions:', e.pendingTransactionIds);
			}
			throw e;
		} finally {
			if (sessionIsCurrent()) setUpdating(false);
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
		if (!user.address || usersByPortalId?.[user.address]) return;
		const requestKey = `${arProvider.walletAddress ?? ''}:${user.address}`;
		const pending = userProfileRequestsRef.current.get(requestKey);
		if (pending) return pending;
		const walletAddress = arProvider.walletAddress;
		const request = (async () => {
			try {
				let profile: any = null;
				if (user.address === permawebProvider.profile?.id) {
					profile = { ...permawebProvider.profile };
				} else {
					profile = getCachedProfile(user.address);
					if (profile?.id) {
						setUsersByPortalId((prev) => ({ ...prev, [user.address]: profile }));
					}
					try {
						// Author/member labels need identity only, never that person's portal list.
						const freshProfile = await permawebProvider.libs.getProfileById(user.address, {
							hydrate: true,
							...(IS_BASE_MODE ? { includePortals: false } : {}),
						});
						if (freshProfile) {
							profile = freshProfile;
							cacheProfile(user.address, profile);
						}
					} catch (e: any) {
						debugLog('error', 'PortalProvider', 'Error fetching profile:', e.message ?? 'Unknown error');
					}
				}
				if (profile?.id && portalSessionRef.current.walletAddress === walletAddress) {
					setUsersByPortalId((prev) => ({ ...prev, [user.address]: profile }));
				}
			} catch (e: any) {
				debugLog('error', 'PortalProvider', 'Error fetching user profile:', e.message ?? 'Unknown error');
			}
		})();
		userProfileRequestsRef.current.set(requestKey, request);
		try {
			await request;
		} finally {
			if (userProfileRequestsRef.current.get(requestKey) === request) userProfileRequestsRef.current.delete(requestKey);
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
			addNotification(createPortal ? 'Creating portal from WordPress...' : 'Starting WordPress import...', 'success');

			// If creating a portal, create it first
			if (createPortal) {
				const { ENGINE_LITE_REFERENCE_ID, PORTAL_DATA, PORTAL_PATCH_MAP, THEME } = await import('helpers/config');
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
					getBootTag('EngineReference', ENGINE_LITE_REFERENCE_ID),
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
				const defaultTheme = data.theme || THEME.DEFAULT;

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
						data: PORTAL_DATA({ logo: banner, theme: defaultTheme, layout: 'blog' }),
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
				const updatedPortals = [
					...currentPortals,
					{
						Id: targetPortalId,
						Name: data.name || 'Imported Portal',
						EngineReference: ENGINE_LITE_REFERENCE_ID,
					},
				];
				await permawebProvider.libs.updateZone(
					{ Portals: permawebProvider.libs.mapToProcessCase(updatedPortals) },
					profileId,
					arProvider.wallet
				);

				// Set the default blog layout alongside the imported portal's theme and fonts.
				const { DEFAULT_FONTS, PAGES } = await import('helpers/config');

				// Build Fonts object from extracted theme or use defaults
				// Portal expects format like "Montserrat:400,700" for each font
				const extractedFonts = data.extractedTheme?.fonts;
				const portalFonts = {
					headers: extractedFonts?.heading ? `${extractedFonts.heading}:400,700` : DEFAULT_FONTS.headers,
					body: extractedFonts?.body ? `${extractedFonts.body}:400,700` : DEFAULT_FONTS.body,
				};

				await permawebProvider.libs.updateZone(
					{
						Themes: [permawebProvider.libs.mapToProcessCase(defaultTheme)],
						Layout: 'blog',
						Pages: permawebProvider.libs.mapToProcessCase(PAGES.JOURNAL),
						Fonts: permawebProvider.libs.mapToProcessCase(portalFonts),
					},
					targetPortalId,
					arProvider.wallet
				);

				debugLog('info', 'WordPressImport', 'Set default blog layout, Pages, Theme, and Fonts');

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

			// The compact schema has one palette containing both light and dark appearances.
			if (data.theme) {
				const newTheme = permawebProvider.libs.mapToProcessCase(data.theme);
				updates.Themes = [newTheme];
			}

			// Update portal metadata if we have site info (always set for new portals)
			if (data.name && (createPortal || !portalToUpdate.name)) {
				updates.Name = data.name;
			}
			if (data.description && (createPortal || !(portalToUpdate as any).description)) {
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
						...(IS_BASE_MODE ? { initialPostData: postData, portalId: portalToUpdate.id } : {}),
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
						const initialPageData = permawebProvider.libs.mapToProcessCase({
							name: page.title,
							description: page.description,
							content: page.content,
							thumbnail: page.thumbnail,
							status: page.status,
							creator: effectiveProfileId,
							originPortal: portalToUpdate.id,
						});
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
							...(IS_BASE_MODE ? { initialPostData: initialPageData, portalId: portalToUpdate.id } : {}),
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
		if (!field || !current) {
			setPortalLoadTrigger((previous) => previous + 1);
			return;
		}
		if (field) {
			const fieldsArray = Array.isArray(field) ? field : [field];
			setRefreshFields(fieldsArray);
		}
		setRefreshCurrentTrigger((prev) => !prev);
	};

	const addPortalUpload = async (upload: PortalUploadType) => {
		const portalId = current?.id;
		const walletAddress = arProvider.walletAddress;
		const write = mediaWritesRef.current
			.catch(() => undefined)
			.then(async () => {
				if (currentRef.current?.id !== portalId || portalSessionRef.current.walletAddress !== walletAddress) {
					throw new Error('The active portal or wallet changed. Please try again.');
				}
				const uploads = await registerPortalUpload({
					portalId,
					wallet: arProvider.wallet,
					libs: permawebProvider.libs,
					upload,
					uploads: currentRef.current?.uploads,
					waitForUpdate: permawebProvider.deps?.ao?.result
						? (message) => permawebProvider.deps.ao.result({ process: portalId, message })
						: undefined,
				});
				if (currentRef.current?.id !== portalId || portalSessionRef.current.walletAddress !== walletAddress) return;
				// Show confirmed media immediately; a fresh node read can still return the old uploads list.
				const updated = { ...currentRef.current, uploads };
				currentRef.current = updated;
				cachePortal(portalId, updated);
				setCurrent(updated);
			});
		mediaWritesRef.current = write;
		return write;
	};

	const openCurrentPortalSite = async () => {
		if (!current?.id) return;
		const popup = window.open('about:blank', '_blank');
		if (popup) popup.opener = null;
		try {
			let siteTxId = current.siteTxId;
			if (!current.domains?.length && (IS_BASE_MODE || current.mode === 'base')) {
				siteTxId = await permawebProvider.libs.ensurePortalSite(current.id);
				if (siteTxId !== current.siteTxId) {
					setCurrent((portal) => (portal ? { ...portal, siteTxId } : portal));
				}
			}
			const url = resolvePrimaryDomain(current.domains, current.id, siteTxId);
			if (popup) popup.location.replace(url);
			else window.open(url, '_blank', 'noopener,noreferrer');
		} catch (error: any) {
			popup?.close();
			addNotification(error.message ?? 'Unable to open this portal site', 'warning', { persistent: true });
		}
	};

	const setFeaturedPost = async (postId: string, featured: boolean) => {
		if (!current?.id || !arProvider.wallet) throw new Error('A portal and connected wallet are required');
		if (!permissions?.updatePortalMeta) throw new Error('You do not have permission to feature posts');

		const featuredPosts = featured ? [postId] : [];
		const updateId = await permawebProvider.libs.updateZone(
			{ FeaturedPosts: featuredPosts },
			current.id,
			arProvider.wallet
		);
		if (updateId && permawebProvider.deps?.ao?.result) {
			await permawebProvider.deps.ao.result({ process: current.id, message: updateId });
		}

		setCurrent((portal) => {
			if (!portal) return portal;
			const updated = { ...portal, featuredPosts };
			cachePortal(portal.id, updated);
			return updated;
		});
		refreshCurrentPortal(PortalPatchMapEnum.Posts);
	};

	const reorderPosts = async (postIds: string[]) => {
		if (!current?.id || !arProvider.wallet) throw new Error('A portal and connected wallet are required');
		if (!permissions?.updatePortalMeta) throw new Error('You do not have permission to reorder posts');

		const currentPosts = current.assets ?? [];
		const currentIds = new Set(currentPosts.map((post) => post.id));
		if (
			postIds.length !== currentPosts.length ||
			new Set(postIds).size !== postIds.length ||
			postIds.some((postId) => !currentIds.has(postId))
		) {
			throw new Error('The post list changed. Close this panel and try again.');
		}

		const postsById = new Map(currentPosts.map((post) => [post.id, post]));
		const orderedPosts = postIds.map((postId) => postsById.get(postId)!);
		const updateId = await permawebProvider.libs.updateZone(
			{ Index: permawebProvider.libs.mapToProcessCase(orderedPosts) },
			current.id,
			arProvider.wallet
		);
		if (updateId && permawebProvider.deps?.ao?.result && current.mode !== 'base') {
			await permawebProvider.deps.ao.result({ process: current.id, message: updateId });
		}

		setCurrent((portal) => {
			if (!portal) return portal;
			const updated = { ...portal, assets: orderedPosts as PortalDetailType['assets'] };
			cachePortal(portal.id, updated);
			return updated;
		});
		refreshCurrentPortal(PortalPatchMapEnum.Posts);
	};

	const setPostStatus = async (postId: string, status: ArticleStatusType) => {
		if (!current?.id || !arProvider.wallet) throw new Error('A portal and connected wallet are required');

		const post = current.assets?.find((asset) => asset.id === postId);
		const canEdit =
			permissions?.postAutoIndex ||
			permissions?.updatePostRequestStatus ||
			post?.creator === permawebProvider.profile?.id;
		if (!canEdit) throw new Error('You do not have permission to update this post');

		const excludeFromIndex = JSON.stringify([
			'Balances',
			'Ticker',
			'Process-Type',
			'Total-Supply',
			'Transferable',
			'Metadata.Content',
		]);
		const useAutoIndex = Boolean(permissions?.postAutoIndex);
		const updateResult = await permawebProvider.libs.sendMessage({
			processId: current.id,
			wallet: arProvider.wallet,
			action: useAutoIndex ? 'Run-Action' : 'Update-Asset-Through-Zone',
			tags: [
				{ name: 'Forward-To', value: postId },
				{ name: 'Forward-Action', value: 'Update-Asset' },
				{ name: 'Exclude-Index', value: excludeFromIndex },
			],
			data: { Input: permawebProvider.libs.mapToProcessCase({ status }) },
			...(useAutoIndex ? { returnResult: true } : {}),
		});
		if (typeof updateResult === 'string' && permawebProvider.deps?.ao?.result) {
			await permawebProvider.deps.ao.result({ process: current.id, message: updateResult });
		}

		setCurrent((portal) => {
			if (!portal) return portal;
			const updated = {
				...portal,
				assets: portal.assets?.map((asset) =>
					asset.id === postId ? { ...asset, metadata: { ...asset.metadata, status } } : asset
				),
			};
			cachePortal(portal.id, updated);
			return updated;
		});
		refreshCurrentPortal(PortalPatchMapEnum.Posts);
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
				setFeaturedPost,
				reorderPosts,
				setPostStatus,
				openCurrentPortalSite,
				refreshCurrentPortal: (field?: PortalPatchMapEnum | PortalPatchMapEnum[]) => refreshCurrentPortal(field),
				addPortalUpload,
				fetchPortalUserProfile: (userRole: PortalUserType) => fetchPortalUserProfile(userRole),
				usersByPortalId: usersByPortalId,
				updating,
				loadError,
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
