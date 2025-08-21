import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletConnect } from 'wallet/WalletConnect';

import * as S from './styles';

// TODO: Remove wallet connect
export default function WalletBlock() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper>
			<S.Icon>
				<ReactSVG src={ASSETS.wallet} />
			</S.Icon>
			<p>{language?.connectToContinue}</p>
			<S.WalletConnect>
				<WalletConnect />
			</S.WalletConnect>
		</S.Wrapper>
	);
}
