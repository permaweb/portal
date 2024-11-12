import { getTxEndpoint } from './endpoints';
import { ArticleBlockEnum } from './types';

export const ASSETS = {
	add: getTxEndpoint('RLWnDhoB0Dd_X-sLnNy4w2S7ds3l9591HcHK8nc3YRw'),
	alignBottom: getTxEndpoint('kx2grnSUx7D7Y96EJIjTy11WJB8I8rZl4T8x3IVK3wM'),
	alignLeft: getTxEndpoint('jHhvPhSRsf_19R9X0vza0a9J5N6n4pJKYHpCv_3r3z4'),
	alignRight: getTxEndpoint('iaB67b8vGXFCFbupRCK4wgk_0fLSGmAuUs9ghbZLKHM'),
	alignTop: getTxEndpoint('ipK9O_qhzkDCa1E0iCn_rt3g9TSxkmHZzYcywsx8tNw'),
	arconnect: getTxEndpoint('-A1IutbyzVDJHi91QwRDQ_mpNa9Jbz-Tapu4YDVsCrc'),
	arrow: getTxEndpoint('ghFL1fzQ2C1eEAnqSVvfAMP5Jikx7NKSPP5neoNPALw'),
	article: getTxEndpoint('upm3OCUmKcVpgCP6QCsMDspuUovC4WamRXql4iaFo9A'),
	checkmark: getTxEndpoint('mVnNwxm-F6CV043zVtORE-EaMWfd2j8w6HHX70IcVbI'),
	close: getTxEndpoint('BASlMnOWcLCcLUSrO2wUybQL_06231dLONeVkdTWs3o'),
	code: getTxEndpoint('Nv6GexQXf2PpTv8zYoLzysv0DzOiUK_aguqjnNraqDg'),
	dark: getTxEndpoint('frDBQmgmo9MLraz4dcGqknHOeUVj9Yx8XNfSozJd4Uo'),
	delete: getTxEndpoint('aKjWuVXkSeYOKzGP0MnnhHwoYUXqTHFMJfVCbqzYEo0'),
	design: getTxEndpoint('UUvx4WWSyuNC8fOQ5OsYudP77Reae8wmvHh1PDB196c'),
	disconnect: getTxEndpoint('eWncZs2hH5oNSsWTIImJhqdZ4-n0P4CfZbduK2ae4L4'),
	discord: getTxEndpoint('3X1BfFleeCZZdVZIx8DKDIblcLw7jzzRBCzSItlBy9E'),
	docs: getTxEndpoint('iJ2kFspeaXTNSl5aO8CZ2iLGA99Bmc0u-7PTX0Vl0l4'),
	domains: getTxEndpoint('HCp8UMAiBcJyBuMwH8PLrNM6lJqlRLGKe6iDRRBid6I'),
	drag: getTxEndpoint('BfwMIGxk7WTqI3rYOyzM0DQXAfo_n4I4yyBbTsqe_QE'),
	facebook: getTxEndpoint('mEcWrUwBKrp_9azlko-h2sta-UJu07UeCXPRBi8yDpA'),
	header1: getTxEndpoint('Me8rAW3kmQxPclDnl7lupTXyWg2t3vV3yfFdCzyXbNA'),
	header2: getTxEndpoint('6U8907x3L_phk9loiiBCHIXqDBWaV5IfK19IJnH8Q4A'),
	header3: getTxEndpoint('fBTN-aLZM0VFaLGw7VhBiGSdHuNDGcO0qGKbtXLiwnA'),
	header4: getTxEndpoint('aqARgutUdTd6PLAkAsWnIwWIfnUeB-1QQuS9cQKtPAM'),
	header5: getTxEndpoint('U5_VxgILAlOzUaHriKRfBWG7BaYa-_4fOdLJQNujb4U'),
	header6: getTxEndpoint('FNHeUsqLSBi2lqkkwovy2Boba9MHoCWcCnUzfxz7Ayg'),
	help: getTxEndpoint('827_dxZR1WAnw_hqxfwwb4jgP5m2fpkSrTMtdjRUWw4'),
	image: getTxEndpoint('357HeJjvG10nK28juQ8YMp6DlvHhGbmU7pOvZphEhUk'),
	info: getTxEndpoint('QQ4EJ_wH2EY1_ElfSNKffixnzVcbnvd2547lmluvT-0'),
	keyboard: getTxEndpoint('rMjFgHIRcEmy9P68Prpbgw9jvzWKL18m3vrJXIBwmao'),
	layout: getTxEndpoint('U2cqnDWOoQr3mBpIOdsnJUPKS-G4v0twlwFTqvj4qkY'),
	light: getTxEndpoint('n-yu6JZZwWEF0aJE8B_UskiubcYmHDRTofyc5J1pvc4'),
	link: getTxEndpoint('UMfjnj-8e7fb3lYRdcFygu8c4JoBZq3hB-mzycYT4DU'),
	linkedin: getTxEndpoint('8S2jArSLL2aZYZy9_sUkFlqbZUpGhYUNmFFVI4gMbPo'),
	listOrdered: getTxEndpoint('LCGDNvNEerXlE8vE65J6XRuAMm54u2zNAyvwQbyoBEs'),
	listUnordered: getTxEndpoint('lSpJ-R6JoI9J814Iy2JJZWnrkvKU8iFqVIWtVsmI4Os'),
	logo: getTxEndpoint('4txDbfbymP1RNMQCsFzyZOZR9qeUZXt_IacmL4IXYD8'),
	menu: getTxEndpoint('0La3-o2_gGMDbkfV4zVVUMjTYQ7Cn9YWQ2JO-FbjAIk'),
	navigation: getTxEndpoint('uFsSvBhbWZak9j5QWXIdeZ97ky_s0JsaIZ45KVXmD_8'),
	paragraph: getTxEndpoint('R18ieTzflNf8U8AGo4E__ZLUOvFjBBhOmRFUFll51Do'),
	portals: getTxEndpoint('WzomcwfXZ_4hhUvDso1wsyJpNBHGeHezFZQv3V706Hw'),
	post: getTxEndpoint('nPknvEex1uekCo-HZ-5uzsMw4u_rJzj8wZVK5QI3WKw'),
	posts: getTxEndpoint('scJ-YfxBggKURU_lF7eLLrKSe9L7cBD1GB1bcIpzKJI'),
	othent: getTxEndpoint('jDmU1yqdfK41qZ8mUj61MZlji-rX7bHJV12s1lMlw3A'),
	quotes: getTxEndpoint('2D6HWs0jkqXe4aBVkJv2OTnaZ-heyGYzUJwDxp-Dqaw'),
	settings: getTxEndpoint('e3jdELVw-3jNIOCbWTYCh1fuH4zIa7tDqmOqE6HyizY'),
	setup: getTxEndpoint('dyFHmCSxONAiUPJsr6HeAdED_MSsRAL9nQDvdmGryT0'),
	shortcuts: getTxEndpoint('RHIjV5uz9SGb9FVDdc-MAQlXFRtfpnTwQWLexcClMW0'),
	success: getTxEndpoint('mVnNwxm-F6CV043zVtORE-EaMWfd2j8w6HHX70IcVbI'),
	telegram: getTxEndpoint('uerxx9yd8y3DGRIJ4F9TjF4BryagPuINo5-Jo8qmno4'),
	time: getTxEndpoint('EDfjYP_Fq8XycJ92uVeLDCmOCUMoSoPVbAhfE1ZwCJE'),
	tools: getTxEndpoint('ORGiGGMr6wIsjVNmWuy9m-CIH8jbY3juwoDLDdxvER8'),
	user: getTxEndpoint('aOk91wDJnZ1xQbQum0MHoaOldAiumdFjdjM4LVM83NQ'),
	users: getTxEndpoint('LfFkPVJBgBWgJwCtoceyS_EAyYa-r__AjAB5_JAx3aw'),
	video: getTxEndpoint('T2astk8vaCBLLP8PD2rXgLKbwhNYkdHXllXvGbk-Wps'),
	wallet: getTxEndpoint('_t97i0BzskALIFERWR6iDs_uX7U6bbd4-3Pqq3HDkfI'),
	warning: getTxEndpoint('BASlMnOWcLCcLUSrO2wUybQL_06231dLONeVkdTWs3o'),
	write: getTxEndpoint('SUWTk8Qtcub9EsP5PDF6-vzgKsP5Irg1bB9b8NImDDk'),
	x: getTxEndpoint('8j0KOYorbeN1EI2_tO-o9tUYi4LJkDwFCDStu0sWMV8'),
	youtube: getTxEndpoint('vEToNqLt0U4CXLW-u7DykeGNqFLfuzKWebnu_1d5FRs'),
};

