import React from 'react';
import { useParams } from 'react-router-dom';
import { useUI } from 'engine/hooks/portal';
import { usePosts } from 'engine/hooks/posts';
import PostPreview from './postPreview';
import * as S from './styles';

export default function Feed(props?: any) {
  const { preview } = props;
  const params = useParams();
  const { Name } = useUI(preview);
  const filters = {
    category: params.category ?? props.category ?? null,
    tags: params.tag ? [params.tag] : null,
    author: (params.author ?? params.user) ?? null,
    search: params.search ?? null,
    date: params.year ? { year: +params.year, month: +params.month } : null
  };
  const { Posts, Title } = Object.values(filters).some(Boolean) ? usePosts(filters) : usePosts({ preview });

  React.useEffect(() => {
    if(Title){
      // @ts-ignore
      document.title = `${Title} - ${Name}`;
    }
  },[Title])

  return (
    <S.Feed width={props?.width}>
      {params.search && (
        <S.FeedHeader>
          <span>Search results</span>
          <h1>{params.search}</h1>
          <p>{Posts.length} posts</p>
        </S.FeedHeader>
      )}
      {Posts 
        ? Object.keys(Posts).map((key) => <PostPreview key={Posts[key].Id} post={Posts[key]} layout={props?.layout} />) 
        : <>
            <PostPreview loading key={0} />
            <PostPreview loading key={1} />
            <PostPreview loading key={2} />
          </>}
    </S.Feed>
  )
}

