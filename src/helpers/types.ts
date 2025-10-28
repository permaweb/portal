export type PortalHeaderType = {
	id: string;
	name: string;
	logo?: string | null;
	icon?: string | null;
	roles?: PortalUserType[];
};

export type PortalDetailType = {
	id: string;
	name: string;
	logo: string | null;
	icon: string | null;
	wallpaper: string | null;
	owner: string | null;
	moderation?: string | null;
	users?: PortalUserType[];
	pages?: PortalPageType[];
	assets?: PortalAssetType[];
	requests?: PortalAssetRequestType[];
	categories?: PortalCategoryType[];
	topics?: PortalTopicType[];
	links?: PortalLinkType[];
	roleOptions?: { [key: string]: PortalUserRoleType };
	permissions?: PortalPermissionsType;
	domains?: PortalDomainType[];
	uploads?: PortalUploadType[];
	fonts?: PortalFontsType;
	themes?: PortalThemeType[];
	layout?: any;
};

export type PortalAssetType = {
	id: string;
	name: string;
	ticker: string;
	denomination: string;
	totalSupply: string;
	transferable: string;
	creator: string;
	balances: object;
	assetType: string;
	processType: string;
	dateCreated: number;
	lastUpdate: number;
	metadata: {
		description?: string;
		topics?: string[];
		categories?: PortalCategoryType[];
		status?: ArticleStatusType;
		content?: any;
		thumbnail?: string;
		releaseDate?: number;
		comments?: string;
		url?: string;
	};
};

export type PortalAssetRequestType = {
	id: string;
	name?: string;
	creatorId?: string;
	dateCreated?: string;
};

export type PortalAssetPostReduxType = {
	id: null;
	title: '';
	description: '';
	content: null;
	creator: null;
	status: ArticleStatusType;
	categories: PortalCategoryType[];
	topics: string[];
	externalRecipients: string[];
	thumbnail: string | null;
	dateCreated: number | null;
	lastUpdate: number | null;
	releaseDate: number | null;
	authUsers: string[];
	url: string | null;
};

export type PortalPageReduxType = {
	id: null;
	title: '';
	content: null;
};

export type PortalUserType = {
	address: string;
	type?: 'wallet' | 'process';
	roles?: PortalUserRoleType[];
};

export type PortalPageType = {
	id: string;
	name: string;
};

export type PortalFontsType = {
	headers: string;
	body: string;
};

export enum PortalSchemeType {
	Light = 'light',
	Dark = 'dark',
}

export type PortalThemeType = any;

export type PortalTopicType = { value: string };

export type PortalLinkType = {
	title: string;
	url: string;
	icon?: string;
};

export type PortalUploadType = {
	tx: string;
	dateUploaded: string;
	type: PortalUploadOptionType;
	thumbnail?: string;
};

export type PortalDomainType = {
	name: string;
	primary?: boolean;
};

export type PortalUploadOptionType = 'image' | 'video';

export type PortalUserRoleType = 'Owner' | 'Admin' | 'Contributor' | 'ExternalContributor' | 'Moderator';

export type RequestUpdateType = 'Approve' | 'Reject';

export type PortalCategoryMetaType = {
	hidden?: boolean;
	description?: string;
	template?: string;
};

export type PortalCategoryType = {
	id: string;
	name: string;
	parent?: string;
	children?: PortalCategoryType[];
	metadata: PortalCategoryMetaType;
};

export type PortalPermissionsType = {
	base: boolean;
	updatePortalMeta?: boolean;
	updateUsers?: boolean;
	postAutoIndex?: boolean;
	postRequestIndex?: boolean;
	updatePostRequestStatus?: boolean;
	externalContributor?: boolean;
};

export enum PortalPatchMapEnum {
	Overview = 'overview',
	Users = 'users',
	Navigation = 'navigation',
	Presentation = 'presentation',
	Media = 'media',
	Posts = 'posts',
	Requests = 'requests',
	Transfers = 'transfers',
}

export enum ArticleBlockEnum {
	Paragraph = 'paragraph',
	Quote = 'quote',
	OrderedList = 'ordered-list',
	UnorderedList = 'unordered-list',
	Code = 'code',
	Header1 = 'header-1',
	Header2 = 'header-2',
	Header3 = 'header-3',
	Header4 = 'header-4',
	Header5 = 'header-5',
	Header6 = 'header-6',
	Image = 'image',
	Video = 'video',
	DividerSolid = 'divider-solid',
	DividerDashed = 'divider-dashed',
	SpacerHorizontal = 'spacer-horizontal',
	SpacerVertical = 'spacer-vertical',
	HTML = 'html',
}

