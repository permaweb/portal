import { useNavigate } from 'react-router-dom';

import { Post } from 'editor/components/molecules/Post';
import { User } from 'editor/components/molecules/User';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { ASSETS, URLS } from 'helpers/config';
import { ArticleStatusType, PortalAssetRequestType, PortalAssetType, ViewLayoutType } from 'helpers/types';
import { formatDate } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { usePostsList } from './usePostList';

export const Posts = ({ type, paginatedPosts = [] }: { paginatedPosts?: PortalAssetType[]; type?: ViewLayoutType }) => {
	const laguageProvider = useLanguageProvider();
	const language = laguageProvider.object[laguageProvider.current];

	if (!paginatedPosts.length) {
		return (
			<S.WrapperEmpty type={type}>
				<p>{language?.noPostsFound}</p>
			</S.WrapperEmpty>
		);
	}

	return (
		<S.PostsWrapper type={type}>
			{paginatedPosts.map((post: PortalAssetType) => (
				<Post key={post.id} post={post} />
			))}
		</S.PostsWrapper>
	);
};

export default function PostList(props: { type: ViewLayoutType; pageCount?: number }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const {
		assets,
		loading,
		showFilterActions,
		setShowFilterActions,
		showRequests,
		setShowRequests,
		requests,
		totalCount,
		publishedCount,
		draftCount,
		currentStatusFilter,
		setCurrentStatusFilter,
		dateAscending,
		setDateAscending,
		paginatedPosts,
		currentPage,
		setCurrentPage,
		totalPages,
		currentRange,
	} = usePostsList({
		pageSize: props.pageCount,
	});

	function handleReviewRedirect(requestId: string) {
		setShowRequests(false);
		navigate(`${URLS.postEditArticle(portalProvider.current.id)}${requestId}`);
	}

	function getActions(dropdown: boolean) {
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
				label: `${language?.all} (${totalCount})`,
				status: 'all',
			},
			{
				label: `${language?.published} (${publishedCount})`,
				status: 'published',
			},
			{
				label: `${language?.draft} (${draftCount})`,
				status: 'draft',
			},
		].map((filterAction: { label: string; status: ArticleStatusType }) => (
			<Button
				key={filterAction.status}
				type={getButtonType(true, filterAction.status)}
				label={filterAction.label}
				handlePress={() => handleActionPress(() => setCurrentStatusFilter(filterAction.status))}
				active={dropdown ? currentStatusFilter === filterAction.status : false}
			/>
		));

		return (
			<S.PostsActions dropdown={dropdown}>
				<S.PostsActionsSection dropdown={dropdown}>
					{dropdown && (
						<S.PostsActionsSectionHeader>
							<p>{language?.filterBy}</p>
						</S.PostsActionsSectionHeader>
					)}
					<S.PostsStatusFilterWrapper>{filterButtons}</S.PostsStatusFilterWrapper>
				</S.PostsActionsSection>
				<S.PostsActionsSection dropdown={dropdown}>
					{dropdown && (
						<S.PostsActionsSectionHeader>
							<p>{language?.sortBy}</p>
						</S.PostsActionsSectionHeader>
					)}
					<S.PostsActionsEnd>
						<Button
							type={dropdown ? 'alt3' : 'primary'}
							label={dateAscending ? language?.sortNewestToOldest : language?.sortOldestToNewest}
							handlePress={() => handleActionPress(() => setDateAscending(!dateAscending))}
							icon={ASSETS.arrows}
						/>
						{props.type === 'detail' && getRequests()}
					</S.PostsActionsEnd>
				</S.PostsActionsSection>
			</S.PostsActions>
		);
	}

	function getRequests() {
		const unauthorized = !portalProvider?.permissions?.postAutoIndex;
		let content = <Loader sm relative />;

		if (requests !== null) {
			if (requests.length <= 0) {
				content = (
					<S.PostsActionsRequestsInfo>
						<span>{language?.noRequestsFound}</span>
					</S.PostsActionsRequestsInfo>
				);
			} else {
				content = (
					<S.PostsActionsRequests>
						<S.PostsActionsRequestsHeader>
							<span>{language?.postTitle}</span>
							<span>{language?.author}</span>
							<span>{language?.created}</span>
							<span>{language?.review}</span>
						</S.PostsActionsRequestsHeader>
						<S.PostsActionsRequestsBody>
							{requests.map((request: PortalAssetRequestType) => {
								return (
									<S.PostActionRequest key={request.id}>
										<p>{request.name}</p>
										<User user={{ address: request.creatorId }} hideAction />
										<span>{formatDate(request.dateCreated, 'epoch')}</span>
										<div id={'post-request-action'}>
											<IconButton
												type={'alt1'}
												active={false}
												src={ASSETS.newTab}
												handlePress={() => handleReviewRedirect(request.id)}
												disabled={unauthorized}
												dimensions={{ wrapper: 23.5, icon: 13.5 }}
												tooltip={'Review Post'}
												tooltipPosition={'bottom-right'}
												noFocus
											/>
										</div>
									</S.PostActionRequest>
								);
							})}
						</S.PostsActionsRequestsBody>
						{loading && <Loader sm relative />}
						{unauthorized && (
							<S.InfoWrapper className={'warning'}>
								<span>{language?.unauthorizedPostReview}</span>
							</S.InfoWrapper>
						)}
					</S.PostsActionsRequests>
				);
			}
		}

		return (
			<>
				<S.PostsActionsRequestsWrapper type={props.type}>
					<Button
						type={props.type === 'detail' ? 'primary' : 'alt3'}
						label={language?.requests}
						handlePress={() => setShowRequests((prev) => !prev)}
					/>

					{portalProvider.current?.requests?.length > 0 && (
						<div className={'notification'}>
							<span>{portalProvider.current.requests.length}</span>
						</div>
					)}
				</S.PostsActionsRequestsWrapper>
				<Panel
					open={showRequests}
					header={language?.requests}
					width={550}
					handleClose={() => setShowRequests((prev) => !prev)}
				>
					<div className={'modal-wrapper'}>{content}</div>
				</Panel>
			</>
		);
	}

	function getHeader() {
		switch (props.type) {
			case 'header':
				return (
					<S.PostsHeaderDetails className={'border-wrapper-alt3'}>
						<p>{`${language?.posts} (${portalProvider.current?.assets?.length ?? '0'})`}</p>
						<S.PostsHeaderDetailsActions>
							<Button
								type={'alt3'}
								label={language?.postsLink}
								handlePress={() => navigate(URLS.portalPosts(portalProvider.current.id))}
							/>
							{getRequests()}
							<S.PostsHeaderFilterWrapper>
								<CloseHandler
									callback={() => setShowFilterActions(false)}
									active={showFilterActions}
									disabled={!showFilterActions}
								>
									<Button
										type={'alt4'}
										label={language?.filter}
										handlePress={() => setShowFilterActions(!showFilterActions)}
										icon={ASSETS.filter}
										iconLeftAlign
									/>
									{showFilterActions && (
										<S.PostsHeaderFilterDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
											{getActions(true)}
										</S.PostsHeaderFilterDropdown>
									)}
								</CloseHandler>
							</S.PostsHeaderFilterWrapper>
						</S.PostsHeaderDetailsActions>
					</S.PostsHeaderDetails>
				);
			case 'detail':
				return getActions(false);
			default:
				return null;
		}
	}

	return (
		<S.Wrapper>
			{getHeader()}
			<Posts paginatedPosts={paginatedPosts} type={props.type} />
			<S.PostsFooter>
				<S.PostsFooterDetail>
					<p>{language?.showingRange(assets.length > 0 ? currentRange.start : 0, currentRange.end, assets.length)}</p>
					<p>{`${language?.page} ${currentPage}`}</p>
				</S.PostsFooterDetail>
				<S.PostsFooterActions>
					<Button
						type={'alt3'}
						label={language?.previous}
						handlePress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
						disabled={assets.length > 0 ? currentPage === 1 : true}
					/>
					<Button
						type={'alt3'}
						label={language?.next}
						handlePress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
						disabled={assets.length > 0 ? currentPage === totalPages : true}
					/>
				</S.PostsFooterActions>
			</S.PostsFooter>
		</S.Wrapper>
	);
}
