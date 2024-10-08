import React from 'react';
import { ReactSVG } from 'react-svg';

import { Avatar } from 'components/atoms/Avatar';
import { Button } from 'components/atoms/Button';
import { Panel } from 'components/molecules/Panel';
import { ProfileManager } from 'components/organisms/ProfileManager';
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
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);

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

	function handleProfileAction() {
		if (arProvider.profile && arProvider.profile.id) {
			setShowWalletDropdown(false);
		} else {
			setShowProfileManager(true);
		}
	}

	// function handleToggleTheme() {
	// 	themeProvider.setCurrent(themeProvider.current === 'light' ? 'dark' : 'light');
	// }

	function handleDisconnect() {
		arProvider.handleDisconnect();
		setShowWalletDropdown(false);
	}

	function getDropdown() {
		return (
			<>
				{/* <S.DHeaderWrapper>
					<S.DHeaderFlex>
						<Avatar
							owner={arProvider.profile}
							dimensions={{ wrapper: 35, icon: 21.5 }}
							callback={handleProfileAction}
						/>
						<S.DHeader>
							<p onClick={handleProfileAction}>{label}</p>
							<span onClick={handleProfileAction}>
								{formatAddress(
									arProvider.profile && arProvider.profile.id ? arProvider.profile.id : arProvider.walletAddress,
									false
								)}
							</span>
						</S.DHeader>
					</S.DHeaderFlex>
				</S.DHeaderWrapper> */}
				{/* <S.DBodyWrapper>
					<li onClick={handleProfileAction}>
						{arProvider.profile && arProvider.profile.id ? (
							<>
								<ReactSVG src={ASSETS.user} />
								{`${language.viewProfile}`}
							</>
						) : (
							<>
								<ReactSVG src={ASSETS.write} />
								{`${language.createProfile}`}
							</>
						)}
					</li>
					<li onClick={handleToggleTheme}>
						{themeProvider.current === 'light' ? (
							<>
								<ReactSVG src={ASSETS.dark} /> {`${language.useDarkDisplay}`}
							</>
						) : (
							<>
								<ReactSVG src={ASSETS.light} /> {`${language.useLightDisplay}`}
							</>
						)}
					</li>
				</S.DBodyWrapper> */}
				<S.DFooterWrapper>
					<li onClick={handleDisconnect}>
						<ReactSVG src={ASSETS.disconnect} />
						{language.disconnect}
					</li>
				</S.DFooterWrapper>
			</>
		);
	}

	function getHeader() {
		return (
			<S.PWrapper>
				{arProvider.profile && !arProvider.profile.id && (
					<S.CAction className={'fade-in'}>
						<Button type={'alt1'} label={language.createProfile} handlePress={handleProfileAction} />
					</S.CAction>
				)}
				{label && (
					<S.LAction onClick={handlePress} className={'border-wrapper-primary'}>
						<span>{label}</span>
					</S.LAction>
				)}
				<Avatar owner={arProvider.profile} dimensions={{ wrapper: 35, icon: 21.5 }} callback={handlePress} />
			</S.PWrapper>
		);
	}

	function getView() {
		return (
			<S.Wrapper>
				{getHeader()}
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
					{getDropdown()}
				</Panel>
			</S.Wrapper>
		);
	}

	return (
		<>
			{getView()}
			{showProfileManager && (
				<Panel
					open={showProfileManager}
					header={arProvider.profile && arProvider.profile.id ? language.editProfile : `${language.createProfile}!`}
					handleClose={() => setShowProfileManager(false)}
				>
					<S.PManageWrapper>
						<ProfileManager
							profile={arProvider.profile && arProvider.profile.id ? arProvider.profile : null}
							handleClose={() => setShowProfileManager(false)}
							handleUpdate={null}
						/>
					</S.PManageWrapper>
				</Panel>
			)}
		</>
	);
}
