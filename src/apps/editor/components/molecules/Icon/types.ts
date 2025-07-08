import { PortalDetailType } from 'helpers/types';

export interface IProps {
	portal: PortalDetailType | null;
	handleClose?: () => void;
	handleUpdate?: () => void;
}
