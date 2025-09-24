export const LAYOUT_JOURNAL = {
	basics: {
		gradient: true,
		wallpaper: '',
		borderRadius: 0,
		maxWidth: 1600,
		padding: '0 20px',
	},
	header: {
		layout: {
			width: 'page',
			height: '100px',
			padding: '0 20px',
			border: {
				top: false,
				sides: false,
				bottom: true,
			},
		},
		content: {
			logo: {
				display: true,
				positionX: 'left',
				positionY: 'bottom',
				size: '80%',
			},
			links: [],
		},
	},
	navigation: {
		layout: {
			width: 'page',
			height: 50,
			padding: '0 20px',
			gradient: false,
			shadow: true,
			border: {
				top: false,
				sides: false,
				bottom: true,
			},
		},
		content: {
			links: [],
		},
	},
	footer: {
		layout: {
			width: 'page',
			height: 'auto',
			padding: '20px',
			gradient: false,
			border: {
				top: true,
				sides: false,
				bottom: false,
			},
		},
		content: {
			links: [],
		},
	},
	page: {
		layout: {
			structure: 'single-column',
			padding: '40px 20px',
		},
	},
};
