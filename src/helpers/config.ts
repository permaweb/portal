import engineLiteDeployment from '../../deployments/engine-lite.json';
import {
	ENGINE_LITE_BRAND_STORAGE_PREFIX,
	ENGINE_LITE_FALLBACK_LOGO,
	ENGINE_LITE_THEME_COLORS_STORAGE_PREFIX,
	ENGINE_LITE_THEME_STORAGE_KEY,
} from '../apps/engine-lite/constants';

import { LAYOUT_BLOG, LAYOUT_DOCUMENTATION, LAYOUT_JOURNAL } from './config/layouts';
import { PAGES_BLOG, PAGES_DOCUMENTATION, PAGES_JOURNAL } from './config/pages';
import { POST_PREVIEWS } from './config/postPreviews';
import { THEME_DEFAULT } from './config/themes';
import { ArticleBlockEnum, PageBlockEnum, PortalPatchMapEnum } from './types';

export const ENGINE_LITE_REFERENCE_ID = engineLiteDeployment.referenceId;
export const ENGINE_LITE_FALLBACK_ID = engineLiteDeployment.value;
export const ENGINE_LITE_SERVICE_WORKER_ID =
	(engineLiteDeployment as typeof engineLiteDeployment & { serviceWorkerId?: string }).serviceWorkerId || '';

export const PAGES = {
	JOURNAL: PAGES_JOURNAL,
	BLOG: PAGES_BLOG,
	DOCUMENTATION: PAGES_DOCUMENTATION,
};
export const THEME = { DEFAULT: THEME_DEFAULT };
export const LAYOUT = {
	JOURNAL: LAYOUT_JOURNAL,
	BLOG: LAYOUT_BLOG,
	DOCUMENTATION: LAYOUT_DOCUMENTATION,
};
export { POST_PREVIEWS };

import { ICONS, ICONS_SOCIAL } from './config/icons';
export { ICONS, ICONS_SOCIAL };

export const AO_NODE = {
	url: 'https://hb.portalinto.com',
	authority: 'a5ZMUKbGClAsKzB4SHDYrwkOZZHIIfpbaxrmKwUHCe8',
	scheduler: 'n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo',
};

export const TIP_TOKEN_OPTIONS = [
	{
		label: 'AR',
		tokenType: 'AR' as const,
		tokenAddress: 'AR',
		tokenSymbol: 'AR',
		tokenDecimals: 12,
	},
	{
		label: 'AO',
		tokenType: 'AO' as const,
		tokenAddress: '0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc',
		tokenSymbol: 'AO',
		tokenDecimals: 12,
	},
	{
		label: 'WANDER',
		tokenType: 'AO' as const,
		tokenAddress: '7GoQfmSOct_aUOWKM4xbKGg6DzAmOgdKwg8Kf-CbHm4',
		tokenSymbol: 'WANDER',
		tokenDecimals: 12,
	},
	{
		label: 'PI',
		tokenType: 'AO' as const,
		tokenAddress: '4hXj_E-5fAKmo4E8KjgQvuDJKAFk9P2grhycVmISDLs',
		tokenSymbol: 'PI',
		tokenDecimals: 12,
	},
	{
		label: 'USDA',
		tokenType: 'AO' as const,
		tokenAddress: 'FBt9A5GA_KXMMSxA2DJ0xZbAq8sLLU2ak-YJe9zDvg8',
		tokenSymbol: 'USDA',
		tokenDecimals: 12,
	},
	{
		label: 'wAR',
		tokenType: 'AO' as const,
		tokenAddress: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
		tokenSymbol: 'wAR',
		tokenDecimals: 12,
	},
	{
		label: 'ARIO',
		tokenType: 'AO' as const,
		tokenAddress: 'qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE',
		tokenSymbol: 'ARIO',
		tokenDecimals: 12,
	},
];

export const IS_TESTNET = import.meta.env.VITE_ARIO_TESTNET === 'true';

export const ASSET_UPLOAD = {
	ansType: 'blog-post',
	contentType: 'text/html',
};

export const DOM = {
	loader: 'loader',
	notification: 'notification',
	overlay: 'overlay',
};

