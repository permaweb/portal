import React from 'react';
import { useNavigate } from 'react-router-dom';

import { getProfileByWalletAddress } from '@permaweb/libs';

import { Modal } from 'components/molecules/Modal';
import { Panel } from 'components/molecules/Panel';
import { ProfileManager } from 'components/organisms/ProfileManager';
import { ASSETS, URLS } from 'helpers/config';
import { getARBalanceEndpoint } from 'helpers/endpoints';
import { ProfileType, WalletEnum } from 'helpers/types';
import Othent from 'helpers/wallet';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];

const AR_WALLETS = [
	{ type: WalletEnum.arConnect, label: 'ArConnect', logo: ASSETS.arconnect },
	{ type: WalletEnum.othent, label: 'Othent', logo: ASSETS.othent },
];

interface ArweaveContextState {
	wallets: { type: WalletEnum; logo: string }[];
	wallet: any;
	walletAddress: string | null;
	walletType: WalletEnum | null;
	arBalance: number | null;
	handleConnect: any;
	handleDisconnect: () => void;
	walletModalVisible: boolean;
	setWalletModalVisible: (open: boolean) => void;
	profile: ProfileType;
	showProfileManager: boolean;
	setShowProfileManager: (toggle: boolean) => void;
	toggleProfileUpdate: boolean;
	setToggleProfileUpdate: (toggleUpdate: boolean) => void;
}

const DEFAULT_CONTEXT = {
	wallets: [],
	wallet: null,
	walletAddress: null,
	walletType: null,
	arBalance: null,
	handleConnect() {},
	handleDisconnect() {},
	walletModalVisible: false,
	setWalletModalVisible(_open: boolean) {},
	profile: null,
	toggleProfileUpdate: false,
	setToggleProfileUpdate(_toggleUpdate: boolean) {},
	showProfileManager: false,
	setShowProfileManager(_toggle: boolean) {},
};

const ARContext = React.createContext<ArweaveContextState>(DEFAULT_CONTEXT);

export function useArweaveProvider(): ArweaveContextState {
	return React.useContext(ARContext);
}

function WalletList(props: { handleConnect: any }) {
	return (
		<S.WalletListContainer>
			{AR_WALLETS.map((wallet: any, index: number) => (
				<S.WalletListItem
					key={index}
					onClick={() => props.handleConnect(wallet.type)}
					className={'border-wrapper-primary'}
				>
					<img src={wallet.logo} alt={''} />
					<span>{wallet.label}</span>
				</S.WalletListItem>
			))}
			<S.WalletLink>
				<span>
					Don't have an Arweave Wallet? You can create one{' '}
					<a href={'https://arconnect.io'} target={'_blank'}>
						here.
					</a>
				</span>
			</S.WalletLink>
		</S.WalletListContainer>
	);
}

export function ArweaveProvider(props: { children: React.ReactNode }) {
	const navigate = useNavigate();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const wallets = AR_WALLETS;

	const [wallet, setWallet] = React.useState<any>(null);
	const [walletType, setWalletType] = React.useState<WalletEnum | null>(null);
	const [walletModalVisible, setWalletModalVisible] = React.useState<boolean>(false);
	const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

	const [arBalance, setArBalance] = React.useState<number | null>(null);

	const [profile, setProfile] = React.useState<ProfileType | null>(null);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);
	const [toggleProfileUpdate, setToggleProfileUpdate] = React.useState<boolean>(false);

	React.useEffect(() => {
		(async function () {
			await handleWallet();
		})();
	}, []);

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
			if (walletAddress) {
				try {
					setArBalance(await getARBalance(walletAddress));
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [walletAddress]);

	React.useEffect(() => {
		(async function () {
			if (wallet && walletAddress) {
				try {
					setProfile(await getProfileByWalletAddress({ address: walletAddress }));
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [wallet, walletAddress, walletType]);

	React.useEffect(() => {
		(async function () {
			if (wallet && walletAddress) {
				const fetchProfileUntilChange = async () => {
					let changeDetected = false;
					let tries = 0;
					const maxTries = 10;

					while (!changeDetected && tries < maxTries) {
						try {
							const existingProfile = profile;
							const newProfile = await getProfileByWalletAddress({ address: walletAddress });

							if (JSON.stringify(existingProfile) !== JSON.stringify(newProfile)) {
								setProfile(newProfile);
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
	}, [toggleProfileUpdate]);

	async function handleWallet() {
		if (localStorage.getItem('walletType')) {
			try {
				setProfile(null);
				await handleConnect(localStorage.getItem('walletType') as any);
			} catch (e: any) {
				console.error(e);
			}
		}
	}

	async function handleConnect(walletType: WalletEnum.arConnect | WalletEnum.othent) {
		let walletObj: any = null;
		switch (walletType) {
			case WalletEnum.arConnect:
				handleArConnect();
				break;
			case WalletEnum.othent:
				handleOthent();
				break;
			default:
				if (window.arweaveWallet || walletType === WalletEnum.arConnect) {
					handleArConnect();
					break;
				}
		}
		setWalletModalVisible(false);
		return walletObj;
	}

	async function handleArConnect() {
		if (!walletAddress) {
			if (window.arweaveWallet) {
				try {
					await global.window?.arweaveWallet?.connect(WALLET_PERMISSIONS as any);
					setWalletAddress(await global.window.arweaveWallet.getActiveAddress());
					setWallet(window.arweaveWallet);
					setWalletType(WalletEnum.arConnect);
					setWalletModalVisible(false);
					localStorage.setItem('walletType', WalletEnum.arConnect);
				} catch (e: any) {
					console.error(e);
				}
			}
		}
	}

	async function handleOthent() {
		Othent.init();
		await window.arweaveWallet.connect(WALLET_PERMISSIONS as any);
		setWallet(window.arweaveWallet);
		setWalletAddress(Othent.getUserInfo().walletAddress);
		setWalletType(WalletEnum.othent);
		localStorage.setItem('walletType', WalletEnum.othent);
	}

	async function handleDisconnect() {
		await global.window?.arweaveWallet?.disconnect();
		setWallet(null);
		setWalletAddress(null);
		setProfile(null);
		navigate(URLS.base);
		if (localStorage.getItem('walletType')) localStorage.removeItem('walletType');
	}

	async function getARBalance(walletAddress: string) {
		const rawBalance = await fetch(getARBalanceEndpoint(walletAddress));
		const jsonBalance = await rawBalance.json();
		return jsonBalance / 1e12;
	}

	return (
		<>
			{walletModalVisible && (
				<Modal header={language.connectWallet} handleClose={() => setWalletModalVisible(false)}>
					<WalletList handleConnect={handleConnect} />
				</Modal>
			)}
			<ARContext.Provider
				value={{
					wallet,
					walletAddress,
					walletType,
					arBalance,
					handleConnect,
					handleDisconnect,
					wallets,
					walletModalVisible,
					setWalletModalVisible,
					profile,
					showProfileManager,
					setShowProfileManager,
					toggleProfileUpdate,
					setToggleProfileUpdate,
				}}
			>
				{props.children}
				<Panel
					open={showProfileManager}
					header={profile && profile.id ? language.editProfile : `${language.createProfile}!`}
					handleClose={() => setShowProfileManager(false)}
					width={575}
				>
					<ProfileManager
						profile={profile && profile.id ? profile : null}
						handleClose={() => setShowProfileManager(false)}
						handleUpdate={null}
					/>
				</Panel>
			</ARContext.Provider>
		</>
	);
}
