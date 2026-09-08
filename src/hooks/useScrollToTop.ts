import React from 'react';

// Reset after the new page/content has committed, never during ordinary editing.
export function useScrollToTop(resetKey: unknown, enabled = true) {
	React.useLayoutEffect(() => {
		if (enabled) window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
	}, [resetKey, enabled]);
}
