import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ViewHeader } from 'editor/components/atoms/ViewHeader';
import { Fonts } from 'editor/components/molecules/Fonts';
import { Layout } from 'editor/components/molecules/Layout';
import { Media } from 'editor/components/molecules/Media';
import { Themes } from 'editor/components/molecules/Themes';
import { PortalSetup } from 'editor/components/organisms/PortalSetup';
import { PostList } from 'editor/components/organisms/PostList';
import { WordPressImport, type WordPressImportDraft } from 'editor/components/organisms/WordPressImport';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Select } from 'components/atoms/Select';
import { Tabs } from 'components/atoms/Tabs';
import { LanguageSelect } from 'components/molecules/LanguageSelect';
import { ICONS, LAYOUT, PAGES, PORTAL_DATA, PORTAL_PATCH_MAP, PORTAL_ROLES, THEME, URLS } from 'helpers/config';
import { THEME_DOCUMENTATION_PATCH } from 'helpers/config/themes';
import type { PortalHeaderType, SelectOptionType } from 'helpers/types';
import { PortalPatchMapEnum } from 'helpers/types';
import { checkValidAddress, debugLog, getBootTag } from 'helpers/utils';
import type { PortalImportData } from 'helpers/wordpress';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { WalletBlock } from 'wallet/WalletBlock';
import { WalletConnect } from 'wallet/WalletConnect';

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

function ImagesView() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	return (
		<S.ViewWrapper>
			<S.FlexWrapper>
				<S.FlexSection flex={1.5}>
					<S.MediaTitleWrapper>
						<S.MediaTitle>{language?.logo}</S.MediaTitle>
					</S.MediaTitleWrapper>
					<S.MediaEntryLogo>
						<Media portal={portalProvider.current} type={'logo'} hideActions />
						<S.MediaInfo>{language?.recommended}: 500x280px (16:9)</S.MediaInfo>
					</S.MediaEntryLogo>
				</S.FlexSection>
				<S.FlexSection flex={0.25}>
					<S.IconTitleWrapper>
						<S.MediaTitle>{language?.icon} (Favicon)</S.MediaTitle>
					</S.IconTitleWrapper>
					<S.MediaEntryIcon>
						<Media portal={portalProvider.current} type={'icon'} hideActions />
						<S.MediaInfo>{language?.recommended}: 32x32px (1:1)</S.MediaInfo>
					</S.MediaEntryIcon>
				</S.FlexSection>
			</S.FlexWrapper>
			<S.FlexWrapper>
				<S.FlexSection flex={1}>
					<S.MediaTitleWrapper>
						<S.MediaTitle>{language?.wallpaper}</S.MediaTitle>
					</S.MediaTitleWrapper>
					<S.MediaEntryWallpaper>
						<Media portal={portalProvider.current} type={'wallpaper'} hideActions />
						<S.MediaInfo>{language?.recommended}: 1920x1080px (16:9)</S.MediaInfo>
					</S.MediaEntryWallpaper>
				</S.FlexSection>
			</S.FlexWrapper>
		</S.ViewWrapper>
	);
}

