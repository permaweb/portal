import React from 'react';
import Placeholder from 'engine/components/placeholder';

import { cacheProfile, getCachedProfile } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

export const useProfile = (profileId: string) => {
	const { libs, profile: currentUserProfile } = usePermawebProvider();
	const [profile, setProfile] = React.useState(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState(null);

	React.useEffect(() => {
		if (!profileId) {
			setProfile(null);
			return;
		}

		if (!libs) {
			setProfile(null);
			return;
		}

		if (currentUserProfile && profileId === currentUserProfile.id) {
			setProfile(currentUserProfile);
			return;
		}

		const cached = getCachedProfile(profileId);
		if (cached) {
			setProfile(cached);
			return;
		}

		const cachedByWallet = localStorage.getItem(`profile-by-wallet-${profileId}`);
		if (cachedByWallet) {
			const parsed = JSON.parse(cachedByWallet);
			setProfile(parsed);
			return;
		}

		setIsLoading(true);
		setError(null);

		libs
			.getProfileById(profileId)
			.then((fetchedProfile: any) => {
				if (fetchedProfile) {
					cacheProfile(profileId, fetchedProfile);
					setProfile(fetchedProfile);
				}
				setIsLoading(false);
			})
			.catch((err: any) => {
				console.error('Error fetching profile by ID:', err);

				return libs
					.getProfileByWalletAddress(profileId)
					.then((fetchedProfile: any) => {
						if (fetchedProfile && fetchedProfile.id) {
							cacheProfile(profileId, fetchedProfile);
							localStorage.setItem(`profile-by-wallet-${profileId}`, JSON.stringify(fetchedProfile));
							setProfile(fetchedProfile);
						}
						setIsLoading(false);
					})
					.catch((walletErr: any) => {
						console.error('Error fetching profile by wallet:', walletErr);
						setError(walletErr);
						setIsLoading(false);

						const cachedFallback = getCachedProfile(profileId);
						if (cachedFallback) {
							setProfile(cachedFallback);
						}
					});
			});
	}, [profileId, libs, currentUserProfile]);

	if (!profileId || isLoading || !profile) {
		return {
			profile: {
				displayName: <Placeholder width="100" />,
				thumbnail: '',
				id: profileId || '',
			},
			isLoading: !Boolean(profileId) || isLoading,
			error,
		};
	}

	return {
		profile,
		isLoading: false,
		error,
	};
};
