import { AssetHeaderType } from '@permaweb/libs';

export type PortalHeaderType = { id: string; name: string; logo: string | null };

export type PortalDetailType = {
	id: string;
	name: string;
	logo: string | null;
	assets?: AssetHeaderType[];
	categories?: PortalCategoryType[];
	topics?: PortalTopicType[];
	links?: PortalLinkType[];
	users?: PortalUserType[];
	domains?: string[];
	uploads?: PortalUploadType[];
};

// TODO
export type PortalUserType = {
	username: string;
	displayName: string;
	role: PortalUserRoleType;
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

export type PortalUserRoleType = 'admin' | 'contributor';

export type PortalCategoryType = {
	id: string;
	name: string;
	parent?: string;
	children?: PortalCategoryType[];
};

export type PortalPermissionsType = {
	base: boolean;
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

export type RegistryProfileType = {
	id: string;
	avatar: string | null;
	username: string;
	bio?: string;
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
	arConnect = 'arconnect',
	othent = 'othent',
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

export type ButtonType = 'primary' | 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'success' | 'warning';

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
