import { PortalUploadOptionType, PortalUploadType } from 'helpers/types';

export interface IProps {
	type: PortalUploadOptionType | 'all';
	callback?: (upload: PortalUploadType) => void;
	handleClose?: () => void;
}
