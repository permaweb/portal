import { WidgetConfig, WidgetMode, WalletMode, ThemeMode } from '../types';
import { DEFAULT_CONFIG } from './defaults';

function getScriptDataAttrs(): Partial<WidgetConfig> {
	const script = document.querySelector('script[data-process-id]');
	if (!script) return {};

	return {
		processId: script.getAttribute('data-process-id') || undefined,
		mode: (script.getAttribute('data-mode') as WidgetMode) || undefined,
		walletMode: (script.getAttribute('data-wallet') as WalletMode) || undefined,
		theme: (script.getAttribute('data-theme') as ThemeMode) || undefined,
		moderationId: script.getAttribute('data-moderation-id') || undefined,
		pollInterval: script.getAttribute('data-poll-interval')
			? parseInt(script.getAttribute('data-poll-interval'), 10)
			: undefined,
		height: script.getAttribute('data-height') || undefined,
		title: script.getAttribute('data-title') || undefined,
	};
}

function getUrlParams(): Partial<WidgetConfig> {
	const params = new URLSearchParams(window.location.search);

	return {
		processId: params.get('processId') || undefined,
		mode: (params.get('mode') as WidgetMode) || undefined,
		walletMode: (params.get('wallet') as WalletMode) || undefined,
		theme: (params.get('theme') as ThemeMode) || undefined,
		moderationId: params.get('moderationId') || undefined,
		pollInterval: params.get('pollInterval') ? parseInt(params.get('pollInterval'), 10) : undefined,
		height: params.get('height') || undefined,
		title: params.get('title') || undefined,
	};
}

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
	const result: any = {};
	for (const key of Object.keys(obj)) {
		if (obj[key] !== undefined) {
			result[key] = obj[key];
		}
	}
	return result;
}

export function parseConfig(): WidgetConfig {
	const scriptAttrs = stripUndefined(getScriptDataAttrs());
	const urlParams = stripUndefined(getUrlParams());

	const merged = {
		...DEFAULT_CONFIG,
		...scriptAttrs,
		...urlParams,
	};

	if (!merged.processId) {
		console.error('[Permaweb Widget] processId is required. Provide via data-process-id or ?processId=');
	}

	return merged as WidgetConfig;
}
