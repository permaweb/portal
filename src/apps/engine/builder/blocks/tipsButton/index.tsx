// src/portal/blocks/tipsButton.tsx
import React from 'react';
import Button from 'engine/components/form/button';
import TipModal from 'engine/components/tipModal';
import { useArTip } from 'engine/hooks/useARTip';
import { usePortalProvider } from 'engine/providers/portalProvider';
import { debugLog } from 'helpers/utils';

type MonetizationSettings = {
	enabled: boolean;
	walletAddress: string;
	tokenAddress: string;
};

type TipsButtonBlockData = {
	label?: string;
	variant?: 'primary' | 'alt1' | 'alt2';
};

type TipsButtonProps = {
	element: any;
	preview: boolean;
	location?: 'page' | 'post';
	postId?: string;
};

export default function TipsButton(props: TipsButtonProps) {
	const { portal } = usePortalProvider();
	const { sendTip } = useArTip();

	// Portal-level monetization config
	const monetization = portal?.Monetization as MonetizationSettings | undefined;
	const enabled = !!monetization?.enabled;
	const walletAddress = monetization?.walletAddress || null;

	// Block-level config (label + variant)
	const data: TipsButtonBlockData = React.useMemo(() => {
		const raw = (props.element?.data ?? {}) as TipsButtonBlockData;
		return {
			label: raw.label ?? '',
			variant: raw.variant ?? 'primary',
		};
	}, [props.element?.data]);

	const label = data.label || 'Support this portal';
	const variant = data.variant ?? 'primary';
	const location = props.location === 'post' ? 'post' : 'page';

	const [modalOpen, setModalOpen] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);

	// If monetization is off or no wallet, render nothing (except in preview mode)
	if ((!enabled || !walletAddress) && !props.preview) return null;

	const handleClick = () => {
		if (props.preview || submitting) return;
		setModalOpen(true);
	};

	const handleConfirmTip = async (amount: string) => {
		if (!walletAddress || !sendTip) return;

		try {
			setSubmitting(true);
			await sendTip(walletAddress, amount, location, props.postId);
		} catch (e) {
			debugLog('error', 'TipsButton', 'tip failed', e);
		} finally {
			setSubmitting(false);
			setModalOpen(false);
		}
	};

	const handleCloseModal = () => {
		if (submitting) return;
		setModalOpen(false);
	};

	return (
		<>
			<div className="portal-monetization-button">
				<Button type={variant} label={label} onClick={handleClick} disabled={props.preview || submitting} />
			</div>

			<TipModal isOpen={modalOpen} onClose={handleCloseModal} onConfirm={handleConfirmTip} />
		</>
	);
}
