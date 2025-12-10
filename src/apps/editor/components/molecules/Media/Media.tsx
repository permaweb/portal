import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { TurboUploadConfirmation } from 'components/molecules/TurboUploadConfirmation';
import { ICONS, UPLOAD } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalDetailType, PortalPatchMapEnum } from 'helpers/types';
import { checkValidAddress, compressImageToSize, debugLog, isCompressibleImage } from 'helpers/utils';
import { useUploadCost } from 'hooks/useUploadCost';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';

const ALLOWED_MEDIA_TYPES = 'image/png, image/jpeg, image/svg+xml, image/gif';
const ALLOWED_ICON_TYPES = 'image/png, image/jpeg, image/svg+xml, image/gif, image/x-icon, image/vnd.microsoft.icon';

export default function Media(props: {
	portal: PortalDetailType | null;
	type: 'icon' | 'logo' | 'wallpaper';
	handleUpdate?: () => void;
	onMediaUpload?: (mediaId: string) => void;
	hideActions?: boolean;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { uploadCost, showUploadConfirmation, calculateUploadCost, clearUploadState, insufficientBalance } =
		useUploadCost();
	const { addNotification } = useNotifications();

	const mediaInputRef = React.useRef<any>(null);

	const [media, setMedia] = React.useState<string | File | null>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);
	const [contentType, setContentType] = React.useState<string | null>(null);
	const [compressing, setCompressing] = React.useState<boolean>(false);

	const canCompress = media instanceof File && isCompressibleImage(media);

	React.useEffect(() => {
		if (props.portal) {
			const mediaValue =
				props.type === 'icon' ? props.portal.icon : props.type === 'logo' ? props.portal.logo : props.portal.wallpaper;
			setMedia(mediaValue && checkValidAddress(mediaValue) ? mediaValue : null);
		} else {
			setMedia(null);
		}
	}, [props.portal, props.type]);

	React.useEffect(() => {
		(async function () {
			if (checkValidAddress(media as any)) {
				try {
					const response = await fetch(getTxEndpoint(media as string));
					const contentTypeHeader = response.headers.get('Content-Type');
					setContentType(contentTypeHeader);
				} catch (e: any) {
					debugLog('error', 'Media', 'Error fetching content type:', e.message ?? 'Unknown error');
				}
			}
		})();
	}, [media]);

	React.useEffect(() => {
		(async function () {
			if (media instanceof File && arProvider.wallet) {
				const result = await calculateUploadCost(media);
				if (result && !result.requiresConfirmation) {
					if (props.hideActions) {
						await handleSubmit();
					}
				}
			}
		})();
	}, [media, props.portal, props.hideActions, arProvider.wallet, calculateUploadCost]);

	const unauthorized = props.portal?.id && !portalProvider.permissions?.updatePortalMeta;

	async function handleSubmit(opts?: { remove?: boolean }) {
		if (arProvider.wallet) {
			setLoading(true);

			try {
				let response: string | null;

				if (props.portal?.id && !unauthorized) {
					let data: any = {
						Name: portalProvider.current.name,
					};

					const mediaKey = props.type === 'icon' ? 'Thumbnail' : props.type === 'logo' ? 'Banner' : 'Wallpaper';

					if (media && !opts?.remove) {
						try {
							data[mediaKey] = await permawebProvider.libs.resolveTransaction(media);
						} catch (e: any) {
							data[mediaKey] = 'None';
							debugLog('error', 'Media', `Failed to resolve ${props.type}:`, e.message ?? 'Unknown error');
						}
					} else {
						data[mediaKey] = 'None';
					}

					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					debugLog('info', 'Media', 'Portal update:', portalUpdateId);

					response =
						props.type === 'icon'
							? `${language?.iconUpdated}!`
							: props.type === 'logo'
							? `${language?.logoUpdated}!`
							: `${language?.wallpaperUpdated}!`;

					if (opts?.remove) setMedia(null);

					portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Overview);
				} else if (props.onMediaUpload && media && !opts?.remove) {
					// For new portals, just upload the media and return the ID
					try {
						const mediaId = await permawebProvider.libs.resolveTransaction(media);
						props.onMediaUpload(mediaId);
						response = `${language?.mediaUploaded}!`;
					} catch (e: any) {
						debugLog('error', 'Media', `Failed to upload ${props.type}:`, e.message ?? 'Unknown error');
						throw e;
					}
				}

				if (props.handleUpdate) props.handleUpdate();

				addNotification(response, 'success');

				clearUploadState();
			} catch (e: any) {
				addNotification(e.message ?? language?.errorUpdatingPortal, 'warning');
			}

			setLoading(false);
		}
	}

	function handleRemoveMedia() {
		setShowRemoveConfirmation(false);
		const currentMedia =
			props.type === 'icon'
				? portalProvider.current?.icon
				: props.type === 'logo'
				? portalProvider.current?.logo
				: portalProvider.current?.wallpaper;

		if (currentMedia && checkValidAddress(currentMedia)) {
			handleSubmit({ remove: true });
		} else {
			setMedia(null);
		}
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				setMedia(file);
			}
			e.target.value = '';
		}
	}

	function handleClearUpload() {
		setMedia(null);
		clearUploadState();
		if (mediaInputRef.current) {
			mediaInputRef.current.value = '';
		}
	}

	async function handleCompress() {
		if (!(media instanceof File)) return;
		setCompressing(true);
		try {
			const compressedFile = await compressImageToSize(media, UPLOAD.dispatchUploadSize);
			clearUploadState();
			setMedia(compressedFile);
		} catch (e: any) {
			addNotification(e.message ?? 'Error compressing image', 'warning');
		}
		setCompressing(false);
	}

	function getMediaWrapper() {
		if (media) {
			const mediaSrc =
				media instanceof File ? URL.createObjectURL(media) : checkValidAddress(media) ? getTxEndpoint(media) : media;

			const isSvg = (media instanceof File && media.type === 'image/svg+xml') || contentType?.includes('svg');

			return (
				<>
					<S.RemoveWrapper className={'fade-in'}>
						<IconButton
							type={'alt1'}
							src={ICONS.delete}
							handlePress={() => setShowRemoveConfirmation(true)}
							dimensions={{
								wrapper: 20,
								icon: 11.5,
							}}
							tooltip={language?.remove}
							tooltipPosition={'bottom-right'}
						/>
					</S.RemoveWrapper>
					{isSvg ? <ReactSVG src={mediaSrc} /> : <img src={mediaSrc} />}
				</>
			);
		}

		const assetSrc = props.type === 'icon' ? ICONS.icon : props.type === 'logo' ? ICONS.image : ICONS.image;
		const uploadText =
			props.type === 'icon'
				? language?.uploadIcon
				: props.type === 'logo'
				? language?.uploadLogo
				: language?.uploadWallpaper;

		return (
			<>
				<ReactSVG src={assetSrc} />
				<span>{uploadText}</span>
			</>
		);
	}

	function getConnectedView() {
		if (!arProvider.walletAddress) return <WalletBlock />;
		else {
			const isIcon = props.type === 'icon';
			const hasMedia = media !== null;
			const currentMedia =
				props.type === 'icon'
					? portalProvider.current?.icon
					: props.type === 'logo'
					? portalProvider.current?.logo
					: portalProvider.current?.wallpaper;

			return (
				<>
					<S.Wrapper>
						<S.Body isIcon={isIcon}>
							<S.PWrapper isIcon={isIcon}>
								<S.FileInputWrapper>
									<S.LInput
										hasMedia={hasMedia}
										isIcon={isIcon}
										mediaType={props.type}
										onClick={() => mediaInputRef.current.click()}
										disabled={unauthorized || loading}
									>
										{getMediaWrapper()}
									</S.LInput>
									<input
										ref={mediaInputRef}
										type={'file'}
										onChange={handleFileChange}
										disabled={unauthorized || loading}
										accept={props.type === 'icon' ? ALLOWED_ICON_TYPES : ALLOWED_MEDIA_TYPES}
									/>
								</S.FileInputWrapper>
							</S.PWrapper>
							{isIcon && !props.hideActions && (
								<S.SAction>
									<Button
										type={'alt3'}
										label={language?.cancel}
										handlePress={() => {
											setMedia(currentMedia && checkValidAddress(currentMedia) ? currentMedia : null);
										}}
										disabled={!media || (typeof media === 'string' && checkValidAddress(media)) || !currentMedia}
										loading={false}
									/>
									<Button
										type={'alt4'}
										label={language?.save}
										handlePress={() => handleSubmit()}
										disabled={
											unauthorized || loading || !media || (typeof media === 'string' && checkValidAddress(media))
										}
										loading={false}
									/>
								</S.SAction>
							)}
							{!isIcon && !props.hideActions && (
								<S.SAction>
									<Button
										type={'alt3'}
										label={language?.cancel}
										handlePress={() => {
											setMedia(currentMedia && checkValidAddress(currentMedia) ? currentMedia : null);
										}}
										disabled={!media || (typeof media === 'string' && checkValidAddress(media)) || !currentMedia}
										loading={false}
									/>
									<Button
										type={'alt4'}
										label={language?.save}
										handlePress={() => handleSubmit()}
										disabled={
											unauthorized || loading || !media || (typeof media === 'string' && checkValidAddress(media))
										}
										loading={false}
									/>
								</S.SAction>
							)}
						</S.Body>
					</S.Wrapper>
					{showUploadConfirmation && (
						<Modal
							header={`${language?.upload} ${media instanceof File ? media.name : 'Media'}`}
							handleClose={() => handleClearUpload()}
							className={'modal-wrapper scroll-wrapper-hidden'}
						>
							<TurboUploadConfirmation
								uploadCost={uploadCost}
								uploadDisabled={unauthorized || loading}
								handleUpload={handleSubmit}
								handleCancel={() => handleClearUpload()}
								handleCompress={handleCompress}
								canCompress={canCompress}
								compressing={compressing}
								insufficientBalance={insufficientBalance}
							/>
						</Modal>
					)}
					{showRemoveConfirmation && (
						<Modal
							header={
								props.type === 'icon'
									? language?.removeIcon
									: props.type === 'logo'
									? language?.removeLogo
									: language?.removeWallpaper
							}
							handleClose={() => setShowRemoveConfirmation(false)}
						>
							<S.MWrapper>
								<S.MInfo>
									<p>
										{props.type === 'icon'
											? language?.iconDeleteConfirmationInfo
											: props.type === 'logo'
											? language?.logoDeleteConfirmationInfo
											: language?.wallpaperDeleteConfirmationInfo}
									</p>
								</S.MInfo>
								<S.MActions>
									<Button
										type={'primary'}
										label={language?.cancel}
										handlePress={() => setShowRemoveConfirmation(false)}
										disabled={false}
										loading={false}
									/>
									<Button
										type={'primary'}
										label={
											props.type === 'icon'
												? language?.iconDeleteConfirmation
												: props.type === 'logo'
												? language?.logoDeleteConfirmation
												: language?.wallpaperDeleteConfirmation
										}
										handlePress={() => handleRemoveMedia()}
										disabled={unauthorized || loading}
										loading={false}
										icon={ICONS.delete}
										iconLeftAlign
										warning
									/>
								</S.MActions>
							</S.MWrapper>
						</Modal>
					)}
					{loading && <Loader message={`${language?.loading}...`} />}
				</>
			);
		}
	}

	return getConnectedView();
}
