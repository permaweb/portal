import React from 'react';

import { cacheProfile, checkValidAddress, getCachedProfile, urlify } from 'helpers/utils';
import { usePermawebProvider } from '../providers/WidgetPermawebProvider';

export const useProfile = (profileId: string) => {
	const permawebProvider = usePermawebProvider();
	const [profile, setProfile] = React.useState<any>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		if (!profileId) {
			setProfile(null);
			setIsLoading(false);
			return;
		}

		if (!permawebProvider.libs) {
			setIsLoading(false);
			return;
		}

		if (
			permawebProvider.profile &&
			(profileId === permawebProvider.profile.id ||
				(permawebProvider.profile.username && profileId === urlify(permawebProvider.profile.username)))
		) {
			setProfile(permawebProvider.profile);
			setIsLoading(false);
			return;
		}

		let processId: string | undefined;
		if (checkValidAddress(profileId)) {
			processId = profileId;
		} else {
			const urlifiedProfileId = urlify(profileId);
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith('profile-')) {
					try {
						const cachedProfile = JSON.parse(localStorage.getItem(key));
						if (
							cachedProfile &&
							(urlify(cachedProfile.username) === urlifiedProfileId ||
								urlify(cachedProfile.displayName) === urlifiedProfileId)
						) {
							processId = cachedProfile.id;
							break;
						}
					} catch (e) {
						// Skip invalid JSON entries
					}
				}
			}
		}

		if (!processId) {
			setProfile(null);
			setIsLoading(false);
			setError(new Error('Invalid profile ID') as any);
			return;
		}

		const cached = getCachedProfile(processId);
		if (cached) {
			setProfile(cached);
			setIsLoading(false);
			return;
		}

		const cachedByWallet = localStorage.getItem(`profile-by-wallet-${processId}`);
		if (cachedByWallet) {
			try {
				setProfile(JSON.parse(cachedByWallet));
				setIsLoading(false);
				return;
			} catch (e) {
				console.error('Failed to parse cached profile:', e);
			}
		}

		setIsLoading(true);
		setError(null);

		permawebProvider.libs
			.getProfileById(processId)
			.then((fetchedProfile: any) => {
				if (fetchedProfile) {
					if (fetchedProfile.displayname && !fetchedProfile.displayName) {
						fetchedProfile.displayName = fetchedProfile.displayname;
					}
					delete fetchedProfile.displayname;
					cacheProfile(processId, fetchedProfile);
					setProfile(fetchedProfile);
				} else {
					setProfile(null);
				}
				setIsLoading(false);
			})
			.catch((err: any) => {
				console.error('Error fetching profile by ID:', err);

				return permawebProvider.libs
					.getProfileByWalletAddress(profileId)
					.then((fetchedProfile: any) => {
						if (fetchedProfile && fetchedProfile.id) {
							if (fetchedProfile.displayname && !fetchedProfile.displayName) {
								fetchedProfile.displayName = fetchedProfile.displayname;
							}
							delete fetchedProfile.displayname;
							cacheProfile(profileId, fetchedProfile);
							setProfile(fetchedProfile);
						}
						setIsLoading(false);
					})
					.catch((walletErr: any) => {
						console.error('Error fetching profile by wallet:', walletErr);
						setError(walletErr);
						setIsLoading(false);
					});
			});
	}, [profileId, permawebProvider.libs, permawebProvider.profile]);

	if (!profileId || isLoading || !profile) {
		return {
			profile: {
				displayName: profileId ? 'Loading...' : '',
				thumbnail: '',
				id: profileId || '',
			},
			isLoading: Boolean(profileId) && isLoading,
			error,
		};
	}

	return {
		profile,
		isLoading: false,
		error,
	};
};
