import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { MediaLibrary } from 'editor/components/organisms/MediaLibrary';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Media() {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	return (
		<>
			<S.Wrapper>
				<ViewHeader
					header={language?.media}
					actions={[
						<S.BalanceWrapper className={'border-wrapper-alt3'}>
							<p>
								{arProvider.arBalance == null
									? `${language?.loading}...`
									: `${Number(arProvider.arBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })} AR`}
							</p>
						</S.BalanceWrapper>,
					]}
				/>
				<S.BodyWrapper>
					<S.MediaWrapper className={'border-wrapper-alt2'}>
						<MediaLibrary type={'image'} columns={6} />
					</S.MediaWrapper>
					<S.MediaWrapper className={'border-wrapper-alt2'}>
						<MediaLibrary type={'video'} columns={6} />
					</S.MediaWrapper>
				</S.BodyWrapper>
				{!portalProvider?.permissions?.updatePortalMeta && (
					<S.InfoWrapper className={'warning'}>
						<span>{language?.unauthorizedPortalUpdateMedia}</span>
					</S.InfoWrapper>
				)}
			</S.Wrapper>
		</>
	);
}
