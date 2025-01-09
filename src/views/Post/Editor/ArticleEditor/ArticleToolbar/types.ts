import { ArticleBlockEnum } from 'helpers/types';

export interface IProps {
	addBlock: (type: ArticleBlockEnum) => void;
	handleInitAddBlock: (e: any) => void;
	handleSubmit: () => void;
}
