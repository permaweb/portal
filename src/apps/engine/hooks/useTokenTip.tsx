import React from 'react';

import Arweave from 'arweave';
import { createSigner } from '@permaweb/aoconnect/browser';

import { DEFAULT_AR_TOKEN, TipToken, toBaseUnits } from 'helpers/tokens';
import { WalletEnum } from 'helpers/types';
import { debugLog } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { usePortalProvider } from '../providers/portalProvider';

import { useArTip } from './useARTip';

const arweave = Arweave.init({
	host: 'arweave.net',
	port: 443,
	protocol: 'https',
});

type UseTokenTipOptions = {
	createReceipt?: boolean;
};

export function useTokenTip(tokenOverride?: TipToken, options?: UseTokenTipOptions) {
	const portalProvider = usePortalProvider();
	const { profile, deps } = usePermawebProvider();
	const { walletAddress, handleConnect } = useArweaveProvider();
	const { sendTip: sendArTip } = useArTip();
	const { Name } = portalProvider?.portal || {};

	const sendTip = React.useCallback(
		async (to: string, amount: string | undefined, location: 'page' | 'post' = 'page', postId?: string) => {
			const token = tokenOverride ?? DEFAULT_AR_TOKEN;

			if (token.type === 'AR') {
				return sendArTip(to, amount, location, postId);
			}

			const targetAddress = to?.trim();
			if (!targetAddress || targetAddress.length !== 43) {
				throw new Error('Invalid recipient wallet address');
			}

			const cleanAmount = (amount || '').trim();
			if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0) {
				throw new Error('Invalid tip amount');
			}

			if (!token.processId) {
				throw new Error('Token process ID is not configured');
			}

			if (!walletAddress) {
				await handleConnect(WalletEnum.wander);
			}

			if (!deps?.ao?.message) {
				throw new Error('AO connection not available');
			}

			const quantity = toBaseUnits(cleanAmount, token.decimals);
			const signer =
				deps?.signer ||
				(typeof window !== 'undefined' && (window as any).arweaveWallet
					? createSigner((window as any).arweaveWallet)
					: undefined);

			const messageId = await deps.ao.message({
				process: token.processId,
				tags: [
					{ name: 'Action', value: 'Transfer' },
					{ name: 'Recipient', value: targetAddress },
					{ name: 'Quantity', value: quantity },
				],
				signer,
			});

			const shouldCreateReceipt = options?.createReceipt !== false;
			if (shouldCreateReceipt && typeof window !== 'undefined' && (window as any).arweaveWallet) {
				try {
					const receiptData = JSON.stringify({
						type: 'tip',
						token: token.symbol,
						quantity,
						to: targetAddress,
						message: messageId,
					});

					const tx = await arweave.createTransaction({ data: receiptData });

					const tagPairs: Array<[string, string]> = [
						['App-Name', 'Portal'],
						['Type', 'Tip'],
						['Token-Symbol', token.symbol],
						['Token-Decimals', String(token.decimals)],
						['Token-Type', token.type],
						['Token-Process', token.processId],
						['Token-Message', messageId],
						['Amount', quantity],
						['Token-Amount', cleanAmount],
						['To-Address', targetAddress],
						['Location', String(location || 'page')],
					];

					const portalName = Name?.trim();
					if (portalName) tagPairs.push(['Portal-Name', portalName]);

					const fromAddr = walletAddress?.trim();
					if (fromAddr) tagPairs.push(['From-Address', fromAddr]);

					const profileId = profile?.id;
					if (profileId) tagPairs.push(['From-Profile', String(profileId)]);

					const postIdStr = postId?.toString().trim();
					if (postIdStr) tagPairs.push(['Location-Post-Id', postIdStr]);

					for (const [k, v] of tagPairs) {
						if (k && v) tx.addTag(k, v);
					}

					const signedTx = await (window as any).arweaveWallet.sign(tx);
					const response = await arweave.transactions.post(signedTx);
					if (response.status !== 200 && response.status !== 202) {
						throw new Error(`Failed posting receipt: ${response.status} ${response.statusText}`);
					}
				} catch (receiptError) {
					debugLog('warn', 'useTokenTip', 'Failed to create tip receipt:', receiptError);
				}
			}

			return messageId;
		},
		[
			tokenOverride,
			options?.createReceipt,
			sendArTip,
			walletAddress,
			handleConnect,
			deps?.ao,
			deps?.signer,
			Name,
			profile?.id,
		]
	);

	return { sendTip };
}
