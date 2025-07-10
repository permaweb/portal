import React from 'react';

import { UPLOAD } from 'helpers/config';
import { getTurboCostWincEndpoint } from 'helpers/endpoints';
import { NotificationType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';

export function useUploadCost() {
	const arProvider = useArweaveProvider();

	const [uploadCost, setUploadCost] = React.useState<number | null>(null);
	const [showUploadConfirmation, setShowUploadConfirmation] = React.useState<boolean>(false);
	const [uploadResponse, setUploadResponse] = React.useState<NotificationType | null>(null);

	const calculateUploadCost = React.useCallback(async (file: File) => {
		if (!arProvider.wallet) return null;

		const contentSize = file.size;

		if (contentSize < UPLOAD.dispatchUploadSize) {
			return { requiresConfirmation: false, cost: 0 };
		}

		try {
			setShowUploadConfirmation(true);

			const uploadPriceResponse = await fetch(getTurboCostWincEndpoint(contentSize));
			const uploadInWinc = Number((await uploadPriceResponse.json()).winc);

			setUploadCost(uploadInWinc);

			if (uploadInWinc > arProvider.turboBalance) {
				setUploadResponse({ status: 'warning', message: 'Insufficient balance for upload' });
				return { requiresConfirmation: true, cost: uploadInWinc, hasInsufficientBalance: true };
			}

			return { requiresConfirmation: true, cost: uploadInWinc, hasInsufficientBalance: false };
		} catch (e: any) {
			setUploadResponse({ status: 'warning', message: e.message ?? 'Error calculating upload cost' });
			return null;
		}
	}, [arProvider.wallet, arProvider.turboBalance]);

	const clearUploadState = React.useCallback(() => {
		setUploadCost(null);
		setShowUploadConfirmation(false);
	}, []);

	return {
		uploadCost,
		showUploadConfirmation,
		uploadResponse,
		setUploadResponse,
		calculateUploadCost,
		clearUploadState,
	};
}