import React from 'react';
import { createPortal } from 'react-dom';
import Notification from 'engine/components/notification';

import { DOM } from 'helpers/config';

interface NotificationItem {
	id: string;
	message: string;
	type: 'success' | 'warning';
	persistent?: boolean;
}

interface NotificationContextType {
	addNotification: (message: string, type: 'success' | 'warning', opts?: { persistent?: boolean }) => void;
	removeNotification: (id: string) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const useEngineNotifications = () => {
	const context = React.useContext(NotificationContext);
	if (!context) {
		throw new Error('useEngineNotifications must be used within an EngineNotificationProvider');
	}
	return context;
};

export function EngineNotificationProvider({ children }: { children: React.ReactNode }) {
	const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
	const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

	React.useEffect(() => {
		const checkForContainer = () => {
			const container = document.getElementById(DOM.notification);
			if (container) {
				setPortalContainer(container);
			}
		};

		checkForContainer();

		if (!portalContainer) {
			const timer = setTimeout(checkForContainer, 100);
			return () => clearTimeout(timer);
		}
	}, [portalContainer]);

	const addNotification = React.useCallback(
		(message: string, type: 'success' | 'warning', opts?: { persistent?: boolean }) => {
			const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
			setNotifications((prev) => [...prev, { id, message, type, persistent: opts?.persistent }]);
		},
		[]
	);

	const removeNotification = React.useCallback((id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}, []);

	return (
		<NotificationContext.Provider value={{ addNotification, removeNotification }}>
			{children}
			{portalContainer &&
				createPortal(
					<div
						style={{
							position: 'fixed',
							bottom: '20px',
							left: '50%',
							transform: 'translateX(-50%)',
							zIndex: 9999,
							display: 'flex',
							flexDirection: 'column',
							gap: '10px',
						}}
					>
						{notifications.map((notification) => (
							<Notification
								key={notification.id}
								message={notification.message}
								type={notification.type}
								persistent={notification.persistent}
								onClose={() => removeNotification(notification.id)}
							/>
						))}
					</div>,
					portalContainer
				)}
		</NotificationContext.Provider>
	);
}
