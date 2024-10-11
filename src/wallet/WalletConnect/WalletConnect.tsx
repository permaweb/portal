import React from 'react';
import { ReactSVG } from 'react-svg';

import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/molecules/Panel';
import { ASSETS } from 'helpers/config';
import { formatAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
// import { useCustomThemeProvider } from 'providers/CustomThemeProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function WalletConnect(_props: { callback?: () => void }) {
	const arProvider = useArweaveProvider();
	// const themeProvider = useCustomThemeProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

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

	// function handleToggleTheme() {
	// 	themeProvider.setCurrent(themeProvider.current === 'light' ? 'dark' : 'light');
	// }

	function handleDisconnect() {
		arProvider.handleDisconnect();
		setShowWalletDropdown(false);
	}

	return (
		<S.Wrapper>
			<S.PWrapper>
				{arProvider.profile && !arProvider.profile.id && (
					<S.CAction className={'fade-in'}>
						<Button
							type={'alt1'}
							label={language.createProfile}
							handlePress={() => arProvider.setShowProfileManager(!arProvider.showProfileManager)}
						/>
					</S.CAction>
				)}
				{label && (
					<S.LAction onClick={handlePress} className={'border-wrapper-primary'}>
						<span>{label}</span>
					</S.LAction>
				)}
				<Avatar owner={arProvider.profile} dimensions={{ wrapper: 35, icon: 21.5 }} callback={handlePress} />
			</S.PWrapper>
			<Panel
				open={showWalletDropdown}
				header={
					<S.DHeaderFlex>
						<Avatar owner={arProvider.profile} dimensions={{ wrapper: 32.5, icon: 19.5 }} callback={null} />
						<S.DHeader>
							<p>{label}</p>
						</S.DHeader>
					</S.DHeaderFlex>
				}
				handleClose={() => setShowWalletDropdown(false)}
				width={350}
			>
				<S.DFooterWrapper>
					<li onClick={handleDisconnect}>
						<ReactSVG src={ASSETS.disconnect} />
						{language.disconnect}
					</li>
				</S.DFooterWrapper>
			</Panel>
		</S.Wrapper>
	);
}
