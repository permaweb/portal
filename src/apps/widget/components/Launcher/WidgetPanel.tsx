import React from 'react';
import styled, { keyframes } from 'styled-components';

import { LauncherPosition, ResolvedSettings } from '../../types';

const slideUp = keyframes`
	from { opacity: 0; transform: translateY(16px); }
	to { opacity: 1; transform: translateY(0); }
`;

const Panel = styled.div<{ $borderRadius: number }>`
	width: 380px;
	max-width: calc(100vw - 32px);
	height: 520px;
	max-height: calc(100vh - 120px);
	background: var(--widget-bg);
	border: 1px solid var(--widget-border);
	border-radius: ${(p) => p.$borderRadius}px;
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	animation: ${slideUp} 0.2s ease-out;
	z-index: 2147483646;
`;

const Footer = styled.div`
	padding: 6px 12px;
	text-align: center;
	font-size: 11px;
	color: var(--widget-text);
	opacity: 0.4;
	border-top: 1px solid var(--widget-border);
	flex-shrink: 0;
`;

function getPositionStyle(position: LauncherPosition, offsetX: number, offsetY: number, launcherSize: number) {
	const gap = 12;
	const base: React.CSSProperties = { position: 'fixed', zIndex: 2147483646 };

	switch (position) {
		case 'bottom-right':
			return { ...base, bottom: offsetY + launcherSize + gap, right: offsetX };
		case 'bottom-left':
			return { ...base, bottom: offsetY + launcherSize + gap, left: offsetX };
		case 'top-right':
			return { ...base, top: offsetY + launcherSize + gap, right: offsetX };
		case 'top-left':
			return { ...base, top: offsetY + launcherSize + gap, left: offsetX };
	}
}

interface WidgetPanelProps {
	settings: ResolvedSettings;
	children: React.ReactNode;
}

export default function WidgetPanel({ settings, children }: WidgetPanelProps) {
	const positionStyle = getPositionStyle(
		settings.launcher.position,
		settings.launcher.offsetX,
		settings.launcher.offsetY,
		settings.launcher.size
	);

	const footerText = settings.branding.footerText;
	const showPoweredBy = settings.branding.poweredByVisible;

	return (
		<Panel style={positionStyle} $borderRadius={settings.appearance.borderRadius}>
			{children}
			{(footerText || showPoweredBy) && <Footer>{footerText || (showPoweredBy ? 'Powered by Permaweb' : '')}</Footer>}
		</Panel>
	);
}
