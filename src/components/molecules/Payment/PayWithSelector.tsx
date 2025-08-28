import React from 'react';

import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export type PayMethod = 'turbo' | 'ario';

export function PayWithSelector(props: {
	method: PayMethod;
	onChange: (next: PayMethod) => void;
	arioSelectable: boolean;
	showCredits?: boolean;
	labels?: { credits?: string; ario?: string; title?: string };
	style?: React.CSSProperties;
}) {
	const { method, onChange, arioSelectable, showCredits = true, labels, style } = props;
	const languageProvider = useLanguageProvider();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const language: any = languageProvider.object[languageProvider.current];
	return (
		<S.PayWithSelectorWrapper style={style}>
			<S.PayWithSelectorLabel>{labels?.title ?? language.fundTurboPaymentHeader}</S.PayWithSelectorLabel>
			{showCredits && (
				<Button
					type={method === 'turbo' ? 'alt1' : 'primary'}
					label={labels?.credits ?? language.credits}
					handlePress={() => onChange('turbo')}
				/>
			)}
			{arioSelectable && (
				<Button
					type={method === 'ario' ? 'alt1' : 'primary'}
					label={labels?.ario ?? language.arioToken}
					handlePress={() => onChange('ario')}
				/>
			)}
		</S.PayWithSelectorWrapper>
	);
}
