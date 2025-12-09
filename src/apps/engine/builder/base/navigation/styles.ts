import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

const isSideNav = (layout: any) => layout?.position === 'left' || layout?.position === 'right';

export const Navigation = styled.div<{ $layout: any; maxWidth: number; $editHeight?: number; $editSticky?: boolean }>`
	position: ${(props) => (isSideNav(props.$layout) ? 'sticky' : props.$editSticky ? 'sticky' : 'relative')};
	top: 0;
	display: flex;
	flex-direction: ${(props) => (isSideNav(props.$layout) ? 'column' : 'row')};
	align-items: ${(props) => (isSideNav(props.$layout) ? 'stretch' : 'center')};
	width: ${(props) => {
		if (isSideNav(props.$layout)) {
			if (props.$editHeight) return `${props.$editHeight}px`;
			return typeof props.$layout.width === 'number' ? `${props.$layout.width}px` : '300px';
		}
		return '100%';
	}};
	min-width: ${(props) => {
		if (isSideNav(props.$layout)) {
			if (props.$editHeight) return `${props.$editHeight}px`;
			return typeof props.$layout.width === 'number' ? `${props.$layout.width}px` : '300px';
		}
		return 'auto';
	}};
	height: ${(props) => {
		if (isSideNav(props.$layout)) {
			return '100vh';
		}
		if (props.$editHeight) return `${props.$editHeight}px`;
		return props.$layout.height ? `${props.$layout.height}px` : '40px';
	}};
	min-height: ${(props) => {
		if (isSideNav(props.$layout)) return 'auto';
		if (props.$editHeight) return `${props.$editHeight}px`;
		return props.$layout.height ? `${props.$layout.height}px` : '40px';
	}};
	max-width: ${(props) => {
		if (isSideNav(props.$layout)) return 'none';
		return props.$layout.width === 'content' ? `${props.maxWidth}px` : '100%';
	}};
	background: var(--color-navigation-background);
	margin-left: ${(props) => (isSideNav(props.$layout) ? '0' : 'auto')};
	margin-right: ${(props) => (isSideNav(props.$layout) ? '0' : 'auto')};
	padding: ${(props) => {
		if (isSideNav(props.$layout)) return '0';
		return props.$layout.width === 'content' ? '0 10px' : '0';
	}};
	z-index: 2;
	overflow-y: ${(props) => (isSideNav(props.$layout) ? 'auto' : 'visible')};
	border-bottom: ${(props) => {
		if (isSideNav(props.$layout)) return 'none';
		return props.$layout.border?.bottom ? '1px solid rgba(var(--color-navigation-border),1)' : 'unset';
	}};
	border-top: ${(props) => (props.$layout.border?.top ? '1px solid rgba(var(--color-navigation-border),1)' : 'unset')};
	border-left: ${(props) => {
		if (isSideNav(props.$layout)) {
			return props.$layout?.position === 'right' ? '1px solid rgba(var(--color-navigation-border),1)' : 'none';
		}
		return props.$layout.border?.sides ? '1px solid rgba(var(--color-navigation-border),1)' : 'unset';
	}};
	border-right: ${(props) => {
		if (isSideNav(props.$layout)) {
			return 'none';
		}
		return props.$layout.border?.sides ? '1px solid rgba(var(--color-navigation-border),1)' : 'unset';
	}};
	box-shadow: ${(props) => (isSideNav(props.$layout) ? 'none' : 'var(--preference-navigation-shadow)')};
	clip-path: ${(props) => (isSideNav(props.$layout) ? 'none' : 'inset(0 -100% -100% -100%)')};
	user-select: none;
	box-sizing: border-box;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: ${(props) => (isSideNav(props.$layout) ? '0' : '0 var(--spacing-xxs)')};
	}

	${(props) =>
		!isSideNav(props.$layout) &&
		props.$layout.width === 'content' &&
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
	flex-direction: ${(props) => (isSideNav(props.$layout) ? 'column' : 'row')};
	align-items: ${(props) => (isSideNav(props.$layout) ? 'stretch' : 'center')};
	height: ${(props) => (isSideNav(props.$layout) ? 'auto' : '100%')};
	width: 100%;
	padding: ${(props) => (props.$layout.padding ? props.$layout.padding : 0)};
	max-width: ${(props) => (isSideNav(props.$layout) ? '100%' : props?.maxWidth ? `${props.maxWidth}px` : '1200px')};
	margin-left: ${(props) => (isSideNav(props.$layout) ? '0' : props.$layout.width === 'page' ? 'auto' : '10px')};
	margin-right: ${(props) => (isSideNav(props.$layout) ? '0' : 'auto')};
	gap: ${(props) => (isSideNav(props.$layout) ? '0' : '20px')};
	box-sizing: border-box;

	> div > a {
		height: ${(props) => props.$layout.height};
	}

	button {
		margin-left: ${(props) => (isSideNav(props.$layout) ? '0' : 'auto')};
		margin-top: ${(props) => (isSideNav(props.$layout) ? 'auto' : '0')};
	}

	a.active {
		color: rgba(var(--color-secondary), 1);

		div {
			color: rgba(var(--color-secondary), 1);
		}
		svg {
			color: rgba(var(--color-secondary), 1) !important;
		}
	}
`;

