import React from 'react';
import { ReactSVG } from 'react-svg';

import { Avatar } from 'components/atoms/Avatar';
import { ASSETS } from 'helpers/config';
import { formatAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useSettingsProvider } from 'providers/SettingsProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function WalletConnect(_props: { callback?: () => void }) {
	const arProvider = useArweaveProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { settings, updateSettings } = useSettingsProvider();

	const [showWallet, setShowWallet] = React.useState<boolean>(false);
	const [showWalletDropdown, setShowWalletDropdown] = React.useState<boolean>(false);

	const [label, setLabel] = React.useState<string | null>(null);

	React.useEffect(() => {
		setTimeout(() => {
			setShowWallet(true);
		}, 200);
	}, [arProvider.walletAddress]);

	React.useEffect(() => {
		if (!showWallet) {
			setLabel(`${language.fetching}...`);
		} else {
			if (arProvider.walletAddress) {
				if (arProvider.profile && arProvider.profile.username) {
					setLabel(arProvider.profile.username);
				} else {
					setLabel(formatAddress(arProvider.walletAddress, false));
				}
			} else {
				setLabel(language.connect);
			}
		}
	}, [showWallet, arProvider.walletAddress, arProvider.profile]);

	function handlePress() {
		if (arProvider.walletAddress) {
			setShowWalletDropdown(!showWalletDropdown);
		} else {
			arProvider.setWalletModalVisible(true);
		}
	}

	function handleDisconnect() {
		arProvider.handleDisconnect();
		setShowWalletDropdown(false);
	}

	return (
		<CloseHandler
			callback={() => {
				setShowWalletDropdown(false);
			}}
			active={showWalletDropdown}
			disabled={!showWalletDropdown}
		>
			<S.Wrapper>
				<S.PWrapper>
					<Avatar owner={arProvider.profile} dimensions={{ wrapper: 35, icon: 21.5 }} callback={handlePress} />
				</S.PWrapper>
				{showWalletDropdown && (
					<S.Dropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
						<S.DHeaderWrapper>
							<S.PDropdownHeader>
								<p>{language.profileMenu}</p>
							</S.PDropdownHeader>
							<S.DHeaderFlex>
								<Avatar owner={arProvider.profile} dimensions={{ wrapper: 32.5, icon: 19.5 }} callback={null} />
								<S.DHeader>
									<p>{label}</p>
								</S.DHeader>
							</S.DHeaderFlex>
						</S.DHeaderWrapper>
						<S.DBodyWrapper>
							<li onClick={() => arProvider.setShowProfileManager(true)}>
								<ReactSVG src={ASSETS.write} />
								{language.editProfile}
							</li>
							<li onClick={() => updateSettings('theme', settings.theme === 'light' ? 'dark' : 'light')}>
								<ReactSVG src={settings.theme === 'light' ? ASSETS.dark : ASSETS.light} />
								{`Use ${settings.theme === 'light' ? 'dark' : 'light'} mode`}
							</li>
						</S.DBodyWrapper>
						<S.DFooterWrapper>
							<li onClick={handleDisconnect}>
								<ReactSVG src={ASSETS.disconnect} />
								{language.disconnect}
							</li>
						</S.DFooterWrapper>
					</S.Dropdown>
				)}
			</S.Wrapper>
		</CloseHandler>
	);
}
