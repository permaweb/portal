import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { useLanguageProvider } from 'providers/LanguageProvider';
import * as S from './styles';
import { UndernameRequestList } from 'editor/components/organisms/UndernameRequestList';
import { UndernamesList } from 'editor/components/organisms/UndernamesList';
import { AddController } from 'editor/components/molecules/AddController';

export default function Admin() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language?.subdomains ?? 'Sub-Domains'} actions={[<AddController />]} />
			<S.SubdomainsWrapper className={'fade-in'}>
				<UndernameRequestList isAdminView />
				<UndernamesList isAdminView />
			</S.SubdomainsWrapper>
		</S.Wrapper>
	);
}
