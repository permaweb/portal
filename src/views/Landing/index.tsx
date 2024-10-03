import React from 'react';

import { Button } from 'components/atoms/Button';
import { ButtonType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';

import * as S from './styles';

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
	}, [arProvider.wallet, arProvider.walletAddress, arProvider.profile]);

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
				<S.Section></S.Section>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
