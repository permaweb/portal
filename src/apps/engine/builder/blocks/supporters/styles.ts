import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const ModuleWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const ModuleTitle = styled.h3`
	margin: 0;
	font-size: 22px;
	font-weight: 700;
	color: rgba(var(--color-text), 1);
`;

export const SupportersList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const SupporterItem = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	border-radius: var(--border-radius);
	background: var(--color-card-background);
	transition: all 0.2s ease;

	&:hover {
		opacity: 0.9;
	}
`;

export const AvatarWrapper = styled.div`
	width: 40px;
	height: 40px;
	min-width: 40px;
	border-radius: 50%;
	background: rgba(var(--color-text), 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
`;

export const Avatar = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

export const AvatarPlaceholder = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: var(--font-size-default);
	font-weight: 700;
	color: rgba(var(--color-text), 0.6);
`;

export const SupporterInfo = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
`;

export const SupporterName = styled.div`
	font-size: var(--font-size-default);
	font-weight: 600;
	color: rgba(var(--color-text), 1);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const SupporterAddress = styled.div`
	font-size: var(--font-size-small);
	color: rgba(var(--color-text), 0.6);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const SupporterAmount = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;
`;

export const AmountPrimary = styled.div`
	font-size: var(--font-size-default);
	font-weight: 700;
	color: rgba(var(--color-text), 1);
`;

export const AmountSecondary = styled.div`
	font-size: var(--font-size-small);
	color: rgba(var(--color-text), 0.6);
`;

export const SupporterTime = styled.div`
	font-size: var(--font-size-small);
	color: rgba(var(--color-text), 0.6);
	white-space: nowrap;
`;

export const LoadingMessage = styled.div`
	padding: 20px;
	text-align: center;
	font-size: var(--font-size-default);
	color: rgba(var(--color-text), 0.6);
`;

export const ErrorMessage = styled.div`
	padding: 16px;
	border-radius: var(--border-radius);
	background: rgba(231, 76, 60, 0.1);
	border: 1px solid rgba(231, 76, 60, 0.3);
	font-size: var(--font-size-default);
	color: rgba(var(--color-text), 1);
`;

export const EmptyMessage = styled.div`
	padding: 20px;
	text-align: center;
	font-size: var(--font-size-default);
	color: rgba(var(--color-text), 0.6);
`;

export const PaginationWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 10px;
	margin-top: 10px;
`;

export const PaginationButton = styled.button`
	padding: 8px 16px;
	background: var(--color-card-background);
	border: none;
	border-radius: var(--border-radius);
	font-size: var(--font-size-default);
	color: rgba(var(--color-text), 1);
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover:not(:disabled) {
		opacity: 0.8;
	}

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

export const PaginationInfo = styled.span`
	font-size: var(--font-size-default);
	color: rgba(var(--color-text), 0.8);
`;
