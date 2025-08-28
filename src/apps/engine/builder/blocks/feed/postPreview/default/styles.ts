import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Post = styled.div<{ $layout: any }>`
	position: relative;
	display: flex;
	flex-direction: ${(props: any) => (props.$layout?.flow === 'column' ? `column` : `row`)};
	width: 100%;
	background: var(--color-card-background);
	padding: 20px;
	box-sizing: border-box;
	border-radius: var(--border-radius);
	gap: 20px;
	box-shadow: ${(props: any) => (props.$layout?.shadow ? `0 4px 10px rgba(0, 0, 0, 0.4)` : `unset`)};
	margin-top: 21px;
`;

export const Categories = styled.div`
	position: absolute;
	display: flex;
	top: -21px;
	right: 0px;
	background-color: var(--color-card-background);
	padding: 1px 8px 1px 4px;
	border-radius: 0 0 0 var(--border-radius);
	font-size: 12px;
	font-weight: 600;
	user-select: none;
	border-bottom: 1px solid rgba(var(--color-background), 1);

	&::before {
		content: '';
		position: absolute;
		left: -20px;
		bottom: 0px;
		border-left: 10px solid transparent;
		border-top: 10px solid transparent;
		border-right: 10px solid var(--color-card-background);
		border-bottom: 10px solid var(--color-card-background);
		box-shadow: inset 0 -10px 10px rgba(0, 0, 0, 0.3);
	}
`;

export const Category = styled.div``;

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
		width: 18px;
		height: 18px;
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
	&:hover {
		cursor: pointer;
		color: rgba(var(--color-primary), 1);
	}
`;

export const Comments = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	flex: 1;

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

export const Avatar = styled.div`
	width: 18px;
	height: 18px;
	background: rgba(var(--color-text), 0.5);
	border-radius: 50%;

	img {
		width: 18px;
		height: 18px;
		border-radius: 50%;
	}
`;

export const Username = styled.div`
	font-size: var(--font-size-default);
	font-weight: 800;
`;

export const Date = styled.div`
	font-size: 12px;
	opacity: 0.6;
`;
