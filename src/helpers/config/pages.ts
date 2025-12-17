export const PAGES_JOURNAL = {
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
						width: 2,
						content: ['user', 'archive'],
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
		nonce: 'journal',
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
	search: {
		type: 'grid',
		nonce: 'journal',
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
};

export const PAGES_BLOG = {
	home: {
		type: 'grid',
		content: [
			{
				type: 'row',
				width: 1,
				content: [
					{
						type: 'postSpotlight',
						txId: null,
					},
				],
			},
			{
				type: 'row',
				width: 1,
				content: [
					{
						type: 'categorySpotlight',
						category: null,
					},
				],
				layout: {
					width: 'page',
					padding: '0 0',
					background: '0,0,0',
				},
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
						width: 3,
					},
					{
						type: 'sidebar',
						width: 1,
						content: ['date', 'authors', 'sources', 'podcasts'],
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
						content: ['user', 'archive'],
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
		nonce: 'blog',
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
	search: {
		type: 'grid',
		nonce: 'blog',
		content: [
			{
				type: 'row',
				width: 'page',
				content: [
					{
						type: 'feed',
						width: 3,
					},
				],
			},
		],
	},
};

export const PAGES_DOCUMENTATION = {
	home: {
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
	feed: {
		type: 'grid',
		content: [
			{
				type: 'row',
				width: 'page',
				content: [
					{
						type: 'feed',
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
				width: 'page',
				content: [
					{
						type: 'topbar',
						width: 1,
						content: ['user'],
					},
				],
			},
			{
				type: 'row',
				width: 'page',
				content: [
					{
						type: 'feed',
					},
				],
			},
		],
	},
	post: {
		type: 'grid',
		nonce: 'documentation',
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
	search: {
		type: 'grid',
		nonce: 'documentation',
		content: [
			{
				type: 'row',
				width: 'page',
				content: [
					{
						type: 'feed',
						width: 3,
					},
				],
			},
		],
	},
};
