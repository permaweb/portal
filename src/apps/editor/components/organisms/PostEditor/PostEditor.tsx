import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate, setOriginalData } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { ASSET_UPLOAD, PORTAL_POST_DATA, URLS } from 'helpers/config';
import {
	PortalAssetRequestType,
	PortalHeaderType,
	PortalPatchMapEnum,
	PortalUserType,
	RequestUpdateType,
} from 'helpers/types';
import {
	debugLog,
	filterDuplicates,
	getByteSize,
	getByteSizeDisplay,
	hasUnsavedPostChanges,
	isMac,
	urlify,
} from 'helpers/utils';
import { useNavigationConfirm } from 'hooks/useNavigationConfirm';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ArticleEditor } from './ArticleEditor';
import * as S from './styles';

export default function PostEditor() {
	const navigate = useNavigate();
	const location = useLocation();
	const { assetId } = useParams<{ assetId?: string }>();
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { addNotification } = useNotifications();
	const [showReview, setShowReview] = React.useState<boolean>(false);
	const [missingFields, setMissingFields] = React.useState<string[]>([]);

	const isStaticPage = location.pathname.includes('page');

	const hasChanges = hasUnsavedPostChanges(currentPost.data, currentPost.originalData);

	// Enable navigation confirmation when there are unsaved changes
	useNavigationConfirm(
		hasChanges ? 'edit' : '',
		language?.unsavedChangesWarning || 'You have unsaved changes. Are you sure you want to leave?'
	);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	React.useEffect(() => {
		const isEmpty =
			!currentPost.data.content ||
			currentPost.data.content.length === 0 ||
			currentPost.data.content.every((block) => !block.content || block.content.trim() === '');

		const noChanges = !hasChanges && currentPost.data.id !== null;

		const isCurrentRequest =
			!!assetId && portalProvider.current?.requests?.some((request: PortalAssetRequestType) => request.id === assetId);
		handleCurrentPostUpdate({ field: 'submitDisabled', value: (isEmpty || noChanges) && !isCurrentRequest });
	}, [currentPost.data, currentPost.originalData, portalProvider.current?.requests]);

	// Keyboard shortcut: Cmd/Ctrl + Shift + S to save
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const modifier = isMac() ? e.metaKey : e.ctrlKey;
			if (modifier && e.shiftKey && e.key.toLowerCase() === 's') {
				e.preventDefault();
				if (!currentPost.editor.submitDisabled) {
					handleSubmit();
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [currentPost.editor]);

	/* User is a moderator and can only review existing posts, not create new ones */
	const unauthorized =
		!assetId && !portalProvider.permissions?.postAutoIndex && !portalProvider.permissions?.postRequestIndex;

	async function handleStatusUpdate(status: 'Pending' | 'Review') {
		if (assetId && arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			handleCurrentPostUpdate({
				field: 'loading',
				value: { active: true, message: `${language?.updatingPostStatus}...` },
			});

			if (!validateSubmit()) {
				handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				return;
			}
			if (!portalProvider.permissions?.updatePostStatus) {
				handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				addNotification(language?.unauthorized, 'warning', { persistent: true });
				return;
			}

			const isCurrentRequest = portalProvider.current?.requests?.some(
				(request: PortalAssetRequestType) => request.id === assetId
			);

			if (isCurrentRequest) {
				try {
					debugLog('info', 'PostEditor', 'Updating post status...', status);
					const zoneIndexUpdateId = await permawebProvider.libs.sendMessage({
						processId: portalProvider.current.id,
						wallet: arProvider.wallet,
						action: 'Update-Status-Index-Request',
						tags: [
							{ name: 'Index-Id', value: assetId },
							{ name: 'Status', value: status },
						],
					});

					const zoneIndexResult = await permawebProvider.deps.ao.result({
						process: portalProvider.current.id,
						message: zoneIndexUpdateId,
					});

					portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Requests);
					if (zoneIndexResult?.Messages?.length > 0) {
						addNotification(`${language?.postStatusUpdated}!`, 'success', { persistent: true });
					} else {
						addNotification(language?.errorUpdatingPost, 'warning', { persistent: true });
					}
				} catch (e: any) {
					addNotification(e.message ?? 'Error updating post status', 'warning', { persistent: true });
				}
			}

			handleSubmitUpdate();
		}
	}

	async function handleRequestUpdate(updateType: RequestUpdateType) {
		if (assetId && arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			handleCurrentPostUpdate({
				field: 'loading',
				value: { active: true, message: `${language?.updatingPostStatus}...` },
			});

			const indexRecipients = [portalProvider.current.id];

			if (!validateSubmit()) {
				handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				return;
			}

			if (!portalProvider.permissions?.updatePostRequestStatus) {
				handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				addNotification(language?.unauthorized, 'warning', { persistent: true });
				return;
			}

			const isCurrentRequest = portalProvider.current?.requests?.some(
				(request: PortalAssetRequestType) => request.id === assetId
			);

			if (isCurrentRequest) {
				try {
					const zoneIndexUpdateId = await permawebProvider.libs.sendMessage({
						processId: portalProvider.current.id,
						wallet: arProvider.wallet,
						action: 'Update-Index-Request',
						tags: [
							{ name: 'Index-Id', value: assetId },
							{ name: 'Update-Type', value: updateType },
						],
					});

					debugLog('info', 'PostEditor', `Zone index update: ${zoneIndexUpdateId}`);

					const zoneIndexResult = await permawebProvider.deps.ao.result({
						process: portalProvider.current.id,
						message: zoneIndexUpdateId,
					});

					if (zoneIndexResult?.Messages?.length > 0) {
						if (updateType === 'Approve') {
							const assetIndexUpdateId = await permawebProvider.libs.sendMessage({
								processId: assetId,
								wallet: arProvider.wallet,
								action: 'Send-Index',
								tags: [
									{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
									{ name: 'Content-Type', value: ASSET_UPLOAD.contentType },
									{ name: 'Date-Added', value: new Date().getTime().toString() },
								],
								data: { Recipients: indexRecipients },
							});

							const assetIndexResult = await permawebProvider.deps.ao.result({
								process: assetId,
								message: assetIndexUpdateId,
							});

							if (assetIndexResult?.Messages?.length > 0) {
								let data: any = permawebProvider.libs.mapToProcessCase({
									name: currentPost.data.title,
									description: currentPost.data.description,
									status: currentPost.data.status,
									content: currentPost.data.content,
									topics: currentPost.data.topics,
									categories: currentPost.data.categories,
								});

								if (currentPost.data.thumbnail) {
									try {
										data.Thumbnail = await permawebProvider.libs.resolveTransaction(currentPost.data.thumbnail);
									} catch (e: any) {
										addNotification(e.message ?? language?.errorUploadingThumbnail, 'warning', { persistent: true });
									}
								}

								const assetContentUpdateId = await permawebProvider.libs.sendMessage({
									processId: assetId,
									wallet: arProvider.wallet,
									action: 'Update-Asset',
									data: data,
								});

								debugLog('info', 'PostEditor', `Asset content update: ${assetContentUpdateId}`);
							}
						}

						addNotification(`${language?.postStatusUpdated}!`, 'success', { persistent: true });
						portalProvider.refreshCurrentPortal([PortalPatchMapEnum.Requests, PortalPatchMapEnum.Posts]);
						if (updateType === 'Reject') navigate(URLS.portalBase(portalProvider.current.id));
					} else {
						addNotification(language?.errorUpdatingPost, 'warning', { persistent: true });
					}
				} catch (e: any) {
					addNotification(e.message ?? 'Error updating post status', 'warning', { persistent: true });
				}
			}

			handleSubmitUpdate();
		}
	}

	async function handleSubmit(reviewStatus?: 'Auto') {
		if (arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			handleCurrentPostUpdate({ field: 'loading', value: { active: true, message: `${language?.saving}...` } });

			if (!validateSubmit()) {
				handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				return;
			}

			const excludeFromIndex = JSON.stringify([
				'Balances',
				'Ticker',
				'Process-Type',
				'Total-Supply',
				'Transferable',
				'Metadata.Content',
			]);

			const url = currentPost.data.url || urlify(currentPost.data.title);
			const releaseDate = currentPost.data.releaseDate ?? new Date().getTime().toString();

			let data: any = permawebProvider.libs.mapToProcessCase({
				name: currentPost.data.title,
				description: currentPost.data.description,
				status: currentPost.data.status,
				content: currentPost.data.content,
				topics: currentPost.data.topics,
				categories: currentPost.data.categories,
				creator: currentPost.data.creator,
				url: url,
				releaseDate: releaseDate,
				originPortal: portalProvider.current.id,
			});

			if (currentPost.data.thumbnail) {
				try {
					data.Thumbnail = await permawebProvider.libs.resolveTransaction(currentPost.data.thumbnail);
				} catch (e: any) {
					addNotification(e.message ?? language?.errorUploadingThumbnail, 'warning', { persistent: true });
				}
			}

			if (assetId) {
				try {
					/* Update the post through the portal */
					let assetContentUpdateId = null;
					if (reviewStatus === 'Auto') {
						/* Directly save if it is not in review mode or from non contributor */
						assetContentUpdateId = await permawebProvider.libs.sendMessage({
							processId: portalProvider.current.id,
							wallet: arProvider.wallet,
							action: 'Run-Action',
							tags: [
								{ name: 'Forward-To', value: assetId },
								{ name: 'Forward-Action', value: 'Update-Asset' },
								{ name: 'Exclude-Index', value: excludeFromIndex },
							],
							data: { Input: data },
						});
					} else {
						assetContentUpdateId = await permawebProvider.libs.sendMessage({
							processId: portalProvider.current.id,
							wallet: arProvider.wallet,
							action: 'Update-Asset-Through-Zone',
							tags: [
								{ name: 'Forward-To', value: assetId },
								{ name: 'Forward-Action', value: 'Update-Asset' },
								{ name: 'Exclude-Index', value: excludeFromIndex },
							],
							data: { Input: data },
						});
					}

					if (isStaticPage) {
						const currentPages = portalProvider.current?.pages || {};

						// Find the current page by looking for the asset ID in the page values
						const currentPageEntry: any = Object.entries(currentPages).find(([_, page]: any) => page.id === assetId);
						const currentPageKey = currentPageEntry?.[0];
						const currentPageName = currentPageEntry?.[1]?.name;

						// Only update pages if the title has changed
						if (urlify(currentPageName) !== urlify(currentPost.data.title)) {
							const updatedPages = {
								...currentPages,
								[urlify(currentPost.data.title)]: {
									type: 'static',
									id: assetId,
									name: currentPost.data.title,
								},
							};

							// Remove the old page entry using the correct key
							if (currentPageKey) {
								delete updatedPages[currentPageKey];
							}

							const pagesUpdateId = await permawebProvider.libs.updateZone(
								{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
								portalProvider.current.id,
								arProvider.wallet
							);

							portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);

							debugLog('info', 'PostEditor', `Pages update: ${pagesUpdateId}`);
						}
					}

					debugLog('info', 'PostEditor', `Asset content update: ${assetContentUpdateId}`);
					addNotification(`${language?.postUpdated}!`, 'success', { persistent: true });
					portalProvider.refreshCurrentPortal([
						...(isStaticPage ? [PortalPatchMapEnum.Presentation] : []),
						PortalPatchMapEnum.Posts,
						PortalPatchMapEnum.Requests,
					]);

					// Update original data to reflect the saved state
					dispatch(setOriginalData(currentPost.data));
				} catch (e: any) {
					addNotification(e.message ?? language?.errorUpdatingPost, 'warning', { persistent: true });
				}
			} else {
				try {
					const args = {
						name: currentPost.data.title,
						description: currentPost.data.description,
						topics: currentPost.data.topics,
						creator: currentPost.data.creator ?? permawebProvider.profile.id,
						data: PORTAL_POST_DATA(),
						contentType: ASSET_UPLOAD.contentType,
						assetType: ASSET_UPLOAD.ansType,
						users: getAssetAuthUsers(),
						spawnComments: true,
					};

					const bytes = getByteSize(JSON.stringify(args));
					debugLog('info', 'PostEditor', `Data Size: ${getByteSizeDisplay(bytes)}`);

					const assetId = await permawebProvider.libs.createAtomicAsset(args, (status: any) =>
						debugLog('info', 'PostEditor', status)
					);

					debugLog('info', 'PostEditor', `Asset ID: ${assetId}`);

					const assetContentUpdateId = await permawebProvider.libs.sendMessage({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						tags: [{ name: 'Exclude-Index', value: excludeFromIndex }],
						data: data,
					});

					debugLog('info', 'PostEditor', `Asset content update: ${assetContentUpdateId}`);

					/* Add static pages assets directly to the portal process */
					if (isStaticPage && portalProvider.permissions?.updatePortalMeta) {
						const currentPages = portalProvider.current?.pages || {};
						const updatedPages = {
							...currentPages,
							[urlify(currentPost.data.title)]: {
								type: 'static',
								id: assetId,
								name: currentPost.data.title,
							},
						};
						const pagesUpdateId = await permawebProvider.libs.updateZone(
							{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
							portalProvider.current.id,
							arProvider.wallet
						);

						portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);

						debugLog('info', 'PostEditor', `Pages update: ${pagesUpdateId}`);

						// Update the current post with the new assetId and set it as saved state
						const updatedPostData = { ...currentPost.data, id: assetId };
						handleCurrentPostUpdate({ field: 'id', value: assetId });
						dispatch(setOriginalData(updatedPostData));

						navigate(URLS.portalPages(portalProvider.current?.id));
						handleSubmitUpdate();
						return;
					}

					/* Index post in the current portal this user is contributing to */
					let internalIndexAction = null;
					if (portalProvider.permissions.postAutoIndex) internalIndexAction = 'Add-Index-Id';
					else if (portalProvider.permissions.postRequestIndex) internalIndexAction = 'Add-Index-Request';

					if (internalIndexAction) {
						const zoneIndexUpdateId = await permawebProvider.libs.sendMessage({
							processId: permawebProvider.profile.id,
							wallet: arProvider.wallet,
							action: 'Run-Action',
							tags: [
								{ name: 'Forward-To', value: portalProvider.current.id },
								{ name: 'Forward-Action', value: internalIndexAction },
								{ name: 'Index-Id', value: assetId },
							],
						});

						debugLog('info', 'PostEditor', `Zone (profile) index update: ${zoneIndexUpdateId}`);

						if (portalProvider.permissions.postAutoIndex) {
							const zoneResult = await permawebProvider.deps.ao.result({
								process: permawebProvider.profile.id,
								message: zoneIndexUpdateId,
							});

							// debugLog('info', 'PostEditor', `Zone result: ${JSON.stringify(zoneResult, null, 2)}`);

							if (zoneResult?.Messages?.length > 0) {
								const assetIndexUpdateId = await permawebProvider.libs.sendMessage({
									processId: assetId,
									wallet: arProvider.wallet,
									action: 'Send-Index',
									tags: [
										{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
										{ name: 'Content-Type', value: ASSET_UPLOAD.contentType },
										{ name: 'Date-Added', value: new Date().getTime().toString() },
										{ name: 'Exclude', value: excludeFromIndex },
									],
									data: { Recipients: [portalProvider.current.id] },
								});

								debugLog('info', 'PostEditor', `Asset index update: ${assetIndexUpdateId}`);

								portalProvider.refreshCurrentPortal([PortalPatchMapEnum.Posts, PortalPatchMapEnum.Requests]);
							}
						} else {
							portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Requests);
						}
					}

					/* If there are external recipients, also send an index request to them */
					/* If the user is an admin in another portal then index it directly */
					if (currentPost.data?.externalRecipients?.length > 0) {
						for (const portalId of currentPost.data.externalRecipients) {
							const externalPortal = portalProvider.portals.find((portal: PortalHeaderType) => portal.id === portalId);
							if (externalPortal) {
								const hasExternalAdminAccess = externalPortal?.users?.some(
									(u: PortalUserType) => u.address === permawebProvider.profile.id && u.roles?.includes('Admin')
								);
								let externalIndexAction = 'Add-Index-Request';
								if (hasExternalAdminAccess) externalIndexAction = 'Add-Index-Id';

								let tags = [
									{ name: 'Forward-To', value: externalPortal.id },
									{ name: 'Forward-Action', value: externalIndexAction },
									{ name: 'Index-Id', value: assetId },
								];
								if (!hasExternalAdminAccess) {
									tags.push({ name: 'Status', value: 'Review' });
								}

								const zoneIndexUpdateId = await permawebProvider.libs.sendMessage({
									processId: permawebProvider.profile.id,
									wallet: arProvider.wallet,
									action: 'Run-Action',
									tags: tags,
								});

								debugLog('info', 'PostEditor', `External zone index update: ${zoneIndexUpdateId}`);

								if (hasExternalAdminAccess) {
									const zoneResult = await permawebProvider.deps.ao.result({
										process: permawebProvider.profile.id,
										message: zoneIndexUpdateId,
									});

									if (zoneResult?.Messages?.length > 0) {
										const assetIndexUpdateId = await permawebProvider.libs.sendMessage({
											processId: assetId,
											wallet: arProvider.wallet,
											action: 'Send-Index',
											tags: [
												{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
												{ name: 'Content-Type', value: ASSET_UPLOAD.contentType },
												{ name: 'Date-Added', value: new Date().getTime().toString() },
											],
											data: { Recipients: [externalPortal.id] },
										});

										debugLog('info', 'PostEditor', `Asset index update: ${assetIndexUpdateId}`);
										portalProvider.refreshCurrentPortal([PortalPatchMapEnum.Posts, PortalPatchMapEnum.Requests]);
									}
								}
							}
						}
					}

					addNotification(`${language?.postSaved}!`, 'success', { persistent: true });

					// Update the current post with the new assetId and set it as saved state
					const updatedPostData = { ...currentPost.data, id: assetId };
					handleCurrentPostUpdate({ field: 'id', value: assetId });
					dispatch(setOriginalData(updatedPostData));

					navigate(`${URLS.postEditArticle(portalProvider.current.id)}${assetId}`);
				} catch (e: any) {
					debugLog('error', 'PostEditor', e);
					addNotification(e.message ?? 'Error creating post', 'warning', { persistent: true });
				}
			}

			handleSubmitUpdate();
		}
	}

	function getAssetAuthUsers() {
		const authUsers = [portalProvider.current.id];
		return authUsers;

		/* Below is deprecated, all post updates now go directly through the portal */

		/* Give all admins and moderators access to the post */
		for (const user of portalProvider.current?.users) {
			if (
				(user.roles.includes('Admin') || user.roles.includes('Moderator')) &&
				user.address !== permawebProvider.profile.id
			) {
				authUsers.push(user.address);
			}
		}

		/* Add external admins and moderators if this user is a contributor in other portals */
		if (currentPost.data?.externalRecipients?.length > 0) {
			for (const portalId of currentPost.data.externalRecipients) {
				const externalPortal = portalProvider.portals.find((portal: PortalHeaderType) => portal.id === portalId);

				if (externalPortal) {
					/* Give the external portal update access */
					authUsers.push(externalPortal.id);

					const hasExternalAdminAccess = externalPortal.roles
						?.find((user: PortalUserType) => user.address === permawebProvider.profile.id)
						?.roles?.includes('Admin');

					/* This user is not an admin in the external portal */
					/* Add the external admins and moderators to the post */
					if (!hasExternalAdminAccess) {
						const externalAuthUsers = externalPortal.roles
							?.filter((user: PortalUserType) => user.roles.includes('Admin') || user.roles.includes('Moderator'))
							.map((user: PortalUserType) => user.address);

						authUsers.push(...(externalAuthUsers ?? []));
					}
				}
			}
		}

		const uniqueAuthUsers = filterDuplicates(authUsers);
		return uniqueAuthUsers;
	}

	function handleSubmitUpdate() {
		setMissingFields([]);
		handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
	}

	function validateSubmit() {
		let valid: boolean = true;
		let message: string | null = null;
		const missingFieldsFound = [];

		if (!currentPost.data.title) {
			valid = false;
			message = 'Post title is required';
			missingFieldsFound.push(message);
		}
		if (!currentPost.data.status) {
			valid = false;
			message = 'Status is required';
			missingFieldsFound.push(message);
		}
		if (!currentPost.data.content?.length) {
			valid = false;
			message = 'Content is required';
			missingFieldsFound.push(message);
		}
		if (!currentPost.data.categories?.length) {
			valid = false;
			message = 'Categories are required';
			missingFieldsFound.push(message);
		}
		if (!currentPost.data.topics?.length) {
			valid = false;
			message = 'Tags are required';
			missingFieldsFound.push(message);
		}

		// Check for duplicate title or URL
		if (portalProvider.current?.assets) {
			const existingPosts = portalProvider.current.assets.filter((asset: any) => asset.id !== currentPost.data.id);

			// Check for duplicate title
			if (currentPost.data.title) {
				const duplicateTitle = existingPosts.some(
					(asset: any) => asset.name?.toLowerCase() === currentPost.data.title.toLowerCase()
				);
				if (duplicateTitle) {
					valid = false;
					message = 'Post title already exists';
					missingFieldsFound.push(message);
				}
			}

			// Check for duplicate URL
			if (currentPost.data.url) {
				const duplicateUrl = existingPosts.some(
					(asset: any) => asset.metadata?.url?.toLowerCase() === currentPost.data.url.toLowerCase()
				);
				if (duplicateUrl) {
					valid = false;
					message = 'Post URL already exists';
					missingFieldsFound.push(message);
				}
			}
		}

		if (!valid) {
			setShowReview(true);
			setMissingFields(missingFieldsFound);
		}

		return valid;
	}

	return (
		<>
			<ArticleEditor
				handleSubmit={handleSubmit}
				handleRequestUpdate={handleRequestUpdate}
				handleStatusUpdate={handleStatusUpdate}
				staticPage={isStaticPage}
			/>
			{currentPost.editor.loading.active && <Loader message={currentPost.editor.loading.message} />}
			{unauthorized && (
				<div className={'overlay'}>
					<S.MessageWrapper className={'border-wrapper-alt2 warning'}>
						<p>{language?.unauthorizedPostCreate}</p>
						<Button
							type={'primary'}
							label={language?.returnHome}
							handlePress={() => navigate(URLS.portalBase(portalProvider.current?.id))}
						/>
					</S.MessageWrapper>
				</div>
			)}
			{showReview && (
				<Modal header={language?.reviewPostDetails} handleClose={() => setShowReview(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language?.missingPostFields}</p>
							<S.ModalBodyElements>
								{missingFields.map((topic: string, index: number) => {
									return (
										<S.ModalBodyElement key={index}>
											<span>{`· ${topic}`}</span>
										</S.ModalBodyElement>
									);
								})}
							</S.ModalBodyElements>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.learn}
								link={URLS.docsEditor}
								target={'_blank'}
								disabled={false}
							/>
							<Button type={'alt1'} label={language?.close} handlePress={() => setShowReview(false)} disabled={false} />
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</>
	);
}
