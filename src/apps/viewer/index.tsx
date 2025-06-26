import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { Footer } from 'viewer/navigation/footer';
import { Header } from 'viewer/navigation/header';
import { PortalProvider, usePortalProvider } from 'viewer/providers/PortalProvider';

import { Loader } from 'components/atoms/Loader';
import { DOM } from 'helpers/config';
import { GlobalStyle } from 'helpers/styles';
import { ArweaveProvider } from 'providers/ArweaveProvider';
import { LanguageProvider } from 'providers/LanguageProvider';
import { PermawebProvider } from 'providers/PermawebProvider';
import { SettingsProvider } from 'providers/SettingsProvider';

function App() {
	const portalProvider = usePortalProvider();

	if (!portalProvider.current)
		return (
			<>
				<div id={DOM.loader} />
				<Loader />
			</>
		);

	return (
		<>
			<div id={DOM.loader} />
			<div id={DOM.notification} />
			<div id={DOM.overlay} />
			<Header />
			<div style={{ height: 200 }}>

			</div>
			<Footer />
		</>
	);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<HashRouter>
		<SettingsProvider>
			<LanguageProvider>
				<ArweaveProvider>
					<PermawebProvider>
						<PortalProvider>
							<GlobalStyle />
							<App />
						</PortalProvider>
					</PermawebProvider>
				</ArweaveProvider>
			</LanguageProvider>
		</SettingsProvider>
	</HashRouter>
);
