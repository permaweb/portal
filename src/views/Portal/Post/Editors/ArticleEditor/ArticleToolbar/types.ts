import { ArticleBlockEnum, ArticleStatusType, PortalCategoryType } from 'helpers/types';

export interface IProps {
	postTitle: string;
	setPostTitle: (value: string) => void;
	status: ArticleStatusType;
	setStatus: (value: ArticleStatusType) => void;
	categories: PortalCategoryType[];
	setCategories: (categories: PortalCategoryType[]) => void;
	topics: string[];
	setTopics: (topics: string[]) => void;
	addBlock: (type: ArticleBlockEnum) => void;
	blockEditMode: boolean;
	toggleBlockEditMode: () => void;
	panelOpen: boolean;
	setPanelOpen: (status: boolean) => void;
	togglePanelOpen: () => void;
	toggleBlockFocus: boolean;
	setToggleBlockFocus: () => void;
	handleInitAddBlock: (e: any) => void;
	handleSubmit: () => void;
	submitDisabled: boolean;
	loading: boolean;
}
