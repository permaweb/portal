import { Routes, Route } from 'react-router-dom';
import Page from '../page';
import * as S from './styles';

export default function Content(props: any) {
  const { layout } = props;

  return (
    <S.ContentWrapper id="Content">
      <S.Content $layout={layout.content} maxWidth={layout?.basics?.maxWidth}>
        <Routes>                    
          <Route path=":post/:postId" element={<Page />} />
          
          <Route path=":feed/:pageId" element={<Page />} />    
          <Route path=":feed/category/:category" element={<Page />} />      
          <Route path=":feed/tag/:tag" element={<Page />} />      
          <Route path=":feed/date/:year/:month" element={<Page />} />
          <Route path=":feed/network/:network" element={<Page />} />

          <Route path="search/:search" element={<Page />} />
          
          <Route path="user/:user" element={<Page />} />
          <Route path="user/:user/posts" element={<Page />} />
                
          <Route path="static/:pageId" element={<Page />} />
          <Route path="*" element={<Page />} />
        </Routes>
      </S.Content>
    </S.ContentWrapper>
  )
}
