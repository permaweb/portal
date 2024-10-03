import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { ASSETS, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { ButtonType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';

import * as S from './styles';

// TODO: Mobile
// TODO: Language
// TODO: Portal create
export default function Landing() {
	const arProvider = useArweaveProvider();

	const connection = React.useMemo(() => {
		let header: string | null = null;
		let action: () => void | null = null;
		let label: string | null = null;
		let type: ButtonType = 'primary';
		let disabled: boolean = false;

		if (!arProvider.wallet) {
			header = 'Connect your wallet';
			label = 'Connect';
			type = 'alt1';
			action = () => arProvider.setWalletModalVisible(true);
		} else if (!arProvider.profile) {
			header = 'Getting your info...';
			label = 'Fetching...';
			type = 'alt1';
			action = null;
			disabled = true;
		} else if (!arProvider.profile.id) {
			header = 'Create your profile';
			label = 'Create';
			type = 'alt1';
			action = () => arProvider.setShowProfileManage(true);
		} else {
			header = `Welcome, ${arProvider.profile.username}`;
			label = 'Disconnect';
			type = 'primary';
			action = () => arProvider.handleDisconnect();
		}

		return (
			<S.ConnectionWrapper>
				<p>{header}</p>
				<Button type={type} label={label} handlePress={action} disabled={disabled} height={42.5} fullWidth />
			</S.ConnectionWrapper>
		);
	}, [arProvider.wallet, arProvider.profile]);

	const portals = React.useMemo(() => {
		let content: React.ReactNode | null;
		let disabled: boolean = false;
		let showAction: boolean = false;

		if (!arProvider.wallet || (arProvider.profile && !arProvider.profile.id)) {
			showAction = true;
			disabled = true;
			content = (
				<>
					<p>Your portals will be listed here</p>
				</>
			);
		} else if (!arProvider.profile) {
			showAction = false;
			disabled = true;
			content = (
				<S.PLoadingWrapper>
					<p>Fetching portals...</p>
					<Loader sm relative />
				</S.PLoadingWrapper>
			);
		} else {
			showAction = true;
			disabled = false;
			const PORTALS = [
				// TODO
				{
					id: 'IR2hzJyfSGp7lgqqgnoeza2caaus96e56uTVP1gV7GE',
					name: 'My first portal',
					logo: '4txDbfbymP1RNMQCsFzyZOZR9qeUZXt_IacmL4IXYD8',
				},
				{
					id: 'WhW2X0sy3bvzvzSgFdxOSrU3jHJBmVleLf1GX-IWEjU',
					name: 'Independent Media Alliance',
					// logo: '357HeJjvG10nK28juQ8YMp6DlvHhGbmU7pOvZphEhUk',
				},
			];
			content = (
				<S.PListWrapper>
					{PORTALS.map((portal: any) => {
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
			);
		}

		return (
			<S.PortalsWrapper>
				{content}
				{showAction && (
					<Button
						type={'primary'}
						label={'Create new portal'}
						handlePress={null}
						disabled={disabled}
						icon={ASSETS.add}
						iconLeftAlign
						height={42.5}
						fullWidth
					/>
				)}
			</S.PortalsWrapper>
		);
	}, [arProvider.wallet, arProvider.profile]);

	return (
		<S.Wrapper className={'fade-in'}>
			<S.HeaderWrapper>
				<h4>Connect to Portals</h4>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor, Lorem ipsum dolor sit amet,
					consectetur adipiscing elit.
				</p>
			</S.HeaderWrapper>
			<S.BodyWrapper>
				<S.Section>{connection}</S.Section>
				<S.Section>{portals}</S.Section>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
