import { useNavigate } from 'react-router-dom';

import { Button } from 'components/atoms/Button';
import { DomainList } from 'components/organisms/DomainList';
import { PortalSetup } from 'components/organisms/PortalSetup';
import { PostList } from 'components/organisms/PostList';
import { UserList } from 'components/organisms/UserList';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

// TODO: Portal auth
export default function Portal() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<S.HeaderWrapper>
				<h4>{language.portalHeader}</h4>
				<Button
					type={'alt1'}
					label={language.createPost}
					handlePress={() => navigate(URLS.postCreateArticle(portalProvider.current.id))}
					disabled={!portalProvider.current}
					icon={ASSETS.add}
					iconLeftAlign
				/>
			</S.HeaderWrapper>
			<S.BodyWrapper>
				<S.SectionWrapper>
					<S.DesignSection className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.design}</p>
						</S.SectionHeader>
						<S.SectionBody></S.SectionBody>
					</S.DesignSection>
					<S.SetupSection className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.setup}</p>
						</S.SectionHeader>
						<S.SectionBody>
							<PortalSetup type={'Header'} />
						</S.SectionBody>
					</S.SetupSection>
					<S.UsersSection className={'border-wrapper-alt3'}>
						<S.SectionHeader>
							<p>{language.users}</p>
							<Button
								type={'alt3'}
								label={'Manage users'}
								handlePress={() => navigate(URLS.portalUsers(portalProvider.current.id))}
							/>
						</S.SectionHeader>
						<S.SectionBody>
							<UserList />
						</S.SectionBody>
					</S.UsersSection>
					<S.DomainSection className={'border-wrapper-alt3'}>
						<S.SectionHeader>
							<p>{language.domains}</p>
							<Button
								type={'alt3'}
								label={'Manage domains'}
								handlePress={() => navigate(URLS.portalDomains(portalProvider.current.id))}
							/>
						</S.SectionHeader>
						<S.SectionBody>
							<DomainList />
						</S.SectionBody>
					</S.DomainSection>
				</S.SectionWrapper>
				<S.SectionWrapper>
					<S.PostsSection className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.posts}</p>
						</S.SectionHeader>
						<S.SectionBody>
							<PostList />
						</S.SectionBody>
					</S.PostsSection>
				</S.SectionWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
