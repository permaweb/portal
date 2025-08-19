

import React from 'react';
import { useUI } from 'engine/hooks/portal';
import { initThemes } from 'engine/services/themes'
import Comment from './comment';
import CommentAdd from './commentAdd';
import { usePermawebProvider } from 'providers/PermawebProvider';
import * as S from './styles';

export default function Comments(props: any) {  
  const { preview, assetId } = props;
  const { Themes } = useUI(true);
  const { libs } = usePermawebProvider();
  const [comments, setComments] = React.useState(null)

  React.useEffect(() => {
    if(preview){      
      initThemes(Themes)
      document.getElementById('preview')?.setAttribute('data-theme', 'dark')
    }    
  },[])

  React.useEffect(() => {
    (async function () {
      if(libs){
        try {
          const comments = await libs.getComments({ rootId: assetId })
          setComments(comments);
        } catch(e){
          console.error(e);
        }
      }      
    })()
  },[libs])

  return (
    <S.Comments>
      <h2>Comments</h2>
      <CommentAdd assetId={assetId} />
      <S.CommentList>
        {comments && comments.map((comment: any, index: string) => {
          return <Comment key={index} data={comment} level="0"/>
        })}
      </S.CommentList>
    </S.Comments>
  )
}