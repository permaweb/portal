import React from 'react';
import { WanderConnect } from '@wanderapp/connect';

declare global {
	interface Window {
		wanderInstance: any;
	}
}

export default function WanderInit() {
	const wrapperRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!window.wanderInstance) {
			try {
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
		}

		return () => {
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

	return <div ref={wrapperRef} style={{ display: 'none' }} />;
}
