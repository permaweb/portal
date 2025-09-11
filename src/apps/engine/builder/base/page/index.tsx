import React from 'react';
import { useParams } from 'react-router-dom';
import { usePortalProvider } from 'engine/providers/portalProvider';
import Builder from '../../';
import * as S from './styles';

export default function Page() {
	const { portal } = usePortalProvider();
	const Pages = portal?.Pages;
	const Name = portal?.Name;
	const params = useParams();

	let pageId = 'home';

	// Check for specific route patterns
	if ('category' in params || 'tag' in params || 'network' in params || 'year' in params) {
		pageId = 'feed';
	} else if ('postId' in params) {
		pageId = 'post';
	} else if ('user' in params) {
		pageId = 'user';
	} else if ('search' in params) {
		pageId = 'search';
	} else if ('pageId' in params) {
		pageId = params.pageId;
	} else if (params['*']) {
		pageId = params['*'];
	} else {
		// Fallback to first non-portalId key
		const keys = Object.keys(params);
		const firstKey = keys.find((k) => k !== 'portalId');
		if (firstKey && firstKey !== '*') {
			pageId = firstKey;
		}
	}

	React.useEffect(() => {
		if (Name && pageId === 'home' && !document.title.includes('Home')) {
			// @ts-ignore
			document.title = `${Name}`;
		}
	}, [pageId, Name]);

	return (
		<S.Page id="Page">
			<Builder layout={Pages?.[pageId]} />
		</S.Page>
	);
}
