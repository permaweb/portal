import React from 'react';

import { WidgetConfig, ResolvedSettings } from '../types';
import { DEFAULT_SETTINGS } from '../config/defaults';
import { useWidgetSettingsProvider } from './WidgetSettingsProvider';

interface WidgetContextState {
	config: WidgetConfig;
	settings: ResolvedSettings;
}

const WidgetContext = React.createContext<WidgetContextState>({
	config: {
		processId: '',
		mode: 'chat',
		walletMode: 'auto',
		theme: 'auto',
	},
	settings: DEFAULT_SETTINGS,
});

export function useWidgetProvider(): WidgetContextState {
	return React.useContext(WidgetContext);
}

export function WidgetProvider(props: { children: React.ReactNode; config: WidgetConfig }) {
	const { resolveForMode } = useWidgetSettingsProvider();
	const resolvedSettings = resolveForMode(props.config.mode);

	const value = React.useMemo(
		() => ({ config: props.config, settings: resolvedSettings }),
		[props.config, resolvedSettings]
	);

	return <WidgetContext.Provider value={value}>{props.children}</WidgetContext.Provider>;
}
