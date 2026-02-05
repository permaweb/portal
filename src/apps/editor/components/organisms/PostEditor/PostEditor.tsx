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
	getPortalAssets,
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
	const [submittedReviewStatus, setSubmittedReviewStatus] = React.useState<'pending' | null>(null);
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
					const zoneIndexUpdate = await permawebProvider.libs.sendMessage({
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
						message: zoneIndexUpdate,
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
					const zoneIndexResult = await permawebProvider.libs.sendMessage({
						processId: portalProvider.current.id,
						wallet: arProvider.wallet,
						action: 'Update-Index-Request',
						tags: [
							{ name: 'Index-Id', value: assetId },
							{ name: 'Update-Type', value: updateType },
						],
						returnResult: true,
					});

					debugLog('info', 'PostEditor', `Zone index update`, zoneIndexResult?.Output?.data);

					if (zoneIndexResult?.Messages?.length > 0) {
						if (updateType === 'Approve') {
							const assetIndexResult = await permawebProvider.libs.sendMessage({
								processId: portalProvider.current.id,
								wallet: arProvider.wallet,
								action: 'Run-Action',
								tags: [
									{ name: 'Forward-To', value: assetId },
									{ name: 'Forward-Action', value: 'Send-Index' },
									{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
									{ name: 'Date-Added', value: new Date().getTime().toString() },
								],
								data: { Input: { Recipients: indexRecipients } },
								returnResult: true,
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
									processId: portalProvider.current.id,
									wallet: arProvider.wallet,
									action: 'Run-Action',
									tags: [
										{ name: 'Forward-To', value: assetId },
										{ name: 'Forward-Action', value: 'Update-Asset' },
									],
									data: { Input: data },
									returnResult: true,
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

			// Validate URL uniqueness in external portals (only runs when cross-posting)
			if (currentPost.data?.externalRecipients?.length > 0) {
				handleCurrentPostUpdate({
					field: 'loading',
					value: { active: true, message: `${language?.validating || 'Validating'}...` },
				});
				const externalValidation = await validateExternalPortalUrls();
				if (!externalValidation.valid) {
					setShowReview(true);
					setMissingFields(externalValidation.errors);
					handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
					return;
				}
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

			if (!assetId) {
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
						const zoneResult = await permawebProvider.libs.sendMessage({
							processId: permawebProvider.profile.id,
							wallet: arProvider.wallet,
							action: 'Run-Action',
							tags: [
								{ name: 'Forward-To', value: portalProvider.current.id },
								{ name: 'Forward-Action', value: internalIndexAction },
								{ name: 'Index-Id', value: assetId },
							],
							data: { Input: {} },
							returnResult: true,
						});

						if (portalProvider.permissions.postAutoIndex) {
							if (zoneResult?.Messages?.length > 0) {
								const assetIndexUpdateId = await permawebProvider.libs.sendMessage({
									processId: assetId,
									wallet: arProvider.wallet,
									action: 'Send-Index',
									tags: [
										{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
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
							setSubmittedReviewStatus('pending');
						}
					}

					await handleExternalRecipients(assetId);

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
			} else {
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
							returnResult: true,
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

					// await handleExternalRecipients(assetId);

					if (isStaticPage) {
						const currentPages = portalProvider.current?.pages || {};

						// Find all entries with the current asset ID
						const matchingEntries: any = Object.entries(currentPages).filter(([_, page]: any) => page.id === assetId);
						const currentPageName = matchingEntries[0]?.[1]?.name;

						// Only update pages if the title has changed
						if (currentPageName !== currentPost.data.title) {
							// Start with all existing pages
							const updatedPages = { ...currentPages };

							// Mark all old entries with the same asset ID as 'Removed'
							matchingEntries.forEach(([key]) => {
								updatedPages[key] = 'Removed';
							});

							// Add the new entry with updated title
							updatedPages[urlify(currentPost.data.title)] = {
								type: 'static',
								id: assetId,
								name: currentPost.data.title,
							};

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
			}

			handleSubmitUpdate();
		}
	}

	async function handleExternalRecipients(assetId: string) {
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

					try {
						const zoneResult = await permawebProvider.libs.sendMessage({
							processId: permawebProvider.profile.id,
							wallet: arProvider.wallet,
							action: 'Run-Action',
							tags: tags,
							data: { Input: {} },
							returnResult: true,
						});

						if (hasExternalAdminAccess) {
							if (zoneResult?.Messages?.length > 0) {
								const assetIndexUpdateId = await permawebProvider.libs.sendMessage({
									processId: assetId,
									wallet: arProvider.wallet,
									action: 'Send-Index',
									tags: [
										{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
										{ name: 'Date-Added', value: new Date().getTime().toString() },
									],
									data: { Recipients: [externalPortal.id] },
								});

								debugLog('info', 'PostEditor', `Asset index update: ${assetIndexUpdateId}`);
								portalProvider.refreshCurrentPortal([PortalPatchMapEnum.Posts, PortalPatchMapEnum.Requests]);
							}
						}
					} catch (e: any) {
						console.error(e);
						throw new Error(e);
					}
				}
			}
		}
	}

	function getAssetAuthUsers() {
		const authUsers = [portalProvider.current.id];

		/* Add external portals as auth users if they exist */
		if (currentPost.data?.externalRecipients?.length > 0) {
			for (const portalId of currentPost.data.externalRecipients) {
				const externalPortal = portalProvider.portals.find((portal: PortalHeaderType) => portal.id === portalId);

				if (externalPortal) {
					/* Give the external portal update access */
					authUsers.push(externalPortal.id);
				}
			}
		}

		return authUsers;

		/* Below is deprecated, all post updates now go directly through portal processes */

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

	async function validateExternalPortalUrls(): Promise<{ valid: boolean; errors: string[] }> {
		const errors: string[] = [];

		if (!currentPost.data?.externalRecipients?.length || !currentPost.data.url) {
			return { valid: true, errors: [] };
		}

		for (const portalId of currentPost.data.externalRecipients) {
			const portal = portalProvider.portals?.find((p: PortalHeaderType) => p.id === portalId);
			const portalName = portal?.name || portalId;

			try {
				const response = await permawebProvider.libs.readState({
					processId: portalId,
					path: 'Posts',
					hydrate: true,
				});

				const posts = permawebProvider.libs.mapFromProcessCase(response);
				const assets = getPortalAssets(posts?.index);

				if (assets?.length) {
					const duplicateUrl = assets.some(
						(asset: any) => asset.metadata?.url?.toLowerCase() === currentPost.data.url.toLowerCase()
					);

					if (duplicateUrl) {
						errors.push(`Post URL already exists in "${portalName}"`);
					}
				}
			} catch (e: any) {
				debugLog('warn', 'PostEditor', `Failed to validate URL for portal ${portalId}:`, e.message);
			}
		}

		return { valid: errors.length === 0, errors };
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

	function getSubmittedReviewStatus() {
		let renderModal = true;

		let header = '';
		let description = '';

		switch (submittedReviewStatus) {
			case 'pending':
				header = language.postSavedHeader;
				description = language.postSavedDescription;
				break;
			default:
				renderModal = false;
				break;
		}

		if (renderModal) {
			return (
				<Modal header={header} handleClose={() => setSubmittedReviewStatus(null)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{description}</p>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'alt1'}
								label={language?.close}
								handlePress={() => setSubmittedReviewStatus(null)}
								disabled={false}
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			);
		}

		return null;
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
			{submittedReviewStatus && getSubmittedReviewStatus()}
		</>
	);
}
