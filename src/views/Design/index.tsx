import { ViewHeader } from 'components/atoms/ViewHeader';
import { Themes } from 'components/molecules/Themes';
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
					<Themes />
				</S.DesignWrapper>
				<S.PreviewWrapper className={'border-wrapper-primary scroll-wrapper'}></S.PreviewWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
