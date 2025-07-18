import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { Modal } from 'components/atoms/Modal';
import { ASSET_UPLOAD, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import {
	PortalAssetRequestType,
	PortalHeaderType,
	PortalPageType,
	PortalUserType,
	RequestUpdateType,
} from 'helpers/types';
import { filterDuplicates } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { ArticleEditor } from './ArticleEditor';
import * as S from './styles';

export default function Editor() {
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

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	React.useEffect(() => {
		const isEmpty =
			!currentPost.data.content ||
			currentPost.data.content.length === 0 ||
			currentPost.data.content.every((block) => !block.content || block.content.trim() === '');

		handleCurrentPostUpdate({ field: 'submitDisabled', value: isEmpty });
	}, [currentPost.data.content]);

	/* User is a moderator and can only review existing posts, not create new ones */
	const unauthorized =
		!assetId && !portalProvider.permissions?.postAutoIndex && !portalProvider.permissions?.postRequestIndex;

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
				addNotification(language?.unauthorized, 'warning');
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
							{ name: 'IndexId', value: assetId },
							{ name: 'UpdateType', value: updateType },
						],
					});

					console.log(`Zone index update: ${zoneIndexUpdateId}`);

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
									{ name: 'AssetType', value: ASSET_UPLOAD.ansType },
									{ name: 'ContentType', value: ASSET_UPLOAD.contentType },
									{ name: 'DateAdded', value: new Date().getTime().toString() },
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
										addNotification(e.message ?? language?.errorUploadingThumbnail, 'warning');
									}
								}

								const assetContentUpdateId = await permawebProvider.libs.sendMessage({
									processId: assetId,
									wallet: arProvider.wallet,
									action: 'Update-Asset',
									data: data,
								});

								console.log(`Asset content update: ${assetContentUpdateId}`);
							}
						}

						addNotification(`${language?.postStatusUpdated}!`, 'success');
						portalProvider.refreshCurrentPortal();

						await new Promise((r) => setTimeout(r, 1000));
						navigate(URLS.portalBase(portalProvider.current.id));
					} else {
						addNotification(language?.errorUpdatingPost, 'warning');
					}
				} catch (e: any) {
					addNotification(e.message ?? 'Error updating post status', 'warning');
				}
			}

			handleSubmitUpdate();
		}
	}

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			handleCurrentPostUpdate({ field: 'loading', value: { active: true, message: `${language?.savingPost}...` } });

			if (!validateSubmit()) {
				handleCurrentPostUpdate({ field: 'loading', value: { active: false, message: null } });
				return;
			}

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
					addNotification(e.message ?? language?.errorUploadingThumbnail, 'warning');
				}
			}

			if (assetId) {
				try {
					const assetContentUpdateId = await permawebProvider.libs.sendMessage({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						data: data,
					});

					if (isStaticPage) {
						const updatedPages = [
							...(portalProvider.current?.pages?.filter((page: PortalPageType) => page.id !== assetId) ?? []),
							{ name: currentPost.data.title, id: assetId },
						];

						const pagesUpdateId = await permawebProvider.libs.updateZone(
							{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
							portalProvider.current.id,
							arProvider.wallet
						);

						portalProvider.refreshCurrentPortal();

						console.log(`Pages update: ${pagesUpdateId}`);
					}

					console.log(`Asset content update: ${assetContentUpdateId}`);
					addNotification(`${language?.postUpdated}!`, 'success');
					portalProvider.refreshCurrentPortal('assets');
				} catch (e: any) {
					addNotification(e.message ?? language?.errorUpdatingPost, 'warning');
				}
			} else {
				try {
					const assetDataFetch = await fetch(getTxEndpoint(ASSET_UPLOAD.src.data));
					const dataSrc = await assetDataFetch.text();

					const assetId = await permawebProvider.libs.createAtomicAsset(
						{
							name: currentPost.data.title,
							description: currentPost.data.description,
							topics: currentPost.data.topics,
							creator: permawebProvider.profile.id,
							data: dataSrc,
							contentType: ASSET_UPLOAD.contentType,
							assetType: ASSET_UPLOAD.ansType,
							metadata: {
								releasedDate: new Date().getTime().toString(),
								originPortal: portalProvider.current.id,
							},
							users: getAssetAuthUsers(),
						},
						(status: any) => console.log(status)
					);

					console.log(`Asset ID: ${assetId}`);

					const assetContentUpdateId = await permawebProvider.libs.sendMessage({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						data: data,
					});

					console.log(`Asset content update: ${assetContentUpdateId}`);

					/* Add static pages assets directly to the portal process */
					if (isStaticPage && portalProvider.permissions?.updatePortalMeta) {
						const updatedPages = [...portalProvider.current?.pages, { name: currentPost.data.title, id: assetId }];
						const pagesUpdateId = await permawebProvider.libs.updateZone(
							{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
							portalProvider.current.id,
							arProvider.wallet
						);

						portalProvider.refreshCurrentPortal();

						console.log(`Pages update: ${pagesUpdateId}`);

						navigate(URLS.portalPages(portalProvider.current?.id));
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
								{ name: 'ForwardTo', value: portalProvider.current.id },
								{ name: 'ForwardAction', value: internalIndexAction },
								{ name: 'IndexId', value: assetId },
							],
						});

						console.log(`Zone index update: ${zoneIndexUpdateId}`);

						if (portalProvider.permissions.postAutoIndex) {
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
										{ name: 'AssetType', value: ASSET_UPLOAD.ansType },
										{ name: 'ContentType', value: ASSET_UPLOAD.contentType },
										{ name: 'DateAdded', value: new Date().getTime().toString() },
									],
									data: { Recipients: [portalProvider.current.id] },
								});

								console.log(`Asset index update: ${assetIndexUpdateId}`);
								portalProvider.refreshCurrentPortal('assets');
							}
						}
					}

					/* If there are external recipients, also send an index request to them */
					/* If the user is an admin in another portal then index it directly */
					if (currentPost.data?.externalRecipients?.length > 0) {
						for (const portalId of currentPost.data.externalRecipients) {
							const externalPortal = portalProvider.portals.find((portal: PortalHeaderType) => portal.id === portalId);

							if (externalPortal) {
								const hasExternalAdminAccess = externalPortal.roles
									?.find((user: PortalUserType) => user.address === permawebProvider.profile.id)
									?.roles?.includes('Admin');

								let externalIndexAction = 'Add-Index-Request';
								if (hasExternalAdminAccess) externalIndexAction = 'Add-Index-Id';

								const zoneIndexUpdateId = await permawebProvider.libs.sendMessage({
									processId: permawebProvider.profile.id,
									wallet: arProvider.wallet,
									action: 'Run-Action',
									tags: [
										{ name: 'ForwardTo', value: externalPortal.id },
										{ name: 'ForwardAction', value: externalIndexAction },
										{ name: 'IndexId', value: assetId },
									],
								});

								console.log(`External zone index update: ${zoneIndexUpdateId}`);

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
												{ name: 'AssetType', value: ASSET_UPLOAD.ansType },
												{ name: 'ContentType', value: ASSET_UPLOAD.contentType },
												{ name: 'DateAdded', value: new Date().getTime().toString() },
											],
											data: { Recipients: [externalPortal.id] },
										});

										console.log(`Asset index update: ${assetIndexUpdateId}`);
										portalProvider.refreshCurrentPortal('assets');
									}
								}
							}
						}
					}

					addNotification(`${language?.postSaved}!`, 'success');
					navigate(`${URLS.postEditArticle(portalProvider.current.id)}${assetId}`);
				} catch (e: any) {
					addNotification(e.message ?? 'Error creating post', 'warning');
				}
			}

			handleSubmitUpdate();
		}
	}

	function getAssetAuthUsers() {
		const authUsers = [portalProvider.current.id];

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
			message = 'Topics are required';
			missingFieldsFound.push(message);
		}

		if (!valid) {
			setShowReview(true);
			setMissingFields(missingFieldsFound);
		}

		return valid;
	}

	return (
		<>
			{unauthorized && (
				<div className={'overlay'}>
					<S.MessageWrapper className={'border-wrapper-alt2'}>
						<p>{language?.unauthorizedPostCreate}</p>
						<Button
							type={'primary'}
							label={language?.returnHome}
							handlePress={() => navigate(URLS.portalBase(portalProvider.current?.id))}
						/>
					</S.MessageWrapper>
				</div>
			)}
			<ArticleEditor handleSubmit={handleSubmit} handleRequestUpdate={handleRequestUpdate} staticPage={isStaticPage} />
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
							<Link to={URLS.docsEditor} target={'_blank'}>
								{language?.learn}
							</Link>
							<Button type={'alt1'} label={language?.close} handlePress={() => setShowReview(false)} disabled={false} />
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</>
	);
}
