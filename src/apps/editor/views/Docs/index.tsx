import React from 'react';

import { DocsNavigationFooter } from './DocsNavigationFooter';
import { DocsNavigationHeader } from './DocsNavigationHeader';
import { DocTemplate } from './DocTemplate';
import * as S from './styles';

export default function DocsDetail() {
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