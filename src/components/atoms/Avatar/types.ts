import { ProfileType } from '@permaweb/libs';

import { RegistryProfileType } from 'helpers/types';

export interface IProps {
	owner: ProfileType | RegistryProfileType | null | any; // TODO: Thumbnail on registry type
	dimensions: {
		wrapper: number;
		icon: number;
	};
	callback: () => void | null;
}
