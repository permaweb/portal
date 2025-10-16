export const LAYOUT_JOURNAL = {
	basics: {
		gradient: true,
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

export const LAYOUT_BLOG = {
	basics: {
		gradient: true,
		borderRadius: 0,
		maxWidth: 1400,
		padding: '0',
	},
	header: {
		layout: {
			width: 'page',
			height: '120px',
			padding: '0',
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
		},
	},
	navigation: {
		layout: {
			width: 'page',
			height: 40,
			padding: '0',
			gradient: false,
			shadow: true,
			border: {
				top: false,
				sides: false,
				bottom: true,
			},
			opacity: 1,
		},
		content: {
			links: [],
		},
	},
	footer: {
		layout: {
			width: 'page',
			height: '46px',
			padding: '14px',
			verticalAlign: 'center',
			border: {
				top: false,
				sides: false,
				bottom: false,
			},
			fixed: false,
		},
		content: {
			links: [],
		},
	},
	page: {
		layout: {
			structure: 'single-column',
			padding: '30px 15px',
		},
	},
	card: {
		flow: 'column',
	},
};
