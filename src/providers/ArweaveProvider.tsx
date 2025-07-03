import React from 'react';
import { useNavigate } from 'react-router-dom';
import { randomBytes } from 'crypto-browserify';

import { bufferTob64Url } from 'arweave/node/lib/utils';

import { STORAGE, URLS } from 'helpers/config';
import { getARBalanceEndpoint, getTurboBalanceEndpoint } from 'helpers/endpoints';
import { WalletEnum } from 'helpers/types';

const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];

interface ArweaveContextState {
	wallet: any;
	walletAddress: string | null;
	walletType: WalletEnum | null;
	arBalance: number | null;
	turboBalance: number | null;
	handleConnect: any;
	handleDisconnect: () => void;
}

const DEFAULT_CONTEXT = {
	wallet: null,
	walletAddress: null,
	walletType: null,
	arBalance: null,
	turboBalance: null,
	handleConnect() {},
	handleDisconnect() {},
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

	async function handleDisconnect() {
		if (localStorage.getItem(STORAGE.walletType)) localStorage.removeItem(STORAGE.walletType);
		await global.window?.arweaveWallet?.disconnect();
		setWallet(null);
		setWalletAddress(null);
		navigate(URLS.base);
	}

	async function getARBalance() {
		const rawBalance = await fetch(getARBalanceEndpoint(walletAddress));
		const jsonBalance = await rawBalance.json();
		return jsonBalance / 1e12;
	}

	async function getTurboBalance() {
		if (wallet) {
			try {
				const publicKey = await wallet.getActivePublicKey();
				const nonce = randomBytes(16).toString('hex');
				const buffer = Buffer.from(nonce);

				const signature = await wallet.signature(buffer, { name: 'RSA-PSS', saltLength: 32 });
				const b64UrlSignature = bufferTob64Url(Buffer.from(signature));

				const result = await fetch(getTurboBalanceEndpoint(), {
					headers: {
						'x-nonce': nonce,
						'x-public-key': publicKey,
						'x-signature': b64UrlSignature,
					},
				});

				if (result.ok) {
					setTurboBalance(Number((await result.json()).winc));
				} else {
					setTurboBalance(0);
				}
			} catch (e: any) {
				console.error(e);
				setTurboBalance(null);
			}
		}
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
			}}
		>
			{props.children}
		</ARContext.Provider>
	);
}
