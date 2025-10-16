import { Fonts } from 'editor/components/molecules/Fonts';
import { Layout } from 'editor/components/molecules/Layout';
import { Media } from 'editor/components/molecules/Media';
import { Themes } from 'editor/components/molecules/Themes';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function DesignBasic() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.BodyWrapper>
			<S.SectionWrapper>
				<S.Section>
					<div className={'border-wrapper-alt2'} style={{ width: '100%', overflow: 'hidden' }}>
						<S.SectionHeader>
							<p>{language?.fonts}</p>
						</S.SectionHeader>
						<S.SectionBody>
							<Fonts />
						</S.SectionBody>
					</div>
				</S.Section>
				<S.Section>
					<div className={'border-wrapper-alt2'} style={{ width: '100%', overflow: 'hidden' }}>
						<S.SectionHeader>
							<p>{language?.images}</p>
						</S.SectionHeader>
						<S.SectionBody>
							<div>
								<S.MediaTitleWrapper>
									<S.MediaTitle>{language?.logo}</S.MediaTitle>
									<S.MediaInfo>{language?.recommended}: 500x280px (16:9)</S.MediaInfo>
								</S.MediaTitleWrapper>
								<S.MediaEntry>
									<Media portal={portalProvider.current} type={'logo'} />
								</S.MediaEntry>
							</div>
							<div>
								<S.MediaTitleWrapper>
									<S.MediaTitle>{language?.icon} (Favicon)</S.MediaTitle>
									<S.MediaInfo>{language?.recommended}: 32x32px (1:1)</S.MediaInfo>
								</S.MediaTitleWrapper>
								<S.MediaEntry>
									<Media portal={portalProvider.current} type={'icon'} />
								</S.MediaEntry>
							</div>
							<div>
								<S.MediaTitleWrapper>
									<S.MediaTitle>{language?.wallpaper}</S.MediaTitle>
									<S.MediaInfo>{language?.recommended}: 1920x1080px (16:9)</S.MediaInfo>
								</S.MediaTitleWrapper>
								<S.MediaEntryWallpaper>
									<Media portal={portalProvider.current} type={'wallpaper'} />
								</S.MediaEntryWallpaper>
							</div>
						</S.SectionBody>
					</div>
				</S.Section>
			</S.SectionWrapper>
			<S.SectionWrapper>
				<S.Section>
					<div className={'border-wrapper-alt2'} style={{ width: '100%', overflow: 'hidden' }}>
						<S.SectionHeader>
							<p>{language?.layout}</p>
						</S.SectionHeader>
						<S.SectionBody>
							<Layout />
						</S.SectionBody>
					</div>
				</S.Section>
				<S.Section>
					<div className={'border-wrapper-alt2'} style={{ width: '100%', overflow: 'hidden' }}>
						<S.SectionHeader>
							<p>{language?.themes}</p>
						</S.SectionHeader>
						<S.SectionBody>
							<Themes />
						</S.SectionBody>
					</div>
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
