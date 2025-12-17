export const THEME_DEFAULT = {
	name: 'Default',
	active: true,
	basics: {
		colors: {
			text: {
				light: '0,0,0',
				dark: '255,255,255',
			},
			background: {
				light: '250,250,250',
				dark: '20,20,20',
			},
			primary: {
				light: '94,102,219',
				dark: '94,102,219',
			},
			secondary: {
				light: '56,189,128',
				dark: '56,189,128',
			},
			border: {
				light: '50, 50, 50',
				dark: '208, 208, 208',
			},
		},
		preferences: {
			borderRadius: 0,
		},
	},
	links: {
		colors: {
			default: {
				light: 'text',
				dark: 'text',
			},
			hover: {
				light: 'text',
				dark: 'text',
			},
		},
		preferences: {
			default: {
				underline: true,
				cursive: false,
				bold: false,
			},
			hover: {
				underline: true,
				cursive: false,
				bold: false,
			},
		},
	},
	header: {
		colors: {
			background: {
				light: 'background',
				dark: 'background',
			},
			border: {
				light: 'border',
				dark: 'border',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 0.4,
			},
			shadow: {
				light: 'unset',
				dark: 'unset',
			},
			gradient: {
				light: true,
				dark: true,
			},
		},
	},
	navigation: {
		colors: {
			background: {
				light: '238, 238, 238',
				dark: '32, 32, 32',
			},
			text: {
				light: 'text',
				dark: 'text',
			},
			border: {
				light: 'border',
				dark: 'border',
			},
			hover: {
				light: '50,50,50',
				dark: '208,208,208',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 1,
			},
			shadow: {
				light: 'unset',
				dark: 'unset',
			},
		},
	},
	content: {
		colors: {
			background: {
				light: '255,255,255',
				dark: '0,0,0',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 1,
			},
		},
	},
	footer: {
		colors: {
			background: {
				light: 'background',
				dark: 'background',
			},
			border: {
				light: 'border',
				dark: 'border',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 1,
			},
		},
	},
	post: {
		colors: {
			background: {
				light: '238,238,238',
				dark: '38,38,38',
			},
			border: {
				light: 'border',
				dark: 'border',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 0.9,
			},
		},
	},
	card: {
		colors: {
			background: {
				light: 'background',
				dark: 'background',
			},
			border: {
				light: '238,238,238',
				dark: '17,17,17',
			},
		},
		preferences: {
			opacity: {
				light: 1,
				dark: 1,
			},
			shadow: {
				light: '2px 4px 3px -1px rgba(0, 0, 0, 0.18)',
				dark: '2px 4px 3px -1px rgba(0, 0, 0, 0.18)',
			},
		},
	},
	buttons: {
		default: {
			default: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: '0,0,0',
						dark: '33,33,33',
					},
					border: {
						light: '0,0,0',
						dark: '33,33,33',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
			hover: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: '50,50,50',
						dark: '50,50,50',
					},
					border: {
						light: '0,0,0',
						dark: '50,50,50',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
		},
		primary: {
			default: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: 'primary',
						dark: 'primary',
					},
					border: {
						light: 'primary',
						dark: 'primary',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
			hover: {
				colors: {
					color: {
						light: '255,255,255',
						dark: '255,255,255',
					},
					background: {
						light: 'primary',
						dark: 'primary',
					},
					border: {
						light: 'primary',
						dark: 'primary',
					},
				},
				preferences: {
					opacity: {
						light: 1,
						dark: 1,
					},
				},
			},
		},
	},
};

export const THEME_DOCUMENTATION_PATCH = {
	basics: {
		colors: {
			border: {
				light: '226, 226, 226',
				dark: '17, 17, 17',
			},
		},
	},
	navigation: {
		colors: {
			background: {
				light: '238, 238, 238',
				dark: '17, 17, 17',
			},
		},
	},
};
