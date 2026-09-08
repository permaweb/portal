import React from 'react';

import Arweave from 'arweave';
import Permaweb, { Types } from '@permaweb/libs/browser';
import { connect, createSigner } from '@permaweb/aoconnect/browser';

import { Loader } from 'components/atoms/Loader';
import { createBasePermawebAdapter } from 'helpers/basePortal';
import { AO_NODE, STORAGE } from 'helpers/config';
import { IS_BASE_MODE, PORTAL_MODE } from 'helpers/features';
import { resolveUploadTransaction } from 'helpers/upload';
import { cacheProfile as cacheProfileById } from 'helpers/utils';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';
import { useNotifications } from './NotificationProvider';

interface PermawebContextState {
	deps: any;
	libs: any;
	profile: Types.ProfileType;
	profileLoading: boolean;
	handleInitialProfileCache: (address: string, profileId: string) => void;
	refreshProfile: (options?: RefreshProfileOptions) => Promise<void>;
	setPortalRoles: (roles: string[]) => void;
	fetchProfile?: (address: string) => Promise<Types.ProfileType | undefined>;
}

interface RefreshProfileOptions {
	silent?: boolean;
}

const DEFAULT_CONTEXT = {
	deps: null,
	libs: null,
	profile: null,
	profileLoading: false,
	handleInitialProfileCache(_address: string, _profileId: string) {},
	async refreshProfile() {},
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
	const { addNotification } = useNotifications();

	const authoritiesRef = React.useRef(false);
	const prevWalletRef = React.useRef<string | null>(null);
	const walletAddressRef = React.useRef(arProvider.walletAddress);
	walletAddressRef.current = arProvider.walletAddress;
	const profileRequestsRef = React.useRef(
		new Map<string, { libs: any; promise: Promise<Types.ProfileType | undefined> }>()
	);
	const profileRefreshesRef = React.useRef(new Map<string, { libs: any; started: boolean; promise: Promise<void> }>());
	const [profile, setProfile] = React.useState<Types.ProfileType | null>(null);
	const [profileLoading, setProfileLoading] = React.useState<boolean>(false);
	const [profilePending, setProfilePending] = React.useState<boolean>(false);

	// Initialize synchronously with the wallet so profile effects cannot run once
	// with the previous wallet's adapter and again with its replacement.
	const { deps, libs } = React.useMemo(() => {
		try {
			if (IS_BASE_MODE) {
				const baseDependencies = {
					ao: { result: async () => ({ Messages: [{ Data: 'Base mode' }] }) },
					arweave: Arweave.init({}),
					signer: null,
					node: null,
				};
				return {
					deps: baseDependencies,
					libs: createBasePermawebAdapter(arProvider.wallet, arProvider.walletAddress || ''),
				};
			}

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

			const initializedLibs = Permaweb.init(dependencies);
			initializedLibs.resolveTransaction = (data: any, args?: any) =>
				resolveUploadTransaction(arProvider.wallet, data, args);
			return { deps: dependencies, libs: initializedLibs };
		} catch (error) {
			console.error('Error in PermawebProvider initialization:', error);
			return { deps: null, libs: null };
		}
	}, [arProvider.wallet, arProvider.walletAddress]);

	const resolveProfile = React.useCallback(
		async (address: string, options: RefreshProfileOptions = {}): Promise<Types.ProfileType | undefined> => {
			if (!libs) return;
			const pending = profileRequestsRef.current.get(address);
			if (pending?.libs === libs) return pending.promise;

			const request = (async () => {
				const cachedProfile = getCachedProfile(address);
				try {
					const fetchedProfile = cachedProfile?.id
						? await libs.getProfileById(cachedProfile.id)
						: await libs.getProfileByWalletAddress(address);
					const profileToUse = normalizeProfile({ ...fetchedProfile });
					cacheProfile(address, profileToUse);
					if (profileToUse?.id && !IS_BASE_MODE) cacheProfileById(profileToUse.id, profileToUse);
					return profileToUse;
				} catch (e: any) {
					console.error(e);
					if (!options.silent && walletAddressRef.current === address) {
						addNotification(language?.errorGettingProfile ?? 'Error getting profile', 'warning');
					}
					return cachedProfile?.id ? normalizeProfile(cachedProfile) : undefined;
				}
			})();
			profileRequestsRef.current.set(address, { libs, promise: request });
			try {
				return await request;
			} finally {
				if (profileRequestsRef.current.get(address)?.promise === request) profileRequestsRef.current.delete(address);
			}
		},
		[libs, addNotification, language?.errorGettingProfile]
	);

	React.useEffect(() => {
		let cancelled = false;
		(async function () {
			if (!arProvider.walletAddress) {
				setProfile(null);
				setProfileLoading(false);
				setProfilePending(false);
				prevWalletRef.current = null;
				return;
			}

			if (!libs?.getProfileByWalletAddress) {
				return;
			}

			const walletChanged = prevWalletRef.current !== arProvider.walletAddress;
			if (walletChanged) {
				setProfile(null);
				setProfileLoading(true);
				prevWalletRef.current = arProvider.walletAddress;
			}

			const cachedProfile = getCachedProfile(arProvider.walletAddress);

			if (cachedProfile?.id) setProfile(normalizeProfile(cachedProfile));
			// else setProfile({ id: null });

			try {
				const freshProfile = await resolveProfile(arProvider.walletAddress);
				if (cancelled) return;
				if (freshProfile?.id) {
					setProfile(freshProfile);
					cacheProfile(arProvider.walletAddress, freshProfile);
					setProfilePending(false);
				} else if (!cachedProfile?.id) {
					// Only reset state if there's no cached profile to fall back on
					setProfile({ id: null });
				}
			} catch (e: any) {
				console.error('Failed to fetch fresh profile:', e);
			} finally {
				if (!cancelled) setProfileLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [arProvider.walletAddress, libs?.getProfileByWalletAddress]);

	React.useEffect(() => {
		let cancelled = false;
		const address = arProvider.walletAddress;
		if (!address) {
			setProfilePending(false);
			return;
		}
		if (profilePending && libs?.getProfileById) {
			void (async () => {
				try {
					// Creation updates the cached ID while an older wallet lookup may
					// still be running. Read again after it completes to load that ID.
					const pending = profileRequestsRef.current.get(address);
					if (pending?.libs === libs) await pending.promise;
					if (cancelled) return;
					const fetchedProfile = await resolveProfile(address);
					if (!cancelled && fetchedProfile?.id) {
						setProfile(fetchedProfile);
						setProfilePending(false);
					}
				} catch (error) {
					console.error('Failed to load pending profile:', error);
				}
			})();
		}
		return () => {
			cancelled = true;
		};
	}, [arProvider.walletAddress, profilePending, libs]);

	const refreshProfile = React.useCallback(
		async (options: RefreshProfileOptions = {}) => {
			const address = arProvider.walletAddress;
			if (!arProvider.wallet || !address) return;
			const queued = profileRefreshesRef.current.get(address);
			if (queued?.libs === libs && !queued.started) return queued.promise;

			const pending = profileRequestsRef.current.get(address);
			const refresh = { libs, started: false, promise: Promise.resolve() };
			refresh.promise = (async () => {
				try {
					// A refresh may follow a write. Wait for any older read, then request
					// fresh data; refreshes waiting for that same read share this follow-up.
					await (pending?.libs === libs ? pending.promise : undefined);
					if (walletAddressRef.current !== address) return;
					refresh.started = true;
					const newProfile = await resolveProfile(address, options);
					if (newProfile?.id && walletAddressRef.current === address) {
						setProfile(newProfile);
					}
				} catch (error) {
					console.error(error);
				}
			})();
			profileRefreshesRef.current.set(address, refresh);
			try {
				await refresh.promise;
			} finally {
				if (profileRefreshesRef.current.get(address) === refresh) profileRefreshesRef.current.delete(address);
			}
		},
		[arProvider.wallet, arProvider.walletAddress, libs, resolveProfile]
	);

	/* Determine if the current authority has changed and if it is present in the profile.
		If it's not then add it to the profile authorities list
	*/
	React.useEffect(() => {
		if (IS_BASE_MODE) return;
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

	function normalizeProfile(profile: any) {
		if (!profile) return profile;
		const { displayname, ...rest } = profile;
		return {
			...rest,
			displayName: rest.displayName || displayname || '',
		};
	}

	function getCachedProfile(address: string) {
		const cacheAddress = IS_BASE_MODE ? `${PORTAL_MODE}-${address}` : address;
		const cached = localStorage.getItem(STORAGE.profileByWallet(cacheAddress));
		return cached ? normalizeProfile(JSON.parse(cached)) : null;
	}

	function cacheProfile(address: string, profileData: any) {
		if (profileData?.id) {
			// Only cache if profile has an ID, and don't cache portal-specific roles
			const { roles, ...profileWithoutRoles } = profileData;
			const cacheAddress = IS_BASE_MODE ? `${PORTAL_MODE}-${address}` : address;
			localStorage.setItem(STORAGE.profileByWallet(cacheAddress), JSON.stringify(profileWithoutRoles));
		}
	}

	function handleInitialProfileCache(address: string, profileId: string) {
		cacheProfile(address, { id: profileId, status: 'pending' });
		setProfilePending(true);
	}

	function setPortalRoles(roles: string[]) {
		setProfile((currentProfile: Types.ProfileType | null) => (currentProfile ? { ...currentProfile, roles } : null));
	}

	return (
		<PermawebContext.Provider
			value={{
				deps: deps,
				libs: libs,
				profile: profile,
				profileLoading: profileLoading,
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
