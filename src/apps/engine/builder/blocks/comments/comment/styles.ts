import styled from 'styled-components';

export const Wrapper = styled.div<{ status: string }>`
	display: flex;
	flex-direction: column;
	gap: 4px;
	opacity: ${(props) => (props?.status === 'active' ? 1 : 0.4)};
	box-shadow: ${(props) =>
		props?.status === 'active' ? '0 4px 10px rgba(0, 0, 0, 0.4)' : '0 1px 4px rgba(0, 0, 0, 0.4)'};

	&:hover {
		opacity: ${(props) => (props?.status === 'active' ? 1 : 1)};
	}
`;

export const Comment = styled.div<{ $level: number }>`
	display: flex;
	gap: 10px;
	margin-left: ${(props) => `calc(${props.$level} * 30px)`};
	background: var(--color-card-background);
	padding: 10px;
	margin-top: ${(props) => (props.$level > 0 ? `-16px` : 0)};
	border-radius: var(--border-radius);
`;

export const Avatar = styled.div`
	flex-shrink: 0;
	width: 46px;
	height: 46px;
	background: rgba(var(--color-text), 0.5);
	border-radius: 50%;
	img {
		width: 46px;
		height: 46px;
		border-radius: 50%;
	}
`;

export const Content = styled.div`
	position: relative;
	width: 100%;
`;

export const Meta = styled.div`
	display: flex;
	align-items: flex-end;
	font-size: 14px;
	gap: 10px;
`;

export const Username = styled.span`
	color: rgba(var(--color-primary), 1);
	font-weight: 600;
`;

export const Date = styled.span`
	opacity: 0.6;
	font-size: 12px;
	font-weight: 600;
`;

export const Text = styled.div`
	width: 100%;
	margin-top: 4px;
`;

export const Menu = styled.div`
	position: absolute;
	right: 0;
	top: 0;
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

	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	svg {
		width: 18px;
		height: 18px;
	}

	&:hover {
		cursor: pointer;
		background: rgba(100, 100, 100, 0.6);
	}
`;

export const MenuCategory = styled.div``;

export const MenuEntries = styled.div`
	position: relative;
	background: var(--color-card-background);
	border: 1px solid var(--color-card-border);
	padding: 2px 2px;
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
		background: rgba(50, 50, 50, 1);
	}
`;

export const Actions = styled.div`
	display: flex;
	font-size: 14px;
	gap: 10px;
	margin-top: 10px;
`;

export const Action = styled.div`
	display: flex;
	gap: 4px;
	opacity: 0.8;
	div,
	svg {
		width: 20px;
		height: 20px;
		color: rgba(var(--color-text), 1);
	}

	&:hover {
		cursor: pointer;
		opacity: 1;
	}
`;
