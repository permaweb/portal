import { ARIO } from '@ar.io/sdk';

import { IS_TESTNET } from './config';
import { getTurboPriceWincEndpoint } from './endpoints';

export type ArnsIntent = 'Buy-Name' | 'Extend-Lease' | 'Upgrade-Name';

export type ArnsCostResult = {
  winc: number; // Turbo credits (mainnet only)
  mario: number; // mARIO (both networks)
  fiatUSD: string | null; // formatted to two decimals or null
};

export async function getArnsCost(args: {
  intent: ArnsIntent;
  name: string;
  type?: 'lease' | 'permabuy';
  years?: number;
}): Promise<ArnsCostResult> {
  const { intent, name, type, years } = args;
  const arIO = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();

  if (IS_TESTNET) {
    const mario = await arIO.getTokenCost({ intent, name, type, years });
    return { winc: 0, mario: mario || 0, fiatUSD: null };
  }

  const [details, tokenCost] = await Promise.all([
    arIO.getCostDetails({ intent, name, type, years, fundFrom: 'turbo' }) as Promise<any>,
    arIO.getTokenCost({ intent, name, type, years }) as Promise<number>,
  ]);

  const wincQty = Number(details?.wincQty || details?.winc || 0);
  const mario = typeof tokenCost === 'number' ? tokenCost : 0;

  let fiatUSD: string | null = null;
  try {
    const res = await fetch(getTurboPriceWincEndpoint('usd', 1));
    if (res.ok) {
      const price = await res.json();
      const creditsPerDollar = Number(price?.winc || 0);
      if (creditsPerDollar > 0) fiatUSD = (wincQty / creditsPerDollar).toFixed(2);
    }
  } catch {
    // ignore
  }

  return { winc: wincQty, mario, fiatUSD };
}


