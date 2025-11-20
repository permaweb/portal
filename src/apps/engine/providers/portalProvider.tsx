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

export interface PortalContextState {
	portalId: string | null;
	portal: any;
	permissions: PortalPermissionsType | null;
	setPortalId: (portalId: string) => void;
	editorMode: string;
	setEditorMode: (mode: string) => void;
}

const DEFAULT_CONTEXT = {
	portalId: null,
	portal: null,
	permissions: null,
	setPortalId(_portalId: string) {},
	editorMode: 'hidden',
	setEditorMode(_mode: string) {},
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
				}}
			>
				{props.children}
			</PortalContext.Provider>
		</>
	);
}
