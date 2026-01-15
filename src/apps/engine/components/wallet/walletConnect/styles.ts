import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Wrapper = styled.div`
	flex: 1;
	height: 100%;
	display: flex;
	position: relative;
`;

export const UserButton = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	font-family: Arial, Helvetica, sans-serif;

	button {
		border-radius: 14px;
		height: 26px;
		margin: 0 6px !important;
		padding: 4px;
		color: rgba(var(--color-text), 1);
		background: rgba(var(--color-background), 1);
		filter: invert(1);

		&:focus,
		&:hover {
			outline: unset;
		}

		@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
			background: none;
			filter: none;
			margin: 0 !important;
			padding: 0;
		}
	}

	&:hover {
		cursor: pointer !important;
	}
`;

export const LAction = styled.button`
	display: inline-flex;
	justify-content: center;
	align-items: center;
	height: 35px;
	position: relative;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		height: auto;
	}

	> div:first-child {
		height: 16px;
		width: 16px;
		margin-right: 4px;

		img {
			height: 100%;
			width: 100%;
			color: rgba(var(--color-text), 1);
			border-radius: 50%;
			filter: invert(1);
		}

		svg {
			height: 16px;
			width: 16px;
			fill: rgba(var(--color-text), 1);
			color: rgba(var(--color-text), 1);
			border-radius: 50%;
			outline: 2px solid rgba(var(--color-text), 1);
		}

		@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
			display: none;
		}
	}
`;

export const MobileAvatar = styled.div`
	display: none;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		display: block;
	}
`;

export const CubeContainer = styled.div<{ $rotated: boolean }>`
	width: 300px;
	position: relative;
	transform-style: preserve-3d;
	transition: transform 0.6s ease;
	transform: ${(props) => (props.$rotated ? 'translateX(-300px) rotateY(-90deg)' : 'translateX(0) rotateY(0deg)')};
	transform-origin: right center;
`;

export const CubeFaceFront = styled.div<{ $rotated: boolean }>`
	width: 100%;
	backface-visibility: hidden;
`;

export const CubeFaceRight = styled.div<{ $rotated: boolean }>`
	position: absolute;
	top: 0;
	left: 100%;
	width: 100%;
	backface-visibility: hidden;
	transform-origin: left center;
	transform: rotateY(90deg);
`;

export const UserMenu = styled.div`
	display: flex;
	flex-direction: column;
	width: 300px;
	height: 100%;
`;

export const MobileMenuClose = styled.button`
	display: none;
	position: absolute;
	top: var(--spacing-xs);
	right: var(--spacing-xs);
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	color: rgba(var(--color-text), 1);
	font-size: var(--font-size-xlarge);
	line-height: 1;
	z-index: 10;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		display: block;
	}
`;

export const LayoutMenu = styled.div`
	display: flex;
	flex-direction: column;
	width: 300px;
	height: 100%;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
`;

export const Header = styled.div`
	position: relative;
	width: 100%;
	margin-bottom: 20px;
`;

export const Banner = styled.div`
	position: relative;
	width: 100%;
	height: 100px;
	overflow: hidden;
	border-radius: var(--border-radius) var(--border-radius) 0 0;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;

		&.missingBanner {
			background: rgba(var(--color-text), 0.2);
		}
	}

	&::after {
		position: absolute;
		left: 0;
		bottom: 0;
		content: '';
		height: 100%;
		opacity: 1;
		width: 100%;
		background: linear-gradient(0deg, #0d0d0d, transparent 65%);
	}
`;

export const AvatarWrapper = styled.div`
	position: absolute;
	bottom: -12px;
	left: 10px;

	> div {
		box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.6), 0 4px 10px 0 rgba(0, 0, 0, 0.6);
	}
`;

export const DisplayName = styled.div`
	position: absolute;
	bottom: 15px;
	left: 70px;
	color: white;
	font-size: var(--font-size-default);
	font-weight: 900;
`;

export const DAddress = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	bottom: 4px;
	left: 70px;
	height: 12px;
	font-size: 10px;

	svg {
		height: 10px;
		margin-left: 6px;
		margin-top: 3px;
	}

	&:hover {
		cursor: pointer;
		opacity: 0.6;
	}
`;

