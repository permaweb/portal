import React from 'react';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { UserList } from 'components/organisms/UserList';
import { UserManager } from 'components/organisms/UserManager';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

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
					header={language.users}
					actions={[
						<Button
							type={'alt1'}
							label={language.addUser}
							handlePress={() => setShowAddUser(!showAddUser)}
							disabled={!portalProvider?.permissions?.users}
							icon={ASSETS.add}
							iconLeftAlign
						/>,
					]}
				/>

				<S.BodyWrapper>
					<UserList type={'detail'} />
					{!portalProvider?.permissions?.users && (
						<S.InfoWrapper>
							<span>{language.userPermissionBlockedInfo}</span>
						</S.InfoWrapper>
					)}
				</S.BodyWrapper>
			</S.Wrapper>
			<Panel
				open={showAddUser}
				width={500}
				header={language.addUser}
				handleClose={() => setShowAddUser((prev) => !prev)}
				closeHandlerDisabled
			>
				<UserManager handleClose={() => setShowAddUser(false)} />
			</Panel>
		</>
	);
}
