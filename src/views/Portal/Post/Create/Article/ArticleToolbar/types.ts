import { ArticleBlockElementType } from 'helpers/types';

export interface IProps {
	addBlock: (type: ArticleBlockElementType) => void;
	blockEditMode: boolean;
	toggleBlockEditMode: () => void;
}
