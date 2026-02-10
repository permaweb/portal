import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled, { css } from 'styled-components';

type ContainerLayout = {
	direction?: string;
	gap?: string;
};

type ElementLayout = {
	flex?: number;
	aspectRatio?: string;
	objectFit?: string;
	display?: string;
	position?: string;
	filter?: string;
};

export const Container = styled.div<{ $layout: ContainerLayout; $portalLayout?: any }>`
	position: relative;
	display: flex;
	flex-direction: ${(props) => {
		if (props.$layout?.direction) return props.$layout.direction;
		return props.$portalLayout?.card?.flow === 'column' ? 'column' : 'row';
	}};
	width: 100%;
	gap: ${(props) => props.$layout?.gap || '20px'};
	margin-bottom: 20px;
	box-sizing: border-box;
	padding: var(--spacing-post, 20px);
	background: var(--color-post-background);
	border: 1px solid var(--color-post-border);
	border-radius: var(--border-radius);
	box-shadow: var(--preference-post-shadow);
`;

export const Categories = styled.div<{ $layout?: ElementLayout }>`
	display: ${(props) => props.$layout?.display || 'flex'};
	align-items: center;
	font-size: 12px;
	font-weight: 600;
	user-select: none;

	${(props) =>
		props.$layout?.position === 'absolute' &&
		css`
			position: absolute;
			top: 0px;
			left: 0px;
			background-color: rgba(var(--color-background), 1);
			padding: 5px 15px 4px;
			border-radius: 0 0 0 var(--border-radius);
			filter: invert(1);
		`}

	${(props) =>
		!props.$layout?.position &&
		css`
			order: 999;
			margin: auto -20px -20px -20px;
			padding: 6px 20px;
			background-image: linear-gradient(to right, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
		`}
`;

export const Category = styled.div<{ $layout?: ElementLayout }>`
	${(props) =>
		props.$layout?.filter === 'invert' &&
		css`
			color: var(--color-post-border-contrast);
			filter: invert(1);
		`}
`;

export const ThumbnailWrapper = styled.div<{ $layout?: ElementLayout }>`
	flex: ${(props) => props.$layout?.flex || 1};

	img {
		width: 100%;
		aspect-ratio: ${(props) => props.$layout?.aspectRatio || '16/9'};
		border-radius: var(--border-radius);
		background: rgba(100, 100, 100, 0.2);
		box-shadow: none;
		object-fit: ${(props) => props.$layout?.objectFit || 'cover'};

		&:hover {
			cursor: pointer;
		}
	}
`;

export const Body = styled.div<{ $layout?: ElementLayout }>`
	flex: ${(props) => props.$layout?.flex || 2};
`;

export const TitleWrapper = styled.div`
	display: flex;
	align-items: center;
	width: 100%;

	h2 {
		margin-top: var(--spacing-xs);
		margin-bottom: 6px;
		line-height: 28px;
		color: var(--color-card-title);

		&:hover {
			cursor: pointer;
			color: rgba(var(--color-primary), 1);
		}
	}
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

export const Description = styled.p`
	opacity: 0.8;
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

export const Date = styled.div`
	display: flex;
	align-items: center;
	font-size: 12px;
	opacity: 0.6;
`;

export const Tags = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 6px;
	font-size: 12px;
	font-weight: 600;
`;

export const Tag = styled.span`
	color: rgba(var(--color-primary), 1);

	&:hover {
		opacity: 0.8;
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

export const CommentDate = styled.div`
	font-size: 12px;
	opacity: 0.6;
	margin-top: 2px;
`;
