import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { formatDate } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { ASSETS, URLS } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

// TODO: Pagination
export default function PostList(props: IProps) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [currentStatusFilter, setCurrentStatusFilter] = React.useState<ArticleStatusType | 'all'>('all');
	const [dateAscending, setDateAscending] = React.useState<boolean>(false);

	const posts = React.useMemo(() => {
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

		const totalCount = portalProvider.current?.assets?.length || '-';
		const publishedCount =
			portalProvider.current?.assets?.filter((asset: any) => asset.status === 'published').length || '-';
		const draftCount = portalProvider.current?.assets?.filter((asset: any) => asset.status === 'draft').length || '-';

		return (
			<>
				<S.PostsActions>
					<S.PostsStatusFilterWrapper>
						<Button
							type={'alt3'}
							label={`${language.all} (${totalCount})`}
							handlePress={() => setCurrentStatusFilter('all')}
							active={currentStatusFilter === 'all'}
						/>
						<Button
							type={'alt3'}
							label={`${language.published} (${publishedCount})`}
							handlePress={() => setCurrentStatusFilter('published')}
							active={currentStatusFilter === 'published'}
						/>
						<Button
							type={'alt3'}
							label={`${language.draft} (${draftCount})`}
							handlePress={() => setCurrentStatusFilter('draft')}
							active={currentStatusFilter === 'draft'}
						/>
					</S.PostsStatusFilterWrapper>
					<S.PostsSortingWrapper>
						<Button
							type={'alt2'}
							label={dateAscending ? language.sortOldestToNewest : language.sortNewestToOldest}
							handlePress={() => setDateAscending(!dateAscending)}
							icon={ASSETS.arrows}
						/>
					</S.PostsSortingWrapper>
				</S.PostsActions>
				<S.PostsWrapper>
					{portalProvider.current.assets
						.filter((asset: any) => currentStatusFilter === 'all' || asset.status === currentStatusFilter) // Filter assets
						.sort((a, b) => {
							const dateA = new Date(a.dateCreated).getTime();
							const dateB = new Date(b.dateCreated).getTime();
							return dateAscending ? dateA - dateB : dateB - dateA;
						})
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
											<IconButton
												type={'primary'}
												active={false}
												src={ASSETS.listUnordered}
												handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
												dimensions={{ wrapper: 25, icon: 15 }}
												tooltip={language.moreActions}
												tooltipPosition={'bottom-right'}
											/>
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
			</>
		);
	}, [portalProvider.current?.id, portalProvider.current?.assets, currentStatusFilter, dateAscending]);

	return (
		<S.Wrapper>
			{props.useHeader && (
				<S.PostsHeader className={'border-wrapper-alt3'}>
					<p>{language.posts}</p>
					<Button
						type={'alt3'}
						label={language.postsLink}
						handlePress={() => navigate(URLS.portalPosts(portalProvider.current.id))}
					/>
				</S.PostsHeader>
			)}
			{posts}
		</S.Wrapper>
	);
}
