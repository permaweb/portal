import React from 'react';

import { UPLOAD } from 'helpers/config';
import { getARUploadCostEndpoint } from 'helpers/endpoints';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useNotifications } from 'providers/NotificationProvider';

export function useUploadCost() {
	const arProvider = useArweaveProvider();
	const { addNotification } = useNotifications();

	const [uploadCost, setUploadCost] = React.useState<number | null>(null);
	const [showUploadConfirmation, setShowUploadConfirmation] = React.useState<boolean>(false);
	const [insufficientBalance, setInsufficientBalance] = React.useState<boolean>(false);

	const calculateUploadCost = React.useCallback(
		async (file: File) => {
			if (!arProvider.wallet) return null;

			const contentSize = file.size;

			if (contentSize <= UPLOAD.freeUploadLimit) {
				return { requiresConfirmation: false, cost: 0 };
			}

			try {
				setShowUploadConfirmation(true);

				const uploadPriceResponse = await fetch(getARUploadCostEndpoint(contentSize));
				if (!uploadPriceResponse.ok) throw new Error(`Unable to calculate the Arweave upload fee`);
				const uploadInWinc = Number(await uploadPriceResponse.text());
				const arBalanceInWinc = Number(arProvider.arBalance || 0) * 1e12;

				setUploadCost(uploadInWinc);
				if (uploadInWinc > arBalanceInWinc) {
					setInsufficientBalance(true);
					return { requiresConfirmation: true, cost: uploadInWinc, hasInsufficientBalance: true };
				}

				setInsufficientBalance(false);
				return { requiresConfirmation: true, cost: uploadInWinc, hasInsufficientBalance: false };
			} catch (e: any) {
				addNotification(e.message ?? 'Error calculating upload cost', 'warning');
				return null;
			}
		},
		[arProvider.wallet, arProvider.arBalance]
	);

	const clearUploadState = React.useCallback(() => {
		setUploadCost(null);
		setShowUploadConfirmation(false);
		setInsufficientBalance(false);
	}, []);

	return {
		uploadCost,
		showUploadConfirmation,
		calculateUploadCost,
		clearUploadState,
		insufficientBalance,
	};
}
