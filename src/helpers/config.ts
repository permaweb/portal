import { getTxEndpoint } from './endpoints';
import { ArticleBlockEnum } from './types';

export const AO_NODE = {
	url: 'https://hb.portalinto.com',
	scheduler: 'a5ZMUKbGClAsKzB4SHDYrwkOZZHIIfpbaxrmKwUHCe8',
};

// Testnet configuration
export const IS_TESTNET = import.meta.env.VITE_TESTNET === 'true';

export const SOCIAL_LINK_ASSETS = {
	dailyMotion: 'qO9Qi_WSCcZgqN-3D4eSApFyEHHSw6jZneGUGT8nLmA',
	odysee: 'XRcs4SS78ELZ6wERYtc0Spb_wKOjwcbEzVtJdmD_VZA',
	rumble: 'oRaYAiDVErIybil6EAbve1CGNjqK2geKWh4VgnW-7l8',
	telegram: 'iLtB9cZW1twB8dY6xPf14HP8-fvjv2ZlMS_Wr61OqBM',
	vk: 'LiUSQxbrRZfCsGa4fIRPrCKPA68YDupsXZNIkyDmxIg',
	x: 'vG2CXPwOCYIyVryDWj3e3FXhsFZmgx1YagxWEXhBpb4',
	facebook: '2znYL2CUA6KDjHY9xYrN8SuJ0EwziJ7__LN6uJBReRI',
	linkedin: 'vZRaGjLoAJWXx3Vnvcx5UhCAgwuL6iQz6FyH5MDuCZE',
	youtube: 'kdry-ZWvoQhcUP5ul3c3tqgNOBXWPsIIw5ssLI8_rSc',
	patreon: '7Gqu0FSqLoD6wcBjgtB-kUZCK6fPv9Y7JFDok7e_x54',
	rss: 'G-OvjLfhvtPwY5LAfEPf7b_EagZkmZ8eOGVTcjfaQxk',
};

