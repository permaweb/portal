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
		async (to: string, amount: string | undefined) => {
			// 1) Make sure wallet is connected
			if (!walletAddress || !wallet) {
				await handleConnect(WalletEnum.wander); // or whatever default type you prefer
			}

			const activeWallet = wallet || (window as any).arweaveWallet;
			if (!activeWallet) throw new Error('No Arweave wallet available');

			// 2) Convert AR amount → winston
			const quantity = amount && amount.trim() !== '' ? arweave.ar.arToWinston(amount) : '0';

			// 3) Create transaction
			const tx = await arweave.createTransaction(
				{
					target: to,
					quantity,
				},
				undefined // from is inferred from wallet
			);

			// Optional tags
			tx.addTag('App-Name', 'Portal-Monetization');
			tx.addTag('Type', 'Tip');

			// 4) Sign with ArConnect/Wander bridge
			await activeWallet.sign(tx);

			// 5) Post via SDK
			const res = await arweave.transactions.post(tx);
			console.log('[ArTip] tx posted', tx.id, res);

			return tx.id;
		},
		[wallet, walletAddress, handleConnect]
	);

	return { sendTip };
}
