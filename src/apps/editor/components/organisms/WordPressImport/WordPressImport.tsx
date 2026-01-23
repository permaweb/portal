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
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';

import * as S from './styles';

type ImportStage = 'input' | 'extracting' | 'preview' | 'importing' | 'complete';
type ContentTab = 'posts' | 'pages' | 'categories' | 'theme';

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
	onImportComplete?: (
		data: PortalImportData,
		selectedPosts: ConvertedPost[],
		selectedPages: ConvertedPost[],
		selectedCategories: Set<string>,
		createCategories: boolean,
		createTopics: boolean
	) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

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
	const [createCategories, setCreateCategories] = React.useState<boolean>(true);
	const [createTopics, setCreateTopics] = React.useState<boolean>(true);
	const [activeTab, setActiveTab] = React.useState<ContentTab>('posts');
	const [errors, setErrors] = React.useState<string[]>([]);

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
			// Categories: default to none selected; user chooses explicitly (including children)
			setSelectedCategories(new Set());
		}
	}, [importData]);

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
		setCreateCategories(true);
		setCreateTopics(true);
		setActiveTab('posts');
		setErrors([]);
		setFetchPosts(true);
		setFetchPages(true);
		setFetchCategories(true);
		setFetchTags(true);
		setFetchTheme(true);
		setPostsCount(10);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, []);

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

	const handleImport = React.useCallback(() => {
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
			props.onImportComplete(
				{
					...importData,
					categories: categoriesToImport,
				},
				postsToImport,
				[],
				selectedCategories,
				createCategories,
				createTopics
			);
		}

		props.handleClose();
	}, [importData, selectedPosts, selectedCategories, createCategories, createTopics, props, addNotification]);

	const getProgressPercentage = React.useCallback(() => {
		if (!progress) return 0;
		if (progress.total === 0) return 0;
		return Math.round((progress.current / progress.total) * 100);
	}, [progress]);

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString();
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
				<S.Section>
					<S.SectionLabel>Import Method</S.SectionLabel>
					<S.SectionInfo>
						Choose how you want to import your WordPress content. You can either import from a live WordPress site URL
						or upload a WordPress export file (.xml).
					</S.SectionInfo>
					<S.CheckboxGroup>
						<Checkbox
							checked={importMethod === 'url'}
							handleSelect={() => {
								setImportMethod('url');
								setWxrFile(null);
								if (fileInputRef.current) fileInputRef.current.value = '';
							}}
							disabled={false}
						/>
						<S.CheckboxLabel
							onClick={() => {
								setImportMethod('url');
								setWxrFile(null);
								if (fileInputRef.current) fileInputRef.current.value = '';
							}}
						>
							Import from URL
						</S.CheckboxLabel>
					</S.CheckboxGroup>
					<S.CheckboxGroup>
						<Checkbox
							checked={importMethod === 'file'}
							handleSelect={() => {
								setImportMethod('file');
								setUrl('');
							}}
							disabled={false}
						/>
						<S.CheckboxLabel
							onClick={() => {
								setImportMethod('file');
								setUrl('');
							}}
						>
							Upload WordPress Export File (.xml)
						</S.CheckboxLabel>
					</S.CheckboxGroup>
				</S.Section>

				{importMethod === 'url' ? (
					<>
						<S.Section>
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
						</S.Section>

						<S.Section>
							<S.SectionLabel>What to Import</S.SectionLabel>
							<S.SectionInfo>Select what content you want to fetch from the WordPress site.</S.SectionInfo>
							<S.CheckboxGroup>
								<Checkbox checked={fetchPosts} handleSelect={() => setFetchPosts(!fetchPosts)} disabled={false} />
								<S.CheckboxLabel onClick={() => setFetchPosts(!fetchPosts)}>
									Posts
									{fetchPosts && (
										<S.CountInputWrapper onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
											<FormField
												value={postsCount.toString()}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
													e.stopPropagation();
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
										</S.CountInputWrapper>
									)}
								</S.CheckboxLabel>
							</S.CheckboxGroup>
							<S.CheckboxGroup>
								<Checkbox checked={fetchPages} handleSelect={() => setFetchPages(!fetchPages)} disabled={false} />
								<S.CheckboxLabel onClick={() => setFetchPages(!fetchPages)}>Pages</S.CheckboxLabel>
							</S.CheckboxGroup>
							<S.CheckboxGroup>
								<Checkbox
									checked={fetchCategories}
									handleSelect={() => setFetchCategories(!fetchCategories)}
									disabled={false}
								/>
								<S.CheckboxLabel onClick={() => setFetchCategories(!fetchCategories)}>Categories</S.CheckboxLabel>
							</S.CheckboxGroup>
							<S.CheckboxGroup>
								<Checkbox checked={fetchTags} handleSelect={() => setFetchTags(!fetchTags)} disabled={false} />
								<S.CheckboxLabel onClick={() => setFetchTags(!fetchTags)}>Tags</S.CheckboxLabel>
							</S.CheckboxGroup>
							<S.CheckboxGroup>
								<Checkbox checked={fetchTheme} handleSelect={() => setFetchTheme(!fetchTheme)} disabled={false} />
								<S.CheckboxLabel onClick={() => setFetchTheme(!fetchTheme)}>Theme</S.CheckboxLabel>
							</S.CheckboxGroup>
						</S.Section>
					</>
				) : (
					<S.Section>
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
							<S.SectionInfo style={{ marginTop: '8px', color: 'var(--color-primary)' }}>
								✓ File selected: {wxrFile.name} ({(wxrFile.size / 1024).toFixed(1)} KB)
							</S.SectionInfo>
						)}
					</S.Section>
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
						<S.PreviewTitle>{importData.name}</S.PreviewTitle>
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
					</S.Tabs>

					{activeTab === 'posts' && (
						<>
							{importData.posts.length > 0 && (
								<S.SelectAllWrapper>
									<Checkbox checked={allPostsSelected} handleSelect={handleSelectAllPosts} disabled={false} />
									<S.PostItemTitle onClick={handleSelectAllPosts} style={{ cursor: 'pointer' }}>
										Select All Posts
									</S.PostItemTitle>
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
									<S.PostItemTitle onClick={handleSelectAllPages} style={{ cursor: 'pointer' }}>
										Select All Pages
									</S.PostItemTitle>
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
									<Checkbox
										checked={createCategories}
										handleSelect={() => setCreateCategories(!createCategories)}
										disabled={false}
									/>
									<S.CheckboxLabel onClick={() => setCreateCategories(!createCategories)}>
										Create Categories
									</S.CheckboxLabel>
								</S.CheckboxGroup>
								<S.CheckboxGroup>
									<Checkbox
										checked={createTopics}
										handleSelect={() => setCreateTopics(!createTopics)}
										disabled={false}
									/>
									<S.CheckboxLabel onClick={() => setCreateTopics(!createTopics)}>Create Topics (Tags)</S.CheckboxLabel>
								</S.CheckboxGroup>
							</S.Section>
							{importData.categories.length > 0 && (
								<>
									<S.Section>
										<S.SectionInfo>
											Select which categories to create. Parent and child categories can be selected individually.
										</S.SectionInfo>
									</S.Section>
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
										<S.PostItemTitle onClick={handleSelectAllCategories} style={{ cursor: 'pointer' }}>
											Select All Categories
										</S.PostItemTitle>
									</S.SelectAllWrapper>
									<S.PostList>
										{importData.categories.map((category) => {
											const renderCategory = (cat: any, depth = 0) => (
												<React.Fragment key={cat.id}>
													<S.PostItem
														$selected={selectedCategories.has(cat.id)}
														onClick={() => handleToggleCategory(cat.id)}
														style={{ paddingLeft: `${depth * 20 + 10}px` }}
													>
														<Checkbox
															checked={selectedCategories.has(cat.id)}
															handleSelect={() => handleToggleCategory(cat.id)}
															disabled={false}
														/>
														<S.PostItemContent>
															<S.PostItemTitle>{cat.name}</S.PostItemTitle>
															{cat.metadata?.description && <S.PostItemMeta>{cat.metadata.description}</S.PostItemMeta>}
														</S.PostItemContent>
													</S.PostItem>
													{cat.children && cat.children.length > 0 && (
														<>{cat.children.map((child: any) => renderCategory(child, depth + 1))}</>
													)}
												</React.Fragment>
											);
											return renderCategory(category);
										})}
									</S.PostList>
								</>
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
							props.createPortal
								? `Create Portal & Open ${selectedPosts.size} post${selectedPosts.size !== 1 ? 's' : ''} in editor`
								: `Open ${selectedPosts.size} post${selectedPosts.size !== 1 ? 's' : ''} in editor`
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
				return <Loader message={`${language?.importing || 'Importing'}...`} />;
			default:
				return null;
		}
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
