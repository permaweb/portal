import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostResetFocus, currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { ICONS } from 'helpers/config';
import {
	extractMarkdownDocument,
	getMarkdownDescription,
	getMarkdownFeaturedImage,
	getMarkdownTitle,
	parseMarkdownToBlocks,
} from 'helpers/markdown';
import { checkValidAddress, debugLog } from 'helpers/utils';
import { extractWordPressArticle } from 'helpers/wordpress';
import { useScrollToTop } from 'hooks/useScrollToTop';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

function featuredImageTransactionId(value: string) {
	if (checkValidAddress(value)) return value;
	const arUri = value.match(/^ar:\/\/([a-zA-Z0-9_-]{43})$/i)?.[1];
	if (arUri) return arUri;
	try {
		const pathId = new URL(value).pathname.split('/').filter(Boolean).pop();
		return pathId && checkValidAddress(pathId) ? pathId : null;
	} catch {
		return null;
	}
}

export default function ArticlePostImport() {
	const dispatch = useDispatch();
	const { key: routeKey } = useLocation();
	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const [showOptions, setShowOptions] = React.useState<boolean>(false);
	const [assetId, setAssetId] = React.useState<string>('');
	const [wordPressUrl, setWordPressUrl] = React.useState<string>('');
	const [loading, setLoading] = React.useState<boolean>(false);
	const [importVersion, setImportVersion] = React.useState(0);
	useScrollToTop(importVersion, importVersion > 0);

	const importSessionRef = React.useRef<{ routeKey: string } | null>(null);
	const routeChanged = importSessionRef.current?.routeKey !== routeKey;
	React.useLayoutEffect(() => {
		importSessionRef.current = { routeKey };
		setLoading(false);
		setShowOptions(false);
		setAssetId('');
		return () => {
			importSessionRef.current = null;
		};
	}, [routeKey]);

	const completeImport = () => {
		dispatch(currentPostResetFocus());
		setShowOptions(false);
		setImportVersion((version) => version + 1);
	};

	const importFeaturedImage = async (source: string) => {
		if (!portalProvider.current?.id || !arProvider.wallet) {
			throw new Error('A portal and connected wallet are required to import a featured image');
		}
		let tx = featuredImageTransactionId(source);
		if (!tx) {
			const response = await fetch(source, { mode: 'cors' });
			if (!response.ok) throw new Error(`Featured image request failed (${response.status})`);
			const blob = await response.blob();
			if (!blob.type.startsWith('image/')) throw new Error('The featured image URL did not return an image');
			const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
			tx = await permawebProvider.libs.resolveTransaction(
				new File([blob], `imported-featured-image.${extension}`, { type: blob.type })
			);
		}

		await portalProvider.addPortalUpload({ tx, type: 'image', dateUploaded: Date.now().toString() });
		return tx;
	};

	const handleMarkdownUpload = () => {
		fileInputRef.current?.click();
	};

	const handleWordPressImport = async () => {
		if (!wordPressUrl.trim()) {
			addNotification('Please enter a WordPress article URL', 'warning');
			return;
		}

		setLoading(true);
		const session = importSessionRef.current;
		try {
			const convertedPost = await extractWordPressArticle(wordPressUrl.trim());
			if (importSessionRef.current !== session) return;
			const thumbnail = convertedPost.thumbnail ? await importFeaturedImage(convertedPost.thumbnail) : null;
			if (importSessionRef.current !== session) return;

			// Update post content
			dispatch(currentPostUpdate({ field: 'content', value: convertedPost.content }));

			// Update title
			if (convertedPost.title) {
				dispatch(currentPostUpdate({ field: 'title', value: convertedPost.title }));
			}

			// Update description
			if (convertedPost.description) {
				dispatch(currentPostUpdate({ field: 'description', value: convertedPost.description }));
			}

			// Update thumbnail
			if (thumbnail) {
				dispatch(currentPostUpdate({ field: 'thumbnail', value: thumbnail }));
			}

			// Update date created if available
			if (convertedPost.dateCreated) {
				dispatch(currentPostUpdate({ field: 'dateCreated', value: convertedPost.dateCreated }));
			}

			addNotification('WordPress article imported successfully', 'success');
			completeImport();
			setWordPressUrl('');
		} catch (e: any) {
			if (importSessionRef.current !== session) return;
			debugLog('error', 'ArticlePostImport', e);
			addNotification(e.message ?? 'Failed to import WordPress article', 'warning');
		} finally {
			if (importSessionRef.current === session) setLoading(false);
		}
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.md')) {
			addNotification(language.markdownFileOnly, 'warning');
			return;
		}

		setLoading(true);
		const session = importSessionRef.current;
		try {
			const text = await file.text();
			if (importSessionRef.current !== session) return;
			const markdown = extractMarkdownDocument(text);
			const blocks = parseMarkdownToBlocks(markdown.body);

			const existingContent = currentPost.data?.content || [];
			const updatedContent = [...existingContent, ...blocks];
			const title = getMarkdownTitle(markdown);
			const description = getMarkdownDescription(markdown.frontmatter);
			const featuredImage = getMarkdownFeaturedImage(markdown.frontmatter);
			const thumbnail = featuredImage ? await importFeaturedImage(featuredImage) : null;
			if (importSessionRef.current !== session) return;

			dispatch(currentPostUpdate({ field: 'content', value: updatedContent }));
			if (title) dispatch(currentPostUpdate({ field: 'title', value: title }));
			if (description) dispatch(currentPostUpdate({ field: 'description', value: description }));
			if (thumbnail) {
				dispatch(currentPostUpdate({ field: 'thumbnail', value: thumbnail }));
			}

			addNotification(language.markdownImportSuccess, 'success');
			completeImport();
		} catch (e: any) {
			if (importSessionRef.current !== session) return;
			debugLog('error', 'ArticlePostImport', e);
			addNotification(e.message ?? language.markdownImportError, 'warning');
		} finally {
			if (importSessionRef.current === session) setLoading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	React.useEffect(() => {
		// On navigation, this render can still contain the previous route's post ID.
		if (routeChanged) return;
		let active = true;
		const session = importSessionRef.current;
		const isCurrent = () => active && importSessionRef.current === session;
		if (checkValidAddress(assetId)) {
			(async function () {
				setLoading(true);
				try {
					const response = await permawebProvider.libs.getAtomicAsset(assetId);
					if (!isCurrent()) return;
					debugLog('info', 'ArticlePostImport', response);
					if (response?.metadata?.content) {
						const thumbnail = response.metadata.thumbnail
							? await importFeaturedImage(response.metadata.thumbnail)
							: null;
						if (!isCurrent()) return;
						const existingContent = currentPost.data.content || [];
						const updatedContent = [...existingContent, ...response.metadata.content];

						dispatch(currentPostUpdate({ field: 'content', value: updatedContent }));

						if (response.name) dispatch(currentPostUpdate({ field: 'title', value: response.name }));
						if (thumbnail) {
							dispatch(
								currentPostUpdate({
									field: 'thumbnail',
									value: thumbnail,
								})
							);
						}
					}
					addNotification(language.contentImported, 'success');
					completeImport();
				} catch (e: any) {
					if (!isCurrent()) return;
					debugLog('error', 'ArticlePostImport', e);
					addNotification(e.message ?? language.errorImportingPost, 'warning');
				}
				setShowOptions(false);
				setLoading(false);
				setAssetId('');
			})();
		}
		return () => {
			active = false;
		};
	}, [assetId, routeKey]);

	return (
		<>
			{loading && <Loader message={`${language.loading}...`} />}
			<S.Wrapper>
				<Button
					type={'alt1'}
					label={language.import}
					handlePress={() => setShowOptions(true)}
					disabled={false}
					icon={ICONS.import}
					iconLeftAlign
					height={40}
					fullWidth
				/>
			</S.Wrapper>
			<input ref={fileInputRef} type={'file'} accept={'.md'} style={{ display: 'none' }} onChange={handleFileChange} />
			<Panel
				open={showOptions}
				header={language.importFromExistingPost}
				handleClose={() => setShowOptions(false)}
				width={500}
				className={'modal-wrapper'}
				closeHandlerDisabled
			>
				<S.PanelWrapper>
					<S.PanelInfo>
						<span>{language.importFromExistingPostInfo}</span>
					</S.PanelInfo>
					<S.PanelSection>
						<FormField
							value={assetId}
							onChange={(e: any) => setAssetId(e.target.value)}
							label={language?.postId}
							invalid={{ status: assetId ? !checkValidAddress(assetId) : false, message: null }}
							disabled={false}
							hideErrorMessage
							tooltip={'Import from an existing portal post.'}
							noMargin
						/>
					</S.PanelSection>
					<S.PanelSectionDivider>
						<div className={'divider'} />
						<span>Or</span>
						<div className={'divider'} />
					</S.PanelSectionDivider>
					<S.PanelSection>
						<FormField
							value={wordPressUrl}
							onChange={(e: any) => setWordPressUrl(e.target.value)}
							label={'WordPress Article URL'}
							invalid={{ status: false, message: null }}
							disabled={false}
							hideErrorMessage
							tooltip={
								'Import from a WordPress article URL. Supports both self-hosted WordPress sites and WordPress.com sites.'
							}
							noMargin
							placeholder={'https://example.com/2024/01/my-article/'}
						/>
						<div style={{ marginTop: '10px' }}>
							<Button
								type={'alt1'}
								label={'Import WordPress Article'}
								handlePress={handleWordPressImport}
								disabled={!wordPressUrl.trim() || loading}
								height={42.5}
								fullWidth
							/>
						</div>
					</S.PanelSection>
					<S.PanelSectionDivider>
						<div className={'divider'} />
						<span>Or</span>
						<div className={'divider'} />
					</S.PanelSectionDivider>
					<S.PanelSection>
						<Button
							type={'alt1'}
							label={language.markdown}
							handlePress={handleMarkdownUpload}
							disabled={false}
							height={42.5}
							fullWidth
						/>
					</S.PanelSection>
					<S.PanelActions>
						<Button
							type={'primary'}
							label={language.close}
							handlePress={() => setShowOptions(false)}
							disabled={false}
						/>
					</S.PanelActions>
				</S.PanelWrapper>
			</Panel>
		</>
	);
}
