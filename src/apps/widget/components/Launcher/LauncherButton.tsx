import React from 'react';
import styled, { keyframes, css } from 'styled-components';

import { LauncherSettings, LauncherAnimation } from '../../types';

const bounce = keyframes`
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-6px); }
`;

const pulse = keyframes`
	0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
	70% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
	100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

function getAnimation(type: LauncherAnimation) {
	switch (type) {
		case 'bounce':
			return css`
				animation: ${bounce} 2s ease-in-out infinite;
			`;
		case 'pulse':
			return css`
				animation: ${pulse} 2s ease-in-out infinite;
			`;
		default:
			return '';
	}
}

const Button = styled.button<{
	$size: number;
	$animation: LauncherAnimation;
	$primaryColor: string;
	$isOpen: boolean;
}>`
	width: ${(p) => p.$size}px;
	height: ${(p) => p.$size}px;
	border-radius: 50%;
	border: none;
	background: ${(p) => p.$primaryColor};
	color: white;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: ${(p) => Math.round(p.$size * 0.43)}px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	position: relative;
	z-index: 2147483647;

	${(p) => !p.$isOpen && getAnimation(p.$animation)}

	&:hover {
		transform: scale(1.08);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	&:active {
		transform: scale(0.96);
	}
`;

const Badge = styled.span`
	position: absolute;
	top: -4px;
	right: -4px;
	background: #ef4444;
	color: white;
	font-size: 11px;
	font-weight: 700;
	min-width: 18px;
	height: 18px;
	border-radius: 9px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 4px;
	line-height: 1;
`;

const CloseIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
	>
		<line x1="5" y1="5" x2="15" y2="15" />
		<line x1="15" y1="5" x2="5" y2="15" />
	</svg>
);

interface LauncherButtonProps {
	launcher: LauncherSettings;
	primaryColor: string;
	isOpen: boolean;
	unreadCount: number;
	onClick: () => void;
}

export default function LauncherButton({ launcher, primaryColor, isOpen, unreadCount, onClick }: LauncherButtonProps) {
	const isUrl = launcher.icon.startsWith('http://') || launcher.icon.startsWith('https://');

	return (
		<Button
			$size={launcher.size}
			$animation={launcher.animation}
			$primaryColor={primaryColor}
			$isOpen={isOpen}
			onClick={onClick}
			title={launcher.tooltip}
			aria-label={isOpen ? 'Close chat' : launcher.tooltip}
		>
			{isOpen ? (
				<CloseIcon />
			) : isUrl ? (
				<img src={launcher.icon} alt="" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
			) : (
				launcher.icon
			)}
			{!isOpen && unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
		</Button>
	);
}
