import { WalletEnum } from '../types';

export const PORTALID = 'r-5yMlWFOZ_LpSHXeHwXGkkit-2BsL-0nmhDbUiQAv8' // IMA LATEST
// export const PORTALID = 'vetd50Op5FBl8hdwzXGRmP86VPlCGmw05G6Tvo5Jvdo'

export const AO = {
	module: import.meta.env.MODULE,
	scheduler: import.meta.env.SCHEDULER,
	defaultToken: import.meta.env.DEFAULT_TOKEN,
	collectionsRegistry: import.meta.env.COLLECTIONS_REGISTRY,
	profileRegistry: 'jndJ0phxOaJJU6CHZVX7zo2Wl5vI2KQ1z4i3VnV4DrM',
	profileSrc: import.meta.env.PROFILE_SRC,
};

export const AR_WALLETS = [
	{ type: WalletEnum.extension, logo: null },
	{ type: WalletEnum.embedded, logo: null },	
];

export const DOM = {
	loader: 'loader',
	overlay: 'overlay',
};

export const GATEWAYS = {
	arweave: 'arweave.net', // 'https://permagate.io', //
	goldsky: 'arweave-search.goldsky.com',
};

export const TAGS = {
	keys: {
		access: 'Access-Fee',
		avatar: 'Avatar',
		banner: 'Banner',
		collectionId: 'Collection-Id',
		collectionName: 'Collection-Name',
		commericalUse: 'Commercial-Use',
		contentType: 'Content-Type',
		creator: 'Creator',
		currency: 'Currency',
		dataModelTraining: 'Data-Model-Training',
		dataProtocol: 'Data-Protocol',
		dateCreated: 'Date-Created',
		derivations: 'Derivations',
		description: 'Description',
		displayName: 'Display-Name',
		handle: 'Handle',
		implements: 'Implements',
		initialOwner: 'Initial-Owner',
		license: 'License',
		name: 'Name',
		paymentAddress: 'Payment-Address',
		paymentMode: 'Payment-Mode',
		profileIndex: 'Profile-Index',
		protocolName: 'Protocol-Name',
		renderWith: 'Render-With',
		thumbnail: 'Thumbnail',
		title: 'Title',
	},
	values: {
		collection: 'AO-Collection',
		profileVersions: {
			'1': 'Account-0.3',
		},
	},
};

export const WALLET_PERMISSIONS = ['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'DISPATCH', 'SIGNATURE'];

function createURLs() {
	const base = `/`;
	const collection = `${base}collection/`;
	const profile = `${base}profile/`;
	return {
		base: base,
		asset: `${base}asset/`,
		collection: collection,
		collectionAssets: (id: string) => `${collection}${id}/assets/`,
		collectionActivity: (id: string) => `${collection}${id}/activity/`,
		collections: `${base}collections/`,
		docs: `${base}docs/`,
		profile: profile,
		profileAssets: (address: string) => `${profile}${address}/assets/`,
		profileCollections: (address: string) => `${profile}${address}/collections/`,
		profileListings: (address: string) => `${profile}${address}/listings/`,
		profileActivity: (address: string) => `${profile}${address}/activity/`,
		notFound: `${base}404`,
	};
}

export const URLS = createURLs();

export const CURSORS = {
	p1: 'P1',
	end: 'END',
};

export const PAGINATORS = {
	default: 100,
	landing: {
		assets: 30,
	},
	collection: {
		assets: 15,
	},
	profile: {
		assets: 15,
	},
};

export const DEFAULTS = {
	banner: 'eXCtpVbcd_jZ0dmU2PZ8focaKxBGECBQ8wMib7sIVPo',
	thumbnail: 'lJovHqM9hwNjHV5JoY9NGWtt0WD-5D4gOqNL2VWW5jk',
};

export const CONTENT_TYPES = {
	json: 'application/json',
	mp4: 'video/mp4',
	textPlain: 'text/plain',
};

export const UPLOAD_CONFIG = {
	node1: 'https://up.arweave.net',
	node2: 'https://turbo.ardrive.io',
	batchSize: 1,
	chunkSize: 7500000,
	dispatchUploadSize: 100 * 1024,
};

export const STORAGE = {
	walletType: `wallet-type`,
	portal: (id: string) => `portal-${id}`,
	profile: (id: string) => `profile-${id}`,
};