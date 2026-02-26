import React from 'react';
import ReactDOM from 'react-dom/client';

import { parseConfig } from './config/parseConfig';
import { WidgetLanguageProvider } from './providers/WidgetLanguageProvider';
import { WalletBridgeProvider } from './providers/WalletBridgeProvider';
import { WidgetPermawebProvider } from './providers/WidgetPermawebProvider';
import { WidgetSettingsProvider, useWidgetSettingsProvider } from './providers/WidgetSettingsProvider';
import { WidgetProvider } from './providers/WidgetProvider';
import { WidgetGlobalStyles } from './global-styles';
import App from './App';
import Launcher from './components/Launcher';

const config = parseConfig();

function applyTheme(root: HTMLElement) {
	let theme = config.theme;
	if (theme === 'auto') {
		theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	root.setAttribute('data-theme', theme);
}

/**
 * Inner component that decides between inline and launcher rendering.
 * Must be inside WidgetSettingsProvider to access resolved settings.
 */
function WidgetShell() {
	const { settings } = useWidgetSettingsProvider();
	const isLauncherMode = !!config.settingsId;

	if (isLauncherMode) {
		return (
			<Launcher settings={settings}>
				<div
					id="permaweb-chat-panel"
					data-theme={
						config.theme === 'auto'
							? window.matchMedia('(prefers-color-scheme: dark)').matches
								? 'dark'
								: 'light'
							: config.theme
					}
					style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
				>
					<WidgetGlobalStyles
						$primaryColor={settings.appearance.primaryColor}
						$accentColor={settings.appearance.accentColor}
						$fontFamily={settings.appearance.fontFamily}
						$borderRadius={settings.appearance.borderRadius}
						$customCss={settings.appearance.customCss}
					/>
					<App />
				</div>
			</Launcher>
		);
	}

	return (
		<>
			<WidgetGlobalStyles
				$primaryColor={settings.appearance.primaryColor}
				$accentColor={settings.appearance.accentColor}
				$fontFamily={settings.appearance.fontFamily}
				$borderRadius={settings.appearance.borderRadius}
				$customCss={settings.appearance.customCss}
			/>
			<App />
		</>
	);
}

function renderApp(container: HTMLElement) {
	ReactDOM.createRoot(container).render(
		<WidgetLanguageProvider>
			<WalletBridgeProvider walletMode={config.walletMode}>
				<WidgetPermawebProvider>
					<WidgetSettingsProvider config={config}>
						<WidgetProvider config={config}>
							<WidgetShell />
						</WidgetProvider>
					</WidgetSettingsProvider>
				</WidgetPermawebProvider>
			</WalletBridgeProvider>
		</WidgetLanguageProvider>
	);
}

const isLauncherMode = !!config.settingsId;

if (isLauncherMode) {
	// Launcher mode: create a container on document.body for the floating widget
	let launcherRoot = document.getElementById('permaweb-chat-launcher');
	if (!launcherRoot) {
		launcherRoot = document.createElement('div');
		launcherRoot.id = 'permaweb-chat-launcher';
		document.body.appendChild(launcherRoot);
	}

	// Apply theme to launcher root
	applyTheme(launcherRoot);
	if (config.theme === 'auto') {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(launcherRoot));
	}

	renderApp(launcherRoot);
} else {
	// Inline mode: existing behavior
	const container = document.getElementById('permaweb-chat');
	if (container) {
		applyTheme(container);
		if (config.theme === 'auto') {
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(container));
		}
		renderApp(container);
	} else {
		console.error('[Permaweb Widget] #permaweb-chat element not found.');
	}
}
