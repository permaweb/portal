import React from 'react';
import styled from 'styled-components';

import { useWidgetProvider } from './providers/WidgetProvider';
import ChatView from './components/ChatView';
import CommentsView from './components/CommentsView';
import PrivateView from './components/PrivateView';

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

export default function App() {
	const { config } = useWidgetProvider();

	const renderMode = () => {
		switch (config.mode) {
			case 'comments':
				return <CommentsView />;
			case 'private':
				return <PrivateView />;
			case 'chat':
			default:
				return <ChatView />;
		}
	};

	const defaultTitle = config.mode === 'comments' ? 'Comments' : config.mode === 'private' ? 'Private Chat' : 'Chat';

	return (
		<Container $height={config.height}>
			<Header>{config.title || defaultTitle}</Header>
			{renderMode()}
		</Container>
	);
}
