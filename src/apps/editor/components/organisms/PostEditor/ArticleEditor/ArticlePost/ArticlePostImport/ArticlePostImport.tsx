import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Loader } from 'components/atoms/Loader';
import { Panel } from 'components/atoms/Panel';
import { ICONS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function ArticlePostImport() {
	const dispatch = useDispatch();
	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const [showOptions, setShowOptions] = React.useState<boolean>(false);
	const [assetId, setAssetId] = React.useState<string>('');
	const [loading, setLoading] = React.useState<boolean>(false);

	const parseInlineMarkup = (text: string): string => {
		let result = text;

		// Bold: **text** or __text__
		result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

		// Italic: *text* or _text_ (but not if part of **)
		result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
		result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

		// Inline code: `code`
		result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

		// Links: [text](url)
		result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

		// Strikethrough: ~~text~~
		result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

		return result;
	};

	const parseMarkdownToBlocks = (markdown: string): ArticleBlockType[] => {
		const blocks: ArticleBlockType[] = [];
		const lines = markdown.split('\n');
		let i = 0;

		while (i < lines.length) {
			const line = lines[i].trim();

			// Skip empty lines
			if (!line) {
				i++;
				continue;
			}

			// Skip frontmatter (--- blocks at the start)
			if (i === 0 && line === '---') {
				i++;
				while (i < lines.length && lines[i].trim() !== '---') {
					i++;
				}
				i++; // Skip closing ---
				continue;
			}

			// Skip import statements
			if (line.startsWith('import ')) {
				i++;
				continue;
			}

			// Headers
			if (line.startsWith('#')) {
				const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
				if (headerMatch) {
					const level = headerMatch[1].length;
					const content = parseInlineMarkup(headerMatch[2]);
					blocks.push({
						id: Date.now().toString() + '-' + i,
						type: `header-${level}` as ArticleBlockEnum,
						content: content,
					});
					i++;
					continue;
				}
			}

			// Code blocks
			if (line.startsWith('```')) {
				const codeLines: string[] = [];
				i++; // Skip opening ```
				while (i < lines.length && !lines[i].trim().startsWith('```')) {
					codeLines.push(lines[i]);
					i++;
				}
				blocks.push({
					id: Date.now().toString() + '-' + i,
					type: ArticleBlockEnum.Code,
					content: codeLines.join('\n'),
				});
				i++; // Skip closing ```
				continue;
			}

			// Quote blocks
			if (line.startsWith('>')) {
				const quoteLines: string[] = [];
				while (i < lines.length && lines[i].trim().startsWith('>')) {
					quoteLines.push(lines[i].trim().substring(1).trim());
					i++;
				}
				blocks.push({
					id: Date.now().toString() + '-' + i,
					type: ArticleBlockEnum.Quote,
					content: parseInlineMarkup(quoteLines.join('\n')),
				});
				continue;
			}

			// HTML/JSX blocks - detect opening tags and capture until closing tag
			if (line.startsWith('<') && !line.startsWith('</')) {
				const tagMatch = line.match(/^<(\w+)(?:\s|>)/);
				if (tagMatch) {
					const tagName = tagMatch[1];
					const htmlLines: string[] = [lines[i]];
					i++;

					// Check if it's a self-closing tag
					const isSelfClosing = lines[i - 1].trim().endsWith('/>');

					if (!isSelfClosing) {
						// Capture until we find the closing tag or reach a balanced state
						let depth = 1;
						while (i < lines.length && depth > 0) {
							htmlLines.push(lines[i]);
							const currentLine = lines[i].trim();

							// Count opening tags
							const openMatches = currentLine.match(new RegExp(`<${tagName}(?:\\s|>)`, 'g'));
							if (openMatches) depth += openMatches.length;

							// Count closing tags
							const closeMatches = currentLine.match(new RegExp(`</${tagName}>`, 'g'));
							if (closeMatches) depth -= closeMatches.length;

							i++;
						}
					}

					blocks.push({
						id: Date.now().toString() + '-' + i,
						type: ArticleBlockEnum.HTML,
						content: htmlLines.join('\n'),
					});
					continue;
				}
			}

			// Unordered lists
			if (line.match(/^[-*+]\s+/)) {
				const listItems: string[] = [];
				while (i < lines.length) {
					const currentLine = lines[i].trim();

					// Check if it's a list item
					if (currentLine.match(/^[-*+]\s+/)) {
						const itemContent = currentLine.replace(/^[-*+]\s+/, '');
						listItems.push(`<li>${parseInlineMarkup(itemContent)}</li>`);
						i++;
					}
					// Allow empty lines between list items
					else if (currentLine === '' && i + 1 < lines.length && lines[i + 1].trim().match(/^[-*+]\s+/)) {
						i++;
					}
					// End of list
					else {
						break;
					}
				}
				blocks.push({
					id: Date.now().toString() + '-' + i,
					type: ArticleBlockEnum.UnorderedList,
					content: listItems.join(''),
				});
				continue;
			}

			// Ordered lists
			if (line.match(/^\d+\.\s+/)) {
				const listItems: string[] = [];
				while (i < lines.length) {
					const currentLine = lines[i].trim();

					// Check if it's a list item
					if (currentLine.match(/^\d+\.\s+/)) {
						const itemContent = currentLine.replace(/^\d+\.\s+/, '');
						listItems.push(`<li>${parseInlineMarkup(itemContent)}</li>`);
						i++;
					}
					// Allow empty lines between list items
					else if (currentLine === '' && i + 1 < lines.length && lines[i + 1].trim().match(/^\d+\.\s+/)) {
						i++;
					}
					// End of list
					else {
						break;
					}
				}
				blocks.push({
					id: Date.now().toString() + '-' + i,
					type: ArticleBlockEnum.OrderedList,
					content: listItems.join(''),
				});
				continue;
			}

			// Paragraph (default)
			blocks.push({
				id: Date.now().toString() + '-' + i,
				type: ArticleBlockEnum.Paragraph,
				content: parseInlineMarkup(line),
			});
			i++;
		}

		return blocks;
	};

	const handleMarkdownUpload = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.md')) {
			addNotification(language.markdownFileOnly, 'warning');
			return;
		}

		setLoading(true);
		try {
			const text = await file.text();
			const blocks = parseMarkdownToBlocks(text);

			const existingContent = currentPost.data.content || [];
			const updatedContent = [...existingContent, ...blocks];

			dispatch(currentPostUpdate({ field: 'content', value: updatedContent }));

			addNotification(language.markdownImportSuccess, 'success');
			setShowOptions(false);
		} catch (e: any) {
			console.error(e);
			addNotification(e.message ?? language.markdownImportError, 'warning');
		} finally {
			setLoading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	React.useEffect(() => {
		if (checkValidAddress(assetId)) {
			(async function () {
				setLoading(true);
				try {
					const response = await permawebProvider.libs.getAtomicAsset(assetId);
					console.log(response);
					if (response?.metadata?.content) {
						const existingContent = currentPost.data.content || [];
						const updatedContent = [...existingContent, ...response.metadata.content];

						dispatch(currentPostUpdate({ field: 'content', value: updatedContent }));
					}
					addNotification(language.contentImported, 'success');
				} catch (e: any) {
					console.error(e);
					addNotification(e.message ?? language.errorImportingPost, 'warning');
				}
				setShowOptions(false);
				setLoading(false);
				setAssetId('');
			})();
		}
	}, [assetId]);

	return (
		<>
			{loading && <Loader message={`${language.loading}...`} />}
			<S.Wrapper>
				<Button
					type={'alt1'}
					label={language.import}
					handlePress={() => setShowOptions(true)}
					disabled={false}
					icon={ICONS.import}
					iconLeftAlign
					height={40}
					fullWidth
				/>
			</S.Wrapper>
			<input ref={fileInputRef} type={'file'} accept={'.md'} style={{ display: 'none' }} onChange={handleFileChange} />
			<Panel
				open={showOptions}
				header={language.importFromExistingPost}
				handleClose={() => setShowOptions(false)}
				width={500}
				className={'modal-wrapper'}
				closeHandlerDisabled
			>
				<S.PanelWrapper>
					<S.PanelInfo>
						<span>{language.importFromExistingPostInfo}</span>
					</S.PanelInfo>
					<S.PanelSection>
						<FormField
							value={assetId}
							onChange={(e: any) => setAssetId(e.target.value)}
							label={language?.postId}
							invalid={{ status: assetId ? !checkValidAddress(assetId) : false, message: null }}
							disabled={false}
							hideErrorMessage
							tooltip={'Import from an existing portal post.'}
							noMargin
						/>
					</S.PanelSection>
					<S.PanelSectionDivider>
						<div className={'divider'} />
						<span>Or</span>
						<div className={'divider'} />
					</S.PanelSectionDivider>
					<S.PanelSection>
						<Button
							type={'alt1'}
							label={language.markdown}
							handlePress={handleMarkdownUpload}
							disabled={false}
							height={42.5}
							fullWidth
						/>
					</S.PanelSection>
					<S.PanelActions>
						<Button
							type={'primary'}
							label={language.close}
							handlePress={() => setShowOptions(false)}
							disabled={false}
						/>
					</S.PanelActions>
				</S.PanelWrapper>
			</Panel>
		</>
	);
}
