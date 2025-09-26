import { getTxEndpoint } from './endpoints';
import { ArticleBlockEnum, PortalPatchMapEnum } from './types';

import { LAYOUT_JOURNAL } from './config/layouts';
export const LAYOUT = { JOURNAL: LAYOUT_JOURNAL };
import { THEME_DEFAULT } from './config/themes';
export const THEME = { DEFAULT: THEME_DEFAULT };
import { PAGES_JOURNAL } from './config/pages';
export const PAGES = { JOURNAL: PAGES_JOURNAL };

import { ICONS_UI, ICONS_SOCIAL } from './config/icons';
export { ICONS_UI, ICONS_SOCIAL };

export const AO_NODE = {
	url: 'https://hb.portalinto.com',
	scheduler: 'a5ZMUKbGClAsKzB4SHDYrwkOZZHIIfpbaxrmKwUHCe8',
};

export const IS_TESTNET = import.meta.env.VITE_ARIO_TESTNET === 'true';

export const ASSETS = {
	add: getTxEndpoint('RLWnDhoB0Dd_X-sLnNy4w2S7ds3l9591HcHK8nc3YRw'),
	alignBottom: getTxEndpoint('kx2grnSUx7D7Y96EJIjTy11WJB8I8rZl4T8x3IVK3wM'),
	alignLeft: getTxEndpoint('jHhvPhSRsf_19R9X0vza0a9J5N6n4pJKYHpCv_3r3z4'),
	alignRight: getTxEndpoint('iaB67b8vGXFCFbupRCK4wgk_0fLSGmAuUs9ghbZLKHM'),
	alignTop: getTxEndpoint('ipK9O_qhzkDCa1E0iCn_rt3g9TSxkmHZzYcywsx8tNw'),
	arrow: getTxEndpoint('ghFL1fzQ2C1eEAnqSVvfAMP5Jikx7NKSPP5neoNPALw'),
	arrows: getTxEndpoint('9WYuWYKP1eE6kcmrW6IPCCnwqFvKX4DtWD0hVn2RRPo'),
	article: getTxEndpoint('upm3OCUmKcVpgCP6QCsMDspuUovC4WamRXql4iaFo9A'),
	checkmark: getTxEndpoint('mVnNwxm-F6CV043zVtORE-EaMWfd2j8w6HHX70IcVbI'),
	close: getTxEndpoint('BASlMnOWcLCcLUSrO2wUybQL_06231dLONeVkdTWs3o'),
	copy: getTxEndpoint('-Qc2PsDF3sVDiT56iaYMfGWttrjI8eRg-1U3WeQmKu0'),
	code: getTxEndpoint('Nv6GexQXf2PpTv8zYoLzysv0DzOiUK_aguqjnNraqDg'),
	dark: getTxEndpoint('frDBQmgmo9MLraz4dcGqknHOeUVj9Yx8XNfSozJd4Uo'),
	date: getTxEndpoint('zEaGL41CNpoN2qsdcvfPCV4TrH2WZrbF6wKDLW7m5Vg'),
	delete: getTxEndpoint('aKjWuVXkSeYOKzGP0MnnhHwoYUXqTHFMJfVCbqzYEo0'),
	disconnect: getTxEndpoint('eWncZs2hH5oNSsWTIImJhqdZ4-n0P4CfZbduK2ae4L4'),
	docs: getTxEndpoint('iJ2kFspeaXTNSl5aO8CZ2iLGA99Bmc0u-7PTX0Vl0l4'),
	drag: getTxEndpoint('BfwMIGxk7WTqI3rYOyzM0DQXAfo_n4I4yyBbTsqe_QE'),
	fullscreen: getTxEndpoint('eW1yhAoA__WirNKXh6uykdz0DmU033qkUS2fqiZjsok'),
	filter: getTxEndpoint('S7PKyYrmK3EbqWBTAHG66B9rzeVXXkL3VzmyE6jU8Io'),
	header1: getTxEndpoint('Me8rAW3kmQxPclDnl7lupTXyWg2t3vV3yfFdCzyXbNA'),
	header2: getTxEndpoint('6U8907x3L_phk9loiiBCHIXqDBWaV5IfK19IJnH8Q4A'),
	header3: getTxEndpoint('fBTN-aLZM0VFaLGw7VhBiGSdHuNDGcO0qGKbtXLiwnA'),
	header4: getTxEndpoint('aqARgutUdTd6PLAkAsWnIwWIfnUeB-1QQuS9cQKtPAM'),
	header5: getTxEndpoint('U5_VxgILAlOzUaHriKRfBWG7BaYa-_4fOdLJQNujb4U'),
	header6: getTxEndpoint('FNHeUsqLSBi2lqkkwovy2Boba9MHoCWcCnUzfxz7Ayg'),
	help: getTxEndpoint('827_dxZR1WAnw_hqxfwwb4jgP5m2fpkSrTMtdjRUWw4'),
	icon: getTxEndpoint('r_kglJ9PvNP8amVl77FVbU-8A9HK0kiFtzivdB00Zm4'),
	image: getTxEndpoint('357HeJjvG10nK28juQ8YMp6DlvHhGbmU7pOvZphEhUk'),
	info: getTxEndpoint('QQ4EJ_wH2EY1_ElfSNKffixnzVcbnvd2547lmluvT-0'),
	keyboard: getTxEndpoint('rMjFgHIRcEmy9P68Prpbgw9jvzWKL18m3vrJXIBwmao'),
	language: getTxEndpoint('SubbzPjabHW9zvY7Ecjqlwex47oxo1a5-Cgj84K1aYc'),
	layout: getTxEndpoint('U2cqnDWOoQr3mBpIOdsnJUPKS-G4v0twlwFTqvj4qkY'),
	light: getTxEndpoint('n-yu6JZZwWEF0aJE8B_UskiubcYmHDRTofyc5J1pvc4'),
	link: getTxEndpoint('UMfjnj-8e7fb3lYRdcFygu8c4JoBZq3hB-mzycYT4DU'),
	listOrdered: getTxEndpoint('LCGDNvNEerXlE8vE65J6XRuAMm54u2zNAyvwQbyoBEs'),
	listUnordered: getTxEndpoint('lSpJ-R6JoI9J814Iy2JJZWnrkvKU8iFqVIWtVsmI4Os'),
	menu: getTxEndpoint('0La3-o2_gGMDbkfV4zVVUMjTYQ7Cn9YWQ2JO-FbjAIk'),
	minus: getTxEndpoint('N5qqt8CLoSEfYj4_jon7MoEDlsgl_XrdMTIx4ny7InM'),
	navigation: getTxEndpoint('uFsSvBhbWZak9j5QWXIdeZ97ky_s0JsaIZ45KVXmD_8'),
	newTab: getTxEndpoint('8rHxhGbWrv_jPk3Ku_mL6BvTbdTiRLvSNPwOU-neU_I'),
	paragraph: getTxEndpoint('R18ieTzflNf8U8AGo4E__ZLUOvFjBBhOmRFUFll51Do'),
	plus: getTxEndpoint('v7jeKwAuE58KuolZ2a-E2AnyGWRQKnujTQtOxTyETLs'),
	post: getTxEndpoint('nPknvEex1uekCo-HZ-5uzsMw4u_rJzj8wZVK5QI3WKw'),
	quotes: getTxEndpoint('2D6HWs0jkqXe4aBVkJv2OTnaZ-heyGYzUJwDxp-Dqaw'),
	search: getTxEndpoint('yRgUeadiTV769j2tbEg2HnpXUohA_3M2oFZsHwNRqOU'),
	settings: getTxEndpoint('e3jdELVw-3jNIOCbWTYCh1fuH4zIa7tDqmOqE6HyizY'),
	shortcuts: getTxEndpoint('RHIjV5uz9SGb9FVDdc-MAQlXFRtfpnTwQWLexcClMW0'),
	site: getTxEndpoint('gAG4DPY73lacgyiBnXXCgaolI40yxh3CRcrS86TASoA'),
	success: getTxEndpoint('mVnNwxm-F6CV043zVtORE-EaMWfd2j8w6HHX70IcVbI'),
	time: getTxEndpoint('EDfjYP_Fq8XycJ92uVeLDCmOCUMoSoPVbAhfE1ZwCJE'),
	tools: getTxEndpoint('ORGiGGMr6wIsjVNmWuy9m-CIH8jbY3juwoDLDdxvER8'),
	upload: getTxEndpoint('fNHk67l-JsJMKyWvSXoO6Nmcxy1imhlKwACxSMEGKAE'),
	user: getTxEndpoint('aOk91wDJnZ1xQbQum0MHoaOldAiumdFjdjM4LVM83NQ'),
	video: getTxEndpoint('T2astk8vaCBLLP8PD2rXgLKbwhNYkdHXllXvGbk-Wps'),
	wallet: getTxEndpoint('_t97i0BzskALIFERWR6iDs_uX7U6bbd4-3Pqq3HDkfI'),
	warning: getTxEndpoint('BASlMnOWcLCcLUSrO2wUybQL_06231dLONeVkdTWs3o'),
	write: getTxEndpoint('SUWTk8Qtcub9EsP5PDF6-vzgKsP5Irg1bB9b8NImDDk'),
};

