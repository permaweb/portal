// Custom service worker registration that skips portal domains
if ('serviceWorker' in navigator) {
	// Don't register service worker for portal domains to avoid deployment caching issues
	if (window.location.hostname.includes('portal')) {
		console.log('Skipping service worker registration for portal domain');
	} else {
		navigator.serviceWorker
			.register('/sw.js', { scope: '/' })
			.then((registration) => {
				console.log('SW registered: ', registration);
			})
			.catch((registrationError) => {
				console.log('SW registration failed: ', registrationError);
			});
	}
}
