import React from 'react';

import Arweave from 'arweave';
import Permaweb, { Types } from '@permaweb/libs/browser';
import { connect, createSigner } from '@permaweb/aoconnect/browser';

import { Loader } from 'components/atoms/Loader';
import { AO_NODE, STORAGE } from 'helpers/config';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';
// import { ArconnectSigner } from '@ar.io/sdk';

interface PermawebContextState {
	deps: any;
	libs: any;
	profile: Types.ProfileType;
	handleInitialProfileCache: (address: string, profileId: string) => void;
	refreshProfile: () => void;
	setPortalRoles: (roles: string[]) => void;
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
	const [refreshProfileTrigger, setRefreshProfileTrigger] = React.useState<boolean>(false);
	const [profilePending, setProfilePending] = React.useState<boolean>(false);

	React.useEffect(() => {
		try {
			const aoConnection = import.meta.env.VITE_AO ?? 'legacy';

			// const signer = new ArconnectSigner(arProvider.wallet);
			let signer = null;
			if (arProvider.wallet) signer = createSigner(arProvider.wallet);

			let ao: any;
			if (aoConnection === 'mainnet') {
				if (!signer) {
					// Don't initialize in mainnet mode without a signer
					return;
				}
				ao = connect({ MODE: 'mainnet', URL: AO_NODE.url, SCHEDULER: AO_NODE.scheduler, signer });
			} else if (import.meta.env.VITE_AO === 'legacy') {
				ao = connect({ MODE: 'legacy' });
			}

			const dependencies = {
				ao: ao,
				arweave: Arweave.init({}),
				signer: signer,
				node: {
					...AO_NODE,
					authority: 'https://ao.arweave.dev',
				},
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

	React.useEffect(() => {
		(async function () {
			if (arProvider.wallet && arProvider.walletAddress) {
				const fetchProfileUntilChange = async () => {
					let changeDetected = false;
					let tries = 0;
					const maxTries = 10;

					while (!changeDetected && tries < maxTries) {
						try {
							const existingProfile = profile;
							const newProfile = await resolveProfile(arProvider.walletAddress);

							if (newProfile && JSON.stringify(existingProfile) !== JSON.stringify(newProfile)) {
								setProfile(newProfile);
								cacheProfile(arProvider.walletAddress, newProfile);
								changeDetected = true;
							} else {
								await new Promise((resolve) => setTimeout(resolve, 1000));
								tries++;
							}
						} catch (error) {
							console.error(error);
							break;
						}
					}

					if (!changeDetected) {
						console.warn(`No changes detected after ${maxTries} attempts`);
					}
				};

				await fetchProfileUntilChange();
			}
		})();
	}, [refreshProfileTrigger]);

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

					setRefreshProfileTrigger((prev) => !prev);
				}
			} catch (e: any) {
				console.error('Failed to update profile authorities:', e);
			}
		})();
	}, [profile?.id, AO_NODE.authority, libs?.updateZoneAuthorities]);

	async function resolveProfile(address: string) {
		if (libs) {
			try {
				let fetchedProfile: any;
				const cachedProfile = getCachedProfile(address);
				if (cachedProfile?.id) fetchedProfile = await libs.getProfileById(cachedProfile.id);
				else fetchedProfile = await libs.getProfileByWalletAddress(address);
				let profileToUse = { ...fetchedProfile };

				if (!fetchedProfile?.id && cachedProfile) profileToUse = cachedProfile;
				cacheProfile(address, profileToUse);

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
				refreshProfile: () => setRefreshProfileTrigger((prev) => !prev),
				setPortalRoles: (roles: string[]) => setPortalRoles(roles),
			}}
		>
			{props.children}
			{profilePending && <Loader message={`${language.waitingForProfile}...`} />}
		</PermawebContext.Provider>
	);
}
