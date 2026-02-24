import React from 'react';

import Arweave from 'arweave';
import Permaweb, { Types } from '@permaweb/libs/browser';
import { connect, createSigner } from '@permaweb/aoconnect/browser';

import { AO_NODE, STORAGE } from 'helpers/config';
import { cacheProfile as cacheProfileById } from 'helpers/utils';

import { useWalletProvider } from './WalletBridgeProvider';

interface PermawebContextState {
	deps: any;
	libs: any;
	profile: Types.ProfileType;
	profileLoading: boolean;
	refreshProfile: () => void;
}

const DEFAULT_CONTEXT: PermawebContextState = {
	deps: null,
	libs: null,
	profile: null,
	profileLoading: false,
	refreshProfile() {},
};

const PermawebContext = React.createContext<PermawebContextState>(DEFAULT_CONTEXT);

export function usePermawebProvider(): PermawebContextState {
	return React.useContext(PermawebContext);
}

export function WidgetPermawebProvider(props: { children: React.ReactNode }) {
	const { wallet, walletAddress } = useWalletProvider();
	const prevWalletRef = React.useRef<string | null>(null);

	const [deps, setDeps] = React.useState<any>(null);
	const [libs, setLibs] = React.useState<any>(null);
	const [profile, setProfile] = React.useState<Types.ProfileType | null>(null);
	const [profileLoading, setProfileLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		try {
			const aoConnection = import.meta.env.VITE_AO ?? 'legacy';

			let signer = null;
			if (wallet) signer = createSigner(wallet);

			let ao: any;
			if (aoConnection === 'mainnet') {
				const config: any = { MODE: 'mainnet', URL: AO_NODE.url, SCHEDULER: AO_NODE.scheduler };
				if (signer) config.signer = signer;
				ao = connect(config);
			} else if (import.meta.env.VITE_AO === 'legacy') {
				ao = connect({ MODE: 'legacy' });
			}

			const dependencies = {
				ao: ao,
				arweave: Arweave.init({}),
				signer: signer,
				node: { ...AO_NODE },
			};

			setDeps(dependencies);
			const initializedLibs = Permaweb.init(dependencies);
			setLibs(initializedLibs);
		} catch (error) {
			console.error('[Widget] Error in PermawebProvider initialization:', error);
		}
	}, [wallet]);

	React.useEffect(() => {
		(async function () {
			if (!walletAddress) {
				setProfile(null);
				setProfileLoading(false);
				prevWalletRef.current = null;
				return;
			}

			if (!libs?.getProfileByWalletAddress) return;

			const walletChanged = prevWalletRef.current !== walletAddress;
			if (walletChanged) {
				setProfile(null);
				setProfileLoading(true);
				prevWalletRef.current = walletAddress;
			}

			const cachedProfile = getCachedProfile(walletAddress);
			if (cachedProfile?.id) {
				setProfile(normalizeProfile(cachedProfile));
			}

			try {
				const freshProfile = await libs.getProfileByWalletAddress(walletAddress);
				if (freshProfile) {
					const normalized = normalizeProfile(freshProfile);
					setProfile(normalized);
					cacheLocal(walletAddress, normalized);
					if (normalized?.id) {
						cacheProfileById(normalized.id, normalized);
					}
				}
			} catch (e: any) {
				console.error('[Widget] Failed to fetch profile:', e);
			} finally {
				setProfileLoading(false);
			}
		})();
	}, [walletAddress, libs?.getProfileByWalletAddress]);

	const refreshProfile = React.useCallback(async () => {
		if (wallet && walletAddress && libs) {
			try {
				const newProfile = await libs.getProfileByWalletAddress(walletAddress);
				if (newProfile) {
					const normalized = normalizeProfile(newProfile);
					setProfile(normalized);
					cacheLocal(walletAddress, normalized);
					if (normalized.id) {
						cacheProfileById(normalized.id, normalized);
					}
				}
			} catch (error) {
				console.error('[Widget] Error refreshing profile:', error);
			}
		}
	}, [wallet, walletAddress, libs]);

	function normalizeProfile(p: any) {
		if (!p) return p;
		const { displayname, ...rest } = p;
		return {
			...rest,
			displayName: rest.displayName || displayname || '',
		};
	}

	function getCachedProfile(address: string) {
		const cached = localStorage.getItem(STORAGE.profileByWallet(address));
		return cached ? normalizeProfile(JSON.parse(cached)) : null;
	}

	function cacheLocal(address: string, profileData: any) {
		if (profileData) {
			const { roles, ...profileWithoutRoles } = profileData;
			localStorage.setItem(STORAGE.profileByWallet(address), JSON.stringify(profileWithoutRoles));
		}
	}

	return (
		<PermawebContext.Provider
			value={{
				deps,
				libs,
				profile,
				profileLoading,
				refreshProfile,
			}}
		>
			{props.children}
		</PermawebContext.Provider>
	);
}
