import React from 'react';
import styled from 'styled-components';

import { useProfile } from '../../hooks/useProfile';
import Avatar from '../shared/Avatar';

interface MessageBubbleProps {
	data: {
		id: string;
		creator?: string;
		owner?: string;
		content: string;
		dateCreated: number;
	};
	showTimestamp?: boolean;
	showAvatar?: boolean;
}

const Wrapper = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 4px 0;
`;

const Body = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
`;

const Meta = styled.div`
	display: flex;
	align-items: baseline;
	gap: 6px;
`;

const Name = styled.span`
	font-size: 12px;
	font-weight: 600;
	color: var(--widget-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 160px;
`;

const Timestamp = styled.span`
	font-size: 11px;
	color: var(--widget-text);
	opacity: 0.45;
	white-space: nowrap;
	flex-shrink: 0;
`;

const Text = styled.p`
	margin: 0;
	font-size: 13px;
	line-height: 1.45;
	color: var(--widget-text);
	word-break: break-word;
	overflow-wrap: anywhere;
	white-space: pre-wrap;
`;

function formatTimestamp(epoch: number): string {
	if (!epoch) return '';

	const date = new Date(epoch);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) return 'just now';
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function MessageBubble({ data, showTimestamp = true, showAvatar = true }: MessageBubbleProps) {
	const profileId = data.creator || data.owner || '';
	const { profile, isLoading } = useProfile(profileId);

	const displayName = profile?.displayName || profile?.username || profileId?.slice(0, 8) || 'Unknown';
	const timestamp = formatTimestamp(data.dateCreated);

	return (
		<Wrapper>
			{showAvatar && <Avatar profile={profile} isLoading={isLoading} size={28} />}
			<Body>
				<Meta>
					<Name title={displayName}>{displayName}</Name>
					{showTimestamp && timestamp && <Timestamp>{timestamp}</Timestamp>}
				</Meta>
				<Text>{data.content}</Text>
			</Body>
		</Wrapper>
	);
}
