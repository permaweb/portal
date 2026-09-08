import React from 'react';
import { createPortal } from 'react-dom';

import { Notification } from 'components/atoms/Notification';
import { DOM } from 'helpers/config';
import { getGatewayRequestSnapshot, subscribeGatewayRequests } from 'helpers/gatewayRateLimit';
import { GATEWAY_RETRY_MESSAGE, mountGatewayRetryNotice } from 'helpers/gatewayRetryNotice';

interface NotificationItem {
	id: string;
	message: string;
	type: 'success' | 'warning';
	timestamp: number;
	persistent?: boolean;
}

interface NotificationOptions {
	persistent?: boolean;
}

interface NotificationContextType {
	notifications: NotificationItem[];
	addNotification: (message: string, type: 'success' | 'warning', opts?: NotificationOptions) => void;
	removeNotification: (id: string) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
	const context = React.useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotifications must be used within a NotificationProvider');
	}
	return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
	const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
	const [gatewayRetrying, setGatewayRetrying] = React.useState(() => getGatewayRequestSnapshot().retryingRequests > 0);
	const [ownsGatewayNotice, setOwnsGatewayNotice] = React.useState(false);

	React.useEffect(() => {
		// The gateway may reject the first portal/profile request, before its notification node exists.
		setPortalContainer(document.getElementById(DOM.notification) || document.body);
		return mountGatewayRetryNotice({ onRetryNoticeOwnershipChange: setOwnsGatewayNotice });
	}, []);

	React.useEffect(() => {
		const update = () => setGatewayRetrying(getGatewayRequestSnapshot().retryingRequests > 0);
		const unsubscribe = subscribeGatewayRequests(update);
		update();
		return unsubscribe;
	}, []);

	const addNotification = React.useCallback(
		(message: string, type: 'success' | 'warning', opts?: NotificationOptions) => {
			const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
			const newNotification: NotificationItem = {
				id,
				message,
				type,
				timestamp: Date.now(),
				persistent: opts?.persistent,
			};

			setNotifications((prev) => [...prev, newNotification]);
		},
		[]
	);

	const removeNotification = React.useCallback((id: string) => {
		setNotifications((prev) => prev.filter((notification) => notification.id !== id));
	}, []);

	const contextValue: NotificationContextType = {
		notifications,
		addNotification,
		removeNotification,
	};

	return (
		<NotificationContext.Provider value={contextValue}>
			{children}
			{portalContainer &&
				createPortal(
					<NotificationStack
						notifications={notifications}
						removeNotification={removeNotification}
						gatewayRetrying={gatewayRetrying && ownsGatewayNotice}
					/>,
					portalContainer
				)}
		</NotificationContext.Provider>
	);
};

const NotificationStack: React.FC<{
	notifications: NotificationItem[];
	removeNotification: (id: string) => void;
	gatewayRetrying: boolean;
}> = ({ notifications, removeNotification, gatewayRetrying }) => {
	return (
		<div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
			{gatewayRetrying && (
				<div role="status" aria-live="polite" style={{ marginBottom: notifications.length ? 15 : 0 }}>
					<Notification
						message={GATEWAY_RETRY_MESSAGE}
						type="warning"
						persistent
						dismissible={false}
						wrap
						callback={null}
					/>
				</div>
			)}
			{notifications.map((notification, index) => (
				<div
					key={notification.id}
					style={{
						marginBottom: index < notifications.length - 1 ? '15px' : '0',
						transform: `translateY(${index * -5}px)`,
					}}
				>
					<Notification
						message={notification.message}
						type={notification.type}
						persistent={notification.persistent}
						callback={() => removeNotification(notification.id)}
					/>
				</div>
			))}
		</div>
	);
};
