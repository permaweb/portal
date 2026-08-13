export type PortalMode = 'base' | 'process';

const configuredPortalMode = import.meta.env.VITE_PORTAL_MODE?.toLowerCase();

/**
 * Portal's runtime persistence mode. Process mode preserves the existing AO
 * implementation. Base mode only reads and writes immutable Arweave data.
 */
export const PORTAL_MODE: PortalMode = configuredPortalMode === 'base' ? 'base' : 'process';

export const IS_BASE_MODE = PORTAL_MODE === 'base';
export const IS_PROCESS_MODE = PORTAL_MODE === 'process';

/**
 * Product capabilities are deliberately separate from presentation. Controls
 * backed by an unavailable capability are omitted in base mode.
 */
export const PORTAL_CAPABILITIES = {
	AO_PROCESSES: IS_PROCESS_MODE,
	PORTAL_MANIFESTS: IS_BASE_MODE,
	PORTAL_CREATE: true,
	PORTAL_EDIT: true,
	POST_CREATE: true,
	POST_EDIT: true,
	USER_INVITES: true,
	PROFILE_EDIT: IS_PROCESS_MODE,
	MEDIA_UPLOADS: true,
	DESIGN: true,
	PAGES: true,
	MODERATION: IS_PROCESS_MODE,
	DOMAINS: IS_PROCESS_MODE,
	TIPS: IS_PROCESS_MODE,
	COMMENTS: IS_PROCESS_MODE,
	POST_REQUESTS: IS_PROCESS_MODE,
	CROSS_POSTING: IS_PROCESS_MODE,
	OWNERSHIP_TRANSFER: IS_PROCESS_MODE,
	TURBO_CREDITS: false,
	CREDIT_SHARING: false,
	WORDPRESS_IMPORT: true,
} as const;

export type PortalCapability = keyof typeof PORTAL_CAPABILITIES;

export const hasPortalCapability = (capability: PortalCapability): boolean => PORTAL_CAPABILITIES[capability];

// Feature flag configuration
export const FEATURES = {
	DOMAIN_MANAGEMENT: PORTAL_CAPABILITIES.DOMAINS && import.meta.env.VITE_ENABLE_DOMAINS !== 'false',
	FILE_UPLOADS: import.meta.env.VITE_ENABLE_UPLOADS !== 'false',
	TURBO_CREDITS: PORTAL_CAPABILITIES.TURBO_CREDITS,
	PAYMENTS: PORTAL_CAPABILITIES.TIPS && import.meta.env.VITE_ENABLE_PAYMENTS !== 'false',
	AO_CONNECT: PORTAL_CAPABILITIES.AO_PROCESSES && import.meta.env.VITE_ENABLE_AO !== 'false',
	WANDER_EMBEDDED_AUTH: import.meta.env.VITE_ENABLE_WANDER_AUTH === 'true',
} as const;

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
	return FEATURES[feature];
};

// Conditional SDK loaders
export const loadArIOSDK = async () => {
	if (!FEATURES.DOMAIN_MANAGEMENT) {
		throw new Error('Domain management is disabled');
	}
	return import('@ar.io/sdk');
};

export const loadTurboSDK = async () => {
	if (!FEATURES.TURBO_CREDITS) {
		throw new Error('Turbo credits are disabled');
	}
	// @ts-ignore
	return import('@ardrive/turbo-sdk/web');
};

export const loadStripeSDK = async () => {
	if (!FEATURES.PAYMENTS) {
		throw new Error('Payments are disabled');
	}
	return import('@stripe/stripe-js');
};

export const loadAOConnect = async () => {
	if (!FEATURES.AO_CONNECT) {
		throw new Error('AO Connect is disabled');
	}
	return import('@permaweb/aoconnect');
};
