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
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		width: fit-content;
		height: 100%;
		z-index: 1;

		@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
			left: 0;
			right: var(--spacing-xxs);
		}
	`}
`;

export const LinksList = styled.div<{ $isFooter?: boolean }>`
	display: flex;
	margin-left: ${(props) => (props.$isFooter ? '0' : 'auto')};
	align-items: ${(props) => (props.$isFooter ? 'center' : 'flex-end')};
	gap: 10px;
	margin-bottom: ${(props) => (props.$isFooter ? '0' : '12px')};
	svg {
		height: 20px;
		fill: rgba(var(--color-text), 1);
		width: unset;
		&:hover {
			fill: revert-layer;
			transform: scale(1.2);
			transition: transform 0.2s;
			color: rgba(var(--color-text), 1);

			path {
				fill: revert-layer;
			}
		}
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		margin-bottom: ${(props) => (props.$isFooter ? '0' : '6px')};
		svg {
			height: 16px;
		}
	}
`;
