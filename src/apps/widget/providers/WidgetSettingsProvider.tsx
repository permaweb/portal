import React from 'react';

import { WidgetSettings, DeepPartial, WidgetMode, ResolvedSettings, WidgetConfig } from '../types';
import { DEFAULT_SETTINGS } from '../config/defaults';
import { useWidgetSettings } from '../hooks/useWidgetSettings';

interface WidgetSettingsContextState {
	settings: ResolvedSettings;
	isLoading: boolean;
	resolveForMode: (mode: WidgetMode) => ResolvedSettings;
}

const WidgetSettingsContext = React.createContext<WidgetSettingsContextState>({
	settings: DEFAULT_SETTINGS,
	isLoading: false,
	resolveForMode: () => DEFAULT_SETTINGS,
});

export function useWidgetSettingsProvider(): WidgetSettingsContextState {
	return React.useContext(WidgetSettingsContext);
}

function deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
	const result = { ...target };
	for (const key of Object.keys(source) as (keyof T)[]) {
		const sourceVal = source[key];
		if (sourceVal === undefined) continue;

		if (
			sourceVal !== null &&
			typeof sourceVal === 'object' &&
			!Array.isArray(sourceVal) &&
			typeof result[key] === 'object' &&
			result[key] !== null &&
			!Array.isArray(result[key])
		) {
			result[key] = deepMerge(result[key] as any, sourceVal as any);
		} else {
			result[key] = sourceVal as T[keyof T];
		}
	}
	return result;
}

function buildConfigOverrides(config: WidgetConfig): DeepPartial<WidgetSettings> {
	const overrides: DeepPartial<WidgetSettings> = {};

	if (config.pollInterval !== undefined) {
		overrides.behavior = { pollInterval: config.pollInterval };
	}
	if (config.title !== undefined) {
		overrides.branding = { headerTitle: config.title };
	}

	return overrides;
}

export function WidgetSettingsProvider(props: { children: React.ReactNode; config: WidgetConfig }) {
	const { config } = props;
	const { remoteSettings, isLoading } = useWidgetSettings(config.settingsId);

	const globalSettings = React.useMemo<WidgetSettings>(() => {
		let merged = DEFAULT_SETTINGS;

		// Layer 1: AO remote settings (overrides defaults)
		if (remoteSettings) {
			merged = deepMerge(merged, remoteSettings);
		}

		// Layer 2: data-* attribute overrides (higher priority than AO)
		const configOverrides = buildConfigOverrides(config);
		if (Object.keys(configOverrides).length > 0) {
			merged = deepMerge(merged, configOverrides);
		}

		return merged;
	}, [remoteSettings, config]);

	const resolveForMode = React.useCallback(
		(mode: WidgetMode): ResolvedSettings => {
			const modeOverrides = globalSettings.modes?.[mode];
			if (!modeOverrides) return globalSettings;

			let resolved = { ...globalSettings };

			if (modeOverrides.appearance) {
				resolved = {
					...resolved,
					appearance: deepMerge(resolved.appearance, modeOverrides.appearance),
				};
			}
			if (modeOverrides.branding) {
				resolved = {
					...resolved,
					branding: deepMerge(resolved.branding, modeOverrides.branding),
				};
			}
			if (modeOverrides.content) {
				resolved = {
					...resolved,
					content: deepMerge(resolved.content, modeOverrides.content),
				};
			}

			return resolved;
		},
		[globalSettings]
	);

	const value = React.useMemo(
		() => ({
			settings: globalSettings,
			isLoading,
			resolveForMode,
		}),
		[globalSettings, isLoading, resolveForMode]
	);

	return <WidgetSettingsContext.Provider value={value}>{props.children}</WidgetSettingsContext.Provider>;
}
