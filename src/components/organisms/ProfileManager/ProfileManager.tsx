import React from 'react';
import { ReactSVG } from 'react-svg';

import { createProfile } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Notification } from 'components/atoms/Notification';
import { TextArea } from 'components/atoms/TextArea';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';
import { IProps } from './types';

const MAX_BIO_LENGTH = 500;
const ALLOWED_BANNER_TYPES = 'image/png, image/jpeg, image/gif';
const ALLOWED_AVATAR_TYPES = 'image/png, image/jpeg, image/gif';

export default function ProfileManager(props: IProps) {
	const arProvider = useArweaveProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const bannerInputRef = React.useRef<any>(null);
	const avatarInputRef = React.useRef<any>(null);

	const [name, setName] = React.useState<string>('');
	const [username, setUsername] = React.useState<string>('');
	const [bio, setBio] = React.useState<string>('');
	const [banner, setBanner] = React.useState<any>(null);
	const [avatar, setAvatar] = React.useState<any>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [profileResponse, setProfileResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		setUsername(props.profile?.username ?? '');
		setName(props.profile?.displayName ?? '');
		setBio(props.profile?.bio ?? '');
		setBanner(props.profile?.banner && checkValidAddress(props.profile.banner) ? props.profile.banner : null);
		setAvatar(props.profile?.avatar && checkValidAddress(props.profile.avatar) ? props.profile.avatar : null);
	}, [props.profile]);

	// function handleUpdate() {
	// 	arProvider.setToggleProfileUpdate(!arProvider.toggleProfileUpdate);
	// 	if (props.handleUpdate) props.handleUpdate();
	// }

	async function handleSubmit() {
		if (arProvider.wallet) {
			setLoading(true);

			try {
				if (props.profile && props.profile.id) {
					console.log('Update profile'); // TODO
				} else {
					let data: any = {
						username: username,
						displayName: name,
						description: bio,
					};

					if (avatar) data.thumbnail = avatar;
					if (banner) data.banner = banner;

					const profileId = await createProfile(data, arProvider.wallet, (status: any) => console.log(status));

					console.log(`Profile ID: ${profileId}`);

					setProfileResponse({
						message: `${language.profileCreated}!`,
						status: 'success',
					});
				}
			} catch (e: any) {
				setProfileResponse({
					message: e.message ?? language.errorUpdatingProfile,
					status: 'warning',
				});
			}

			setLoading(false);
		}
	}

	function getInvalidBio() {
		if (bio && bio.length > MAX_BIO_LENGTH) {
			return {
				status: true,
				message: `${language.maxCharsReached} (${bio.length} / ${MAX_BIO_LENGTH})`,
			};
		}
		return { status: false, message: null };
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'avatar') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						switch (type) {
							case 'banner':
								setBanner(event.target.result);
								break;
							case 'avatar':
								setAvatar(event.target.result);
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
				<ReactSVG src={ASSETS.image} />
				<span>{language.uploadBanner}</span>
			</>
		);
	}

	function getAvatarWrapper() {
		if (avatar) return <img src={checkValidAddress(avatar) ? getTxEndpoint(avatar) : avatar} />;
		return (
			<>
				<ReactSVG src={ASSETS.user} />
				<span>{language.uploadAvatar}</span>
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
										hasAvatar={avatar !== null}
										onClick={() => avatarInputRef.current.click()}
										disabled={loading}
									>
										{getAvatarWrapper()}
									</S.AInput>
									<input
										ref={avatarInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'avatar')}
										disabled={loading}
										accept={ALLOWED_AVATAR_TYPES}
									/>
								</S.FileInputWrapper>
								<S.PActions>
									<Button
										type={'primary'}
										label={language.removeAvatar}
										handlePress={() => setAvatar(null)}
										disabled={loading || !avatar}
									/>
									<Button
										type={'primary'}
										label={language.removeBanner}
										handlePress={() => setBanner(null)}
										disabled={loading || !banner}
									/>
								</S.PActions>
							</S.PWrapper>
							<S.Form>
								<S.TForm>
									<FormField
										label={language.name}
										value={name}
										onChange={(e: any) => setName(e.target.value)}
										disabled={loading}
										invalid={{ status: false, message: null }}
										required
										hideErrorMessage
									/>
									<FormField
										label={language.handle}
										value={username}
										onChange={(e: any) => setUsername(e.target.value)}
										disabled={loading}
										invalid={{ status: false, message: null }}
										hideErrorMessage
										required
									/>
								</S.TForm>
								<TextArea
									label={language.bio}
									value={bio}
									onChange={(e: any) => setBio(e.target.value)}
									disabled={loading}
									invalid={getInvalidBio()}
								/>
							</S.Form>
							<S.SAction>
								{(!props.profile || !props.profile.id) && loading && (
									<S.Message>
										<span>{`${language.profileCreatingInfo}...`}</span>
									</S.Message>
								)}
								{props.handleClose && (
									<Button
										type={'primary'}
										label={language.close}
										handlePress={() => props.handleClose(true)}
										disabled={loading}
										loading={false}
									/>
								)}
								<Button
									type={'alt1'}
									label={language.save}
									handlePress={handleSubmit}
									disabled={!username || !name || loading}
									loading={loading}
								/>
							</S.SAction>
						</S.Body>
					</S.Wrapper>
					{profileResponse && (
						<Notification
							message={profileResponse.message}
							type={profileResponse.status}
							callback={() => setProfileResponse(null)}
						/>
					)}
				</>
			);
		}
	}

	return getConnectedView();
}
