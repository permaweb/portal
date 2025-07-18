import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { TurboUploadConfirmation } from 'components/molecules/TurboUploadConfirmation';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';
import { useUploadCost } from 'hooks/useUploadCost';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

const ALLOWED_THUMBNAIL_TYPES = 'image/png, image/jpeg, image/gif';

export default function ArticlePostThumbnail() {
	const dispatch = useDispatch();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { uploadCost, showUploadConfirmation, calculateUploadCost, clearUploadState } = useUploadCost();

	const inputRef = React.useRef<any>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [thumbnailData, setThumbnailData] = React.useState<File | null>(null);
	const { addNotification } = useNotifications();

	React.useEffect(() => {
		(async function () {
			if (thumbnailData && portalProvider.current?.id && arProvider.wallet) {
				const result = await calculateUploadCost(thumbnailData);

				if (result && !result.requiresConfirmation) {
					await handleUpload();
				}
			}
		})();
	}, [
		thumbnailData,
		portalProvider.current?.id,
		portalProvider.permissions?.updatePortalMeta,
		arProvider.wallet,
		calculateUploadCost,
	]);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
		addNotification(`${language?.thumbnailUpdated}!`, 'success');
	};

	async function handleUpload() {
		if (!thumbnailData) return;

		setLoading(true);
		try {
			const tx = await permawebProvider.libs.resolveTransaction(thumbnailData);
			handleCurrentPostUpdate({ field: 'thumbnail', value: tx });
			setUploadResponse({ status: 'success', message: `${language?.thumbnailUpdated}!` });
			handleClear(null);
		} catch (e: any) {
			handleClear(e.message ?? 'Error uploading thumbnail');
		}
		setLoading(false);
	}

	function handleClear(message: string | null) {
		if (message) setUploadResponse({ status: 'warning', message: message });
		setThumbnailData(null);
		clearUploadState();
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file && file.type.startsWith('image/')) {
			setThumbnailData(file);
		}
	}

	function getInputWrapper() {
		if (currentPost?.data?.thumbnail)
			return (
				<img
					src={
						checkValidAddress(currentPost?.data?.thumbnail)
							? getTxEndpoint(currentPost?.data?.thumbnail)
							: currentPost?.data?.thumbnail
					}
				/>
			);
		return (
			<>
				<ReactSVG src={ASSETS.image} />
				<span>{language?.uploadFeaturedImage}</span>
			</>
		);
	}

	return (
		<>
			<S.Wrapper>
				<S.InputWrapper>
					<S.Input
						hasInput={!!currentPost?.data?.thumbnail}
						onClick={() => inputRef.current.click()}
						disabled={loading}
					>
						{getInputWrapper()}
					</S.Input>
					<input
						ref={inputRef}
						type={'file'}
						onChange={handleFileChange}
						disabled={loading}
						accept={ALLOWED_THUMBNAIL_TYPES}
					/>
				</S.InputWrapper>
				<S.FooterWrapper>
					<Button
						type={'alt2'}
						label={language?.remove}
						handlePress={() => handleCurrentPostUpdate({ field: 'thumbnail', value: null })}
						disabled={!currentPost?.data?.thumbnail}
						loading={false}
						icon={ASSETS.delete}
						iconLeftAlign
						warning
					/>
				</S.FooterWrapper>
			</S.Wrapper>
			{showUploadConfirmation && thumbnailData && (
				<Modal
					header={`${language?.upload} ${thumbnailData.name}`}
					handleClose={() => handleClear(language?.uploadCancelled)}
					className={'modal-wrapper'}
				>
					<TurboUploadConfirmation
						uploadCost={uploadCost}
						uploadDisabled={loading}
						handleUpload={handleUpload}
						handleCancel={() => handleClear(language?.uploadCancelled)}
					/>
				</Modal>
			)}
			{loading && <Loader message={`${language?.loading}...`} />}
		</>
	);
}
