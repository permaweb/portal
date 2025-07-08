import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
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

const ALLOWED_LOGO_TYPES = 'image/png, image/jpeg, image/svg';

export default function Icon(props: IProps) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const logoInputRef = React.useRef<any>(null);

	const [icon, setIcon] = React.useState<any>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [portalResponse, setPortalResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (props.portal) {
			setIcon(props.portal.icon && checkValidAddress(props.portal.icon) ? props.portal.icon : null);
		} else {
			setIcon(null);
		}
	}, [props.portal]);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	async function handleSubmit() {
		if (
			!unauthorized &&
			arProvider.wallet &&
			permawebProvider.profile &&
			permawebProvider.profile.id &&
			portalProvider.current?.name
		) {
			setLoading(true);

			try {
				// let profileUpdateId: string | null;
				let response: string | null;

				let data: any = {
					Name: portalProvider.current.name,
				};

				if (icon) {
					try {
						data.Icon = await permawebProvider.libs.resolveTransaction(icon);
					} catch (e: any) {
						data.Icon = 'None';
						console.error(`Failed to resolve icon: ${e.message}`);
					}
				}

				if (props.portal && props.portal.id) {
					// const portalsUpdateData = portalProvider.portals
					// 	.filter((portal: PortalHeaderType) => portal.id !== props.portal.id)
					// 	.map((portal: PortalHeaderType) => ({ Id: portal.id, Name: portal.name, Icon: portal.icon }));
					// portalsUpdateData.push({ Id: props.portal.id, ...data });

					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					console.log(`Portal update: ${portalUpdateId}`);

					// profileUpdateId = await permawebProvider.libs.updateZone(
					// 	{ Portals: portalsUpdateData },
					// 	permawebProvider.profile.id,
					// 	arProvider.wallet
					// );

					response = `${language.iconUpdated}!`;
				}

				// if (profileUpdateId) console.log(`Profile update: ${profileUpdateId}`);

				portalProvider.refreshCurrentPortal();
				// permawebProvider.refreshProfile();

				if (props.handleUpdate) props.handleUpdate();
				if (props.handleClose) props.handleClose();

				setIcon(null);

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

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'icon') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						switch (type) {
							case 'icon':
								setIcon(event.target.result);
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

	function getLogoWrapper() {
		if (icon) return <img src={checkValidAddress(icon) ? getTxEndpoint(icon) : icon} />;
		return (
			<>
				<ReactSVG src={ASSETS.icon} />
				<span>{language.uploadIcon}</span>
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
									<S.LInput
										hasIcon={icon !== null}
										onClick={() => logoInputRef.current.click()}
										disabled={unauthorized || loading}
									>
										{getLogoWrapper()}
									</S.LInput>
									<input
										ref={logoInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'icon')}
										disabled={unauthorized || loading}
										accept={ALLOWED_LOGO_TYPES}
									/>
								</S.FileInputWrapper>
								{/* <S.PActions>
									<Button
										type={'alt3'}
										label={language.removeIcon}
										handlePress={() => setIcon(null)}
										disabled={unauthorized || loading || !icon}
										height={32.5}
									/>
								</S.PActions> */}
							</S.PWrapper>
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
										type={'alt1'}
										label={language.save}
										handlePress={handleSubmit}
										disabled={unauthorized || loading || checkValidAddress(icon)}
										loading={false}
									/>
								</S.SAction>
							</S.SActions>
						</S.Body>
					</S.Wrapper>
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
