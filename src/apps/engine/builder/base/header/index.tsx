import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import { ReactSVG } from 'react-svg';
import { useSettings } from 'engine/hooks/settings';
import { useUI } from 'engine/hooks/portal';
import { initThemes } from 'engine/services/themes'
import Toggle from 'engine/components/toggle';
import WalletConnect from 'engine/components/wallet/walletConnect';
import { GlobalStyles } from '../../../global-styles';
import * as S from './styles';

export default function Header(props:any) {  
  const { name, layout, content, preview } = props;
  const { Themes } = useUI(preview);
  const { settings, updateSetting } = preview
    ? (() => {
        const [localSettings, setLocalSettings] = React.useState({ theme: 'dark' });
        const updateSetting = (key: string, value: any) => {
          setLocalSettings(prev => ({ ...prev, [key]: value }));
        };
        return { settings: localSettings, updateSetting };
      })()
    : useSettings();

  function setTheme(){
    const newTheme = settings?.theme === 'dark' || !settings?.theme ? 'light' : 'dark'
    
    if(!preview){      
      updateSetting('theme', newTheme);
      document.documentElement.setAttribute('theme', newTheme);
    } else {
      updateSetting('theme', newTheme);      
      document.getElementById('preview')?.setAttribute('data-theme', settings?.theme)
    }
  }

  React.useEffect(() => {
    if(preview && settings){      
      initThemes(Themes)
    }    
  },[settings])

  if(!layout) return null;
  return (
    <>
      {preview && <GlobalStyles />}
      <S.Header $layout={layout} theme={settings?.theme} id="Header">
        <S.HeaderContent $layout={layout}>
          {content.logo ? (
            <S.Logo $layout={content.logo}>
              {content.logo.txId 
                ? preview 
                  ? <a href=""><ReactSVG src={`https://arweave.net/${content.logo.txId}`} /></a>
                  : <NavLink to={'/'}>
                      <ReactSVG src={`https://arweave.net/${content.logo.txId}`} />
                    </NavLink>
                : <h1>{name}</h1>
              }
            </S.Logo>
          ) : <NavLink to={'/'}><h1>{name}</h1></NavLink>}
          <S.Actions>
            <WalletConnect />
            <S.ThemeToggle>          
              <Toggle theme state={settings?.theme === 'dark' ? true : false} setState={() => setTheme()} />
            </S.ThemeToggle>
          </S.Actions>      
          {content.links && (
            <S.Links>
              <S.LinksList>
                {content.links.map((link: any, index: number) => {
                  return (
                    <a key={index} href={link.uri} target="_blank" title={link.title}><Icon icon={ICONS[link.icon.toUpperCase()]} /><ReactSVG src={`img/icons/links/${link.icon}.svg`} /></a>
                  )
                })}
              </S.LinksList>
            </S.Links>      
          )}
        </S.HeaderContent>
      </S.Header>
    </>
  )
}

