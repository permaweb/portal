
import { useLanguageProvider } from 'providers/LanguageProvider';

import { DocsNavigationFooter } from './DocsNavigationFooter';
import { DocsNavigationHeader } from './DocsNavigationHeader';
import { DocTemplate } from './DocTemplate';
import * as S from './styles';

export default function DocsDetail() {
  const languageProvider = useLanguageProvider();
  
  if (!languageProvider || !languageProvider.object) {
    return <div>Loading language resources...</div>;
  }

  return (
    <S.Wrapper>
      <S.BodyWrapper>
        <DocsNavigationHeader />
        <S.ContentWrapper className={'fade-in'}>
          <DocTemplate />
          <DocsNavigationFooter />
        </S.ContentWrapper>
      </S.BodyWrapper>
    </S.Wrapper>
  );
}