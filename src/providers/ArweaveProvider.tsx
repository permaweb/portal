import React from 'react';
import { useNavigate } from 'react-router-dom';
import { connectBrowserWallet, restoreBrowserWallet } from 'api/wallet';

import { STORAGE, URLS } from 'helpers/config';
import { getARBalanceEndpoint, getTurboBalanceEndpoint } from 'helpers/endpoints';
import { WalletEnum } from 'helpers/types';
import { debugLog } from 'helpers/utils';

const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];

export type BigIntString = `${bigint}`;

export interface TurboApproval {
	approvalDataItemId: string;
	approvedAddress: string;
	approvedWincAmount: BigIntString;
	creationDate: string; // ISO 8601 string
	payingAddress: string;
	usedWincAmount: BigIntString;
}

export interface TurboBalance {
	winc: BigIntString;
	balance: BigIntString;
	controlledWinc: BigIntString;
	effectiveBalance: BigIntString;
	givenApprovals: TurboApproval[];
	receivedApprovals: TurboApproval[];
}

interface ArweaveContextState {
	[x: string]: any;
	auth: any;
	wallet: any;
	walletAddress: string | null;
	walletType: WalletEnum | null;
	walletInitializing: boolean;
	arBalance: number | null;
	refreshARBalance: () => Promise<number | null>;
	turboBalance: number | null;
	refreshTurboBalance: () => void;
	handleConnect: any;
	handleDisconnect: (redirect: boolean) => void;
	turboBalanceObj: TurboBalance | null;
	backupsNeeded: number;
}

const DEFAULT_CONTEXT = {
	auth: null,
	wallet: null,
	walletAddress: null,
	walletType: null,
	walletInitializing: true,
	arBalance: null,
	async refreshARBalance() {
		return null;
	},
	turboBalance: null,
	refreshTurboBalance() {},
	handleConnect() {},
	handleDisconnect(_redirect: boolean) {},
	setWalletModalVisible(_open: boolean) {},
	turboBalanceObj: null,
	backupsNeeded: 0,
};

const ARContext = React.createContext<ArweaveContextState>(DEFAULT_CONTEXT);

export function useArweaveProvider(): ArweaveContextState {
	return React.useContext(ARContext);
}

