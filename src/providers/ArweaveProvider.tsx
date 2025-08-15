import React from 'react';
import { useNavigate } from 'react-router-dom';

import { STORAGE, URLS } from 'helpers/config';
import { getARBalanceEndpoint, getTurboBalanceEndpoint } from 'helpers/endpoints';
import { WalletEnum } from 'helpers/types';

const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];

interface ArweaveContextState {
	[x: string]: any;
	wallet: any;
	walletAddress: string | null;
	walletType: WalletEnum | null;
	arBalance: number | null;
	turboBalance: number | null;
	refreshTurboBalance: () => void;
	handleConnect: any;
	handleDisconnect: (redirect: boolean) => void;
}

const DEFAULT_CONTEXT = {
	wallet: null,
	walletAddress: null,
	walletType: null,
	arBalance: null,
	turboBalance: null,
	refreshTurboBalance() {},
	handleConnect() {},
	handleDisconnect(_redirect: boolean) {},
	setWalletModalVisible(_open: boolean) {},
};

const ARContext = React.createContext<ArweaveContextState>(DEFAULT_CONTEXT);

export function useArweaveProvider(): ArweaveContextState {
	return React.useContext(ARContext);
}

export function ArweaveProvider(props: { children: React.ReactNode }) {
	const navigate = useNavigate();

	const [wallet, setWallet] = React.useState<any>(null);
	const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
	const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

	const [arBalance, setArBalance] = React.useState<number | null>(null);
	const [turboBalance, setTurboBalance] = React.useState<number | null>(null);

	React.useEffect(() => {
		handleWallet();

		window.addEventListener('arweaveWalletLoaded', handleWallet);
		window.addEventListener('walletSwitch', handleWallet);

		return () => {
			window.removeEventListener('arweaveWalletLoaded', handleWallet);
			window.removeEventListener('walletSwitch', handleWallet);
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

	async function handleConnect(walletType: WalletEnum.wander) {
		let walletObj: any = null;
		switch (walletType) {
			case WalletEnum.wander:
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
					setWalletType(WalletEnum.wander);
					localStorage.setItem(STORAGE.walletType, WalletEnum.wander);
				} catch (e: any) {
					console.error(e);
				}
			}
		}
	}

	async function handleDisconnect(redirect: boolean) {
		if (localStorage.getItem(STORAGE.walletType)) localStorage.removeItem(STORAGE.walletType);
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



	return (
		<ARContext.Provider
			value={{
				wallet,
				walletAddress,
				walletType,
				arBalance,
				handleConnect,
				handleDisconnect,
				turboBalance,
				refreshTurboBalance,
			}}
		>
			{props.children}
		</ARContext.Provider>
	);
}
