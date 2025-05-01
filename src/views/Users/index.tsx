import React from 'react';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { ViewHeader } from 'components/atoms/ViewHeader';
import UserAdd from 'components/organisms/UserAdd/UserAdd';
import { UserList } from 'components/organisms/UserList';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Users() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showAddUser, setShowAddUser] = React.useState(false);

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
							disabled={false}
							icon={ASSETS.add}
							iconLeftAlign
						/>,
					]}
				/>

				<S.BodyWrapper>
					<UserList type={'detail'} />
				</S.BodyWrapper>
			</S.Wrapper>
			<Panel
				open={showAddUser}
				width={500}
				header={language.addUser}
				handleClose={() => setShowAddUser((prev) => !prev)}
				closeHandlerDisabled
			>
				<UserAdd handleClose={() => setShowAddUser(false)} />
			</Panel>
		</>
	);
}
