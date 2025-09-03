import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Media } from 'editor/components/molecules/Media';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { DEFAULT_THEME, DEFAULT_LAYOUT, DEFAULT_PAGES, PORTAL_DATA, PORTAL_ROLES, URLS } from 'helpers/config';
import { PortalDetailType, PortalHeaderType } from 'helpers/types';
import { checkValidAddress, getBootTag } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';

export default function PortalManager(props: {
	portal: PortalDetailType | null;
	handleClose: () => void;
	handleUpdate: () => void;
}) {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [name, setName] = React.useState<string>('');
	const [logoId, setLogoId] = React.useState<string | null>(null);
	const [iconId, setIconId] = React.useState<string | null>(null);

	const [loading, setLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();

	React.useEffect(() => {
		if (props.portal) {
			setName(props.portal.name ?? '');
			setLogoId(props.portal.logo || null);
			setIconId(props.portal.icon || null);
		} else {
			setName('');
			setLogoId(null);
			setIconId(null);
		}
	}, [props.portal]);

	async function handleSubmit() {
		if (arProvider.wallet && permawebProvider.profile?.id) {
			setLoading(true);

			try {
				let profileUpdateId: string | null;
				let response: string | null;

				let data: any = {
					Name: name,
				};

				if (logoId && checkValidAddress(logoId)) {
					try {
						data.Logo = await permawebProvider.libs.resolveTransaction(logoId);
					} catch (e: any) {
						console.error(`Failed to resolve logo: ${e.message}`);
					}
				} else {
					data.Logo = 'None';
				}

				if (iconId && checkValidAddress(iconId)) {
					try {
						data.Icon = await permawebProvider.libs.resolveTransaction(iconId);
					} catch (e: any) {
						console.error(`Failed to resolve icon: ${e.message}`);
					}
				} else {
					data.Icon = 'None';
				}

				if (props.portal && props.portal.id) {
					const portalsUpdateData = portalProvider.portals
						.filter((portal: PortalHeaderType) => portal.id !== props.portal.id)
						.map((portal: PortalHeaderType) => ({
							Id: portal.id,
							Name: portal.name,
							Logo: portal.logo,
							Icon: portal.icon,
						}));
					portalsUpdateData.push({ Id: props.portal.id, ...data });

					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					console.log(`Portal update: ${portalUpdateId}`);

					profileUpdateId = await permawebProvider.libs.updateZone(
						{ Portals: portalsUpdateData },
						permawebProvider.profile.id,
						arProvider.wallet
					);

					response = `${language?.portalUpdated}!`;

					portalProvider.refreshCurrentPortal();
				} else {
					const tags = [
						getBootTag('Name', data.Name),
						{ name: 'Content-Type', value: 'text/html' },
						{ name: 'Data-Protocol', value: 'Permaweb-Zone' },
						{ name: 'Zone-Type', value: 'Portal' },
					];

					if (data.Logo) tags.push(getBootTag('Logo', data.Logo));
					if (data.Icon) tags.push(getBootTag('Icon', data.Icon));

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

					const currentPortals = Array.isArray(permawebProvider.profile?.portals)
						? permawebProvider.profile.portals
						: [];

					const updatedPortals = [...currentPortals, { Id: portalId, ...data }];

					profileUpdateId = await permawebProvider.libs.updateZone(
						{ Portals: permawebProvider.libs.mapToProcessCase(updatedPortals) },
						permawebProvider.profile.id,
						arProvider.wallet
					);

					const themeUpdateId = await permawebProvider.libs.updateZone(
						{
							Themes: [
								permawebProvider.libs.mapToProcessCase(DEFAULT_THEME)
							],
						},
						portalId,
						arProvider.wallet
					);

					console.log(`Theme update: ${themeUpdateId}`);

					const layoutUpdateId = await permawebProvider.libs.updateZone(
						{
							Layout: permawebProvider.libs.mapToProcessCase(DEFAULT_LAYOUT),
						},
						portalId,
						arProvider.wallet
					);

					console.log(`Layout update: ${layoutUpdateId}`);

					const pagesUpdateId = await permawebProvider.libs.updateZone(
						{
							Pages: permawebProvider.libs.mapToProcessCase(DEFAULT_PAGES),
						},
						portalId,
						arProvider.wallet
					);

					console.log(`Pages update: ${pagesUpdateId}`);

					response = `${language?.portalCreated}!`;

					navigate(URLS.portalBase(portalId));
				}

				if (profileUpdateId) console.log(`Profile update: ${profileUpdateId}`);

				permawebProvider.refreshProfile();

				if (props.handleUpdate) props.handleUpdate();
				if (props.handleClose) props.handleClose();

				setName('');
				setLogoId(null);
				setIconId(null);

				addNotification(response, 'success');
			} catch (e: any) {
				addNotification(e.message ?? language?.errorUpdatingPortal, 'warning');
			}

			setLoading(false);
		}
	}

	function handleMediaUpdate() {
		// For existing portals, refresh the logo and icon from the portal data
		if (props.portal) {
			if (props.portal.logo) {
				setLogoId(props.portal.logo);
			}
			if (props.portal.icon) {
				setIconId(props.portal.icon);
			}
		}
	}

	function handleLogoUpload(mediaId: string) {
		setLogoId(mediaId);
	}

	function handleIconUpload(mediaId: string) {
		setIconId(mediaId);
	}

	function getConnectedView() {
		if (!arProvider.walletAddress) return <WalletBlock />;
		else {
			return (
				<>
					<S.Wrapper>
						<S.Body>
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
								</S.TForm>
							</S.Form>
							<S.PWrapper>
								<Media
									portal={props.portal}
									type={'logo'}
									handleUpdate={handleMediaUpdate}
									onMediaUpload={handleLogoUpload}
									hideActions={!props.portal}
								/>
								<S.IconWrapper className={'border-wrapper-alt2'}>
									<Media
										portal={props.portal}
										type={'icon'}
										handleUpdate={handleMediaUpdate}
										onMediaUpload={handleIconUpload}
										hideActions={!props.portal}
									/>
								</S.IconWrapper>
							</S.PWrapper>
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
									? `${language?.portalUpdatingInfo}...`
									: `${language?.portalCreatingInfo}...`
							}
						/>
					)}
				</>
			);
		}
	}

	return getConnectedView();
}
