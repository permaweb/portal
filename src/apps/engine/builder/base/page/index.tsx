import React from 'react';
import { useParams } from 'react-router-dom';
import { usePortalProvider } from 'engine/providers/portalProvider';
import Builder from '../../';
import * as S from './styles';

export default function Page() {
  const { portal } = usePortalProvider();
  const Pages = portal?.Pages;
  const Name = portal?.Name;
  const params = useParams();
  const pageId = Object.keys(params)[0] && Object.keys(params)[0] !== '*' 
    ? Object.keys(params)[0] 
    : params['*']
      ? params['*']
      : 'home';

  React.useEffect(() => {
    if(Name && pageId === 'home' && !document.title.includes('Home')){
      // @ts-ignore
      document.title = `${Name}`;
    }
  },[pageId, Name])

  return (
    <S.Page id="Page">
      <Builder layout={Pages?.[pageId]} />
    </S.Page>
  );
    
};

