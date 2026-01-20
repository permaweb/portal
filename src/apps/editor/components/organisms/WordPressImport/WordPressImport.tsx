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
	onImportComplete?: (data: PortalImportData, selectedPosts: ConvertedPost[], selectedPages: ConvertedPost[]) => void;
}) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [url, setUrl] = React.useState<string>('');
	const [stage, setStage] = React.useState<ImportStage>('input');
	const [progress, setProgress] = React.useState<WordPressExtractionProgress | null>(null);
	const [extractionResult, setExtractionResult] = React.useState<WordPressExtractionResult | null>(null);
	const [importData, setImportData] = React.useState<PortalImportData | null>(null);
	const [selectedPosts, setSelectedPosts] = React.useState<Set<number>>(new Set());
	const [selectedPages, setSelectedPages] = React.useState<Set<number>>(new Set());
	const [activeTab, setActiveTab] = React.useState<ContentTab>('posts');
	const [errors, setErrors] = React.useState<string[]>([]);

	React.useEffect(() => {
		if (!props.open) {
			handleReset();
		}
	}, [props.open]);

	React.useEffect(() => {
		if (importData) {
			setSelectedPosts(new Set(importData.posts.map((p) => p.wpId)));
			setSelectedPages(new Set(importData.pages.map((p) => p.wpId)));
		}
	}, [importData]);

	const handleReset = React.useCallback(() => {
		setUrl('');
		setStage('input');
		setProgress(null);
		setExtractionResult(null);
		setImportData(null);
		setSelectedPosts(new Set());
		setSelectedPages(new Set());
		setActiveTab('posts');
		setErrors([]);
	}, []);

	const handleExtract = React.useCallback(async () => {
		if (!url.trim()) {
			addNotification('Please enter a WordPress site URL', 'warning');
			return;
		}

		setStage('extracting');
		setErrors([]);

		try {
			const client = new WordPressClient(url);

			const result = await client.extractAll((progressUpdate) => {
				setProgress(progressUpdate);
			});

			setExtractionResult(result);

			if (result.errors.length > 0) {
				setErrors(result.errors);
			}

			if (result.posts.length === 0 && result.pages.length === 0) {
				setErrors((prev) => [...prev, 'No content found on this WordPress site']);
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
	}, [url, addNotification]);

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

	const handleImport = React.useCallback(() => {
		if (!importData) return;

		const postsToImport = importData.posts.filter((p) => selectedPosts.has(p.wpId));
		const pagesToImport = importData.pages.filter((p) => selectedPages.has(p.wpId));

		if (postsToImport.length === 0 && pagesToImport.length === 0) {
			addNotification('Please select at least one post or page to import', 'warning');
			return;
		}

		if (props.onImportComplete) {
			props.onImportComplete(importData, postsToImport, pagesToImport);
		}

		setStage('complete');
		addNotification(
			`Successfully prepared ${postsToImport.length} posts and ${pagesToImport.length} pages for import`,
			'success'
		);
		props.handleClose();
	}, [importData, selectedPosts, selectedPages, props, addNotification]);

	const getProgressPercentage = React.useCallback(() => {
		if (!progress) return 0;
		if (progress.total === 0) return 0;
		return Math.round((progress.current / progress.total) * 100);
	}, [progress]);

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString();
	}

	function renderInputStage() {
		return (
			<S.Wrapper>
				<S.Section>
					<S.SectionLabel>{language?.wordpressUrl || 'WordPress Site URL'}</S.SectionLabel>
					<S.SectionInfo>
						Enter the URL of the WordPress site you want to import content from. The site must have the REST API enabled
						(enabled by default on most WordPress sites).
					</S.SectionInfo>
					<FormField
						value={url}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
						placeholder="https://example.com"
						disabled={false}
						invalid={{ status: false, message: null }}
					/>
				</S.Section>

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
						disabled={!url.trim()}
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
							Theme {importData.theme ? '(Found)' : ''}
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
						<S.PostList>
							{importData.categories.map((category) => (
								<S.PostItem key={category.id} $selected={true} onClick={() => {}}>
									<S.PostItemContent>
										<S.PostItemTitle>{category.name}</S.PostItemTitle>
										{category.metadata.description && <S.PostItemMeta>{category.metadata.description}</S.PostItemMeta>}
									</S.PostItemContent>
								</S.PostItem>
							))}
						</S.PostList>
					)}

					{activeTab === 'theme' && (
						<S.ThemePreview>
							{importData.extractedTheme ? (
								<>
									<S.ThemeSection>
										<S.ThemeSectionTitle>Extracted Colors</S.ThemeSectionTitle>
										<S.ExtractedColors>
											{Object.entries(importData.extractedTheme.colors).map(([key, value]) =>
												value ? (
													<S.ExtractedColorItem key={key}>
														<S.ExtractedColorSwatch $color={value} />
														<S.ExtractedColorLabel>{key}</S.ExtractedColorLabel>
														<S.ExtractedColorValue>{value}</S.ExtractedColorValue>
													</S.ExtractedColorItem>
												) : null
											)}
										</S.ExtractedColors>
									</S.ThemeSection>

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
						label={`Import ${selectedPosts.size + selectedPages.size} items`}
						handlePress={handleImport}
						disabled={selectedPosts.size === 0 && selectedPages.size === 0}
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
