export type PortalHeaderType = { id: string; name: string; logo: string | null };

export type PortalDetailType = {
	id: string;
	name: string;
	logo: string | null;
	assets?: PortalAssetType[];
	requests?: PortalAssetRequestType[];
	categories?: PortalCategoryType[];
	topics?: PortalTopicType[];
	links?: PortalLinkType[];
	users?: PortalRolesType[];
	roleOptions?: { [key: string]: PortalUserRoleType };
	permissions?: PortalPermissionsType;
	domains?: string[];
	uploads?: PortalUploadType[];
	themes?: PortalThemeType[];
};

/* Zone Indexed Asset */
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
	};
};

export type PortalAssetRequestType = {
	id: string;
	name?: string;
	creatorId?: string;
	dateCreated?: string;
};

export type PortalAssetPostType = {
	id: null;
	title: '';
	description: '';
	content: null;
	creator: null;
	status: ArticleStatusType;
	categories: PortalCategoryType[];
	topics: string[];
	thumbnail: string | null;
	dateCreated: number | null;
	lastUpdate: number | null;
};

export type PortalUserType = {
	owner?: string;
	username?: string;
	avatar?: string;
	displayName?: string;
};

export type PortalRolesType = {
	profileId: string;
	type?: 'wallet' | 'process';
	roles?: PortalUserRoleType[];
};

export type PortalThemeType = {
	name: string;
	active: boolean;
	scheme: 'light' | 'dark';
	colors: {
		background: string;
		primary: string;
		secondary: string;
		sections: string;
		menus: string;
		links: string;
	};
	preferences: {
		gradient: boolean;
		shadow: boolean;
		borders: boolean;
	};
};

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
};

export type PortalUploadOptionType = 'image' | 'video';

export type PortalUserRoleType = 'Admin' | 'Contributor' | 'ExternalContributor' | 'Moderator';

export type RequestUpdateType = 'Approve' | 'Reject';

export type PortalCategoryType = {
	id: string;
	name: string;
	parent?: string;
	children?: PortalCategoryType[];
};

export type PortalPermissionsType = {
	base: boolean;
	addUser?: boolean;
	postAutoIndex?: boolean;
	postRequestIndex?: boolean;
	updatePostRequestStatus?: boolean;
};

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
}

export type ArticleBlockType = {
	id: string;
	type: ArticleBlockEnum;
	content: string;
	data?: any;
};

export type ArticleStatusType = 'draft' | 'published';

export type ArticlePostType = {
	id: string | null;
	title: string | null;
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

export type NotificationType = {
	message: string;
	status: 'success' | 'warning';
};

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

export type DesignPanelType = 'themes' | 'logo';

export type RefreshFieldType = 'assets';
