import { ArticleBlockEnum, ArticleStatusType, CategoryType } from 'helpers/types';

export interface IProps {
	postTitle: string;
	setPostTitle: (value: string) => void;
	status: ArticleStatusType;
	setStatus: (value: ArticleStatusType) => void;
	categories: CategoryType[];
	setCategories: (categories: CategoryType[]) => void;
	topics: string[];
	setTopics: (topics: string[]) => void;
	addBlock: (type: ArticleBlockEnum) => void;
	blockEditMode: boolean;
	toggleBlockEditMode: () => void;
	panelOpen: boolean;
	togglePanelOpen: () => void;
	toggleBlockFocus: boolean;
	setToggleBlockFocus: () => void;
	handleInitAddBlock: (e: any) => void;
	handleSubmit: () => void;
	submitDisabled: boolean;
	loading: boolean;
}
