import { CategoryType } from 'helpers/types';

export interface IProps {
	categories: CategoryType[];
	setCategories: (categories: CategoryType[]) => void;
	topics: string[];
	setTopics: (topics: string[]) => void;
}
