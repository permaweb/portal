import React from 'react';
import styled from 'styled-components';

import { useMessages } from '../../hooks/useMessages';
import { usePermawebProvider } from '../../providers/WidgetPermawebProvider';
import { useWalletProvider } from '../../providers/WalletBridgeProvider';
import { useWidgetProvider } from '../../providers/WidgetProvider';
import ConnectButton from '../shared/ConnectButton';
import MessageBubble from './MessageBubble';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow: hidden;
`;

const MessageList = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 6px;
	scrollbar-width: thin;
	scrollbar-color: var(--widget-border) transparent;

	&::-webkit-scrollbar {
		width: 6px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background: var(--widget-border);
		border-radius: 3px;
	}
`;

const Empty = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	opacity: 0.5;
	font-size: 13px;
`;

const InputBar = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	border-top: 1px solid var(--widget-border);
	flex-shrink: 0;
`;

const Input = styled.textarea`
	flex: 1;
	resize: none;
	border: 1px solid var(--widget-border);
	border-radius: 6px;
	padding: 8px 10px;
	font-size: 13px;
	font-family: inherit;
	color: var(--widget-text);
	background: var(--widget-input-bg);
	outline: none;
	min-height: 36px;
	max-height: 80px;
	line-height: 1.4;

	&::placeholder {
		color: var(--widget-text);
		opacity: 0.5;
	}

	&:focus {
		border-color: var(--widget-primary);
	}
`;

const SendButton = styled.button<{ $active: boolean }>`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	border: none;
	background: ${(props) => (props.$active ? 'var(--widget-primary)' : 'var(--widget-border)')};
	color: white;
	cursor: ${(props) => (props.$active ? 'pointer' : 'default')};
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	font-size: 16px;
	transition: opacity 0.2s;

	&:hover {
		opacity: ${(props) => (props.$active ? 0.9 : 1)};
	}
`;

const ConnectWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12px;
	border-top: 1px solid var(--widget-border);
`;

export default function ChatView() {
	const { messages, isLoading, sendMessage } = useMessages();
	const { profile } = usePermawebProvider();
	const { walletAddress } = useWalletProvider();
	const { settings } = useWidgetProvider();
	const [text, setText] = React.useState('');
	const [sending, setSending] = React.useState(false);
	const listRef = React.useRef<HTMLDivElement>(null);
	const prevCountRef = React.useRef(0);

	const { showTimestamps, showAvatars } = settings.behavior;
	const placeholder = settings.content.placeholder || 'Type a message...';
	const emptyMessage = settings.content.emptyStateMessage || 'No messages yet';
	const requireWallet = settings.access.requireWalletToView;

	// Auto-scroll to bottom when new messages arrive
	React.useEffect(() => {
		if (messages.length > prevCountRef.current && listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
		prevCountRef.current = messages.length;
	}, [messages.length]);

	// Scroll to bottom on initial load
	React.useEffect(() => {
		if (!isLoading && messages.length > 0 && listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [isLoading]);

	const handleSend = async () => {
		const trimmed = text.trim();
		if (!trimmed || sending) return;

		setSending(true);
		try {
			await sendMessage(trimmed);
			setText('');
		} catch (e) {
			console.error('Failed to send:', e);
		} finally {
			setSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const canSend = text.trim().length > 0 && !sending;
	const isLoggedIn = Boolean(walletAddress && profile?.id);

	if (requireWallet && !walletAddress) {
		return (
			<Container>
				<Empty>Connect your wallet to view messages</Empty>
				<ConnectWrapper>
					<ConnectButton />
				</ConnectWrapper>
			</Container>
		);
	}

	return (
		<Container>
			<MessageList ref={listRef}>
				{isLoading && messages.length === 0 ? (
					<Empty>Loading...</Empty>
				) : messages.length === 0 ? (
					<Empty>{emptyMessage}</Empty>
				) : (
					messages.map((msg: any, i: number) => (
						<MessageBubble key={`${msg.id}-${i}`} data={msg} showTimestamp={showTimestamps} showAvatar={showAvatars} />
					))
				)}
			</MessageList>
			{isLoggedIn ? (
				<InputBar>
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						rows={1}
						disabled={sending}
					/>
					<SendButton $active={canSend} onClick={handleSend} disabled={!canSend}>
						&#8593;
					</SendButton>
				</InputBar>
			) : (
				<ConnectWrapper>
					<ConnectButton />
				</ConnectWrapper>
			)}
		</Container>
	);
}
