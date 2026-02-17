import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled, { css } from 'styled-components';

type ContainerLayout = {
	direction?: string;
	gap?: string;
	paddingTop?: string;
	topLine?: boolean;
};

type ElementLayout = {
	flex?: number;
	aspectRatio?: string;
	objectFit?: string;
	display?: string;
	position?: string;
	filter?: string;
	direction?: string;
	gap?: string;
	showBackground?: string;
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
	padding: var(--preference-post-padding, 20px);
	${(props) => props.$layout?.paddingTop && `padding-top: ${props.$layout.paddingTop};`}
	background: var(--color-post-background);
	border: var(--preference-post-border-width, 1px) solid var(--color-post-border);
	border-radius: var(--border-radius);
	box-shadow: var(--preference-post-shadow);

	${(props) =>
		props.$layout?.topLine &&
		css`
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 1px;
				background-color: rgba(var(--color-background), 1);
				filter: invert(1);
			}
		`}
`;

export const Row = styled.div<{ $layout?: ContainerLayout }>`
	display: flex;
	gap: ${(props) => props.$layout?.gap || '20px'};
	width: 100%;
	align-items: stretch;

	@media (max-width: ${BREAKPOINTS.desktop}) {
		flex-direction: column;
	}
`;

export const Column = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const Categories = styled.div<{ $layout?: ElementLayout; $isFirst?: boolean }>`
	display: ${(props) => props.$layout?.display || 'flex'};
	align-items: center;
	font-size: 12px;
	font-weight: 600;
	user-select: none;
	color: var(--color-post-border-contrast);

	a {
		color: inherit !important;
	}

	${(props) =>
		(props.$layout?.showBackground !== 'false' || props.$layout?.position === 'absolute') &&
		css`
			background-color: rgba(var(--color-text), 1);
			padding: 5px 15px 4px;
			border-radius: var(--border-radius);
		`}

	${(props) =>
		props.$layout?.filter === 'invert' &&
		css`
			color: var(--color-post-border-contrast);
		`}

	${(props) =>
		(props.$layout?.showBackground !== 'false' || props.$layout?.position === 'absolute') &&
		props.$isFirst &&
		css`
			position: absolute;
			top: 0px;
			left: 0px;
			border-radius: 0 0 0 var(--border-radius);
		`}
`;

export const Category = styled.div<{ $layout?: ElementLayout }>`
	color: rgba(var(--color-text-contrast), 1);
	${(props) =>
		props.$layout?.filter === 'invert' &&
		css`
			color: rgba(var(--color-text-contrast), 1) !important;
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
	display: flex;
	flex-direction: ${(props) => props.$layout?.direction || 'column'};
	flex: ${(props) => props.$layout?.flex || 2};
	gap: ${(props) => props.$layout?.gap || '20px'};
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
