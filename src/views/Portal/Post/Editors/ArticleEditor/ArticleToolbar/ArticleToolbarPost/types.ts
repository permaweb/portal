import { PortalCategoryType } from 'helpers/types';

export interface IProps {
	categories: PortalCategoryType[];
	setCategories: (categories: PortalCategoryType[]) => void;
	topics: string[];
	setTopics: (topics: string[]) => void;
}
