import React from 'react';
import { getDeployedTransaction, peekDeployedTransaction } from 'api/deployment';

import { TxAddress } from 'components/atoms/TxAddress';
import { debugLog } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function AppDeployment() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const [deployment, setDeployment] = React.useState(peekDeployedTransaction);

	React.useEffect(() => {
		const controller = new AbortController();
		getDeployedTransaction({ signal: controller.signal })
			.then((record) => {
				if (!controller.signal.aborted) setDeployment(record);
			})
			.catch((error) => {
				if (!controller.signal.aborted) debugLog('warn', 'AppDeployment', 'Unable to read app deployment:', error);
			});
		return () => controller.abort();
	}, []);

	return (
		<S.Wrapper>
			<span>{language.appDeployment}:</span>
			{deployment ? <TxAddress address={deployment.transactionId} wrap={false} view /> : <p>-</p>}
		</S.Wrapper>
	);
}