export const ASSET_UPLOAD = {
	src: {
		data: 'WdmjdPCc7OlHAE7IBwK8gHyKmQTakuwsQVst1I6kkh0',
	},
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
		pageCreate: (portalId: string) => `${pageBase(portalId)}create/`,
		pageEdit: (portalId: string) => `${pageBase(portalId)}edit/`,
		postCreateArticle: (portalId: string) => `${postCreateBase(portalId)}article/`,
		postCreateImage: (portalId: string) => `${postCreateBase(portalId)}image/`,
		postCreateVideo: (portalId: string) => `${postCreateBase(portalId)}video/`,
		postEditArticle: (portalId: string) => `${postEditBase(portalId)}article/`,
		postEditImage: (portalId: string) => `${postEditBase(portalId)}image/`,
		postEditVideo: (portalId: string) => `${postEditBase(portalId)}video/`,
		docs: docsBase,
		docsIntro: `${docsBase}overview/introduction`,
		docsEditor: `${docsBase}posts/editor`,
		notFound: `${base}404`,
	};
}

export const URLS = createURLs();

export const ARTICLE_BLOCKS = {
	[ArticleBlockEnum.Paragraph]: {
		type: ArticleBlockEnum.Paragraph,
		label: 'Paragraph',
		icon: ASSETS.paragraph,
		shortcut: 'Ctrl / P',
	},
	[ArticleBlockEnum.Quote]: {
		type: ArticleBlockEnum.Quote,
		label: 'Quote',
		icon: ASSETS.quotes,
		shortcut: 'Ctrl / Q',
	},
	[ArticleBlockEnum.OrderedList]: {
		type: ArticleBlockEnum.OrderedList,
		label: 'Numbered List',
		icon: ASSETS.listOrdered,
		shortcut: 'Ctrl / N',
	},
	[ArticleBlockEnum.UnorderedList]: {
		type: ArticleBlockEnum.UnorderedList,
		label: 'Bulleted List',
		icon: ASSETS.listUnordered,
		shortcut: 'Ctrl / B',
	},
	[ArticleBlockEnum.Code]: {
		type: ArticleBlockEnum.Code,
		label: 'Code',
		icon: ASSETS.code,
		shortcut: 'Ctrl / C',
	},
	[ArticleBlockEnum.Header1]: {
		type: ArticleBlockEnum.Header1,
		label: 'Header 1',
		icon: ASSETS.header1,
		shortcut: 'Ctrl / 1',
	},
	[ArticleBlockEnum.Header2]: {
		type: ArticleBlockEnum.Header2,
		label: 'Header 2',
		icon: ASSETS.header2,
		shortcut: 'Ctrl / 2',
	},
	[ArticleBlockEnum.Header3]: {
		type: ArticleBlockEnum.Header3,
		label: 'Header 3',
		icon: ASSETS.header3,
		shortcut: 'Ctrl / 3',
	},
	[ArticleBlockEnum.Header4]: {
		type: ArticleBlockEnum.Header4,
		label: 'Header 4',
		icon: ASSETS.header4,
		shortcut: 'Ctrl / 4',
	},
	[ArticleBlockEnum.Header5]: {
		type: ArticleBlockEnum.Header5,
		label: 'Header 5',
		icon: ASSETS.header5,
		shortcut: 'Ctrl / 5',
	},
	[ArticleBlockEnum.Header6]: {
		type: ArticleBlockEnum.Header6,
		label: 'Header 6',
		icon: ASSETS.header6,
		shortcut: 'Ctrl / 6',
	},
	[ArticleBlockEnum.Image]: {
		type: ArticleBlockEnum.Image,
		label: 'Image',
		icon: ASSETS.image,
		shortcut: 'Ctrl / I',
	},
	[ArticleBlockEnum.Video]: {
		type: ArticleBlockEnum.Video,
		label: 'Video',
		icon: ASSETS.video,
		shortcut: 'Ctrl / V',
	},
};

