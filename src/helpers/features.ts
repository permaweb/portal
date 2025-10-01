// Feature flag configuration
export const FEATURES = {
	DOMAIN_MANAGEMENT: import.meta.env.VITE_ENABLE_DOMAINS !== 'false',
	FILE_UPLOADS: import.meta.env.VITE_ENABLE_UPLOADS !== 'false',
	PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS !== 'false',
	AO_CONNECT: import.meta.env.VITE_ENABLE_AO !== 'false',
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
	if (!FEATURES.FILE_UPLOADS) {
		throw new Error('File uploads are disabled');
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
