import React from 'react';

import { Notification } from 'components/atoms/Notification';
import {
	PortalDetailType,
} from 'helpers/types';
import { cachePortal, getCachedPortal, getPortalAssets } from 'helpers/utils';
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
	const permawebProvider = usePermawebProvider();

	const [currentId, _setCurrentId] = React.useState<string | null>('bTAWoSpXtX5LU_2-dcLiAj7_Y6Gp3lNMPUSc3-6VnSA');
	const [current, setCurrent] = React.useState<PortalDetailType | null>(null);
	
	const [updating, setUpdating] = React.useState<boolean>(false);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
					themes: portalData?.store?.themes ?? []
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
			{errorMessage && <Notification type={'warning'} message={errorMessage} callback={() => setErrorMessage(null)} />}
		</PortalContext.Provider>
	);
}
