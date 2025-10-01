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
	}

	&:hover {
		cursor: pointer !important;
	}
`;

export const LAction = styled.button`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 35px;

	div {
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
	}

	svg {
		margin-right: 4px;
		height: 16px;
		width: 16px;
		fill: rgba(var(--color-text), 1);
		color: rgba(var(--color-text), 1);
		border-radius: 50%;
		outline: 2px solid rgba(var(--color-text), 1);
	}

	span {
		color: rgba(var(--color-text), 1);
		font-weight: 800;
		display: block;
		margin: 0 2px;
	}
`;

export const UserMenu = styled.div`
	display: flex;
	flex-direction: column;
	width: 300px;
	height: 100%;
	background: var(--color-card-background);
	border: 1px solid rgba(var(--color-border), 0.1);
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

export const Avatar = styled.div`
	position: absolute;
	bottom: -12px;
	left: 10px;

	img {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.6), 0 4px 10px 0 rgba(0, 0, 0, 0.6);

		&.missingAvatar {
			background: rgba(var(--color-text), 0.4);
		}
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
	padding: 4px 0px;
	box-sizing: border-box;
	color: rgba(var(--color-text), 1);
`;

export const NavigationCategory = styled.div`
	font-weight: 700;
	padding: 4px 12px;
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
`;

export const PManageWrapper = styled.div`
	max-width: 550px;
`;

export const WanderConnectWrapper = styled.div`
	display: none;
`;

export const Hint = styled.div`
	display: flex;
	justify-content: center;
	margin-left: auto;

	svg {
		color: red !important;
	}
`;
