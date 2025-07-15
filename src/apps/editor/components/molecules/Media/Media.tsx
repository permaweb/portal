import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { TurboUploadConfirmation } from 'components/molecules/TurboUploadConfirmation';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalDetailType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useUploadCost } from 'hooks/useUploadCost';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';

const ALLOWED_MEDIA_TYPES = 'image/png, image/jpeg, image/svg, image/gif';

export default function Media(props: {
	portal: PortalDetailType | null;
	type: 'icon' | 'logo';
	handleUpdate?: () => void;
	onMediaUpload?: (mediaId: string) => void;
	hideActions?: boolean;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const {
		uploadCost,
		showUploadConfirmation,
		uploadResponse,
		setUploadResponse,
		calculateUploadCost,
		clearUploadState,
		insufficientBalance,
	} = useUploadCost();

	const mediaInputRef = React.useRef<any>(null);

	const [media, setMedia] = React.useState<string | File | null>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (props.portal) {
			const mediaValue = props.type === 'icon' ? props.portal.icon : props.portal.logo;
			setMedia(mediaValue && checkValidAddress(mediaValue) ? mediaValue : null);
		} else {
			setMedia(null);
		}
	}, [props.portal, props.type]);

	React.useEffect(() => {
		(async function () {
			if (media instanceof File && arProvider.wallet) {
				const result = await calculateUploadCost(media);

				if (result) {
					if (!result.requiresConfirmation) {
						const mediaValue = props.type === 'icon' ? props.portal?.icon : props.portal?.logo;
						if (!mediaValue) await handleSubmit();
					}
					console.log(result);
				}
			}
		})();
	}, [media, props.portal, arProvider.wallet, calculateUploadCost]);

	const unauthorized = props.portal?.id && !portalProvider.permissions?.updatePortalMeta;

	async function handleSubmit(opts?: { remove?: boolean }) {
		if (!unauthorized && arProvider.wallet && permawebProvider.profile?.id) {
			setLoading(true);

			try {
				let response: string | null;

				if (props.portal?.id) {
					let data: any = {
						Name: portalProvider.current.name,
					};

					const mediaKey = props.type === 'icon' ? 'Icon' : 'Logo';

					if (media && !opts?.remove) {
						try {
							data[mediaKey] = await permawebProvider.libs.resolveTransaction(media);
						} catch (e: any) {
							data[mediaKey] = 'None';
							console.error(`Failed to resolve ${props.type}: ${e.message}`);
						}
					} else {
						data[mediaKey] = 'None';
					}

					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					console.log(`Portal update: ${portalUpdateId}`);

					response = props.type === 'icon' ? `${language?.iconUpdated}!` : `${language?.logoUpdated}!`;

					if (opts?.remove) setMedia(null);

					portalProvider.refreshCurrentPortal();
				} else if (props.onMediaUpload && media && !opts?.remove) {
					// For new portals, just upload the media and return the ID
					try {
						const mediaId = await permawebProvider.libs.resolveTransaction(media);
						props.onMediaUpload(mediaId);
						response = `${language?.mediaUploaded}!`;
					} catch (e: any) {
						console.error(`Failed to upload ${props.type}: ${e.message}`);
						throw e;
					}
				}

				if (props.handleUpdate) props.handleUpdate();

				setUploadResponse({
					message: response,
					status: 'success',
				});

				clearUploadState();
			} catch (e: any) {
				setUploadResponse({
					message: e.message ?? language?.errorUpdatingPortal,
					status: 'warning',
				});
			}

			setLoading(false);
		}
	}

	function handleRemoveMedia() {
		setShowRemoveConfirmation(false);
		const currentMedia = props.type === 'icon' ? portalProvider.current?.icon : portalProvider.current?.logo;

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

	function getMediaWrapper() {
		if (media) {
			const mediaSrc =
				media instanceof File ? URL.createObjectURL(media) : checkValidAddress(media) ? getTxEndpoint(media) : media;

			return (
				<>
					<S.RemoveWrapper className={'fade-in'}>
						<IconButton
							type={'alt1'}
							src={ASSETS.delete}
							handlePress={() => setShowRemoveConfirmation(true)}
							dimensions={{
								wrapper: 20,
								icon: 11.5,
							}}
							tooltip={language?.remove}
							tooltipPosition={'bottom-right'}
						/>
					</S.RemoveWrapper>
					<img src={mediaSrc} />
				</>
			);
		}

		const assetSrc = props.type === 'icon' ? ASSETS.icon : ASSETS.image;
		const uploadText = props.type === 'icon' ? language?.uploadIcon : language?.uploadLogo;

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
			const currentMedia = isIcon ? portalProvider.current?.icon : portalProvider.current?.logo;

			return (
				<>
					<S.Wrapper>
						<S.Body isIcon={isIcon}>
							<S.PWrapper isIcon={isIcon}>
								<S.FileInputWrapper>
									<S.LInput
										hasMedia={hasMedia}
										isIcon={isIcon}
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
										accept={ALLOWED_MEDIA_TYPES}
									/>
								</S.FileInputWrapper>
							</S.PWrapper>
							{isIcon && (
								<S.SActions>
									<p>{language?.siteIconInfo}</p>
									{!props.hideActions && (
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
								</S.SActions>
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
							className={'modal-wrapper'}
						>
							<TurboUploadConfirmation
								uploadCost={uploadCost}
								uploadDisabled={unauthorized || loading}
								handleUpload={handleSubmit}
								handleCancel={() => handleClearUpload()}
								message={uploadResponse?.message ?? '-'}
								insufficientBalance={insufficientBalance}
							/>
						</Modal>
					)}
					{showRemoveConfirmation && (
						<Modal
							header={isIcon ? language?.removeIcon : language?.removeLogo}
							handleClose={() => setShowRemoveConfirmation(false)}
						>
							<S.MWrapper>
								<S.MInfo>
									<p>{isIcon ? language?.iconDeleteConfirmationInfo : language?.logoDeleteConfirmationInfo}</p>
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
										label={isIcon ? language?.iconDeleteConfirmation : language?.logoDeleteConfirmation}
										handlePress={() => handleRemoveMedia()}
										disabled={unauthorized || loading}
										loading={false}
										icon={ASSETS.delete}
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
