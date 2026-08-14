import editorFavicon from '../editor/favicon.svg';

import { fetchPortal, findPost, hydratePost, isArweaveId, type LitePortal, type LitePost } from './data';
import { escapeHTML, type LiteThemeMode, renderFeed, renderPost, renderShell } from './render';
import styles from './styles.css?inline';
import { getLiteFontStylesheet, getLiteThemeVars } from './theme';

const root = document.getElementById('portal');
const THEME_STORAGE_KEY = 'portal-engine-lite-theme';
const THEME_COLORS_STORAGE_PREFIX = 'portal-engine-lite-colors:';
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

if (!root) throw new Error('Engine Lite requires a #portal element.');

const style = document.createElement('style');
style.dataset.engineLite = 'true';
style.textContent = styles;
document.head.appendChild(style);

let portal: LitePortal | null = null;
let portalId = '';
let selectedCategory: string | null = null;
let searchQuery = '';
let walletAddress: string | null = null;
let themeMode: LiteThemeMode = readThemeMode();

function readThemeMode(): LiteThemeMode {
	try {
		const value = window.localStorage.getItem(THEME_STORAGE_KEY);
		return value === 'light' || value === 'dark' ? value : 'system';
	} catch {
		return 'system';
	}
}

function effectiveScheme() {
	if (themeMode !== 'system') return themeMode;
	return systemTheme.matches ? 'dark' : 'light';
}

function themeColorsStorageKey(id: string) {
	return `${THEME_COLORS_STORAGE_PREFIX}${id}`;
}

function applyThemeVars(variables: Record<string, string>) {
	for (const [key, value] of Object.entries(variables)) {
		if (key.startsWith('--lite-') && typeof value === 'string') {
			document.documentElement.style.setProperty(key, value);
		}
	}
}

function cacheThemeVars(id: string, current: LitePortal) {
	if (!id) return;
	try {
		window.localStorage.setItem(
			themeColorsStorageKey(id),
			JSON.stringify({
				light: getLiteThemeVars(current, 'light'),
				dark: getLiteThemeVars(current, 'dark'),
			})
		);
	} catch {
		// A fresh system palette remains available when storage is unavailable.
	}
}

function applyCachedTheme(id: string) {
	if (!id) return false;
	const scheme = effectiveScheme();
	try {
		const cached = JSON.parse(window.localStorage.getItem(themeColorsStorageKey(id)) || 'null');
		const variables = cached?.[scheme];
		if (!variables || typeof variables !== 'object' || Array.isArray(variables)) return false;
		applyThemeVars(variables);
		document.documentElement.dataset.liteScheme = scheme;
		document.documentElement.style.colorScheme = scheme;
		return true;
	} catch {
		return false;
	}
}

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

function renderPage(content: string) {
	return portal ? renderShell(content, portal, homeHref(), walletAddress, themeMode) : content;
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
	const existing = document.head.querySelector<HTMLLinkElement>('link[data-engine-lite-fonts]');
	if (!stylesheet) {
		existing?.remove();
		return;
	}
	if (existing?.href === stylesheet) return;
	const link = existing || document.createElement('link');
	link.rel = 'stylesheet';
	link.href = stylesheet;
	link.dataset.engineLiteFonts = 'true';
	if (!existing) document.head.appendChild(link);
}

function applyTheme(current: LitePortal) {
	const scheme = effectiveScheme();
	applyThemeVars(getLiteThemeVars(current, scheme));
	cacheThemeVars(portalId, current);
	document.documentElement.dataset.liteScheme = scheme;
	document.documentElement.style.colorScheme = scheme;
	loadPortalFonts(current.fonts);

	const icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]') || document.createElement('link');
	icon.rel = 'icon';
	icon.href = current.icon || editorFavicon;
	if (current.icon) icon.removeAttribute('type');
	else icon.type = 'image/svg+xml';
	if (!icon.isConnected) document.head.appendChild(icon);
}

function activateImages() {
	root?.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
		const show = () => image.classList.add('is-loaded');
		if (image.complete) show();
		else image.addEventListener('load', show, { once: true });
	});
}

async function readWalletAddress() {
	if (!window.arweaveWallet?.getActiveAddress) return null;
	try {
		const address = await window.arweaveWallet.getActiveAddress();
		return isArweaveId(address) ? address : null;
	} catch {
		return null;
	}
}

