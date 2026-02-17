export const POST_PREVIEW_BLOG = {
	id: 'blog',
	name: 'Blog',
	type: 'post-preview',
	layout: {
		direction: 'row',
		gap: '20px',
	},
	rows: [
		{
			id: 'row-main',
			columns: [
				{
					id: 'col-thumbnail',
					blocks: [
						{ id: 'title', type: 'title', layout: { flex: 2 } },
						{
							id: 'meta',
							type: 'body',
							layout: { direction: 'row', gap: '10px' },
							content: [
								{ id: 'author', type: 'author' },
								{ id: 'date', type: 'date' },
							],
						},
						{ id: 'thumbnail', type: 'thumbnail' },
						{ id: 'description', type: 'description' },
					],
				},
				{
					id: 'col-comments',
					blocks: [{ id: 'comments', type: 'comments' }],
				},
			],
		},
	],
	content: [
		{ id: 'categories', type: 'categories' },
		{ id: 'thumbnail', type: 'thumbnail' },
		{ id: 'title', type: 'title' },
		{ id: 'author', type: 'author' },
		{ id: 'date', type: 'date' },
		{ id: 'description', type: 'description' },
		{ id: 'comments', type: 'comments' },
	],
};

export const POST_PREVIEW_JOURNAL = {
	id: 'journal',
	name: 'Journal',
	type: 'post-preview',
	layout: {
		direction: 'column',
		gap: '40',
		padding: '0',
		paddingTop: '40px',
		topLine: true,
	},
	rows: [
		{
			id: 'row-categories',
			columns: [
				{
					id: 'col-categories',
					blocks: [
						{
							id: 'categories',
							type: 'categories',
							layout: { position: 'absolute', filter: 'invert' },
						},
					],
				},
			],
		},
		{
			id: 'row-main',
			columns: [
				{
					id: 'col-content',
					blocks: [
						{ id: 'title', type: 'title', layout: { flex: 2 } },
						{ id: 'description', type: 'description' },
						{
							id: 'meta',
							type: 'body',
							layout: { direction: 'row', gap: '10px' },
							content: [
								{ id: 'author', type: 'author' },
								{ id: 'date', type: 'date' },
							],
						},
					],
				},
				{
					id: 'col-thumbnail',
					blocks: [{ id: 'thumbnail', type: 'thumbnail', layout: { flex: 3, aspectRatio: '16/6' } }],
				},
			],
		},
	],
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
		{ id: 'comments', type: 'comments' },
	],
};

export const POST_PREVIEW_MINIMAL = {
	id: 'minimal',
	name: 'Minimal',
	type: 'post-preview',
	layout: {
		direction: 'column',
		gap: '10px',
		topLine: true,
	},
	rows: [
		{
			id: 'row-categories',
			columns: [
				{
					id: 'col-categories',
					blocks: [{ id: 'categories', type: 'categories' }],
				},
			],
		},
		{
			id: 'row-content',
			columns: [
				{
					id: 'col-content',
					blocks: [
						{ id: 'title', type: 'title' },
						{ id: 'description', type: 'description' },
						{
							id: 'meta',
							type: 'body',
							layout: { direction: 'row', gap: '10px' },
							content: [
								{ id: 'author', type: 'author' },
								{ id: 'date', type: 'date' },
							],
						},
					],
				},
			],
		},
	],
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
