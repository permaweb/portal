import React from 'react';

import { getARAmountFromWinc, toReadableARIO } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

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

	const fmt = React.useCallback(
		(val?: number | null) => {
			if (formatOverride) return formatOverride(val);
			if (val == null) return '—';
			return method === 'ario' ? `${toReadableARIO(val)} ${unitLabel}` : `${getARAmountFromWinc(val)} ${unitLabel}`;
		},
		[method, unitLabel, formatOverride]
	);

	const finalBalance = React.useMemo(() => {
		if (balance == null || cost == null) return null;
		return balance - cost;
	}, [balance, cost]);

	return (
		<S.PaymentSummaryWrapper style={style}>
			<S.PaymentSummaryLine>
				<S.PaymentSummaryLabel>{language.checkoutTotalDue}</S.PaymentSummaryLabel>
				<S.PaymentSummaryDivider />
				<S.PaymentSummaryValue>
					{loadingCost ? <span>{language.fetching}…</span> : <span>{fmt(cost)}</span>}
				</S.PaymentSummaryValue>
			</S.PaymentSummaryLine>
			<S.PaymentSummaryLine>
				<S.PaymentSummaryLabel>{language.checkoutCurrentBalance}</S.PaymentSummaryLabel>
				<S.PaymentSummaryDivider />
				<S.PaymentSummaryValue>
					{loadingBalance ? <span>{language.fetching}…</span> : <span>{fmt(balance)}</span>}
				</S.PaymentSummaryValue>
			</S.PaymentSummaryLine>
			<S.PaymentSummaryLine>
				<S.PaymentSummaryLabel>{language.checkoutFinalBalance}</S.PaymentSummaryLabel>
				<S.PaymentSummaryDivider />
				<S.PaymentSummaryValue>
					{loadingCost || loadingBalance ? <span>{language.calculating}…</span> : <span>{fmt(finalBalance)}</span>}
				</S.PaymentSummaryValue>
			</S.PaymentSummaryLine>
		</S.PaymentSummaryWrapper>
	);
}
