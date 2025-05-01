import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { ButtonType } from 'helpers/types';
import { formatAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function Landing() {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [loading, setLoading] = React.useState<boolean>(false);

	async function joinPortal(portalId: string) {
		if (portalId && permawebProvider.profile?.id) {
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

	const connection = React.useMemo(() => {
		let header: string | null = null;
		let action: () => void | null = null;
		let label: string | null = null;
		let type: ButtonType = 'primary';
		let disabled: boolean = false;

		if (!arProvider.wallet) {
			header = language.connectWallet;
			label = language.connect;
			type = 'alt1';
			action = () => arProvider.setWalletModalVisible(true);
		} else if (!permawebProvider.profile) {
			header = `${language.gettingInfo}...`;
			label = `${language.fetching}...`;
			type = 'alt1';
			action = null;
			disabled = true;
		} else if (!permawebProvider.profile.id) {
			header = language.createProfile;
			label = language.create;
			type = 'alt1';
			action = () => permawebProvider.setShowProfileManager(true);
		} else {
			header = `${language.welcome}, ${
				permawebProvider.profile.username ?? formatAddress(arProvider.walletAddress, false)
			}`;
			label = language.disconnect;
			type = 'primary';
			action = () => arProvider.handleDisconnect();
		}

		return (
			<S.ConnectionWrapper>
				<p>{header}</p>
				<Button type={type} label={label} handlePress={action} disabled={disabled} height={42.5} fullWidth />
			</S.ConnectionWrapper>
		);
	}, [arProvider.wallet, permawebProvider.profile]);

	const portals = React.useMemo(() => {
		let content: React.ReactNode | null;
		let disabled: boolean = false;
		let showAction: boolean = false;

		if (!arProvider.wallet || (permawebProvider.profile && !permawebProvider.profile.id)) {
			showAction = true;
			disabled = true;
			content = (
				<>
					<p>{language.portalsInfo}</p>
				</>
			);
		} else if (!permawebProvider.profile) {
			showAction = false;
			disabled = true;
			content = (
				<S.PLoadingWrapper>
					<p>{`${language.fetchingPortals}...`}</p>
					<Loader sm relative />
				</S.PLoadingWrapper>
			);
		} else {
			showAction = true;
			disabled = false;
			if (portalProvider.portals && portalProvider.portals.length > 0) {
				content = (
					<>
						<p>{language.selectPortal}</p>
						<S.PListWrapper className={'scroll-wrapper'}>
							{portalProvider.portals.map((portal: any) => {
								return (
									<Link key={portal.id} to={`${URLS.base}${portal.id}`}>
										{portal.logo ? (
											<img src={getTxEndpoint(portal.logo)} alt={'Portal Logo'} />
										) : (
											<ReactSVG src={ASSETS.portals} />
										)}
										{portal.name}
									</Link>
								);
							})}
						</S.PListWrapper>
					</>
				);
			} else {
				content = <p>{language.portalCreate}</p>;
			}
		}

		return (
			<S.PortalsWrapper>
				{content}
				{showAction && (
					<Button
						type={'primary'}
						label={language.createPortal}
						handlePress={() => portalProvider.setShowPortalManager(true, true)}
						disabled={disabled}
						icon={ASSETS.add}
						iconLeftAlign
						height={42.5}
						fullWidth
					/>
				)}
			</S.PortalsWrapper>
		);
	}, [arProvider.walletAddress, permawebProvider.profile, portalProvider.portals]);

	const invites = React.useMemo(() => {
		let content: React.ReactNode | null;
		if (portalProvider.invites && portalProvider.invites.length > 0) {
			content = (
				<>
					<p>{'Join'}</p>
					<S.PListWrapper className={'scroll-wrapper'}>
						{portalProvider.invites.map((portal: any) => {
							return (
								<button key={portal.id} onClick={() => joinPortal(portal.id)}>
									{portal.logo ? (
										<img src={getTxEndpoint(portal.logo)} alt={'Portal Logo'} />
									) : (
										<ReactSVG src={ASSETS.portals} />
									)}
									{portal.name}
								</button>
							);
						})}
					</S.PListWrapper>
				</>
			);
		}

		return <S.PortalsWrapper>{content}</S.PortalsWrapper>;
	}, [portalProvider.invites]);

	return (
		<>
			<S.Wrapper>
				<S.ContentWrapper className={'fade-in'}>
					<S.HeaderWrapper>
						<h4>{`[${language.app}]`}</h4>
					</S.HeaderWrapper>
					<S.BodyWrapper>
						<S.Section>{connection}</S.Section>
						<S.Section>{portals}</S.Section>
						<S.Section>{invites}</S.Section>
					</S.BodyWrapper>
				</S.ContentWrapper>
			</S.Wrapper>
			{loading && <Loader message={`${language.loading}...`} />}
		</>
	);
}