export const STORAGE = {
	walletType: `wallet-type`,
	basePortal: (id: string) => `base-portal-${id}`,
	basePortalLatest: (id: string) => `base-portal-latest-${id}`,
	basePortalMemberships: (address: string) => `base-portal-memberships-${address}`,
	basePortalMembershipReceipts: (address: string) => `base-portal-membership-receipts-${address}`,
	basePortalDeclined: (address: string) => `base-portal-declined-${address}`,
	basePendingTransactions: (address: string) => `base-pending-transactions-${address}`,
	profileByWallet: (id: string) => `profile-by-wallet-${id}`,
	portal: (id: string) => `portal-${id}`,
	profile: (id: string) => `profile-${id}`,
	moderation: (id: string) => `moderation-${id}`,
	permissions: (portalId: string, userId: string) => `permissions-${portalId}-${userId}`,
};

export const STYLING = {
	cutoffs: {
		desktop: '1250px',
		initial: '1024px',
		max: '2000px',
		maxEditor: '1600px',
		tablet: '840px',
		tabletSecondary: '768px',
		secondary: '540px',
	},
	dimensions: {
		button: {
			height: '33.5px',
			width: 'fit-content',
		},
		form: {
			small: '42.5px',
			max: '47.5px',
		},
		nav: {
			height: '72.5px',
			linksHeight: '50px',
			width: '260px',
			widthMin: 67.5,
		},
		radius: {
			primary: '7.5px',
			alt1: '15px',
			alt2: '15px',
			alt3: '2.5px',
			alt4: '5px',
			button: '25px',
		},
	},
};

function createURLs() {
	const base = `/`;
	const post = `post/`;

	const portalBase = (portalId: string) => `${base}${portalId}/`;
	const postCreateBase = (portalId: string) => `${base}${portalId}/${post}create/`;
	const postEditBase = (portalId: string) => `${base}${portalId}/${post}edit/`;

	const pageBase = (portalId: string) => `${portalBase(portalId)}page/`;
	const pageCreate = (portalId: string) => `${pageBase(portalId)}create/`;
	const pageEdit = (portalId: string) => `${pageBase(portalId)}edit/`;

	const docsBase = `${base}docs/`;
	const createBase = `${base}create`;

	return {
		base: base,
		create: createBase,
		category: (categoryId: string) => `category/${categoryId}`,
		creator: (creatorId: string) => `creator/${creatorId}`,
		info: (page: string) => `info/${page}`,
		portalBase: portalBase,
		portalDesign: (portalId: string) => `${portalBase(portalId)}design/`,
		portalMedia: (portalId: string) => `${portalBase(portalId)}media/`,
		portalPosts: (portalId: string) => `${portalBase(portalId)}posts/`,
		portalModeration: (portalId: string) => `${portalBase(portalId)}moderation/`,
		portalDomains: (portalId: string) => `${portalBase(portalId)}domains/`,
		portalDomainsRegister: (portalId: string) => `${portalBase(portalId)}domains/register`,
		portalUsers: (portalId: string) => `${portalBase(portalId)}users/`,
		portalPages: (portalId: string) => `${portalBase(portalId)}pages/`,
		portalLayout: (portalId: string) => `${portalBase(portalId)}layout/`,
		portalSetup: (portalId: string) => `${portalBase(portalId)}setup/`,
		portalCreate: (portalId: string) => `${portalBase(portalId)}create`,
		post: (postId: string) => `post/${postId}`,
		postCreate: (portalId: string) => `${postCreateBase(portalId)}`,
		postEdit: (portalId: string) => `${postEditBase(portalId)}`,
		pageCreateMain: (portalId: string) => `${pageCreate(portalId)}main`,
		pageEditMain: (portalId: string) => `${pageEdit(portalId)}main`,
		pageCreateInfo: (portalId: string) => `${pageCreate(portalId)}info`,
		pageEditInfo: (portalId: string) => `${pageEdit(portalId)}info`,
		postCreateArticle: (portalId: string) => `${postCreateBase(portalId)}article/`,
		postCreateImage: (portalId: string) => `${postCreateBase(portalId)}image/`,
		postCreateVideo: (portalId: string) => `${postCreateBase(portalId)}video/`,
		postEditArticle: (portalId: string) => `${postEditBase(portalId)}article/`,
		postEditImage: (portalId: string) => `${postEditBase(portalId)}image/`,
		postEditVideo: (portalId: string) => `${postEditBase(portalId)}video/`,
		portalTips: (portalId: string) => `${portalBase(portalId)}tips/`,
		portalPostPreviews: (portalId: string) => `${portalBase(portalId)}post-previews/`,
		portalPostPreviewEdit: (portalId: string, previewId: string) =>
			`${portalBase(portalId)}post-preview/edit/${previewId}`,
		portalPostPreviewCreate: (portalId: string) => `${portalBase(portalId)}post-preview/create`,
		docs: docsBase,
		docsIntro: `${docsBase}overview/introduction`,
		docsEditor: `${docsBase}posts/editor`,
		notFound: `${base}404`,
	};
}

