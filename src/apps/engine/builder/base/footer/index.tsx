import React from 'react';
import { useSettings } from 'engine/hooks/settings';
import { usePortalProvider } from 'engine/providers/portalProvider';
import { initThemes } from 'engine/helpers/themes'
import { defaultThemes } from 'engine/defaults/theme.defaults';
import Builder from 'engine/builder';
import * as S from './styles';
import { GlobalStyles } from '../../../global-styles';

export default function Footer(props: any) {
  const { preview, layout, content } = props;
  const { portal } = usePortalProvider();
  const Themes = preview ? defaultThemes : portal?.Themes;
  const Name = portal?.Name;
  
  const { settings } = preview
    ? { settings: { theme: 'dark' }}
    : useSettings();

  React.useEffect(() => {
    if(preview){
      initThemes(Themes)
      document.getElementById('preview')?.setAttribute('data-theme', 'dark')
    }    
  },[preview])

  return (
    <>
      {preview && <GlobalStyles />}
      <S.FooterWrapper $layout={layout} $theme={settings?.theme} id="Footer">
        <S.Footer $layout={layout}>
          <Builder layout={content} preview={preview} />          
          {Name} 2025
        </S.Footer>        
      </S.FooterWrapper>
    </>
  )
}