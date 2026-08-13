import { fetchPortal, findPost, hydratePost, isArweaveId, type LitePortal, type LitePost } from './data';
import { escapeHTML, renderFeed, renderPost } from './render';
import styles from './styles.css?inline';
import { getLiteFontStylesheet, getLiteThemeVars } from './theme';

const root = document.getElementById('portal');

if (!root) throw new Error('Engine Lite requires a #portal element.');

const style = document.createElement('style');
style.dataset.engineLite = 'true';
style.textContent = styles;
document.head.appendChild(style);

let portal: LitePortal | null = null;
let portalId = '';
let selectedCategory: string | null = null;
let searchQuery = '';

function hashParts() {
	return window.location.hash
		.replace(/^#\/?/, '')
		.split('/')
		.map((part) => decodeURIComponent(part))
		.filter(Boolean);
}

function portalIdFromLocation() {
	const params = new URLSearchParams(window.location.search);
	const explicit = params.get('portal') || params.get('portalId');
	if (explicit && isArweaveId(explicit)) return explicit;

	const pathId = window.location.pathname.split('/').filter(Boolean)[0];
	if (pathId && isArweaveId(pathId)) return pathId;

	const hashId = hashParts()[0];
	return hashId && isArweaveId(hashId) ? hashId : '';
}

async function resolvePortalId() {
	const local = portalIdFromLocation();
	if (local) return local;
	try {
		const response = await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
		return response.headers.get('X-Arns-Resolved-Id') || '';
	} catch {
		return '';
	}
}

function routeParts() {
	const parts = hashParts();
	if (parts[0] && isArweaveId(parts[0])) parts.shift();
	return parts;
}

function routePrefix() {
	return hashParts()[0] && isArweaveId(hashParts()[0]) ? `/${portalId}` : '';
}

function homeHref() {
	return `#${routePrefix() || '/'}`;
}

function postHref(post: LitePost) {
	return `#${routePrefix()}/post/${encodeURIComponent(post.slug)}`;
}

function setMeta(name: string, value: string, property = false) {
	const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
	let meta = document.head.querySelector<HTMLMetaElement>(selector);
	if (!meta) {
		meta = document.createElement('meta');
		meta.setAttribute(property ? 'property' : 'name', name);
		document.head.appendChild(meta);
	}
	meta.content = value;
}

function setPageMeta(title: string, description: string, image?: string | null) {
	document.title = title;
	setMeta('description', description);
	setMeta('og:title', title, true);
	setMeta('og:description', description, true);
	setMeta('og:url', window.location.href, true);
	setMeta('twitter:title', title);
	setMeta('twitter:description', description);
	if (image) {
		setMeta('og:image', image, true);
		setMeta('twitter:image', image);
	}
}

function loadPortalFonts(fonts: LitePortal['fonts']) {
	const stylesheet = getLiteFontStylesheet(fonts);
	if (!stylesheet) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = stylesheet;
	document.head.appendChild(link);
}

function applyTheme(current: LitePortal) {
	const scheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	for (const [key, value] of Object.entries(getLiteThemeVars(current, scheme))) {
		document.documentElement.style.setProperty(key, value);
	}
	document.documentElement.style.colorScheme = scheme;
	loadPortalFonts(current.fonts);

	if (current.icon) {
		const icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]') || document.createElement('link');
		icon.rel = 'icon';
		icon.href = current.icon;
		document.head.appendChild(icon);
	}
}

function activateImages() {
	root?.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
		const show = () => image.classList.add('is-loaded');
		if (image.complete) show();
		else image.addEventListener('load', show, { once: true });
	});
}

function attachFeedEvents() {
	root?.querySelectorAll<HTMLButtonElement>('[data-category]').forEach((button) => {
		button.addEventListener('click', () => {
			selectedCategory = button.dataset.category || null;
			void renderRoute();
		});
	});
	const search = root?.querySelector<HTMLInputElement>('.lite-search input');
	search?.addEventListener('input', () => {
		searchQuery = search.value;
		if (!portal) return;
		root.innerHTML = renderFeed(portal, { category: selectedCategory, search: searchQuery }, postHref);
		attachFeedEvents();
		activateImages();
		root.querySelector<HTMLInputElement>('.lite-search input')?.focus();
	});
}

async function renderRoute() {
	if (!portal) return;
	window.scrollTo({ top: 0, behavior: 'auto' });
	const parts = routeParts();
	const isPost = parts[0] === 'post' || parts[0] === 'read';
	if (isPost && parts[1]) {
		const match = findPost(portal.posts, parts.slice(1).join('/'));
		if (!match) {
			root.innerHTML = `<div class="lite-error">Post not found. <a href="${escapeHTML(
				homeHref()
			)}">View all posts</a></div>`;
			return;
		}
		root.innerHTML = '<div class="lite-loading">Loading post</div>';
		const post = await hydratePost(match);
		root.innerHTML = renderPost(post, homeHref());
		setPageMeta(`${post.title} | ${portal.name}`, post.excerpt || portal.description, post.image);
		activateImages();
		return;
	}

	root.innerHTML = renderFeed(portal, { category: selectedCategory, search: searchQuery }, postHref);
	setPageMeta(portal.name, portal.description || `${portal.name} posts`);
	attachFeedEvents();
	activateImages();
}

async function start() {
	root.innerHTML = '<div class="lite-loading">Loading posts</div>';
	portalId = await resolvePortalId();
	if (!portalId || !isArweaveId(portalId)) {
		root.innerHTML =
			'<div class="lite-error">No portal was found. Open this engine from a portal domain or pass <code>?portal=&lt;portal-id&gt;</code>.</div>';
		return;
	}

	try {
		portal = await fetchPortal(portalId);
		applyTheme(portal);
		await renderRoute();
	} catch (error) {
		console.error('[Engine Lite]', error);
		root.innerHTML = '<div class="lite-error">The portal could not be loaded.</div>';
	}
}

window.addEventListener('hashchange', () => void renderRoute());
void start();
