import { ArticleBlockType } from 'helpers/types';

export interface IProps {
	index: number;
	block: ArticleBlockType;
	onChangeBlock: (id: string, content: any, data?: any) => void;
	onDeleteBlock: (id: string) => void;
	onFocus: () => void;
}
