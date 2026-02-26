import React from 'react';
import styled from 'styled-components';

import { useWidgetProvider } from './providers/WidgetProvider';
import ChatView from './components/ChatView';
import CommentsView from './components/CommentsView';
import PrivateView from './components/PrivateView';
import { WidgetMode } from './types';

const Container = styled.div<{ $height?: string }>`
	display: flex;
	flex-direction: column;
	height: ${(props) => props.$height || '500px'};
	overflow: hidden;
`;

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 14px;
	border-bottom: 1px solid var(--widget-border);
	font-weight: 600;
	font-size: 15px;
	flex-shrink: 0;
`;

const HeaderMinimal = styled.div`
	padding: 6px 14px;
	border-bottom: 1px solid var(--widget-border);
	font-weight: 600;
	font-size: 13px;
	flex-shrink: 0;
	opacity: 0.7;
`;

const LogoImg = styled.img`
	height: 24px;
	width: auto;
	margin-right: 8px;
`;

const WelcomeBanner = styled.div`
	padding: 10px 14px;
	background: var(--widget-card-bg);
	font-size: 13px;
	border-bottom: 1px solid var(--widget-border);
`;

const ModeTabs = styled.div`
	display: flex;
	border-bottom: 1px solid var(--widget-border);
	flex-shrink: 0;
`;

const ModeTab = styled.button<{ $active: boolean }>`
	flex: 1;
	padding: 8px;
	border: none;
	background: ${(p) => (p.$active ? 'var(--widget-card-bg)' : 'transparent')};
	color: ${(p) => (p.$active ? 'var(--widget-primary)' : 'var(--widget-text)')};
	font-size: 12px;
	font-weight: ${(p) => (p.$active ? 600 : 400)};
	cursor: pointer;
	border-bottom: 2px solid ${(p) => (p.$active ? 'var(--widget-primary)' : 'transparent')};
	transition: all 0.15s;

	&:hover {
		background: var(--widget-hover);
	}
`;

const WELCOME_STORAGE_KEY = 'permaweb-widget-welcomed';

export default function App() {
	const { config, settings } = useWidgetProvider();
	const { appearance, behavior, branding, content } = settings;

	const enabledModes = behavior.enabledModes;
	const hasMultipleModes = enabledModes.length > 1;

	const [activeMode, setActiveMode] = React.useState<WidgetMode>(config.mode);
	const [showWelcome, setShowWelcome] = React.useState(false);

	// Welcome message (show once per session)
	React.useEffect(() => {
		if (content.welcomeMessage && !sessionStorage.getItem(WELCOME_STORAGE_KEY)) {
			setShowWelcome(true);
			sessionStorage.setItem(WELCOME_STORAGE_KEY, '1');
			const timer = setTimeout(() => setShowWelcome(false), 8000);
			return () => clearTimeout(timer);
		}
	}, [content.welcomeMessage]);

	const renderMode = () => {
		switch (activeMode) {
			case 'comments':
				return <CommentsView />;
			case 'private':
				return <PrivateView />;
			case 'chat':
			default:
				return <ChatView />;
		}
	};

	const modeLabels: Record<WidgetMode, string> = {
		chat: 'Chat',
		comments: 'Comments',
		private: 'Private',
	};

	const headerTitle =
		branding.headerTitle ||
		config.title ||
		(activeMode === 'comments' ? 'Comments' : activeMode === 'private' ? 'Private Chat' : 'Chat');

	const isInLauncher = !!config.settingsId;

	return (
		<Container $height={isInLauncher ? '100%' : config.height}>
			{appearance.headerStyle === 'default' && (
				<Header>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						{branding.logoUrl && <LogoImg src={branding.logoUrl} alt="" />}
						{headerTitle}
					</div>
				</Header>
			)}
			{appearance.headerStyle === 'minimal' && <HeaderMinimal>{headerTitle}</HeaderMinimal>}

			{showWelcome && content.welcomeMessage && <WelcomeBanner>{content.welcomeMessage}</WelcomeBanner>}

			{hasMultipleModes && (
				<ModeTabs>
					{enabledModes.map((mode) => (
						<ModeTab key={mode} $active={activeMode === mode} onClick={() => setActiveMode(mode)}>
							{modeLabels[mode]}
						</ModeTab>
					))}
				</ModeTabs>
			)}

			{renderMode()}
		</Container>
	);
}
