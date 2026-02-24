import React from 'react';
import styled from 'styled-components';

import { useMessages } from '../../hooks/useMessages';
import { useEncryption } from '../../hooks/useEncryption';
import { usePermawebProvider } from '../../providers/WidgetPermawebProvider';
import { useWalletProvider } from '../../providers/WalletBridgeProvider';
import ConnectButton from '../shared/ConnectButton';
import MessageBubble from '../ChatView/MessageBubble';
import JoinGroup from './JoinGroup';

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

const GroupHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 6px 12px;
	background: var(--widget-card-bg);
	font-size: 12px;
	border-bottom: 1px solid var(--widget-border);
`;

const LeaveButton = styled.button`
	border: none;
	background: transparent;
	color: var(--widget-primary);
	font-size: 12px;
	cursor: pointer;
	padding: 2px 6px;

	&:hover {
		opacity: 0.8;
	}
`;

export default function PrivateView() {
	const { messages, isLoading, sendMessage } = useMessages();
	const { activeGroup, groups, joinGroup, hasKey, encryptMessage, decryptMessage } = useEncryption();
	const { profile } = usePermawebProvider();
	const { walletAddress } = useWalletProvider();
	const [text, setText] = React.useState('');
	const [sending, setSending] = React.useState(false);
	const [decryptedMessages, setDecryptedMessages] = React.useState<any[]>([]);
	const [secretInput, setSecretInput] = React.useState('');
	const [showSecretPrompt, setShowSecretPrompt] = React.useState(false);
	const [pendingGroupHash, setPendingGroupHash] = React.useState('');
	const listRef = React.useRef<HTMLDivElement>(null);
	const prevCountRef = React.useRef(0);

	const isLoggedIn = Boolean(walletAddress && profile?.id);

	// Decrypt messages when they change
	React.useEffect(() => {
		if (!hasKey || !messages.length) {
			setDecryptedMessages([]);
			return;
		}

		(async () => {
			const decrypted = await Promise.all(
				messages.map(async (msg: any) => {
					try {
						const content = await decryptMessage(msg.content);
						return { ...msg, content };
					} catch {
						return { ...msg, content: '[encrypted]' };
					}
				})
			);
			setDecryptedMessages(decrypted);
		})();
	}, [messages, hasKey, decryptMessage]);

	// Auto-scroll
	React.useEffect(() => {
		if (decryptedMessages.length > prevCountRef.current && listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
		prevCountRef.current = decryptedMessages.length;
	}, [decryptedMessages.length]);

	React.useEffect(() => {
		if (!isLoading && decryptedMessages.length > 0 && listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [isLoading]);

	const handleSend = async () => {
		const trimmed = text.trim();
		if (!trimmed || sending || !hasKey) return;

		setSending(true);
		try {
			const encrypted = await encryptMessage(trimmed);
			await sendMessage(encrypted);
			setText('');
		} catch (e) {
			console.error('Failed to send encrypted message:', e);
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

	const handleJoin = async (name: string, secret: string) => {
		await joinGroup(name, secret);
	};

	const handleSelectGroup = (groupHash: string) => {
		setPendingGroupHash(groupHash);
		setShowSecretPrompt(true);
	};

	const handleSecretSubmit = async () => {
		if (secretInput.trim() && pendingGroupHash) {
			const group = groups.find((g) => g.groupHash === pendingGroupHash);
			if (group) {
				await joinGroup(group.name, secretInput.trim());
			}
			setSecretInput('');
			setShowSecretPrompt(false);
			setPendingGroupHash('');
		}
	};

	if (showSecretPrompt) {
		const group = groups.find((g) => g.groupHash === pendingGroupHash);
		return (
			<Container style={{ alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px' }}>
				<div style={{ fontSize: '14px', fontWeight: 600 }}>Enter secret for "{group?.name}"</div>
				<Input
					as="input"
					type="password"
					placeholder="Secret code"
					value={secretInput}
					onChange={(e: any) => setSecretInput(e.target.value)}
					onKeyDown={(e: any) => e.key === 'Enter' && handleSecretSubmit()}
					style={{ maxWidth: '280px' }}
				/>
				<div style={{ display: 'flex', gap: '8px' }}>
					<SendButton
						$active={!!secretInput.trim()}
						onClick={handleSecretSubmit}
						style={{ borderRadius: '6px', width: 'auto', padding: '6px 16px', fontSize: '13px' }}
					>
						Join
					</SendButton>
					<LeaveButton
						onClick={() => {
							setShowSecretPrompt(false);
							setPendingGroupHash('');
						}}
					>
						Cancel
					</LeaveButton>
				</div>
			</Container>
		);
	}

	if (!activeGroup || !hasKey) {
		return <JoinGroup groups={groups} onJoin={handleJoin} onSelectGroup={handleSelectGroup} />;
	}

	const canSend = text.trim().length > 0 && !sending && hasKey;

	return (
		<Container>
			<GroupHeader>
				<span>🔒 {activeGroup.name}</span>
				<LeaveButton onClick={() => window.location.reload()}>Leave</LeaveButton>
			</GroupHeader>
			<MessageList ref={listRef}>
				{isLoading && decryptedMessages.length === 0 ? (
					<Empty>Loading...</Empty>
				) : decryptedMessages.length === 0 ? (
					<Empty>No messages yet</Empty>
				) : (
					decryptedMessages.map((msg: any, i: number) => <MessageBubble key={`${msg.id}-${i}`} data={msg} />)
				)}
			</MessageList>
			{isLoggedIn ? (
				<InputBar>
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type an encrypted message..."
						rows={1}
						disabled={sending}
					/>
					<SendButton $active={canSend} onClick={handleSend} disabled={!canSend}>
						↑
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
