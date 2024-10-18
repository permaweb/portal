import { ArticleBlockEnum } from 'helpers/types';

export interface IProps {
	postTitle: string;
	setPostTitle: (value: string) => void;
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
