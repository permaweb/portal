import { Fonts } from 'editor/components/molecules/Fonts';
import { Layout } from 'editor/components/molecules/Layout';
import { Media } from 'editor/components/molecules/Media';
import { Themes } from 'editor/components/molecules/Themes';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { URLTabs } from 'components/atoms/URLTabs';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

function LayoutView() {
	return (
		<S.ViewWrapper>
			<Layout />
		</S.ViewWrapper>
	);
}

function ThemesView() {
	return (
		<S.ViewWrapper>
			<Themes />
		</S.ViewWrapper>
	);
}

function FontsView() {
	return (
		<S.ViewWrapper>
			<Fonts />
		</S.ViewWrapper>
	);
}

function ImagesView() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.ViewWrapper>
			<S.FlexWrapper>
				<S.FlexSection flex={1.5}>
					<S.MediaTitleWrapper>
						<S.MediaTitle>{language?.logo}</S.MediaTitle>
					</S.MediaTitleWrapper>
					<S.MediaEntryLogo>
						<Media portal={portalProvider.current} type={'logo'} hideActions />
						<S.MediaInfo>{language?.recommended}: 500x280px (16:9)</S.MediaInfo>
					</S.MediaEntryLogo>
				</S.FlexSection>
				<S.FlexSection flex={0.25}>
					<S.IconTitleWrapper>
						<S.MediaTitle>{language?.icon} (Favicon)</S.MediaTitle>
					</S.IconTitleWrapper>
					<S.MediaEntryIcon>
						<Media portal={portalProvider.current} type={'icon'} hideActions />
						<S.MediaInfo>{language?.recommended}: 32x32px (1:1)</S.MediaInfo>
					</S.MediaEntryIcon>
				</S.FlexSection>
			</S.FlexWrapper>
			<S.FlexWrapper>
				<S.FlexSection flex={1}>
					<S.MediaTitleWrapper>
						<S.MediaTitle>{language?.wallpaper}</S.MediaTitle>
					</S.MediaTitleWrapper>
					<S.MediaEntryWallpaper>
						<Media portal={portalProvider.current} type={'wallpaper'} hideActions />
						<S.MediaInfo>{language?.recommended}: 1920x1080px (16:9)</S.MediaInfo>
					</S.MediaEntryWallpaper>
				</S.FlexSection>
			</S.FlexWrapper>
		</S.ViewWrapper>
	);
}

export default function DesignBasic() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const id = portalProvider.current?.id;

	if (!id) return null;

	const tabs = [
		{
			label: language?.themes || 'Themes',
			disabled: false,
			url: `/${id}/design/themes`,
			view: ThemesView,
		},
		{
			label: language?.layout || 'Layout',
			disabled: false,
			url: `/${id}/design/layout`,
			view: LayoutView,
		},
		{
			label: language?.fonts || 'Fonts',
			disabled: false,
			url: `/${id}/design/fonts`,
			view: FontsView,
		},
		{
			label: language?.images || 'Images',
			disabled: false,
			url: `/${id}/design/images`,
			view: ImagesView,
		},
	];

	return (
		<S.BodyWrapper>
			{!portalProvider?.permissions?.updatePortalMeta && (
				<S.InfoWrapper className={'warning'}>
					<span>{language?.unauthorizedPortalUpdate}</span>
				</S.InfoWrapper>
			)}
			<URLTabs tabs={tabs} activeUrl={`/${id}/design/themes`} />
		</S.BodyWrapper>
	);
}
