import { Button } from 'components/atoms/Button';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { UserList } from 'components/organisms/UserList';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Users() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language.users}
				actions={[
					<Button
						type={'alt1'}
						label={language.addUser}
						handlePress={() => {}}
						disabled={false}
						icon={ASSETS.add}
						iconLeftAlign
					/>,
				]}
			/>
			<S.BodyWrapper className={'border-wrapper-primary'}>
				<UserList />
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
