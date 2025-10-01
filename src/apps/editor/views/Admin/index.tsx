import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { useLanguageProvider } from 'providers/LanguageProvider';
import * as S from './styles';
import { UndernameRequestList } from 'editor/components/organisms/UndernameRequestList';
import { UndernamesList } from 'editor/components/organisms/UndernamesList';
import { AddController } from 'editor/components/molecules/AddController';
import { useUndernamesProvider } from 'providers/UndernameProvider';

export default function Admin() {
	const undernamesProvider = useUndernamesProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	if (!undernamesProvider.isLoggedInUserController) {
		return (
			<S.Wrapper className={'fade-in'}>
				<S.InfoWrapper className={'warning'}>
					<span>{language?.unauthorizedAdminView ?? 'You are not authorized to view this page.'}</span>
				</S.InfoWrapper>
			</S.Wrapper>
		);
	}
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
