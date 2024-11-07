import { useMemo } from 'react';
import { ReactSVG } from 'react-svg';

import { AssetHeaderType, formatDate } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { ASSETS } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';
import { getTagValue } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function PostList() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const posts = useMemo(() => {
		console.log(portalProvider.current);
		if (!portalProvider.current?.assets) {
			return (
				<S.LoadingWrapper>
					<Loader sm relative />
				</S.LoadingWrapper>
			);
		} else if (portalProvider.current?.assets.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noPostsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<S.Wrapper>
				{portalProvider.current.assets
					.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
					.map((asset: AssetHeaderType) => {
						const status = asset.tags && (getTagValue(asset.tags, 'Status') as ArticleStatusType);

						return (
							<S.PostWrapper key={asset.id} className={'fade-in'}>
								<S.PostHeader>
									<p>{asset.title}</p>
									<span>
										<ReactSVG src={ASSETS.time} />
										{formatDate(asset.dateCreated, 'iso', true)}
									</span>
								</S.PostHeader>
								<S.PostDetail>
									<S.PostActions>
										<Button
											type={'alt3'}
											label={language.edit}
											handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
										/>
										<Button
											type={'alt3'}
											label={language.view}
											handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
										/>
										<IconButton
											type={'primary'}
											active={false}
											src={ASSETS.listUnordered}
											handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
											dimensions={{ wrapper: 23.5, icon: 13.5 }}
											tooltip={language.moreActions}
											tooltipPosition={'bottom-right'}
										/>
									</S.PostActions>
									{status && (
										<S.PostStatus status={status as ArticleStatusType}>
											<p>{status}</p>
											<div id={'post-status'} />
										</S.PostStatus>
									)}
								</S.PostDetail>
							</S.PostWrapper>
						);
					})}
			</S.Wrapper>
		);
	}, [portalProvider, languageProvider, portalProvider.current?.assets, language]);

	return posts;
}
