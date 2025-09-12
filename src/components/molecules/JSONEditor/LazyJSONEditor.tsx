import React, { Suspense } from 'react';

import { Loader } from 'components/atoms/Loader';

// Lazy load the Monaco Editor component
const JSONEditor = React.lazy(() => import('./JSONEditor'));

interface LazyJSONEditorProps {
	initialData: object;
	handleSubmit: (data: object) => void;
	loading: boolean;
}

export default function LazyJSONEditor(props: LazyJSONEditorProps) {
	return (
		<Suspense fallback={<Loader />}>
			<JSONEditor {...props} />
		</Suspense>
	);
}
