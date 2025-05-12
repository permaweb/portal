import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button } from 'components/atoms/Button';
import { Modal } from 'components/atoms/Modal';
import { Notification } from 'components/atoms/Notification';
import { ASSET_UPLOAD, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { RootState } from 'store';
import { currentPostUpdate } from 'store/post';

import { ArticleEditor } from './ArticleEditor';
import * as S from './styles';

export default function Editor() {
	const navigate = useNavigate();
	const { assetId } = useParams<{ assetId?: string }>();
	const dispatch = useDispatch();
	const location = useLocation();

	const currentPost = useSelector((state: RootState) => state.currentPost);

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [response, setResponse] = React.useState<NotificationType | null>(null);
	const [showReview, setShowReview] = React.useState<boolean>(false);
	const [missingFields, setMissingFields] = React.useState<string[]>([]);

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

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile?.id && portalProvider.current?.id) {
			handleCurrentPostUpdate({ field: 'loading', value: { active: true, message: `${language.savingPost}...` } });
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
					setResponse({ status: 'warning', message: e.message ?? language.errorUploadingThumbnail });
				}
			}

			if (assetId) {
				try {
					const assetContentUpdateId = await permawebProvider.libs.sendMessage({
						processId: portalProvider.current.id,
						wallet: arProvider.wallet,
						action: 'Run-Action',
						tags: [
							{ name: 'ForwardTo', value: assetId },
							{ name: 'ForwardAction', value: 'Update-Asset' },
						],
						data: { Input: data },
					});

					console.log(`Asset content update: ${assetContentUpdateId}`);
					setResponse({ status: 'success', message: `${language.postUpdated}!` });
					portalProvider.refreshCurrentPortal('assets');
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? language.errorUpdatingPost });
				}
			} else {
				try {
					const assetDataFetch = await fetch(getTxEndpoint(ASSET_UPLOAD.src.data));
					const dataSrc = await assetDataFetch.text();

					const assetId = await permawebProvider.libs.createAtomicAsset(
						{
							name: currentPost.data.title,
							description: currentPost.data.title,
							topics: currentPost.data.topics,
							creator: permawebProvider.profile.id,
							data: dataSrc,
							contentType: ASSET_UPLOAD.contentType,
							assetType: ASSET_UPLOAD.ansType,
							metadata: { releasedDate: new Date().getTime().toString() },
							users: [portalProvider.current.id],
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

					const indexRecipients = [portalProvider.current.id];

					for (const recipient of indexRecipients) {
						// TODO: If portal owner use this / or add role to zone
						// const zoneIndexUpdateId = await permawebProvider.libs.sendMessage({
						// 	processId: recipient,
						// 	wallet: arProvider.wallet,
						// 	action: 'Add-Index-Id',
						// 	tags: [{ name: 'IndexId', value: assetId }],
						// });

						const zoneIndexUpdateId = await permawebProvider.libs.sendMessage({
							processId: permawebProvider.profile.id,
							wallet: arProvider.wallet,
							action: 'Run-Action',
							tags: [
								{ name: 'ForwardTo', value: recipient },
								{ name: 'ForwardAction', value: 'Add-Index-Id' },
								{ name: 'IndexId', value: assetId },
							],
						});

						console.log(`Zone index update: ${zoneIndexUpdateId}`);
					}

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

					console.log(`Asset index update: ${assetIndexUpdateId}`);
					portalProvider.refreshCurrentPortal('assets');
					setResponse({ status: 'success', message: `${language.postSaved}!` });
					navigate(`${URLS.postEditArticle(portalProvider.current.id)}${assetId}`);
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? 'Error creating post' });
				}
			}

			handleSubmitUpdate();
		}
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

	let editor = null;

	if (location.pathname.includes('article')) {
		editor = <ArticleEditor handleSubmit={handleSubmit} />;
	}

	return (
		<>
			{editor}
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
			{showReview && (
				<Modal header={language.reviewPostDetails} handleClose={() => setShowReview(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language.missingPostFields}</p>
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
								{language.learn}
							</Link>
							<Button
								type={'primary'}
								label={language.close}
								handlePress={() => setShowReview(false)}
								disabled={false}
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</>
	);
}
