import React from 'react';

import Arweave from 'arweave';

import { WalletEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';

const arweave = Arweave.init({
	host: 'arweave.net',
	port: 443,
	protocol: 'https',
});

export function useArTip() {
	const { wallet, walletAddress, handleConnect } = useArweaveProvider();

	const sendTip = React.useCallback(
		async (to: string, amount: string | undefined, location = 'page') => {
			if (!walletAddress || !wallet) {
				await handleConnect(WalletEnum.wander);
			}

			const activeWallet = wallet || (window as any).arweaveWallet;
			if (!activeWallet) throw new Error('No Arweave wallet available');

			const quantity = amount && amount.trim() !== '' ? arweave.ar.arToWinston(amount) : '0';

			const tx = await arweave.createTransaction(
				{
					target: to,
					quantity,
				},
				undefined
			);
			tx.addTag('App-Name', 'Portal');
			tx.addTag('Token-Symbol', 'AR');
			tx.addTag('Amount', quantity);
			tx.addTag('From-Address', walletAddress);
			tx.addTag('To-Address', to);
			tx.addTag('Type', 'Tip');
			tx.addTag('Location', location);

			await activeWallet.sign(tx);

			const res = await arweave.transactions.post(tx);
			console.log('[ArTip] tx posted', tx.id, res);

			return tx.id;
		},
		[wallet, walletAddress, handleConnect]
	);

	return { sendTip };
}
