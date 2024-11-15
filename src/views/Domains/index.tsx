import { ViewHeader } from 'components/atoms/ViewHeader';
import { DomainList } from 'components/organisms/DomainList';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Domains() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language.domains} />
			<S.BodyWrapper className={'border-wrapper-primary'}>
				<DomainList />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
