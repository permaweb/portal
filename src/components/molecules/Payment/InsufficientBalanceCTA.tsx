import React from 'react';

import { Button } from 'components/atoms/Button';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export type PayMethod = 'turbo' | 'ario';

export function InsufficientBalanceCTA(props: {
	method: PayMethod;
	insufficient: boolean;
	isLoading?: boolean;
	onAddCredits?: () => void;
	onGetTokens?: () => void;
	style?: React.CSSProperties;
}) {
	const { method, insufficient, isLoading, onAddCredits, onGetTokens, style } = props;
	const languageProvider = useLanguageProvider();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const language: any = languageProvider.object[languageProvider.current];
	if (!insufficient || isLoading) return null;
	return (
		<S.InsufficientBalanceWrapper style={style}>
			{method === 'ario' ? (
				<Button type={'primary'} label={language.getTokens} handlePress={onGetTokens} />
			) : (
				<Button type={'primary'} label={language.addCredits} handlePress={onAddCredits} />
			)}
		</S.InsufficientBalanceWrapper>
	);
}
