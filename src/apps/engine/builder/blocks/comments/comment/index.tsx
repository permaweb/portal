import React from 'react';
import Icon from 'engine/components/icon';
import * as ICONS from 'engine/constants/icons';
import { useProfile } from 'engine/hooks/profiles';
import CommentAdd from '../commentAdd';
import Placeholder from 'engine/components/placeholder';
import * as S from './styles';

export default function Comment(props: any) {
  const { data, level } = props;
  const { profile, isLoading: isLoadingProfile } = useProfile(data.creator)
  const [showEditor, setShowEditor] = React.useState(false);

  return data ? (
    <S.Wrapper>
      <S.Comment $level={level}>
        <S.Avatar>
          <img
            className="loadingAvatar"
            onLoad={e => e.currentTarget.classList.remove('loadingAvatar')}
            src={!isLoadingProfile ? `http://arweave.net/${profile.thumbnail}` : null}
          />
        </S.Avatar>
        <S.Content>
          <S.Meta>
            <S.Username>{isLoadingProfile ? <Placeholder /> : profile?.displayName}</S.Username>
            <S.Date>{!data?.dateCreated ? <Placeholder /> : new Date(data.dateCreated).toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</S.Date>
          </S.Meta>
          <S.Text>{data.content}</S.Text>
          <S.Actions>
            <S.Action onClick={() => setShowEditor(true)}>
              <Icon icon={ICONS.REPLY} />Reply
            </S.Action>
            {/* <S.Action><ReactSVG src={`img/icons/arrow_up.svg`} />Up</S.Action> */}
            {/* <S.Action><ReactSVG src={`img/icons/arrow_down.svg`} />Down</S.Action> */}
          </S.Actions>
        </S.Content>
      </S.Comment>
      {showEditor && <CommentAdd parentId={data.id} />}
    </S.Wrapper>
  ) : null;
}