import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Post = styled.div<{ $layout: any }>`
	position: relative;
	display: flex;
	flex-direction: ${(props: any) => (props.$layout?.flow === 'column' ? `column` : `row`)};
	width: 100%;
	background: var(--color-post-background);
	padding: 20px;
	margin-bottom: 20px;
	box-sizing: border-box;
	border-radius: var(--border-radius);
	border: 1px solid var(--color-post-border);
	box-shadow: var(--preference-post-shadow);
	gap: 20px;
`;

export const Categories = styled.div`
	display: none;
	align-items: center;
	order: 999;
	margin: auto -20px -20px -20px;
	padding: 6px 20px;
	font-size: var(--font-size-small);
	font-weight: 600;
	user-select: none;
	background-image: linear-gradient(to right, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
`;

export const Category = styled.div``;

export const TitleWrapper = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
`;

export const DraftDot = styled.div`
	width: 8px;
	height: 8px;
	background: #eeca00;
	border-radius: 50%;
`;

export const DraftIndicator = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: rgba(238, 202, 0, 0.2);
	color: #eeca00;
	padding: 4px 10px;
	border-radius: var(--border-radius);
	font-size: 11px;
	font-weight: 600;
	margin-left: 12px;
`;

export const Content = styled.div`
	position: relative;
	flex: 2;

	img {
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: var(--border-radius);
		background: rgba(100, 100, 100, 0.2);
		box-shadow: none;

		&:hover {
			cursor: pointer;
		}
	}

	h2 {
		margin-top: var(--spacing-xs);
		margin-bottom: 6px;
		line-height: 28px;

		&:hover {
			cursor: pointer;
			color: rgba(var(--color-primary), 1);
		}
	}

	p {
		opacity: 0.8;
	}
`;

export const Meta = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: var(--font-size-default);
	font-weight: 800;
	margin-top: 10px;

	img {
		background: white;
		border-radius: 50%;
	}
`;

export const SourceIcon = styled.img`
	width: 20px;
	height: 20px;
	border-radius: 50%;
`;

export const Source = styled.div`
	margin-left: 4px;

	&:hover {
		cursor: pointer;
		color: rgba(var(--color-primary), 1);
	}
`;

export const Author = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;

	&:hover {
		cursor: pointer;
		color: rgba(var(--color-primary), 1);

		> div {
			--avatar-opacity: 0.8;
		}
	}
`;

export const Comments = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	flex: 1;
	max-width: 950px;
	margin: 0 auto;

	h3 {
		margin: 0;
		user-select: none;
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		border-top: 1px solid rgba(var(--color-text), 0.4);
		padding-top: var(--spacing-s);
	}
`;

export const Comment = styled.div``;

export const CommentHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 2px;
`;

export const CommentText = styled.div`
	font-size: 12px;
	opacity: 0.8;
`;

export const Username = styled.div`
	font-size: var(--font-size-default);
	font-weight: 800;
`;

export const Date = styled.div`
	font-size: 12px;
	opacity: 0.6;
	margin-top: 2px;
`;
