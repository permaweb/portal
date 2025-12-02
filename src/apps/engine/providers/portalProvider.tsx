import React from 'react';
import { defaultLayout } from 'engine/defaults/layout.defaults';
import { defaultPages } from 'engine/defaults/pages.defaults';
// Temp
import { defaultThemes } from 'engine/defaults/theme.defaults';
import WebFont from 'webfontloader';

import { getTxEndpoint } from 'helpers/endpoints';
import { PortalPermissionsType, PortalUserType } from 'helpers/types';
import { cachePortal, getCachedPortal, getPortalUsers } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

export interface LayoutHeights {
	header: number;
	navigation: number;
	footer: number;
}

export interface LogoSettings {
	positionX: 'left' | 'center' | 'right';
	positionY: 'top' | 'center' | 'bottom';
	size: number;
}

export interface PortalContextState {
	portalId: string | null;
	portal: any;
	permissions: PortalPermissionsType | null;
	setPortalId: (portalId: string) => void;
	editorMode: string;
	setEditorMode: (mode: string) => void;
	layoutEditMode: boolean;
	setLayoutEditMode: (mode: boolean) => void;
	layoutHeights: LayoutHeights;
	setLayoutHeights: (heights: LayoutHeights) => void;
	logoSettings: LogoSettings;
	setLogoSettings: (settings: LogoSettings) => void;
	footerFixed: boolean;
	setFooterFixed: (fixed: boolean) => void;
	navSticky: boolean;
	setNavSticky: (sticky: boolean) => void;
}

const DEFAULT_LAYOUT_HEIGHTS: LayoutHeights = {
	header: 100,
	navigation: 50,
	footer: 230,
};

const DEFAULT_LOGO_SETTINGS: LogoSettings = {
	positionX: 'left',
	positionY: 'center',
	size: 80,
};

const DEFAULT_CONTEXT = {
	portalId: null,
	portal: null,
	permissions: null,
	setPortalId(_portalId: string) {},
	editorMode: 'hidden',
	setEditorMode(_mode: string) {},
	layoutEditMode: false,
	setLayoutEditMode(_mode: boolean) {},
	layoutHeights: DEFAULT_LAYOUT_HEIGHTS,
	setLayoutHeights(_heights: LayoutHeights) {},
	logoSettings: DEFAULT_LOGO_SETTINGS,
	setLogoSettings(_settings: LogoSettings) {},
	footerFixed: false,
	setFooterFixed(_fixed: boolean) {},
	navSticky: true,
	setNavSticky(_sticky: boolean) {},
};

export const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function useSetPortalId(id: string) {
	const context = React.useContext(PortalContext);

	React.useEffect(() => {
		if (context) {
			context.setPortalId(id);
		}
	}, [id, context]);
}

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

