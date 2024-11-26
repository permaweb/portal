import { ViewLayoutType } from 'helpers/types';

export interface IProps {
	type: ViewLayoutType;
	showActions?: boolean;
	closeAction?: () => void;
}
