import React from 'react';

import Arweave from 'arweave';
import Permaweb, { Types } from '@permaweb/libs';
import { connect, createSigner } from '@permaweb/aoconnect';

import { ProfileManager } from 'editor/components/organisms/ProfileManager';

import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { STORAGE } from 'helpers/config';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';

interface PermawebContextState {
	deps: any;
	libs: any;
	profile: Types.ProfileType;
	showProfileManager: boolean;
	setShowProfileManager: (toggle: boolean) => void;
	handleInitialProfileCache: (address: string, profileId: string) => void;
	refreshProfile: () => void;
}

const DEFAULT_CONTEXT = {
	deps: null,
	libs: null,
	profile: null,
	showProfileManager: false,
	setShowProfileManager(_toggle: boolean) {},
	handleInitialProfileCache(_address: string, _profileId: string) {},
	refreshProfile() {},
};

const PermawebContext = React.createContext<PermawebContextState>(DEFAULT_CONTEXT);

export function usePermawebProvider(): PermawebContextState {
	return React.useContext(PermawebContext);
}

export function PermawebProvider(props: { children: React.ReactNode }) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [deps, setDeps] = React.useState<any>(null);
	const [libs, setLibs] = React.useState<any>(null);
	const [profile, setProfile] = React.useState<Types.ProfileType | null>(null);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [refreshProfileTrigger, setRefreshProfileTrigger] = React.useState<boolean>(false);
	const [profilePending, setProfilePending] = React.useState<boolean>(false);

	React.useEffect(() => {
		const dependencies = {
			ao: connect({ MODE: 'legacy' }),
			arweave: Arweave.init({}),
			signer: arProvider.wallet ? createSigner(arProvider.wallet) : null,
		};

		setDeps(dependencies);
		setLibs(Permaweb.init(dependencies));
	}, [arProvider.wallet]);

	React.useEffect(() => {
		(async function () {
			if (arProvider.walletAddress) {
				const cachedProfile = getCachedProfile(arProvider.walletAddress);

				if (cachedProfile) {
					if (cachedProfile.status && cachedProfile.status === 'pending') {
						setProfilePending(true);
						setProfile(cachedProfile);
						return;
					}

					setProfile(cachedProfile);
				}

				setProfile(await resolveProfile(arProvider.walletAddress));
			}
		})();
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		(async function () {
			if (arProvider.walletAddress && profilePending) {
				const cachedProfile = getCachedProfile(arProvider.walletAddress);

				if (cachedProfile?.id) {
					try {
						const fetchedProfile = await libs.getProfileById(cachedProfile.id);

						setProfile(fetchedProfile);
						cacheProfile(arProvider.walletAddress, fetchedProfile);
					} catch (e: any) {
						console.error(e);
					}

					setProfilePending(false);
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

	async function resolveProfile(address: string) {
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
			console.error('fetchError', e);
		}
	}

	function getCachedProfile(address: string) {
		const cached = localStorage.getItem(STORAGE.profileByWallet(address));
		return cached ? JSON.parse(cached) : null;
	}

	function cacheProfile(address: string, profileData: any) {
		if (profileData) localStorage.setItem(STORAGE.profileByWallet(address), JSON.stringify(profileData));
	}

	function handleInitialProfileCache(address: string, profileId: string) {
		cacheProfile(address, { id: profileId, status: 'pending' });
		setProfilePending(true);
	}

	return (
		<PermawebContext.Provider
			value={{
				deps: deps,
				libs: libs,
				profile: profile,
				showProfileManager,
				setShowProfileManager,
				handleInitialProfileCache: (address: string, profileId: string) =>
					handleInitialProfileCache(address, profileId),
				refreshProfile: () => setRefreshProfileTrigger((prev) => !prev),
			}}
		>
			{props.children}
			{showProfileManager && (
				<Panel
					open={showProfileManager}
					header={profile && profile.id ? language.editProfile : `${language.createProfile}!`}
					handleClose={() => setShowProfileManager(false)}
					width={575}
					closeHandlerDisabled
				>
					<ProfileManager
						profile={profile && profile.id ? profile : null}
						handleClose={() => setShowProfileManager(false)}
						handleUpdate={null}
					/>
				</Panel>
			)}
			{profilePending && <Loader message={`${language.waitingForProfile}...`} />}
		</PermawebContext.Provider>
	);
}