export function ArweaveProvider(props: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const disconnectingRef = React.useRef(false);
	const lastAuthKeyRef = React.useRef<string | null>(null);
	const walletAddressRef = React.useRef<string | null>(null);

	const [auth, setAuthState] = React.useState(null);

	const setAuth = (newAuth: any) => {
		const authKey = newAuth ? `${newAuth.authStatus}-${newAuth.authType}` : null;
		if (authKey !== lastAuthKeyRef.current) {
			lastAuthKeyRef.current = authKey;
			setAuthState(newAuth);
		}
	};
	const [wallet, setWallet] = React.useState<any>(null);
	const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
	const [walletInitializing, setWalletInitializing] = React.useState(true);
	const [walletAddress, setWalletAddressState] = React.useState<string | null>(null);
	const setWalletAddress = (addr: string | null) => {
		walletAddressRef.current = addr;
		setWalletAddressState(addr);
	};
	const [turboBalanceObj, setTurboBalanceObj] = React.useState<TurboBalance>({
		winc: '0',
		balance: '0',
		controlledWinc: '0',
		effectiveBalance: '0',
		givenApprovals: [],
		receivedApprovals: [],
	});
	const [arBalance, setArBalance] = React.useState<number | null>(null);
	const [turboBalance, setTurboBalance] = React.useState<number | null>(null);
	const [backupsNeeded, setBackupsNeeded] = React.useState<number>(0);

	React.useEffect(() => {
		let mounted = true;
		void handleWallet().finally(() => {
			if (mounted) setWalletInitializing(false);
		});

		const onWalletSwitch = async () => {
			const activeWalletType = localStorage.getItem(STORAGE.walletType);
			if (disconnectingRef.current || !activeWalletType) {
				return;
			}
			setWalletInitializing(true);

			try {
				setAuth(null);
				setWallet(null);
				setWalletAddress(null);
				setWalletType(null);
				setArBalance(null);
				setTurboBalance(null);
				setTurboBalanceObj({
					winc: '0',
					balance: '0',
					controlledWinc: '0',
					effectiveBalance: '0',
					givenApprovals: [],
					receivedApprovals: [],
				});

				if (window.arweaveWallet) {
					await window.arweaveWallet.connect(WALLET_PERMISSIONS as any);
					const address = await window.arweaveWallet.getActiveAddress();
					setWalletAddress(address);
					setWallet(window.arweaveWallet);
					if (activeWalletType === WalletEnum.permawebOs) {
						setWalletType(WalletEnum.permawebOs);
						localStorage.setItem(STORAGE.walletType, WalletEnum.permawebOs);
					} else if (window.arweaveWallet.walletName && window.arweaveWallet.walletName !== 'Wander Connect') {
						setWalletType('NATIVE_WALLET' as WalletEnum);
						localStorage.setItem(STORAGE.walletType, 'NATIVE_WALLET');
					} else if (window?.wanderInstance?.authInfo?.authType) {
						setWalletType(window.wanderInstance.authInfo.authType);
						localStorage.setItem(STORAGE.walletType, window.wanderInstance.authInfo.authType);
					} else {
						const storedWalletType = localStorage.getItem(STORAGE.walletType) || WalletEnum.wander;
						setWalletType(storedWalletType as WalletEnum);
					}
				}
			} catch (e) {
				console.error('Error switching wallet:', e);
			} finally {
				if (mounted) setWalletInitializing(false);
			}
		};

		const onArweaveWalletLoaded = () => {
			if (disconnectingRef.current) return;
			if (window.arweaveWallet?.walletName !== 'Wander Connect' && window.wanderInstance) {
				(window.wanderInstance as any).windowArweaveWallet = window.arweaveWallet;
			}
			handleWallet();
		};

		window.addEventListener('arweaveWalletLoaded', onArweaveWalletLoaded);
		window.addEventListener('permawebConnectLoaded', onArweaveWalletLoaded);
		window.addEventListener('message', onMessage);
		window.addEventListener('walletSwitch', onWalletSwitch);

		return () => {
			mounted = false;
			window.removeEventListener('arweaveWalletLoaded', onArweaveWalletLoaded);
			window.removeEventListener('permawebConnectLoaded', onArweaveWalletLoaded);
			window.removeEventListener('message', onMessage);
			window.removeEventListener('walletSwitch', onWalletSwitch);
		};
	}, []);

	React.useEffect(() => {
		if (!wallet || !walletAddress) return;
		void refreshARBalance();
		const handleBalanceChanged = () => {
			void refreshARBalance();
		};
		window.addEventListener('arweaveBalanceChanged', handleBalanceChanged);
		return () => window.removeEventListener('arweaveBalanceChanged', handleBalanceChanged);
	}, [wallet, walletAddress]);

	React.useEffect(() => {
		setBackupsNeeded(window?.wanderInstance?.backupInfo?.backupsNeeded ?? 0);
	}, [auth]);

	async function handleWallet() {
		const storedWalletType = localStorage.getItem(STORAGE.walletType);
		if (storedWalletType) {
			try {
				if (storedWalletType === WalletEnum.permawebOs) {
					const connection = await restoreBrowserWallet(window, WalletEnum.permawebOs, WALLET_PERMISSIONS);
					if (!connection) return;
					window.arweaveWallet = connection.wallet as any;
					setWallet(connection.wallet);
					setWalletAddress(connection.address);
					setWalletType(WalletEnum.permawebOs);
					return;
				}
				await handleConnect(storedWalletType);
			} catch (e: any) {
				console.error(e);
			}
		}
	}

	async function handleConnect(walletType: string) {
		disconnectingRef.current = false;
		setWalletInitializing(true);
		let walletObj: any = null;
		try {
			switch (walletType) {
				case WalletEnum.permawebOs:
					await handleBrowserWallet(WalletEnum.permawebOs);
					break;
				case WalletEnum.wander:
					await handleBrowserWallet(WalletEnum.wander);
					break;
				case 'NATIVE_WALLET':
					await handleArConnect();
					break;
			}
		} finally {
			setWalletInitializing(false);
		}
		return walletObj;
	}

	async function handleBrowserWallet(walletType: WalletEnum.permawebOs | WalletEnum.wander) {
		if (disconnectingRef.current || walletAddressRef.current) return;
		try {
			const connection = await connectBrowserWallet(window, walletType, WALLET_PERMISSIONS);
			window.arweaveWallet = connection.wallet as any;
			setWalletAddress(connection.address);
			setWallet(connection.wallet);
			setWalletType(walletType);
			localStorage.setItem(STORAGE.walletType, walletType);
		} catch (e: any) {
			debugLog('error', 'ArweaveProvider', 'Browser wallet connection error:', e.message ?? 'Unknown error');
			localStorage.removeItem(STORAGE.walletType);
			setWallet(null);
			setWalletAddress(null);
			setWalletType(null);
		}
	}

	async function handleArConnect() {
		if (disconnectingRef.current) return;
		if (!walletAddressRef.current) {
			if (window.arweaveWallet) {
				try {
					await window.arweaveWallet.connect(WALLET_PERMISSIONS as any);
					const address = await window.arweaveWallet.getActiveAddress();

					debugLog('info', 'ArweaveProvider', 'Connected to wallet:', address);

					setWalletAddress(address);
					setWallet(window.arweaveWallet);
					if (window.arweaveWallet.walletName && window.arweaveWallet.walletName !== 'Wander Connect') {
						setWalletType('NATIVE_WALLET' as WalletEnum);
						localStorage.setItem(STORAGE.walletType, 'NATIVE_WALLET');
					} else if (window?.wanderInstance?.authInfo?.authType) {
						setWalletType(window.wanderInstance.authInfo.authType);
						localStorage.setItem(STORAGE.walletType, window.wanderInstance.authInfo.authType);
					} else if (window?.wanderInstance?.authInfo) {
						const storedWalletType = localStorage.getItem(STORAGE.walletType) || WalletEnum.wander;
						setWalletType(storedWalletType as WalletEnum);
						setAuth({ ...window.wanderInstance.authInfo, authType: storedWalletType });
					} else {
						const defaultType = WalletEnum.wander;
						setWalletType(defaultType);
						localStorage.setItem(STORAGE.walletType, defaultType);
					}
				} catch (e: any) {
					debugLog('error', 'ArweaveProvider', 'Connection Error:', e.message ?? 'Unknown error');
					localStorage.removeItem(STORAGE.walletType);
					setAuth(null);
					setWallet(null);
					setWalletAddress(null);
					setWalletType(null);
				}
			} else {
				debugLog('warn', 'ArweaveProvider', 'No Wallet Available');
			}
		}
	}

	async function handleDisconnect(redirect: boolean) {
		disconnectingRef.current = true;
		const isNativeWallet =
			walletType === 'NATIVE_WALLET' ||
			walletType === WalletEnum.permawebOs ||
			localStorage.getItem(STORAGE.walletType) === 'NATIVE_WALLET' ||
			localStorage.getItem(STORAGE.walletType) === WalletEnum.permawebOs;

		if (localStorage.getItem(STORAGE.walletType)) {
			localStorage.removeItem(STORAGE.walletType);
		}

		if (isNativeWallet) {
			try {
				if (wallet?.disconnect) {
					await wallet.disconnect();
				}
			} catch (e) {
				console.error('Error disconnecting from native wallet:', e);
			}
		} else if (window?.wanderInstance) {
			try {
				window.wanderInstance.signOut();
			} catch (e) {
				console.error('Error signing out from Wander:', e);
			}
		}

		setAuth(null);
		setWallet(null);
		setWalletAddress(null);
		setWalletType(null);
		setArBalance(null);
		setTurboBalance(null);
		setTurboBalanceObj(null);
		setWalletInitializing(false);

		if (redirect) navigate(URLS.base);
	}

	async function getARBalance() {
		const rawBalance = await fetch(getARBalanceEndpoint(walletAddress));
		const jsonBalance = await rawBalance.json();
		return jsonBalance / 1e12;
	}

	async function refreshARBalance(): Promise<number | null> {
		if (!walletAddress) return null;
		try {
			const balance = await getARBalance();
			setArBalance(balance);
			return balance;
		} catch (e) {
			console.error(e);
			return null;
		}
	}

	async function getTurboBalance(): Promise<number | null> {
		if (wallet && window.arweaveWallet) {
			try {
				const nonce = crypto.randomUUID();
				const msg = new TextEncoder().encode(nonce);

				const sigAB = await (window.arweaveWallet as any).signMessage(msg);

				const toB64Url = (buf: ArrayBuffer) =>
					btoa(String.fromCharCode(...new Uint8Array(buf)))
						.replace(/\+/g, '-')
						.replace(/\//g, '_')
						.replace(/=+$/, '');

				const signature = toB64Url(sigAB);
				const publicKey = await window.arweaveWallet.getActivePublicKey();

				const result = await fetch(getTurboBalanceEndpoint(), {
					headers: {
						'x-nonce': nonce,
						'x-signature': signature,
						'x-public-key': publicKey,
					},
				});

				if (result.ok) {
					const response = await result.json();
					setTurboBalanceObj(response);
					const next = Number(response.winc);
					setTurboBalance(next);
					return next;
				} else {
					setTurboBalance(0);
					setTurboBalanceObj({
						winc: '0',
						balance: '0',
						controlledWinc: '0',
						effectiveBalance: '0',
						givenApprovals: [],
						receivedApprovals: [],
					});
					return 0;
				}
			} catch (e: any) {
				setTurboBalance(null);
				return null;
			}
		}
		return null;
	}

	async function refreshTurboBalance(maxTries = 10): Promise<number | null> {
		const initial = turboBalance;
		let current: number | null = initial;

		for (let attempt = 1; attempt <= maxTries; attempt++) {
			current = await getTurboBalance();

			if (current !== null && current !== initial) {
				return current;
			}

			await new Promise((resolve) => setTimeout(resolve, 500));
		}

		return current;
	}

	function onMessage(event: any) {
		const data = event.data;
		if (data && data.id && !data.id.includes('react')) {
			if (data.type === 'embedded_auth') {
				if (
					data.data.authStatus === 'authenticated' ||
					data.data.authStatus === 'onboarding' ||
					data.data.authStatus === 'loading' ||
					data.data.authType === 'NATIVE_WALLET'
				) {
					disconnectingRef.current = false;
				}
				if (disconnectingRef.current) return;
				if (
					data.data.authType ||
					(data.data.authStatus === 'not-authenticated' && data.data.authType !== 'null' && data.data.authType !== null)
				) {
					if (data.data.authStatus === 'onboarding') {
						setAuth(data.data);
						if (!window.wanderInstance.isOpen) {
							window.wanderInstance.open();
						}
					} else if (data.data.authStatus !== 'loading') {
						window.wanderInstance.close();
						setAuth(data.data);
						if (data.data.authType === 'NATIVE_WALLET') {
							Promise.resolve().then(() => {
								if (
									window.arweaveWallet?.walletName === 'Wander Connect' &&
									(window.wanderInstance as any).windowArweaveWallet
								) {
									(window.wanderInstance as any).wanderConnectWallet = window.arweaveWallet;
									window.arweaveWallet = (window.wanderInstance as any).windowArweaveWallet;
								}
								if (window.arweaveWallet?.walletName !== 'Wander Connect') {
									handleArConnect();
								}
							});
						} else if (data.data.authStatus === 'authenticated') {
							(async () => {
								try {
									if (window.arweaveWallet?.walletName === 'Wander Connect') {
										const address = await window.arweaveWallet.getActiveAddress();
										setWalletAddress(address);
										setWallet(window.arweaveWallet);
										setWalletType(data.data.authType as WalletEnum);
										localStorage.setItem(STORAGE.walletType, data.data.authType);
									}
								} catch (e) {
									console.error('Error getting embedded wallet address:', e);
								}
							})();
						}
					} else {
						setAuth(data.data);
					}
				} else if (data.data.authStatus === 'not-authenticated') {
					setAuth(data.data);
				}
			} else if (data.type === 'embedded_request') {
				if (window.wanderInstance.pendingRequests !== 0) {
					window.wanderInstance.close();
					window.wanderInstance.open();
				} else {
					window.wanderInstance.close();
				}
			} else if (data.type === 'embedded_balance') {
			} else if (data.type === 'embedded_close') {
			}
		}
	}

	return (
		<ARContext.Provider
			value={{
				auth,
				wallet,
				walletAddress,
				walletType,
				walletInitializing,
				arBalance,
				refreshARBalance,
				handleConnect,
				handleDisconnect,
				turboBalance,
				refreshTurboBalance,
				turboBalanceObj,
				backupsNeeded,
			}}
		>
			{props.children}
		</ARContext.Provider>
	);
}
