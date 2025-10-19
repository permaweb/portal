import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Header = styled.div<{ $layout: any; theme: any }>`
	position: relative;
	display: flex;
	flex-shrink: 0;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: ${(props) => props.$layout.height};
	background: rgba(var(--color-header-background), var(--color-header-opacity));
	width: 100%;
	margin-left: auto;
	margin-right: auto;
	box-sizing: border-box;
	border-bottom: ${(props) => (props.$layout.border.bottom ? `1px solid rgba(var(--color-header-border),1)` : `unset`)};
	border-top: ${(props) => (props.$layout.border.top ? `1px solid rgba(var(--color-header-border),1)` : `unset`)};
	border-left: ${(props) => (props.$layout.border.sides ? `1px solid rgba(var(--color-header-border),1)` : `unset`)};
	border-right: ${(props) => (props.$layout.border.sides ? `1px solid rgba(var(--color-header-border),1)` : `unset`)};
	box-shadow: ${(props) => (props.$layout.shadow ? props.$layout.shadow : `unset`)};
	z-index: 3;
	user-select: none;
	box-sizing: border-box;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: 0 var(--spacing-xxs);
	}
`;

export const HeaderContentWrapper = styled.div<{ $layout: any; maxWidth: number }>`
	position: relative;
	width: 100%;
	max-width: ${(props) => (props.$layout.width === 'page' ? `${props.maxWidth}px` : `100%`)};
	margin-left: auto;
	margin-right: auto;
	min-height: 100%;
	max-height: 100%;
	padding: ${(props) => (props.$layout.padding ? props.$layout.padding : `0`)};
	box-sizing: border-box;
`;

export const HeaderContent = styled.div<{ $layout: any; maxWidth: number }>`
	position: relative;
	width: 100%;
	height: 100%;
`;

export const Logo = styled.div<{ $layout: any }>`
	position: absolute;
	top: 20px;
	left: 0;
	bottom: 20px;
	display: flex;
	width: 100%;
	justify-content: ${(props) =>
		props.$layout.positionX === 'center' ? 'center' : props.$layout.positionX === 'left' ? 'flex-start' : 'center'};
	align-items: ${(props) =>
		props.$layout.positionY === 'center' ? 'center' : props.$layout.positionY === 'top' ? 'flex-start' : 'center'};
	z-index: 1;

	a {
		height: ${(props) => props.$layout.size};
		width: auto;
		flex-shrink: 0;

		div {
			height: 100%;
			width: auto;
		}
	}
	svg,
	img {
		display: ${(props) => (props.$layout?.display ? 'inline-block' : 'none')};
		height: 100%;
		width: auto;
		color: rgba(var(--color-text), 1);

		&:hover {
			cursor: pointer;
		}
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		top: var(--spacing-m);
		bottom: 0;

		a {
			height: 46%;
			margin-bottom: auto;
		}
	}
`;

export const Actions = styled.div`
	position: absolute;
	display: flex;
	top: 10px;
	right: 0;
	z-index: 2;
`;

export const ThemeToggle = styled.div``;

export const Links = styled.div`
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
`;

export const LinksList = styled.div`
	display: flex;
	margin-left: auto;
	align-items: flex-end;
	gap: 10px;
	margin-bottom: 12px;
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
		margin-bottom: 6px;
		svg {
			height: 16px;
		}
	}
`;
