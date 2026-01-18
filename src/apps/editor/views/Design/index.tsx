import { ViewHeader } from 'editor/components/atoms/ViewHeader';

import { useLanguageProvider } from 'providers/LanguageProvider';

import { DesignBasic } from './DesignBasic';
import * as S from './styles';

export default function Design() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper>
			<ViewHeader header={language?.design} />
			<DesignBasic />
		</S.Wrapper>
	);
}
