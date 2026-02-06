import React from 'react';

import { Button } from 'components/atoms/Button';
import { Checkbox } from 'components/atoms/Checkbox';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { ICONS } from 'helpers/config';
import {
	ConvertedPost,
	convertWordPressToPortal,
	parseWXRFile,
	PortalImportData,
	WordPressClient,
	WordPressExtractionProgress,
	WordPressExtractionResult,
} from 'helpers/wordpress';
import { calculateImageCostEstimate, ImageUploadState, uploadImagesToArweave } from 'helpers/wordpressImageUpload';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

type ImportStage = 'input' | 'extracting' | 'preview' | 'importing' | 'complete';
type ContentTab = 'posts' | 'pages' | 'categories' | 'tags' | 'theme' | 'images';

// Helper to determine if a color is light (for border visibility on swatches)
function isLightColor(color: string): boolean {
	// Handle hex colors
	if (color.startsWith('#')) {
		const hex = color.slice(1);
		const fullHex =
			hex.length === 3
				? hex
						.split('')
						.map((c) => c + c)
						.join('')
				: hex;
		const r = parseInt(fullHex.slice(0, 2), 16);
		const g = parseInt(fullHex.slice(2, 4), 16);
		const b = parseInt(fullHex.slice(4, 6), 16);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.5;
	}
	// Handle rgb colors
	const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (rgbMatch) {
		const r = parseInt(rgbMatch[1]);
		const g = parseInt(rgbMatch[2]);
		const b = parseInt(rgbMatch[3]);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.5;
	}
	return true; // Default to light for unknown formats
}

