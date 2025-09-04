import React from 'react';
import { useNavigate } from 'react-router-dom';

import { STORAGE, URLS } from 'helpers/config';
import { getARBalanceEndpoint, getTurboBalanceEndpoint } from 'helpers/endpoints';
import { WalletEnum } from 'helpers/types';

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
	arBalance: number | null;
	turboBalance: number | null;
	refreshTurboBalance: () => void;
	handleConnect: any;
	handleDisconnect: (redirect: boolean) => void;
	turboBalanceObj: TurboBalance;
}

const DEFAULT_CONTEXT = {
	auth: null,
	wallet: null,
	walletAddress: null,
	walletType: null,
	arBalance: null,
	turboBalance: null,
	refreshTurboBalance() {},
	handleConnect() {},
	handleDisconnect(_redirect: boolean) {},
	setWalletModalVisible(_open: boolean) {},
	turboBalanceObj: {},
};

const ARContext = React.createContext<ArweaveContextState>(DEFAULT_CONTEXT);

export function useArweaveProvider(): ArweaveContextState {
	return React.useContext(ARContext);
}

export function ArweaveProvider(props: { children: React.ReactNode }) {
	const navigate = useNavigate();

	const [auth, setAuth] = React.useState(null);
	const [wallet, setWallet] = React.useState<any>(null);
	const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
	const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
	const [turboBalanceObj, setTurboBalanceObj] = React.useState<{ [key: string]: any }>({});
	const [arBalance, setArBalance] = React.useState<number | null>(null);
	const [turboBalance, setTurboBalance] = React.useState<number | null>(null);

	React.useEffect(() => {
		handleWallet();

		window.addEventListener('arweaveWalletLoaded', handleWallet);
		window.addEventListener('walletSwitch', handleWallet);
		window.addEventListener('message', onMessage);

		return () => {
			window.removeEventListener('arweaveWalletLoaded', handleWallet);
			window.removeEventListener('walletSwitch', handleWallet);
			window.removeEventListener('message', onMessage);
		};
	}, []);

	React.useEffect(() => {
		(async function () {
			if (wallet && walletAddress) {
				try {
					setArBalance(await getARBalance());
					await getTurboBalance();
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [walletAddress]);

	async function handleWallet() {
		if (localStorage.getItem(STORAGE.walletType)) {
			try {
				await handleConnect(localStorage.getItem(STORAGE.walletType) as any);
			} catch (e: any) {
				console.error(e);
			}
		}
	}

	async function handleConnect(walletType: string) {
		let walletObj: any = null;
		switch (walletType) {
			case WalletEnum.wander:
				handleArConnect();
				break;
			case 'NATIVE_WALLET':
				handleArConnect();
				break;
			default:
				if (window.arweaveWallet || walletType === WalletEnum.wander) {
					handleArConnect();
					break;
				}
		}
		return walletObj;
	}

	async function handleArConnect() {
		if (!walletAddress) {
			if (window.arweaveWallet) {
				try {
					await window.arweaveWallet.connect(WALLET_PERMISSIONS as any);
					setWalletAddress(await window.arweaveWallet.getActiveAddress());
					setWallet(window.arweaveWallet);
					if (window?.wanderInstance?.authInfo?.authType) {
						setWalletType(window.wanderInstance.authInfo.authType);
						localStorage.setItem(STORAGE.walletType, window.wanderInstance.authInfo.authType);
					} else if (window?.wanderInstance?.authInfo) {
						setAuth({ ...window.wanderInstance.authInfo, authType: localStorage.getItem(STORAGE.walletType) });
					}
				} catch (e: any) {
					console.error(e);
				}
			}
		}
	}

	async function handleDisconnect(redirect: boolean) {
		if (localStorage.getItem(STORAGE.walletType)) localStorage.removeItem(STORAGE.walletType);
		if (window?.wanderInstance?.authInfo?.authType !== 'NATIVE_WALLET') window?.wanderInstance?.signOut();
		await global.window?.arweaveWallet?.disconnect();
		setWallet(null);
		setWalletAddress(null);

		if (redirect) navigate(URLS.base);
	}

	async function getARBalance() {
		const rawBalance = await fetch(getARBalanceEndpoint(walletAddress));
		const jsonBalance = await rawBalance.json();
		return jsonBalance / 1e12;
	}

	async function getTurboBalance(): Promise<number | null> {
		if (wallet && window.arweaveWallet) {
			try {
				const nonce = crypto.randomUUID();
				const msg = new TextEncoder().encode(nonce);

				// Use the modern signMessage method
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
					console.error(`Turbo balance fetch failed: HTTP ${result.status} – ${await result.text()}`);
					setTurboBalance(0);
					return 0;
				}
			} catch (e: any) {
				console.error('Error fetching turbo balance:', e);
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
			console.log(current);

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
					data.data.authType ||
					(data.data.authStatus === 'not-authenticated' && data.data.authType !== 'null' && data.data.authType !== null)
				) {
					if (data.data.authStatus !== 'loading') {
						window.wanderInstance.close();
						setAuth(data.data);
						if (data.data.authStatus === 'authenticated' || data.data.authType === 'NATIVE_WALLET') {
							setAuth(data.data);
							handleArConnect();
						}
					} else {
						setAuth(data.data);
					}
				} else if (data.data.authStatus === 'not-authenticated') {
					setAuth(data.data);
					if (localStorage.getItem(STORAGE.walletType)) handleArConnect();
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
				arBalance,
				handleConnect,
				handleDisconnect,
				turboBalance,
				refreshTurboBalance,
				turboBalanceObj,
			}}
		>
			{props.children}
		</ARContext.Provider>
	);
}
