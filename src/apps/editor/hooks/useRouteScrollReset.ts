import React from 'react';
import { useLocation } from 'react-router-dom';

import { useScrollToTop } from 'hooks/useScrollToTop';

export function useRouteScrollReset() {
	const { key, pathname, search, hash } = useLocation();

	React.useLayoutEffect(() => {
		const previous = window.history.scrollRestoration;
		window.history.scrollRestoration = 'manual';
		return () => {
			window.history.scrollRestoration = previous;
		};
	}, []);

	// Include the history key for same-URL navigation and redirects. Leave explicit
	// section links to their anchor handler.
	useScrollToTop(`${key}:${pathname}${search}${hash}`, !hash);
}
