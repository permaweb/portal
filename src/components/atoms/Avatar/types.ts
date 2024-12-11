import { ProfileType } from '@permaweb/libs';

import { RegistryProfileType } from 'helpers/types';

export interface IProps {
	owner: ProfileType | RegistryProfileType | null | any;
	dimensions: {
		wrapper: number;
		icon: number;
	};
	callback: () => void | null;
}
