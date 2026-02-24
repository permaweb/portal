import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	padding: 24px;
	gap: 16px;
`;

const Title = styled.h3`
	margin: 0;
	font-size: 16px;
	color: var(--widget-text);
`;

const Description = styled.p`
	margin: 0;
	font-size: 13px;
	opacity: 0.6;
	text-align: center;
	max-width: 280px;
`;

const Form = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
	max-width: 280px;
`;

const Input = styled.input`
	padding: 8px 12px;
	border: 1px solid var(--widget-border);
	border-radius: 6px;
	background: var(--widget-input-bg);
	color: var(--widget-text);
	font-size: 13px;
	outline: none;

	&::placeholder {
		color: var(--widget-text);
		opacity: 0.5;
	}

	&:focus {
		border-color: var(--widget-primary);
	}
`;

const Button = styled.button`
	padding: 10px 16px;
	border: none;
	border-radius: 6px;
	background: var(--widget-primary);
	color: white;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}

	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;

const GroupList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
	width: 100%;
	max-width: 280px;
`;

const GroupItem = styled.button<{ $active: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	border: 1px solid ${(props) => (props.$active ? 'var(--widget-primary)' : 'var(--widget-border)')};
	border-radius: 6px;
	background: ${(props) => (props.$active ? 'var(--widget-hover)' : 'transparent')};
	color: var(--widget-text);
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: var(--widget-primary);
	}
`;

const Divider = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	max-width: 280px;
	opacity: 0.4;
	font-size: 12px;

	&::before,
	&::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--widget-border);
	}
`;

interface JoinGroupProps {
	groups: Array<{ name: string; groupHash: string }>;
	onJoin: (name: string, secret: string) => void;
	onSelectGroup: (groupHash: string) => void;
}

export default function JoinGroup(props: JoinGroupProps) {
	const { groups, onJoin, onSelectGroup } = props;
	const [name, setName] = React.useState('');
	const [secret, setSecret] = React.useState('');

	const handleJoin = () => {
		if (name.trim() && secret.trim()) {
			onJoin(name.trim(), secret.trim());
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleJoin();
		}
	};

	return (
		<Container>
			<Title>Join Private Group</Title>
			<Description>
				Enter a group name and secret code. Anyone with the same name and code can read messages.
			</Description>
			<Form>
				<Input
					placeholder="Group name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<Input
					placeholder="Secret code"
					type="password"
					value={secret}
					onChange={(e) => setSecret(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<Button onClick={handleJoin} disabled={!name.trim() || !secret.trim()}>
					Join Group
				</Button>
			</Form>
			{groups.length > 0 && (
				<>
					<Divider>or select a group</Divider>
					<GroupList>
						{groups.map((group) => (
							<GroupItem key={group.groupHash} $active={false} onClick={() => onSelectGroup(group.groupHash)}>
								{group.name}
							</GroupItem>
						))}
					</GroupList>
				</>
			)}
		</Container>
	);
}
