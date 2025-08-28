export declare type PortalLayout = {
	basics: {
		gradient: boolean;
		wallpaper: string;
		borderRadius: number;
	};
	header: {
		layout: Layout;
		content: HeaderContent;
	};
	navigation: {
		layout: Layout;
		content?: {};
	};
	footer: {
		layout: Layout;
		content?: Content;
	};
	content: {
		layout: Layout;
		content: Content;
	};
	post: {
		layout: Layout;
	};
	card: {
		flow: string;
		background: {
			dark: string;
			light: string;
		};
		shadow: boolean;
		opacity: {
			dark: number;
			light: number;
		};
	};
	pages: {
		home: {
			type: BlockTypes;
			content: Array<{
				type: BlockTypes;
				width?: number;
				content?: any[];
				category?: string;
				layout?: {
					width?: string;
					padding?: string;
					background?: {
						Dark: string;
						Light: string;
					};
				};
				txId?: string;
			}>;
		};
		articles: {
			type: BlockTypes;
			content: Content;
		};
		feed: {
			type: BlockTypes;
			content: Content;
		};
		user: {
			type: BlockTypes;
			content: Content;
		};
		post: {
			type: BlockTypes;
			content: Content;
		};
	};
};

export declare type Layout = {
	width: string;
	height: string;
	padding: string;
	gradient?: boolean;
	shadow?: boolean;
	opacity?: number;
	fixed?: boolean;
	background?: string;
	verticalAlign?: string;
	horizontalAlign?: string;
	border: {
		top: boolean;
		sides: boolean;
		bottom: boolean;
	};
};

declare type Content = Array<Layout>;

declare type HeaderContent = {
	logo: {
		display: boolean;
		positionX: string;
		positionY: string;
		txId: string;
		size: string;
	};
	links: {
		title: string;
		icon: string;
		uri: string;
	}[];
};

type BlockTypes = 'grid' | 'row' | 'postSpotlight' | 'categorySpotlight' | 'link' | 'label';
