import * as React from 'react';

import { ARIO } from '@ar.io/sdk';

import { IS_TESTNET } from 'helpers/config';

export interface AntVersionInfo {
	moduleId: string;
	luaSourceId: string;
}

export function useLatestANTVersion() {
	const [data, setData] = React.useState<AntVersionInfo | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [error, setError] = React.useState<Error | null>(null);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const client = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();
				// Try likely SDK helpers with graceful fallback
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const anyClient: any = client as any;
				let res: any = null;
				if (typeof anyClient.getLatestANTVersion === 'function') {
					res = await anyClient.getLatestANTVersion();
				} else if (typeof anyClient.getAntModuleInfo === 'function') {
					res = await anyClient.getAntModuleInfo();
				}
				if (!cancelled && res && typeof res === 'object') {
					const moduleId = (res.moduleId as string) || (res?.module?.id as string);
					const luaSourceId = (res.luaSourceId as string) || (res?.module?.luaSourceId as string);
					if (moduleId && luaSourceId) setData({ moduleId, luaSourceId });
				}
			} catch (e: any) {
				if (!cancelled) setError(e);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return { data, loading, error } as const;
}
