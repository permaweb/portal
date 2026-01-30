import { LAYOUT_BLOG, LAYOUT_DOCUMENTATION, LAYOUT_JOURNAL } from './config/layouts';
import { PAGES_BLOG, PAGES_DOCUMENTATION, PAGES_JOURNAL } from './config/pages';
import { THEME_DEFAULT } from './config/themes';
import { ArticleBlockEnum, PageBlockEnum, PortalPatchMapEnum } from './types';

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

import { ICONS, ICONS_SOCIAL } from './config/icons';
export { ICONS, ICONS_SOCIAL };

export const AO_NODE = {
	url: 'https://hb.portalinto.com',
	authority: 'a5ZMUKbGClAsKzB4SHDYrwkOZZHIIfpbaxrmKwUHCe8',
	scheduler: 'n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo',
};

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
			height: '70px',
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

	return {
		base: base,
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

export const UPLOAD = {
	node1: 'https://up.arweave.net',
	node2: 'https://turbo.ardrive.io',
	batchSize: 1,
	chunkSize: 7500000,
	dispatchUploadSize: 100 * 1000,
};

export const PORTAL_DATA = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <title>Portal</title>
  </head>
  <body>
    <div id="portal"></div>
    <script type="module">
      function getGateway() {
        const host = window.location.hostname;
        const parts = host.split('.');
		return \`\${parts[parts.length - 2]}.\${parts[parts.length - 1]}\`;
      }

      const gateway = getGateway();

      const script = document.createElement('script');
      script.type = 'module';
      script.src = \`https://engine_portalenv.\${gateway}\`;
      document.body.appendChild(script);
    </script>
  </body>
</html>
`;

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
	],
	[PortalPatchMapEnum.Users]: ['Roles', 'RoleOptions', 'Permissions'],
	[PortalPatchMapEnum.Navigation]: ['Store.Categories', 'Store.Topics', 'Store.Links', 'Store.Domains'],
	[PortalPatchMapEnum.Presentation]: ['Store.Layout', 'Store.Pages', 'Store.Themes', 'Store.Fonts'],
	[PortalPatchMapEnum.Media]: ['Store.Uploads'],
	[PortalPatchMapEnum.Posts]: ['Store.Index'],
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

export const FONT_OPTIONS = {
	headers: [
		'Crimson Pro:400,600,700',
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
	],
	body: [
		'Open Sans:400,600,700',
		'Inter:400,600',
		'Roboto:400,500',
		'Lato:400,700',
		'Work Sans:400,500',
		'Source Sans Pro:400,600',
		'Merriweather:400,700',
		'DM Sans:400,500',
		'Nunito:400,700',
		'Hind:400,500',
		'Space Mono:400,700',
		'VT323',
		'Major Mono Display',
		'Rajdhani:400,500,700',
		'Titillium Web:400,600,700',
	],
};
