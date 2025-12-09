import React from 'react';
import { usePortalProvider } from 'engine/providers/portalProvider';

import Arweave from 'arweave';

import { WalletEnum } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

const arweave = Arweave.init({
	host: 'arweave.net',
	port: 443,
	protocol: 'https',
});

export function useArTip() {
	const portalProvider = usePortalProvider();
	const { profile } = usePermawebProvider();
	const { wallet, walletAddress, handleConnect } = useArweaveProvider();
	const { Name } = portalProvider?.portal || {};

	const sendTip = React.useCallback(
		async (to: string, amount: string | undefined, location = 'page') => {
			if (!walletAddress) {
				await handleConnect(WalletEnum.wander);
			}

			const cleanAmount = (amount || '').trim();
			const quantity = cleanAmount !== '' ? arweave.ar.arToWinston(cleanAmount) : '0';

			try {
				if (typeof window !== 'undefined' && (window as any).arweaveWallet) {
					let tx = await arweave.createTransaction({
						target: to,
						quantity,
					});

					const tagPairs: Array<[string, string]> = [
						['App-Name', 'Portal'],
						['Token-Symbol', 'AR'],
						['Amount', String(quantity)],
						['To-Address', String(to)],
						['Type', 'Tip'],
						['Location', String(location)],
					];
					//
					if (Name) tagPairs.push(['Portal-Name', String(Name.trim())]);
					if (walletAddress) tagPairs.push(['From-Address', walletAddress.trim()]);
					if (profile?.username) tagPairs.push(['From-Profile', profile.username.trim()]);
					if (profile?.displayname || profile?.displayName) {
						tagPairs.push(['From-Name', profile.displayname.trim() || profile.displayName.trim()]);
					}
					for (const [k, v] of tagPairs) tx.addTag(k, v);
					const signedTx = await window.arweaveWallet.sign(tx);
					const response = await arweave.transactions.post(signedTx);
					if (response.status !== 200 && response.status !== 202) {
						console.error('Error response from posting tx:', response);
						throw new Error(`Failed posting tx: ${response.status} ${response.statusText}`);
					}
					return tx.id;
				}

				throw new Error('No wallet available to sign transaction');
			} catch (err) {
				console.error('Error sending AR tip:', err);
				throw err;
			}
		},
		[wallet, walletAddress, handleConnect, Name, profile?.username, profile?.displayname, profile?.displayName]
	);

	return { sendTip };
}
