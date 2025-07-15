import React from 'react';
import { useLocation } from 'react-router-dom';

import { Types } from '@permaweb/libs';

import { PortalDetailType, PortalUserType } from 'helpers/types';
import {
	cachePortal,
	cacheProfile,
	getCachedPortal,
	getCachedProfile,
	getPortalAssets,
	getPortalIdFromURL,
} from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

interface PortalContextState {
	current: PortalDetailType | null;
	updating: boolean;
	fetchUserProfile: (address: string) => Types.ProfileType;
}

const DEFAULT_CONTEXT = {
	current: null,
	updating: false,
	fetchUserProfile: (_address: string) => {},
};

const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

export function PortalProvider(props: { children: React.ReactNode }) {
	const location = useLocation();

	const permawebProvider = usePermawebProvider();

	const [currentId, setCurrentId] = React.useState<string | null>(null);
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);

	const [updating, setUpdating] = React.useState<boolean>(false);
	const [_errorMessage, setErrorMessage] = React.useState<string | null>(null);

	React.useEffect(() => {
		(async function () {
			const portalId = getPortalIdFromURL();
			if (portalId) setCurrentId(portalId);
			else {
				try {
					const resolvedId = (await fetch(window.location.host)).headers.get('X-Arns-Resolved-Id');
					setCurrentId(resolvedId);
				} catch (e: any) {}
			}
		})();
	}, [location.pathname]);

	React.useEffect(() => {
		(async function () {
			try {
				if (!current && currentId && permawebProvider.libs) {
					const cachedPortal = getCachedPortal(currentId);
					if (cachedPortal) {
						setCurrent(cachedPortal);
					}

					setUpdating(true);
					const fetchedPortal = await fetchPortal();
					if (fetchedPortal) {
						setCurrent(fetchedPortal);
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

				const portal: PortalDetailType = {
					id: currentId,
					name: portalData.store?.name ?? 'None',
					logo: portalData.store?.logo ?? 'None',
					icon: portalData.store?.icon ?? 'None',
					users: users || [],
					assets: getPortalAssets(portalData?.store?.index),
					categories: portalData?.store?.categories ?? [],
					topics: portalData?.store?.topics ?? [],
					links: portalData?.store?.links ?? [],
					fonts: portalData?.store?.fonts ?? {},
					themes: portalData?.store?.themes ?? [],
					layout: portalData?.store?.layout ?? null
				};

				return portal;
			} catch (e: any) {
				console.error(e);
				throw new Error('An error occurred getting this portal.');
			}
		}
	};

	console.log(current)

	async function fetchUserProfile(address: string): Promise<Types.ProfileType> {
		try {
			let profile: Types.ProfileType | null = null;
			if (address === permawebProvider.profile?.id) {
				profile = { ...permawebProvider.profile };
			} else {
				profile = getCachedProfile(address);
				if (!profile) {
					profile = await permawebProvider.libs.getProfileById(address);
					cacheProfile(address, profile);
				}
			}

			return profile;
		} catch (e: any) {
			console.error(e);
		}
	}

	return (
		<PortalContext.Provider
			value={{
				current,
				updating,
				fetchUserProfile,
			}}
		>
			{props.children}
		</PortalContext.Provider>
	);
}
