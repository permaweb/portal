import { RequestUpdateType } from 'helpers/types';

export interface IProps {
	handleSubmit: () => void;
	handleRequestUpdate: (updateType: RequestUpdateType) => void;
}