export function PortalProvider(props: { children: React.ReactNode }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const defaultPortal = { themes: defaultThemes, layout: defaultLayout, pages: defaultPages };

	const [portalId, setPortalId] = React.useState<string | null>(null);
	const [portal, setPortal] = React.useState(null);
	const [permissions, setPermissions] = React.useState<PortalPermissionsType | null>(null);
	const [editorMode, setEditorMode] = React.useState('hidden');
	const [layoutEditMode, setLayoutEditMode] = React.useState(false);
	const [layoutHeights, setLayoutHeights] = React.useState<LayoutHeights>(DEFAULT_LAYOUT_HEIGHTS);
	const [logoSettings, setLogoSettings] = React.useState<LogoSettings>(DEFAULT_LOGO_SETTINGS);
	const [footerFixed, setFooterFixed] = React.useState(false);
	const [navSticky, setNavSticky] = React.useState(true);

	React.useEffect(() => {
		if (!portalId || !permawebProvider.libs) return;

		(async () => {
			try {
				const cached = getCachedPortal(portalId);

				// Fetch from multiple endpoints
				const overview = permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({ processId: portalId, path: 'overview' })
				);
				const presentation = permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({ processId: portalId, path: 'presentation' })
				);
				const navigation = permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({ processId: portalId, path: 'navigation' })
				);
				const posts = permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({ processId: portalId, path: 'posts' })
				);
				const users = permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({ processId: portalId, path: 'users' })
				);
				const monetization = permawebProvider.libs.mapFromProcessCase(
					await permawebProvider.libs.readState({ processId: portalId, path: 'monetization' })
				);

				const portalUsers = users?.roles ? getPortalUsers(users.roles) : null;

				const userIdentifier = arProvider.walletAddress
					? permawebProvider.profile?.id || arProvider.walletAddress
					: null;

				if (userIdentifier && portalUsers && users?.permissions) {
					const currentPortalUser = portalUsers.find((user: PortalUserType) => user.address === userIdentifier);

					if (currentPortalUser?.roles && permawebProvider.profile) {
						permawebProvider.setPortalRoles(currentPortalUser.roles);
					}

					setPermissions(getUserPermissions(userIdentifier, portalUsers, users.permissions));
				} else {
					// Clear roles when no user is logged in
					if (permawebProvider.profile) {
						permawebProvider.setPortalRoles([]);
					}
					setPermissions({ base: false });
				}

				// Sort posts by release date and filter out future posts
				const sortedPosts = posts?.index
					? [...posts.index]
							.filter((post) => {
								const releaseDate = post.metadata?.releaseDate || post.dateCreated;
								const postDate = new Date(Number(releaseDate));
								const now = new Date();
								// Only include posts that have been released (not in the future)
								return postDate <= now;
							})
							.sort((a, b) => {
								const aDate = a.metadata?.releaseDate || a.dateCreated;
								const bDate = b.metadata?.releaseDate || b.dateCreated;
								// Sort descending (newest first)
								return Number(bDate) - Number(aDate);
							})
					: [];
				const zone = {
					...defaultPortal,
					...cached,
					name: overview?.name,
					logo: overview?.banner ?? overview?.logo,
					icon: overview?.thumbnail ?? overview?.icon ?? overview?.cover,
					wallpaper: overview?.wallpaper,
					moderation: overview?.moderation,
					layout: presentation?.layout,
					pages: presentation?.pages,
					themes: presentation?.themes,
					fonts: presentation?.fonts,
					categories: navigation?.categories,
					topics: navigation?.topics,
					links: navigation?.links,
					posts: sortedPosts,
					users: portalUsers,
					monetization: monetization,
				};

				const Name = zone?.name;
				const Categories = zone?.categories;
				const Layout = zone?.layout;
				const Pages = zone?.pages;
				const Posts = zone?.posts;
				const Themes = zone?.themes;
				const Links = zone?.links;
				const Logo = zone?.logo;
				const Icon = zone?.icon;
				const Wallpaper = zone?.wallpaper ? getTxEndpoint(zone?.wallpaper) : undefined;
				const Fonts = zone?.fonts;
				const Moderation = zone?.moderation;
				const Users = zone?.users;
				const Monetization = zone?.monetization?.monetization;
				const portalData = {
					Name,
					Categories,
					Layout,
					Pages,
					Themes,
					Posts,
					Links,
					Logo,
					Fonts,
					Icon,
					Wallpaper,
					Moderation,
					Users,
					Monetization,
				};
				console.log('portalData: ', portalData);
				setPortal(portalData);
				if (portalId && portalData) cachePortal(portalId, portalData);
			} catch (err) {
				console.error('Failed to fetch zone:', err);
				const cached = getCachedPortal(portalId);
				const zone = {
					...defaultPortal,
					...cached,
				};
				setPortal(zone);
			}
		})();
	}, [portalId, permawebProvider.libs, permawebProvider.profile?.id, arProvider.walletAddress]);

	React.useEffect(() => {
		if (portal?.Layout) {
			const layout = portal.Layout;
			const parseHeight = (h: string | number): number => {
				if (typeof h === 'number') return h;
				if (typeof h === 'string') return parseInt(h.replace('px', ''), 10) || 0;
				return 0;
			};
			setLayoutHeights({
				header: parseHeight(layout.header?.layout?.height) || DEFAULT_LAYOUT_HEIGHTS.header,
				navigation: parseHeight(layout.navigation?.layout?.height) || DEFAULT_LAYOUT_HEIGHTS.navigation,
				footer: parseHeight(layout.footer?.layout?.height) || DEFAULT_LAYOUT_HEIGHTS.footer,
			});
			const logoContent = layout.header?.content?.logo;
			if (logoContent) {
				const parseSize = (s: string | number): number => {
					if (typeof s === 'number') return s;
					if (typeof s === 'string') return parseInt(s.replace('%', ''), 10) || 80;
					return 80;
				};
				setLogoSettings({
					positionX: logoContent.positionX || DEFAULT_LOGO_SETTINGS.positionX,
					positionY: logoContent.positionY || DEFAULT_LOGO_SETTINGS.positionY,
					size: parseSize(logoContent.size),
				});
			}
			setFooterFixed(layout.footer?.layout?.fixed || false);
		}
	}, [portal?.Layout]);

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
				externalContributor: isExternalContributor,
			};
		}

		return null;
	}

	if (portal?.Fonts) {
		const fonts = portal?.Fonts;
		const families = [];

		if (fonts.headers) families.push(fonts.headers);
		if (fonts.body) families.push(fonts.body);

		if (families.length > 0) {
			WebFont.load({
				google: { families: families },
				active: () => {
					const [bodyFont, bodyWeight] = fonts.body.trim().split(':');
					const bodyWeights = bodyWeight.split(',');
					document.documentElement.style.setProperty('--font-body', bodyFont);
					document.documentElement.style.setProperty('--font-body-weight', bodyWeights[0]);
					document.documentElement.style.setProperty('--font-body-weight-bold', bodyWeights[1]);

					const [headerFont, headerWeight] = fonts.headers.trim().split(':');
					const headerWeights = headerWeight.split(',');
					document.documentElement.style.setProperty('--font-header', headerFont);
					document.documentElement.style.setProperty('--font-header-weight', headerWeights[0]);
					document.documentElement.style.setProperty('--font-header-weight-bold', headerWeights[1]);
				},
			});
		}
	}

	return (
		<>
			<PortalContext.Provider
				value={{
					portalId,
					portal,
					permissions,
					setPortalId,
					editorMode,
					setEditorMode,
					layoutEditMode,
					setLayoutEditMode,
					layoutHeights,
					setLayoutHeights,
					logoSettings,
					setLogoSettings,
					footerFixed,
					setFooterFixed,
					navSticky,
					setNavSticky,
				}}
			>
				{props.children}
			</PortalContext.Provider>
		</>
	);
}
