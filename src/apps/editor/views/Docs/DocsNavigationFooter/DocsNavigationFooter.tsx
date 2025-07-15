import { Link, useLocation } from 'react-router-dom';

import { useLanguageProvider } from 'providers/LanguageProvider';

import { docsOrder } from '../order-docs';

import * as S from './styles';

export default function DocsNavigationFooter() {
  const languageProvider = useLanguageProvider();
  const location = useLocation();
  
  if (!languageProvider || !languageProvider.object) {
    return null;
  }

  const currentDocs = docsOrder[languageProvider.current] || docsOrder.en;
  const currentPath = location.pathname.replace(/^\/docs\/?/, '').replace(/\/$/, '');

  const pages: { name: string; path: string }[] = [];
  currentDocs.forEach((section) => {
    if (section.children && section.children.length > 0) {
      section.children.forEach((child) => {
        pages.push({
          name: child.name,
          path: `${section.path}/${child.path}`,
        });
      });
    } else {
      pages.push({
        name: section.name,
        path: section.path,
      });
    }
  });

  const currentIndex = pages.findIndex((page) => page.path === currentPath);
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage = currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  const footerTexts = {
    en: {
      previous: 'Previous page',
      next: 'Next page'
    },
    es: {
      previous: 'Página anterior',
      next: 'Página siguiente'
    },
    fr: {
      previous: 'Page précédente',
      next: 'Page suivante'
    },
    pt: {
      previous: 'Página anterior',
      next: 'Próxima página'
    }
  };

  const texts = footerTexts[languageProvider.current] || footerTexts.en;

  return (
    <S.Wrapper>
      {prevPage && (
        <Link to={`/docs/${prevPage.path}`} id={'docs-previous'}>
          <span>{texts.previous}</span>
          <p>{prevPage.name}</p>
        </Link>
      )}
      {nextPage && (
        <Link to={`/docs/${nextPage.path}`} id={'docs-next'}>
          <span>{texts.next}</span>
          <p>{nextPage.name}</p>
        </Link>
      )}
    </S.Wrapper>
  );
}