export default function WordPressImport(props: {
	open: boolean;
	handleClose: () => void;
	createPortal?: boolean; // If true, create a new portal instead of importing to existing
	inline?: boolean;
	title?: string;
	closeOnComplete?: boolean;
	portalName?: string;
	onPortalNameChange?: (name: string) => void;
	submitLabel?: string | ((count: number) => string);
	importingMessage?: string;
	showImportingStage?: boolean;
	onImportComplete?: (
		data: PortalImportData,
		selectedPosts: ConvertedPost[],
		selectedPages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean,
		selectedTopics?: Set<string>,
		uploadedImageUrls?: Map<string, string>
	) => Promise<void>;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();

	const [importMethod, setImportMethod] = React.useState<'url' | 'file'>('url');
	const [url, setUrl] = React.useState<string>('');
	const [wxrFile, setWxrFile] = React.useState<File | null>(null);
	const [stage, setStage] = React.useState<ImportStage>('input');
	const [progress, setProgress] = React.useState<WordPressExtractionProgress | null>(null);
	const [extractionResult, setExtractionResult] = React.useState<WordPressExtractionResult | null>(null);
	const [importData, setImportData] = React.useState<PortalImportData | null>(null);
	const [selectedPosts, setSelectedPosts] = React.useState<Set<number>>(new Set());
	const [selectedPages, setSelectedPages] = React.useState<Set<number>>(new Set());
	const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set());
	const [selectedTopics, setSelectedTopics] = React.useState<Set<string>>(new Set());
	const [createCategories, setCreateCategories] = React.useState<boolean>(true);
	const [createTopics, setCreateTopics] = React.useState<boolean>(true);
	const [portalName, setPortalName] = React.useState<string>(props.portalName ?? '');
	const [activeTab, setActiveTab] = React.useState<ContentTab>('posts');
	const [errors, setErrors] = React.useState<string[]>([]);

	// Image upload state
	const [selectedImages, setSelectedImages] = React.useState<Set<string>>(new Set());
	const [imageUploadStates, setImageUploadStates] = React.useState<Map<string, ImageUploadState>>(new Map());
	const [isUploadingImages, setIsUploadingImages] = React.useState<boolean>(false);
	const [uploadedImageUrls, setUploadedImageUrls] = React.useState<Map<string, string>>(new Map());
	const [failedImageUrls, setFailedImageUrls] = React.useState<Set<string>>(new Set());

	// Fetch options (only used for URL import)
	const [fetchPosts, setFetchPosts] = React.useState<boolean>(true);
	const [fetchPages, setFetchPages] = React.useState<boolean>(true);
	const [fetchCategories, setFetchCategories] = React.useState<boolean>(true);
	const [fetchTags, setFetchTags] = React.useState<boolean>(true);
	const [fetchTheme, setFetchTheme] = React.useState<boolean>(true);
	const [postsCount, setPostsCount] = React.useState<number>(10);

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (!props.open) {
			handleReset();
		}
	}, [props.open]);

	React.useEffect(() => {
		if (importData) {
			setSelectedPosts(new Set(importData.posts.map((p) => p.wpId)));
			setSelectedPages(new Set(importData.pages.map((p) => p.wpId)));
			// Categories and tags: default to none selected; user chooses explicitly
			setSelectedCategories(new Set());
			setSelectedTopics(new Set());
			if (props.portalName === undefined) {
				setPortalName(importData.name || '');
			} else if (props.onPortalNameChange) {
				props.onPortalNameChange(importData.name || '');
			}
			setFailedImageUrls(new Set());
			// Select all images by default
			if (importData.images && importData.images.length > 0) {
				setSelectedImages(new Set(importData.images.map((img) => img.originalUrl)));
			}
		}
	}, [importData, props.portalName, props.onPortalNameChange]);

	React.useEffect(() => {
		if (props.portalName !== undefined) {
			setPortalName(props.portalName);
		}
	}, [props.portalName]);

	const handleReset = React.useCallback(() => {
		setUrl('');
		setWxrFile(null);
		setImportMethod('url');
		setStage('input');
		setProgress(null);
		setExtractionResult(null);
		setImportData(null);
		setSelectedPosts(new Set());
		setSelectedPages(new Set());
		setSelectedCategories(new Set());
		setSelectedTopics(new Set());
		setCreateCategories(true);
		setCreateTopics(true);
		setPortalName('');
		if (props.onPortalNameChange) props.onPortalNameChange('');
		setActiveTab('posts');
		setErrors([]);
		setFetchPosts(true);
		setFetchPages(true);
		setFetchCategories(true);
		setFetchTags(true);
		setFetchTheme(true);
		setPostsCount(10);
		// Reset image state
		setSelectedImages(new Set());
		setImageUploadStates(new Map());
		setIsUploadingImages(false);
		setUploadedImageUrls(new Map());
		setFailedImageUrls(new Set());
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [props.onPortalNameChange]);

	const handleExtract = React.useCallback(async () => {
		setStage('extracting');
		setErrors([]);

		try {
			let result: WordPressExtractionResult;

			if (importMethod === 'file') {
				if (!wxrFile) {
					addNotification('Please select a WordPress export file', 'warning');
					setStage('input');
					return;
				}

				setProgress({ stage: 'siteInfo', current: 0, total: 1, message: 'Parsing WordPress export file...' });
				result = await parseWXRFile(wxrFile);
				setProgress({ stage: 'complete', current: 1, total: 1, message: 'File parsed successfully!' });
			} else {
				// URL import
				if (!url.trim()) {
					addNotification('Please enter a WordPress site URL', 'warning');
					setStage('input');
					return;
				}

				if (!fetchPosts && !fetchPages && !fetchCategories && !fetchTags && !fetchTheme) {
					addNotification('Please select at least one item to fetch', 'warning');
					setStage('input');
					return;
				}

				const client = new WordPressClient(url);
				result = await client.extractAll(
					(progressUpdate) => {
						setProgress(progressUpdate);
					},
					{
						fetchPosts,
						fetchPages,
						fetchCategories,
						fetchTags,
						fetchTheme,
						postsLimit: fetchPosts ? postsCount : undefined,
					}
				);
			}

			setExtractionResult(result);

			if (result.errors.length > 0) {
				setErrors(result.errors);
			}

			if (result.posts.length === 0 && result.pages.length === 0) {
				setErrors((prev) => [...prev, 'No content found in the WordPress export']);
				setStage('input');
				return;
			}

			const converted = convertWordPressToPortal(result);
			setImportData(converted);
			setStage('preview');
		} catch (error: any) {
			setErrors([error.message || 'Failed to extract WordPress data']);
			setStage('input');
		}
	}, [
		importMethod,
		wxrFile,
		url,
		fetchPosts,
		fetchPages,
		fetchCategories,
		fetchTags,
		fetchTheme,
		postsCount,
		addNotification,
	]);

	const handleTogglePost = React.useCallback((wpId: number) => {
		setSelectedPosts((prev) => {
			const next = new Set(prev);
			if (next.has(wpId)) {
				next.delete(wpId);
			} else {
				next.add(wpId);
			}
			return next;
		});
	}, []);

	const handleTogglePage = React.useCallback((wpId: number) => {
		setSelectedPages((prev) => {
			const next = new Set(prev);
			if (next.has(wpId)) {
				next.delete(wpId);
			} else {
				next.add(wpId);
			}
			return next;
		});
	}, []);

	const handleSelectAllPosts = React.useCallback(() => {
		if (!importData) return;
		const allSelected = importData.posts.every((p) => selectedPosts.has(p.wpId));
		if (allSelected) {
			setSelectedPosts(new Set());
		} else {
			setSelectedPosts(new Set(importData.posts.map((p) => p.wpId)));
		}
	}, [importData, selectedPosts]);

	const handleSelectAllPages = React.useCallback(() => {
		if (!importData) return;
		const allSelected = importData.pages.every((p) => selectedPages.has(p.wpId));
		if (allSelected) {
			setSelectedPages(new Set());
		} else {
			setSelectedPages(new Set(importData.pages.map((p) => p.wpId)));
		}
	}, [importData, selectedPages]);

	const handleToggleCategory = React.useCallback((categoryId: string) => {
		setSelectedCategories((prev) => {
			const next = new Set(prev);
			if (next.has(categoryId)) {
				next.delete(categoryId);
			} else {
				next.add(categoryId);
			}
			return next;
		});
	}, []);

	const handleSelectAllCategories = React.useCallback(() => {
		if (!importData) return;
		const allSelected = importData.categories.every((cat) => {
			const checkCategory = (c: any): boolean => {
				if (!selectedCategories.has(c.id)) return false;
				if (c.children && c.children.length > 0) {
					return c.children.every((child: any) => checkCategory(child));
				}
				return true;
			};
			return checkCategory(cat);
		});

		if (allSelected) {
			setSelectedCategories(new Set());
		} else {
			const allIds = new Set<string>();
			const collectIds = (cats: any[]) => {
				cats.forEach((cat) => {
					allIds.add(cat.id);
					if (cat.children && cat.children.length > 0) {
						collectIds(cat.children);
					}
				});
			};
			collectIds(importData.categories);
			setSelectedCategories(allIds);
		}
	}, [importData, selectedCategories]);

	const handleToggleTopic = React.useCallback((topicValue: string) => {
		setSelectedTopics((prev) => {
			const next = new Set(prev);
			if (next.has(topicValue)) {
				next.delete(topicValue);
			} else {
				next.add(topicValue);
			}
			return next;
		});
	}, []);

	const handleSelectAllTags = React.useCallback(() => {
		if (!importData) return;
		const allSelected = importData.topics.every((t) => selectedTopics.has(t.value));
		if (allSelected) {
			setSelectedTopics(new Set());
		} else {
			setSelectedTopics(new Set(importData.topics.map((t) => t.value)));
		}
	}, [importData, selectedTopics]);

	// Image selection handlers
	const handleToggleImage = React.useCallback((url: string) => {
		setSelectedImages((prev) => {
			const next = new Set(prev);
			if (next.has(url)) {
				next.delete(url);
			} else {
				next.add(url);
			}
			return next;
		});
	}, []);

	const handleSelectAllImages = React.useCallback(() => {
		if (!importData) return;
		const allSelected = importData.images.every((img) => selectedImages.has(img.originalUrl));
		if (allSelected) {
			setSelectedImages(new Set());
		} else {
			setSelectedImages(new Set(importData.images.map((img) => img.originalUrl)));
		}
	}, [importData, selectedImages]);

	const handleUploadImages = React.useCallback(async () => {
		if (!importData || selectedImages.size === 0) return;
		if (!arProvider.wallet) {
			addNotification('Please connect your wallet to upload images', 'warning');
			return;
		}

		setIsUploadingImages(true);

		// Initialize all selected images as pending
		const initialStates = new Map<string, ImageUploadState>();
		selectedImages.forEach((url) => {
			initialStates.set(url, { status: 'pending' });
		});
		setImageUploadStates(initialStates);

		try {
			const urlMap = await uploadImagesToArweave(
				importData.images,
				selectedImages,
				permawebProvider.libs,
				arProvider.wallet,
				(url, state) => {
					setImageUploadStates((prev) => {
						const next = new Map(prev);
						next.set(url, state);
						return next;
					});
				}
			);

			setUploadedImageUrls(urlMap);

			const successCount = urlMap.size;
			const failCount = selectedImages.size - successCount;

			if (successCount > 0) {
				addNotification(
					`Uploaded ${successCount} image${successCount !== 1 ? 's' : ''} to Arweave${
						failCount > 0 ? ` (${failCount} failed)` : ''
					}`,
					failCount > 0 ? 'warning' : 'success'
				);
			} else if (failCount > 0) {
				addNotification(`Failed to upload ${failCount} image${failCount !== 1 ? 's' : ''}`, 'warning');
			}
		} catch (error: any) {
			addNotification(`Image upload failed: ${error.message || 'Unknown error'}`, 'warning');
		} finally {
			setIsUploadingImages(false);
		}
	}, [importData, selectedImages, arProvider.wallet, permawebProvider.libs, addNotification]);

	const handleImport = React.useCallback(async () => {
		if (!importData) return;

		const postsToImport = importData.posts.filter((p) => selectedPosts.has(p.wpId));
		const categoriesToImport = importData.categories.filter((cat) => {
			const checkCategory = (c: any): boolean => {
				if (selectedCategories.has(c.id)) return true;
				if (c.children && c.children.length > 0) {
					return c.children.some((child: any) => checkCategory(child));
				}
				return false;
			};
			return checkCategory(cat);
		});

		if (postsToImport.length === 0) {
			addNotification('Please select at least one post to import', 'warning');
			return;
		}

		if (props.onImportComplete) {
			const dataToImport = {
				...importData,
				categories: categoriesToImport,
				name: props.createPortal ? portalName || importData.name : importData.name,
			};

			// Set stage to importing and wait for completion (if enabled)
			const showImportingStage = props.showImportingStage !== false;
			if (showImportingStage) setStage('importing');

			try {
				await props.onImportComplete(
					dataToImport,
					postsToImport,
					[],
					selectedCategories,
					createCategories,
					createTopics,
					selectedTopics,
					uploadedImageUrls.size > 0 ? uploadedImageUrls : undefined
				);
				// Import completed successfully
				if (props.closeOnComplete !== false) {
					props.handleClose();
				} else {
					setStage('preview');
				}
			} catch (error: any) {
				// Import failed, show error and go back to preview
				setErrors([error.message || 'Import failed']);
				setStage('preview');
			}
		} else {
			props.handleClose();
		}
	}, [
		importData,
		selectedPosts,
		selectedCategories,
		selectedTopics,
		createCategories,
		createTopics,
		portalName,
		props,
		addNotification,
		uploadedImageUrls,
	]);

	const getProgressPercentage = React.useCallback(() => {
		if (!progress) return 0;
		if (progress.total === 0) return 0;
		return Math.round((progress.current / progress.total) * 100);
	}, [progress]);

	function formatDate(timestamp: number | string | undefined): string {
		if (!timestamp) return 'No date';
		const date = new Date(timestamp);
		if (isNaN(date.getTime())) return 'No date';
		return date.toLocaleDateString();
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			if (file.type === 'text/xml' || file.name.endsWith('.xml') || file.name.includes('wordpress')) {
				setWxrFile(file);
				setErrors([]);
			} else {
				addNotification('Please select a valid WordPress export file (.xml)', 'warning');
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
			}
		}
	}

	function renderInputStage() {
		return (
			<S.Wrapper>
				<S.InputSection>
					<S.SectionLabel>Import Method</S.SectionLabel>
					<S.SectionInfo>
						Choose how you want to import your WordPress content. You can either import from a live WordPress site URL
						or upload a WordPress export file (.xml).
					</S.SectionInfo>
					<S.CheckboxGroup>
						<S.CheckboxContainer
							onClick={() => {
								setImportMethod('url');
								setWxrFile(null);
								if (fileInputRef.current) fileInputRef.current.value = '';
							}}
						>
							<Checkbox
								checked={importMethod === 'url'}
								handleSelect={() => {
									setImportMethod('url');
									setWxrFile(null);
									if (fileInputRef.current) fileInputRef.current.value = '';
								}}
								disabled={false}
							/>
							<span>Import from URL</span>
						</S.CheckboxContainer>
						<S.CheckboxContainer
							onClick={() => {
								setImportMethod('file');
								setUrl('');
							}}
						>
							<Checkbox
								checked={importMethod === 'file'}
								handleSelect={() => {
									setImportMethod('file');
									setUrl('');
								}}
								disabled={false}
							/>
							<span>Upload WordPress Export File (.xml)</span>
						</S.CheckboxContainer>
					</S.CheckboxGroup>
				</S.InputSection>

				{importMethod === 'url' ? (
					<>
						<S.InputSection>
							<S.SectionLabel>{language?.wordpressUrl || 'WordPress Site URL'}</S.SectionLabel>
							<S.SectionInfo>
								Enter the URL of the WordPress site you want to import content from. Supports both self-hosted WordPress
								sites and WordPress.com sites. The site must have the REST API enabled (enabled by default on most
								WordPress sites).
								<br />
								<br />
								<strong>🎨 Theme Detection:</strong> We'll automatically extract colors, fonts, and styling from your
								WordPress site to create a matching portal theme.
							</S.SectionInfo>
							<FormField
								value={url}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
								placeholder="https://example.com or https://sitename.wordpress.com"
								disabled={false}
								invalid={{ status: false, message: null }}
							/>
						</S.InputSection>

						<S.InputSection>
							<S.SectionLabel>What to Import</S.SectionLabel>
							<S.SectionInfo>Select what content you want to fetch from the WordPress site.</S.SectionInfo>
							<S.WhatToImportList>
								<S.WhatToImportCheckboxes>
									<S.CheckboxContainer onClick={() => setFetchPosts(!fetchPosts)}>
										<Checkbox checked={fetchPosts} handleSelect={() => setFetchPosts(!fetchPosts)} disabled={false} />
										<span>Posts</span>
									</S.CheckboxContainer>
									<S.CheckboxContainer onClick={() => setFetchPages(!fetchPages)}>
										<Checkbox checked={fetchPages} handleSelect={() => setFetchPages(!fetchPages)} disabled={false} />
										<span>Pages</span>
									</S.CheckboxContainer>
									<S.CheckboxContainer onClick={() => setFetchCategories(!fetchCategories)}>
										<Checkbox
											checked={fetchCategories}
											handleSelect={() => setFetchCategories(!fetchCategories)}
											disabled={false}
										/>
										<span>Categories</span>
									</S.CheckboxContainer>
									<S.CheckboxContainer onClick={() => setFetchTags(!fetchTags)}>
										<Checkbox checked={fetchTags} handleSelect={() => setFetchTags(!fetchTags)} disabled={false} />
										<span>Tags</span>
									</S.CheckboxContainer>
									<S.CheckboxContainer onClick={() => setFetchTheme(!fetchTheme)}>
										<Checkbox checked={fetchTheme} handleSelect={() => setFetchTheme(!fetchTheme)} disabled={false} />
										<span>Theme</span>
									</S.CheckboxContainer>
								</S.WhatToImportCheckboxes>
								{fetchPosts && (
									<S.PostsLimitRow onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
										<S.PostsLimitLabel>Number of posts</S.PostsLimitLabel>
										<S.PostsLimitInputWrap>
											<FormField
												value={postsCount.toString()}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
													const val = parseInt(e.target.value) || 0;
													if (val >= 0 && val <= 1000) {
														setPostsCount(val);
													}
												}}
												placeholder="10"
												disabled={false}
												invalid={{ status: false, message: null }}
												noMargin
											/>
										</S.PostsLimitInputWrap>
									</S.PostsLimitRow>
								)}
							</S.WhatToImportList>
						</S.InputSection>
					</>
				) : (
					<S.InputSection>
						<S.SectionLabel>WordPress Export File</S.SectionLabel>
						<S.SectionInfo>
							Upload a WordPress export file (.xml). This file contains all your posts, pages, categories, tags, and
							other content. You can export this file from your WordPress admin panel under{' '}
							<strong>Tools → Export</strong>.
							<br />
							<br />
							<strong>Note:</strong> Theme colors cannot be extracted from export files. Only content, categories, tags,
							and structure will be imported.
						</S.SectionInfo>
						<input
							ref={fileInputRef}
							type="file"
							accept=".xml,text/xml"
							onChange={handleFileChange}
							style={{ display: 'none' }}
						/>
						<Button
							type={'alt1'}
							label={wxrFile ? wxrFile.name : 'Choose WordPress Export File (.xml)'}
							handlePress={() => fileInputRef.current?.click()}
							disabled={false}
							icon={ICONS.import}
							iconLeftAlign
							fullWidth
						/>
						{wxrFile && (
							<S.FileSelectedMessage>
								✓ File selected: {wxrFile.name} ({(wxrFile.size / 1024).toFixed(1)} KB)
							</S.FileSelectedMessage>
						)}
					</S.InputSection>
				)}

				{errors.length > 0 && (
					<S.ErrorWrapper>
						{errors.map((error, index) => (
							<S.ErrorMessage key={index}>{error}</S.ErrorMessage>
						))}
					</S.ErrorWrapper>
				)}

				<S.Actions>
					<Button
						type={'primary'}
						label={language?.cancel || 'Cancel'}
						handlePress={props.handleClose}
						disabled={false}
					/>
					<Button
						type={'alt1'}
						label={language?.extract || 'Extract Content'}
						handlePress={handleExtract}
						disabled={
							importMethod === 'url'
								? !url.trim() || (!fetchPosts && !fetchPages && !fetchCategories && !fetchTags && !fetchTheme)
								: !wxrFile
						}
						icon={ICONS.import}
						iconLeftAlign
					/>
				</S.Actions>
			</S.Wrapper>
		);
	}

	function renderExtractingStage() {
		return (
			<S.Wrapper>
				<S.ProgressWrapper>
					<S.ProgressBar>
						<S.ProgressFill $progress={getProgressPercentage()} />
					</S.ProgressBar>
					<S.ProgressMessage>{progress?.message || 'Connecting...'}</S.ProgressMessage>
				</S.ProgressWrapper>
			</S.Wrapper>
		);
	}

	function renderPreviewStage() {
		if (!importData || !extractionResult) return null;

		const allPostsSelected = importData.posts.length > 0 && importData.posts.every((p) => selectedPosts.has(p.wpId));
		const allPagesSelected = importData.pages.length > 0 && importData.pages.every((p) => selectedPages.has(p.wpId));

		return (
			<S.Wrapper>
				<S.PreviewWrapper>
					<S.PreviewHeader>
						{props.createPortal ? (
							<>
								<S.SectionLabel>{language?.portalName || 'Portal name'}</S.SectionLabel>
								<FormField
									value={portalName}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setPortalName(e.target.value);
										if (props.onPortalNameChange) props.onPortalNameChange(e.target.value);
									}}
									placeholder={importData.name || 'Enter portal name'}
									disabled={false}
									invalid={{ status: false, message: null }}
								/>
							</>
						) : (
							<S.PreviewTitle>{importData.name}</S.PreviewTitle>
						)}
						{importData.description && <S.PreviewDescription>{importData.description}</S.PreviewDescription>}
					</S.PreviewHeader>

					<S.PreviewStats>
						<S.PreviewStat>
							<S.PreviewStatLabel>Posts</S.PreviewStatLabel>
							<S.PreviewStatValue>{importData.posts.length}</S.PreviewStatValue>
						</S.PreviewStat>
						<S.PreviewStat>
							<S.PreviewStatLabel>Pages</S.PreviewStatLabel>
							<S.PreviewStatValue>{importData.pages.length}</S.PreviewStatValue>
						</S.PreviewStat>
						<S.PreviewStat>
							<S.PreviewStatLabel>Categories</S.PreviewStatLabel>
							<S.PreviewStatValue>{importData.categories.length}</S.PreviewStatValue>
						</S.PreviewStat>
						<S.PreviewStat>
							<S.PreviewStatLabel>Tags</S.PreviewStatLabel>
							<S.PreviewStatValue>{importData.topics.length}</S.PreviewStatValue>
						</S.PreviewStat>
						{importMethod === 'url' &&
							importData.extractedTheme &&
							Object.values(importData.extractedTheme.colors).some((c) => c !== null) && (
								<S.PreviewStat>
									<S.PreviewStatLabel>🎨 Colors</S.PreviewStatLabel>
									<S.PreviewStatValue>
										{Object.values(importData.extractedTheme.colors).filter((c) => c !== null).length} detected
									</S.PreviewStatValue>
								</S.PreviewStat>
							)}
					</S.PreviewStats>

					<S.Tabs>
						<S.Tab $active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>
							Posts ({selectedPosts.size}/{importData.posts.length})
						</S.Tab>
						<S.Tab $active={activeTab === 'pages'} onClick={() => setActiveTab('pages')}>
							Pages ({selectedPages.size}/{importData.pages.length})
						</S.Tab>
						<S.Tab $active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
							Categories ({importData.categories.length})
						</S.Tab>
						<S.Tab $active={activeTab === 'tags'} onClick={() => setActiveTab('tags')}>
							Tags ({selectedTopics.size}/{importData.topics.length})
						</S.Tab>
						<S.Tab $active={activeTab === 'theme'} onClick={() => setActiveTab('theme')}>
							🎨 Theme{' '}
							{importMethod === 'file'
								? '(File Import)'
								: importData.extractedTheme && Object.values(importData.extractedTheme.colors).some((c) => c !== null)
								? `(${Object.values(importData.extractedTheme.colors).filter((c) => c !== null).length} colors)`
								: importData.theme
								? '(Found)'
								: ''}
						</S.Tab>
						{importData.images && importData.images.length > 0 && (
							<S.Tab $active={activeTab === 'images'} onClick={() => setActiveTab('images')}>
								Images ({selectedImages.size}/{importData.images.length})
							</S.Tab>
						)}
					</S.Tabs>

					{activeTab === 'posts' && (
						<>
							{importData.posts.length > 0 && (
								<S.SelectAllWrapper>
									<Checkbox checked={allPostsSelected} handleSelect={handleSelectAllPosts} disabled={false} />
									<S.SelectAllTitle onClick={handleSelectAllPosts}>Select All Posts</S.SelectAllTitle>
								</S.SelectAllWrapper>
							)}
							<S.PostList>
								{importData.posts.map((post) => (
									<S.PostItem
										key={post.wpId}
										$selected={selectedPosts.has(post.wpId)}
										onClick={() => handleTogglePost(post.wpId)}
									>
										<Checkbox
											checked={selectedPosts.has(post.wpId)}
											handleSelect={() => handleTogglePost(post.wpId)}
											disabled={false}
										/>
										<S.PostItemContent>
											<S.PostItemTitle>{post.title}</S.PostItemTitle>
											<S.PostItemMeta>
												{formatDate(post.dateCreated)} | {post.status} | {post.content.length} blocks
											</S.PostItemMeta>
										</S.PostItemContent>
									</S.PostItem>
								))}
							</S.PostList>
						</>
					)}

					{activeTab === 'pages' && (
						<>
							{importData.pages.length > 0 && (
								<S.SelectAllWrapper>
									<Checkbox checked={allPagesSelected} handleSelect={handleSelectAllPages} disabled={false} />
									<S.SelectAllTitle onClick={handleSelectAllPages}>Select All Pages</S.SelectAllTitle>
								</S.SelectAllWrapper>
							)}
							<S.PostList>
								{importData.pages.map((page) => (
									<S.PostItem
										key={page.wpId}
										$selected={selectedPages.has(page.wpId)}
										onClick={() => handleTogglePage(page.wpId)}
									>
										<Checkbox
											checked={selectedPages.has(page.wpId)}
											handleSelect={() => handleTogglePage(page.wpId)}
											disabled={false}
										/>
										<S.PostItemContent>
											<S.PostItemTitle>{page.title}</S.PostItemTitle>
											<S.PostItemMeta>
												{formatDate(page.dateCreated)} | {page.content.length} blocks
											</S.PostItemMeta>
										</S.PostItemContent>
									</S.PostItem>
								))}
							</S.PostList>
						</>
					)}

					{activeTab === 'categories' && (
						<>
							<S.Section>
								<S.CheckboxGroup>
									<S.CheckboxContainer onClick={() => setCreateCategories(!createCategories)}>
										<Checkbox
											checked={createCategories}
											handleSelect={() => setCreateCategories(!createCategories)}
											disabled={false}
										/>
										<span>Create Categories</span>
									</S.CheckboxContainer>
								</S.CheckboxGroup>
							</S.Section>
							{importData.categories.length > 0 && (
								<>
									<S.Section>
										<S.SectionInfo>
											Select which categories to create. Parent and child categories can be selected individually.
										</S.SectionInfo>
									</S.Section>
									<S.CategoryListScrollArea>
										<S.SelectAllWrapper>
											<Checkbox
												checked={importData.categories.every((cat) => {
													const checkCategory = (c: any): boolean => {
														if (!selectedCategories.has(c.id)) return false;
														if (c.children && c.children.length > 0) {
															return c.children.every((child: any) => checkCategory(child));
														}
														return true;
													};
													return checkCategory(cat);
												})}
												handleSelect={handleSelectAllCategories}
												disabled={false}
											/>
											<S.SelectAllTitle onClick={handleSelectAllCategories}>Select All Categories</S.SelectAllTitle>
										</S.SelectAllWrapper>
										<S.CategoryButtonList>
											{importData.categories.map((category) => {
												const renderCategory = (cat: any, depth = 0) => (
													<S.CategoryNode key={cat.id}>
														<S.CategoryButtonRow>
															<Button
																type={'alt3'}
																label={cat.name}
																handlePress={() => handleToggleCategory(cat.id)}
																active={selectedCategories.has(cat.id)}
																disabled={false}
																icon={selectedCategories.has(cat.id) ? ICONS.close : ICONS.add}
															/>
															{depth > 0 && <S.CategoryLevelTag>{`Level ${depth + 1}`}</S.CategoryLevelTag>}
														</S.CategoryButtonRow>
														{cat.metadata?.description && (
															<S.CategoryDescription>{cat.metadata.description}</S.CategoryDescription>
														)}
														{cat.children && cat.children.length > 0 && (
															<S.CategoryChildren>
																{cat.children.map((child: any) => renderCategory(child, depth + 1))}
															</S.CategoryChildren>
														)}
													</S.CategoryNode>
												);
												return renderCategory(category);
											})}
										</S.CategoryButtonList>
									</S.CategoryListScrollArea>
								</>
							)}
						</>
					)}

					{activeTab === 'tags' && (
						<>
							<S.Section>
								<S.CheckboxGroup>
									<S.CheckboxContainer onClick={() => setCreateTopics(!createTopics)}>
										<Checkbox
											checked={createTopics}
											handleSelect={() => setCreateTopics(!createTopics)}
											disabled={false}
										/>
										<span>Create Topics (Tags)</span>
									</S.CheckboxContainer>
								</S.CheckboxGroup>
							</S.Section>
							{importData.topics.length > 0 && (
								<>
									<S.Section>
										<S.SectionInfo>
											Select which tags to create on the portal. Only selected tags will be added as topics.
										</S.SectionInfo>
									</S.Section>
									<S.CategoryListScrollArea>
										<S.SelectAllWrapper>
											<Checkbox
												checked={
													importData.topics.length > 0 && importData.topics.every((t) => selectedTopics.has(t.value))
												}
												handleSelect={handleSelectAllTags}
												disabled={false}
											/>
											<S.SelectAllTitle onClick={handleSelectAllTags}>Select All Tags</S.SelectAllTitle>
										</S.SelectAllWrapper>
										<S.TopicButtonList>
											{importData.topics.map((topic) => (
												<Button
													key={topic.value}
													type={'alt3'}
													label={topic.value}
													handlePress={() => handleToggleTopic(topic.value)}
													active={selectedTopics.has(topic.value)}
													disabled={false}
													icon={selectedTopics.has(topic.value) ? ICONS.close : ICONS.add}
												/>
											))}
										</S.TopicButtonList>
									</S.CategoryListScrollArea>
								</>
							)}
							{importData.topics.length === 0 && (
								<S.Section>
									<S.SectionInfo>No tags were found in the imported content.</S.SectionInfo>
								</S.Section>
							)}
						</>
					)}

					{activeTab === 'theme' && (
						<S.ThemePreview>
							{importMethod === 'file' ? (
								<S.NoThemeMessage>
									<span>
										Theme colors cannot be extracted from WordPress export files. Theme extraction is only available
										when importing from a live WordPress site URL.
										<br />
										<br />
										Your content, categories, tags, and structure have been imported successfully.
									</span>
								</S.NoThemeMessage>
							) : importData.extractedTheme ? (
								<>
									{Object.values(importData.extractedTheme.colors).some((c) => c !== null) && (
										<S.ThemeSection>
											<S.ThemeSectionTitle>🎨 Extracted Theme Colors</S.ThemeSectionTitle>
											<S.SectionInfo>
												We've automatically detected these colors from your WordPress site. They'll be applied to your
												portal theme.
											</S.SectionInfo>
											<S.ExtractedColors>
												{Object.entries(importData.extractedTheme.colors).map(([key, value]) =>
													value ? (
														<S.ExtractedColorItem key={key}>
															<S.ExtractedColorSwatch $color={value} />
															<S.ExtractedColorLabel>
																{key.charAt(0).toUpperCase() + key.slice(1)}
															</S.ExtractedColorLabel>
															<S.ExtractedColorValue>{value}</S.ExtractedColorValue>
														</S.ExtractedColorItem>
													) : null
												)}
											</S.ExtractedColors>
										</S.ThemeSection>
									)}

									{importData.extractedTheme.colorPalette.length > 0 && (
										<S.ThemeSection>
											<S.ThemeSectionTitle>
												Color Palette ({importData.extractedTheme.colorPalette.length} colors)
											</S.ThemeSectionTitle>
											<S.ColorPalette>
												{importData.extractedTheme.colorPalette.map((color) => (
													<S.ColorSwatchLabel key={color.slug}>
														<S.ColorSwatch
															$color={color.color}
															$isLight={isLightColor(color.color)}
															title={`${color.name}: ${color.color}`}
														/>
														<S.ColorSwatchName>{color.name}</S.ColorSwatchName>
													</S.ColorSwatchLabel>
												))}
											</S.ColorPalette>
										</S.ThemeSection>
									)}

									{(importData.extractedTheme.fonts.heading || importData.extractedTheme.fonts.body) && (
										<S.ThemeSection>
											<S.ThemeSectionTitle>Fonts</S.ThemeSectionTitle>
											<S.FontPreview>
												{importData.extractedTheme.fonts.heading && (
													<S.FontItem $fontFamily={importData.extractedTheme.fonts.heading}>
														<S.FontLabel>Heading</S.FontLabel>
														<S.FontSample>{importData.extractedTheme.fonts.heading}</S.FontSample>
													</S.FontItem>
												)}
												{importData.extractedTheme.fonts.body && (
													<S.FontItem $fontFamily={importData.extractedTheme.fonts.body}>
														<S.FontLabel>Body</S.FontLabel>
														<S.FontSample>{importData.extractedTheme.fonts.body}</S.FontSample>
													</S.FontItem>
												)}
											</S.FontPreview>
										</S.ThemeSection>
									)}

									{importData.theme && (
										<S.ThemeSection>
											<S.ThemeSectionTitle>Portal Theme Preview</S.ThemeSectionTitle>
											<S.SectionInfo>
												These colors will be converted to your portal theme format (RGB values for light/dark modes).
											</S.SectionInfo>
										</S.ThemeSection>
									)}
								</>
							) : (
								<S.NoThemeMessage>
									<span>
										No theme colors could be automatically extracted from this WordPress site. The site may use a
										classic theme without CSS custom properties, or the colors may be embedded in compiled CSS that
										cannot be parsed.
									</span>
								</S.NoThemeMessage>
							)}
						</S.ThemePreview>
					)}

					{activeTab === 'images' && importData.images && importData.images.length > 0 && (
						<>
							<S.Section>
								<S.SectionInfo>
									Select images to upload to Arweave. Uploaded images will be stored permanently and their URLs will be
									replaced in your imported content. Images smaller than 100KB are free to upload.
								</S.SectionInfo>
							</S.Section>

							{/* Image cost summary */}
							{(() => {
								const stats = calculateImageCostEstimate(importData.images, selectedImages);
								return (
									<S.ImageSummary>
										<S.ImageSummaryStat>
											<S.ImageSummaryLabel>Total Images</S.ImageSummaryLabel>
											<S.ImageSummaryValue>{stats.totalImages}</S.ImageSummaryValue>
										</S.ImageSummaryStat>
										<S.ImageSummaryStat>
											<S.ImageSummaryLabel>Selected</S.ImageSummaryLabel>
											<S.ImageSummaryValue>{stats.selectedImages}</S.ImageSummaryValue>
										</S.ImageSummaryStat>
										<S.ImageSummaryStat>
											<S.ImageSummaryLabel>Uploaded</S.ImageSummaryLabel>
											<S.ImageSummaryValue>{uploadedImageUrls.size}</S.ImageSummaryValue>
										</S.ImageSummaryStat>
									</S.ImageSummary>
								);
							})()}

							{/* Actions */}
							<S.ImageActions>
								<Checkbox
									checked={
										importData.images.length > 0 &&
										importData.images.every((img) => selectedImages.has(img.originalUrl))
									}
									handleSelect={handleSelectAllImages}
									disabled={isUploadingImages}
								/>
								<S.SelectAllTitle onClick={handleSelectAllImages}>Select All Images</S.SelectAllTitle>
								<Button
									type={'alt1'}
									label={
										isUploadingImages
											? 'Uploading...'
											: `Upload ${selectedImages.size} Image${selectedImages.size !== 1 ? 's' : ''}`
									}
									handlePress={handleUploadImages}
									disabled={selectedImages.size === 0 || isUploadingImages || !arProvider.wallet}
									icon={ICONS.upload}
									iconLeftAlign
								/>
							</S.ImageActions>

							{/* Image grid */}
							<S.ImageGrid>
								{importData.images.map((image) => {
									const uploadState = imageUploadStates.get(image.originalUrl);
									const isUploaded = uploadedImageUrls.has(image.originalUrl);
									const loadFailed = failedImageUrls.has(image.originalUrl);

									return (
										<S.ImageCard
											key={image.originalUrl}
											$selected={selectedImages.has(image.originalUrl)}
											onClick={() => !isUploadingImages && handleToggleImage(image.originalUrl)}
										>
											<S.ImageThumbnail>
												{loadFailed ? (
													<S.ImageThumbnailPlaceholder>Image</S.ImageThumbnailPlaceholder>
												) : (
													<img
														src={image.originalUrl}
														alt=""
														loading="lazy"
														onError={() => {
															setFailedImageUrls((prev) => new Set(prev).add(image.originalUrl));
														}}
													/>
												)}
											</S.ImageThumbnail>
											<S.ImageCheckbox>
												<Checkbox
													checked={selectedImages.has(image.originalUrl)}
													handleSelect={() => handleToggleImage(image.originalUrl)}
													disabled={isUploadingImages}
												/>
											</S.ImageCheckbox>
											<S.ImageBadge $type={image.sourceType}>
												{image.sourceType === 'featured' ? 'Featured' : 'Content'}
											</S.ImageBadge>
											{image.postIds.length > 1 && <S.ImagePostCount>{image.postIds.length} posts</S.ImagePostCount>}

											{/* Upload status overlay */}
											{(uploadState || isUploaded) && (
												<S.ImageUploadStatus $status={isUploaded ? 'complete' : uploadState?.status || 'pending'}>
													{isUploaded ? (
														<>
															<S.ImageUploadStatusIcon>✓</S.ImageUploadStatusIcon>
															<S.ImageUploadStatusText>Uploaded</S.ImageUploadStatusText>
														</>
													) : uploadState?.status === 'error' ? (
														<>
															<S.ImageUploadStatusIcon>✗</S.ImageUploadStatusIcon>
															<S.ImageUploadStatusText>Failed</S.ImageUploadStatusText>
														</>
													) : uploadState?.status === 'complete' ? (
														<>
															<S.ImageUploadStatusIcon>✓</S.ImageUploadStatusIcon>
															<S.ImageUploadStatusText>Complete</S.ImageUploadStatusText>
														</>
													) : (
														<>
															<S.ImageUploadStatusText>{uploadState?.status || 'pending'}</S.ImageUploadStatusText>
															{uploadState?.progress !== undefined && (
																<S.ImageUploadProgress>
																	<S.ImageUploadProgressFill $progress={uploadState.progress} />
																</S.ImageUploadProgress>
															)}
														</>
													)}
												</S.ImageUploadStatus>
											)}
										</S.ImageCard>
									);
								})}
							</S.ImageGrid>

							{/* Warning about wallet */}
							{!arProvider.wallet && (
								<S.UploadWarning>
									<span>
										Connect your wallet to upload images to Arweave. Images not uploaded will keep their original
										WordPress URLs.
									</span>
								</S.UploadWarning>
							)}

							{/* Warning about failed uploads */}
							{Array.from(imageUploadStates.values()).some((s) => s.status === 'error') && (
								<S.UploadWarning>
									<span>
										Some images failed to upload. They will keep their original WordPress URLs. You can try uploading
										them again or proceed with the import.
									</span>
								</S.UploadWarning>
							)}
						</>
					)}
				</S.PreviewWrapper>

				{errors.length > 0 && (
					<S.ErrorWrapper>
						{errors.map((error, index) => (
							<S.ErrorMessage key={index}>{error}</S.ErrorMessage>
						))}
					</S.ErrorWrapper>
				)}

				<S.Actions>
					<Button type={'primary'} label={language?.back || 'Back'} handlePress={handleReset} disabled={false} />
					<Button
						type={'alt1'}
						label={
							typeof props.submitLabel === 'function'
								? props.submitLabel(selectedPosts.size)
								: props.submitLabel ??
								  (props.createPortal
										? `Create Portal & Import ${selectedPosts.size} post${selectedPosts.size !== 1 ? 's' : ''}`
										: `Import ${selectedPosts.size} post${selectedPosts.size !== 1 ? 's' : ''}`)
						}
						handlePress={handleImport}
						disabled={selectedPosts.size === 0}
						icon={ICONS.import}
						iconLeftAlign
					/>
				</S.Actions>
			</S.Wrapper>
		);
	}

	function getContent() {
		switch (stage) {
			case 'input':
				return renderInputStage();
			case 'extracting':
				return renderExtractingStage();
			case 'preview':
				return renderPreviewStage();
			case 'importing':
				return (
					<S.Wrapper>
						<S.ProgressWrapper>
							<Loader
								message={
									props.importingMessage ??
									(props.createPortal ? 'Creating portal and importing content...' : 'Importing content to portal...')
								}
							/>
							<S.ProgressMessage>This may take a few minutes. Please don't close this window.</S.ProgressMessage>
						</S.ProgressWrapper>
					</S.Wrapper>
				);
			default:
				return null;
		}
	}

	if (props.inline) {
		if (!props.open) return null;
		return (
			<S.InlinePanel>
				{props.title && <S.InlineTitle>{props.title}</S.InlineTitle>}
				{getContent()}
			</S.InlinePanel>
		);
	}

	return (
		<Panel
			open={props.open}
			header={language?.importFromWordPress || 'Import from WordPress'}
			handleClose={props.handleClose}
			width={600}
			className={'modal-wrapper'}
			closeHandlerDisabled={stage === 'extracting' || stage === 'importing'}
		>
			{getContent()}
		</Panel>
	);
}
