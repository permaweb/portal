import React from 'react';

import { Loader } from 'components/atoms/Loader';
import { getARAmountFromWinc, toReadableARIO } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

export type PayMethod = 'turbo' | 'ario';

export function PaymentSummary(props: {
	method: PayMethod;
	unitLabel: string; // 'Credits' | 'ARIO' | 'tario'
	loadingCost: boolean;
	loadingBalance: boolean;
	cost: number | null | undefined; // winc or mARIO depending on method
	balance: number | null | undefined; // same unit as method
	style?: React.CSSProperties;
	formatOverride?: (amount: number | null | undefined) => string;
}) {
	const { method, unitLabel, loadingCost, loadingBalance, cost, balance, style, formatOverride } = props;
	const languageProvider = useLanguageProvider();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const language: any = languageProvider.object[languageProvider.current];

	const fmt = React.useCallback((val?: number | null) => {
		if (formatOverride) return formatOverride(val);
		if (val == null) return '—';
		return method === 'ario' ? `${toReadableARIO(val)} ${unitLabel}` : `${getARAmountFromWinc(val)} ${unitLabel}`;
	}, [method, unitLabel, formatOverride]);

	const finalBalance = React.useMemo(() => {
		if (balance == null || cost == null) return null;
		return balance - cost;
	}, [balance, cost]);

	return (
		<div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 6, ...(style || {}) }}>
			<div style={{ opacity: 0.75 }}>{language.checkoutTotalDue}</div>
			<div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
				{loadingCost ? <><Loader xSm /> <span>{language.fetching}…</span></> : <span>{fmt(cost)}</span>}
			</div>
			<div style={{ opacity: 0.75 }}>{language.checkoutCurrentBalance}</div>
			<div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
				{loadingBalance ? <><Loader xSm /> <span>{language.fetching}…</span></> : <span>{fmt(balance)}</span>}
			</div>
			<div style={{ opacity: 0.75 }}>{language.checkoutFinalBalance}</div>
			<div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
				{loadingCost || loadingBalance ? <><Loader xSm /> <span>{language.calculating}…</span></> : <span>{fmt(finalBalance)}</span>}
			</div>
		</div>
	);
}


