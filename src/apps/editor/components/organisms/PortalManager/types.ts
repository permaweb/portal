import { PortalHeaderType } from 'helpers/types';

export interface IProps {
	portal: PortalHeaderType | null;
	handleClose: () => void;
	handleUpdate: () => void;
}