export const URLS = createURLs();

export const PAGE_BLOCKS = {
	[PageBlockEnum.Feed]: {
		type: PageBlockEnum.Feed,
		label: 'Post Feed',
		icon: ICONS.feed,
	},
	[PageBlockEnum.Post]: {
		type: PageBlockEnum.Post,
		label: 'Post',
		icon: ICONS.posts,
	},
	[PageBlockEnum.PostSpotlight]: {
		type: PageBlockEnum.PostSpotlight,
		label: 'Featured Post',
		icon: ICONS.featuredPost,
	},
	[PageBlockEnum.CategorySpotlight]: {
		type: PageBlockEnum.CategorySpotlight,
		label: 'Featured Category',
		icon: ICONS.featuredCategory,
	},
	[PageBlockEnum.Sidebar]: {
		type: PageBlockEnum.Sidebar,
		label: 'Sidebar',
		icon: ICONS.sidebar,
	},
	[PageBlockEnum.MonetizationButton]: {
		type: PageBlockEnum.MonetizationButton,
		label: 'Tips Button',
		icon: ICONS.tools,
	},
	[PageBlockEnum.Supporters]: {
		type: PageBlockEnum.Supporters,
		label: 'Supporters',
		icon: ICONS.users,
	},
};

export const ARTICLE_BLOCKS = {
	[ArticleBlockEnum.Paragraph]: {
		type: ArticleBlockEnum.Paragraph,
		label: 'Paragraph',
		icon: ICONS.paragraph,
		shortcut: 'Ctrl / P',
	},
	[ArticleBlockEnum.Quote]: {
		type: ArticleBlockEnum.Quote,
		label: 'Quote',
		icon: ICONS.quotes,
		shortcut: 'Ctrl / Q',
	},
	[ArticleBlockEnum.OrderedList]: {
		type: ArticleBlockEnum.OrderedList,
		label: 'Numbered List',
		icon: ICONS.listOrdered,
		shortcut: 'Ctrl / N',
	},
	[ArticleBlockEnum.UnorderedList]: {
		type: ArticleBlockEnum.UnorderedList,
		label: 'Bulleted List',
		icon: ICONS.listUnordered,
		shortcut: 'Ctrl / B',
	},
	[ArticleBlockEnum.Code]: {
		type: ArticleBlockEnum.Code,
		label: 'Code',
		icon: ICONS.code,
		shortcut: 'Ctrl / C',
	},
	[ArticleBlockEnum.Header1]: {
		type: ArticleBlockEnum.Header1,
		label: 'Header 1',
		icon: ICONS.header1,
		shortcut: 'Ctrl / 1',
	},
	[ArticleBlockEnum.Header2]: {
		type: ArticleBlockEnum.Header2,
		label: 'Header 2',
		icon: ICONS.header2,
		shortcut: 'Ctrl / 2',
	},
	[ArticleBlockEnum.Header3]: {
		type: ArticleBlockEnum.Header3,
		label: 'Header 3',
		icon: ICONS.header3,
		shortcut: 'Ctrl / 3',
	},
	[ArticleBlockEnum.Header4]: {
		type: ArticleBlockEnum.Header4,
		label: 'Header 4',
		icon: ICONS.header4,
		shortcut: 'Ctrl / 4',
	},
	[ArticleBlockEnum.Header5]: {
		type: ArticleBlockEnum.Header5,
		label: 'Header 5',
		icon: ICONS.header5,
		shortcut: 'Ctrl / 5',
	},
	[ArticleBlockEnum.Header6]: {
		type: ArticleBlockEnum.Header6,
		label: 'Header 6',
		icon: ICONS.header6,
		shortcut: 'Ctrl / 6',
	},
	[ArticleBlockEnum.Image]: {
		type: ArticleBlockEnum.Image,
		label: 'Image',
		icon: ICONS.image,
		shortcut: 'Ctrl / I',
	},
	[ArticleBlockEnum.Video]: {
		type: ArticleBlockEnum.Video,
		label: 'Video',
		icon: ICONS.video,
		shortcut: 'Ctrl / V',
	},
	[ArticleBlockEnum.DividerSolid]: {
		type: ArticleBlockEnum.DividerSolid,
		label: 'Solid Divider',
		icon: ICONS.dividerSolid,
	},
	[ArticleBlockEnum.DividerDashed]: {
		type: ArticleBlockEnum.DividerDashed,
		label: 'Dashed Divider',
		icon: ICONS.dividerDashed,
	},
	[ArticleBlockEnum.SpacerHorizontal]: {
		type: ArticleBlockEnum.SpacerHorizontal,
		label: 'Horizontal Spacer',
		icon: ICONS.spacerHorizontal,
	},
	[ArticleBlockEnum.SpacerVertical]: {
		type: ArticleBlockEnum.SpacerVertical,
		label: 'Vertical Spacer',
		icon: ICONS.spacerVertical,
	},
	[ArticleBlockEnum.HTML]: {
		type: ArticleBlockEnum.HTML,
		label: 'HTML',
		icon: ICONS.html,
	},
	[ArticleBlockEnum.Table]: {
		type: ArticleBlockEnum.Table,
		label: 'Table',
		icon: ICONS.menu,
	},
	[ArticleBlockEnum.MonetizationButton]: {
		type: ArticleBlockEnum.MonetizationButton,
		label: 'Tips Button',
		icon: ICONS.tools,
	},
	[ArticleBlockEnum.Embed]: {
		type: ArticleBlockEnum.Embed,
		label: 'Embed',
		icon: ICONS.link,
	},
};

