import React from 'react';
import { dryrun } from '@permaweb/aoconnect';

import { DeepPartial, WidgetSettings } from '../types';

const CACHE_KEY_PREFIX = 'permaweb-widget-settings-';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 5000; // 5 seconds

interface CacheEntry {
	data: DeepPartial<WidgetSettings>;
	timestamp: number;
}

function getCached(settingsId: string): DeepPartial<WidgetSettings> | null {
	try {
		const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + settingsId);
		if (!raw) return null;
		const entry: CacheEntry = JSON.parse(raw);
		if (Date.now() - entry.timestamp > CACHE_TTL) {
			sessionStorage.removeItem(CACHE_KEY_PREFIX + settingsId);
			return null;
		}
		return entry.data;
	} catch {
		return null;
	}
}

function setCache(settingsId: string, data: DeepPartial<WidgetSettings>) {
	try {
		const entry: CacheEntry = { data, timestamp: Date.now() };
		sessionStorage.setItem(CACHE_KEY_PREFIX + settingsId, JSON.stringify(entry));
	} catch {
		// sessionStorage full or unavailable
	}
}

async function fetchSettingsFromAO(settingsId: string): Promise<DeepPartial<WidgetSettings>> {
	const response = await dryrun({
		process: settingsId,
		tags: [{ name: 'Action', value: 'Get-Settings' }],
	});

	if (response.Messages && response.Messages.length > 0 && response.Messages[0].Data) {
		return JSON.parse(response.Messages[0].Data);
	}

	return {};
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('Timeout')), ms);
		promise.then(
			(val) => {
				clearTimeout(timer);
				resolve(val);
			},
			(err) => {
				clearTimeout(timer);
				reject(err);
			}
		);
	});
}

export function useWidgetSettings(settingsId?: string) {
	const [remoteSettings, setRemoteSettings] = React.useState<DeepPartial<WidgetSettings> | null>(null);
	const [isLoading, setIsLoading] = React.useState(!!settingsId);
	const [error, setError] = React.useState<Error | null>(null);

	React.useEffect(() => {
		if (!settingsId) {
			setRemoteSettings(null);
			setIsLoading(false);
			return;
		}

		// Check cache first
		const cached = getCached(settingsId);
		if (cached) {
			setRemoteSettings(cached);
			setIsLoading(false);
		}

		// Fetch fresh settings (even if cached, to update in background)
		let cancelled = false;

		withTimeout(fetchSettingsFromAO(settingsId), FETCH_TIMEOUT)
			.then((data) => {
				if (!cancelled) {
					setRemoteSettings(data);
					setCache(settingsId, data);
					setError(null);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					console.warn('[Widget] Failed to fetch settings from AO:', err.message);
					setError(err);
					// If no cached data, we'll use defaults (remoteSettings stays null)
				}
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [settingsId]);

	return { remoteSettings, isLoading, error };
}
