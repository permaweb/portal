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
