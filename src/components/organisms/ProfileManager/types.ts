import { ProfileType } from '@permaweb/libs';

export interface IProps {
	profile: ProfileType | null;
	handleClose: () => void;
	handleUpdate: () => void;
}
