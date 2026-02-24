import React from 'react';
import styled from 'styled-components';

import { useWalletProvider } from '../../providers/WalletBridgeProvider';

const Button = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 8px 16px;
	border: none;
	border-radius: 6px;
	background: var(--widget-primary);
	color: white;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}
`;

const DisconnectButton = styled(Button)`
	background: transparent;
	color: var(--widget-text);
	border: 1px solid var(--widget-border);
	font-size: 12px;
	padding: 4px 10px;
`;

export default function ConnectButton() {
	const { walletAddress, handleConnect, handleDisconnect } = useWalletProvider();

	if (walletAddress) {
		return (
			<DisconnectButton onClick={handleDisconnect}>
				{walletAddress.slice(0, 5)}...{walletAddress.slice(-4)}
			</DisconnectButton>
		);
	}

	return <Button onClick={() => handleConnect()}>Connect Wallet</Button>;
}
