import { ArticleBlockType } from 'helpers/types';

export interface IProps {
	index: number;
	block: ArticleBlockType;
	blockEditMode: boolean;
	onChangeBlock: (id: string, content: any, data?: any) => void;
	onDeleteBlock: (id: string) => void;
	autoFocus: boolean;
	onFocus: () => void;
}
