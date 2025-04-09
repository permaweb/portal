import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
// import { IconButton } from 'components/atoms/IconButton';
import { ASSETS, URLS } from 'helpers/config';
import { ArticleStatusType, PortalAssetType } from 'helpers/types';
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
		portalProvider.current?.assets?.filter((asset: any) => asset.metadata?.status === 'published').length ?? '-';
	const draftCount =
		portalProvider.current?.assets?.filter((asset: any) => asset.metadata?.status === 'draft').length ?? '-';

	React.useEffect(() => {
		setCurrentPage(1);
	}, [currentStatusFilter]);

	const assets = React.useMemo(() => {
		if (!portalProvider.current?.assets) return [];
		return portalProvider.current.assets
			.filter((asset: any) => currentStatusFilter === 'all' || asset.metadata?.status === currentStatusFilter)
			.sort((a, b) => {
				const dateA = new Date(Number(a.dateCreated)).getTime();
				const dateB = new Date(Number(b.dateCreated)).getTime();
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
		const getButtonType = (isFilter: boolean, status: string) => {
			if (dropdown) return 'alt3';
			if (isFilter) return currentStatusFilter === status ? 'alt1' : 'primary';
			return 'alt1';
		};

		const handleActionPress = (fn: () => void) => {
			if (dropdown) setShowFilterActions(false);
			fn();
		};

		const filterButtons = [
			{
				label: `${language.all} (${totalCount})`,
				status: 'all',
			},
			{
				label: `${language.published} (${publishedCount})`,
				status: 'published',
			},
			{
				label: `${language.draft} (${draftCount})`,
				status: 'draft',
			},
		].map((filterAction: { label: string; status: ArticleStatusType }) => (
			<Button
				key={filterAction.status}
				type={getButtonType(true, filterAction.status)}
				label={filterAction.label}
				handlePress={() => handleActionPress(() => setCurrentStatusFilter(filterAction.status))}
				active={currentStatusFilter === filterAction.status}
			/>
		));

		return (
			<S.PostsActions dropdown={dropdown}>
				<S.PostsActionsSection dropdown={dropdown}>
					{dropdown && (
						<S.PostsActionsSectionHeader>
							<p>{language.filterBy}</p>
						</S.PostsActionsSectionHeader>
					)}
					<S.PostsStatusFilterWrapper>{filterButtons}</S.PostsStatusFilterWrapper>
				</S.PostsActionsSection>
				<S.PostsActionsSection dropdown={dropdown}>
					{dropdown && (
						<S.PostsActionsSectionHeader>
							<p>{language.sortBy}</p>
						</S.PostsActionsSectionHeader>
					)}
					<S.PostsSortingWrapper>
						<Button
							type={'alt3'}
							label={dateAscending ? language.sortNewestToOldest : language.sortOldestToNewest}
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
										type={'alt4'}
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

	// TODO
	// <Button
	// 	type={'alt3'}
	// 	label={language.view}
	// 	handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
	// />
	// <IconButton
	// 	type={'primary'}
	// 	active={false}
	// 	src={ASSETS.listUnordered}
	// 	handlePress={() => window.open(`https://arweave.net/${asset.id}`, 'blank')}
	// 	dimensions={{ wrapper: 25, icon: 15 }}
	// 	tooltip={language.moreActions}
	// 	tooltipPosition={'bottom-right'}
	// />

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
							<p>{asset.name}</p>
							<span>
								<ReactSVG src={ASSETS.time} />
								{formatDate(asset.dateCreated, 'epoch', true)}
							</span>
						</S.PostHeader>
						<S.PostDetail>
							<S.PostActions>
								<Button
									type={'alt3'}
									label={language.edit}
									handlePress={() => navigate(`${URLS.postEditArticle(portalProvider.current.id)}${asset.id}`)}
								/>
							</S.PostActions>
							{asset.metadata?.status && (
								<S.PostStatus status={asset.metadata?.status as ArticleStatusType}>
									<p>{asset.metadata.status}</p>
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
