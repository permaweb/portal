import styled from 'styled-components';

export const Menu = styled.div`
	position: absolute;
	right: 0;
	top: 3px;
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
	display: flex;
	justify-content: center;
	align-items: center;

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
		padding-left: 4px;
	}

	&:hover {
		cursor: pointer;
		background: rgba(100, 100, 100, 0.6);
	}
`;

export const MenuEntries = styled.div`
	position: relative;
	background: var(--color-card-background);
	border: 1px solid var(--color-card-border);
	backdrop-filter: blur(5px);
	z-index: 99;
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
	border-bottom: 1px solid var(--color-card-border);
`;
