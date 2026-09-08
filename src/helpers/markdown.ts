import { ArticleBlockEnum, ArticleBlockType } from './types';

export type MarkdownFrontmatterValue = string | number | boolean | MarkdownFrontmatterValue[];

export type MarkdownDocument = {
	frontmatter: Record<string, MarkdownFrontmatterValue>;
	body: string;
};

function stripQuotes(value: string) {
	const trimmed = value.trim();
	if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function parseScalar(value: string): string | number | boolean {
	const parsed = stripQuotes(value);
	if (/^(true|false)$/i.test(parsed)) return parsed.toLowerCase() === 'true';
	if (/^-?\d+(\.\d+)?$/.test(parsed)) return Number(parsed);
	return parsed;
}

function parseInlineArray(value: string): MarkdownFrontmatterValue[] {
	const inner = value.trim().slice(1, -1).trim();
	if (!inner) return [];
	return inner
		.split(',')
		.map((entry) => parseScalar(entry.trim()))
		.filter((entry) => entry !== '');
}

function parseFrontmatter(value: string) {
	const lines = value.split('\n');
	const frontmatter: Record<string, MarkdownFrontmatterValue> = {};

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		if (!line.trim() || line.trim().startsWith('#')) continue;

		const match = line.match(/^([A-Za-z0-9_-]+):(.*)$/);
		if (!match) continue;

		const key = match[1];
		const valuePart = match[2].trim();
		if (!valuePart) {
			const list: MarkdownFrontmatterValue[] = [];
			let nextIndex = index + 1;
			while (nextIndex < lines.length) {
				const listMatch = lines[nextIndex].match(/^\s*-\s+(.*)$/);
				if (!listMatch) break;
				list.push(parseScalar(listMatch[1].trim()));
				nextIndex += 1;
			}
			frontmatter[key] = list.length > 0 ? list : '';
			index = nextIndex - 1;
			continue;
		}

		frontmatter[key] =
			valuePart.startsWith('[') && valuePart.endsWith(']') ? parseInlineArray(valuePart) : parseScalar(valuePart);
	}

	return frontmatter;
}

export function extractMarkdownDocument(markdown: string): MarkdownDocument {
	const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
	if (!normalized.startsWith('---\n')) return { frontmatter: {}, body: normalized };

	const end = normalized.indexOf('\n---\n', 4);
	if (end < 0) return { frontmatter: {}, body: normalized };

	return {
		frontmatter: parseFrontmatter(normalized.slice(4, end)),
		body: normalized.slice(end + 5),
	};
}

export function getMarkdownFeaturedImage(frontmatter: MarkdownDocument['frontmatter']) {
	const value = frontmatter.banner ?? frontmatter.thumbnail ?? frontmatter.featuredImage ?? frontmatter.featured_image;
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getFrontmatterString(frontmatter: MarkdownDocument['frontmatter'], keys: string[]) {
	const normalized = new Map(
		Object.entries(frontmatter).map(([key, value]) => [key.toLowerCase().replace(/[-_]/g, ''), value])
	);
	for (const key of keys) {
		const value = normalized.get(key.toLowerCase().replace(/[-_]/g, ''));
		if (typeof value === 'string' && value.trim()) return value.trim();
	}
	return null;
}

export function getMarkdownTitle(document: MarkdownDocument) {
	const frontmatterTitle = getFrontmatterString(document.frontmatter, ['title', 'name']);
	if (frontmatterTitle) return frontmatterTitle;
	const heading = document.body.match(/^#\s+(.+)$/m)?.[1]?.trim();
	return heading || null;
}

export function getMarkdownDescription(frontmatter: MarkdownDocument['frontmatter']) {
	return getFrontmatterString(frontmatter, ['description', 'desc', 'excerpt', 'summary']);
}

function parseInlineMarkup(text: string): string {
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
}

function escapeImageAttribute(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function parseMarkdownToBlocks(markdown: string): ArticleBlockType[] {
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

		// Standalone images must be parsed before inline markup can alter their URLs.
		const image = line.match(/^!\[([^\]]*)\]\(\s*(?:<([^>]+)>|(\S+?))(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)$/);
		if (image) {
			const alt = image[1];
			const url = image[2] || image[3];
			const style = 'display: flex; flex-direction: column; justify-content: center; max-width: 100%;';
			blocks.push({
				id: Date.now().toString() + '-' + i,
				type: ArticleBlockEnum.Image,
				content: `<div class="portal-media-wrapper portal-media-column" style="${style}">\n  <img src="${escapeImageAttribute(
					url
				)}" alt="${escapeImageAttribute(alt)}">\n</div>`,
				data: { url, caption: '', alt, alignment: 'portal-media-column', mediaAlign: 'center' },
			});
			i++;
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
}
