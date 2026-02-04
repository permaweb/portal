import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
	from {
		transform: translateY(20px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
`;

export const Wrapper = styled.div<{ $warning?: boolean }>`
	min-width: 300px;
	max-width: 90vw;
	position: relative;
	animation: ${slideIn} 0.2s ease-out;
	display: flex;
	align-items: center;
	padding: 12px 16px;
	gap: 12px;
	border: 1px solid var(--color-card-border);
	border-radius: var(--border-radius);
	background: var(--color-card-background);
	box-shadow: var(--preference-card-shadow);
`;

export const Icon = styled.div<{ $warning?: boolean }>`
	min-height: 18px;
	height: 18px;
	min-width: 18px;
	width: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => (props.$warning ? 'rgba(231, 76, 60, 0.8)' : 'rgba(var(--color-primary), 1)')};
	border-radius: 50%;

	svg {
		height: 12px;
		width: 12px;
		color: white;
		fill: white;
	}
`;

export const Message = styled.span`
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: rgba(var(--color-text), 1);
	font-weight: 600;
	font-size: 13px;
`;

export const Close = styled.button`
	background: transparent;
	border: none;
	padding: 4px;
	cursor: pointer;
	color: rgba(var(--color-text), 0.6);
	font-size: 14px;
	line-height: 1;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		color: rgba(var(--color-text), 1);
	}
`;