export const ASSETS = {
	add: getTxEndpoint('RLWnDhoB0Dd_X-sLnNy4w2S7ds3l9591HcHK8nc3YRw'),
	alignBottom: getTxEndpoint('kx2grnSUx7D7Y96EJIjTy11WJB8I8rZl4T8x3IVK3wM'),
	alignLeft: getTxEndpoint('jHhvPhSRsf_19R9X0vza0a9J5N6n4pJKYHpCv_3r3z4'),
	alignRight: getTxEndpoint('iaB67b8vGXFCFbupRCK4wgk_0fLSGmAuUs9ghbZLKHM'),
	alignTop: getTxEndpoint('ipK9O_qhzkDCa1E0iCn_rt3g9TSxkmHZzYcywsx8tNw'),
	arconnect: getTxEndpoint('-A1IutbyzVDJHi91QwRDQ_mpNa9Jbz-Tapu4YDVsCrc'),
	arrow: getTxEndpoint('ghFL1fzQ2C1eEAnqSVvfAMP5Jikx7NKSPP5neoNPALw'),
	arrows: getTxEndpoint('9WYuWYKP1eE6kcmrW6IPCCnwqFvKX4DtWD0hVn2RRPo'),
	article: getTxEndpoint('upm3OCUmKcVpgCP6QCsMDspuUovC4WamRXql4iaFo9A'),
	checkmark: getTxEndpoint('mVnNwxm-F6CV043zVtORE-EaMWfd2j8w6HHX70IcVbI'),
	close: getTxEndpoint('BASlMnOWcLCcLUSrO2wUybQL_06231dLONeVkdTWs3o'),
	code: getTxEndpoint('Nv6GexQXf2PpTv8zYoLzysv0DzOiUK_aguqjnNraqDg'),
	dark: getTxEndpoint('frDBQmgmo9MLraz4dcGqknHOeUVj9Yx8XNfSozJd4Uo'),
	date: getTxEndpoint('zEaGL41CNpoN2qsdcvfPCV4TrH2WZrbF6wKDLW7m5Vg'),
	delete: getTxEndpoint('aKjWuVXkSeYOKzGP0MnnhHwoYUXqTHFMJfVCbqzYEo0'),
	design: getTxEndpoint('UUvx4WWSyuNC8fOQ5OsYudP77Reae8wmvHh1PDB196c'),
	disconnect: getTxEndpoint('eWncZs2hH5oNSsWTIImJhqdZ4-n0P4CfZbduK2ae4L4'),
	discord: getTxEndpoint('3X1BfFleeCZZdVZIx8DKDIblcLw7jzzRBCzSItlBy9E'),
	docs: getTxEndpoint('iJ2kFspeaXTNSl5aO8CZ2iLGA99Bmc0u-7PTX0Vl0l4'),
	domains: getTxEndpoint('HCp8UMAiBcJyBuMwH8PLrNM6lJqlRLGKe6iDRRBid6I'),
	drag: getTxEndpoint('BfwMIGxk7WTqI3rYOyzM0DQXAfo_n4I4yyBbTsqe_QE'),
	facebook: getTxEndpoint('mEcWrUwBKrp_9azlko-h2sta-UJu07UeCXPRBi8yDpA'),
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
	linkedin: getTxEndpoint('8S2jArSLL2aZYZy9_sUkFlqbZUpGhYUNmFFVI4gMbPo'),
	listOrdered: getTxEndpoint('LCGDNvNEerXlE8vE65J6XRuAMm54u2zNAyvwQbyoBEs'),
	listUnordered: getTxEndpoint('lSpJ-R6JoI9J814Iy2JJZWnrkvKU8iFqVIWtVsmI4Os'),
	media: getTxEndpoint('357HeJjvG10nK28juQ8YMp6DlvHhGbmU7pOvZphEhUk'),
	menu: getTxEndpoint('0La3-o2_gGMDbkfV4zVVUMjTYQ7Cn9YWQ2JO-FbjAIk'),
	minus: getTxEndpoint('N5qqt8CLoSEfYj4_jon7MoEDlsgl_XrdMTIx4ny7InM'),
	navigation: getTxEndpoint('uFsSvBhbWZak9j5QWXIdeZ97ky_s0JsaIZ45KVXmD_8'),
	newTab: getTxEndpoint('8rHxhGbWrv_jPk3Ku_mL6BvTbdTiRLvSNPwOU-neU_I'),
	pages: getTxEndpoint('q5_Jqu65WCd5waOk1KC6eGllxoCS8Mv40FWPzh2PUWA'),
	paragraph: getTxEndpoint('R18ieTzflNf8U8AGo4E__ZLUOvFjBBhOmRFUFll51Do'),
	plus: getTxEndpoint('v7jeKwAuE58KuolZ2a-E2AnyGWRQKnujTQtOxTyETLs'),
	portal: getTxEndpoint('WzomcwfXZ_4hhUvDso1wsyJpNBHGeHezFZQv3V706Hw'),
	post: getTxEndpoint('nPknvEex1uekCo-HZ-5uzsMw4u_rJzj8wZVK5QI3WKw'),
	posts: getTxEndpoint('scJ-YfxBggKURU_lF7eLLrKSe9L7cBD1GB1bcIpzKJI'),
	othent: getTxEndpoint('jDmU1yqdfK41qZ8mUj61MZlji-rX7bHJV12s1lMlw3A'),
	quotes: getTxEndpoint('2D6HWs0jkqXe4aBVkJv2OTnaZ-heyGYzUJwDxp-Dqaw'),
	search: getTxEndpoint('yRgUeadiTV769j2tbEg2HnpXUohA_3M2oFZsHwNRqOU'),
	settings: getTxEndpoint('e3jdELVw-3jNIOCbWTYCh1fuH4zIa7tDqmOqE6HyizY'),
	setup: getTxEndpoint('dyFHmCSxONAiUPJsr6HeAdED_MSsRAL9nQDvdmGryT0'),
	shortcuts: getTxEndpoint('RHIjV5uz9SGb9FVDdc-MAQlXFRtfpnTwQWLexcClMW0'),
	site: getTxEndpoint('gAG4DPY73lacgyiBnXXCgaolI40yxh3CRcrS86TASoA'),
	success: getTxEndpoint('mVnNwxm-F6CV043zVtORE-EaMWfd2j8w6HHX70IcVbI'),
	telegram: getTxEndpoint('uerxx9yd8y3DGRIJ4F9TjF4BryagPuINo5-Jo8qmno4'),
	time: getTxEndpoint('EDfjYP_Fq8XycJ92uVeLDCmOCUMoSoPVbAhfE1ZwCJE'),
	tools: getTxEndpoint('ORGiGGMr6wIsjVNmWuy9m-CIH8jbY3juwoDLDdxvER8'),
	upload: getTxEndpoint('fNHk67l-JsJMKyWvSXoO6Nmcxy1imhlKwACxSMEGKAE'),
	user: getTxEndpoint('aOk91wDJnZ1xQbQum0MHoaOldAiumdFjdjM4LVM83NQ'),
	users: getTxEndpoint('LfFkPVJBgBWgJwCtoceyS_EAyYa-r__AjAB5_JAx3aw'),
	video: getTxEndpoint('T2astk8vaCBLLP8PD2rXgLKbwhNYkdHXllXvGbk-Wps'),
	wallet: getTxEndpoint('_t97i0BzskALIFERWR6iDs_uX7U6bbd4-3Pqq3HDkfI'),
	wander: getTxEndpoint('XQOALlQ0rLluskwDip0gcT3suhue1v7CdMFvIVuItoU'),
	warning: getTxEndpoint('BASlMnOWcLCcLUSrO2wUybQL_06231dLONeVkdTWs3o'),
	write: getTxEndpoint('SUWTk8Qtcub9EsP5PDF6-vzgKsP5Irg1bB9b8NImDDk'),
	x: getTxEndpoint('8j0KOYorbeN1EI2_tO-o9tUYi4LJkDwFCDStu0sWMV8'),
	youtube: getTxEndpoint('vEToNqLt0U4CXLW-u7DykeGNqFLfuzKWebnu_1d5FRs'),
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
		max: '1600px',
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
		portalDomains: (portalId: string) => `${portalBase(portalId)}domains/`,
		portalDomainsRegister: (portalId: string) => `${portalBase(portalId)}domains/register`,
		portalUsers: (portalId: string) => `${portalBase(portalId)}users/`,
		portalPages: (portalId: string) => `${portalBase(portalId)}pages/`,
		portalLayout: (portalId: string) => `${portalBase(portalId)}layout/`,
		portalSetup: (portalId: string) => `${portalBase(portalId)}setup/`,
		post: (postId: string) => `post/${postId}`,
		postCreate: (portalId: string) => `${postCreateBase(portalId)}`,
		postEdit: (portalId: string) => `${postEditBase(portalId)}`,
		// pageCreate: (portalId: string) => `${pageBase(portalId)}create/`,
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

export const DEFAULT_LAYOUT = {
	basics: {
		gradient: true,
		wallpaper: '',
		borderRadius: 0,
		maxWidth: 1600,
		padding: '0 20px',
	},
	header: {
		layout: {
			width: 'page',
			height: '100px',
			padding: '0 20px',
			border: {
				top: false,
				sides: false,
				bottom: true,
			},
		},
		content: {
			logo: {
				display: true,
				positionX: 'left',
				positionY: 'bottom',
				txId: null,
				size: '80%',
			},
			links: [],
		},
	},
	navigation: {
		layout: {
			width: 'page',
			height: 50,
			padding: '0 20px',
			gradient: false,
			shadow: true,
			border: {
				top: false,
				sides: false,
				bottom: true,
			},
		},
		content: {
			links: [],
		},
	},
	footer: {
		layout: {
			width: 'page',
			height: 'auto',
			padding: '20px',
			gradient: false,
			border: {
				top: true,
				sides: false,
				bottom: false,
			},
		},
		content: {
			links: [],
		},
	},
	page: {
		layout: {
			structure: 'single-column',
			padding: '40px 20px',
		},
	},
};

export const DEFAULT_THEME = {
	name: 'Default',
	active: true,
	basics: {
		colors: {
			text: {
				light: '0,0,0',
				dark: '255,255,255',
			},
			background: {
				light: '250,250,250',
				dark: '20,20,20',
			},
			primary: {
				light: '151,151,151',
				dark: '77,77,77',
			},
			secondary: {
				light: '161,161,161',
				dark: '88,88,88',
			},
			border: {
				light: '50, 50, 50',
				dark: '208, 208, 208',
			},
		},
		preferences: {
			borderRadius: 0,
			wallpaper: undefined,
		},
	},
	header: {
		colors: {
			background: {
				light: 'background',
				dark: 'background',
			},
			border: {
				light: 'border',
				dark: 'border',
			},
			shadow: {
				light: 'rgba(0, 0, 0, 0.4)',
				dark: 'rgba(0, 0, 0, 0.4)',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 0.4,
			},
			shadow: {
				light: '0 4px 10px',
				dark: '0 4px 10px',
			},
			gradient: {
				light: true,
				dark: true,
			},
		},
	},
	navigation: {
		colors: {
			background: {
				light: '238, 238, 238',
				dark: '32, 32, 32',
			},
			text: {
				light: 'text',
				dark: 'text',
			},
			border: {
				light: 'border',
				dark: 'border',
			},
			hover: {
				light: '50,50,50',
				dark: '208,208,208',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 1,
			},
			shadow: {
				light: 'unset',
				dark: '0 2px 2px',
			},
		},
	},
	content: {
		colors: {
			background: {
				light: '255,255,255',
				dark: '0,0,0',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 1,
			},
		},
	},
	footer: {
		colors: {
			background: {
				light: 'background',
				dark: 'background',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 1,
			},
		},
	},
	card: {
		colors: {
			background: {
				light: undefined,
				dark: undefined,
			},
			border: {
				light: 'border',
				dark: 'border',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 0.6,
			},
		},
	},
	buttons: {
		default: {
			default: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: '0,0,0',
						dark: '33,33,33',
					},
					border: {
						light: '0,0,0',
						dark: '33,33,33',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
			hover: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: '50,50,50',
						dark: '50,50,50',
					},
					border: {
						light: '0,0,0',
						dark: '50,50,50',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
		},
		primary: {
			default: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: 'primary',
						dark: 'primary',
					},
					border: {
						light: 'primary',
						dark: 'primary',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
			hover: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: 'primary',
						dark: 'primary',
					},
					border: {
						light: 'primary',
						dark: 'primary',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
		},
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

export const DEFAULT_PAGES = {
	home: {
		type: 'grid',
		content: [
			{
				type: 'row',
				width: 1,
				layout: {
					separation: true,
				},
				content: [
					{
						width: 2,
						type: 'feed',
						layout: 'journal',
					},
					{
						width: 1,
						type: 'feed',
						layout: 'minimal',
					},
				],
			},
		],
	},
	feed: {
		type: 'grid',
		content: [
			{
				type: 'row',
				width: 'page',
				content: [
					{
						type: 'feed',
						layout: 'journal',
						width: 3,
					},
				],
			},
		],
	},
	user: {
		type: 'grid',
		content: [
			{
				type: 'row',
				width: 3,
				content: [
					{
						type: 'sidebar',
						width: 1,
						content: ['user'],
					},
					{
						type: 'feed',
						width: 3,
					},
				],
			},
		],
	},
	post: {
		type: 'grid',
		content: [
			{
				type: 'row',
				width: 'page',
				content: [
					{
						type: 'post',
					},
				],
			},
		],
	},
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
		<div id="root"></div>
		<script type="module" src="https://script_portal.arweave.net"></script>
	</body>
</html>
`;

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