export type ArticleBlockType = {
	id: string;
	type: ArticleBlockEnum;
	content: string;
	data?: any;
	width?: number;
	layout?: any;
};

export enum ArticleStatusEnum {
	Draft = 'draft',
	Published = 'published',
}

export type ArticleStatusType = ArticleStatusEnum;

export type ArticlePostType = {
	id: string | null;
	title: string | null;
};

export enum PageSectionEnum {
	Row = 'row',
	Column = 'column',
	Grid = 'grid',
}

export enum PageBlockEnum {
	Feed = 'feed',
	Post = 'post',
	PostSpotlight = 'postSpotlight',
	CategorySpotlight = 'categorySpotlight',
	Sidebar = 'sidebar',
}

export type PageSectionType = {
	id?: string;
	type: PageSectionEnum;
	layout: any;
	content: any[];
	width: number;
};

export type PageBlockType = {
	type: PageBlockEnum;
	layout: any;
	content: any[];
	width: number;
};

export type TagType = { name: string; value: string };

export type TagFilterType = { name: string; values: string[]; match?: string };

export type BaseGQLArgsType = {
	ids: string[] | null;
	tagFilters: TagFilterType[] | null;
	owners: string[] | null;
	cursor: string | null;
	paginator?: number;
	minBlock?: number;
	maxBlock?: number;
};

export type GQLArgsType = { gateway: string } & BaseGQLArgsType;

export type QueryBodyGQLArgsType = BaseGQLArgsType & { gateway?: string; queryKey?: string };

export type BatchGQLArgsType = {
	gateway: string;
	entries: { [queryKey: string]: BaseGQLArgsType };
};

export type GQLNodeResponseType = {
	cursor: string | null;
	node: {
		id: string;
		tags: TagType[];
		data: {
			size: string;
			type: string;
		};
		block?: {
			height: number;
			timestamp: number;
		};
		owner?: {
			address: string;
		};
		address?: string;
		timestamp?: number;
	};
};

export type GQLResponseType = {
	count: number;
	nextCursor: string | null;
	previousCursor: string | null;
};

export type DefaultGQLResponseType = {
	data: GQLNodeResponseType[];
} & GQLResponseType;

export type BatchAGQLResponseType = { [queryKey: string]: DefaultGQLResponseType };

export enum WalletEnum {
	wander = 'wander',
	nativeWallet = 'NATIVE_WALLET',
}

export type FormFieldType = 'number' | 'password';

export type TabType = 'primary' | 'alt1';

export type ReduxActionType = {
	type: string;
	payload: any;
};

export type ValidationType = {
	status: boolean;
	message: string | null;
};

export type ButtonType = 'primary' | 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'indicator' | 'warning';

export type SelectOptionType = { id: string; label: string };

export type UploadMethodType = 'default' | 'turbo';

export type ViewLayoutType = 'header' | 'detail';

export enum AlignmentEnum {
	Row = 'portal-media-row',
	RowReverse = 'portal-media-row-reverse',
	Column = 'portal-media-column',
	ColumnReverse = 'portal-media-column-reverse',
}

export type AlignmentButtonType = {
	label: string;
	alignment: AlignmentEnum;
	icon: string;
};

export type MediaConfigType = {
	type: PortalUploadOptionType;
	icon: string;
	label: string;
	renderContent: (url: string) => JSX.Element;
	acceptType: string;
};

export type DesignPanelType = 'themes' | 'fonts' | 'images';

export type BasicAlignmentType = 'left' | 'center' | 'right' | 'top' | 'bottom';

export enum LanguageEnum {
	en = 'English',
	es = 'Español',
}

export interface UserOwnedDomain {
	name: string;
	antId: string;
	target?: string;
	isRedirectedToPortal: boolean;
	// Optional metadata derived from network ArNS records
	startTimestamp?: number;
	recordType?: 'lease' | 'permabuy' | string;
	endTimestamp?: number;
	status?: 'loading' | 'resolved' | 'failed';
	requiresAntUpdate?: boolean;
}

export type ArticleBlocksContextType = 'toolbar' | 'inline' | 'grid';
