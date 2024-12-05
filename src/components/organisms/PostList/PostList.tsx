import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { formatDate } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
// import { IconButton } from 'components/atoms/IconButton';
import { ASSETS, URLS } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

// TODO: Pagination / sorting
export default function PostList() {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	if (!portalProvider.current?.assets) {
		return (
			<S.LoadingWrapper>
				<p>{`${language.gettingPosts}...`}</p>
			</S.LoadingWrapper>
		);
	} else if (portalProvider.current?.assets.length === 0) {
		return (
			<S.WrapperEmpty>
				<p>{language.noPostsFound}</p>
			</S.WrapperEmpty>
		);
	}

	return portalProvider.current?.id ? (
		<S.Wrapper>
			<S.PostsWrapper>
				{portalProvider.current.assets
					.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
					.map((asset: any) => {
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
											handlePress={() => navigate(`${URLS.postEditArticle(portalProvider.current.id)}${asset.id}`)}
										/>
										<Button
											type={'alt3'}
											label={language.view}
											handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
										/>
										{/* <IconButton
											type={'primary'}
											active={false}
											src={ASSETS.listUnordered}
											handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
											dimensions={{ wrapper: 23.5, icon: 13.5 }}
											tooltip={language.moreActions}
											tooltipPosition={'bottom-right'}
										/> */}
									</S.PostActions>
									{asset.status && (
										<S.PostStatus status={asset.status as ArticleStatusType}>
											<p>{asset.status}</p>
											<div id={'post-status'} />
										</S.PostStatus>
									)}
								</S.PostDetail>
							</S.PostWrapper>
						);
					})}
			</S.PostsWrapper>
		</S.Wrapper>
	) : null;
}
