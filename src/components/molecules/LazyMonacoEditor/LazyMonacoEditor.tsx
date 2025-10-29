import React, { lazy, Suspense } from 'react';

import { Loader } from 'components/atoms/Loader';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export interface LazyMonacoEditorProps {
	height?: string | number;
	defaultLanguage?: string;
	language?: string;
	value?: string;
	onChange?: (value: string | undefined) => void;
	beforeMount?: (monaco: any) => void;
	onMount?: (editor: any, monaco: any) => void;
	theme?: string;
	options?: any;
	loading?: React.ReactNode;
}

export default function LazyMonacoEditor(props: LazyMonacoEditorProps) {
	return (
		<Suspense fallback={props.loading || <Loader sm relative />}>
			<MonacoEditor {...props} />
		</Suspense>
	);
}
