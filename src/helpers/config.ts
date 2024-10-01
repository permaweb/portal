import activity from 'assets/activity.svg';
import ar from 'assets/ar.svg';
import arconnect from 'assets/arconnect-wallet-logo.png';
import arrow from 'assets/arrow.svg';
import audio from 'assets/audio.svg';
import bridge from 'assets/bridge.svg';
import buy from 'assets/buy.svg';
import checkmark from 'assets/checkmark.svg';
import close from 'assets/close.svg';
import collection from 'assets/collection.svg';
import comments from 'assets/comments.svg';
import copy from 'assets/copy.svg';
import dark from 'assets/dark.svg';
import disconnect from 'assets/disconnect.svg';
import discord from 'assets/discord.svg';
import docs from 'assets/docs.svg';
import edit from 'assets/edit.svg';
import github from 'assets/github.svg';
import grid from 'assets/grid.svg';
import html from 'assets/html.svg';
import info from 'assets/info.svg';
import leaderboard from 'assets/leaderboard.svg';
import license from 'assets/license.svg';
import light from 'assets/light.svg';
import list from 'assets/list.svg';
import logo from 'assets/logo.svg';
import market from 'assets/market.svg';
import media from 'assets/media.svg';
import menu from 'assets/menu.svg';
import orders from 'assets/orders.svg';
import othent from 'assets/othent.svg';
import overview from 'assets/overview.svg';
import paste from 'assets/paste.svg';
import pixl from 'assets/pixl.svg';
import provenance from 'assets/provenance.svg';
import renderer from 'assets/renderer.svg';
import sell from 'assets/sell.svg';
import streak1 from 'assets/streak-1-7.svg';
import streak2 from 'assets/streak-8-14.svg';
import streak3 from 'assets/streak-15-29.svg';
import streak4 from 'assets/streak-30.svg';
import swap from 'assets/swap.svg';
import transfer from 'assets/transfer.svg';
import unsupported from 'assets/unsupported.svg';
import user from 'assets/user.svg';
import video from 'assets/video.svg';
import wallet from 'assets/wallet.svg';
import x from 'assets/x.svg';

import { SelectOptionType } from './types';

export const AO = {
	module: 'Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350',
	scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
	ucm: 'U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0',
	defaultToken: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
	profileRegistry: 'SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY',
	profileSrc: 'pbrl1fkS3_SZP3RqqPIjbt3-f81L9vIpV2_OnUmxqGQ',
};

export const ASSETS = {
	activity,
	ar,
	arconnect,
	arrow,
	audio,
	bridge,
	buy,
	checkmark,
	close,
	collection,
	comments,
	copy,
	dark,
	disconnect,
	discord,
	docs,
	edit,
	github,
	grid,
	html,
	info,
	leaderboard,
	license,
	light,
	list,
	logo,
	market,
	media,
	menu,
	orders,
	othent,
	overview,
	paste,
	pixl,
	provenance,
	renderer,
	sell,
	swap,
	transfer,
	unsupported,
	streak1,
	streak2,
	streak3,
	streak4,
	user,
	video,
	wallet,
	x,
};

export const DOM = {
	loader: 'loader',
	notification: 'notification',
	overlay: 'overlay',
};

export const GATEWAYS = {
	arweave: 'arweave.net',
	goldsky: 'arweave-search.goldsky.com',
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
			height: '32.5px',
			width: 'fit-content',
		},
		form: {
			small: '45px',
			max: '47.5px',
		},
		nav: {
			height: '75px',
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

export const CURSORS = {
	p1: 'P1',
	end: 'END',
};

export const PAGINATORS = {
	default: 100,
	landing: {
		assets: 20,
	},
	collection: {
		assets: 15,
	},
	profile: {
		assets: 15,
	},
};

export const REDIRECTS = {
	github: `#`,
	x: `#`,
	discord: `#`,
	helix: `#`,
	aox: `#`,
	arswap: `#`,
};

export const DEFAULTS = {
	banner: 'eXCtpVbcd_jZ0dmU2PZ8focaKxBGECBQ8wMib7sIVPo',
	thumbnail: 'lJovHqM9hwNjHV5JoY9NGWtt0WD-5D4gOqNL2VWW5jk',
};

export const ASSET_SORT_OPTIONS: SelectOptionType[] = [
	{ id: 'recently-listed', label: 'Recently listed' },
	{ id: 'low-to-high', label: 'Low to high' },
	{ id: 'high-to-low', label: 'High to low' },
];

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
