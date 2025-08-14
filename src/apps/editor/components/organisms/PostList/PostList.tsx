import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Post } from 'editor/components/molecules/Post';
import { User } from 'editor/components/molecules/User';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { ASSETS, URLS } from 'helpers/config';
import {
	ArticleStatusType,
	GQLNodeResponseType,
	PortalAssetRequestType,
	PortalAssetType,
	ViewLayoutType,
} from 'helpers/types';
import { formatDate, getTagValue } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function PostList(props: { type: ViewLayoutType; pageCount?: number }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [currentPage, setCurrentPage] = React.useState<number>(1);
	const [pageCount, _setPageCount] = React.useState<number>(props.pageCount || 10);
	const [currentStatusFilter, setCurrentStatusFilter] = React.useState<ArticleStatusType | 'all'>('all');
	const [dateAscending, setDateAscending] = React.useState<boolean>(false);
	const [showFilterActions, setShowFilterActions] = React.useState<boolean>(false);
	const [showRequests, setShowRequests] = React.useState<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [requests, setRequests] = React.useState<PortalAssetRequestType[] | null>(null);

	const totalCount = portalProvider.current?.assets?.length ?? '-';
	const publishedCount =
		portalProvider.current?.assets?.filter((asset: any) => asset.metadata?.status === 'published').length ?? '-';
	const draftCount =
		portalProvider.current?.assets?.filter((asset: any) => asset.metadata?.status === 'draft').length ?? '-';

	React.useEffect(() => {
		setCurrentPage(1);
	}, [currentStatusFilter]);

	React.useEffect(() => {
		(async function () {
			if (requests !== null) return;
			if (!showRequests) return;

			const ids = portalProvider.current?.requests.map((asset: PortalAssetRequestType) => asset.id);

			if (!ids?.length) {
				setRequests([]);
				return;
			}

			try {
				const gqlResponse = await permawebProvider.libs.getAggregatedGQLData({ ids });

				const seeded = (gqlResponse ?? []).map((el: GQLNodeResponseType) => ({
					id: el.node.id,
					name: getTagValue(el.node.tags, 'Bootloader-Name'),
					creatorId: getTagValue(el.node.tags, 'Creator'),
					dateCreated: (el.node.block?.timestamp * 1000).toString() ?? '-',
				}));

				setRequests(seeded);

				const returnedIds = new Set((gqlResponse ?? []).map((el: GQLNodeResponseType) => el.node.id));
				const missingIds = ids.filter((id) => !returnedIds.has(id));

				if (missingIds.length > 0) {
					setLoading(true);
					let cancelled = false;
					let remaining = missingIds.length;

					missingIds.forEach(async (id) => {
						try {
							const asset = await permawebProvider.libs.getAtomicAsset(id);
							if (cancelled) return;

							const formatted = {
								id: asset.id,
								name: asset.name,
								creatorId: asset.creator,
								dateCreated: asset.dateCreated,
							};

							setRequests((prev) => {
								const base = prev ?? [];
								return base.some((r) => r.id === formatted.id) ? base : [...base, formatted];
							});
						} catch (e) {
							console.error('fetch asset failed', id, e);
						} finally {
							if (!cancelled && --remaining === 0) {
								setLoading(false);
							}
						}
					});

					return () => {
						cancelled = true;
						setLoading(false);
					};
				}
			} catch (e: any) {
				console.error(e);
				setLoading(false);
				setRequests((prev) => prev ?? []);
			}
		})();
	}, [requests, showRequests, portalProvider.current?.requests]);

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

	function handleReviewRedirect(requestId: string) {
		setShowRequests(false);
		navigate(`${URLS.postEditArticle(portalProvider.current.id)}${requestId}`);
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
							<S.InfoWrapper className={'info'}>
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

	function getPosts() {
		if (!paginatedPosts.length) {
			return (
				<S.WrapperEmpty type={props.type}>
					<p>{language?.noPostsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<S.PostsWrapper type={props.type}>
				{paginatedPosts.map((post: PortalAssetType) => (
					<Post key={post.id} post={post} />
				))}
			</S.PostsWrapper>
		);
	}

	return (
		<S.Wrapper>
			{getHeader()}
			{getPosts()}
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
