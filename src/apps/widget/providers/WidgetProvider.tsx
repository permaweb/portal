import React from 'react';

import { WidgetConfig } from '../types';

interface WidgetContextState {
	config: WidgetConfig;
}

const WidgetContext = React.createContext<WidgetContextState>({
	config: {
		processId: '',
		mode: 'chat',
		walletMode: 'auto',
		theme: 'auto',
	},
});

export function useWidgetProvider(): WidgetContextState {
	return React.useContext(WidgetContext);
}

export function WidgetProvider(props: { children: React.ReactNode; config: WidgetConfig }) {
	const value = React.useMemo(() => ({ config: props.config }), [props.config]);

	return <WidgetContext.Provider value={value}>{props.children}</WidgetContext.Provider>;
}
