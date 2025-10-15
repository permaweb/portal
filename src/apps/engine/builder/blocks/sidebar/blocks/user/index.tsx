import React from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from 'engine/hooks/profiles';

import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';

import SidebarArchive from '../archive';

import * as S from './styles';

export default function SidebarUser() {
	const params = useParams();
	const { profile } = useProfile(params?.user);

	return (
		<S.SidebarUserWrapper>
			<S.Header>
				<S.Banner>
					{profile.banner && (
						<img src={checkValidAddress(profile.banner) ? getTxEndpoint(profile.banner) : profile.banner} />
					)}
				</S.Banner>
				<S.Avatar>
					{profile.thumbnail && (
						<img src={checkValidAddress(profile.thumbnail) ? getTxEndpoint(profile.thumbnail) : profile.thumbnail} />
					)}
				</S.Avatar>
				<S.Name>{profile.displayName}</S.Name>
			</S.Header>
			<S.Content>
				<S.Bio>{profile.description}</S.Bio>
			</S.Content>
			<SidebarArchive author={profile.id} />
		</S.SidebarUserWrapper>
	);
}