export const NavigationEntry = styled.div<{ $layout?: any }>`
	position: relative;
	display: flex;
	flex-direction: ${(props) => (isSideNav(props.$layout) ? 'column' : 'row')};
	justify-content: ${(props) => (isSideNav(props.$layout) ? 'flex-start' : 'center')};
	align-items: ${(props) => (isSideNav(props.$layout) ? 'stretch' : 'center')};
	height: fit-content;
	min-height: ${(props) => (isSideNav(props.$layout) ? 'auto' : '100%')};
	width: ${(props) => (isSideNav(props.$layout) ? '100%' : 'auto')};
	border-radius: ${(props) => (isSideNav(props.$layout) ? '0' : '8px')};
	white-space: nowrap;

	a {
		color: rgba(var(--color-navigation-text), 1);
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		padding: ${(props) => (isSideNav(props.$layout) ? '12px 20px' : '0')};
		box-sizing: border-box;

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
		background: ${(props) => (isSideNav(props.$layout) ? 'rgba(var(--color-navigation-text), 0.1)' : 'transparent')};
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
	position: ${(props) => (isSideNav(props.$layout) ? 'relative' : 'absolute')};
	top: ${(props) => (isSideNav(props.$layout) ? 'auto' : '40px')};
	left: ${(props) => (isSideNav(props.$layout) ? 'auto' : '0')};
	width: ${(props) => (isSideNav(props.$layout) ? '100%' : 'fit-content')};
	min-width: 150px;
	background: ${(props) =>
		isSideNav(props.$layout) ? 'rgba(var(--color-navigation-text), 0.05)' : 'var(--color-navigation-background)'};
	transform: ${(props) => (isSideNav(props.$layout) ? 'none' : 'scaleY(0)')};
	transform-origin: top;
	transition: transform 0.5s ease;
	animation: ${(props) => (isSideNav(props.$layout) ? 'none' : '0.1s ease forwards expandOnLoad')};
	border-top: ${(props) =>
		props.$layout?.border?.bottom ? `1px solid rgba(var(--color-navigation-background),1)` : `unset`};
	border-bottom: ${(props) =>
		props.$layout?.border?.bottom ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	border-left: ${(props) =>
		props.$layout?.border?.bottom ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	border-right: ${(props) =>
		props.$layout?.border?.bottom ? `1px solid rgba(var(--color-navigation-border),1)` : `unset`};
	box-sizing: border-box;
	padding-left: ${(props) => (isSideNav(props.$layout) ? '20px' : '0')};

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

export const ResizeHandle = styled.div<{ $isDragging?: boolean; $isSideNav?: boolean; $position?: string }>`
	position: absolute;
	${(props) => {
		if (props.$isSideNav) {
			return props.$position === 'right'
				? `
					top: 0;
					bottom: 0;
					left: 0;
					width: 20px;
					height: 100%;
					transform: translateX(-50%);
				`
				: `
					top: 0;
					bottom: 0;
					right: 0;
					width: 20px;
					height: 100%;
					transform: translateX(50%);
				`;
		}
		return `
			left: 0;
			right: 0;
			bottom: 0;
			height: 20px;
			width: 100%;
			transform: translateY(50%);
		`;
	}}
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: ${(props) => (props.$isSideNav ? 'ew-resize' : 'ns-resize')};
	z-index: 10;

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
			${props.$isSideNav ? 'width: 6px;' : 'height: 6px;'}
		}
	`}
`;

export const HandleBar = styled.div<{ $isSideNav?: boolean }>`
	width: ${(props) => (props.$isSideNav ? '4px' : '100%')};
	height: ${(props) => (props.$isSideNav ? '100%' : '4px')};
	background: rgba(var(--color-primary), 0.6);
	opacity: 0.8;
	transition: all 0.15s ease;
`;

export const HandleLabel = styled.span<{ $isSideNav?: boolean }>`
	position: absolute;
	top: 50%;
	right: ${(props) => (props.$isSideNav ? '20px' : 'auto')};
	left: ${(props) => (props.$isSideNav ? 'auto' : '50%')};
	transform: ${(props) => (props.$isSideNav ? 'translateY(-50%)' : 'translate(-50%, -50%)')};
	background: rgba(var(--color-primary), 1);
	color: white;
	padding: 4px 12px;
	border-radius: 4px;
	font-size: 11px;
	font-weight: 600;
	white-space: nowrap;
	pointer-events: none;
`;

export const NavLogo = styled.div<{ $logoSize?: number; $positionX?: string }>`
	display: flex;
	align-items: center;
	justify-content: ${(props) => {
		const posX = props.$positionX || 'center';
		return posX === 'center' ? 'center' : posX === 'left' ? 'flex-start' : 'flex-end';
	}};
	padding: 15px 20px;

	a,
	a.active {
		display: flex;
		align-items: center;
		justify-content: center;

		div {
			display: flex;
			align-items: center;
			justify-content: center;

			svg {
				color: rgba(var(--color-text), 1) !important;
			}
		}
	}

	img,
	svg {
		max-width: 100%;
		height: ${(props) => (props.$logoSize ? `${props.$logoSize}px` : '50px')};
		width: auto;
		object-fit: contain;
	}
`;
