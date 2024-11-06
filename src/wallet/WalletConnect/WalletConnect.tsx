import React from 'react';
import { ReactSVG } from 'react-svg';

import { Avatar } from 'components/atoms/Avatar';
import { Modal } from 'components/molecules/Modal';
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
	const [showThemeSelector, setShowThemeSelector] = React.useState<boolean>(false);

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

	const THEMES = {
		light: {
			label: 'Light themes',
			icon: ASSETS.light,
			variants: [
				{ id: 'light-primary', name: 'Light default' },
				{ id: 'light-high-contrast', name: 'Light high contrast' },
				{ id: 'light-alt-1', name: 'Daybreak' },
				{ id: 'light-alt-2', name: 'Sunlit' },
			],
		},
		dark: {
			label: 'Dark themes',
			icon: ASSETS.dark,
			variants: [
				{ id: 'dark-primary', name: 'Dark default' },
				{ id: 'dark-high-contrast', name: 'Dark high contrast' },
				{ id: 'dark-alt-1', name: 'Eclipse' },
				{ id: 'dark-alt-2', name: 'Midnight' },
			],
		},
	};

	return (
		<>
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
								<li onClick={() => setShowThemeSelector(true)}>
									<ReactSVG src={ASSETS.design} />
									{language.chooseAppAppearance}
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
			{showThemeSelector && (
				<Modal header={language.chooseAppAppearance} handleClose={() => setShowThemeSelector(false)}>
					<S.MWrapper className={'modal-wrapper'}>
						{Object.entries(THEMES).map(([key, theme]) => (
							<S.ThemeSection key={key}>
								<S.ThemeSectionHeader>
									<ReactSVG src={theme.icon} />
									<p>{theme.label}</p>
								</S.ThemeSectionHeader>
								<S.ThemeSectionBody>
									{theme.variants.map((variant) => (
										<S.ThemeSectionBodyElement
											key={variant.id}
											className={'border-wrapper-primary'}
											onClick={() => updateSettings('theme', variant.id as any)}
										>
											<S.Indicator active={settings.theme === variant.id} />
											<p>{variant.name}</p>
										</S.ThemeSectionBodyElement>
									))}
								</S.ThemeSectionBody>
							</S.ThemeSection>
						))}
					</S.MWrapper>
				</Modal>
			)}
		</>
	);
}
