import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { App } from 'app';
import { GlobalStyle } from 'app/styles';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { PortalProvider } from 'providers/PortalProvider';
import { SettingsProvider } from 'providers/SettingsProvider';
import { persistor, store } from 'store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<HashRouter>
				<SettingsProvider>
					<LanguageProvider>
						<ArweaveProvider>
							<PortalProvider>
								<GlobalStyle />
								<App />
							</PortalProvider>
						</ArweaveProvider>
					</LanguageProvider>
				</SettingsProvider>
			</HashRouter>
		</PersistGate>
	</Provider>
);
