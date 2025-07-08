import { PortalDetailType } from 'helpers/types';

export interface IProps {
	portal: PortalDetailType | null;
	type: 'icon' | 'logo';
	handleClose?: () => void;
	handleUpdate?: () => void;
}