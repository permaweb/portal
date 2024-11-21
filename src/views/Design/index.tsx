import { ViewHeader } from 'components/atoms/ViewHeader';
import { SiteColors } from 'components/molecules/SiteColors';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Design() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language.design} />
			<S.BodyWrapper>
				<S.DesignWrapper>
					<SiteColors />
				</S.DesignWrapper>
				<S.PreviewWrapper className={'border-wrapper-primary scroll-wrapper'}></S.PreviewWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