export const STRIPE_PUBLISHABLE_KEY =
	'pk_live_51JUAtwC8apPOWkDLMQqNF9sPpfneNSPnwX8YZ8y1FNDl6v94hZIwzgFSYl27bWE4Oos8CLquunUswKrKcaDhDO6m002Yj9AeKj';

export const PAYMENT_URL = 'https://payment.ardrive.io';

export const FALLBACK_GATEWAY = 'arweave.net';

export const ARWEAVE_UPLOAD_NODE = 'https://up.arweave.net';
export const ARWEAVE_FREE_UPLOAD_LIMIT = 100 * 1000;

export const UPLOAD = {
	node1: ARWEAVE_UPLOAD_NODE,
	node2: ARWEAVE_UPLOAD_NODE,
	batchSize: 1,
	chunkSize: 7500000,
	freeUploadLimit: ARWEAVE_FREE_UPLOAD_LIMIT,
	dispatchUploadSize: ARWEAVE_FREE_UPLOAD_LIMIT,
};

type PortalBootstrapOptions = {
	logo?: string | null;
	theme?: any;
	layout?: unknown;
};

function getBootstrapThemeColor(theme: any, key: 'background' | 'text', scheme: 'light' | 'dark') {
	const basics = theme?.basics || theme?.Basics || {};
	const colors = basics.colors || basics.Colors || {};
	const entry = colors[key] || colors[key.charAt(0).toUpperCase() + key.slice(1)] || {};
	const raw = entry[scheme] || entry[scheme.charAt(0).toUpperCase() + scheme.slice(1)];
	const reference = typeof raw === 'string' ? colors[raw] || colors[raw.charAt(0).toUpperCase() + raw.slice(1)] : null;
	const resolved = reference?.[scheme] || reference?.[scheme.charAt(0).toUpperCase() + scheme.slice(1)] || raw;
	const fallback =
		scheme === 'dark'
			? key === 'background'
				? '0,0,0'
				: '255,255,255'
			: key === 'background'
			? '255,255,255'
			: '0,0,0';
	const value = typeof resolved === 'string' && resolved.trim() ? resolved.trim() : fallback;
	return /^(?:#|rgb|hsl|color\(|var\()/i.test(value) ? value : `rgb(${value})`;
}

function serializePortalBootstrap(value: unknown) {
	return (JSON.stringify(value) || 'null').replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export const PORTAL_DATA = (options: PortalBootstrapOptions = {}) => {
	const theme = {
		light: {
			background: getBootstrapThemeColor(options.theme, 'background', 'light'),
			text: getBootstrapThemeColor(options.theme, 'text', 'light'),
		},
		dark: {
			background: getBootstrapThemeColor(options.theme, 'background', 'dark'),
			text: getBootstrapThemeColor(options.theme, 'text', 'dark'),
		},
	};
	const logo = options.logo && options.logo !== 'None' ? options.logo : null;

	return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="portal-engine-reference" content="${ENGINE_LITE_REFERENCE_ID}" />
    <meta name="portal-engine-service-worker" content="${ENGINE_LITE_SERVICE_WORKER_ID}" />
    <title>Portal</title>
    <script>
      (function () {
        var THEME_STORAGE_KEY = ${serializePortalBootstrap(ENGINE_LITE_THEME_STORAGE_KEY)};
        var THEME_COLORS_PREFIX = ${serializePortalBootstrap(ENGINE_LITE_THEME_COLORS_STORAGE_PREFIX)};
        var EMBEDDED_THEME = ${serializePortalBootstrap(theme)};
        var ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;
        var parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
        var params = new URLSearchParams(window.location.search);
        var explicit = params.get('portal') || params.get('portalId');
        var pathId = window.location.pathname.split('/').filter(Boolean)[0];
        var id = explicit && ARWEAVE_ID.test(explicit)
          ? explicit
          : pathId && ARWEAVE_ID.test(pathId)
          ? pathId
          : parts[0] && ARWEAVE_ID.test(parts[0])
          ? parts[0]
          : '';
        var mode = 'system';
        try {
          var storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (storedMode === 'light' || storedMode === 'dark') mode = storedMode;
        } catch (_) {}
        var scheme = mode === 'system'
          ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : mode;
        var cachedThemes = null;
        try {
          cachedThemes = id
            ? JSON.parse(window.localStorage.getItem(THEME_COLORS_PREFIX + id) || 'null')
            : null;
        } catch (_) {}
        var variables = cachedThemes && cachedThemes[scheme];
        if (variables && typeof variables === 'object' && !Array.isArray(variables)) {
          Object.keys(variables).forEach(function (key) {
            if (key.indexOf('--lite-') === 0 && typeof variables[key] === 'string') {
              document.documentElement.style.setProperty(key, variables[key]);
            }
          });
        } else {
          var colors = EMBEDDED_THEME[scheme];
          document.documentElement.style.setProperty('--lite-background', colors.background);
          document.documentElement.style.setProperty('--lite-text', colors.text);
        }
        document.documentElement.dataset.liteScheme = scheme;
        document.documentElement.style.colorScheme = scheme;
      })();
    </script>
    <style>
      :root {
        --lite-background: rgb(255, 255, 255);
        --lite-text: rgb(0, 0, 0);
        color-scheme: light;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --lite-background: rgb(0, 0, 0);
          --lite-text: rgb(255, 255, 255);
          color-scheme: dark;
        }
      }

      html, body, #portal {
        min-height: 100%;
        background: var(--lite-background);
      }

      body {
        min-width: 320px;
        min-height: 100vh;
        margin: 0;
        color: var(--lite-text);
      }

      #portal-site-loader {
        position: fixed;
        z-index: 9999;
        inset: 0;
        display: grid;
        place-items: center;
        background: var(--lite-background);
        color: var(--lite-text);
        opacity: 1;
        visibility: visible;
        transition: opacity 160ms ease, visibility 160ms ease;
      }

      #portal-site-loader.is-hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      #portal-site-loader-logo {
        display: grid;
        place-items: center;
        width: min(180px, 50vw);
        min-height: 50px;
        animation: portal-loader-open 160ms ease-out;
      }

      #portal-site-loader-logo svg {
        width: 50px;
        height: 50px;
      }

      #portal-site-loader-logo img {
        display: block;
        width: auto;
        max-width: 100%;
        height: auto;
        max-height: 60px;
        object-fit: contain;
      }

      @keyframes portal-loader-open {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        #portal-site-loader, #portal-site-loader-logo { transition: none; animation: none; }
      }
    </style>
    <script>
      (function () {
        var THEME_STORAGE_KEY = ${serializePortalBootstrap(ENGINE_LITE_THEME_STORAGE_KEY)};
        var THEME_COLORS_PREFIX = ${serializePortalBootstrap(ENGINE_LITE_THEME_COLORS_STORAGE_PREFIX)};
        var BRAND_PREFIX = ${serializePortalBootstrap(ENGINE_LITE_BRAND_STORAGE_PREFIX)};
        var EMBEDDED_THEME = ${serializePortalBootstrap(theme)};
        var EMBEDDED_LOGO = ${serializePortalBootstrap(logo)};
        var ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;

        function hashParts() {
          return window.location.hash.replace(/^#\/?/, '').split('/').map(function (part) {
            try { return decodeURIComponent(part); } catch (_) { return part; }
          }).filter(Boolean);
        }

        function portalId() {
          var params = new URLSearchParams(window.location.search);
          var explicit = params.get('portal') || params.get('portalId');
          if (explicit && ARWEAVE_ID.test(explicit)) return explicit;
          var pathId = window.location.pathname.split('/').filter(Boolean)[0];
          if (pathId && ARWEAVE_ID.test(pathId)) return pathId;
          var hashId = hashParts()[0];
          return hashId && ARWEAVE_ID.test(hashId) ? hashId : '';
        }

        function readJSON(key) {
          try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch (_) { return null; }
        }

        function resolveLogo(value) {
          if (typeof value !== 'string' || !value || value === 'None') return null;
          return ARWEAVE_ID.test(value) ? 'https://arweave.net/' + value : value;
        }

        var id = portalId();
        var mode = 'system';
        try {
          var storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (storedMode === 'light' || storedMode === 'dark') mode = storedMode;
        } catch (_) {}
        var scheme = mode === 'system'
          ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : mode;
        var cachedThemes = id ? readJSON(THEME_COLORS_PREFIX + id) : null;
        var variables = cachedThemes && cachedThemes[scheme];
        var colors = EMBEDDED_THEME[scheme];

        if (variables && typeof variables === 'object' && !Array.isArray(variables)) {
          Object.keys(variables).forEach(function (key) {
            if (key.indexOf('--lite-') === 0 && typeof variables[key] === 'string') {
              document.documentElement.style.setProperty(key, variables[key]);
            }
          });
        } else {
          document.documentElement.style.setProperty('--lite-background', colors.background);
          document.documentElement.style.setProperty('--lite-text', colors.text);
        }
        document.documentElement.dataset.liteScheme = scheme;
        document.documentElement.style.colorScheme = scheme;

        var cachedBrand = id ? readJSON(BRAND_PREFIX + id) : null;
        var selectedLogo = cachedBrand && typeof cachedBrand === 'object' ? cachedBrand.logo : EMBEDDED_LOGO;
        window.__portalBootstrapLogo = resolveLogo(selectedLogo);
      })();
    </script>
  </head>
  <body>
    <div id="portal-site-loader" role="status" aria-label="Loading site">
      <div id="portal-site-loader-logo">${ENGINE_LITE_FALLBACK_LOGO}</div>
    </div>
    <div id="portal"></div>
    <script>
      (function () {
        var source = window.__portalBootstrapLogo;
        var target = document.getElementById('portal-site-loader-logo');
        if (!source || !target) return;
        var image = new Image();
        image.alt = '';
        image.onload = function () { target.replaceChildren(image); };
        image.src = source;
      })();

      const ENGINE_REFERENCE_ID = '${ENGINE_LITE_REFERENCE_ID}';
      const ENGINE_FALLBACK_ID = '${ENGINE_LITE_FALLBACK_ID}';
      const ENGINE_SERVICE_WORKER_ID = '${ENGINE_LITE_SERVICE_WORKER_ID}';
      const ARWEAVE_ID = /^[a-zA-Z0-9_-]{43}$/;
      const ENGINE_CACHE_KEY = 'portal-engine:' + ENGINE_REFERENCE_ID;

      function registerEngineServiceWorker() {
        if (!ENGINE_SERVICE_WORKER_ID || !('serviceWorker' in navigator)) return null;
        const workerUrl = new URL('/' + ENGINE_SERVICE_WORKER_ID, window.location.origin);
        return navigator.serviceWorker.register(workerUrl.href, { scope: '/' }).catch(function () { return null; });
      }

      const engineServiceWorker = registerEngineServiceWorker();

      function cacheEngineWithServiceWorker(url) {
        if (!engineServiceWorker) return;
        engineServiceWorker.then(function (registration) {
          if (!registration) return;
          const worker = navigator.serviceWorker.controller || registration.active || registration.waiting;
          if (worker) {
            worker.postMessage({ type: 'CACHE_ENGINE', url: url });
            return;
          }
          navigator.serviceWorker.ready.then(function (readyRegistration) {
            if (readyRegistration.active) readyRegistration.active.postMessage({ type: 'CACHE_ENGINE', url: url });
          });
        });
      }

      function getGateway() {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') return 'arweave.net';
        const parts = host.split('.');
        return parts.length > 1 ? parts[parts.length - 2] + '.' + parts[parts.length - 1] : 'arweave.net';
      }

      function messageFromTags(tags) {
        return (tags || []).reduce(function (message, tag) {
          message[tag.name] = tag.value;
          return message;
        }, {});
      }

      function timestamp(message) {
        const value = Number(message.timestamp || 0);
        return Number.isFinite(value) ? value : 0;
      }

      async function graphql(query) {
        const response = await fetch('https://arweave.net/graphql', {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ query: query }),
        });
        if (!response.ok) throw new Error('Engine reference query failed');
        const payload = await response.json();
        if (payload.errors && payload.errors.length) throw new Error(payload.errors[0].message);
        return payload.data;
      }

      async function resolveReference(referenceId) {
        const initData = await graphql(
          'query { transaction(id: ' + JSON.stringify(referenceId) +
          ') { id owner { address } tags { name value } } }'
        );
        const initNode = initData && initData.transaction;
        if (!initNode) throw new Error('Engine reference was not found');

        const init = messageFromTags(initNode.tags);
        if (init.device !== 'reference@1.0' || init['reference-id']) {
          throw new Error('Invalid engine reference');
        }
        const authority = init.authority || (initNode.owner && initNode.owner.address);
        if (!ARWEAVE_ID.test(authority || '')) throw new Error('Invalid engine reference authority');

        let currentTimestamp = timestamp(init);
        let currentValue = init['reference-value'];
        let after = null;

        for (let page = 0; page < 100; page += 1) {
          const afterArgument = after ? ', after: ' + JSON.stringify(after) : '';
          const setData = await graphql(
            'query { transactions(owners: [' + JSON.stringify(authority) +
            '], tags: [{ name: "reference-id", values: [' + JSON.stringify(referenceId) +
            '] }], sort: HEIGHT_ASC, first: 100' + afterArgument +
            ') { pageInfo { hasNextPage } edges { cursor node { owner { address } tags { name value } } } } }'
          );
          const connection = setData && setData.transactions;
          const edges = connection && Array.isArray(connection.edges) ? connection.edges : [];
          for (const edge of edges) {
            const message = messageFromTags(edge.node.tags);
            const compatibleDevice = !message.device || message.device === 'reference@1.0';
            const nextTimestamp = timestamp(message);
            if (
              compatibleDevice &&
              message['reference-id'] === referenceId &&
              edge.node.owner && edge.node.owner.address === authority &&
              nextTimestamp > currentTimestamp
            ) {
              currentTimestamp = nextTimestamp;
              currentValue = message['reference-value'];
            }
          }
          if (!connection || !connection.pageInfo.hasNextPage || !edges.length) break;
          after = edges[edges.length - 1].cursor;
        }

        if (!ARWEAVE_ID.test(currentValue || '')) throw new Error('Engine reference has no valid target');
        return currentValue;
      }

      function cachedEngine() {
        try {
          const value = window.localStorage.getItem(ENGINE_CACHE_KEY);
          return ARWEAVE_ID.test(value || '') ? value : null;
        } catch {
          return null;
        }
      }

      function cacheEngine(value) {
        try {
          window.localStorage.setItem(ENGINE_CACHE_KEY, value);
        } catch {}
      }

      function loadEngine(engineId) {
        const gateway = getGateway();
        const script = document.createElement('script');
        script.async = true;
        script.dataset.engineReference = ENGINE_REFERENCE_ID;
        script.src = 'https://' + gateway + '/' + engineId;
        script.addEventListener('load', function () { cacheEngineWithServiceWorker(script.src); });
        if (gateway !== 'arweave.net') {
          script.addEventListener('error', function retryFromArweave() {
            script.removeEventListener('error', retryFromArweave);
            script.src = 'https://arweave.net/' + engineId;
          });
        }
        document.body.appendChild(script);
      }

      resolveReference(ENGINE_REFERENCE_ID)
        .then(function (engineId) {
          cacheEngine(engineId);
          loadEngine(engineId);
        })
        .catch(function () {
          loadEngine(cachedEngine() || ENGINE_FALLBACK_ID);
        });
    </script>
  </body>
