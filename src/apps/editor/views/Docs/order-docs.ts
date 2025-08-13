interface DocItem {
	name: string;
	path: string;
	children?: DocItem[];
}

const en: DocItem[] = [
	{
		name: 'Overview',
		path: 'overview',
		children: [
			{
				name: 'Introduction',
				path: 'introduction',
			},
		],
	},
	{
		name: 'Setup',
		path: 'setup',
		children: [
			{
				name: 'Categories',
				path: 'categories',
			},
			{
				name: 'Links',
				path: 'links',
			},
			{
				name: 'Tags',
				path: 'tags',
			},
			{
				name: 'Media',
				path: 'media',
			},
		],
	},
	{
		name: 'Design',
		path: 'design',
		children: [
			{
				name: 'Themes',
				path: 'themes',
			},
		],
	},
	{
		name: 'Posts',
		path: 'posts',
		children: [
			{
				name: 'Editor',
				path: 'editor',
			},
		],
	},
	{
		name: 'Users',
		path: 'users',
		children: [
			{
				name: 'User Management',
				path: 'management',
			},
		],
	},
];

const es: DocItem[] = [
	{
		name: 'Resumen',
		path: 'overview',
		children: [
			{
				name: 'Introducción',
				path: 'introduction',
			},
		],
	},
	{
		name: 'Configuración',
		path: 'setup',
		children: [
			{
				name: 'Categorías',
				path: 'categories',
			},
			{
				name: 'Enlaces',
				path: 'links',
			},
			{
				name: 'Etiquetas',
				path: 'Tags',
			},
			{
				name: 'Medios',
				path: 'media',
			},
		],
	},
	{
		name: 'Diseño',
		path: 'design',
		children: [
			{
				name: 'Temas',
				path: 'themes',
			},
		],
	},
	{
		name: 'Publicaciones',
		path: 'posts',
		children: [
			{
				name: 'Editor',
				path: 'editor',
			},
		],
	},
	{
		name: 'Usuarios',
		path: 'users',
		children: [
			{
				name: 'Gestión de usuarios',
				path: 'management',
			},
		],
	},
];

export const docsOrder: { [lang: string]: DocItem[] } = {
	en,
	es,
};
