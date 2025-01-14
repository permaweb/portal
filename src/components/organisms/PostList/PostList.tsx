import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { ASSETS, URLS } from 'helpers/config';
import { ArticleStatusType, ButtonType, PortalAssetType } from 'helpers/types';
import { formatDate } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { IProps } from './types';

export default function PostList(props: IProps) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [currentPage, setCurrentPage] = React.useState<number>(1);
	const [pageCount, _setPageCount] = React.useState<number>(props.pageCount || 10);
	const [currentStatusFilter, setCurrentStatusFilter] = React.useState<ArticleStatusType | 'all'>('all');
	const [dateAscending, setDateAscending] = React.useState<boolean>(false);
	const [showFilterActions, setShowFilterActions] = React.useState<boolean>(false);

	const totalCount = portalProvider.current?.assets?.length ?? '-';
	const publishedCount =
		portalProvider.current?.assets?.filter((asset: any) => asset.status === 'published').length ?? '-';
	const draftCount = portalProvider.current?.assets?.filter((asset: any) => asset.status === 'draft').length ?? '-';

	React.useEffect(() => {
		setCurrentPage(1);
	}, [currentStatusFilter]);

	const assets = React.useMemo(() => {
		if (!portalProvider.current?.assets) return [];
		return portalProvider.current.assets
			.filter((asset: any) => currentStatusFilter === 'all' || asset.status === currentStatusFilter)
			.sort((a, b) => {
				const dateA = new Date(a.dateCreated).getTime();
				const dateB = new Date(b.dateCreated).getTime();
				return dateAscending ? dateA - dateB : dateB - dateA;
			});
	}, [portalProvider.current?.assets, currentStatusFilter, dateAscending]);

	const totalPages = Math.ceil(assets.length / pageCount);

	const paginatedPosts = React.useMemo(() => {
		const startIndex = (currentPage - 1) * pageCount;
		const endIndex = startIndex + pageCount;
		return assets.slice(startIndex, endIndex);
	}, [assets, currentPage]);

	const currentRange = React.useMemo(() => {
		const start = (currentPage - 1) * pageCount + 1;
		const end = Math.min(currentPage * pageCount, assets.length);
		return { start, end };
	}, [currentPage, assets.length]);

	function getFilterActions(dropdown: boolean) {
		let filterOptionType: ButtonType = 'primary';
		let sortOptionType: ButtonType = 'primary';

		if (dropdown) {
			filterOptionType = 'alt3';
			sortOptionType = 'alt3';
		}

		function handleActionPress(fn: () => void) {
			if (dropdown) setShowFilterActions(false);
			fn();
		}

		return (
			<S.PostsActions dropdown={dropdown}>
				<S.PostsActionsSection dropdown={dropdown}>
					{dropdown && (
						<S.PostsActionsSectionHeader>
							<p>{language.filterBy}</p>
						</S.PostsActionsSectionHeader>
					)}
					<S.PostsStatusFilterWrapper>
						<Button
							type={filterOptionType}
							label={`${language.all} (${totalCount})`}
							handlePress={() => handleActionPress(() => setCurrentStatusFilter('all'))}
							active={currentStatusFilter === 'all'}
						/>
						<Button
							type={filterOptionType}
							label={`${language.published} (${publishedCount})`}
							handlePress={() => handleActionPress(() => setCurrentStatusFilter('published'))}
							active={currentStatusFilter === 'published'}
						/>
						<Button
							type={filterOptionType}
							label={`${language.draft} (${draftCount})`}
							handlePress={() => handleActionPress(() => setCurrentStatusFilter('draft'))}
							active={currentStatusFilter === 'draft'}
						/>
					</S.PostsStatusFilterWrapper>
				</S.PostsActionsSection>
				<S.PostsActionsSection dropdown={dropdown}>
					{dropdown && (
						<S.PostsActionsSectionHeader>
							<p>{language.sortBy}</p>
						</S.PostsActionsSectionHeader>
					)}
					<S.PostsSortingWrapper>
						<Button
							type={sortOptionType}
							label={dateAscending ? language.sortOldestToNewest : language.sortNewestToOldest}
							handlePress={() => handleActionPress(() => setDateAscending(!dateAscending))}
							icon={ASSETS.arrows}
						/>
					</S.PostsSortingWrapper>
				</S.PostsActionsSection>
			</S.PostsActions>
		);
	}

	function getHeader() {
		switch (props.type) {
			case 'header':
				return (
					<S.PostsHeaderDetails className={'border-wrapper-alt3'}>
						<p>{language.posts}</p>
						<S.PostsHeaderDetailsActions>
							<Button
								type={'alt3'}
								label={language.postsLink}
								handlePress={() => navigate(URLS.portalPosts(portalProvider.current.id))}
							/>
							<S.PostsHeaderFilterWrapper>
								<CloseHandler
									callback={() => setShowFilterActions(false)}
									active={showFilterActions}
									disabled={!showFilterActions}
								>
									<Button
										type={'alt3'}
										label={language.filter}
										handlePress={() => setShowFilterActions(!showFilterActions)}
										icon={ASSETS.filter}
										iconLeftAlign
									/>
									{showFilterActions && (
										<S.PostsHeaderFilterDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
											{getFilterActions(true)}
										</S.PostsHeaderFilterDropdown>
									)}
								</CloseHandler>
							</S.PostsHeaderFilterWrapper>
						</S.PostsHeaderDetailsActions>
					</S.PostsHeaderDetails>
				);
			case 'detail':
				return getFilterActions(false);
			default:
				return null;
		}
	}

	const posts = React.useMemo(() => {
		if (!paginatedPosts.length) {
			return (
				<S.WrapperEmpty type={props.type}>
					<p>{language.noPostsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<S.PostsWrapper type={props.type}>
				{paginatedPosts.map((asset: PortalAssetType) => (
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
				))}
			</S.PostsWrapper>
		);
	}, [paginatedPosts, portalProvider.current?.id, language]);

	return (
		<S.Wrapper>
			{getHeader()}
			{posts}
			<S.PostsFooter>
				<S.PostsFooterDetail>
					<p>{language.showingRange(assets.length > 0 ? currentRange.start : 0, currentRange.end, assets.length)}</p>
					<p>{`${language.page} ${currentPage}`}</p>
				</S.PostsFooterDetail>
				<S.PostsFooterActions>
					<Button
						type={'alt3'}
						label={language.previous}
						handlePress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={assets.length > 0 ? currentPage === 1 : true}
					/>
					<Button
						type={'alt3'}
						label={language.next}
						handlePress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
						disabled={assets.length > 0 ? currentPage === totalPages : true}
					/>
				</S.PostsFooterActions>
			</S.PostsFooter>
		</S.Wrapper>
	);
}
