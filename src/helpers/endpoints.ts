import { checkValidAddress } from './utils';

const arweaveEndpoint = 'https://arweave.net';
const turboEndpoint = 'https://payment.ardrive.io/v1';

export function getARBalanceEndpoint(walletAddress: string) {
	return `${arweaveEndpoint}/wallet/${walletAddress}/balance`;
}

export function getTxEndpoint(txId: string) {
	return `${arweaveEndpoint}/${txId}`;
}

export function getRendererEndpoint(renderWith: string, tx: string) {
	if (checkValidAddress(renderWith)) {
		return `${arweaveEndpoint}/${renderWith}/?tx=${tx}`;
	} else {
		return `https://${renderWith}.arweave.dev/?tx=${tx}`;
	}
}

export function getTurboCostWincEndpoint(bytes: number) {
	return `${turboEndpoint}/price/bytes/${bytes}`;
}

export function getTurboPriceWincEndpoint(currency: string, amount: number) {
	return `${turboEndpoint}/price/${currency}/${amount * 100}`;
}

export function getTurboCheckoutEndpoint(walletAddress: string, currency: string, amount: number) {
	return `${turboEndpoint}/top-up/payment-intent/${walletAddress}/${currency}/${amount * 100}`;
}

export function getTurboBalanceEndpoint() {
	return `${turboEndpoint}/balance`;
}
