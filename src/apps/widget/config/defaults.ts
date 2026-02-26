import { WidgetConfig, WidgetSettings } from '../types';

export const DEFAULT_CONFIG: Omit<WidgetConfig, 'processId'> = {
	mode: 'chat',
	walletMode: 'auto',
	theme: 'auto',
	pollInterval: undefined,
	height: '500px',
	title: undefined,
	moderationId: undefined,
};

export const DEFAULT_SETTINGS: WidgetSettings = {
	launcher: {
		icon: '\u{1F4AC}',
		position: 'bottom-right',
		size: 56,
		tooltip: 'Chat with us',
		animation: 'pulse',
		offsetX: 20,
		offsetY: 20,
	},
	appearance: {
		primaryColor: '#3b82f6',
		accentColor: '#60a5fa',
		fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		borderRadius: 12,
		headerStyle: 'default',
		customCss: '',
	},
	behavior: {
		defaultMode: 'chat',
		enabledModes: ['chat', 'comments', 'private'],
		autoOpen: false,
		autoOpenDelay: 3000,
		soundNotifications: false,
		showTimestamps: true,
		showAvatars: true,
		pollInterval: 0,
	},
	branding: {
		logoUrl: '',
		headerTitle: '',
		footerText: '',
		poweredByVisible: true,
	},
	content: {
		placeholder: '',
		emptyStateMessage: '',
		welcomeMessage: '',
	},
	access: {
		requireWalletToView: false,
		allowedWallets: [],
	},
};
