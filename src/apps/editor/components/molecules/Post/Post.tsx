import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { ICONS, URLS } from 'helpers/config';
import { ArticleStatusType, PortalAssetType, PortalPatchMapEnum } from 'helpers/types';
import { debugLog, formatAddress, formatDate, resolvePrimaryDomain } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Post(props: { post: PortalAssetType }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const unauthorized =
		!portalProvider?.permissions?.postAutoIndex &&
		!portalProvider?.permissions?.updatePostRequestStatus &&
		props.post?.creator !== permawebProvider.profile.id;

	const [showPostDropdown, setShowPostDropdown] = React.useState<boolean>(false);
	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);
	const [removeLoading, setRemoveLoading] = React.useState<boolean>(false);

	React.useEffect(() => {
		// Only fetch if creator exists, is not the portal itself, and profile not already loaded
		if (
			props.post.creator &&
			props.post.creator !== portalProvider.current?.id &&
			!portalProvider.usersByPortalId?.[props.post.creator]
		) {
			portalProvider.fetchPortalUserProfile({
				address: props.post.creator,
			});
		}
	}, [props.post?.creator, portalProvider.current?.id, portalProvider.usersByPortalId]);

	const creatorName =
		props.post?.creator === portalProvider.current?.id
			? portalProvider.current?.name
			: portalProvider.usersByPortalId?.[props.post?.creator]?.username ?? formatAddress(props.post?.creator, false);

	const externalPostLink = `${resolvePrimaryDomain(
		portalProvider.current?.domains,
		portalProvider.current?.id
	)}/#/post/${props.post.metadata?.url ?? props.post?.id}`;

	function handleDropdownAction(e: any, fn: () => void) {
		e.preventDefault();
		e.stopPropagation();
		fn();
		setShowPostDropdown(false);
	}

	const handleRemovePost = async () => {
		if (!props.post?.id) return;
		setRemoveLoading(true);
		try {
			const removeId = await permawebProvider.libs.removeFromIndex(
				{ indexId: props.post.id },
				portalProvider.current.id
			);
			debugLog('info', 'Post', 'Post remove:', removeId);

			await permawebProvider.deps.ao.result({
				process: portalProvider.current.id,
				message: removeId,
			});

			addNotification(`${language?.postRemoved}!`, 'success');

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Posts);

			setShowRemoveConfirmation(false);
			setShowPostDropdown(false);
		} catch (e: any) {
			addNotification(e.message ?? 'Error removing post', 'warning');
		}
		setRemoveLoading(false);
	};

	return props.post ? (
		<>
			<Link to={externalPostLink} target={'_blank'}>
				<S.PostWrapper className={'fade-in'}>
					<S.PostHeader>
						<p>{props.post.name}</p>
						<S.PostHeaderDetail>
							<ReactSVG src={ICONS.time} />
							<span>{`${formatDate(props.post.metadata?.releaseDate, true)} · ${creatorName}`}</span>
						</S.PostHeaderDetail>
					</S.PostHeader>
					<S.PostDetail>
						<S.PostActions>
							<S.PostMenuWrapper>
								<CloseHandler
									active={showPostDropdown}
									disabled={!setShowPostDropdown}
									callback={() => setShowPostDropdown(false)}
								>
									<S.PostMenuAction>
										<IconButton
											type={'alt1'}
											src={ICONS.menu}
											handlePress={() => setShowPostDropdown((prev) => !prev)}
											dimensions={{ wrapper: 25, icon: 13.5 }}
											disabled={false}
											active={showPostDropdown}
											tooltip={language?.showPostActions}
											tooltipPosition={'bottom-right'}
										/>
									</S.PostMenuAction>
									{showPostDropdown && (
										<S.PostMenuDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper-hidden'}>
											{!unauthorized && (
												<button
													onClick={(e) =>
														handleDropdownAction(e, () =>
															navigate(`${URLS.postEditArticle(portalProvider.current.id)}${props.post.id}`)
														)
													}
												>
													<ReactSVG src={ICONS.write} />
													<p>{language?.edit}</p>
												</button>
											)}
											<button onClick={(e) => handleDropdownAction(e, () => window.open(externalPostLink))}>
												<ReactSVG src={ICONS.show} />
												<p>{language?.view}</p>
											</button>
											{!unauthorized && (
												<S.PostMenuWarning
													onClick={(e) =>
														handleDropdownAction(e, () => {
															setShowPostDropdown(false);
															setShowRemoveConfirmation(true);
														})
													}
												>
													<ReactSVG src={ICONS.warning} />
													<p>{language?.remove}</p>
												</S.PostMenuWarning>
											)}
										</S.PostMenuDropdown>
									)}
								</CloseHandler>
							</S.PostMenuWrapper>
						</S.PostActions>
						{props.post.metadata?.status && (
							<S.PostStatus status={props.post.metadata?.status as ArticleStatusType}>
								<span>{props.post.metadata.status}</span>
								<div id={'post-status'} />
							</S.PostStatus>
						)}
					</S.PostDetail>
				</S.PostWrapper>
			</Link>
			{showRemoveConfirmation && (
				<Modal
					header={language?.confirm}
					handleClose={() => setShowRemoveConfirmation(false)}
					closeDisabled={removeLoading}
				>
					<S.RemoveModalWrapper>
						<S.RemoveModalBodyWrapper>
							<p>{language?.removePostConfirmationInfo}</p>
						</S.RemoveModalBodyWrapper>
						<S.RemoveModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.cancel}
								handlePress={() => setShowRemoveConfirmation(false)}
								disabled={removeLoading}
							/>
							<Button
								type={'primary'}
								label={language?.removePostConfirmation}
								handlePress={() => handleRemovePost()}
								disabled={removeLoading}
								loading={removeLoading}
								warning
							/>
						</S.RemoveModalActionsWrapper>
					</S.RemoveModalWrapper>
				</Modal>
			)}
		</>
	) : null;
}
