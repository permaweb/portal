import { WidgetConfig } from '../types';

export const DEFAULT_CONFIG: Omit<WidgetConfig, 'processId'> = {
	mode: 'chat',
	walletMode: 'auto',
	theme: 'auto',
	pollInterval: undefined,
	height: '500px',
	title: undefined,
	moderationId: undefined,
};
