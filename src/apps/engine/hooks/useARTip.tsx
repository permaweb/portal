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

const getBalanceEndpoint = (address: string, gateway: string) => {
	return `https://${gateway}/wallet/${address}/balance`;
};
const fetchARBalance = async (address: string) => {
	const gateways = ['arweave.net', 'permagate.io', 'zerosettle.online', 'zigza.xyz', 'ario-gateway.nethermind.dev'];
	for (const gateway of gateways) {
		try {
			const res = await fetch(getBalanceEndpoint(address, gateway));
			const balance = await res.json();
			return balance / 1e12;
		} catch {}
	}
	return -1;
};

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
					// Check if user has sufficient balance
					const address = await window.arweaveWallet.getActiveAddress();
					const balance = await fetchARBalance(address);

					if (balance === -1) {
						throw new Error('Unable to fetch wallet balance');
					}

					const balanceInWinston = arweave.ar.arToWinston(balance.toString());

					// Create a test transaction to check fees
					const testParams = {
						target: to,
						quantity,
					};

					const transactionCheck = await arweave.createTransaction(testParams);

					// Check if balance is sufficient (quantity + fee)
					const totalRequired = BigInt(transactionCheck.quantity) + BigInt(transactionCheck.reward);

					if (totalRequired > BigInt(balanceInWinston)) {
						throw new Error(
							`Insufficient balance. Required: ${arweave.ar.winstonToAr(
								totalRequired.toString()
							)} AR, Available: ${balance} AR`
						);
					}

					let tx = transactionCheck;

					// If the transaction would use almost all balance, adjust quantity to account for fees
					if (BigInt(transactionCheck.quantity) >= BigInt(balanceInWinston)) {
						const adjustedQuantity = BigInt(quantity) - BigInt(transactionCheck.reward);
						if (adjustedQuantity <= 0) {
							throw new Error('Amount too small to cover transaction fees');
						}

						tx = await arweave.createTransaction({
							target: to,
							quantity: adjustedQuantity.toString(),
						});
					}

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
					const response = await arweave.transactions.post(signedTx);
					if (response.status !== 200 && response.status !== 202) {
						debugLog('error', 'useARTip', 'Error response from posting tx:', response);
						throw new Error(`Failed posting tx: ${response.status} ${response.statusText}`);
					}
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
