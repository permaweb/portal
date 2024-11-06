import { ReactSVG } from 'react-svg';

import { AssetHeaderType, formatDate } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';
import { getTagValue } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

// TODO: Mobile
// TODO: Post edit
// TODO: Post link
export default function PostList() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return portalProvider.current && portalProvider.current.assets ? (
		<S.Wrapper>
			{portalProvider.current.assets
				.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
				.map((asset: AssetHeaderType) => {
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
								{asset.tags && getTagValue(asset.tags, 'Status') && (
									<S.PostStatus status={getTagValue(asset.tags, 'Status') as ArticleStatusType}>
										<p>{`Status: ${getTagValue(asset.tags, 'Status')}`}</p>
										<div id={'post-status'} />
									</S.PostStatus>
								)}
								<S.PostActions>
									<Button
										type={'alt1'}
										label={language.edit}
										handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
										height={23.5}
									/>
									<Button
										type={'primary'}
										label={language.view}
										handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
										height={23.5}
									/>
								</S.PostActions>
							</S.PostDetail>
						</S.PostWrapper>
					);
				})}
		</S.Wrapper>
	) : null;
}
