import { PortalType } from 'helpers/types';

export interface IProps {
	portal: PortalType | null;
	handleClose: () => void;
	handleUpdate: () => void;
}
