import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Notification } from 'components/atoms/Notification';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';
import { IProps } from './types';

const ALLOWED_MEDIA_TYPES = 'image/png, image/jpeg, image/svg, image/gif';

export default function Media(props: IProps) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const mediaInputRef = React.useRef<any>(null);

	const [media, setMedia] = React.useState<any>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);
	const [portalResponse, setPortalResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (props.portal) {
			const mediaValue = props.type === 'icon' ? props.portal.icon : props.portal.logo;
			setMedia(mediaValue && checkValidAddress(mediaValue) ? mediaValue : null);
		} else {
			setMedia(null);
		}
	}, [props.portal, props.type]);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	async function handleSubmit(opts?: { remove?: boolean }) {
		if (
			!unauthorized &&
			arProvider.wallet &&
			permawebProvider.profile &&
			permawebProvider.profile.id &&
			portalProvider.current?.name
		) {
			setLoading(true);

			try {
				let response: string | null;

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

				if (props.portal?.id) {
					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					console.log(`Portal update: ${portalUpdateId}`);

					response = props.type === 'icon' ? `${language.iconUpdated}!` : `${language.logoUpdated}!`;

					if (opts?.remove) setMedia(null);
				}

				portalProvider.refreshCurrentPortal();

				if (props.handleUpdate) props.handleUpdate();
				if (props.handleClose) props.handleClose();

				if (props.type === 'icon') {
					setMedia(null);
				}

				setPortalResponse({
					message: response,
					status: 'success',
				});
			} catch (e: any) {
				setPortalResponse({
					message: e.message ?? language.errorUpdatingPortal,
					status: 'warning',
				});
			}

			setLoading(false);
		}
	}

	function handleRemoveMedia() {
		setShowRemoveConfirmation(false);
		const currentMedia = props.type === 'icon' 
			? portalProvider.current?.icon 
			: portalProvider.current?.logo;
		
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
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						setMedia(event.target.result);
					}
				};

				reader.readAsDataURL(file);
			}
			e.target.value = '';
		}
	}

	function getMediaWrapper() {
		if (media) {
			return (
				<>
					<S.RemoveWrapper>
						<IconButton
							type={'alt1'}
							src={ASSETS.delete}
							handlePress={() => setShowRemoveConfirmation(true)}
							dimensions={{
								wrapper: 20,
								icon: 11.5,
							}}
							tooltip={language.remove}
							tooltipPosition={'bottom-right'}
						/>
					</S.RemoveWrapper>
					<img src={checkValidAddress(media) ? getTxEndpoint(media) : media} />
				</>
			);
		}

		const assetSrc = props.type === 'icon' ? ASSETS.icon : ASSETS.image;
		const uploadText = props.type === 'icon' ? language.uploadIcon : language.uploadLogo;

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
									<p>{language.siteIconInfo}</p>
									<S.SAction>
										{props.handleClose && (
											<Button
												type={'primary'}
												label={language.close}
												handlePress={() => props.handleClose()}
												disabled={loading}
												loading={false}
											/>
										)}
										<Button
											type={'primary'}
											label={language.cancel}
											handlePress={() => {
												setMedia(
													currentMedia && checkValidAddress(currentMedia)
														? currentMedia
														: null
												);
											}}
											disabled={!media || checkValidAddress(media) || !currentMedia}
											loading={false}
										/>
										<Button
											type={'alt1'}
											label={language.save}
											handlePress={() => handleSubmit()}
											disabled={unauthorized || loading || !media || checkValidAddress(media)}
											loading={false}
										/>
									</S.SAction>
								</S.SActions>
							)}
							{!isIcon && (
								<S.SAction>
									{props.handleClose && (
										<Button
											type={'primary'}
											label={language.close}
											handlePress={() => props.handleClose()}
											disabled={loading}
											loading={false}
										/>
									)}
									<Button
										type={'primary'}
										label={language.cancel}
										handlePress={() => {
											setMedia(
												currentMedia && checkValidAddress(currentMedia)
													? currentMedia
													: null
											);
										}}
										disabled={!media || checkValidAddress(media) || !currentMedia}
										loading={false}
									/>
									<Button
										type={'alt1'}
										label={language.save}
										handlePress={() => handleSubmit()}
										disabled={unauthorized || loading || !media || checkValidAddress(media)}
										loading={false}
									/>
								</S.SAction>
							)}
						</S.Body>
					</S.Wrapper>
					{showRemoveConfirmation && (
						<Modal 
							header={isIcon ? language.removeIcon : language.removeLogo} 
							handleClose={() => setShowRemoveConfirmation(false)}
						>
							<S.MWrapper>
								<S.MInfo>
									<p>{isIcon ? language.iconDeleteConfirmationInfo : language.logoDeleteConfirmationInfo}</p>
								</S.MInfo>
								<S.MActions>
									<Button
										type={'primary'}
										label={language.cancel}
										handlePress={() => setShowRemoveConfirmation(false)}
										disabled={false}
										loading={false}
									/>
									<Button
										type={'primary'}
										label={isIcon ? language.iconDeleteConfirmation : language.logoDeleteConfirmation}
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
					{loading && (
						<Loader
							message={
								props.portal && props.portal.id
									? `${language.portalUpdatingInfo}...`
									: `${language.portalCreatingInfo}...`
							}
						/>
					)}
					{portalResponse && (
						<Notification
							message={portalResponse.message}
							type={portalResponse.status}
							callback={() => setPortalResponse(null)}
						/>
					)}
				</>
			);
		}
	}

	return getConnectedView();
}