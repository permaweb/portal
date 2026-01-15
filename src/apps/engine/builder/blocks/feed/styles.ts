import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Feed = styled.div<{ width: number }>`
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 20px;
	flex: ${(props) => (props.width ? props.width : undefined)};

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: var(--spacing-xxs);
		box-sizing: border-box;
	}
`;

export const FeedHeader = styled.div`
	span {
		font-size: var(--font-size-default);
		font-weight: 700;
	}
	h1 {
		margin-top: 8px;
		margin-bottom: 0;
	}
	p {
		margin-top: 10px;
		opacity: 0.6;
	}
`;

export const Authors = styled.div`
	display: flex;
	flex-direction: column;
	gap: 40px;
`;

export const AuthorPreview = styled.div`
	display: flex;
	flex-direction: column;
`;

export const Meta = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
	font-size: 20px;
	font-weight: 600;

	&:hover {
		cursor: pointer;
		color: rgba(var(--color-primary), 1);
	}
`;

export const Avatar = styled.div`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: rgba(var(--color-text), 1);
	flex-shrink: 0;
`;

export const Name = styled.div``;
