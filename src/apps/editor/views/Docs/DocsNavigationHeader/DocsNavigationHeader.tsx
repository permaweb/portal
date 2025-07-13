import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { ASSETS, STYLING, URLS } from 'helpers/config';
import * as windowUtils from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { docsOrder } from '../order-docs';

import * as S from './styles';

function renderNavItems(
  handleClick: (() => void) | null,
  path: string = '',
  docs: any,
  currentLanguage: string
) {
  const location = useLocation();
  const basePath = URLS.docs;
  const active = location.pathname.replace(basePath, '');

  const items = [];
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].path && !docs[i].children) {
      const fullPath = `${path ? path + '/' : path}${docs[i].path}`;
      items.push(
        <Link to={`${URLS.docs}${fullPath}`} key={`file-${docs[i].path}`} onClick={handleClick || undefined}>
          <S.NListItem disabled={false} active={fullPath === active}>
            {docs[i].name}
          </S.NListItem>
        </Link>
      );
    } else {
      if (docs[i].children) {
        items.push(
          <S.NGroup key={`dir-${docs[i].name}`}>
            <S.NSubHeader>
              <p>{docs[i].name}</p>
            </S.NSubHeader>
            <S.NSubList>
              {renderNavItems(handleClick, docs[i].path, docs[i].children, currentLanguage)}
            </S.NSubList>
          </S.NGroup>
        );
      }
    }
  }

  return items;
}

export default function DocsNavigationHeader() {
  const languageProvider = useLanguageProvider();
const language = languageProvider.object[languageProvider.current] || {
  returnHome: 'Return Home',
  app: 'Documentation'
};
  const currentDocs = docsOrder[languageProvider.current] || docsOrder.en;

  const [open, setOpen] = React.useState(windowUtils.checkWindowCutoff(parseInt(STYLING.cutoffs.initial)));
  const [desktop, setDesktop] = React.useState(windowUtils.checkWindowCutoff(parseInt(STYLING.cutoffs.initial)));

  function handleWindowResize() {
    if (windowUtils.checkWindowCutoff(parseInt(STYLING.cutoffs.initial))) {
      setDesktop(true);
      setOpen(true);
    } else {
      setDesktop(false);
      setOpen(false);
    }
  }

  windowUtils.checkWindowResize(handleWindowResize);

  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (languageProvider?.setCurrent) {
      languageProvider.setCurrent(e.target.value as 'en' | 'es' | 'fr' | 'pt');
    }
  }

  if (!languageProvider || !languageProvider.object) {
    return <div>Loading navigation...</div>;
  }

  function getNav() {
    const Title: any = desktop ? S.NTitle : S.NTitleMobile;

    return (
      <>
        <S.HWrapper>
          <S.HActions>
            <Link to={URLS.base}>{language?.returnHome}</Link>
            <S.LanguageSelector value={languageProvider.current} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </S.LanguageSelector>
          </S.HActions>
        </S.HWrapper>
        <S.NWrapper>
          <S.NContent>
            <Title onClick={desktop ? undefined : () => setOpen(!open)} open={open}>
              <p>{language?.app}</p>
              {!desktop && <ReactSVG src={ASSETS.arrow} />}
            </Title>
			<S.NList>
			{open && renderNavItems(
				desktop ? null : () => setOpen(false),
				'',
				currentDocs,
				languageProvider.current
			)}
			</S.NList>
          </S.NContent>
        </S.NWrapper>
      </>
    );
  }

  return getNav();
}