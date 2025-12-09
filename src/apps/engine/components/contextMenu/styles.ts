import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
	from {
		opacity: 0;
		transform: scaleY(0);
		transform-origin: top;
	}
	to {
		opacity: 1;
		transform: scaleY(1);
		transform-origin: top;
	}
`;

export const Menu = styled.div`
	position: absolute;
	right: 0;
	top: var(--spacing-s);
	width: fit-content;
`;

export const IconWrapper = styled.div`
	display: flex;
	margin-left: auto;
	justify-content: center;
	align-items: center;
	width: 28px;
	height: 28px;
	border-radius: 50%;

	> * {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	svg {
		width: 18px;
	}

	&:hover {
		cursor: pointer;
		background: rgba(100, 100, 100, 0.6);
	}
`;

export const MenuEntries = styled.div`
	position: absolute;
	top: 100%;
	right: 0;
	background: var(--color-navigation-background);
	backdrop-filter: blur(5px);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	z-index: 99;
	padding: 4px;
	min-width: 120px;
	white-space: nowrap;
	animation: ${slideDown} 0.2s ease-out forwards;
	transform-origin: top center;

	&.up {
		top: auto;
		bottom: 100%;
		transform-origin: bottom center;
	}
`;

export const MenuEntry = styled.div`
	display: flex;
	padding: 4px 10px 4px 6px;

	div {
		display: flex;
		justify-content: start;
		align-items: center;
	}

	svg {
		width: 16px;
		height: 16px;
		margin-right: 4px;
	}
	&:hover {
		cursor: pointer;
		background: rgba(var(--color-text), 0.1);
	}
`;

export const MenuSpacer = styled.div`
	margin-bottom: 3px;
	padding-bottom: 3px;
	border-bottom: 1px solid rgba(var(--color-text), 0.1);
`;

export const MenuEntryWithSubmenu = styled.div`
	position: relative;
`;

export const SubmenuArrow = styled.span`
	display: flex;
	align-items: center;
	margin-left: auto;
	padding-left: 10px;

	svg {
		width: 10px;
		height: 10px;
		transform: rotate(90deg);
	}
`;

export const Submenu = styled.div`
	position: absolute;
	left: 100%;
	top: 0;
	background: var(--color-navigation-background);
	backdrop-filter: blur(5px);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
	padding: 4px;
	min-width: 120px;
	animation: ${slideDown} 0.2s ease-out forwards;
	z-index: 100;

	&.left {
		left: auto;
		right: 100%;
	}
`;
