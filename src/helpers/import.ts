import {
	ASSET_UPLOAD,
	FONT_OPTIONS,
	LAYOUT,
	PAGES,
	PORTAL_DATA,
	PORTAL_PATCH_MAP,
	PORTAL_POST_DATA,
	PORTAL_ROLES,
	THEME,
	URLS,
} from 'helpers/config';
import { PortalDetailType, PortalPatchMapEnum, PortalPermissionsType } from 'helpers/types';
import { checkValidAddress, debugLog, urlify } from 'helpers/utils';
import { ConvertedPost, PortalImportData } from 'helpers/wordpress';
import { replaceFeaturedImage, replaceImageUrlsInContent } from 'helpers/wordpressImageUpload';

export interface ImportDeps {
	wallet: any;
	walletAddress: string;
	libs: any;
	profile: any;
	refreshProfile: () => void;
	current: PortalDetailType | null;
	permissions: PortalPermissionsType | null;
	refreshCurrentPortal: (field?: PortalPatchMapEnum | PortalPatchMapEnum[]) => void;
	loadPortal: (portalId: string) => Promise<PortalDetailType | void>;
	addNotification: (message: string, type: string, opts?: any) => void;
	navigate: (path: string) => void;
}

export interface ImportParams {
	data: PortalImportData;
	posts: ConvertedPost[];
	pages: ConvertedPost[];
	selectedCategories: Set<string>;
	createCategories: boolean;
	createTopics: boolean;
	selectedTopics?: Set<string>;
	createPortal?: boolean;
	uploadedImageUrls?: Map<string, string>;
	redirectPath?: string;
	redirectToCreate?: boolean;
	mediaOverrides?: {
		logoId?: string | null;
		iconId?: string | null;
		wallpaperId?: string | null;
	};
}

