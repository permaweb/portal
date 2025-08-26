import { NavLink } from 'react-router-dom';
import useNavigate from 'engine/helpers/preview';
import { useUI } from 'engine/hooks/portal';
import { useProfile } from 'engine/hooks/profiles';
import { useComments } from 'engine/hooks/comments';
import Placeholder from 'engine/components/placeholder';
import * as S from './styles';

export default function PostPreview_Default(props: any) {
  const navigate = useNavigate();
  const { Layout } = useUI();
  const { preview, post, loading } = props;  
  const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || null);
  const { comments, isLoading: isLoadingComments, error: errorComments } = useComments(post?.id || null, true);

  const Comment = (data: any) => {    
    const { data: comment } = data;
    const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(comment.creator || null);

    return (
      <S.Comment>
        <S.CommentHeader>
          <S.Avatar>
            <img src={`https://arweave.net/${profile?.thumbnail}`} />
          </S.Avatar>
          <S.Username>{profile?.displayName || '[[displayName]]'}</S.Username>
          <S.Date>{`${new Date(comment?.dateCreated || 'now').toLocaleDateString()} ${new Date(comment.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</S.Date>
        </S.CommentHeader>
        <S.CommentText>
          {comment?.content || '[[content]]'}
        </S.CommentText>
      </S.Comment>
    )
  }

  return (    
    <S.Post $layout={Layout && Layout.card}>
      <S.Categories>{
        post ? post?.metadata?.categories.map((category: any, index: number) => {
          return (
            <>
            <NavLink to={`/feed/category/${category.id}`}><S.Category key={index}>{category.name}</S.Category></NavLink>
              {index < post.metadata.categories.length - 1 && <>,&nbsp;</>}
            </>
          )
        }) : <Placeholder />}
      </S.Categories>
      <S.Content>        
        <img
          className="loadingThumbnail"
          onLoad={e => e.currentTarget.classList.remove('loadingThumbnail')}
          onClick={() => navigate(`/post/${post?.id}`)}
          src={post ? `https://arweave.net/${post?.metadata?.thumbnail}` : ''} 
        />
        <h2
          className={!post ? 'loadingPlaceholder' : ''}
          onClick={(e) => navigate(`/post/${post?.id}`)}
        >
          <span>{post ? post?.name : <Placeholder width="180" />}</span>
        </h2>
        <S.Meta>
          <S.SourceIcon
            className="loadingAvatar"
            onLoad={e => e.currentTarget.classList.remove('loadingAvatar')}
            src={!isLoadingProfile ? `https://arweave.net/${profile?.thumbnail}` : ''}
          />
          <S.Author
            onClick={() => navigate(`/user/${profile.id}`)}
          >
            {isLoadingProfile ? <Placeholder width="100" /> : profile?.displayName}
          </S.Author>
          <S.Date>
            {isLoadingProfile ? <Placeholder width="120" /> : `${new Date(Number(post.dateCreated)).toLocaleDateString()} ${new Date(Number(post.dateCreated)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </S.Date>
        </S.Meta>
        <p>{post?.metadata.description}</p>
      </S.Content>
      {
        (comments?.length > 0) && (
        <S.Comments>
          <h3>Comments</h3>
          {comments && comments.map((comment: any, index: any) => {
            return <Comment key={index} data={comment} />
          })}
        </S.Comments>
      )}
    </S.Post>
  )
}

