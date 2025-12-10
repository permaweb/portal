import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Header = styled.div<{
	$layout: any;
	theme: any;
	$editHeight?: number;
	$sticky?: boolean;
	$isSideNav?: boolean;
}>`
	position: ${(props) => (props.$sticky ? 'sticky' : 'relative')};
	top: ${(props) => (props.$sticky ? '0' : 'auto')};
	display: flex;
	flex-shrink: 0;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: ${(props) => (props.$editHeight !== undefined ? `${props.$editHeight}px` : props.$layout.height)};
	background: rgba(var(--color-header-background), var(--color-header-opacity));
	width: 100%;
	margin-left: auto;
	margin-right: auto;
	box-sizing: border-box;
	border-bottom: ${(props) =>
		props.$layout.border.bottom === true ? `1px solid rgba(var(--color-header-border),1)` : `unset`};
	border-top: ${(props) =>
		props.$isSideNav
			? 'none'
			: props.$layout.border.top === true
			? `1px solid rgba(var(--color-header-border),1)`
			: `unset`};
	border-left: ${(props) =>
		props.$isSideNav
			? 'none'
			: props.$layout.border.sides === true
			? `1px solid rgba(var(--color-header-border),1)`
			: `unset`};
	border-right: ${(props) =>
		props.$isSideNav
			? 'none'
			: props.$layout.border.sides === true
			? `1px solid rgba(var(--color-header-border),1)`
			: `unset`};
	box-shadow: var(--preference-header-shadow);
	z-index: ${(props) => (props.$isSideNav ? 1 : 3)};
	user-select: none;
	box-sizing: border-box;

	h1 {
		margin: 0;
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		// padding: 0 var(--spacing-xxs);
	}
`;

export const HeaderContentWrapper = styled.div<{
	$layout: any;
	maxWidth: number;
	$isSideNav?: boolean;
	$navWidth?: number;
}>`
	position: relative;
	width: 100%;
	max-width: ${(props) => {
		if (props.$layout.width === 'page') {
			if (props.$isSideNav) {
				const navWidth = props.$navWidth || 300;
				return `${props.maxWidth - navWidth}px`;
			}
			return `${props.maxWidth}px`;
		}
		return '100%';
	}};
	margin-left: ${(props) => (props.$isSideNav ? '0' : 'auto')};
	margin-right: auto;
	min-height: 100%;
	max-height: 100%;
	padding: ${(props) => (props.$layout.padding ? props.$layout.padding : `0`)};
	box-sizing: border-box;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding-left: var(--spacing-xxs);
		padding-right: var(--spacing-xxs);
	}
`;

export const HeaderContent = styled.div<{ $layout: any; maxWidth: number }>`
	position: relative;
	width: 100%;
	height: 100%;
`;

export const Logo = styled.div<{ $layout: any; $editLogo?: { positionX: string; positionY: string; size: number } }>`
	position: absolute;
	top: 20px;
	left: 0;
	bottom: 20px;
	display: flex;
	width: fit-content;
	justify-content: ${(props) => {
		const posX = props.$editLogo?.positionX || props.$layout.positionX;
		return posX === 'center' ? 'center' : posX === 'left' ? 'flex-start' : posX === 'right' ? 'flex-end' : 'center';
	}};
	align-items: ${(props) => {
		const posY = props.$editLogo?.positionY || props.$layout.positionY;
		return posY === 'center' ? 'center' : posY === 'top' ? 'flex-start' : posY === 'bottom' ? 'flex-end' : 'center';
	}};
	z-index: 1;
	a {
		height: ${(props) => (props.$editLogo?.size ? `${props.$editLogo.size}%` : props.$layout?.size)};
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
		color: rgba(var(--color-text), 1) !important;

		&:hover {
			cursor: pointer;
		}
	}

	div {
		color: rgba(var(--color-text), 1);
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

export const Actions = styled.div<{ $isLogo: boolean }>`
	position: absolute;
	display: flex;
	align-items: center;
	top: 10px;
	right: 0;
	z-index: 2;
`;

export const HeaderSearch = styled.div`
	position: absolute;
	left: 20px;
	top: 50%;
	transform: translateY(-50%);
	z-index: 2;

	> div {
		width: 26px;

		&:has(input:focus) {
			width: 200px;
		}
	}

	input {
		height: 26px;
		border-radius: 13px;

		&:focus {
			border-radius: 0;
		}
	}

	svg {
		margin-top: 2.5px;
		margin-left: 2.5px;
	}
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

export const ResizeHandle = styled.div<{ $isDragging?: boolean }>`
	position: fixed;
	left: 0;
	right: 0;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: ns-resize;
	z-index: 50;
	transform: translateY(-50%);

	&:hover > div {
		background: rgba(var(--color-primary), 1);
		opacity: 1;
	}

	${(props) =>
		props.$isDragging &&
		`
		> div {
			background: rgba(var(--color-primary), 1);
			opacity: 1;
			height: 6px;
		}
	`}
`;

export const HandleBar = styled.div`
	width: 100%;
	height: 4px;
	background: rgba(var(--color-primary), 0.6);
	opacity: 0.8;
	transition: all 0.15s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
`;

export const HandleLabel = styled.span`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: rgba(var(--color-primary), 1);
	color: white;
	padding: 4px 12px;
	border-radius: 4px;
	font-size: 11px;
	font-weight: 600;
	white-space: nowrap;
	pointer-events: none;
`;