export async function executeWordPressImport(deps: ImportDeps, params: ImportParams): Promise<void> {
	const {
		wallet,
		walletAddress,
		libs,
		profile,
		refreshProfile,
		current,
		permissions,
		refreshCurrentPortal,
		loadPortal,
		addNotification,
		navigate,
	} = deps;

	const {
		data,
		posts,
		pages,
		selectedCategories,
		createCategories,
		createTopics,
		selectedTopics,
		createPortal,
		uploadedImageUrls,
		redirectPath,
		redirectToCreate,
		mediaOverrides,
	} = params;

	if (!wallet) {
		addNotification('Please connect your wallet to import content', 'warning');
		return;
	}

	let profileId = profile?.id;
	if (createPortal && !profileId && !walletAddress) {
		addNotification('Please connect your wallet to create a portal', 'warning');
		return;
	}

	if (!createPortal && !current?.id) {
		addNotification('Please select or create a portal first', 'warning');
		return;
	}

	let targetPortalId = current?.id;

	try {
		addNotification(createPortal ? 'Creating portal from WordPress...' : 'Starting WordPress import...', 'success');

		if (createPortal) {
			const getBootTag = (key: string, value: string) => ({
				name: `Zone-${key}`,
				value,
			});

			const getPatchMapTag = (key: string, values: string[]) => {
				const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
				return {
					name: `Zone-Patch-Map-${capitalizedKey}`,
					value: JSON.stringify(values),
				};
			};

			const tags = [
				getBootTag('Name', data.name || 'Imported Portal'),
				{ name: 'Content-Type', value: 'text/html' },
				{ name: 'Zone-Type', value: 'Portal' },
			];

			for (const key of Object.keys(PORTAL_PATCH_MAP)) {
				tags.push(getPatchMapTag(key, PORTAL_PATCH_MAP[key]));
			}

			const resolveMediaOverride = async (id?: string | null) => {
				if (!id || !checkValidAddress(id)) return null;
				try {
					return await libs.resolveTransaction(id);
				} catch (e: any) {
					debugLog('error', 'WordPressImport', `Failed to resolve media override: ${e.message}`);
					return null;
				}
			};

			const banner = await resolveMediaOverride(mediaOverrides?.logoId);
			const icon = await resolveMediaOverride(mediaOverrides?.iconId);
			const wallpaper = await resolveMediaOverride(mediaOverrides?.wallpaperId);

			if (banner) tags.push(getBootTag('Banner', banner));
			if (icon) tags.push(getBootTag('Thumbnail', icon));
			if (wallpaper) tags.push(getBootTag('Wallpaper', wallpaper));

			if (!profileId) {
				tags.push({ name: 'Zone-Type', value: 'User' });
				tags.push(getBootTag('Username', data.name || 'Imported Portal'));
				tags.push(getBootTag('DisplayName', data.name || 'Imported Portal'));
				tags.push(getBootTag('Description', data.description || ''));
			}

			targetPortalId = await libs.createZone(
				{
					tags: tags,
					data: PORTAL_DATA(),
					spawnModeration: false,
					authUsers: [walletAddress],
				},
				(status: any) => debugLog('info', 'WordPressImport', status)
			);

			debugLog('info', 'WordPressImport', `Created portal: ${targetPortalId}`);

			if (!profileId) profileId = targetPortalId;

			await libs.setZoneRoles(
				[
					{
						granteeId: walletAddress,
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
				targetPortalId,
				wallet
			);

			const currentPortals = Array.isArray(profile?.portals) ? profile.portals : [];
			const updatedPortals = [...currentPortals, { Id: targetPortalId, Name: data.name || 'Imported Portal' }];
			await libs.updateZone({ Portals: libs.mapToProcessCase(updatedPortals) }, profileId, wallet);

			const defaultTheme = data.theme || THEME.DEFAULT;

			const extractedFonts = data.extractedTheme?.fonts;
			const portalFonts = {
				headers: extractedFonts?.heading ? `${extractedFonts.heading}:400,700` : FONT_OPTIONS.headers[0],
				body: extractedFonts?.body ? `${extractedFonts.body}:400,700` : FONT_OPTIONS.body[0],
			};

			await libs.updateZone(
				{
					Themes: [libs.mapToProcessCase(defaultTheme)],
					Layout: libs.mapToProcessCase(LAYOUT.JOURNAL),
					Pages: libs.mapToProcessCase(PAGES.JOURNAL),
					Fonts: libs.mapToProcessCase(portalFonts),
				},
				targetPortalId,
				wallet
			);

			debugLog('info', 'WordPressImport', 'Set default Layout, Pages, Theme, and Fonts');

			refreshProfile();
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		let portalToUpdate: PortalDetailType | null = current;
		if (createPortal || !portalToUpdate?.id || portalToUpdate.id !== targetPortalId) {
			const fetched = await loadPortal(targetPortalId);
			portalToUpdate = (fetched ?? current) as PortalDetailType | null;
		}

		if (!portalToUpdate?.id) {
			throw new Error('Failed to get portal for update');
		}

		const updates: any = {};
		const DEFAULT_TOPIC = 'Uncategorized';
		const effectiveCategoryIds = selectedCategories;

		if (createCategories && selectedCategories.size > 0 && data.categories && data.categories.length > 0) {
			const existingCategories = portalToUpdate.categories || [];

			const existingIds = new Set<string>();
			const flattenExisting = (cats: any[]) => {
				cats.forEach((cat: any) => {
					if (cat?.id) existingIds.add(cat.id);
					if (cat?.children?.length) flattenExisting(cat.children);
				});
			};
			flattenExisting(existingCategories);

			const selectedOrAncestors = new Set<string>();
			const collectSelectedAndAncestors = (cats: any[]): boolean => {
				let anyIncluded = false;
				for (const cat of cats) {
					const childIncluded = cat.children?.length ? collectSelectedAndAncestors(cat.children) : false;
					const include = effectiveCategoryIds.has(cat.id) || childIncluded;
					if (include) {
						selectedOrAncestors.add(cat.id);
						anyIncluded = true;
					}
				}
				return anyIncluded;
			};
			collectSelectedAndAncestors(data.categories);

			const buildNewSubtree = (cats: any[]): any[] => {
				const out: any[] = [];
				for (const cat of cats) {
					if (!selectedOrAncestors.has(cat.id)) continue;
					if (existingIds.has(cat.id)) continue;
					const children = cat.children?.length ? buildNewSubtree(cat.children) : [];
					out.push({
						id: cat.id,
						name: cat.name,
						parent: cat.parent || undefined,
						metadata: cat.metadata || {},
						children,
					});
				}
				return out;
			};
			const newTreeRoots = buildNewSubtree(data.categories);

			const mergedRoots = [...existingCategories, ...newTreeRoots];
			updates.Categories = libs.mapToProcessCase(mergedRoots);
		}

		if (createTopics && selectedTopics && selectedTopics.size > 0 && data.topics && data.topics.length > 0) {
			const existingTopics = portalToUpdate.topics || [];
			const existingTopicValues = new Set(existingTopics.map((t: any) => t?.value ?? t?.Value ?? ''));
			const topicsToAdd = data.topics.filter((topic) => topic.value && selectedTopics.has(topic.value));
			const newTopics = topicsToAdd
				.filter((topic) => topic.value && !existingTopicValues.has(topic.value))
				.map((topic) => ({ Value: topic.value }));
			if (newTopics.length > 0) {
				const allTopics = [...existingTopics.map((t: any) => ({ Value: t?.value ?? t?.Value ?? '' })), ...newTopics];
				updates.Topics = allTopics;
			}
		} else if (posts.length > 0) {
			const existingTopics = portalToUpdate.topics || [];
			if (!existingTopics.some((t: any) => (t?.value ?? t?.Value ?? '') === DEFAULT_TOPIC)) {
				updates.Topics = [
					...existingTopics.map((t: any) => ({ Value: t?.value ?? t?.Value ?? '' })),
					{ Value: DEFAULT_TOPIC },
				];
			}
		}

		if (data.theme) {
			const existingThemes = portalToUpdate.themes || [];
			const newTheme = libs.mapToProcessCase(data.theme);
			const filteredThemes = existingThemes
				.filter((t: any) => t?.name !== 'Imported Theme' && t?.Name !== 'Imported Theme')
				.map((t: any) => ({ ...t, active: false, Active: false }));
			updates.Themes = [...filteredThemes, newTheme];
		}

		if (data.name && (createPortal || !portalToUpdate.name)) {
			updates.Name = data.name;
		}
		if (data.description && (createPortal || !(portalToUpdate as any).description)) {
			updates.Description = data.description;
		}

		if (Object.keys(updates).length > 0) {
			await libs.updateZone(updates, portalToUpdate.id, wallet);
			refreshCurrentPortal([
				PortalPatchMapEnum.Navigation,
				PortalPatchMapEnum.Overview,
				PortalPatchMapEnum.Presentation,
			]);
			addNotification('Portal updated with categories, topics, and theme', 'success');

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		const excludeFromIndex = JSON.stringify([
			'Balances',
			'Ticker',
			'Process-Type',
			'Total-Supply',
			'Transferable',
			'Metadata.Content',
		]);
		const effectiveProfileId = profile?.id ?? profileId;
		const useAutoIndex = createPortal || permissions?.postAutoIndex;
		const useRequestIndex = !useAutoIndex && permissions?.postRequestIndex;

		for (const post of posts) {
			try {
				const postCategories = createCategories
					? post.categories.filter((cat) => effectiveCategoryIds.has(cat.id))
					: [];
				let postTopics =
					createTopics && selectedTopics && selectedTopics.size > 0
						? post.topics.filter((t) => selectedTopics.has(t))
						: [];
				if (postTopics.length === 0) {
					postTopics = [DEFAULT_TOPIC];
				}
				const slug = post.slug || urlify(post.title);
				const releaseDate = post.dateCreated ?? Date.now();

				let postContent = post.content;
				let postThumbnail = post.thumbnail;
				if (uploadedImageUrls && uploadedImageUrls.size > 0) {
					postContent = replaceImageUrlsInContent(post.content, uploadedImageUrls);
					postThumbnail = replaceFeaturedImage(post.thumbnail, uploadedImageUrls);
				}

				let postData: any = libs.mapToProcessCase({
					name: post.title,
					description: post.description,
					status: 'published',
					content: postContent,
					topics: postTopics,
					categories: postCategories,
					creator: effectiveProfileId,
					url: slug,
					releaseDate: String(releaseDate),
					originPortal: portalToUpdate.id,
				});

				const thumbnailToUse = postThumbnail || post.thumbnail;
				if (thumbnailToUse && checkValidAddress(thumbnailToUse)) {
					try {
						postData.Thumbnail = await libs.resolveTransaction(thumbnailToUse);
					} catch {
						// skip thumbnail if resolve fails
					}
				}

				const args = {
					name: post.title,
					description: post.description,
					topics: postTopics,
					creator: effectiveProfileId,
					data: PORTAL_POST_DATA(),
					contentType: ASSET_UPLOAD.contentType,
					assetType: ASSET_UPLOAD.ansType,
					users: [portalToUpdate.id],
					spawnComments: true,
				};

				const assetId = await libs.createAtomicAsset(args, (status: any) =>
					debugLog('info', 'WordPressImport', `Creating post "${post.title}": ${status}`)
				);

				await libs.sendMessage({
					processId: assetId,
					wallet: wallet,
					action: 'Update-Asset',
					tags: [{ name: 'Exclude-Index', value: excludeFromIndex }],
					data: postData,
				});

				if ((useAutoIndex || useRequestIndex) && effectiveProfileId) {
					const internalIndexAction = useAutoIndex ? 'Add-Index-Id' : 'Add-Index-Request';
					const zoneResult = await libs.sendMessage({
						processId: effectiveProfileId,
						wallet: wallet,
						action: 'Run-Action',
						tags: [
							{ name: 'Forward-To', value: portalToUpdate.id },
							{ name: 'Forward-Action', value: internalIndexAction },
							{ name: 'Index-Id', value: assetId },
						],
						data: { Input: {} },
						returnResult: true,
					});

					if (useAutoIndex && zoneResult?.Messages?.length > 0) {
						await libs.sendMessage({
							processId: assetId,
							wallet: wallet,
							action: 'Send-Index',
							tags: [
								{ name: 'Asset-Type', value: ASSET_UPLOAD.ansType },
								{ name: 'Date-Added', value: String(releaseDate) },
								{ name: 'Exclude', value: excludeFromIndex },
							],
							data: { Recipients: [portalToUpdate.id] },
						});
					}
				}

				debugLog('info', 'WordPressImport', `Created post: ${assetId}`);
			} catch (err: any) {
				debugLog('error', 'WordPressImport', `Failed to create post "${post.title}": ${err?.message}`);
				addNotification(`Failed to create post "${post.title}": ${err?.message ?? 'Unknown error'}`, 'warning');
			}
		}

		if (posts.length > 0) {
			refreshCurrentPortal([PortalPatchMapEnum.Posts, PortalPatchMapEnum.Requests]);
			if (redirectToCreate) {
				navigate(URLS.portalCreate(portalToUpdate.id));
			} else {
				navigate(redirectPath ?? `${URLS.base}${portalToUpdate.id}`);
			}
			addNotification(
				createPortal
					? `Portal created and ${posts.length} post${posts.length !== 1 ? 's' : ''} imported.`
					: `${posts.length} post${posts.length !== 1 ? 's' : ''} imported.`,
				'success'
			);
		}

		if (pages.length > 0 && permissions?.updatePortalMeta && effectiveProfileId) {
			const currentPages = portalToUpdate.pages || {};
			const updatedPages = { ...currentPages };

			for (const page of pages) {
				try {
					const args = {
						name: page.title,
						description: page.description,
						topics: [],
						creator: effectiveProfileId,
						data: PORTAL_POST_DATA(),
						contentType: ASSET_UPLOAD.contentType,
						assetType: ASSET_UPLOAD.ansType,
						users: [],
						spawnComments: false,
					};

					const assetId = await libs.createAtomicAsset(args, (status: any) =>
						debugLog('info', 'WordPressImport', `Creating page "${page.title}": ${status}`)
					);

					const contentData = {
						content: page.content,
						thumbnail: page.thumbnail,
						status: page.status,
					};

					await libs.sendMessage({
						processId: assetId,
						wallet: wallet,
						action: 'Update-Asset',
						tags: [],
						data: contentData,
					});

					const pageSlug = urlify(page.title);
					updatedPages[pageSlug] = {
						type: 'static',
						id: assetId,
						name: page.title,
					};

					addNotification(`Created page: ${page.title}`, 'success');
				} catch (error: any) {
					debugLog('error', 'WordPressImport', `Failed to create page "${page.title}": ${error.message}`);
					addNotification(`Failed to create page "${page.title}": ${error.message}`, 'warning');
				}
			}

			if (Object.keys(updatedPages).length > Object.keys(currentPages).length) {
				await libs.updateZone({ Pages: libs.mapToProcessCase(updatedPages) }, portalToUpdate.id, wallet);
				refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			}
		}

		if (uploadedImageUrls && uploadedImageUrls.size > 0 && portalToUpdate?.id) {
			try {
				const currentUploads = portalToUpdate.uploads || [];
				const newUploads = Array.from(uploadedImageUrls.entries()).map(([_originalUrl, arweaveUrl]) => {
					const txId = arweaveUrl.split('/').pop() || arweaveUrl;
					return {
						tx: txId,
						type: 'image',
						dateUploaded: Date.now().toString(),
					};
				});

				const updatedUploads = [...currentUploads, ...newUploads];

				await libs.updateZone({ Uploads: libs.mapToProcessCase(updatedUploads) }, portalToUpdate.id, wallet);

				debugLog('info', 'WordPressImport', `Registered ${newUploads.length} images in media library`);
				refreshCurrentPortal(PortalPatchMapEnum.Media);
			} catch (err: any) {
				debugLog('error', 'WordPressImport', `Failed to register images in media library: ${err?.message}`);
			}
		}

		refreshCurrentPortal();
	} catch (error: any) {
		debugLog('error', 'WordPressImport', `Import failed: ${error.message}`);
		addNotification(`Import failed: ${error.message}`, 'warning', { persistent: true });
	}
}
