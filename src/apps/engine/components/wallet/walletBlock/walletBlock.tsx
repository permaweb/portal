import { ReactSVG } from 'react-svg';

import { ICONS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function WalletBlock() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper>
			<S.Icon>
				<ReactSVG src={ICONS.wallet} />
			</S.Icon>
			<p>{language.connectToContinue}</p>
		</S.Wrapper>
	);
}
