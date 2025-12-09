import React from 'react';
import { ReactSVG } from 'react-svg';

import { Types } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { TextArea } from 'components/atoms/TextArea';
import { TurboUploadConfirmation } from 'components/molecules/TurboUploadConfirmation';
import { ICONS, UPLOAD } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress, compressImageToSize, debugLog, isCompressibleImage } from 'helpers/utils';
import { useUploadCost } from 'hooks/useUploadCost';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';

const MAX_BIO_LENGTH = 500;
const ALLOWED_BANNER_TYPES = 'image/png, image/jpeg, image/gif';
const ALLOWED_AVATAR_TYPES = 'image/png, image/jpeg, image/gif';

export default function ProfileManager(props: {
	profile: Types.ProfileType | null;
	handleClose: () => void;
	handleUpdate: () => void;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const bannerInputRef = React.useRef<any>(null);
	const avatarInputRef = React.useRef<any>(null);

	const [name, setName] = React.useState<string>('');
	const [username, setUsername] = React.useState<string>('');
	const [description, setDescription] = React.useState<string>('');
	const [banner, setBanner] = React.useState<any>(null);
	const [thumbnail, setThumbnail] = React.useState<any>(null);
	const [bannerRemoved, setBannerRemoved] = React.useState<boolean>(false);
	const [thumbnailRemoved, setThumbnailRemoved] = React.useState<boolean>(false);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [pendingFile, setPendingFile] = React.useState<{ file: File; type: 'banner' | 'thumbnail' } | null>(null);
	const [compressing, setCompressing] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();
	const { uploadCost, showUploadConfirmation, calculateUploadCost, clearUploadState } = useUploadCost();

	const canCompress = pendingFile?.file && isCompressibleImage(pendingFile.file);

	React.useEffect(() => {
		setUsername(props.profile?.username ?? '');
		setName(props.profile?.displayName ?? props.profile?.displayname ?? '');
		setDescription(props.profile?.description ?? '');

		if (!bannerRemoved) {
			setBanner(props.profile?.banner && checkValidAddress(props.profile.banner) ? props.profile.banner : null);
		}
		if (!thumbnailRemoved) {
			setThumbnail(
				props.profile?.thumbnail && checkValidAddress(props.profile.thumbnail) ? props.profile.thumbnail : null
			);
		}
	}, [props.profile, bannerRemoved, thumbnailRemoved]);

	function handleUpdate(response: string) {
		permawebProvider.refreshProfile();

		setBannerRemoved(false);
		setThumbnailRemoved(false);

		if (props.handleUpdate) props.handleUpdate();
		if (props.handleClose) props.handleClose();

		addNotification(response, 'success');
	}

	async function handleSubmit() {
		if (arProvider.wallet) {
			setLoading(true);

			try {
				let data: any = {
					username: username,
					displayName: name,
					description: description,
					thumbnail: thumbnailRemoved || thumbnail === null ? 'None' : thumbnail,
					banner: bannerRemoved || banner === null ? 'None' : banner,
				};

				if (props.profile && props.profile.id) {
					const profileUpdateId = await permawebProvider.libs.updateProfile(data, props.profile.id, (status: any) =>
						debugLog('info', 'ProfileManager', status)
					);
					debugLog('info', 'ProfileManager', `Profile update: ${profileUpdateId}`);
					handleUpdate(`${language?.profileUpdated}!`);
				} else {
					const profileId = await permawebProvider.libs.createProfile(data, (status: any) =>
						debugLog('info', 'ProfileManager', status)
					);

					debugLog('info', 'ProfileManager', `Profile ID: ${profileId}`);

					handleUpdate(`${language?.profileCreated}!`);

					permawebProvider.handleInitialProfileCache(arProvider.walletAddress, profileId);
				}
			} catch (e: any) {
				addNotification(e.message ?? language?.errorUpdatingProfile, 'warning');
			}

			setLoading(false);
		}
	}

	function getInvalidBio() {
		if (description && description.length > MAX_BIO_LENGTH) {
			return {
				status: true,
				message: `${language?.maxCharsReached} (${description.length} / ${MAX_BIO_LENGTH})`,
			};
		}
		return { status: false, message: null };
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'thumbnail') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				if (file.size >= UPLOAD.dispatchUploadSize && arProvider.wallet) {
					setPendingFile({ file, type });
					await calculateUploadCost(file);
				} else {
					applyFileToState(file, type);
				}
			}
			e.target.value = '';
		}
	}

	function applyFileToState(file: File, type: 'banner' | 'thumbnail') {
		const reader = new FileReader();

		reader.onload = (event: ProgressEvent<FileReader>) => {
			if (event.target?.result) {
				switch (type) {
					case 'banner':
						setBanner(event.target.result);
						setBannerRemoved(false);
						break;
					case 'thumbnail':
						setThumbnail(event.target.result);
						setThumbnailRemoved(false);
						break;
					default:
						break;
				}
			}
		};

		reader.readAsDataURL(file);
	}

	function handleUploadConfirm() {
		if (pendingFile) {
			applyFileToState(pendingFile.file, pendingFile.type);
			handleClearPendingFile(null);
		}
	}

	function handleClearPendingFile(message: string | null) {
		if (message) addNotification(message, 'warning');
		setPendingFile(null);
		clearUploadState();
	}

	async function handleCompress() {
		if (!pendingFile) return;
		setCompressing(true);
		try {
			const compressedFile = await compressImageToSize(pendingFile.file, UPLOAD.dispatchUploadSize);
			applyFileToState(compressedFile, pendingFile.type);
			handleClearPendingFile(null);
		} catch (e: any) {
			addNotification(e.message ?? 'Error compressing image', 'warning');
		}
		setCompressing(false);
	}

	function getBannerWrapper() {
		if (banner) return <img src={checkValidAddress(banner) ? getTxEndpoint(banner) : banner} />;
		return (
			<>
				<ReactSVG src={ICONS.image} />
				<span>{language?.uploadBanner}</span>
			</>
		);
	}

	function getAvatarWrapper() {
		if (thumbnail) return <img src={checkValidAddress(thumbnail) ? getTxEndpoint(thumbnail) : thumbnail} />;
		return (
			<>
				<ReactSVG src={ICONS.user} />
				<span>{language?.uploadAvatar}</span>
			</>
		);
	}

	function getConnectedView() {
		if (!arProvider.walletAddress) return <WalletBlock />;
		else {
			return (
				<>
					<S.Wrapper>
						<S.Body>
							<S.PWrapper>
								<S.FileInputWrapper>
									<S.BInput
										hasBanner={banner !== null}
										onClick={() => bannerInputRef.current.click()}
										disabled={loading}
									>
										{getBannerWrapper()}
									</S.BInput>
									<input
										ref={bannerInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'banner')}
										disabled={loading}
										accept={ALLOWED_BANNER_TYPES}
									/>
									<S.AInput
										hasAvatar={thumbnail !== null}
										onClick={() => avatarInputRef.current.click()}
										disabled={loading}
									>
										{getAvatarWrapper()}
									</S.AInput>
									<input
										ref={avatarInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'thumbnail')}
										disabled={loading}
										accept={ALLOWED_AVATAR_TYPES}
									/>
								</S.FileInputWrapper>
								<S.PActions>
									<Button
										type={'primary'}
										label={language?.removeAvatar}
										handlePress={() => {
											setThumbnail(null);
											setThumbnailRemoved(true);
										}}
										disabled={loading || !thumbnail}
									/>
									<Button
										type={'primary'}
										label={language?.removeBanner}
										handlePress={() => {
											setBanner(null);
											setBannerRemoved(true);
										}}
										disabled={loading || !banner}
									/>
								</S.PActions>
							</S.PWrapper>
							<S.Form>
								<S.TForm>
									<FormField
										label={language?.name}
										value={name}
										onChange={(e: any) => setName(e.target.value)}
										disabled={loading}
										invalid={{ status: false, message: null }}
										required
										hideErrorMessage
									/>
									<FormField
										label={language?.handle}
										value={username}
										onChange={(e: any) => setUsername(e.target.value)}
										disabled={loading}
										invalid={{ status: false, message: null }}
										hideErrorMessage
										required
									/>
								</S.TForm>
								<TextArea
									label={language?.bio}
									value={description}
									onChange={(e: any) => setDescription(e.target.value)}
									disabled={loading}
									invalid={getInvalidBio()}
								/>
							</S.Form>
							<S.SAction>
								{props.handleClose && (
									<Button
										type={'primary'}
										label={language?.close}
										handlePress={() => props.handleClose()}
										disabled={loading}
										loading={false}
									/>
								)}
								<Button
									type={'alt1'}
									label={language?.save}
									handlePress={handleSubmit}
									disabled={!username || !name || loading}
									loading={false}
								/>
							</S.SAction>
						</S.Body>
					</S.Wrapper>
					{loading && (
						<Loader
							message={
								props.profile && props.profile.id
									? `${language?.profileUpdatingInfo}...`
									: `${language?.profileCreatingInfo}...`
							}
						/>
					)}
					{showUploadConfirmation && pendingFile && (
						<Modal
							header={`${language?.upload} ${pendingFile.file.name}`}
							handleClose={() => handleClearPendingFile(language?.uploadCancelled)}
							className={'modal-wrapper'}
						>
							<TurboUploadConfirmation
								uploadCost={uploadCost}
								uploadDisabled={loading}
								handleUpload={handleUploadConfirm}
								handleCancel={() => handleClearPendingFile(language?.uploadCancelled)}
								handleCompress={handleCompress}
								canCompress={canCompress}
								compressing={compressing}
							/>
						</Modal>
					)}
				</>
			);
		}
	}

	return getConnectedView();
}
