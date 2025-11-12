import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Links = styled.div<{ $isFooter?: boolean }>`
	${(props) =>
		props.$isFooter
			? `
		display: flex;
		justify-content: center;
		width: 100%;
		margin: 10px 0;
	`
			: `
		display: flex;
    align-items: center;
		width: fit-content;
		height: 100%;
		z-index: 1;
    gap: var(--spacing-s);

		@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
			left: 0;
			right: var(--spacing-xxs);
		}
	`}
`;

export const LinksList = styled.div<{ $isFooter?: boolean }>`
	display: flex;
	margin-left: ${(props) => (props.$isFooter ? '0' : '10px')};
	margin-top: ${(props) => (props.$isFooter ? '0' : '5px')};
	align-items: center;
	gap: 15px;
	svg {
		height: 20px;
		fill: rgba(var(--color-text), 1);
		width: unset;

		&:hover {
			transform: scale(1.2);
			transition: transform 0.2s;
		}
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		svg {
			height: 16px;
		}
	}
`;
