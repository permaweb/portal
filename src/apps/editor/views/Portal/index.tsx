import { useNavigate } from 'react-router-dom';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { DomainListPortal } from 'editor/components/organisms/DomainListPortal';
import { PortalDesign } from 'editor/components/organisms/PortalDesign';
import { PortalSetup } from 'editor/components/organisms/PortalSetup';
import { PostList } from 'editor/components/organisms/PostList';
import { UserList } from 'editor/components/organisms/UserList';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Drawer } from 'components/atoms/Drawer';
import { ICONS, URLS } from 'helpers/config';
import { resolvePrimaryDomain } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Portal() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	/* User is a moderator and can only review existing posts, not create new ones */
	const unauthorized = !portalProvider.permissions?.postAutoIndex && !portalProvider.permissions?.postRequestIndex;

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader
				header={language?.portalHeader}
				actions={[
					<Button
						type={'primary'}
						label={language?.goToSite}
						handlePress={() =>
							window.open(resolvePrimaryDomain(portalProvider.current?.domains, portalProvider.current?.id))
						}
						disabled={!portalProvider.current}
						icon={ICONS.site}
						iconLeftAlign
					/>,
					<Button
						type={'alt1'}
						label={language?.createPost}
						handlePress={() => navigate(URLS.postCreateArticle(portalProvider.current.id))}
						disabled={unauthorized || !portalProvider.current}
						icon={ICONS.add}
						iconLeftAlign
					/>,
				]}
			/>
			<S.BodyWrapper>
				<S.SectionWrapper>
					<S.PostsSection>
						<S.SectionBody>
							<PostList type={'header'} pageCount={5} />
						</S.SectionBody>
					</S.PostsSection>
					<S.DesignSection>
						<Drawer
							title={language?.design}
							content={<PortalDesign />}
							actions={[
								<Button
									type={'alt3'}
									label={language?.designLink}
									handlePress={() => navigate(URLS.portalDesign(portalProvider.current.id))}
								/>,
							]}
						/>
					</S.DesignSection>
					<S.DomainSection>
						<Drawer
							title={language?.domains}
							content={<DomainListPortal type={'header'} />}
							actions={[
								<Button
									type={'alt3'}
									label={language?.domainsLink}
									handlePress={() => navigate(URLS.portalDomains(portalProvider.current.id))}
								/>,
							]}
						/>
					</S.DomainSection>
				</S.SectionWrapper>
				<S.SectionWrapper>
					<S.SetupSection>
						<Drawer
							title={language?.setup}
							content={<PortalSetup type={'header'} />}
							actions={[
								<Button
									type={'alt3'}
									label={language?.setupLink}
									handlePress={() => navigate(URLS.portalSetup(portalProvider.current.id))}
								/>,
							]}
						/>
					</S.SetupSection>
					<S.UsersSection>
						<S.SectionBody>
							<UserList type={'header'} />
						</S.SectionBody>
					</S.UsersSection>
				</S.SectionWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
