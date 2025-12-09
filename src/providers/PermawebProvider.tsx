import React from 'react';

import Arweave from 'arweave';
import Permaweb, { Types } from '@permaweb/libs/browser';
import { connect, createSigner } from '@permaweb/aoconnect/browser';

import { Loader } from 'components/atoms/Loader';
import { AO_NODE, STORAGE } from 'helpers/config';
import { cacheProfile as cacheProfileById } from 'helpers/utils';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';

interface PermawebContextState {
	deps: any;
	libs: any;
	profile: Types.ProfileType;
	handleInitialProfileCache: (address: string, profileId: string) => void;
	refreshProfile: () => void;
	setPortalRoles: (roles: string[]) => void;
	fetchProfile?: (address: string) => Promise<Types.ProfileType | undefined>;
}

const DEFAULT_CONTEXT = {
	deps: null,
	libs: null,
	profile: null,
	handleInitialProfileCache(_address: string, _profileId: string) {},
	refreshProfile() {},
	setPortalRoles(_roles: string[]) {},
};

const PermawebContext = React.createContext<PermawebContextState>(DEFAULT_CONTEXT);

export function usePermawebProvider(): PermawebContextState {
	return React.useContext(PermawebContext);
}

export function PermawebProvider(props: { children: React.ReactNode }) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const authoritiesRef = React.useRef(false);

	const [deps, setDeps] = React.useState<any>(null);
	const [libs, setLibs] = React.useState<any>(null);
	const [profile, setProfile] = React.useState<Types.ProfileType | null>(null);
	const [profilePending, setProfilePending] = React.useState<boolean>(false);

	React.useEffect(() => {
		try {
			const aoConnection = import.meta.env.VITE_AO ?? 'legacy';

			let signer = null;
			if (arProvider.wallet) signer = createSigner(arProvider.wallet);

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
			console.error('Error in PermawebProvider initialization:', error);
		}
	}, [arProvider.wallet]);

	React.useEffect(() => {
		(async function () {
			if (!arProvider.walletAddress) {
				setProfile(null);
				setProfilePending(false);
				return;
			}

			if (!libs?.getProfileByWalletAddress) {
				return;
			}

			const cachedProfile = getCachedProfile(arProvider.walletAddress);

			if (cachedProfile) {
				if (cachedProfile.status === 'pending') {
					setProfilePending(true);
				} else {
					setProfilePending(false);
				}
				setProfile(cachedProfile);
			}

			try {
				const freshProfile = await resolveProfile(arProvider.walletAddress);
				if (freshProfile) {
					setProfile(freshProfile);
					if (profilePending) setProfilePending(false);
				}
			} catch (e: any) {
				console.error('Failed to fetch fresh profile:', e);
			}
		})();
	}, [arProvider.walletAddress, libs?.getProfileByWalletAddress]);

	React.useEffect(() => {
		(async function () {
			if (!arProvider.walletAddress) {
				// Clear pending state when wallet disconnects
				setProfilePending(false);
				return;
			}

			if (profilePending) {
				const cachedProfile = getCachedProfile(arProvider.walletAddress);

				if (cachedProfile?.id) {
					try {
						const fetchedProfile = await libs.getProfileById(cachedProfile.id);

						setProfile(fetchedProfile);
						cacheProfile(arProvider.walletAddress, fetchedProfile);
						setProfilePending(false);
					} catch (e: any) {
						console.error(e);
					}
				}
			}
		})();
	}, [arProvider.walletAddress, profilePending]);

	const refreshProfile = React.useCallback(async () => {
		if (arProvider.wallet && arProvider.walletAddress) {
			try {
				const newProfile = await resolveProfile(arProvider.walletAddress, { hydrate: true });
				if (newProfile) {
					setProfile(newProfile);
					cacheProfile(arProvider.walletAddress, newProfile);
					if (newProfile.id) {
						cacheProfileById(newProfile.id, newProfile);
					}
				}
			} catch (error) {
				console.error(error);
			}
		}
	}, [arProvider.wallet, arProvider.walletAddress, profile]);

	/* Determine if the current authority has changed and if it is present in the profile.
		If it's not then add it to the profile authorities list
	*/
	React.useEffect(() => {
		if (authoritiesRef.current) return;

		(async function () {
			try {
				if (profile?.authorities && !profile?.authorities.includes(AO_NODE.authority) && libs?.updateZoneAuthorities) {
					authoritiesRef.current = true;

					await libs.updateZoneAuthorities({
						zoneId: profile.id,
						authorityId: AO_NODE.authority,
					});

					await refreshProfile();
				}
			} catch (e: any) {
				console.error('Failed to update profile authorities:', e);
			}
		})();
	}, [profile?.id, AO_NODE.authority, libs?.updateZoneAuthorities]);

	async function resolveProfile(address: string, opts?: { hydrate?: boolean }): Promise<Types.ProfileType | undefined> {
		if (libs) {
			try {
				let fetchedProfile: any;
				const cachedProfile = getCachedProfile(address);
				if (cachedProfile?.id) fetchedProfile = await libs.getProfileById(cachedProfile.id, opts);
				else fetchedProfile = await libs.getProfileByWalletAddress(address);
				let profileToUse = { ...fetchedProfile };

				if (!fetchedProfile?.id && cachedProfile) profileToUse = cachedProfile;
				cacheProfile(address, profileToUse);
				if (profileToUse?.id) {
					cacheProfileById(profileToUse.id, profileToUse);
				}

				return profileToUse;
			} catch (e: any) {
				console.error(e);
			}
		}
	}

	function getCachedProfile(address: string) {
		const cached = localStorage.getItem(STORAGE.profileByWallet(address));
		return cached ? JSON.parse(cached) : null;
	}

	function cacheProfile(address: string, profileData: any) {
		if (profileData) {
			// Don't cache portal-specific roles
			const { roles, ...profileWithoutRoles } = profileData;
			localStorage.setItem(STORAGE.profileByWallet(address), JSON.stringify(profileWithoutRoles));
		}
	}

	function handleInitialProfileCache(address: string, profileId: string) {
		cacheProfile(address, { id: profileId, status: 'pending' });
		setProfilePending(true);
	}

	function setPortalRoles(roles: string[]) {
		if (profile) {
			setProfile({ ...profile, roles });
		}
	}

	return (
		<PermawebContext.Provider
			value={{
				deps: deps,
				libs: libs,
				profile: profile,
				handleInitialProfileCache: (address: string, profileId: string) =>
					handleInitialProfileCache(address, profileId),
				refreshProfile: refreshProfile,
				setPortalRoles: (roles: string[]) => setPortalRoles(roles),
				fetchProfile: resolveProfile,
			}}
		>
			{props.children}
			{profilePending && <Loader message={`${language.waitingForProfile}...`} />}
		</PermawebContext.Provider>
	);
}
