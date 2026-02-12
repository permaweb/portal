export const POST_PREVIEW_BLOG = {
	id: 'blog',
	name: 'Blog',
	type: 'post-preview',
	layout: {
		direction: 'row',
		gap: '20px',
	},
	content: [
		{ id: 'title', type: 'title' },
		{ id: 'thumbnail', type: 'thumbnail' },
		{ id: 'author', type: 'author' },
		{ id: 'date', type: 'date' },
		{ id: 'description', type: 'description' },
	],
};

export const POST_PREVIEW_JOURNAL = {
	id: 'journal',
	name: 'Journal',
	type: 'post-preview',
	layout: {
		direction: 'column',
		gap: '20px',
		paddingTop: '40px',
		topLine: true,
	},
	content: [
		{ id: 'categories', type: 'categories', layout: { position: 'absolute', filter: 'invert' } },
		{
			type: 'body',
			layout: { direction: 'row', gap: '20px' },
			content: [
				{
					type: 'body',
					layout: { flex: 2, direction: 'column' },
					content: [
						{ id: 'title', type: 'title' },
						{ id: 'description', type: 'description' },
						{ type: 'meta', content: ['author', 'date'] },
					],
				},
				{ id: 'thumbnail', type: 'thumbnail', layout: { flex: 3, aspectRatio: '16/6' } },
			],
		},
	],
};

export const POST_PREVIEW_MINIMAL = {
	id: 'minimal',
	name: 'Minimal',
	type: 'post-preview',
	layout: {
		direction: 'column',
		gap: '10px',
	},
	content: [
		{ id: 'categories', type: 'categories' },
		{ id: 'title', type: 'title' },
		{ id: 'description', type: 'description' },
		{ id: 'author', type: 'author' },
		{ id: 'date', type: 'date' },
	],
};

export const POST_PREVIEWS = {
	blog: POST_PREVIEW_BLOG,
	journal: POST_PREVIEW_JOURNAL,
	minimal: POST_PREVIEW_MINIMAL,
};
