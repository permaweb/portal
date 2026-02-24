export type WidgetMode = 'comments' | 'chat' | 'private';
export type WalletMode = 'own' | 'delegate' | 'auto';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface WidgetConfig {
	processId: string;
	mode: WidgetMode;
	walletMode: WalletMode;
	theme: ThemeMode;
	moderationId?: string;
	pollInterval?: number;
	height?: string;
	title?: string;
}
