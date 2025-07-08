import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Notification } from 'components/atoms/Notification';
import { ASSETS, DEFAULT_THEME, PORTAL_DATA, PORTAL_ROLES, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType, PortalHeaderType } from 'helpers/types';
import { checkValidAddress, getBootTag } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';
import { IProps } from './types';

const ALLOWED_LOGO_TYPES = 'image/png, image/jpeg, image/gif';

export default function PortalManager(props: IProps) {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const logoInputRef = React.useRef<any>(null);

	const [name, setName] = React.useState<string>('');
	const [logo, setLogo] = React.useState<any>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const [portalResponse, setPortalResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (props.portal) {
			setName(props.portal.name ?? '');
			setLogo(props.portal.logo && checkValidAddress(props.portal.logo) ? props.portal.logo : null);
		} else {
			setName('');
			setLogo(null);
		}
	}, [props.portal]);

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile && permawebProvider.profile.id) {
			setLoading(true);

			try {
				let profileUpdateId: string | null;
				let response: string | null;

				let data: any = {
					Name: name,
				};

				if (logo) {
					try {
						data.Logo = await permawebProvider.libs.resolveTransaction(logo);
					} catch (e: any) {
						console.error(`Failed to resolve logo: ${e.message}`);
					}
				}

				if (props.portal && props.portal.id) {
					const portalsUpdateData = portalProvider.portals
						.filter((portal: PortalHeaderType) => portal.id !== props.portal.id)
						.map((portal: PortalHeaderType) => ({ Id: portal.id, Name: portal.name, Logo: portal.logo }));
					portalsUpdateData.push({ Id: props.portal.id, ...data });

					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					console.log(`Portal update: ${portalUpdateId}`);

					profileUpdateId = await permawebProvider.libs.updateZone(
						{ Portals: portalsUpdateData },
						permawebProvider.profile.id,
						arProvider.wallet
					);

					response = `${language.portalUpdated}!`;

					portalProvider.refreshCurrentPortal();
				} else {
					const tags = [getBootTag('Name', data.Name), { name: 'Content-Type', value: 'text/html' }];
					if (data.Logo) tags.push(getBootTag('Logo', data.Logo));

					const portalId = await permawebProvider.libs.createZone(
						{
							data: PORTAL_DATA(),
							tags: tags,
						},
						(status: any) => console.log(status)
					);

					console.log(`Portal ID: ${portalId}`);

					const rolesUpdate = await permawebProvider.libs.setZoneRoles(
						[
							{ granteeId: arProvider.walletAddress, roles: [PORTAL_ROLES.ADMIN], type: 'wallet', sendInvite: false },
							{
								granteeId: permawebProvider.profile.id,
								roles: [PORTAL_ROLES.ADMIN],
								type: 'process',
								sendInvite: false,
							},
						],
						portalId,
						arProvider.wallet
					);

					console.log(`Roles update: ${rolesUpdate}`);

					profileUpdateId = await permawebProvider.libs.addToZone(
						{ path: 'Portals', data: { Id: portalId, ...data } },
						permawebProvider.profile.id,
						arProvider.wallet
					);

					const themeUpdateId = await permawebProvider.libs.updateZone(
						{
							Themes: [
								permawebProvider.libs.mapToProcessCase(DEFAULT_THEME.light),
								permawebProvider.libs.mapToProcessCase(DEFAULT_THEME.dark),
							],
						},
						portalId,
						arProvider.wallet
					);

					console.log(`Theme update: ${themeUpdateId}`);

					response = `${language.portalCreated}!`;

					navigate(URLS.portalBase(portalId));
				}

				if (profileUpdateId) console.log(`Profile update: ${profileUpdateId}`);

				permawebProvider.refreshProfile();

				if (props.handleUpdate) props.handleUpdate();
				if (props.handleClose) props.handleClose();

				setName('');
				setLogo(null);

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

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'logo') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						switch (type) {
							case 'logo':
								setLogo(event.target.result);
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
		if (logo) return <img src={checkValidAddress(logo) ? getTxEndpoint(logo) : logo} />;
		return (
			<>
				<ReactSVG src={ASSETS.image} />
				<span>{language.uploadLogo}</span>
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
									<S.LInput hasLogo={logo !== null} onClick={() => logoInputRef.current.click()} disabled={loading}>
										{getLogoWrapper()}
									</S.LInput>
									<input
										ref={logoInputRef}
										type={'file'}
										onChange={(e: any) => handleFileChange(e, 'logo')}
										disabled={loading}
										accept={ALLOWED_LOGO_TYPES}
									/>
								</S.FileInputWrapper>
								<S.PActions>
									<Button
										type={'primary'}
										label={language.removeLogo}
										handlePress={() => setLogo(null)}
										disabled={loading || !logo}
										height={32.5}
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
								</S.TForm>
							</S.Form>
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
									disabled={!name || loading}
									loading={false}
								/>
							</S.SAction>
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
