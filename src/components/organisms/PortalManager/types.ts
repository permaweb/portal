import { PortalType } from 'helpers/types';

export interface IProps {
	portal: PortalType | null;
	handleClose: (handleUpdate: boolean) => void;
	handleUpdate: () => void;
}
