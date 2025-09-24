import React from 'react';
import { ReactSVG } from 'react-svg';
import { Types } from '@permaweb/libs';
import Button from 'engine/components/form/button';
import { ICONS_UI } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

const MAX_BIO_LENGTH = 500;
const ALLOWED_BANNER_TYPES = 'image/png, image/jpeg, image/gif';
const ALLOWED_AVATAR_TYPES = 'image/png, image/jpeg, image/gif';

export default function ProfileEditor(props: {
	profile: Types.ProfileType | null;
	handleClose?: (update?: boolean) => void;
	handleUpdate?: () => void;
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
	const { addNotification } = useNotifications();

	React.useEffect(() => {
		setUsername(props.profile?.username ?? '');
		setName(props.profile?.displayName ?? '');
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
		if (props.handleClose) props.handleClose(true);

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
						console.log(status)
					);
					console.log(`Profile update: ${profileUpdateId}`);
					handleUpdate(`${language?.profileUpdated}!`);
				} else {
					const profileId = await permawebProvider.libs.createProfile(data, (status: any) => console.log(status));

					console.log(`Profile ID: ${profileId}`);

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

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'thumbnail') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
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
			e.target.value = '';
		}
	}

	function getBannerWrapper() {
		if (banner) return <img src={checkValidAddress(banner) ? getTxEndpoint(banner) : banner} />;
		return (
			<>
				<ReactSVG src={ICONS_UI.BANNER} />
				<span>{language?.uploadBanner}</span>
			</>
		);
	}

	function getAvatarWrapper() {
		if (thumbnail) return <img src={checkValidAddress(thumbnail) ? getTxEndpoint(thumbnail) : thumbnail} />;
		return (
			<>
				<ReactSVG src={ICONS_UI.USER} />
				<span>{language?.uploadAvatar}</span>
			</>
		);
	}

	function getConnectedView() {
		if (!arProvider.walletAddress) return null;
		else {
			return (
				<>
					<S.Wrapper>
						<S.Body>
							<S.PWrapper>
								<S.BWrapper>
									<S.BannerInput
										$hasBanner={banner !== null}
										onClick={() => bannerInputRef.current.click()}
										disabled={loading}
									>
										{getBannerWrapper()}
									</S.BannerInput>
									<input
										ref={bannerInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'banner')}
										disabled={loading}
										accept={ALLOWED_BANNER_TYPES}
									/>
									<S.AvatarInput
										$hasAvatar={thumbnail !== null}
										onClick={() => avatarInputRef.current.click()}
										disabled={loading}
									>
										{getAvatarWrapper()}
									</S.AvatarInput>
									<input
										ref={avatarInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'thumbnail')}
										disabled={loading}
										accept={ALLOWED_AVATAR_TYPES}
									/>
								</S.BWrapper>
								<S.ImageActions>
									<Button
										label={language?.removeAvatar}
										type="default"
										onClick={() => {
											setThumbnail(null);
											setThumbnailRemoved(true);
										}}
										disabled={loading || !thumbnail}
									/>
									<Button
										label={language?.removeBanner}
										type="default"
										onClick={() => {
											setBanner(null);
											setBannerRemoved(true);
										}}
										disabled={loading || !banner}
									/>
								</S.ImageActions>
							</S.PWrapper>
							<S.Form>
								<S.TForm>
									<label htmlFor="name">{language?.name} *</label>
									<input id="name" value={name} onChange={(e: any) => setName(e.target.value)} disabled={loading} />
									<label htmlFor="username">{language?.handle || language?.username} *</label>
									<input
										id="username"
										value={username}
										onChange={(e: any) => setUsername(e.target.value)}
										disabled={loading}
									/>
								</S.TForm>
								<label htmlFor="bio">{language?.bio}</label>
								<textarea
									id="bio"
									value={description}
									onChange={(e: any) => setDescription(e.target.value)}
									disabled={loading}
								/>
								{getInvalidBio().status && (
									<S.PInfoMessage>
										<span>{getInvalidBio().message}</span>
									</S.PInfoMessage>
								)}
							</S.Form>
							<S.SAction>
								{props.handleClose && (
									<Button
										label={language?.close}
										type="default"
										disabled={loading}
										onClick={() => props.handleClose()}
									/>
								)}
								<Button
									label={language?.save}
									type="primary"
									disabled={!username || !name || loading || getInvalidBio().status}
									onClick={handleSubmit}
								/>
							</S.SAction>
						</S.Body>
					</S.Wrapper>
					{loading && (
						<S.LoadingMessage>
							<span>
								{props.profile && props.profile.id
									? `${language?.profileUpdatingInfo}...`
									: `${language?.profileCreatingInfo}...`}
							</span>
						</S.LoadingMessage>
					)}
				</>
			);
		}
	}

	return getConnectedView();
}
