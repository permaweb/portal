import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function WalletBlock() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper>
			<S.Icon>
				<Icon icon={ICONS.WALLET} />
			</S.Icon>
			<p>{language.connectToContinue}</p>
		</S.Wrapper>
	);
}
