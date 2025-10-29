import React from 'react';
import Placeholder from 'engine/components/placeholder';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { ICONS } from 'helpers/config';
import { cacheProfile, checkValidAddress, getCachedProfile, urlify } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

export const useProfile = (profileId: string) => {
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const [profile, setProfile] = React.useState(null);
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

		if (profileId === portalProvider.portalId) {
			const portalIconUrl = ICONS.portal;
			const portalIconId = portalIconUrl.split('/').pop();
			setProfile({
				name: portalProvider.portal?.Name,
				displayName: portalProvider.portal?.Name,
				thumbnail:
					portalProvider.portal?.Icon && portalProvider.portal.Icon !== 'None'
						? portalProvider.portal.Icon
						: portalIconId,
			});
			setIsLoading(false);
			return;
		}

		// Determine the actual process ID
		let processId;
		if (checkValidAddress(profileId)) {
			processId = profileId;
		} else {
			// Search through cached profiles to find ID by username
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

		// If we couldn't determine a processId, we can't fetch the profile
		if (!processId) {
			setProfile(null);
			setIsLoading(false);
			setError(new Error('Invalid profile ID'));
			return;
		}

		// Check cache by process ID
		const cached = getCachedProfile(processId);
		if (cached) {
			setProfile(cached);
			setIsLoading(false);
			return;
		}

		// Check cache by wallet address
		const cachedByWallet = localStorage.getItem(`profile-by-wallet-${processId}`);
		if (cachedByWallet) {
			try {
				const parsed = JSON.parse(cachedByWallet);
				setProfile(parsed);
				setIsLoading(false);
				return;
			} catch (e) {
				console.error('Failed to parse cached profile:', e);
			}
		}

		// Fetch from API
		setIsLoading(true);
		setError(null);

		permawebProvider.libs
			.getProfileById(processId)
			.then((fetchedProfile: any) => {
				if (fetchedProfile) {
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
	}, [profileId, permawebProvider.libs, permawebProvider.profile, portalProvider.portalId]);

	if (!profileId || isLoading || !profile) {
		return {
			profile: {
				displayName: <Placeholder width="100" />,
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
