import { installGatewayFetch } from './gatewayRateLimit';

// Keep this side effect before SDK imports: some clients capture fetch at module initialization.
installGatewayFetch();
