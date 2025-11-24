// src/portal/blocks/monetizationButton.tsx
import React from 'react';
import Button from 'engine/components/form/button';
import { useArTip } from 'engine/hooks/useARTip';
import { usePortalProvider } from 'engine/providers/portalProvider';

type MonetizationSettings = {
	enabled: boolean;
	walletAddress: string;
	tokenAddress: string;
};

type MonetizationButtonBlockData = {
	label?: string;
	amount?: string;
	variant?: 'primary' | 'alt1' | 'alt2';
};

export default function MonetizationButton(props: { element: any; preview: boolean; location?: 'page' | 'post' }) {
	const { portal } = usePortalProvider();
	const { sendTip } = useArTip();
	const monetization = portal?.Monetization as MonetizationSettings | undefined;

	const data: MonetizationButtonBlockData = React.useMemo(() => {
		const raw = (props.element?.data ?? {}) as MonetizationButtonBlockData;
		return {
			label: raw.label ?? '',
			amount: raw.amount ?? '',
			variant: raw.variant ?? 'primary',
		};
	}, [props.element?.data]);

	const enabled = !!monetization?.enabled;
	const walletAddress = monetization?.walletAddress;

	const label = data.label || 'Support this portal';
	const amount = data.amount || ''; // optional
	// If monetization is off or no wallet, quietly render nothing
	if (!enabled || !walletAddress) return null;

	const handleClick = async () => {
		if (props.preview) return;

		try {
			await sendTip(walletAddress, amount, props.location === 'post' ? 'post' : 'page');
		} catch (e) {
			console.error('[MonetizationButton] tip failed', e);
		}
	};

	return (
		<div className="portal-monetization-button">
			<Button type={data.variant ?? 'primary'} label={label} onClick={handleClick} disabled={false} />
		</div>
	);
}
