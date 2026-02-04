import React from 'react';

import * as S from './styles';

type NotificationProps = {
	message: string;
	type: 'success' | 'warning';
	onClose: () => void;
	persistent?: boolean;
};

export default function Notification({ message, type, onClose, persistent }: NotificationProps) {
	React.useEffect(() => {
		if (persistent) return;

		const timer = setTimeout(() => {
			onClose();
		}, 4000);

		return () => clearTimeout(timer);
	}, [onClose, persistent]);

	const isWarning = type === 'warning';

	return (
		<S.Wrapper $warning={isWarning}>
			<S.Icon $warning={isWarning}>
				{isWarning ? (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				) : (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M5 13l4 4L19 7" />
					</svg>
				)}
			</S.Icon>
			<S.Message>{message}</S.Message>
			<S.Close onClick={onClose}>×</S.Close>
		</S.Wrapper>
	);
}
