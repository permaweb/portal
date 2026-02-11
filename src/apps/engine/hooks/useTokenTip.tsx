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
	sendFromProfile?: boolean;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	const start = Date.now();
	try {
		debugLog('info', 'useTokenTip', 'Starting timed operation', { timeoutMs, errorMessage });
		const timeoutPromise = new Promise<never>((_, reject) => {
			timeoutId = setTimeout(() => {
				debugLog('error', 'useTokenTip', 'Timed operation expired', { timeoutMs, errorMessage });
				reject(new Error(errorMessage));
			}, timeoutMs);
		});
		const result = await Promise.race([promise, timeoutPromise]);
		debugLog('success', 'useTokenTip', 'Timed operation completed', { elapsedMs: Date.now() - start });
		return result;
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
};

const isTransferTimeoutError = (error: any) => {
	return error instanceof Error && error.message.includes('Transfer request timed out');
};

export function useTokenTip(tokenOverride?: TipToken, options?: UseTokenTipOptions) {
	const portalProvider = usePortalProvider();
	const { profile, deps, libs } = usePermawebProvider();
	const { wallet, walletAddress, handleConnect } = useArweaveProvider();
	const { sendTip: sendArTip } = useArTip();
	const { Name } = portalProvider?.portal || {};
	const isLegacyProfile = (profile as any)?.isLegacyProfile;

	const sendTip = React.useCallback(
		async (
			to: string,
			amount: string | undefined,
			location: 'page' | 'post' = 'page',
			postId?: string,
			tokenInput?: TipToken
		) => {
			const token = tokenInput ?? tokenOverride ?? DEFAULT_AR_TOKEN;

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
				debugLog('info', 'useTokenTip', 'Wallet not connected, requesting connect');
				await handleConnect(WalletEnum.wander);
				debugLog('success', 'useTokenTip', 'Wallet connect completed');
			}

			const quantity = toBaseUnits(cleanAmount, token.decimals);
			debugLog('info', 'useTokenTip', 'Prepared AO tip transfer', {
				tokenType: token.type,
				tokenSymbol: token.symbol,
				tokenProcess: token.processId,
				quantity,
				location,
				postId: postId || null,
			});

			let messageId: string;
			const sendViaAoFallback = async () => {
				if (!deps?.ao?.message) {
					throw new Error('AO connection not available');
				}

				const signer =
					deps?.signer ||
					(typeof window !== 'undefined' && (window as any).arweaveWallet
						? createSigner((window as any).arweaveWallet)
						: undefined);

				return withTimeout(
					deps.ao.message({
						process: token.processId,
						tags: [
							{ name: 'Action', value: 'Transfer' },
							{ name: 'Recipient', value: targetAddress },
							{ name: 'Quantity', value: quantity },
						],
						signer,
					}),
					25000,
					'Transfer request timed out while waiting for wallet/network confirmation'
				);
			};

			if (options?.sendFromProfile && profile?.id && libs?.sendMessage) {
				debugLog('info', 'useTokenTip', 'Sending AO transfer from profile');
				try {
					if (isLegacyProfile) {
						messageId = await withTimeout(
							libs.sendMessage({
								processId: profile.id,
								wallet,
								action: 'Transfer',
								tags: [
									{ name: 'Action', value: 'Transfer' },
									{ name: 'Target', value: token.processId },
									{ name: 'Recipient', value: targetAddress },
									{ name: 'Quantity', value: quantity },
								],
							}),
							25000,
							'Transfer request timed out while waiting for wallet/network confirmation'
						);
					} else {
						messageId = await withTimeout(
							libs.sendMessage({
								processId: profile.id,
								wallet,
								action: 'Run-Action',
								tags: [
									{ name: 'ForwardTo', value: token.processId },
									{ name: 'ForwardAction', value: 'Transfer' },
									{ name: 'Forward-To', value: token.processId },
									{ name: 'Forward-Action', value: 'Transfer' },
									{ name: 'Recipient', value: targetAddress },
									{ name: 'Quantity', value: quantity },
								],
								data: {
									Target: token.processId,
									Action: 'Transfer',
									Input: {
										Recipient: targetAddress,
										Quantity: quantity,
									},
								},
							}),
							25000,
							'Transfer request timed out while waiting for wallet/network confirmation'
						);
					}
				} catch (sendErr) {
					if (!isTransferTimeoutError(sendErr)) throw sendErr;
					debugLog('warn', 'useTokenTip', 'Profile send timed out, retrying with ao.message fallback');
					messageId = await sendViaAoFallback();
				}
			} else if (libs?.sendMessage) {
				debugLog('info', 'useTokenTip', 'Sending AO transfer via libs.sendMessage');
				try {
					messageId = await withTimeout(
						libs.sendMessage({
							processId: token.processId,
							wallet,
							action: 'Transfer',
							tags: [
								{ name: 'Recipient', value: targetAddress },
								{ name: 'Quantity', value: quantity },
							],
						}),
						25000,
						'Transfer request timed out while waiting for wallet/network confirmation'
					);
				} catch (sendErr) {
					if (!isTransferTimeoutError(sendErr)) throw sendErr;
					debugLog('warn', 'useTokenTip', 'libs.sendMessage timed out, retrying with ao.message fallback');
					messageId = await sendViaAoFallback();
				}
			} else {
				debugLog('info', 'useTokenTip', 'Sending AO transfer via deps.ao.message fallback');
				messageId = await sendViaAoFallback();
			}
			debugLog('success', 'useTokenTip', 'AO transfer message created', { messageId });

			const shouldCreateReceipt = options?.createReceipt !== false;
			if (shouldCreateReceipt && typeof window !== 'undefined' && (window as any).arweaveWallet) {
				try {
					debugLog('info', 'useTokenTip', 'Creating tip receipt transaction');
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

					const signedTx = await withTimeout(
						(window as any).arweaveWallet.sign(tx),
						20000,
						'Tip transfer succeeded but receipt signing timed out'
					);
					debugLog('success', 'useTokenTip', 'Receipt signed', { receiptTxId: signedTx?.id });
					const response = await withTimeout(
						arweave.transactions.post(signedTx),
						15000,
						'Tip transfer succeeded but receipt upload timed out'
					);
					debugLog('success', 'useTokenTip', 'Receipt posted', {
						status: response?.status,
						statusText: response?.statusText,
					});
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
			options?.sendFromProfile,
			sendArTip,
			wallet,
			walletAddress,
			handleConnect,
			deps?.ao,
			deps?.signer,
			libs?.sendMessage,
			Name,
			profile?.id,
			isLegacyProfile,
		]
	);

	return { sendTip };
}
