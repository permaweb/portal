import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Comments = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	border-radius: var(--border-radius);
	gap: 20px;
	max-width: 950px;
	margin: 20px auto 0 auto;

	h2 {
		margin: 0;
		font-size: 22px;
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding-left: var(--spacing-xxs);
		padding-right: var(--spacing-xxs);
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-large']}) {
		padding-left: var(--spacing-xs);
		padding-right: var(--spacing-xs);
	}
`;

export const CommentList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const TabBar = styled.div`
	display: flex;
	gap: 0;
	border-bottom: 1px solid rgba(var(--color-text), 0.1);
`;

export const Tab = styled.button<{ $active: boolean }>`
	background: ${(props) => (props.$active ? 'rgba(var(--color-text), 0.08)' : 'transparent')};
	border: none;
	border-bottom: 2px solid ${(props) => (props.$active ? 'rgba(var(--color-primary), 1)' : 'transparent')};
	color: rgba(var(--color-text), ${(props) => (props.$active ? '1' : '0.6')});
	font-size: var(--font-size-normal);
	font-weight: 600;
	padding: 8px 16px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		color: rgba(var(--color-text), 1);
		background: rgba(var(--color-text), 0.05);
	}
`;

export const HighlightStrip = styled.div`
	display: flex;
	gap: 12px;
	overflow-x: auto;
	padding: 4px 0;
	scrollbar-width: thin;
	scrollbar-color: rgba(var(--color-text), 0.2) transparent;

	&::-webkit-scrollbar {
		height: 4px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(var(--color-text), 0.2);
		border-radius: 2px;
	}
`;

export const HighlightCard = styled.div`
	flex-shrink: 0;
	background: var(--color-card-background);
	border: 1px solid rgba(243, 156, 18, 0.3);
	border-left: 3px solid #f39c12;
	border-radius: var(--border-radius);
	padding: 8px 12px;
	min-width: 180px;
	max-width: 260px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

export const HighlightAmount = styled.div`
	color: #f39c12;
	font-size: 11px;
	font-weight: 700;
	margin-bottom: 4px;
`;

export const HighlightContent = styled.div`
	color: rgba(var(--color-text), 0.8);
	font-size: var(--font-size-small);
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;