async function connectWallet() {
	const button = root?.querySelector<HTMLButtonElement>('[data-wallet-connect]');
	if (!button) return;
	if (!window.arweaveWallet?.connect) {
		button.textContent = 'Wander Required';
		return;
	}

	button.disabled = true;
	button.textContent = 'Connecting...';
	try {
		await window.arweaveWallet.connect(['ACCESS_ADDRESS']);
		walletAddress = await readWalletAddress();
	} catch (error) {
		console.error('[Engine Lite] Wallet connection failed', error);
	}
	await renderRoute();
}

async function disconnectWallet() {
	const button = root?.querySelector<HTMLButtonElement>('[data-wallet-connect]');
	if (!button || !walletAddress) return;

	button.disabled = true;
	button.textContent = 'Disconnecting...';
	try {
		await window.arweaveWallet?.disconnect?.();
		walletAddress = null;
	} catch (error) {
		console.error('[Engine Lite] Wallet disconnection failed', error);
	}
	await renderRoute();
}

function setTheme(mode: LiteThemeMode) {
	themeMode = mode;
	try {
		if (themeMode === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
		else window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
	} catch {
		// The selected theme still applies for this session when storage is unavailable.
	}
	if (portal) applyTheme(portal);
	void renderRoute();
}

function attachShellEvents() {
	root
		?.querySelector<HTMLButtonElement>('[data-wallet-connect]')
		?.addEventListener('click', () => void (walletAddress ? disconnectWallet() : connectWallet()));
	root?.querySelectorAll<HTMLButtonElement>('[data-theme-mode]').forEach((button) => {
		button.addEventListener('click', () => {
			const mode = button.dataset.themeMode;
			if (mode === 'system' || mode === 'light' || mode === 'dark') setTheme(mode);
		});
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
		const selectionStart = search.selectionStart ?? searchQuery.length;
		const selectionEnd = search.selectionEnd ?? selectionStart;
		if (!portal) return;
		root.innerHTML = renderPage(renderFeed(portal, { category: selectedCategory, search: searchQuery }, postHref));
		attachFeedEvents();
		attachShellEvents();
		activateImages();
		const nextSearch = root.querySelector<HTMLInputElement>('.lite-search input');
		if (nextSearch) {
			nextSearch.focus({ preventScroll: true });
			nextSearch.setSelectionRange(selectionStart, selectionEnd);
		}
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
			root.innerHTML = renderPage(
				`<div class="lite-error">Post not found. <a href="${escapeHTML(homeHref())}">View all posts</a></div>`
			);
			attachShellEvents();
			return;
		}
		root.innerHTML = renderPage('<div class="lite-loading">Loading post</div>');
		attachShellEvents();
		const post = await hydratePost(match);
		root.innerHTML = renderPage(renderPost(post, homeHref()));
		setPageMeta(`${post.title} | ${portal.name}`, post.excerpt || portal.description, post.image);
		attachShellEvents();
		activateImages();
		return;
	}

	root.innerHTML = renderPage(renderFeed(portal, { category: selectedCategory, search: searchQuery }, postHref));
	setPageMeta(portal.name, portal.description || `${portal.name} posts`);
	attachFeedEvents();
	attachShellEvents();
	activateImages();
}

async function start() {
	portalId = portalIdFromLocation();
	if (!applyCachedTheme(portalId)) {
		document.documentElement.style.colorScheme = systemTheme.matches ? 'dark' : 'light';
	}
	root.innerHTML = '<div class="lite-loading">Loading posts</div>';
	if (!portalId || !isArweaveId(portalId)) {
		root.innerHTML =
			'<div class="lite-error">No portal was found. Open a portal transaction or pass <code>?portal=&lt;portal-id&gt;</code>.</div>';
		return;
	}

	try {
		[portal, walletAddress] = await Promise.all([fetchPortal(portalId), readWalletAddress()]);
		applyTheme(portal);
		await renderRoute();
	} catch (error) {
		console.error('[Engine Lite]', error);
		root.innerHTML = '<div class="lite-error">The portal could not be loaded.</div>';
	}
}

window.addEventListener('hashchange', () => void renderRoute());
window.addEventListener(
	'arweaveWalletLoaded',
	() =>
		void readWalletAddress().then((address) => {
			walletAddress = address;
			void renderRoute();
		})
);
window.addEventListener(
	'walletSwitch',
	() =>
		void readWalletAddress().then((address) => {
			walletAddress = address;
			void renderRoute();
		})
);
systemTheme.addEventListener('change', () => {
	if (themeMode !== 'system') return;
	if (portal) applyTheme(portal);
	else applyCachedTheme(portalId);
});
void start();
