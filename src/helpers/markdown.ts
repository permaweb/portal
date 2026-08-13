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
