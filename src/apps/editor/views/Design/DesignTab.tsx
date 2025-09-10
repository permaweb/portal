import { Fonts } from 'editor/components/molecules/Fonts';
import { Media } from 'editor/components/molecules/Media';
import { Themes } from 'editor/components/molecules/Themes';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function DesignTab() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.BodyWrapper>
			<S.SectionWrapper>
				<S.Section className={'border-wrapper-alt2'}>
					<S.SectionHeader>
						<p>{language?.fonts}</p>
					</S.SectionHeader>
					<Fonts />
				</S.Section>
				<Media portal={portalProvider.current} type={'logo'} />
				<S.Section className={'border-wrapper-alt2'}>
					<Media portal={portalProvider.current} type={'icon'} />
				</S.Section>
			</S.SectionWrapper>
			<S.SectionWrapper>
				<S.Section className={'border-wrapper-alt2'}>
					<S.SectionHeader>
						<p>{language?.themes}</p>
					</S.SectionHeader>
					<Themes />
				</S.Section>
				{!portalProvider?.permissions?.updatePortalMeta && (
					<S.InfoWrapper className={'warning'}>
						<span>{language?.unauthorizedPortalUpdate}</span>
					</S.InfoWrapper>
				)}
			</S.SectionWrapper>
		</S.BodyWrapper>
	);
}
