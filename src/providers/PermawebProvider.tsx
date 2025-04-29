import React from 'react';

import Arweave from 'arweave';
import PermawebLibs, { ProfileType } from '@permaweb/libs';
import { connect, createDataItemSigner } from '@permaweb/aoconnect';

import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { ProfileManager } from 'components/organisms/ProfileManager';
import { STORAGE } from 'helpers/config';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';

interface PermawebContextState {
	libs: any;
	profile: ProfileType;
	showProfileManager: boolean;
	setShowProfileManager: (toggle: boolean) => void;
	handleInitialProfileCache: (address: string, profileId: string) => void;
	refreshProfile: () => void;
	fetchProfileById: (id: string) => any;
}

const DEFAULT_CONTEXT = {
	libs: null,
	profile: null,
	showProfileManager: false,
	setShowProfileManager(_toggle: boolean) {},
	handleInitialProfileCache(_address: string, _profileId: string) {},
	refreshProfile() {},
	fetchProfileById() {},
};

const PermawebContext = React.createContext<PermawebContextState>(DEFAULT_CONTEXT);

export function usePermawebProvider(): PermawebContextState {
	return React.useContext(PermawebContext);
}

// TODO: Reset profile on arProvider.wallet change / disconnect
export function PermawebProvider(props: { children: React.ReactNode }) {
	const arProvider = useArweaveProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [libs, setLibs] = React.useState<any>(null);
	const [profile, setProfile] = React.useState<ProfileType | null>(null);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [refreshProfileTrigger, setRefreshProfileTrigger] = React.useState<boolean>(false);
	const [profilePending, setProfilePending] = React.useState<boolean>(false);

	React.useEffect(() => {
		setLibs(
			PermawebLibs.init({
				ao: connect({ MODE: 'legacy' }),
				arweave: Arweave.init({}),
				signer: arProvider.wallet ? createDataItemSigner(arProvider.wallet) : null,
			})
		);
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
							// const newProfile = await libs.getProfileByWalletAddress(arProvider.walletAddress);
							const newProfile = await resolveProfile(arProvider.walletAddress);

							console.log(newProfile);

							if (JSON.stringify(existingProfile) !== JSON.stringify(newProfile)) {
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

	async function fetchProfileForId(profileId: string) {
		try {
			let fetchedProfile: any;

			const cachedProfile = getCachedProfile(profileId);
			if (cachedProfile?.id) fetchedProfile = await libs.getProfileById(cachedProfile.id);
			else fetchedProfile = await libs.getProfileById(profileId);

			let profileToUse = { ...fetchedProfile };

			if (!fetchedProfile?.id && cachedProfile) profileToUse = cachedProfile;

			cacheProfile(profileId, profileToUse);

			return profileToUse;
		} catch (e: any) {
			console.error('fetchError', e);
		}
	}

	function getCachedProfile(address: string) {
		const cached = localStorage.getItem(STORAGE.profile(address));
		return cached ? JSON.parse(cached) : null;
	}

	function cacheProfile(address: string, profileData: any) {
		localStorage.setItem(STORAGE.profile(address), JSON.stringify(profileData));
	}

	function handleInitialProfileCache(address: string, profileId: string) {
		cacheProfile(address, { id: profileId, status: 'pending' });
		setProfilePending(true);
	}

	return (
		<PermawebContext.Provider
			value={{
				libs: libs,
				profile: profile,
				showProfileManager,
				setShowProfileManager,
				handleInitialProfileCache: (address: string, profileId: string) =>
					handleInitialProfileCache(address, profileId),
				refreshProfile: () => setRefreshProfileTrigger((prev) => !prev),
				fetchProfileById: fetchProfileForId,
			}}
		>
			{props.children}
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
			{profilePending && <Loader message={`${language.waitingForProfile}...`} />}
		</PermawebContext.Provider>
	);
}
