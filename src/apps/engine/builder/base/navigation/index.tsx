import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUI } from 'engine/hooks/portal';
import { initThemes } from 'engine/services/themes'
import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import * as S from './styles';
import { ReactSVG } from 'react-svg';
import { GlobalStyles } from '../../../global-styles';
import Search from './search';

export default function Navigation(props: any) {
  const { preview, layout, content } = props;
  const { Layout, Themes } = useUI(true);
  const [useSearch, setUseSearch] = React.useState(false);
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    if(preview){
      initThemes(Themes, Layout)
      document.getElementById('preview')?.setAttribute('data-theme', 'Dark')
    }    
  },[preview])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-ignore
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setUseSearch(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const NavigationEntry = ({ index, entry }: any) => {
    const [showMenu, setShowMenu] = React.useState(false);

    return (
      <>
        {preview && <GlobalStyles />}
        <S.NavigationEntry
          id="entry"
          onPointerEnter={() => entry.children && entry.children.length > 0 ? setShowMenu(true) : {}}
          onPointerLeave={() => setShowMenu(false)}
        >
          <NavLink to={`/feed/category/${entry.id}`}>
            {entry.icon && <S.Icon><ReactSVG src={`/img/icons/${entry.Icon}.svg`} /></S.Icon>}
            {entry.name}
            {entry.children && entry.children.length > 0 && <Icon icon={ICONS.ARROW_DOWN} />}
          </NavLink>
            {showMenu && (
              <S.NavigationEntryMenu $layout={layout}>
                {entry.children.map((entry: any, key: any) => {
                  return (
                    <NavLink to={`/feed/category/${entry.id}`} key={key}>
                      <S.NavigationSubEntry>{entry.name}</S.NavigationSubEntry>
                    </NavLink>
                  )                
                }
                  
                )}
              </S.NavigationEntryMenu>
            )}
          
        </S.NavigationEntry>
      </>
    );
  };
  
  return layout && (
    <S.Navigation $layout={layout}>
      <S.NavigationEntries $layout={layout}>
        {content &&
          Object.entries(content).map(([key, entry]) => (
            <NavigationEntry key={key} index={key} entry={entry} />
          ))}
        <Search />
      </S.NavigationEntries>
    </S.Navigation>
  );
}
