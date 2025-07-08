import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { Fonts } from 'editor/components/molecules/Fonts';
import { Logo } from 'editor/components/molecules/Logo';
import { Themes } from 'editor/components/molecules/Themes';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

// TODO: Favicon
export default function Design() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.Wrapper className={'fade-in'}>
			<ViewHeader header={language.design} />
			<S.BodyWrapper>
				<S.SectionWrapper>
					<S.Section className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.themes}</p>
						</S.SectionHeader>
						<Themes />
					</S.Section>
					{!portalProvider?.permissions?.updateUsers && (
						<S.InfoWrapper className={'info'}>
							<span>{language.unauthorizedPortalUpdate}</span>
						</S.InfoWrapper>
					)}
				</S.SectionWrapper>
				<S.SectionWrapper>
					<S.Section className={'border-wrapper-alt2'}>
						<S.SectionHeader>
							<p>{language.fonts}</p>
						</S.SectionHeader>
						<Fonts />
					</S.Section>
					<Logo portal={portalProvider.current} />
				</S.SectionWrapper>
			</S.BodyWrapper>
		</S.Wrapper>
	);
}
