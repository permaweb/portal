import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Navigation = styled.div<{ $layout: any; maxWidth: number; $editHeight?: number; $editSticky?: boolean }>`
	position: ${(props) => {
		const isSticky = props.$editSticky !== undefined ? props.$editSticky : true;
		return isSticky ? 'sticky' : 'relative';
	}};
	display: flex;
	align-items: center;
	top: 0px;
	height: ${(props) =>
		props.$editHeight !== undefined
			? `${props.$editHeight}px`
			: props.$layout.height
			? `${props.$layout.height}px`
			: `40px`};
	min-height: ${(props) =>
		props.$editHeight !== undefined
			? `${props.$editHeight}px`
			: props.$layout.height
			? `${props.$layout.height}px`
			: `40px`};
	width: 100%;
	max-width: ${(props) => (props.$layout.width === 'content' ? `${props.maxWidth}px` : `100%`)};
	background: var(--color-navigation-background);
	margin-left: auto;
	margin-right: auto;
	padding: ${(props) => (props.$layout.width === `content` ? `0 10px` : 0)};
	z-index: 2;
	border-bottom: ${(props) =>
		props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	border-top: ${(props) => (props.$layout.border.top ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`)};
	border-left: ${(props) =>
		props.$layout.border.sides ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	border-right: ${(props) =>
		props.$layout.border.sides ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	box-shadow: var(--preference-navigation-shadow);
	clip-path: inset(0 -100% -100% -100%);
	user-select: none;
	box-sizing: border-box;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: 0 var(--spacing-xxs);
	}

	${(props) =>
		props.$layout.width === `content` &&
		`
    &::before,
    &::after {
      content: '';
      position: absolute;
      border-style: solid;
      border-width: 10px;
      border-color: transparent;
      filter: brightness(0.6);
    }

    &::before {
      top: 100%;
      left: 0;
      border-top-color: var(--color-navigation-background);
      border-left-color: transparent; 
      border-width: 10px 0 0 10px; 
    }

    &::after {
      top: 100%;
      right: 0;
      border-top-color: var(--color-navigation-background);
      border-right-color: transparent; 
      border-width: 10px 10px 0 0; 
    }
  `};
`;

export const NavigationEntries = styled.div<{ $layout: any; maxWidth: number }>`
	display: flex;
	align-items: center;
	height: 100%;
	width: 100%;
	padding: ${(props) => (props.$layout.padding ? props.$layout.padding : 0)};
	max-width: ${(props) => (props?.maxWidth ? `${props.maxWidth}px` : '1200px')};
	margin-left: ${(props) => (props.$layout.width === 'page' ? `auto` : `10px`)};
	margin-right: auto;
	gap: 20px;
	box-sizing: border-box;

	> div > a {
		height: ${(props) => props.$layout.height};
	}

	button {
		margin-left: auto;
	}

	a.active {
		pointer-events: none;
		color: rgba(var(--color-secondary), 1);

		div {
			color: rgba(var(--color-secondary), 1);
		}
		svg {
			color: rgba(var(--color-secondary), 1) !important;
		}
	}
`;

export const NavigationEntry = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	height: fit-content;
	min-height: 100%;
	border-radius: 8px;
	white-space: nowrap;

	a {
		color: rgba(var(--color-navigation-text), 1);
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;

		font-size: var(--font-size-default);
		font-weight: 600;

		svg {
			width: 20px;
			height: 20px;
			color: white;
		}
	}

	&:hover {
		cursor: pointer;
		a {
			color: rgba(var(--color-navigation-text-hover), 1);

			svg {
				fill: rgba(var(--color-navigation-text-hover), 1);
			}
		}
	}
`;

export const Icon = styled.div`
	display: flex;
	align-items: center;
	margin-right: 6px;

	div {
		display: flex;
		align-items: center;
	}

	svg {
		height: 12px;
	}
`;

export const Arrow = styled.div`
	div {
		display: flex;
		align-items: center;
	}

	svg {
		transform: rotate(180deg);
	}
`;

export const LayoutButtons = styled.div`
	position: absolute;
	right: 0;
`;

export const Edit = styled.div`
	position: absolute;
	bottom: -520px;
	width: 100%;
	height: 500px;
`;

export const NavigationEntryMenu = styled.div<{ $layout: any }>`
	position: absolute;
	top: 40px;
	left: 0;
	width: fit-content;
	min-width: 150px;
	background: var(--color-navigation-background);
	// box-shadow: var(--shadow-navigation-entry);
	transform: scaleY(0);
	transform-origin: top;
	transition: transform 0.5s ease;
	animation: 0.1s ease forwards expandOnLoad;
	border-top: ${(props) =>
		props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-background),1)` : `unset`};
	border-bottom: ${(props) =>
		props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	border-left: ${(props) =>
		props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	border-right: ${(props) =>
		props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	box-sizing: border-box;

	@keyframes expandOnLoad {
		to {
			transform: scaleY(1);
		}
	}
`;

export const NavigationSubEntry = styled.div`
	color: white;
	padding: 5px 0;
	white-space: nowrap;
	padding: 10px 20px;
	font-size: 12px;
	font-weight: 600;
	font-family: Franklin, arial, sans-serif;
	width: 100%;

	&:hover {
		cursor: pointer;
		color: rgba(var(--color-navigation-text-hover), 1);
		background: rgba(var(--color-navigation-text), 0.1);
	}
`;

export const NavItem = styled.div`
	position: relative;
	display: inline-flex;
	align-items: center;
`;

export const Tooltip = styled.div`
	position: absolute;
	bottom: -180%;
	left: -40%;
	color: rgba(var(--color-text), 1);
	background: rgba(var(--color-footer-background), 1);
	font-size: 12px;
	padding: 6px 8px;
	border-radius: 6px;
	white-space: nowrap;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.2s ease;

	${NavItem}:hover & {
		opacity: 1;
	}
`;

export const ResizeHandle = styled.div<{ $isDragging?: boolean }>`
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: ns-resize;
	z-index: 10;
	transform: translateY(50%);

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
