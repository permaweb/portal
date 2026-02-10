export const POST_PREVIEW_BLOG = {
	id: 'blog',
	name: 'Blog',
	type: 'post-preview',
	layout: {
		direction: 'row',
		gap: '20px',
	},
	content: [
		{ id: 'thumbnail', type: 'thumbnail' },
		{ id: 'title', type: 'title' },
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
		direction: 'row',
		gap: '20px',
	},
	content: [
		{ id: 'categories', type: 'categories' },
		{ id: 'title', type: 'title' },
		{ id: 'description', type: 'description' },
		{ id: 'author', type: 'author' },
		{ id: 'date', type: 'date' },
		{ id: 'thumbnail', type: 'thumbnail' },
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