export const NavigationWrapper = styled.div`
	width: 100%;
	padding: 4px 6px;
	box-sizing: border-box;
	color: rgba(var(--color-text), 1);
`;

export const NavigationCategory = styled.div`
	font-weight: 700;
	padding: 4px 6px;
	font-size: var(--font-size-small);
	list-style: none;
`;

export const DSpacer = styled.div`
	border-bottom: 1px solid rgba(var(--color-text), 0.1);
	margin: 10px 6px;
	list-style: none;
`;

export const NavigationEntry = styled.div<{ $disabled?: boolean }>`
	display: flex;
	text-align: center;
	height: 34px;
	align-items: center;
	padding: 0 10px;
	font-size: var(--font-size-default);
	font-weight: 600;
	box-sizing: border-box;
	border-radius: var(--border-radius);
	opacity: ${(props) => (props.$disabled ? '.4' : 1)};
	pointer-events: ${(props) => (props.$disabled ? 'none' : 'unset')};
	user-select: 'none';

	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	svg {
		height: var(--font-size-default);
		width: var(--font-size-default);
		color: rgba(var(--color-text), 1);
		margin: 0 8px 0 0;
	}

	&:hover {
		cursor: pointer;
		background: rgba(var(--color-text), 0.05);
		color: rgba(var(--color-primary), 1);

		svg {
			color: rgba(var(--color-primary), 1);
		}
	}
`;

export const DFooterWrapper = styled(NavigationWrapper)`
	margin-top: auto;
	border-bottom: none;
	padding-bottom: 10px;
`;

export const PManageWrapper = styled.div`
	max-width: 550px;
`;

export const WanderConnectWrapper = styled.div`
	display: none;
`;

export const Hint = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: auto;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: #e53935;
	animation: hintPulse 2s infinite;

	> div {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		width: 10px;
		height: 10px;
		margin: 0 !important;
		color: var(--color-card-background) !important;
	}

	@keyframes hintPulse {
		0% {
			box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7);
		}
		70% {
			box-shadow: 0 0 0 6px transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}
`;

export const LayoutHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 44px;
	padding: 0 12px;
	font-size: var(--font-size-default);
	font-weight: 700;
	color: rgba(var(--color-text), 1);
`;

export const BackButton = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	border-radius: var(--border-radius);

	svg {
		height: var(--font-size-default);
		width: var(--font-size-default);
		color: rgba(var(--color-text), 1);
		transform: rotate(-90deg);
	}

	&:hover {
		cursor: pointer;
		background: rgba(var(--color-text), 0.05);
		svg {
			color: rgba(var(--color-primary), 1);
		}
	}
`;

export const SliderRow = styled.div`
	display: flex;
	align-items: center;
	height: 34px;
	padding: 0 10px;
	font-size: var(--font-size-default);
	font-weight: 600;
	color: rgba(var(--color-text), 1);
	box-sizing: border-box;
	border-radius: var(--border-radius);

	&:hover {
		background: rgba(var(--color-text), 0.05);
	}

	label {
		width: 80px;
		flex-shrink: 0;
	}

	input[type='range'] {
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: rgba(var(--color-text), 0.1);
		appearance: none;
		cursor: pointer;
		margin: 0 10px;

		&::-webkit-slider-thumb {
			appearance: none;
			width: 14px;
			height: 14px;
			border-radius: 50%;
			background: rgba(var(--color-primary), 1);
			cursor: pointer;
		}

		&::-moz-range-thumb {
			width: 14px;
			height: 14px;
			border-radius: 50%;
			background: rgba(var(--color-primary), 1);
			cursor: pointer;
			border: none;
		}

		&:focus {
			outline: none;
		}
	}

	span {
		width: 50px;
		text-align: right;
		font-size: var(--font-size-small);
		color: rgba(var(--color-text), 0.5);
	}
