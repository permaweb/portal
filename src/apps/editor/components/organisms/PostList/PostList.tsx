import { useNavigate } from 'react-router-dom';

import { Post } from 'editor/components/molecules/Post';
import { User } from 'editor/components/molecules/User';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Drawer } from 'components/atoms/Drawer';
import { Loader } from 'components/atoms/Loader';
import { Pagination } from 'components/atoms/Pagination';
import { Panel } from 'components/atoms/Panel';
import { ICONS, URLS } from 'helpers/config';
import { ArticleStatusType, PortalAssetType, ViewLayoutType } from 'helpers/types';
import { formatDate } from 'helpers/utils';
import { usePostsList } from 'hooks/usePostList';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export const Posts = (props: { paginatedPosts?: PortalAssetType[]; type?: ViewLayoutType }) => {
	const laguageProvider = useLanguageProvider();
	const language = laguageProvider.object[laguageProvider.current];

	if (!props.paginatedPosts.length) {
		return (
			<S.WrapperEmpty type={props.type} className={'border-wrapper-alt2'}>
				<p>{language?.noPostsFound}</p>
			</S.WrapperEmpty>
		);
	}

	return (
		<S.PostsWrapper type={props.type} className={'border-wrapper-alt2'}>
			{props.paginatedPosts.map((post: PortalAssetType) => (
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
		pageSize: props.pageCount || 10,
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
							icon={ICONS.arrows}
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
			} else if (requests.length > 0) {
				content = (
					<S.PostsActionsRequests>
						<S.PostsActionsRequestsBody>
							{requests.map((request: any) => {
								return (
									<S.PostActionRequest key={request.id}>
										<S.PostActionRequestLine>
											<p>{request.name}</p>
											<Button
												type={'alt4'}
												label={language.checkPost}
												handlePress={() => handleReviewRedirect(request.id)}
												icon={ICONS.newTab}
											/>
										</S.PostActionRequestLine>
										<S.PostActionRequestLine>
											<div className={'user-line'}>
												<User user={{ address: request.creatorId }} hideAction />
											</div>
											<span>{formatDate(request.dateCreated)}</span>
										</S.PostActionRequestLine>
									</S.PostActionRequest>
								);
							})}
						</S.PostsActionsRequestsBody>
						{loading && <Loader sm relative />}
						<S.ActionWrapper>
							<Button
								type={'primary'}
								label={language.close}
								handlePress={() => setShowRequests(false)}
								disabled={false}
								height={40}
								fullWidth
							/>
						</S.ActionWrapper>
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
						handlePress={(e: any) => {
							e.preventDefault();
							e.stopPropagation();
							setShowRequests((prev) => !prev);
						}}
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

	function getPosts() {
		return (
			<>
				<Posts paginatedPosts={paginatedPosts} type={props.type} />
				<S.PostsFooter>
					<Pagination
						totalItems={assets.length}
						totalPages={totalPages}
						currentPage={currentPage}
						currentRange={currentRange}
						setCurrentPage={setCurrentPage}
						showRange={true}
						showControls={true}
						iconButtons={true}
					/>
				</S.PostsFooter>
			</>
		);
	}

	return (
		<S.Wrapper>
			{props.type === 'header' ? (
				<Drawer
					drawerKey="portal-posts"
					title={language?.posts}
					content={getPosts()}
					actions={[
						<Button
							type={'alt3'}
							label={language?.postsLink}
							handlePress={() => navigate(URLS.portalPosts(portalProvider.current.id))}
						/>,
						getRequests(),
						<S.PostsHeaderFilterWrapper>
							<CloseHandler
								callback={() => setShowFilterActions(false)}
								active={showFilterActions}
								disabled={!showFilterActions}
							>
								<Button
									type={'alt4'}
									label={language?.filter}
									handlePress={(e: any) => {
										e.preventDefault();
										e.stopPropagation();
										setShowFilterActions(!showFilterActions);
									}}
									icon={ICONS.filter}
									iconLeftAlign
								/>
								{showFilterActions && (
									<S.PostsHeaderFilterDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
										{getActions(true)}
									</S.PostsHeaderFilterDropdown>
								)}
							</CloseHandler>
						</S.PostsHeaderFilterWrapper>,
					]}
					noContentWrapper
				/>
			) : (
				<>
					{getActions(false)}
					{getPosts()}
				</>
			)}
		</S.Wrapper>
	);
}
