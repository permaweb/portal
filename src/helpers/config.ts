import { getTxEndpoint } from './endpoints';

export const AO = {
	module: 'Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350',
	scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
	profileRegistry: 'SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY',
	profileSrc: 'pbrl1fkS3_SZP3RqqPIjbt3-f81L9vIpV2_OnUmxqGQ',
};

export const ASSETS = {
	add: getTxEndpoint('RLWnDhoB0Dd_X-sLnNy4w2S7ds3l9591HcHK8nc3YRw'),
	arconnect: getTxEndpoint('-A1IutbyzVDJHi91QwRDQ_mpNa9Jbz-Tapu4YDVsCrc'),
	arrow: getTxEndpoint('ghFL1fzQ2C1eEAnqSVvfAMP5Jikx7NKSPP5neoNPALw'),
	checkmark: getTxEndpoint('mVnNwxm-F6CV043zVtORE-EaMWfd2j8w6HHX70IcVbI'),
	close: getTxEndpoint('BASlMnOWcLCcLUSrO2wUybQL_06231dLONeVkdTWs3o'),
	dark: getTxEndpoint('frDBQmgmo9MLraz4dcGqknHOeUVj9Yx8XNfSozJd4Uo'),
	disconnect: getTxEndpoint('eWncZs2hH5oNSsWTIImJhqdZ4-n0P4CfZbduK2ae4L4'),
	docs: getTxEndpoint('iJ2kFspeaXTNSl5aO8CZ2iLGA99Bmc0u-7PTX0Vl0l4'),
	info: getTxEndpoint('QQ4EJ_wH2EY1_ElfSNKffixnzVcbnvd2547lmluvT-0'),
	light: getTxEndpoint('n-yu6JZZwWEF0aJE8B_UskiubcYmHDRTofyc5J1pvc4'),
	logo: getTxEndpoint('4txDbfbymP1RNMQCsFzyZOZR9qeUZXt_IacmL4IXYD8'),
	media: getTxEndpoint('357HeJjvG10nK28juQ8YMp6DlvHhGbmU7pOvZphEhUk'),
	menu: getTxEndpoint('0La3-o2_gGMDbkfV4zVVUMjTYQ7Cn9YWQ2JO-FbjAIk'),
	navigation: getTxEndpoint('uFsSvBhbWZak9j5QWXIdeZ97ky_s0JsaIZ45KVXmD_8'),
	portals: getTxEndpoint('WzomcwfXZ_4hhUvDso1wsyJpNBHGeHezFZQv3V706Hw'),
	othent: getTxEndpoint('jDmU1yqdfK41qZ8mUj61MZlji-rX7bHJV12s1lMlw3A'),
	user: getTxEndpoint('aOk91wDJnZ1xQbQum0MHoaOldAiumdFjdjM4LVM83NQ'),
	wallet: getTxEndpoint('_t97i0BzskALIFERWR6iDs_uX7U6bbd4-3Pqq3HDkfI'),
	write: getTxEndpoint('SUWTk8Qtcub9EsP5PDF6-vzgKsP5Irg1bB9b8NImDDk'),
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
		max: '1440px',
		tablet: '840px',
		tabletSecondary: '768px',
		secondary: '540px',
	},
	dimensions: {
		button: {
			height: '37.5px',
			width: 'fit-content',
		},
		form: {
			small: '45px',
			max: '47.5px',
		},
		nav: {
			height: '65px',
			width: '260px',
		},
		radius: {
			primary: '10px',
			alt1: '15px',
			alt2: '5px',
			alt3: '2.5px',
		},
	},
};

function createURLs() {
	const base = `/`;
	return {
		base: base,
		docs: `${base}docs/`,
		notFound: `${base}404`,
	};
}

export const URLS = createURLs();