export default function CreatePortal() {
	const { portalId } = useParams();
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [name, setName] = React.useState<string>('');
	const [nameSaving, setNameSaving] = React.useState<boolean>(false);
	const [creating, setCreating] = React.useState<boolean>(false);
	const [logoId, setLogoId] = React.useState<string | null>(null);
	const [iconId, setIconId] = React.useState<string | null>(null);
	const [wallpaperId, setWallpaperId] = React.useState<string | null>(null);
	const [selectedLayout, setSelectedLayout] = React.useState<string>('journal');
	const [importDraft, setImportDraft] = React.useState<WordPressImportDraft | null>(null);

	const importOptions: SelectOptionType[] = [
		{ id: 'none', label: language?.none || 'None' },
		{ id: 'wordpress', label: 'WordPress' },
	];
	const [importOption, setImportOption] = React.useState<SelectOptionType>(importOptions[0]);
	const defaultValidation = React.useMemo(() => ({ status: false, message: null }), []);

	const portalReady = Boolean(portalProvider.current?.id && portalProvider.current?.id === portalId);
	const creatingNew = !portalId;
	const canUpdateMeta = portalProvider.permissions?.updatePortalMeta;
	const hasImportDraft = Boolean(importDraft);

	const handleImportDraftChange = React.useCallback((draft: WordPressImportDraft | null) => {
		setImportDraft(draft);
	}, []);

	const handleWordPressPortalNameChange = React.useCallback((value: string) => {
		setName(value);
	}, []);

	React.useEffect(() => {
		if (portalProvider.current?.name) {
			setName(portalProvider.current.name);
		}
	}, [portalProvider.current?.id, portalProvider.current?.name]);

	React.useEffect(() => {
		if (importOption.id !== 'wordpress') {
			setImportDraft(null);
		}
	}, [importOption.id]);

	const layoutOptions = [
		{ name: 'journal', icon: ICONS.layoutJournal },
		{ name: 'blog', icon: ICONS.layoutBlog },
		{ name: 'documentation', icon: ICONS.layoutDocumentation },
	];

	const handleCreatePortal = async () => {
		if (!arProvider.wallet || !arProvider.walletAddress) {
			addNotification(language?.connectToContinue || 'Connect your wallet to continue', 'warning');
			return;
		}
		if (!name) {
			addNotification('Name is required', 'warning');
			return;
		}

		setCreating(true);
		try {
			let data: any = { Name: name };

			if (logoId && checkValidAddress(logoId)) {
				try {
					data.Banner = await permawebProvider.libs.resolveTransaction(logoId);
				} catch (e: any) {
					debugLog('error', 'CreatePortal', `Failed to resolve logo: ${e.message}`);
				}
			} else {
				data.Banner = 'None';
			}

			if (iconId && checkValidAddress(iconId)) {
				try {
					data.Thumbnail = await permawebProvider.libs.resolveTransaction(iconId);
				} catch (e: any) {
					debugLog('error', 'CreatePortal', `Failed to resolve icon: ${e.message}`);
				}
			} else {
				data.Thumbnail = 'None';
			}

			if (wallpaperId && checkValidAddress(wallpaperId)) {
				try {
					data.Wallpaper = await permawebProvider.libs.resolveTransaction(wallpaperId);
				} catch (e: any) {
					debugLog('error', 'CreatePortal', `Failed to resolve wallpaper: ${e.message}`);
				}
			} else {
				data.Wallpaper = 'None';
			}

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
			if (data.Wallpaper) tags.push(getBootTag('Wallpaper', data.Wallpaper));

			let profileId = permawebProvider.profile?.id;
			if (!profileId) {
				debugLog('info', 'CreatePortal', 'No profile found for wallet, creating portal as profile');
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
				(status: any) => debugLog('info', 'CreatePortal', status)
			);

			debugLog('info', 'CreatePortal', `Portal ID: ${portalId}`);

			if (!profileId) profileId = portalId;

			const rolesUpdate = await permawebProvider.libs.setZoneRoles(
				[
					{
						granteeId: arProvider.walletAddress,
						roles: [PORTAL_ROLES.ADMIN],
						type: 'wallet',
						sendInvite: false,
						remoteZonePath: 'Portals',
					},
					{
						granteeId: profileId,
						roles: [PORTAL_ROLES.ADMIN],
						type: 'process',
						sendInvite: false,
						remoteZonePath: 'Portals',
					},
				],
				portalId,
				arProvider.wallet
			);

			debugLog('info', 'CreatePortal', `Roles update: ${rolesUpdate}`);

			const currentPortals = Array.isArray(permawebProvider.profile?.portals) ? permawebProvider.profile.portals : [];

			const updatedPortals = [...currentPortals, { Id: portalId, ...data }];

			const profileUpdateId = await permawebProvider.libs.updateZone(
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

			const portalUpdateId = await permawebProvider.libs.updateZone(
				{
					Themes: [permawebProvider.libs.mapToProcessCase(chosenTheme)],
					Layout: permawebProvider.libs.mapToProcessCase(chosenLayout),
					Pages: permawebProvider.libs.mapToProcessCase(chosenPages),
				},
				portalId,
				arProvider.wallet
			);

			debugLog('info', 'CreatePortal', `Portal update: ${portalUpdateId}`);

			if (profileUpdateId && profileId) {
				await permawebProvider.deps.ao.result({
					process: profileId,
					message: profileUpdateId,
				});
			}

			permawebProvider.refreshProfile();

			addNotification(`${language?.portalCreated || 'Portal created'}!`, 'success');
			navigate(URLS.portalBase(portalId));
			window.location.reload();
		} catch (e: any) {
			addNotification(e.message ?? language?.errorUpdatingPortal, 'warning');
		}
		setCreating(false);
	};

	const handleCreateFromDraft = async () => {
		if (!importDraft) return;
		if (!arProvider.wallet || !arProvider.walletAddress) {
			addNotification(language?.connectToContinue || 'Connect your wallet to continue', 'warning');
			return;
		}

		const effectiveName = name || importDraft.data?.name || '';
		if (!effectiveName) {
			addNotification('Name is required', 'warning');
			return;
		}

		setCreating(true);
		try {
			const dataToUse: PortalImportData = {
				...importDraft.data,
				name: effectiveName,
			};

			await portalProvider.importWordPress(
				dataToUse,
				importDraft.posts,
				importDraft.pages,
				importDraft.selectedCategories,
				importDraft.createCategories,
				importDraft.createTopics,
				importDraft.selectedTopics,
				true,
				importDraft.uploadedImageUrls,
				undefined,
				false,
				{
					logoId,
					iconId,
					wallpaperId,
				}
			);
		} catch (e: any) {
			addNotification(e.message ?? language?.errorUpdatingPortal, 'warning');
		}
		setCreating(false);
	};

	const handleNameSave = async () => {
		if (!portalProvider.current?.id || !arProvider.wallet || !permawebProvider.profile?.id) return;
		if (!portalProvider.permissions?.updatePortalMeta) return;

		setNameSaving(true);
		try {
			const data: any = { Name: name };

			const portals = Array.isArray(portalProvider.portals) ? portalProvider.portals : [];
			const portalsUpdateData = portals
				.filter((portal: PortalHeaderType) => portal.id !== portalProvider.current?.id)
				.map((portal: PortalHeaderType) => ({
					Id: portal.id,
					Name: portal.name,
					Banner: portal.banner ?? portal.logo,
					Thumbnail: portal.thumbnail ?? portal.icon,
				}));

			portalsUpdateData.push({ Id: portalProvider.current.id, ...data });

			const portalUpdateId = await permawebProvider.libs.updateZone(data, portalProvider.current.id, arProvider.wallet);

			debugLog('info', 'CreatePortal', `Portal update: ${portalUpdateId}`);

			const profileUpdateId = await permawebProvider.libs.updateZone(
				{ Portals: portalsUpdateData },
				permawebProvider.profile.id,
				arProvider.wallet
			);

			debugLog('info', 'CreatePortal', `Profile update: ${profileUpdateId}`);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Overview);
			addNotification(`${language?.portalUpdated || 'Portal updated'}!`, 'success');
		} catch (e: any) {
			addNotification(e.message ?? language?.errorUpdatingPortal, 'warning');
		}
		setNameSaving(false);
	};

	if (creatingNew) {
		return (
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.HeaderContent>
						<S.HeaderActionsWrapper>
							<S.HeaderAction>
								<Link to={URLS.docs}>{language?.helpCenter}</Link>
							</S.HeaderAction>
						</S.HeaderActionsWrapper>
						<S.HeaderActionsWrapper>
							<LanguageSelect />
							<WalletConnect app={'editor'} />
						</S.HeaderActionsWrapper>
					</S.HeaderContent>
				</S.HeaderWrapper>
				<S.ContentWrapper>
					<ViewHeader
						header={language?.createPortal || 'Create Portal'}
						actions={[
							<Button
								key={'return-home'}
								type={'alt1'}
								label={language?.returnHome || 'Return Home'}
								handlePress={() => navigate(URLS.base)}
							/>,
						]}
					/>
					<S.Body>
						<S.Column>
							<S.Section>
								<S.SectionHeader>
									<S.SectionTitle>{language?.importFromWordPress || 'Import from WordPress'}</S.SectionTitle>
								</S.SectionHeader>
								<S.SectionBody>
									<S.PanelInner>
										<WordPressImport
											open
											inline
											handleClose={() => setImportDraft(null)}
											createPortal
											closeOnComplete={false}
											showImportingStage={false}
											portalName={name}
											hidePreviewSubmit
											onPortalNameChange={handleWordPressPortalNameChange}
											onDraftChange={handleImportDraftChange}
											importingMessage={'Preparing import data...'}
										/>
									</S.PanelInner>
								</S.SectionBody>
							</S.Section>
						</S.Column>
						<S.Column>
							<S.Section>
								<S.SectionHeader>
									<S.SectionTitle>{'Portal Details'}</S.SectionTitle>
								</S.SectionHeader>
								<S.SectionBody>
									{!arProvider.walletAddress ? (
										<WalletBlock />
									) : (
										<S.PanelInner>
											<FormField
												label={language?.name || 'Name'}
												value={name}
												onChange={(e: any) => setName(e.target.value)}
												disabled={creating}
												invalid={defaultValidation}
												required
												hideErrorMessage
											/>
											<S.MediaRow>
												<S.MediaBlock>
													<S.MediaTitle>{language?.logo || 'Logo'}</S.MediaTitle>
													<Media portal={null} type={'logo'} onMediaUpload={setLogoId} hideActions />
													<S.MediaInfo>{`${language?.recommended || 'Recommended'}: 500x280px (16:9)`}</S.MediaInfo>
												</S.MediaBlock>
												<S.IconMediaBlock>
													<S.MediaTitle>{`${language?.icon || 'Icon'} (Favicon)`}</S.MediaTitle>
													<Media portal={null} type={'icon'} onMediaUpload={setIconId} hideActions />
													<S.MediaInfo>{`${language?.recommended || 'Recommended'}: 32x32px (1:1)`}</S.MediaInfo>
												</S.IconMediaBlock>
											</S.MediaRow>
											<S.MediaBlock>
												<S.MediaTitle>{language?.wallpaper || 'Wallpaper'}</S.MediaTitle>
												<Media portal={null} type={'wallpaper'} onMediaUpload={setWallpaperId} hideActions />
												<S.MediaInfo>{`${language?.recommended || 'Recommended'}: 1920x1080px (16:9)`}</S.MediaInfo>
											</S.MediaBlock>
											<div>
												<S.MediaTitle>{language?.layout || 'Layout'}</S.MediaTitle>
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
											</div>
											<S.Actions>
												<Button
													type={'primary'}
													label={hasImportDraft ? `Create & Import` : language?.create || 'Create'}
													handlePress={hasImportDraft ? handleCreateFromDraft : handleCreatePortal}
													disabled={(!name && !importDraft?.data?.name) || creating}
													loading={creating}
												/>
											</S.Actions>
										</S.PanelInner>
									)}
								</S.SectionBody>
							</S.Section>
						</S.Column>
					</S.Body>
				</S.ContentWrapper>
			</S.Wrapper>
		);
	}

	if (!portalReady) {
		return (
			<S.Wrapper>
				<S.HeaderWrapper>
					<S.HeaderContent>
						<S.HeaderActionsWrapper>
							<S.HeaderAction>
								<Link to={URLS.docs}>{language?.helpCenter}</Link>
							</S.HeaderAction>
						</S.HeaderActionsWrapper>
						<S.HeaderActionsWrapper>
							<LanguageSelect />
							<WalletConnect app={'editor'} />
						</S.HeaderActionsWrapper>
					</S.HeaderContent>
				</S.HeaderWrapper>
				<S.ContentWrapper>
					<ViewHeader
						header={language?.createPortal || 'Create Portal'}
						actions={[
							<Button
								key={'return-home'}
								type={'alt1'}
								label={language?.returnHome || 'Return Home'}
								handlePress={() => navigate(URLS.base)}
							/>,
						]}
					/>
					<Loader message={`${language?.loadingPortal || 'Loading portal'}...`} />
				</S.ContentWrapper>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<S.HeaderContent>
					<S.HeaderActionsWrapper>
						<S.HeaderAction>
							<Link to={URLS.docs}>{language?.helpCenter}</Link>
						</S.HeaderAction>
					</S.HeaderActionsWrapper>
					<S.HeaderActionsWrapper>
						<LanguageSelect />
						<WalletConnect app={'editor'} />
					</S.HeaderActionsWrapper>
				</S.HeaderContent>
			</S.HeaderWrapper>
			<S.ContentWrapper>
				<ViewHeader
					header={language?.createPortal || 'Create Portal'}
					actions={[
						<Button
							key={'return-home'}
							type={'alt1'}
							label={language?.returnHome || 'Return Home'}
							handlePress={() => navigate(URLS.base)}
						/>,
					]}
				/>
				<S.Body>
					<S.Column>
						<S.Section>
							<S.SectionHeader>
								<S.SectionTitle>{language?.importFromWordPress || 'Import from WordPress'}</S.SectionTitle>
							</S.SectionHeader>
							<S.SectionBody>
								<S.ImportRow>
									<Select
										label={'Import Option'}
										activeOption={importOption}
										setActiveOption={(option: SelectOptionType) => setImportOption(option)}
										options={importOptions}
										disabled={!portalProvider.current?.id}
									/>
								</S.ImportRow>
								{importOption.id === 'wordpress' && portalProvider.current?.id ? (
									<WordPressImport
										open
										inline
										closeOnComplete={false}
										title={language?.importFromWordPress || 'Import from WordPress'}
										handleClose={() => setImportOption(importOptions[0])}
										createPortal={false}
										onImportComplete={(
											data,
											posts,
											pages,
											selectedCategories,
											createCategories,
											createTopics,
											selectedTopics,
											uploadedImageUrls
										) =>
											portalProvider.importWordPress(
												data,
												posts,
												pages,
												selectedCategories,
												createCategories,
												createTopics,
												selectedTopics,
												false,
												uploadedImageUrls,
												URLS.portalCreate(portalProvider.current?.id)
											)
										}
									/>
								) : (
									<S.DisabledNote>
										<p>{'Select WordPress to enable import.'}</p>
									</S.DisabledNote>
								)}
							</S.SectionBody>
						</S.Section>

						<S.Section>
							<S.SectionHeader>
								<S.SectionTitle>{language?.name || 'Name'}</S.SectionTitle>
							</S.SectionHeader>
							<S.SectionBody>
								<S.FormRow>
									<FormField
										label={language?.name || 'Name'}
										value={name}
										onChange={(e: any) => setName(e.target.value)}
										disabled={nameSaving || !canUpdateMeta}
										invalid={defaultValidation}
										required
										hideErrorMessage
									/>
									<Button
										type={'alt1'}
										label={language?.save || 'Save'}
										handlePress={handleNameSave}
										disabled={!name || nameSaving || !canUpdateMeta}
										loading={nameSaving}
									/>
								</S.FormRow>
							</S.SectionBody>
						</S.Section>

						<S.Section>
							<S.SectionHeader>
								<S.SectionTitle>{language?.setup || 'Portal Setup'}</S.SectionTitle>
							</S.SectionHeader>
							<S.SectionBody>
								<PortalSetup type={'detail'} />
							</S.SectionBody>
						</S.Section>

						<S.Section>
							<S.SectionHeader>
								<S.SectionTitle>{language?.posts || 'Posts'}</S.SectionTitle>
							</S.SectionHeader>
							<S.SectionBody>
								{importOption.id !== 'wordpress' ? (
									<S.DisabledNote>
										<p>{'Enable WordPress import to populate posts.'}</p>
									</S.DisabledNote>
								) : (
									<PostList type={'detail'} pageCount={5} />
								)}
							</S.SectionBody>
						</S.Section>
					</S.Column>
					<S.Column>
						<S.Section>
							<S.SectionHeader>
								<S.SectionTitle>{language?.design || 'Design'}</S.SectionTitle>
							</S.SectionHeader>
							<S.SectionBody>
								<Tabs type={'alt1'} onTabPropClick={() => null}>
									<div label={language?.themes || 'Themes'}>
										<S.ViewWrapper>
											<Themes />
										</S.ViewWrapper>
									</div>
									<div label={language?.layout || 'Layout'}>
										<S.ViewWrapper>
											<Layout />
										</S.ViewWrapper>
									</div>
									<div label={language?.fonts || 'Fonts'}>
										<S.ViewWrapper>
											<Fonts />
										</S.ViewWrapper>
									</div>
									<div label={language?.images || 'Images'}>
										<ImagesView />
									</div>
								</Tabs>
							</S.SectionBody>
						</S.Section>
					</S.Column>
				</S.Body>
			</S.ContentWrapper>
		</S.Wrapper>
	);
}
