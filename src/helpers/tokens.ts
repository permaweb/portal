import { MonetizationConfig, TagType, TipTokenConfig } from './types';

export type TipTokenType = 'AR' | 'AO';

export type TipToken = {
	type: TipTokenType;
	symbol: string;
	decimals: number;
	processId?: string;
	recipientAddress?: string;
};

export type ParsedTipAmount = {
	tokenType: TipTokenType;
	tokenSymbol: string;
	tokenDecimals: number;
	tokenProcess?: string;
	amountRaw: string;
	amount: string;
};

const DEFAULT_AR_DECIMALS = 12;

export const DEFAULT_AR_TOKEN: TipToken = {
	type: 'AR',
	symbol: 'AR',
	decimals: DEFAULT_AR_DECIMALS,
};

const isProbablyProcessId = (value?: string | null) => typeof value === 'string' && value.trim().length === 43;

const toTokenConfig = (token: TipToken): TipTokenConfig => ({
	tokenType: token.type,
	tokenAddress: token.type === 'AR' ? 'AR' : token.processId || '',
	tokenSymbol: token.symbol,
	tokenDecimals: token.decimals,
	recipientAddress: token.recipientAddress?.trim() || undefined,
});

const normalizeSingleTokenConfig = (config?: TipTokenConfig | null): TipToken => {
	if (!config) return { ...DEFAULT_AR_TOKEN };

	const tokenAddress = config.tokenAddress?.trim() || '';
	const rawType = config.tokenType;
	const tokenType: TipTokenType =
		rawType === 'AO' || rawType === 'AR' ? rawType : tokenAddress === 'AR' || !tokenAddress ? 'AR' : 'AO';

	if (tokenType === 'AR') {
		const decimals = Number.isFinite(config.tokenDecimals)
			? Math.max(0, Math.floor(Number(config.tokenDecimals)))
			: DEFAULT_AR_DECIMALS;
		return {
			type: 'AR',
			symbol: config.tokenSymbol?.trim() || 'AR',
			decimals,
			recipientAddress: config.recipientAddress?.trim() || undefined,
		};
	}

	const aoDecimals = Number.isFinite(config.tokenDecimals) ? Math.max(0, Math.floor(Number(config.tokenDecimals))) : 0;
	return {
		type: 'AO',
		symbol: config.tokenSymbol?.trim() || 'AO',
		decimals: aoDecimals,
		processId: isProbablyProcessId(tokenAddress) ? tokenAddress : undefined,
		recipientAddress: config.recipientAddress?.trim() || undefined,
	};
};

export function normalizeTipTokens(monetization?: MonetizationConfig | null): TipToken[] {
	if (!monetization) return [{ ...DEFAULT_AR_TOKEN }];

	const rawList = Array.isArray(monetization.tipTokens) ? monetization.tipTokens : [];
	const sourceList =
		rawList.length > 0
			? rawList
			: [
					{
						tokenType: monetization.tokenType,
						tokenAddress: monetization.tokenAddress,
						tokenSymbol: monetization.tokenSymbol,
						tokenDecimals: monetization.tokenDecimals,
					},
			  ];

	const normalized = sourceList.map((entry) => normalizeSingleTokenConfig(entry));
	const unique = normalized.filter((token, index, arr) => {
		const key = `${token.type}:${token.symbol}:${token.decimals}:${token.processId || ''}:${
			token.recipientAddress || ''
		}`;
		return (
			index ===
			arr.findIndex(
				(item) =>
					`${item.type}:${item.symbol}:${item.decimals}:${item.processId || ''}:${item.recipientAddress || ''}` === key
			)
		);
	});

	const bounded = unique.slice(0, 3);
	return bounded.length > 0 ? bounded : [{ ...DEFAULT_AR_TOKEN }];
}

export function normalizeTipToken(monetization?: MonetizationConfig | null): TipToken {
	return normalizeTipTokens(monetization)[0];
}

export function tokensToMonetizationConfig(tokens: TipToken[]): TipTokenConfig[] {
	return tokens.slice(0, 3).map(toTokenConfig);
}

export function toBaseUnits(amount: string, decimals: number): string {
	const clean = amount.trim();
	if (!clean) throw new Error('Invalid tip amount');
	if (!/^\d+(\.\d+)?$/.test(clean)) throw new Error('Invalid tip amount');

	const [whole, fracRaw = ''] = clean.split('.');
	if (decimals === 0 && fracRaw.length > 0) {
		throw new Error('Token does not support decimal amounts');
	}
	if (fracRaw.length > decimals) {
		throw new Error(`Too many decimal places (max ${decimals})`);
	}

	const frac = fracRaw.padEnd(decimals, '0');
	const combined = `${whole}${frac}`.replace(/^0+(?=\d)/, '');
	const value = BigInt(combined || '0');
	if (value <= 0n) throw new Error('Invalid tip amount');
	return value.toString();
}

export function fromBaseUnits(raw: string, decimals: number): string {
	const clean = raw.trim();
	if (!clean || !/^\d+$/.test(clean)) return '0';
	if (decimals <= 0) return clean;

	const padded = clean.padStart(decimals + 1, '0');
	const whole = padded.slice(0, -decimals);
	const frac = padded.slice(-decimals).replace(/0+$/, '');
	return frac ? `${whole}.${frac}` : whole;
}

export function formatAmountDisplay(amount: string, maxDecimals = 4): string {
	const clean = amount.trim();
	if (!clean) return '0';
	if (!clean.includes('.')) return clean;

	const [whole, frac] = clean.split('.');
	const trimmed = frac.slice(0, maxDecimals).replace(/0+$/, '');
	return trimmed ? `${whole}.${trimmed}` : whole;
}

export function parseTipTags(tags: TagType[], winston?: string): ParsedTipAmount {
	const getTag = (name: string) => tags.find((t) => t.name === name)?.value;

	const tokenSymbol = (getTag('Token-Symbol') || 'AR').trim() || 'AR';
	const tokenDecimalsRaw = getTag('Token-Decimals');
	const tokenDecimals = Number.isFinite(Number(tokenDecimalsRaw))
		? Number(tokenDecimalsRaw)
		: tokenSymbol === 'AR'
		? DEFAULT_AR_DECIMALS
		: 0;
	const tokenProcess = getTag('Token-Process') || undefined;

	const tokenAmountTag = getTag('Token-Amount');
	const amountRawTag = getTag('Amount');

	let amountRaw = amountRawTag || '';
	if (!amountRaw && tokenAmountTag) {
		try {
			amountRaw = toBaseUnits(tokenAmountTag, tokenDecimals);
		} catch {
			amountRaw = '';
		}
	}
	if (!amountRaw && winston) amountRaw = winston;
	if (!amountRaw) amountRaw = '0';

	let amount = tokenAmountTag?.trim();
	if (!amount) amount = fromBaseUnits(amountRaw, tokenDecimals);

	return {
		tokenType: tokenSymbol === 'AR' ? 'AR' : 'AO',
		tokenSymbol,
		tokenDecimals,
		tokenProcess,
		amountRaw,
		amount,
	};
}