export const ASSET_UPLOAD = {
	src: {
		data: 'lBWtTMWN-jtrecImXZsQ7noVQ9pofTjGBqsfwjdVApg',
		process: '2V8WnljDug2oa-b0F5jslqBTqmxZ63LLtg8uyjjRJx0',
	},
	ansType: 'blog-post',
	contentType: 'text/html',
};

export const DOM = {
	loader: 'loader',
	notification: 'notification',
	overlay: 'overlay',
};

export const STYLING = {
	cutoffs: {
		desktop: '1200px',
		initial: '1024px',
		max: '1600px',
		tablet: '840px',
		tabletSecondary: '768px',
		secondary: '540px',
	},
	dimensions: {
		button: {
			height: '35px',
			width: 'fit-content',
		},
		form: {
			small: '42.5px',
			max: '47.5px',
		},
		nav: {
			height: '65px',
			width: '260px',
		},
		radius: {
			primary: '7.5px',
			alt1: '15px',
			alt2: '5px',
			alt3: '2.5px',
		},
	},
};

function createURLs() {
	const base = `/`;
	const post = `post/`;

	const portalBase = (portalId: string) => `${base}${portalId}/`;
	const postCreateBase = (portalId: string) => `${base}${portalId}/${post}create/`;
	const postEditBase = (portalId: string) => `${base}${portalId}/${post}edit/`;

	return {
		base: base,
		portalBase: portalBase,
		portalDesign: (portalId: string) => `${portalBase(portalId)}design/`,
		portalPosts: (portalId: string) => `${portalBase(portalId)}posts/`,
		portalDomains: (portalId: string) => `${portalBase(portalId)}domains/`,
		portalUsers: (portalId: string) => `${portalBase(portalId)}users/`,
		portalSetup: (portalId: string) => `${portalBase(portalId)}setup/`,
		postCreate: (portalId: string) => `${postCreateBase(portalId)}`,
		postEdit: (portalId: string) => `${postEditBase(portalId)}`,
		postCreateArticle: (portalId: string) => `${postCreateBase(portalId)}article/`,
		postCreateImage: (portalId: string) => `${postCreateBase(portalId)}image/`,
		postCreateVideo: (portalId: string) => `${postCreateBase(portalId)}video/`,
		postEditArticle: (portalId: string) => `${postEditBase(portalId)}article/`,
		postEditImage: (portalId: string) => `${postEditBase(portalId)}image/`,
		postEditVideo: (portalId: string) => `${postEditBase(portalId)}video/`,
		docs: `${base}docs/`,
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
};
