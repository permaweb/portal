import React from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from 'engine/hooks/profiles';
import { checkValidAddress } from 'helpers/utils';
import { getTxEndpoint } from 'helpers/endpoints';
import SidebarArchive from '../archive';

import * as S from './styles';

export default function SidebarUser() {  
  const params = useParams();
  const { profile: user } = useProfile(params?.user)
  const [profile, setProfile] = React.useState<any>()

  React.useEffect(() => {
    if(user){
      setProfile(user)
    }    
  }, [user])    

  return (
    <S.SidebarUserWrapper>
      {profile && (
        <>
          <S.Header>
            <S.Banner>
              <img src={checkValidAddress(profile.banner) ? getTxEndpoint(profile.banner) : profile.banner} />
            </S.Banner>
            <S.Avatar>
              <img src={checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : profile.thumbnail} />
            </S.Avatar>
            <S.Name>{profile.displayName}</S.Name>          
          </S.Header>
          <S.Content>
            <S.Bio>{profile.description}</S.Bio>
          </S.Content>
          <SidebarArchive author={profile.id} />
        </>
      )}      
    </S.SidebarUserWrapper>
  )
}
