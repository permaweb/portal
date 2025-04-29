import React from 'react';

import { Button } from 'components/atoms/Button';
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
			{showAddUser && (
				<S.BodyWrapper className={'border-wrapper-primary'}>
					<UserAdd />
				</S.BodyWrapper>
			)}

			<S.BodyWrapper className={'border-wrapper-primary'}>
				{/* user add -> form with button: paste address, select role. */}

				<UserList />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