</html>
`;
};

export const PORTAL_POST_DATA = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portal Post</title>
  </head>
  <body>
    <pre id="post-content"></pre>
    <script>
      /* Checks for a valid arweave address */
      function checkValidAddress(address) {
        if (!address) return false;
        return /^[a-z0-9_-]{43}$/i.test(address);
      }

      /* Maps an object from pascal case to camel case and removes any 'commitments' key */
      function fromProcessCase(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
      }

      function mapFromProcessCase(obj) {
        if (Array.isArray(obj)) {
          return obj.map(mapFromProcessCase);
        }
        if (obj && typeof obj === "object") {
          return Object.entries(obj).reduce((acc, [key, value]) => {
            // Skip any key named "commitments" (case-insensitive)
            if (
              typeof key === "string" &&
              key.toLowerCase() === "commitments"
            ) {
              return acc;
            }

            const fromKey =
              checkValidAddress(key) || key.includes("-")
                ? key
                : fromProcessCase(key);

            acc[fromKey] = checkValidAddress(value)
              ? value
              : mapFromProcessCase(value);

            return acc;
          }, {});
        }
        return obj;
      }

      /* Basic hostname validator */
      function isValidHost(host) {
        return /^[a-zA-Z0-9.-]+$/.test(host);
      }

      (async function () {
        try {
          document.getElementById("post-content").innerHTML = "Loading...";

          const defaultNode = "hb.portalinto.com";
          const node = defaultNode;

          const processId = window.location.href.substring(
            window.location.href.lastIndexOf("/") + 1
          );

		  const url =
            "https://" +
            node +
            "/" +
            processId +
            "~process@1.0/compute?require-codec=application/json&accept-bundle=true";

          const response = await fetch(url);

          const data = mapFromProcessCase((await response.json()) ?? {});
          const content = data?.asset?.metadata?.content ?? [];

          document.getElementById("post-content").innerHTML = JSON.stringify(
            content,
            null,
            2
          );
        } catch (e) {
          console.error(e);
          document.getElementById("post-content").innerHTML = "Error occurred";
        }
      })();
    </script>
  </body>
</html>
`;