`;

export const EntryRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 34px;
	padding: 0 10px;
	font-size: var(--font-size-default);
	font-weight: 600;
	color: rgba(var(--color-text), 1);
	box-sizing: border-box;
	border-radius: var(--border-radius);

	label {
		flex: 1;
	}

	&:hover {
		cursor: pointer;
		background: rgba(var(--color-text), 0.05);
	}

	select {
		width: 90px;
		padding: 4px 8px;
		font-size: var(--font-size-default);
		border: 1px solid rgba(var(--color-border), 0.1);
		border-radius: var(--border-radius);
		background: var(--color-card-background);
		color: rgba(var(--color-text), 1);

		option {
			background: var(--color-card-background);
			color: rgba(var(--color-text), 1);
		}

		&:focus {
			outline: none;
			border-color: rgba(var(--color-primary), 1);
		}
	}
`;

export const ToggleRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 34px;
	padding: 0 10px;
	font-size: var(--font-size-default);
	font-weight: 600;
	color: rgba(var(--color-text), 1);
	box-sizing: border-box;
	border-radius: var(--border-radius);

	&:hover {
		background: rgba(var(--color-text), 0.05);
	}
`;

export const Toggle = styled.div<{ $active: boolean }>`
	width: 36px;
	height: 20px;
	border-radius: 10px;
	background: ${(props) => (props.$active ? 'rgba(var(--color-primary), 1)' : 'rgba(var(--color-text), 0.2)')};
	cursor: pointer;
	position: relative;
	transition: background 0.2s ease;

	&::after {
		content: '';
		position: absolute;
		top: 2px;
		left: ${(props) => (props.$active ? '18px' : '2px')};
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: white;
		transition: left 0.2s ease;
	}
`;

export const CubeWrapper = styled.div`
	width: 300px;
	height: 100%;
	position: relative;
	perspective: 1000px;
`;

export const LayoutFooter = styled.div`
	display: flex;
	gap: 10px;
	padding: 10px;
	margin-top: auto;
`;

export const LayoutButton = styled.button<{ $primary?: boolean }>`
	flex: 1;
	height: 36px;
	border: none;
	border-radius: var(--border-radius);
	font-size: var(--font-size-default);
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.2s ease;
	background: ${(props) => (props.$primary ? 'rgba(var(--color-primary), 1)' : 'rgba(var(--color-text), 0.1)')};
	color: ${(props) => (props.$primary ? 'white' : 'rgba(var(--color-text), 1)')};

	&:hover {
		opacity: 0.8;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const NotificationBubble = styled.div`
	position: absolute;
	top: -6px;
	right: -6px;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: #e53935;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 9px;
	font-weight: bold;
	filter: invert(1);
	animation: pulse 2s infinite;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		top: -4px;
		right: auto;
		left: 16px;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7);
		}
		70% {
			box-shadow: 0 0 0 6px transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}
`;

export const LabelWrapper = styled.div<{ $loading?: boolean }>`
	display: grid;
	align-items: center;
	margin-left: 2px;
	max-width: ${(props) => (props.$loading ? '50px' : '200px')};
	overflow: hidden;
	transition: max-width 0.6s ease;

	> * {
		grid-area: 1 / 1;
	}

	> span {
		color: rgba(var(--color-text), 1);
		font-weight: 800;
		white-space: nowrap;
		opacity: ${(props) => (props.$loading ? 0 : 1)};
		transition: opacity 0.2s ease;

		@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
			display: none;
		}
	}
`;

export const LoadingDots = styled.div<{ $visible?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1px;
	padding-top: 4px;
	padding-left: 8px;
	padding-right: 8px;
	opacity: ${(props) => (props.$visible ? 1 : 0)};
	transition: opacity 0.2s ease;
	filter: invert(1);

	span {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: rgba(var(--color-text), 1);
		animation: loadingWave 1s infinite ease-in-out;

		&:nth-child(1) {
			animation-delay: 0s;
		}
		&:nth-child(2) {
			animation-delay: 0.15s;
		}
		&:nth-child(3) {
			animation-delay: 0.3s;
		}
	}

	@keyframes loadingWave {
		0%,
		100% {
			transform: translateY(0) scale(0.6);
			opacity: 0.4;
			background: rgba(var(--color-background), 1);
		}
		50% {
			transform: translateY(-4px) scale(1);
			opacity: 1;
			background: rgba(var(--color-primary), 1);
		}
	}
`;
