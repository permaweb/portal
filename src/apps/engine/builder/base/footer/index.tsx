import React from 'react';
import { useSettings } from 'engine/hooks/settings';
import { useUI } from 'engine/hooks/portal';
import { initThemes } from 'engine/services/themes'
import Builder from 'engine/builder';
import * as S from './styles';
import { GlobalStyles } from '../../../global-styles';

export default function Footer(props: any) {
  const { preview, layout, content } = props;
  const { Layout, Themes } = useUI(preview);
  const { settings } = preview
    ? { settings: { theme: 'Dark' }}
    : useSettings();

  React.useEffect(() => {
    if(preview){
      initThemes(Themes, Layout)
      document.getElementById('preview')?.setAttribute('data-theme', 'Dark')
    }    
  },[preview])

  return (
    <>
      {preview && <GlobalStyles />}
      <S.Footer $layout={layout} $theme={settings?.theme || 'Dark'} id="Footer">
        <S.FooterWrapper $layout={layout}>
          <Builder layout={content} preview={preview} />
        </S.FooterWrapper>
      </S.Footer>
    </>
  )
}