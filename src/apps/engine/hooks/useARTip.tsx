import React from 'react';
import { usePortalProvider } from 'engine/providers/portalProvider';

import Arweave from 'arweave';

import { WalletEnum } from 'helpers/types';
import { debugLog } from 'helpers/utils';
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
		async (to: string, amount: string | undefined, location = 'page', postId?: string) => {
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
					if (profile?.id) tagPairs.push(['From-Profile', String(profile.id)]);
					if (postId) tagPairs.push(['Location-Post-Id', postId.toString().trim()]);
					for (const [k, v] of tagPairs) tx.addTag(k, v);
					debugLog('info', 'useARTip', 'Tag pairs:', tagPairs);
					const signedTx = await window.arweaveWallet.sign(tx);
					console.log('signedTx', signedTx);
					const response = await arweave.transactions.post(signedTx);
					if (response.status !== 200 && response.status !== 202) {
						debugLog('error', 'useARTip', 'Error response from posting tx:', response);
						throw new Error(`Failed posting tx: ${response.status} ${response.statusText}`);
					}
					console.log('response', response, signedTx.id);
					return signedTx.id;
				}

				throw new Error('No wallet available to sign transaction');
			} catch (err) {
				debugLog('error', 'useARTip', 'Error sending AR tip:', err);
				throw err;
			}
		},
		[wallet, walletAddress, handleConnect, Name, profile?.username, profile?.displayname, profile?.displayName]
	);

	return { sendTip };
}