export const PORTAL_PATCH_MAP = {
	[PortalPatchMapEnum.Overview]: [
		'Owner',
		'Version',
		'Authorities',
		'PatchMap',
		'Store.Name',
		'Store.Description',
		'Store.Thumbnail',
		'Store.Banner',
		'Store.Wallpaper',
		'Store.Moderation',
		'Store.EngineReference',
	],
	[PortalPatchMapEnum.Users]: ['Roles', 'RoleOptions', 'Permissions'],
	[PortalPatchMapEnum.Navigation]: ['Store.Categories', 'Store.Topics', 'Store.Links', 'Store.Domains'],
	[PortalPatchMapEnum.Presentation]: [
		'Store.Layout',
		'Store.Pages',
		'Store.Themes',
		'Store.Fonts',
		'Store.PostPreviews',
	],
	[PortalPatchMapEnum.Media]: ['Store.Uploads'],
	[PortalPatchMapEnum.Posts]: ['Store.Index', 'Store.FeaturedPosts'],
	[PortalPatchMapEnum.Requests]: ['Store.IndexRequests'],
	[PortalPatchMapEnum.Transfers]: ['Transfers'],
	[PortalPatchMapEnum.Monetization]: ['Store.Monetization'],
};

export const PORTAL_ROLES = {
	ADMIN: 'Admin',
	CONTRIBUTOR: 'Contributor',
	MODERATOR: 'Moderator',
	GUEST_CONTRIBUTOR: 'Guest Contributor',
};

