import React from 'react';

import { ARIO } from '@ar.io/sdk';

import { IS_TESTNET } from 'helpers/config';
import { useArweaveProvider } from 'providers/ArweaveProvider';

export function useArIOBalance(address?: string) {
	const arProvider = useArweaveProvider();
	const userAddress = address ?? arProvider.walletAddress;

	const [balance, setBalance] = React.useState<number | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		let isMounted = true;

		async function fetchBalance() {
			if (!userAddress) {
				setBalance(null);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				// Initialize ARIO client for the appropriate network
				const ario = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();

				const arIOBalance = await ario.getBalance({
					address: userAddress,
				});

				if (isMounted) {
					setBalance(Number(arIOBalance));
				}
			} catch (err: any) {
				console.error('Error fetching ARIO balance:', err);
				if (isMounted) {
					setError(err.message || 'Failed to fetch balance');
					setBalance(null);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		fetchBalance();

		return () => {
			isMounted = false;
		};
	}, [userAddress]);

	// Refresh function that can be called manually
	const refetch = React.useCallback(async () => {
		if (!userAddress) return;

		setLoading(true);
		setError(null);

		try {
			const ario = IS_TESTNET ? ARIO.testnet() : ARIO.mainnet();

			const arIOBalance = await ario.getBalance({
				address: userAddress,
			});

			setBalance(Number(arIOBalance));
		} catch (err: any) {
			console.error('Error fetching ARIO balance:', err);
			setError(err.message || 'Failed to fetch balance');
			setBalance(null);
		} finally {
			setLoading(false);
		}
	}, [userAddress]);

	return {
		balance,
		loading,
		error,
		refetch,
	};
}
