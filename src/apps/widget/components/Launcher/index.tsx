import React from 'react';
import styled from 'styled-components';

import { LauncherPosition, ResolvedSettings } from '../../types';
import LauncherButton from './LauncherButton';
import WidgetPanel from './WidgetPanel';

function getLauncherPositionStyle(position: LauncherPosition, offsetX: number, offsetY: number): React.CSSProperties {
	const base: React.CSSProperties = { position: 'fixed', zIndex: 2147483647 };

	switch (position) {
		case 'bottom-right':
			return { ...base, bottom: offsetY, right: offsetX };
		case 'bottom-left':
			return { ...base, bottom: offsetY, left: offsetX };
		case 'top-right':
			return { ...base, top: offsetY, right: offsetX };
		case 'top-left':
			return { ...base, top: offsetY, left: offsetX };
	}
}

interface LauncherProps {
	settings: ResolvedSettings;
	children: React.ReactNode;
}

export default function Launcher({ settings, children }: LauncherProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [unreadCount, setUnreadCount] = React.useState(0);
	const autoOpenFired = React.useRef(false);

	// Auto-open on delay
	React.useEffect(() => {
		if (!settings.behavior.autoOpen || autoOpenFired.current) return;

		const timer = setTimeout(() => {
			autoOpenFired.current = true;
			setIsOpen(true);
		}, settings.behavior.autoOpenDelay);

		return () => clearTimeout(timer);
	}, [settings.behavior.autoOpen, settings.behavior.autoOpenDelay]);

	// Track unread count from commentAdded events when panel is closed
	React.useEffect(() => {
		const handler = () => {
			if (!isOpen) {
				setUnreadCount((c) => c + 1);
			}
		};
		window.addEventListener('commentAdded', handler);
		return () => window.removeEventListener('commentAdded', handler);
	}, [isOpen]);

	// Clear unread on open
	React.useEffect(() => {
		if (isOpen) setUnreadCount(0);
	}, [isOpen]);

	const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

	const launcherStyle = getLauncherPositionStyle(
		settings.launcher.position,
		settings.launcher.offsetX,
		settings.launcher.offsetY
	);

	return (
		<>
			{isOpen && <WidgetPanel settings={settings}>{children}</WidgetPanel>}
			<div style={launcherStyle}>
				<LauncherButton
					launcher={settings.launcher}
					primaryColor={settings.appearance.primaryColor}
					isOpen={isOpen}
					unreadCount={unreadCount}
					onClick={toggle}
				/>
			</div>
		</>
	);
}
