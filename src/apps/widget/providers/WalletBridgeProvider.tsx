import React from 'react';

import { STORAGE } from 'helpers/config';
import { WalletEnum } from 'helpers/types';
import { WalletMode } from '../types';

const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];

interface WalletContextState {
	wallet: any;
	walletAddress: string | null;
	walletType: WalletEnum | null;
	handleConnect: (walletType?: string) => void;
	handleDisconnect: () => void;
}

const DEFAULT_CONTEXT: WalletContextState = {
	wallet: null,
	walletAddress: null,
	walletType: null,
	handleConnect() {},
	handleDisconnect() {},
};

const WalletContext = React.createContext<WalletContextState>(DEFAULT_CONTEXT);

export function useWalletProvider(): WalletContextState {
	return React.useContext(WalletContext);
}

export function WalletBridgeProvider(props: { children: React.ReactNode; walletMode: WalletMode }) {
	const { walletMode } = props;
	const disconnectingRef = React.useRef(false);
	const walletAddressRef = React.useRef<string | null>(null);

	const [wallet, setWallet] = React.useState<any>(null);
	const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
	const [walletAddress, setWalletAddressState] = React.useState<string | null>(null);

	const setWalletAddress = (addr: string | null) => {
		walletAddressRef.current = addr;
		setWalletAddressState(addr);
	};

	// Delegate mode: listen for postMessage from parent
	React.useEffect(() => {
		if (walletMode !== 'delegate' && walletMode !== 'auto') return;

		const handleMessage = (event: MessageEvent) => {
			const data = event.data;
			if (data?.type === 'wallet-context' && data.address) {
				setWalletAddress(data.address);
				setWallet(data.wallet || window.arweaveWallet);
				setWalletType(WalletEnum.wander);
			}
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [walletMode]);

	// Auto mode: wait 2s for delegate, then fall back to own
	React.useEffect(() => {
		if (walletMode === 'auto') {
			const timer = setTimeout(() => {
				if (!walletAddressRef.current) {
					handleOwnConnect();
				}
			}, 2000);
			return () => clearTimeout(timer);
		} else if (walletMode === 'own') {
			handleInitialConnect();
		}
	}, [walletMode]);

	// Listen for wallet events (own mode)
	React.useEffect(() => {
		if (walletMode === 'delegate') return;

		const onArweaveWalletLoaded = () => {
			if (disconnectingRef.current) return;
			handleInitialConnect();
		};

		const onWalletSwitch = async () => {
			if (disconnectingRef.current || !localStorage.getItem(STORAGE.walletType)) return;

			setWallet(null);
			setWalletAddress(null);
			setWalletType(null);

			if (window.arweaveWallet) {
				try {
					await window.arweaveWallet.connect(WALLET_PERMISSIONS as any);
					const address = await window.arweaveWallet.getActiveAddress();
					setWalletAddress(address);
					setWallet(window.arweaveWallet);
					resolveWalletType();
				} catch (e) {
					console.error('Error switching wallet:', e);
				}
			}
		};

		window.addEventListener('arweaveWalletLoaded', onArweaveWalletLoaded);
		window.addEventListener('walletSwitch', onWalletSwitch);

		return () => {
			window.removeEventListener('arweaveWalletLoaded', onArweaveWalletLoaded);
			window.removeEventListener('walletSwitch', onWalletSwitch);
		};
	}, [walletMode]);

	// Listen for Wander embedded auth messages
	React.useEffect(() => {
		if (walletMode === 'delegate') return;

		const onMessage = (event: MessageEvent) => {
			const data = event.data;
			if (!data || !data.id || data.id.includes('react')) return;

			if (data.type === 'embedded_auth') {
				if (disconnectingRef.current && data.data.authStatus !== 'authenticated') return;

				if (data.data.authStatus === 'authenticated') {
					disconnectingRef.current = false;
					(async () => {
						try {
							if (window.arweaveWallet) {
								const address = await window.arweaveWallet.getActiveAddress();
								setWalletAddress(address);
								setWallet(window.arweaveWallet);
								const type = data.data.authType || WalletEnum.wander;
								setWalletType(type as WalletEnum);
								localStorage.setItem(STORAGE.walletType, type);
							}
						} catch (e) {
							console.error('Error getting embedded wallet address:', e);
						}
					})();
				} else if (data.data.authType === 'NATIVE_WALLET') {
					disconnectingRef.current = false;
					handleArConnect();
				} else if (data.data.authStatus === 'not-authenticated') {
					// Disconnected from embedded
				}
			} else if (data.type === 'embedded_request') {
				if (window.wanderInstance?.pendingRequests !== 0) {
					window.wanderInstance.close();
					window.wanderInstance.open();
				} else {
					window.wanderInstance?.close();
				}
			}
		};

		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [walletMode]);

	function resolveWalletType() {
		if (window.arweaveWallet?.walletName && window.arweaveWallet.walletName !== 'Wander Connect') {
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

	async function handleArConnect() {
		if (disconnectingRef.current) return;
		if (!walletAddressRef.current && window.arweaveWallet) {
			try {
				await window.arweaveWallet.connect(WALLET_PERMISSIONS as any);
				const address = await window.arweaveWallet.getActiveAddress();
				setWalletAddress(address);
				setWallet(window.arweaveWallet);
				resolveWalletType();
			} catch (e: any) {
				console.error('[Widget] Wallet connection error:', e.message ?? e);
				localStorage.removeItem(STORAGE.walletType);
				setWallet(null);
				setWalletAddress(null);
				setWalletType(null);
			}
		}
	}

	function handleInitialConnect() {
		if (localStorage.getItem(STORAGE.walletType)) {
			handleArConnect();
		}
	}

	function handleOwnConnect() {
		handleArConnect();
	}

	function handleConnect() {
		disconnectingRef.current = false;
		handleArConnect();
	}

	function handleDisconnect() {
		disconnectingRef.current = true;
		const isNativeWallet =
			walletType === 'NATIVE_WALLET' || localStorage.getItem(STORAGE.walletType) === 'NATIVE_WALLET';

		localStorage.removeItem(STORAGE.walletType);

		if (isNativeWallet) {
			try {
				window.arweaveWallet?.disconnect?.();
			} catch (e) {
				console.error('Error disconnecting native wallet:', e);
			}
		} else if (window?.wanderInstance) {
			try {
				window.wanderInstance.signOut();
			} catch (e) {
				console.error('Error signing out from Wander:', e);
			}
		}

		setWallet(null);
		setWalletAddress(null);
		setWalletType(null);
	}

	return (
		<WalletContext.Provider
			value={{
				wallet,
				walletAddress,
				walletType,
				handleConnect,
				handleDisconnect,
			}}
		>
			{props.children}
		</WalletContext.Provider>
	);
}
