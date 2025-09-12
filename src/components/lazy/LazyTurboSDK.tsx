import React from 'react';

// Lazy import for Turbo SDK
let TurboSDK: any = null;
let loading = false;

export const useTurboSDK = () => {
	const [sdk, setSdk] = React.useState<any>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (TurboSDK) {
			setSdk(TurboSDK);
			return;
		}

		if (loading) return;

		const loadSDK = async () => {
			try {
				setIsLoading(true);
				loading = true;

				// Dynamic import - only loads when actually needed
				const turboModule = await import('@ardrive/turbo-sdk/web');
				TurboSDK = turboModule;
				setSdk(turboModule);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load Turbo SDK');
			} finally {
				setIsLoading(false);
				loading = false;
			}
		};

		loadSDK();
	}, []);

	return { sdk, isLoading, error };
};
