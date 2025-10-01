import React from 'react';
import { createPortal } from 'react-dom';
import * as S from './styles';
import { Button } from '../Button';

type Props = {
	open: boolean;
	message: React.ReactNode;
	onConfirm: () => Promise<void> | void;
	onClose: () => void;
	onReject?: () => void;
	confirmLabel?: string;
	rejectLabel?: string;
	closeOnOverlay?: boolean;
};

export default function ConfirmModal(props: Props) {
	const lastActive = React.useRef<HTMLElement | null>(null);
	const [isWorking, setIsWorking] = React.useState(false);

	// Mount guard
	if (typeof document === 'undefined') return null;

	// Manage focus + body scroll lock
	React.useEffect(() => {
		if (!props.open) return;
		lastActive.current = document.activeElement as HTMLElement | null;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
			lastActive.current?.focus?.();
		};
	}, [props.open]);

	const handleOverlayClick = React.useCallback(() => {
		if (props.closeOnOverlay === false) return;
		props.onReject?.();
		props.onClose();
	}, [props]);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				props.onReject?.();
				props.onClose();
			}
			if (e.key === 'Enter') {
				e.preventDefault();
				void handleConfirm();
			}
		},
		[props]
	);

	const handleReject = React.useCallback(() => {
		if (isWorking) return;
		props.onReject?.();
		props.onClose();
	}, [isWorking, props]);

	const handleConfirm = React.useCallback(async () => {
		if (isWorking) return;
		try {
			setIsWorking(true);
			await props.onConfirm();
			props.onClose();
		} finally {
			setIsWorking(false);
		}
	}, [isWorking, props]);

	if (!props.open) return null;

	return createPortal(
		<S.Overlay role="presentation" onMouseDown={handleOverlayClick} aria-hidden="true">
			<S.Dialog
				role="dialog"
				aria-modal="true"
				aria-live="assertive"
				onKeyDown={handleKeyDown}
				onMouseDown={(e) => e.stopPropagation()} // prevent overlay handler
				tabIndex={-1}
			>
				<S.Message>{props.message}</S.Message>
				<S.Actions>
					<Button
						type="warning"
						handlePress={handleReject}
						disabled={isWorking}
						data-variant="reject"
						label={props.rejectLabel ?? 'Cancel'}
					/>
					<Button
						type="alt1"
						label={isWorking ? 'Working…' : props.confirmLabel ?? 'Confirm'}
						handlePress={handleConfirm}
						disabled={isWorking}
						data-variant="confirm"
						data-loading={isWorking ? 'true' : 'false'}
					/>
				</S.Actions>
			</S.Dialog>
		</S.Overlay>,
		document.body
	);
}
