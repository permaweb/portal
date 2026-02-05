import React from 'react';
import Button from 'engine/components/form/button';
import TipModal from 'engine/components/tipModal';
import { useTokenTip } from 'engine/hooks/useTokenTip';
import { useEngineNotifications } from 'engine/providers/notificationProvider';
import { usePortalProvider } from 'engine/providers/portalProvider';

import { normalizeTipToken } from 'helpers/tokens';
import { MonetizationConfig } from 'helpers/types';
import { debugLog } from 'helpers/utils';

import * as S from './styles';

type TipsButtonBlockData = {
	label?: string;
	variant?: 'primary' | 'default';
};

type TipsButtonProps = {
	element: any;
	preview: boolean;
	location?: 'page' | 'post';
	postId?: string;
};

export default function TipsButton(props: TipsButtonProps) {
	const { portal } = usePortalProvider();
	const { addNotification } = useEngineNotifications();

	// Portal-level monetization config
	const monetization = portal?.Monetization as MonetizationConfig | undefined;
	const enabled = !!monetization?.enabled;
	const walletAddress = monetization?.walletAddress || null;
	const token = normalizeTipToken(monetization);
	const { sendTip } = useTokenTip(token);

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
			const txId = await sendTip(walletAddress, amount, location, props.postId);
			addNotification(`Successfully sent ${amount} ${token.symbol} tip!`, 'success');
			debugLog('info', 'TipsButton', 'Tip sent successfully', txId);
		} catch (e: any) {
			const errorMessage = e?.message || 'Failed to send tip';
			addNotification(errorMessage, 'warning');
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
		<S.Wrapper className="portal-monetization-button">
			<Button type={variant} label={label} onClick={handleClick} disabled={props.preview || submitting} />
			<TipModal isOpen={modalOpen} onClose={handleCloseModal} onConfirm={handleConfirmTip} tokenSymbol={token.symbol} />
		</S.Wrapper>
	);
}
