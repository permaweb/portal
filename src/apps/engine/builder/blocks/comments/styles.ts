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
`;

export const CommentList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;