export const STRIPE_PUBLISHABLE_KEY =
	'pk_live_51JUAtwC8apPOWkDLMQqNF9sPpfneNSPnwX8YZ8y1FNDl6v94hZIwzgFSYl27bWE4Oos8CLquunUswKrKcaDhDO6m002Yj9AeKj';

export const PAYMENT_URL = 'https://payment.ardrive.io';

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
		<link rel="icon" href="https://arweave.net/WzomcwfXZ_4hhUvDso1wsyJpNBHGeHezFZQv3V706Hw" />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link
			href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Ramaraja&display=swap"
			rel="stylesheet"
		/>
		<link
			href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200..900;1,200..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Ramaraja&display=swap"
			rel="stylesheet"
		/>
		<title>Portal</title>
	</head>
	<body>
		<div id="portal"></div>
		<script type="module" src="https://engine_portalenv.arweave.net"></script>
	</body>
</html>
`;

export const PORTAL_PATCH_MAP = {
	[PortalPatchMapEnum.Overview]: ['Owner', 'Version', 'Store.Name', 'Store.Icon', 'Store.Logo'],
	[PortalPatchMapEnum.Users]: ['Roles', 'RoleOptions', 'Permissions'],
	[PortalPatchMapEnum.Navigation]: ['Store.Categories', 'Store.Topics', 'Store.Links'],
	[PortalPatchMapEnum.Presentation]: ['Store.Layout', 'Store.Pages', 'Store.Themes', 'Store.Fonts'],
	[PortalPatchMapEnum.Media]: ['Store.Uploads'],
	[PortalPatchMapEnum.Posts]: ['Store.Index'],
	[PortalPatchMapEnum.Requests]: ['Store.IndexRequests'],
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
