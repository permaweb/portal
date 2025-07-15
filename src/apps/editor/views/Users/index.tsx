import React from 'react';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { UserList } from 'editor/components/organisms/UserList';
import { UserManager } from 'editor/components/organisms/UserManager';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Users() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showAddUser, setShowAddUser] = React.useState<boolean>(false);

	return (
		<>
			<S.Wrapper className={'fade-in'}>
				<ViewHeader
					header={language?.users}
					actions={[
						<Button
							type={'alt1'}
							label={language?.addUser}
							handlePress={() => setShowAddUser(!showAddUser)}
							disabled={!portalProvider?.permissions?.updateUsers}
							icon={ASSETS.add}
							iconLeftAlign
						/>,
					]}
				/>

				<S.BodyWrapper>
					<UserList type={'detail'} />
					{!portalProvider?.permissions?.updateUsers && (
						<S.InfoWrapper className={'info'}>
							<span>{language?.unauthorizedUsersUpdate}</span>
						</S.InfoWrapper>
					)}
				</S.BodyWrapper>
			</S.Wrapper>
			<Panel
				open={showAddUser}
				width={500}
				header={language?.addUser}
				handleClose={() => setShowAddUser((prev) => !prev)}
				closeHandlerDisabled
			>
				<UserManager handleClose={() => setShowAddUser(false)} />
			</Panel>
		</>
	);
}
