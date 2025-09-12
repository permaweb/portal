// Custom Vite plugin to exclude dependencies based on feature flags
export function featureFlagPlugin(features = {}) {
	return {
		name: 'feature-flag-exclude',
		resolveId(id, importer) {
			// Exclude AR.IO SDK if domains disabled
			if (id.includes('@ar.io/sdk') && !features.ENABLE_DOMAINS) {
				return { id: 'virtual:disabled-ario', external: true };
			}

			// Exclude Turbo SDK if uploads disabled
			if (id.includes('@ardrive/turbo-sdk') && !features.ENABLE_UPLOADS) {
				return { id: 'virtual:disabled-turbo', external: true };
			}

			// Exclude Stripe if payments disabled
			if (id.includes('@stripe/') && !features.ENABLE_PAYMENTS) {
				return { id: 'virtual:disabled-stripe', external: true };
			}

			return null;
		},
		load(id) {
			// Provide stub implementations for disabled features
			if (id === 'virtual:disabled-ario') {
				return 'export default {}; export const ArIO = class { constructor() { throw new Error("AR.IO disabled"); } };';
			}
			if (id === 'virtual:disabled-turbo') {
				return 'export default {}; export const TurboFactory = class { static unauthenticated() { throw new Error("Turbo disabled"); } };';
			}
			if (id === 'virtual:disabled-stripe') {
				return 'export default {}; export const loadStripe = () => Promise.reject("Stripe disabled");';
			}
			return null;
		},
	};
}