export const DEFAULT_FONTS = {
	headers: 'Crimson Pro:400,600,700',
	body: 'Open Sans:400,600,700',
};

export const FONT_OPTIONS = [
	DEFAULT_FONTS.headers,
	'Montserrat:400,700',
	'Poppins:400,700',
	'Raleway:400,700',
	'Oswald:400,700',
	'Bebas Neue',
	'Playfair Display:400,700,900',
	'DM Serif Display',
	'Space Grotesk:400,700',
	'Anton',
	'Abril Fatface',
	'Libre Baskerville:400,700',
	'Cormorant Garamond:400,500,600,700',
	'EB Garamond:400,500,600,700',
	'Lora:400,500,600,700',
	'Merriweather:400,700,900',
	'Tinos:400,700',
	'Spectral:400,500,600,700',
	'Alegreya:400,500,700,800',
	'Orbitron:400,500,700',
	'Exo 2:400,600,800',
	'Audiowide',
	'Russo One:400,700',
	'Share Tech Mono:400,700',
	DEFAULT_FONTS.body,
	'Inter:400,600',
	'Roboto:400,500',
	'Lato:400,700',
	'Work Sans:400,500',
	'Source Sans Pro:400,600',
	'DM Sans:400,500',
	'Nunito:400,700',
	'Hind:400,500',
	'Space Mono:400,700',
	'VT323',
	'Major Mono Display',
	'Rajdhani:400,500,700',
	'Titillium Web:400,600,700',
];
