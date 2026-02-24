import React from 'react';
import ReactDOM from 'react-dom/client';

import { parseConfig } from './config/parseConfig';
import { WidgetLanguageProvider } from './providers/WidgetLanguageProvider';
import { WalletBridgeProvider } from './providers/WalletBridgeProvider';
import { WidgetPermawebProvider } from './providers/WidgetPermawebProvider';
import { WidgetProvider } from './providers/WidgetProvider';
import { WidgetGlobalStyles } from './global-styles';
import App from './App';

const config = parseConfig();

function applyTheme() {
	const root = document.getElementById('permaweb-chat');
	if (!root) return;

	let theme = config.theme;
	if (theme === 'auto') {
		theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	root.setAttribute('data-theme', theme);
}

const container = document.getElementById('permaweb-chat');
if (container) {
	applyTheme();

	if (config.theme === 'auto') {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
	}

	ReactDOM.createRoot(container).render(
		<WidgetLanguageProvider>
			<WalletBridgeProvider walletMode={config.walletMode}>
				<WidgetPermawebProvider>
					<WidgetProvider config={config}>
						<WidgetGlobalStyles />
						<App />
					</WidgetProvider>
				</WidgetPermawebProvider>
			</WalletBridgeProvider>
		</WidgetLanguageProvider>
	);
} else {
	console.error('[Permaweb Widget] #permaweb-chat element not found.');
}
