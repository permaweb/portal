import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { ProfileManager } from 'editor/components/organisms/ProfileManager';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Panel } from 'components/atoms/Panel';
import { LanguageSelect } from 'components/molecules/LanguageSelect';
import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { formatAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletConnect } from 'wallet/WalletConnect';

import * as S from './styles';

export default function Landing() {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [loading, setLoading] = React.useState<boolean>(false);
	const [showInvites, setShowInvites] = React.useState<boolean>(false);
	const [showProfileManager, setShowProfileManager] = React.useState<boolean>(false);

	async function joinPortal(portalId: string) {
		if (portalId && permawebProvider.profile?.id) {
			setShowInvites(false);
			setLoading(true);
			try {
				const profileUpdateId = await permawebProvider.libs.joinZone(
					{
						zoneToJoinId: portalId,
						path: 'Portals',
					},
					permawebProvider.profile.id
				);

				console.log(`Profile update: ${profileUpdateId}`);
				permawebProvider.refreshProfile();
				navigate(`${URLS.base}${portalId}`);
			} catch (e: any) {
				console.error(e);
			}
			setLoading(false);
		}
	}

	const header = React.useMemo(() => {
		let header: string | null = null;

		if (!arProvider.wallet) {
			header = language?.connectWallet;
		} else if (!permawebProvider.profile) {
			header = `${language?.gettingInfo}...`;
		} else if (!permawebProvider.profile.id) {
			header = language?.createProfile;
		} else {
			header = `${language?.welcome}, ${
				permawebProvider.profile.username ?? formatAddress(arProvider.walletAddress, false)
			}`;
		}

		return (
			<S.ConnectionWrapper>
				<S.ConnectionHeaderWrapper>
					<p>{header}</p>
				</S.ConnectionHeaderWrapper>
			</S.ConnectionWrapper>
		);
	}, [arProvider.wallet, permawebProvider.profile, languageProvider.current, languageProvider.current]);

	const portals = React.useMemo(() => {
		let content: React.ReactNode | null;
		let disabled: boolean = false;
		let label: string = language?.createPortal || 'Create Portal';
		let icon: string = null;
		let action: () => void | null = null;

		if (!arProvider.wallet || (permawebProvider.profile && !permawebProvider.profile.id)) {
			disabled = false;
			label = language?.connect || 'Connect Wallet';
			icon = ASSETS.wallet;

			if (permawebProvider.profile && !permawebProvider.profile.id) {
				label = language?.createProfile || 'Create Profile';
				icon = ASSETS.user;
				action = () => setShowProfileManager(true);
			}

			content = (
				<S.PortalsHeaderWrapper>
					<p>{language?.portalsInfo}</p>
				</S.PortalsHeaderWrapper>
			);
		} else if (!permawebProvider.profile) {
			disabled = true;
			label = `${language?.loading}...`;
			icon = ASSETS.user;
			content = (
				<S.PortalsLoadingWrapper>
					<p>{language?.fetchingPortals}</p>
					<Loader sm relative />
				</S.PortalsLoadingWrapper>
			);
		} else {
			disabled = false;
			label = language?.createPortal;
			icon = ASSETS.add;
			action = () => portalProvider.setShowPortalManager(true, true);

			if (portalProvider.portals && portalProvider.portals.length > 0) {
				content = (
					<>
						<S.PortalsHeaderWrapper>
							<p>{language?.selectPortal}</p>
						</S.PortalsHeaderWrapper>
						<S.PortalsListWrapperMain className={'scroll-wrapper'}>
							{portalProvider.portals.map((portal: any) => {
								return (
									<Link key={portal.id} to={`${URLS.base}${portal.id}`}>
										{portal.logo ? (
											<img src={getTxEndpoint(portal.logo)} alt={'Portal Logo'} />
										) : (
											<ReactSVG src={ASSETS.portal} />
										)}
										{portal.name ?? formatAddress(portal.id, false)}
									</Link>
								);
							})}
						</S.PortalsListWrapperMain>
					</>
				);
			} else {
				content = (
					<S.PortalsHeaderWrapper>
						<p>{language?.noPortalsFound}</p>
					</S.PortalsHeaderWrapper>
				);
			}
		}

		return (
			<S.PortalsWrapper>
				{content}
				<S.PortalActionWrapper>
					{!arProvider.walletAddress && (
						<S.WalletConnect>
							<WalletConnect app={'editor'} />
						</S.WalletConnect>
					)}
					{action && (
						<Button
							type={'primary'}
							label={label}
							handlePress={action}
							disabled={disabled}
							icon={icon}
							iconLeftAlign
							height={70}
							fullWidth
						/>
					)}
				</S.PortalActionWrapper>
			</S.PortalsWrapper>
		);
	}, [
		arProvider.wallet,
		arProvider.walletAddress,
		permawebProvider.profile,
		portalProvider.portals,
		languageProvider.current,
	]);

	const invites = React.useMemo(() => {
		let header: string = language?.noInvites;
		let description: string = language?.noInvitesInfo;
		let content: React.ReactNode | null;

		if (!arProvider.walletAddress || !permawebProvider.profile?.id) {
			description = language?.noInvitesProfileInfo;
		} else {
			if (portalProvider.invites?.length > 0) {
				header = `${language?.youAreInvited}!`;
				description = language?.invitesInfo;
				content = (
					<>
						<S.PortalsListWrapper className={'scroll-wrapper'}>
							{portalProvider.invites.map((portal: any) => {
								return (
									<button key={portal.id} onClick={() => joinPortal(portal.id)}>
										{portal.logo ? (
											<img src={getTxEndpoint(portal.logo)} alt={'Portal Logo'} />
										) : (
											<ReactSVG src={ASSETS.portal} />
										)}
										{portal.name}
									</button>
								);
							})}
						</S.PortalsListWrapper>
					</>
				);
			}
		}

		return (
			<Modal header={header} handleClose={() => setShowInvites((prev) => !prev)}>
				<S.ModalWrapper>
					<S.InvitesDescription>
						<p>{description}</p>
					</S.InvitesDescription>
					{content}
				</S.ModalWrapper>
			</Modal>
		);
	}, [arProvider.walletAddress, permawebProvider.profile?.id, portalProvider.invites, languageProvider.current]);

	return (
		<>
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.HeaderContent>
						<S.HeaderActionsWrapper>
							<S.HeaderAction>
								<Link to={URLS.docs}>{language?.helpCenter}</Link>
							</S.HeaderAction>
							<S.HeaderAction>
								<button onClick={() => setShowInvites((prev) => !prev)} disabled={loading}>
									{language?.invites}
									{portalProvider.invites?.length > 0 && (
										<div className={'notification'}>
											<span>{portalProvider.invites.length}</span>
										</div>
									)}
								</button>
							</S.HeaderAction>
						</S.HeaderActionsWrapper>
						<S.HeaderActionsWrapper>
							<LanguageSelect />
							<WalletConnect app={'editor'} />
						</S.HeaderActionsWrapper>
					</S.HeaderContent>
				</S.HeaderWrapper>
				<S.ContentWrapper className={'fade-in border-wrapper-alt3'}>
					<S.ContentHeaderWrapper>
						<h4>{`[${language?.app}]`}</h4>
					</S.ContentHeaderWrapper>
					<S.ContentBodyWrapper>
						<S.Section>{header}</S.Section>
						<S.Section>{portals}</S.Section>
					</S.ContentBodyWrapper>
				</S.ContentWrapper>
			</S.Wrapper>
			<Panel
				open={showProfileManager}
				header={permawebProvider.profile?.id ? language?.editProfile : `${language?.createProfile}!`}
				handleClose={() => setShowProfileManager(false)}
				width={575}
				closeHandlerDisabled
			>
				<ProfileManager
					profile={permawebProvider.profile?.id ? permawebProvider.profile : null}
					handleClose={() => setShowProfileManager(false)}
					handleUpdate={null}
				/>
			</Panel>
			{showInvites && invites}
			{loading && <Loader message={`${language?.loading}...`} />}
		</>
	);
}
