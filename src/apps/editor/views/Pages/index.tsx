import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { PageList } from 'editor/components/organisms/PageList';

import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Pages() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language?.pages} />
			<S.BodyWrapper>
				<PageList />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
