import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function PostSpotlightBlock(_props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const banner = permawebProvider.profile?.banner;
	const hasBanner = banner && checkValidAddress(banner);

	const avatar = permawebProvider.profile?.thumbnail;
	const hasAvatar = avatar && checkValidAddress(avatar);

	return (
		<S.Wrapper>
			<S.BannerWrapper hasImage={!!hasBanner}>
				{hasBanner ? <img src={getTxEndpoint(banner)} alt={'Banner'} /> : <span>Banner</span>}
			</S.BannerWrapper>
			<S.AvatarWrapper hasImage={!!hasAvatar}>
				{hasAvatar ? <img src={getTxEndpoint(avatar)} alt={'Avatar'} /> : <span>Avatar</span>}
			</S.AvatarWrapper>
			<S.ContentPlaceholderSection>
				<span>{`${language.archive}`}</span>
				<S.ContentPlaceholderLine flex={0.5} />
				<S.ContentPlaceholderLine flex={0.5} />
				<S.ContentPlaceholderLine flex={0.5} />
				<S.ContentPlaceholderLine flex={0.5} />
			</S.ContentPlaceholderSection>
		</S.Wrapper>
	);
}
