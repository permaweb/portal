import { NavLink } from 'react-router-dom';
import { usePosts } from '../../../hooks/posts';
import * as S from './styles';

export default function MediaSpotlight(props: any) {  
  const { category, tag } = props;
  const { Posts, isLoading: isLoadingPosts } = usePosts({ category });

  return (
    <S.Wrapper>
      <h1>{category}</h1>
      <S.Podcasts>
        {Posts && Posts.slice(0, 3).map((post, index) => {
          return (
            <NavLink
              key={index}
              to={`/post/${post?.id}`}
              className={isLoadingPosts ? 'disabledLink' : ''}
            >
              <S.Podcast key={index}>
                <S.Meta>
                  {new Date(Number(post?.dateCreated)).toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                </S.Meta>
                <S.Thumbnail>
                  <img
                    src={!isLoadingPosts ? `https://arweave.net/${post?.metadata?.thumbnail}` : null}
                  />
                </S.Thumbnail>              
                <h3>{post.name}</h3>
              </S.Podcast>
            </NavLink>
          )
        })}
      </S.Podcasts>
    </S.Wrapper>
  );
    
};