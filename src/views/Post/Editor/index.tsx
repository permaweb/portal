import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { aoSend, createAtomicAsset, globalLog, mapToProcessCase } from '@permaweb/libs';

import { Notification } from 'components/atoms/Notification';
import { ASSET_UPLOAD, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { RootState } from 'store';
import { currentPostUpdate } from 'store/post';

import { ArticleEditor } from '../Editors/ArticleEditor';

export default function Editor() {
	const navigate = useNavigate();
	const { assetId } = useParams<{ assetId?: string }>();

	const dispatch = useDispatch();
	const location = useLocation();

	const currentPost = useSelector((state: RootState) => state.currentPost);

	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [response, setResponse] = React.useState<NotificationType | null>(null);

	const handleDispatch = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	async function handleSubmit() {
		if (arProvider.wallet && arProvider.profile?.id && portalProvider.current?.id) {
			handleDispatch({ field: 'loading', value: { active: true, message: `${language.savingPost}...` } });
			if (!validateSubmit()) {
				handleDispatch({ field: 'loading', value: { active: false, message: null } });
				return;
			}

			const data = mapToProcessCase({
				title: currentPost.data.title,
				status: currentPost.data.status,
				content: currentPost.data.content,
				topics: currentPost.data.topics,
				categories: currentPost.data.categories,
			});

			if (assetId) {
				try {
					const assetContentUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						data: data,
					});

					globalLog(`Asset content update: ${assetContentUpdateId}`);

					setResponse({ status: 'success', message: `${language.postUpdated}!` });

					portalProvider.refreshCurrentPortal('assets');
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? language.errorUpdatingPost });
				}
			} else {
				try {
					const assetDataFetch = await fetch(getTxEndpoint(ASSET_UPLOAD.src.data));
					const dataSrc = await assetDataFetch.text();

					const assetId = await createAtomicAsset(
						{
							title: currentPost.data.title,
							description: currentPost.data.title,
							type: ASSET_UPLOAD.ansType,
							topics: currentPost.data.topics,
							data: dataSrc,
							contentType: ASSET_UPLOAD.contentType,
							creator: arProvider.profile.id,
							tags: [{ name: 'Status', value: currentPost.data.status }],
							src: ASSET_UPLOAD.src.process,
						},
						arProvider.wallet,
						(status: any) => globalLog(status)
					);

					globalLog(`Asset ID: ${assetId}`);

					const assetContentUpdateId = await aoSend({
						processId: assetId,
						wallet: arProvider.wallet,
						action: 'Update-Asset',
						data: data,
					});

					globalLog(`Asset content update: ${assetContentUpdateId}`);

					const indexRecipients = [portalProvider.current.id];

					for (const recipient of indexRecipients) {
						const zoneIndexUpdateId = await aoSend({
							processId: recipient,
							wallet: arProvider.wallet,
							action: 'Add-Index-Id',
							tags: [{ name: 'IndexId', value: assetId }],
						});

						globalLog(`Zone index update: ${zoneIndexUpdateId}`);
					}

					const assetIndexUpdateId = await aoSend({
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

					globalLog(`Asset index update: ${assetIndexUpdateId}`);
					portalProvider.refreshCurrentPortal('assets');
					setResponse({ status: 'success', message: `${language.postSaved}!` });
					navigate(`${URLS.postEditArticle(portalProvider.current.id)}${assetId}`);
				} catch (e: any) {
					setResponse({ status: 'warning', message: e.message ?? 'Error creating post' });
				}
			}
			handleDispatch({ field: 'loading', value: { active: false, message: null } });
		}
	}

	function validateSubmit() {
		let valid: boolean = true;
		let message: string | null = null;

		if (!currentPost.data.title) {
			valid = false;
			message = 'Post title is required';
		}
		if (!currentPost.data.status) {
			valid = false;
			message = 'Status is required';
		}
		if (!currentPost.data.content?.length) {
			valid = false;
			message = 'No content found in post';
		}
		if (!currentPost.data.categories?.length) {
			valid = false;
			message = 'Categories are required';
		}
		if (!currentPost.data.categories?.length) {
			valid = false;
			message = 'Topics are required';
		}

		if (!valid) {
			setResponse({ status: 'warning', message: message });
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
		</>
	);
}
