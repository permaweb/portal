import React from 'react';

// Lazy import for AR.IO SDK
let ARIOSDK: any = null;
let loading = false;

export const useARIOSDK = () => {
	const [sdk, setSdk] = React.useState<any>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (ARIOSDK) {
			setSdk(ARIOSDK);
			return;
		}

		if (loading) return;

		const loadSDK = async () => {
			try {
				setIsLoading(true);
				loading = true;

				// Dynamic import - only loads when actually needed
				const arioModule = await import('@ar.io/sdk');
				ARIOSDK = arioModule;
				setSdk(arioModule);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load AR.IO SDK');
			} finally {
				setIsLoading(false);
				loading = false;
			}
		};

		loadSDK();
	}, []);

	return { sdk, isLoading, error };
};
