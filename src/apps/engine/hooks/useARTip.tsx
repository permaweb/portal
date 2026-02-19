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
			if (!res.ok) continue;
			const balanceText = (await res.text()).trim();
			// Arweave gateways return raw winston as text for /wallet/:address/balance
			const balanceAr = arweave.ar.winstonToAr(balanceText);
			const numeric = Number(balanceAr);
			if (Number.isFinite(numeric)) return numeric;
		} catch {}
	}
	return -1;
};

const PRICE_CACHE_KEY = 'portal_ar_usd_price_v1';
const PRICE_CACHE_TTL_MS = 60 * 1000;

const readCachedPrice = (): number | null => {
	if (typeof window === 'undefined' || !window.localStorage) return null;
	try {
		const raw = window.localStorage.getItem(PRICE_CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed.price !== 'number' || typeof parsed.ts !== 'number') return null;
		if (Date.now() - parsed.ts > PRICE_CACHE_TTL_MS) return null;
		return parsed.price;
	} catch {
		return null;
	}
};

const writeCachedPrice = (price: number) => {
	if (typeof window === 'undefined' || !window.localStorage) return;
	try {
		window.localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify({ price, ts: Date.now() }));
	} catch {}
};

const fetchJsonWithTimeout = async (url: string, timeoutMs = 4000) => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: controller.signal });
		if (!res.ok) return null;
		return await res.json();
	} finally {
		clearTimeout(timeout);
	}
};

const fetchARPriceUSD = async (): Promise<number | null> => {
	const cached = readCachedPrice();
	if (cached && Number.isFinite(cached)) return cached;

	// Try Redstone API first (no API key required, supports AR)
	try {
		const data = await fetchJsonWithTimeout('https://api.redstone.finance/prices?symbols=AR&provider=redstone');
		const price = data?.AR?.value;
		if (typeof price === 'number' && Number.isFinite(price)) {
			writeCachedPrice(price);
			return price;
		}
	} catch (e) {
		debugLog('warn', 'useARTip', 'Failed to fetch AR price from Redstone:', e);
	}

	// Fallback: Try CoinGecko API
	try {
		const data = await fetchJsonWithTimeout(
			'https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd&include_last_updated_at=true'
		);
		const price = data?.arweave?.usd;
		if (typeof price === 'number' && Number.isFinite(price)) {
			writeCachedPrice(price);
			return price;
		}
	} catch (e) {
		debugLog('warn', 'useARTip', 'Failed to fetch AR price from CoinGecko:', e);
	}

	return null;
};

export function useArTip() {
	const portalProvider = usePortalProvider();
	const { profile } = usePermawebProvider();
	const { wallet, walletAddress, handleConnect } = useArweaveProvider();
	const { Name } = portalProvider?.portal || {};

	const sendTip = React.useCallback(
		async (to: string, amount: string | undefined, location = 'page', postId?: string) => {
			// Validate inputs
			const targetAddress = to?.trim();
			if (!targetAddress || targetAddress.length !== 43) {
				throw new Error('Invalid recipient wallet address');
			}

			const cleanAmount = (amount || '').trim();
			if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0) {
				throw new Error('Invalid tip amount');
			}

			if (!walletAddress) {
				await handleConnect(WalletEnum.wander);
			}

			const quantity = arweave.ar.arToWinston(cleanAmount);

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
						target: targetAddress,
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
							target: targetAddress,
							quantity: adjustedQuantity.toString(),
						});
					}

					// Fetch AR price in USD (non-blocking - transaction proceeds even if price fetch fails)
					let usdValue: string | null = null;
					try {
						const arPriceUSD = await fetchARPriceUSD();
						const amountAR = cleanAmount !== '' ? Number(cleanAmount) : 0;
						if (arPriceUSD && Number.isFinite(amountAR) && amountAR > 0) {
							usdValue = (amountAR * arPriceUSD).toFixed(2);
						}
					} catch (e) {
						debugLog('warn', 'useARTip', 'Failed to fetch USD value for tip, proceeding without it:', e);
					}

					// Build tags - ensure all values are non-empty strings
					const tagPairs: Array<[string, string]> = [
						['App-Name', 'Portal'],
						['Token-Symbol', 'AR'],
						['Token-Decimals', '12'],
						['Token-Amount', cleanAmount],
						['Token-Type', 'AR'],
						['Amount', String(quantity || '0')],
						['To-Address', targetAddress],
						['Type', 'Tip'],
						['Location', String(location || 'page')],
					];

					// Only add optional tags if they have valid non-empty values
					const portalName = Name?.trim();
					if (portalName) tagPairs.push(['Portal-Name', portalName]);

					const fromAddr = walletAddress?.trim();
					if (fromAddr) tagPairs.push(['From-Address', fromAddr]);

					const profileId = profile?.id;
					if (profileId) tagPairs.push(['From-Profile', String(profileId)]);

					const postIdStr = postId?.toString().trim();
					if (postIdStr) tagPairs.push(['Location-Post-Id', postIdStr]);

					// USD value is already a string with 2 decimal places if set
					if (usdValue && usdValue.trim()) tagPairs.push(['USD-Value', usdValue.trim()]);

					// Add tags to transaction
					for (const [k, v] of tagPairs) {
						if (k && v) tx.addTag(k, v);
					}
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
