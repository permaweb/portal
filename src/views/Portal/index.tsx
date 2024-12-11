import { useNavigate } from 'react-router-dom';

import { Button } from 'components/atoms/Button';
import { ViewHeader } from 'components/atoms/ViewHeader';
import { DomainList } from 'components/organisms/DomainList';
import { PortalDesign } from 'components/organisms/PortalDesign';
import { PortalSetup } from 'components/organisms/PortalSetup';
import { PostList } from 'components/organisms/PostList';
import { UserList } from 'components/organisms/UserList';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function Portal() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language.portalHeader}
				actions={[
					<Button
						type={'primary'}
						label={language.goToSite}
						handlePress={() => console.log('TODO: Go to site')}
						disabled={!portalProvider.current}
						iconLeftAlign
					/>,
					<Button
						type={'alt1'}
						label={language.createPost}
						handlePress={() => navigate(URLS.postCreateArticle(portalProvider.current.id))}
						disabled={!portalProvider.current}
						icon={ASSETS.add}
						iconLeftAlign
					/>,
				]}
			/>
			<S.BodyWrapper>
				<S.SectionWrapper>
					<S.SetupSection className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.setup}</p>
							<Button
								type={'alt3'}
								label={language.setupLink}
								handlePress={() => navigate(URLS.portalSetup(portalProvider.current.id))}
							/>
						</S.SectionHeader>
						<S.SectionBody>
							<PortalSetup type={'header'} />
						</S.SectionBody>
					</S.SetupSection>
					<S.DesignSection className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.design}</p>
							<Button
								type={'alt3'}
								label={language.designLink}
								handlePress={() => navigate(URLS.portalDesign(portalProvider.current.id))}
							/>
						</S.SectionHeader>
						<S.SectionBody>
							<PortalDesign />
						</S.SectionBody>
					</S.DesignSection>
				</S.SectionWrapper>
				<S.SectionWrapper>
					<S.PostsSection>
						<S.SectionBody>
							<PostList useHeaderDetails />
						</S.SectionBody>
					</S.PostsSection>
					<S.UsersSection className={'border-wrapper-alt3'}>
						<S.SectionHeader>
							<p>{language.users}</p>
							<Button
								type={'alt3'}
								label={language.usersLink}
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
								label={language.domainsLink}
								handlePress={() => navigate(URLS.portalDomains(portalProvider.current.id))}
							/>
						</S.SectionHeader>
						<S.SectionBody>
							<DomainList />
						</S.SectionBody>
					</S.DomainSection>
				</S.SectionWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
