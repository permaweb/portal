import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

// TODO: Portal auth
export default function Portal() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<S.HeaderWrapper>
				<h4>Your portal</h4>
				<Button type={'alt1'} label={language.createPost} handlePress={() => {}} icon={ASSETS.add} iconLeftAlign />
			</S.HeaderWrapper>
			<S.BodyWrapper>
				<S.SectionWrapper>
					<S.DesignSection className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.design}</p>
						</S.SectionHeader>
						<S.SectionBody></S.SectionBody>
					</S.DesignSection>
					<S.DomainSection className={'border-wrapper-alt3'}>
						<S.SectionHeader>
							<p>{language.domain}</p>
						</S.SectionHeader>
						<S.SectionBody></S.SectionBody>
					</S.DomainSection>
					<S.UsersSection className={'border-wrapper-alt3'}>
						<S.SectionHeader>
							<p>{language.users}</p>
						</S.SectionHeader>
						<S.SectionBody></S.SectionBody>
					</S.UsersSection>
				</S.SectionWrapper>
				<S.SectionWrapper>
					<S.PostsSection className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.posts}</p>
						</S.SectionHeader>
						<S.SectionBody></S.SectionBody>
					</S.PostsSection>
				</S.SectionWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
