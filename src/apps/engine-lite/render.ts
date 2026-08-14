import type { LitePortal, LitePost } from './data';

const ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;
const LUNAR_EXPLORER = 'https://lunar.arweave.net/#/explorer';
const PORTAL_LOGO = `<svg viewBox="0 0 256 256" aria-hidden="true">
	<path d="M84.27,171.73l-55.09-20.3a7.92,7.92,0,0,1,0-14.86l55.09-20.3,20.3-55.09a7.92,7.92,0,0,1,14.86,0l20.3,55.09,55.09,20.3a7.92,7.92,0,0,1,0,14.86l-55.09,20.3-20.3,55.09a7.92,7.92,0,0,1-14.86,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" />
	<line x1="176" y1="16" x2="176" y2="64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" />
	<line x1="224" y1="72" x2="224" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" />
	<line x1="152" y1="40" x2="200" y2="40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" />
	<line x1="208" y1="88" x2="240" y2="88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24" />
</svg>`;

export type FeedFilters = {
	category: string | null;
	search: string;
};

export type LiteThemeMode = 'system' | 'light' | 'dark';

export function escapeHTML(value: unknown) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function walletLabel(address: string | null) {
	if (!address) return 'Connect Wallet';
	return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

function themeLabel(mode: LiteThemeMode) {
	return `${mode.charAt(0).toUpperCase()}${mode.slice(1)} theme`;
}

function themeIcon(mode: LiteThemeMode) {
	if (mode === 'light') {
		return `<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
		</svg>`;
	}
	if (mode === 'dark') {
		return `<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />
		</svg>`;
	}
	return `<svg viewBox="0 0 24 24" aria-hidden="true">
		<rect x="3" y="4" width="18" height="13" rx="2" />
		<path d="M8 21h8M12 17v4" />
	</svg>`;
}

function themeOption(mode: LiteThemeMode, activeMode: LiteThemeMode) {
	const label = themeLabel(mode);
	return `<button class="lite-theme-option${
		mode === activeMode ? ' is-active' : ''
	}" type="button" data-theme-mode="${mode}" title="${escapeHTML(label)}" aria-label="${escapeHTML(
		label
	)}" aria-pressed="${mode === activeMode}">${themeIcon(mode)}</button>`;
}

export function renderShell(
	content: string,
	portal: Pick<LitePortal, 'name' | 'logo'>,
	homeHref: string,
	address: string | null,
	themeMode: LiteThemeMode
) {
	const logo = portal.logo ? `<img src="${escapeHTML(portal.logo)}" alt="${escapeHTML(portal.name)}" />` : PORTAL_LOGO;
	const walletContent = address
		? `<span class="lite-wallet-address">${escapeHTML(
				walletLabel(address)
		  )}</span><span class="lite-wallet-disconnect">Disconnect</span>`
		: '<span>Connect Wallet</span>';
	return `<div class="lite-shell">
		<header class="lite-site-header">
			<div class="lite-site-header-inner">
				<a class="lite-site-logo${portal.logo ? '' : ' is-fallback'}" href="${escapeHTML(homeHref)}" aria-label="${escapeHTML(
		portal.name
	)} home">
					${logo}
				</a>
				<button class="lite-wallet-button${address ? ' is-connected' : ''}" type="button" data-wallet-connect title="${
		address ? escapeHTML(address) : 'Connect Wander wallet'
	}" aria-label="${address ? 'Disconnect wallet' : 'Connect Wander wallet'}">${walletContent}</button>
			</div>
		</header>
		${content}
		<footer class="lite-site-footer">
			<div class="lite-site-footer-inner">
				<p>${escapeHTML(portal.name)}</p>
				<div class="lite-theme-toggle" role="group" aria-label="Theme">
					${themeOption('light', themeMode)}
					${themeOption('system', themeMode)}
					${themeOption('dark', themeMode)}
				</div>
			</div>
		</footer>
	</div>`;
}

function safeRichHTML(value: unknown) {
	const template = document.createElement('template');
	template.innerHTML = String(value ?? '');
	template.content.querySelectorAll('script, object, embed').forEach((node) => node.remove());
	template.content.querySelectorAll('*').forEach((element) => {
		for (const attribute of Array.from(element.attributes)) {
			if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
			if ((attribute.name === 'href' || attribute.name === 'src') && /^javascript:/i.test(attribute.value.trim())) {
				element.removeAttribute(attribute.name);
			}
		}
		if (element.tagName === 'A') {
			element.setAttribute('rel', 'noopener noreferrer');
		}
	});
	return template.innerHTML;
}

function imageMarkup(post: LitePost, className: string, eager = false, fallbackVariant?: number) {
	if (!post.image) {
		const seed = `${post.id}:${post.slug}:${post.title}`;
		const variant =
			fallbackVariant ?? Array.from(seed).reduce((value, character) => value + character.charCodeAt(0), 0) % 4;
		return `<div class="${className} lite-image-fallback lite-gradient-${variant}" role="img" aria-label="${escapeHTML(
			`${post.title} placeholder image`
		)}"></div>`;
	}
	return `<div class="${className}"><img src="${escapeHTML(post.image)}" alt="" ${
		eager ? 'loading="eager"' : 'loading="lazy"'
	} /></div>`;
}

function metaMarkup(post: LitePost) {
	return `<div class="lite-meta"><span class="lite-category">${escapeHTML(post.category)}</span>${
		post.dateLabel ? `<span class="lite-dot"></span><span>${escapeHTML(post.dateLabel)}</span>` : ''
	}</div>`;
}

function authorMarkup(author: string) {
	if (!ARWEAVE_ID.test(author)) return `<span>${escapeHTML(author)}</span>`;
	return `<a class="lite-author-link" href="${LUNAR_EXPLORER}/${encodeURIComponent(
		author
	)}" target="_blank" rel="noopener noreferrer">${escapeHTML(author)}</a>`;
}

function cardMarkup(post: LitePost, href: string, fallbackVariant: number) {
	return `<a class="lite-card-link" href="${escapeHTML(href)}">
		${imageMarkup(post, 'lite-card-image', false, fallbackVariant)}
		<div class="lite-card-copy">
			${metaMarkup(post)}
			<h2 class="lite-title">${escapeHTML(post.title)}</h2>
			${post.excerpt ? `<p class="lite-excerpt">${escapeHTML(post.excerpt)}</p>` : ''}
		</div>
	</a>`;
}

function featuredMarkup(post: LitePost, href: string, fallbackVariant: number) {
	return `<section class="lite-featured">
		<span class="lite-featured-label">Pinned</span>
		<a class="lite-featured-link" href="${escapeHTML(href)}">
			${imageMarkup(post, 'lite-featured-image', true, fallbackVariant)}
			<article class="lite-featured-copy">
				<div class="lite-featured-copy-inner">
					${metaMarkup(post)}
					<h2 class="lite-title">${escapeHTML(post.title)}</h2>
					${post.excerpt ? `<p class="lite-excerpt">${escapeHTML(post.excerpt)}</p>` : ''}
				</div>
			</article>
		</a>
	</section>`;
}

function selectedFeaturedPost(portal: LitePortal) {
	for (const featuredId of portal.featuredPosts) {
		const match = portal.posts.find((post) => post.id === featuredId || post.slug === featuredId);
		if (match) return match;
	}
	return null;
}

export function renderFeed(portal: LitePortal, filters: FeedFilters, postHref: (post: LitePost) => string) {
	if (!portal.posts.length) return '<div class="lite-empty">No published posts yet.</div>';
	const pinned = selectedFeaturedPost(portal);

	const categories = [...new Set(portal.posts.map((post) => post.category).filter(Boolean))].sort((a, b) =>
		a.localeCompare(b)
	);
	const query = filters.search.trim().toLowerCase();
	const posts = portal.posts.filter((post) => {
		if (pinned && post.id === pinned.id) return false;
		if (filters.category && post.category !== filters.category) return false;
		if (!query) return true;
		return [post.title, post.excerpt, post.author, post.category].join(' ').toLowerCase().includes(query);
	});

	const filterButton = (label: string, category: string | null) =>
		`<button class="lite-filter${
			filters.category === category ? ' is-active' : ''
		}" type="button" data-category="${escapeHTML(category ?? '')}">${escapeHTML(label)}</button>`;

	return `<main class="lite-feed">
		${pinned ? featuredMarkup(pinned, postHref(pinned), 0) : ''}
		<div class="lite-controls">
			<div class="lite-filters">
				${filterButton('All', null)}
				${categories.map((category) => filterButton(category, category)).join('')}
			</div>
			<label class="lite-search">
				<span class="lite-search-icon" aria-hidden="true"></span>
				<span class="sr-only">Search posts</span>
				<input type="search" placeholder="Search..." aria-label="Search posts" value="${escapeHTML(filters.search)}" />
			</label>
		</div>
		${
			posts.length
				? `<div class="lite-grid">${posts
						.map((post, index) => cardMarkup(post, postHref(post), (index + (pinned ? 1 : 0)) % 4))
						.join('')}</div>`
				: '<div class="lite-empty">No posts found.</div>'
		}
	</main>`;
}

function textBlock(tag: string, content: unknown, style?: unknown) {
	const allowedStyle = style && typeof style === 'object' ? styleToString(style as Record<string, unknown>) : '';
	return `<${tag}${allowedStyle ? ` style="${escapeHTML(allowedStyle)}"` : ''}>${safeRichHTML(content)}</${tag}>`;
}

function styleToString(style: Record<string, unknown>) {
	return Object.entries(style)
		.filter(([key, value]) => /^[-a-zA-Z]+$/.test(key) && ['string', 'number'].includes(typeof value))
		.map(([key, value]) => `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${String(value)}`)
		.join(';');
}

function renderBlock(entry: any) {
	const type = String(entry?.type || '').toLowerCase();
	const content = entry?.content ?? '';
	switch (type) {
		case 'header-1':
			return textBlock('h1', content, entry.data);
		case 'header-2':
			return textBlock('h2', content, entry.data);
		case 'header-3':
			return textBlock('h3', content, entry.data);
		case 'header-4':
			return textBlock('h4', content, entry.data);
		case 'header-5':
			return textBlock('h5', content, entry.data);
		case 'header-6':
			return textBlock('h6', content, entry.data);
		case 'paragraph':
			return textBlock('p', content, entry.data);
		case 'quote':
			return textBlock('blockquote', content, entry.data);
		case 'unordered-list':
			return textBlock('ul', content, entry.data);
		case 'ordered-list':
			return textBlock('ol', content, entry.data);
		case 'code':
			return `<pre><code>${safeRichHTML(content)}</code></pre>`;
		case 'image':
		case 'video':
		case 'html':
		case 'table':
		case 'embed':
			return safeRichHTML(content);
		case 'divider-solid':
			return '<hr class="lite-divider" />';
		case 'divider-dashed':
			return '<hr class="lite-divider is-dashed" />';
		case 'spacer-vertical':
			return `<div style="height:${Math.max(0, Number(entry?.data?.height) || 50)}px"></div>`;
		case 'spacer-horizontal':
		case 'monetizationbutton':
		case 'supporters':
			return '';
		default:
			return content ? textBlock('p', content) : '';
	}
}

function markdownURL(value: string) {
	const url = value.trim();
	return /^(?:javascript|vbscript|data):/i.test(url) ? '#' : escapeHTML(url);
}

function inlineMarkdown(value: string) {
	const tokens: string[] = [];
	const tokenized = value.replace(/(`[^`]+`|!\[[^\]]*\]\([^\s)]+\)|\[[^\]]+\]\([^\s)]+\))/g, (token) => {
		let markup = '';
		if (token.startsWith('`')) {
			markup = `<code>${escapeHTML(token.slice(1, -1))}</code>`;
		} else {
			const image = token.startsWith('!');
			const match = token.match(/^!?\[([^\]]*)\]\(([^)]+)\)$/);
			if (match) {
				markup = image
					? `<img src="${markdownURL(match[2])}" alt="${escapeHTML(match[1])}" loading="lazy" />`
					: `<a href="${markdownURL(match[2])}" rel="noopener noreferrer">${escapeHTML(match[1])}</a>`;
			}
		}
		const index = tokens.push(markup || escapeHTML(token)) - 1;
		return `\u0000${index}\u0000`;
	});

	return escapeHTML(tokenized)
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/__([^_]+)__/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>')
		.replace(/_([^_]+)_/g, '<em>$1</em>')
		.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function renderMarkdown(content: string) {
	const lines = content.replace(/\r\n?/g, '\n').split('\n');
	const blocks: string[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];
		if (!line.trim()) {
			index += 1;
			continue;
		}

		const fence = line.match(/^\s*```([^\s`]*)\s*$/);
		if (fence) {
			const code: string[] = [];
			index += 1;
			while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) code.push(lines[index++]);
			if (index < lines.length) index += 1;
			blocks.push(
				`<pre><code${fence[1] ? ` class="language-${escapeHTML(fence[1])}"` : ''}>${escapeHTML(
					code.join('\n')
				)}</code></pre>`
			);
			continue;
		}

		const heading = line.match(/^\s*(#{1,6})\s+(.+)$/);
		if (heading) {
			const level = heading[1].length;
			blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
			index += 1;
			continue;
		}

		if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
			blocks.push('<hr class="lite-divider" />');
			index += 1;
			continue;
		}

		const list = line.match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/);
		if (list) {
			const ordered = Boolean(list[2]);
			const items: string[] = [];
			const pattern = ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-+*]\s+(.+)$/;
			while (index < lines.length) {
				const item = lines[index].match(pattern);
				if (!item) break;
				items.push(`<li>${inlineMarkdown(item[1])}</li>`);
				index += 1;
			}
			const tag = ordered ? 'ol' : 'ul';
			blocks.push(`<${tag}>${items.join('')}</${tag}>`);
			continue;
		}

		if (/^\s*>/.test(line)) {
			const quote: string[] = [];
			while (index < lines.length && /^\s*>/.test(lines[index])) {
				quote.push(lines[index++].replace(/^\s*>\s?/, ''));
			}
			blocks.push(`<blockquote>${inlineMarkdown(quote.join('<br />'))}</blockquote>`);
			continue;
		}

		const paragraph = [line.trim()];
		index += 1;
		while (index < lines.length && lines[index].trim()) {
			if (/^\s*(?:```|#{1,6}\s|>|[-+*]\s+|\d+\.\s+)/.test(lines[index])) break;
			paragraph.push(lines[index++].trim());
		}
		blocks.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
	}

	return blocks.join('');
}

function renderContent(content: unknown, fallback: string) {
	if (Array.isArray(content)) return content.map(renderBlock).join('');
	if (typeof content === 'string' && content.trim()) {
		if (/<[a-z][\s\S]*>/i.test(content)) return safeRichHTML(content);
		return renderMarkdown(content);
	}
	return `<p>${escapeHTML(fallback)}</p>`;
}

export function renderPost(post: LitePost, homeHref: string) {
	return `<main class="lite-post-page">
		<article class="lite-article">
			<div class="lite-post-kicker">
				<span class="lite-kicker-pill">${escapeHTML(post.category)}</span>
				${post.dateLabel ? `<span class="lite-dot"></span><span class="lite-meta">${escapeHTML(post.dateLabel)}</span>` : ''}
			</div>
			<h1 class="lite-post-title">${escapeHTML(post.title)}</h1>
			${post.excerpt ? `<p class="lite-post-subtitle">${escapeHTML(post.excerpt)}</p>` : ''}
			${imageMarkup(post, 'lite-hero-image', true)}
			<div class="lite-byline">
				${authorMarkup(post.author)}
				<span class="lite-dot"></span>
				<span>${escapeHTML(post.readTime)}</span>
			</div>
			<section class="lite-rich-text">${renderContent(post.content, post.excerpt)}</section>
			<div class="lite-back"><a href="${escapeHTML(homeHref)}">&lt; View All</a></div>
		</article>
	</main>`;
}
