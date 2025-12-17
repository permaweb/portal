import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Media } from 'editor/components/molecules/Media';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import {
	FONT_OPTIONS,
	ICONS,
	LAYOUT,
	PAGES,
	PORTAL_DATA,
	PORTAL_PATCH_MAP,
	PORTAL_ROLES,
	THEME,
	URLS,
} from 'helpers/config';
import { THEME_DOCUMENTATION_PATCH } from 'helpers/config/themes';
import { PortalDetailType, PortalHeaderType, PortalPatchMapEnum } from 'helpers/types';
import { checkValidAddress, debugLog, getBootTag } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';

import * as S from './styles';

function deepMerge(target: any, patch: any): any {
	if (!target) return patch;
	const result = { ...target };
	for (const key of Object.keys(patch)) {
		if (
			patch[key] &&
			typeof patch[key] === 'object' &&
			!Array.isArray(patch[key]) &&
			target[key] &&
			typeof target[key] === 'object'
		) {
			result[key] = deepMerge(target[key], patch[key]);
		} else {
			result[key] = patch[key];
		}
	}
	return result;
}

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
	const [selectedLayout, setSelectedLayout] = React.useState<string>('journal');

	const [loading, setLoading] = React.useState<boolean>(false);

	const layoutOptions = [
		{ name: 'journal', icon: ICONS.layoutJournal },
		{ name: 'blog', icon: ICONS.layoutBlog },
		{ name: 'documentation', icon: ICONS.layoutDocumentation },
	];
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
		if (arProvider.wallet) {
			setLoading(true);

			try {
				let profileUpdateId: string | null;
				let response: string | null;

				let data: any = { Name: name };

				if (logoId && checkValidAddress(logoId)) {
					try {
						data.Banner = await permawebProvider.libs.resolveTransaction(logoId);
					} catch (e: any) {
						debugLog('error', 'PortalManager', `Failed to resolve logo: ${e.message}`);
					}
				} else {
					data.Banner = 'None';
				}

				if (iconId && checkValidAddress(iconId)) {
					try {
						data.Thumbnail = await permawebProvider.libs.resolveTransaction(iconId);
					} catch (e: any) {
						debugLog('error', 'PortalManager', `Failed to resolve icon: ${e.message}`);
					}
				} else {
					data.Thumbnail = 'None';
				}

				if (props.portal?.id && portalProvider.permissions?.updatePortalMeta && permawebProvider.profile?.id) {
					const portalsUpdateData = portalProvider.portals
						.filter((portal: PortalHeaderType) => portal.id !== props.portal.id)
						.map((portal: PortalHeaderType) => ({
							Id: portal.id,
							Name: portal.name,
							Banner: portal.banner ?? portal.logo,
							Thumbnail: portal.thumbnail ?? portal.icon,
						}));
					portalsUpdateData.push({ Id: props.portal.id, ...data });

					const portalUpdateId = await permawebProvider.libs.updateZone(data, props.portal.id, arProvider.wallet);

					debugLog('info', 'PortalManager', `Portal update: ${portalUpdateId}`);

					profileUpdateId = await permawebProvider.libs.updateZone(
						{ Portals: portalsUpdateData },
						permawebProvider.profile.id,
						arProvider.wallet
					);

					response = `${language?.portalUpdated}!`;

					portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Overview);
				} else {
					const getPatchMapTag = (key: string, values: string[]) => {
						const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
						return {
							name: `Zone-Patch-Map-${capitalizedKey}`,
							value: JSON.stringify(values),
						};
					};

					const tags = [
						getBootTag('Name', data.Name),
						{ name: 'Content-Type', value: 'text/html' },
						{ name: 'Zone-Type', value: 'Portal' },
					];

					for (const key of Object.keys(PORTAL_PATCH_MAP)) {
						tags.push(getPatchMapTag(key, PORTAL_PATCH_MAP[key]));
					}

					if (data.Banner) tags.push(getBootTag('Banner', data.Banner));
					if (data.Thumbnail) tags.push(getBootTag('Thumbnail', data.Thumbnail));

					/* Check if the user already has a profile to write the portal data in to, 
						Or else treat this portal as the user profile */
					let profileId = permawebProvider.profile?.id;
					if (!profileId) {
						debugLog('info', 'PortalManager', 'No profile found for wallet, creating portal as profile');

						tags.push({ name: 'Zone-Type', value: 'User' });

						tags.push(getBootTag('Username', data.Name));
						tags.push(getBootTag('DisplayName', data.Name));
						tags.push(getBootTag('Description', data.Name));
					}

					const portalId = await permawebProvider.libs.createZone(
						{
							tags: tags,
							data: PORTAL_DATA(),
							spawnModeration: false,
							authUsers: [arProvider.walletAddress],
						},
						(status: any) => debugLog('info', 'PortalManager', status)
					);

					debugLog('info', 'PortalManager', `Portal ID: ${portalId}`);

					/* Use this portal as the profile if one doesn't exist yet */
					if (!profileId) profileId = portalId;

					const rolesUpdate = await permawebProvider.libs.setZoneRoles(
						[
							{
								granteeId: arProvider.walletAddress,
								roles: [PORTAL_ROLES.ADMIN],
								type: 'wallet',
								sendInvite: false,
							},
							{
								granteeId: profileId,
								roles: [PORTAL_ROLES.ADMIN],
								type: 'process',
								sendInvite: false,
							},
						],
						portalId,
						arProvider.wallet
					);

					debugLog('info', 'PortalManager', `Roles update: ${rolesUpdate}`);

					const currentPortals = Array.isArray(permawebProvider.profile?.portals)
						? permawebProvider.profile.portals
						: [];

					const updatedPortals = [...currentPortals, { Id: portalId, ...data }];

					profileUpdateId = await permawebProvider.libs.updateZone(
						{ Portals: permawebProvider.libs.mapToProcessCase(updatedPortals) },
						profileId,
						arProvider.wallet
					);

					const getLayoutAndPages = () => {
						if (selectedLayout === 'blog') {
							return { layout: LAYOUT.BLOG, pages: PAGES.BLOG };
						} else if (selectedLayout === 'documentation') {
							return { layout: LAYOUT.DOCUMENTATION, pages: PAGES.DOCUMENTATION };
						}
						return { layout: LAYOUT.JOURNAL, pages: PAGES.JOURNAL };
					};

					const { layout: chosenLayout, pages: chosenPages } = getLayoutAndPages();

					const chosenTheme =
						selectedLayout === 'documentation' ? deepMerge(THEME.DEFAULT, THEME_DOCUMENTATION_PATCH) : THEME.DEFAULT;

					const defaultFonts = {
						headers: FONT_OPTIONS.headers[0],
						body: FONT_OPTIONS.body[0],
					};

					const portalUpdateId = await permawebProvider.libs.updateZone(
						{
							Themes: [permawebProvider.libs.mapToProcessCase(chosenTheme)],
							Layout: permawebProvider.libs.mapToProcessCase(chosenLayout),
							Pages: permawebProvider.libs.mapToProcessCase(chosenPages),
							Fonts: permawebProvider.libs.mapToProcessCase(defaultFonts),
						},
						portalId,
						arProvider.wallet
					);

					debugLog('info', 'PortalManager', `Portal update: ${portalUpdateId}`);

					response = `${language?.portalCreated}!`;

					navigate(URLS.portalBase(portalId));
					window.location.reload();
				}

				if (profileUpdateId) debugLog('info', 'PortalManager', `Profile update: ${profileUpdateId}`);

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
							{props.portal ? (
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
							) : (
								<>
									<S.SectionWrapper>
										<S.SectionLabel>{language?.logo || 'Logo'}</S.SectionLabel>
										<S.LogoWrapper>
											<Media portal={null} type={'logo'} onMediaUpload={handleLogoUpload} hideActions />
										</S.LogoWrapper>
									</S.SectionWrapper>
									<S.SectionWrapper>
										<S.SectionLabel>{language?.layout || 'Layout'}</S.SectionLabel>
										<S.LayoutOptions>
											{layoutOptions.map((option) => {
												const active = option.name === selectedLayout;
												return (
													<S.LayoutOption
														key={option.name}
														$active={active}
														onClick={() => setSelectedLayout(option.name)}
													>
														<S.LayoutOptionIcon $active={active}>
															<img src={option.icon} alt={option.name} />
														</S.LayoutOptionIcon>
														<S.LayoutOptionLabel>{option.name}</S.LayoutOptionLabel>
													</S.LayoutOption>
												);
											})}
										</S.LayoutOptions>
									</S.SectionWrapper>
								</>
							)}
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
