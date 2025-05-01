import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from 'components/atoms/Button';
import { URLS } from 'helpers/config';
import { PortalRolesType, ViewLayoutType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import { User } from '../User';

import * as S from './styles';

export default function UserList(props: { type: ViewLayoutType }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	function getHeader() {
		switch (props.type) {
			case 'header':
				return (
					<S.UsersHeaderDetails className={'border-wrapper-alt3'}>
						<p>{language.users}</p>
						<S.PostsHeaderDetailsActions>
							<Button
								type={'alt3'}
								label={language.usersLink}
								handlePress={() => navigate(URLS.portalUsers(portalProvider.current.id))}
							/>
						</S.PostsHeaderDetailsActions>
					</S.UsersHeaderDetails>
				);
			case 'detail':
				return null;
			default:
				return null;
		}
	}

	const users = React.useMemo(() => {
		if (!portalProvider.current?.users) {
			return (
				<S.LoadingWrapper type={props.type}>
					<p>{`${language.gettingUsers}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.users.length === 0) {
			return (
				<S.WrapperEmpty type={props.type}>
					<p>{language.noUsersFound}</p>
				</S.WrapperEmpty>
			);
		}

		return portalProvider.current?.id ? (
			<S.UsersWrapper type={props.type}>
				{portalProvider.current.users.map((user: PortalRolesType) => {
					return <User user={user} key={user.address} />;
				})}
			</S.UsersWrapper>
		) : null;
	}, [portalProvider, portalProvider.current?.id, portalProvider.current?.users, language]);

	return (
		<S.Wrapper>
			{getHeader()}
			{users}
		</S.Wrapper>
	);
}
