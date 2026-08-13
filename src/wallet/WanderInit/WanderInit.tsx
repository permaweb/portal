import React from 'react';

import { FEATURES } from 'helpers/features';

declare global {
	interface Window {
		wanderInstance: any;
	}
}

export default function WanderInit() {
	const wrapperRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!FEATURES.WANDER_EMBEDDED_AUTH) return;
		let active = true;

		void (async () => {
			if (window.wanderInstance) return;
			try {
				const { WanderConnect } = await import('@wanderapp/connect');
				if (!active || window.wanderInstance) return;
				const wanderInstance = new WanderConnect({
					clientId: 'FREE_TRIAL',
					theme: 'dark',
					button: {
						parent: wrapperRef.current,
						label: false,
						customStyles: `
							#wanderConnectButtonHost {
								display:none;
							}`,
					},
					iframe: {
						routeLayout: {
							default: {
								type: 'modal',
							},
							auth: {
								type: 'modal',
							},
							'auth-request': {
								type: 'modal',
							},
						},
						cssVars: {
							light: {},
							dark: {
								boxShadow: 'none',
							},
						},
						customStyles: ``,
					},
				});

				window.wanderInstance = wanderInstance;
			} catch (e) {
				console.error('Failed to initialize WanderConnect:', e);
			}
		})();

		return () => {
			active = false;
			if (window.wanderInstance) {
				try {
					window.wanderInstance.destroy();
					window.wanderInstance = null;
				} catch (e) {
					console.error('Error destroying WanderConnect instance:', e);
				}
			}
		};
	}, []);

	return FEATURES.WANDER_EMBEDDED_AUTH ? <div ref={wrapperRef} style={{ display: 'none' }} /> : null;
}
