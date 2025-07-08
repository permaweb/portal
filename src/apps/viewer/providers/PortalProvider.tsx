import React from 'react';
import { useLocation } from 'react-router-dom';

import { PortalDetailType } from 'helpers/types';
import { cachePortal, getCachedPortal, getPortalAssets, getPortalIdFromURL } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

interface PortalContextState {
	current: PortalDetailType | null;
	updating: boolean;
}

const DEFAULT_CONTEXT = {
	current: null,
	updating: false,
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

	React.useEffect(()=> {
		const portalId = getPortalIdFromURL();
		if (portalId) setCurrentId(portalId);
		else {
			// TODO: Get ArNS Resolved ID from Domain
		}
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

				const portal: PortalDetailType = {
					id: currentId,
					name: portalData.store?.name ?? 'None',
					logo: portalData.store?.logo ?? 'None',
					assets: getPortalAssets(portalData?.store?.index),
					categories: portalData?.store?.categories ?? [],
					topics: portalData?.store?.topics ?? [],
					links: portalData?.store?.links ?? [],
					fonts: portalData?.store?.fonts ?? {},
					themes: portalData?.store?.themes ?? [],
				};

				return portal;
			} catch (e: any) {
				console.error(e);
				throw new Error('An error occurred getting this portal.');
			}
		}
	};

	return (
		<PortalContext.Provider
			value={{
				current,
				updating,
			}}
		>
			{props.children}
		</PortalContext.Provider>
	);
}
