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
	settingsId?: string;
}

export type LauncherPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type LauncherAnimation = 'bounce' | 'pulse' | 'none';
export type HeaderStyle = 'default' | 'minimal' | 'hidden';

export interface LauncherSettings {
	icon: string;
	position: LauncherPosition;
	size: number;
	tooltip: string;
	animation: LauncherAnimation;
	offsetX: number;
	offsetY: number;
}

export interface AppearanceSettings {
	primaryColor: string;
	accentColor: string;
	fontFamily: string;
	borderRadius: number;
	headerStyle: HeaderStyle;
	customCss: string;
}

export interface BehaviorSettings {
	defaultMode: WidgetMode;
	enabledModes: WidgetMode[];
	autoOpen: boolean;
	autoOpenDelay: number;
	soundNotifications: boolean;
	showTimestamps: boolean;
	showAvatars: boolean;
	pollInterval: number;
}

export interface BrandingSettings {
	logoUrl: string;
	headerTitle: string;
	footerText: string;
	poweredByVisible: boolean;
}

export interface ContentSettings {
	placeholder: string;
	emptyStateMessage: string;
	welcomeMessage: string;
}

export interface AccessSettings {
	requireWalletToView: boolean;
	allowedWallets: string[];
}

export interface ModeOverrides {
	appearance?: Partial<AppearanceSettings>;
	branding?: Partial<BrandingSettings>;
	content?: Partial<ContentSettings>;
}

export interface WidgetSettings {
	launcher: LauncherSettings;
	appearance: AppearanceSettings;
	behavior: BehaviorSettings;
	branding: BrandingSettings;
	content: ContentSettings;
	access: AccessSettings;
	modes?: {
		chat?: ModeOverrides;
		comments?: ModeOverrides;
		private?: ModeOverrides;
	};
}

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ResolvedSettings = WidgetSettings;
