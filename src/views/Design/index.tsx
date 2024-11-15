import { ViewHeader } from 'components/atoms/ViewHeader';
import { PortalDesign } from 'components/organisms/PortalDesign';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Design() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language.design} />
			<S.BodyWrapper className={'border-wrapper-primary'}>
				<PortalDesign />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
